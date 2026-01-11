import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_AI_GATEWAY = 'https://ai.gateway.lovable.dev/v1/chat/completions';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { generationId, config, referenceImage, usePro = false, userId } = await req.json();
    
    // Parse reference images - could be JSON string of array or single base64 string
    let referenceImages: { type: string; data: string }[] | null = null;
    
    if (referenceImage) {
      try {
        // Try parsing as JSON array first
        referenceImages = JSON.parse(referenceImage);
      } catch {
        // If not JSON, treat as single base64 image
        referenceImages = [{ type: 'outfit', data: referenceImage }];
      }
    }
    
    console.log('Generation request received:', { 
      generationId, 
      config, 
      imageCount: referenceImages?.length || 0,
      usePro
    });

    // Build the prompt for the AI model
    const prompt = buildPrompt(config, referenceImages, usePro);
    console.log('Generated prompt:', prompt.substring(0, 500) + '...');

    // Get the Gemini API key
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Select model based on quality mode
    // Standard uses gemini-2.5-flash-image-preview
    // Pro uses gemini-3-pro-image-preview
    const model = usePro 
      ? 'google/gemini-3-pro-image-preview' 
      : 'google/gemini-2.5-flash-image-preview';
    
    console.log(`Using Gemini model: ${model}`);

    // Build message content - text prompt + reference images
    const messageContent: any[] = [
      {
        type: 'text',
        text: prompt
      }
    ];

    // Add reference images to the message if provided
    if (referenceImages && referenceImages.length > 0) {
      referenceImages.forEach((img, index) => {
        // Check if the data is already a data URL or raw base64
        const imageUrl = img.data.startsWith('data:') 
          ? img.data 
          : `data:image/jpeg;base64,${img.data}`;
        
        messageContent.push({
          type: 'image_url',
          image_url: {
            url: imageUrl
          }
        });
        console.log(`Added reference image ${index + 1} (type: ${img.type})`);
      });
    }

    // Call the Lovable AI Gateway with Gemini model
    const response = await fetch(LOVABLE_AI_GATEWAY, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'user',
            content: messageContent
          }
        ],
        modalities: ['image', 'text']
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 401 || response.status === 403) {
        return new Response(
          JSON.stringify({ error: 'Invalid API key. Please check your Gemini API key.' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'AI generation failed', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('Gemini API response received');

    // Extract the generated image from the response
    const generatedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!generatedImageUrl) {
      console.error('No image in response:', JSON.stringify(data).substring(0, 500));
      return new Response(
        JSON.stringify({ error: 'Image generation failed - no image returned' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Image generated successfully with', usePro ? 'Pro' : 'Standard', 'quality');

    // Update the database with the generated image
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error: updateError } = await supabase
      .from('model_generations')
      .update({ 
        image_url: generatedImageUrl,
        status: 'completed'
      })
      .eq('id', generationId);

    if (updateError) {
      console.error('Database update error:', updateError);
    }

    // If this was a Pro generation and user is on trial plan, decrement their pro_generations_remaining
    if (usePro && userId) {
      // First, get the user's subscription to check if they're on trial
      const { data: subscription, error: subError } = await supabase
        .from('user_subscriptions')
        .select('plan, pro_generations_remaining')
        .eq('user_id', userId)
        .single();

      if (!subError && subscription?.plan === 'trial' && subscription.pro_generations_remaining > 0) {
        const { error: decrementError } = await supabase
          .from('user_subscriptions')
          .update({ 
            pro_generations_remaining: subscription.pro_generations_remaining - 1 
          })
          .eq('user_id', userId);

        if (decrementError) {
          console.error('Error decrementing pro generations:', decrementError);
        } else {
          console.log(`Decremented pro_generations_remaining for trial user ${userId}. Remaining: ${subscription.pro_generations_remaining - 1}`);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        generationId,
        imageUrl: generatedImageUrl,
        quality: usePro ? 'pro' : 'standard',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-model:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

interface ReferenceImage {
  type: string;
  data: string;
}

function buildPrompt(config: any, referenceImages: ReferenceImage[] | null, usePro: boolean = false): string {
  // =============================================
  // STATIC BASE PROMPT (NEVER CHANGES)
  // =============================================
  const qualityLevel = usePro 
    ? 'ULTRA-PREMIUM 16K QUALITY, magazine cover ready, award-winning fashion photography' 
    : 'Ultra-high resolution, 8K quality, professional fashion photography';

  const staticBasePrompt = `
Generate a hyper-realistic, high-resolution fashion photography image featuring a model.

CRITICAL CLOTHING PRESERVATION RULES (ABSOLUTE REQUIREMENTS):
- The clothing, outfit, and all garments shown in the reference images MUST be reproduced EXACTLY as they appear.
- Do NOT alter, reinterpret, stylize, or modify the clothing in any way.
- Preserve ALL original details: fabric texture, material type, weave pattern, stitching, seams, buttons, zippers, embroidery, prints, patterns, logos, and embellishments.
- Maintain EXACT colors, color gradients, shading, and tonal values of the clothing.
- Keep the EXACT garment cut, silhouette, fit, drape, and shape.
- Preserve lighting reflections, shadows, and fabric behavior exactly as shown.
- If jewelry or accessories are provided in reference images, include them exactly as shown without modification.
- The clothing must look identical to the reference - as if it's the same physical garment photographed on the model.

PHOTOREALISM REQUIREMENTS:
- ${qualityLevel}.
- Studio-grade lighting with natural skin tones and fabric rendering.
- Sharp focus, professional depth of field.
- Magazine-quality editorial fashion photography aesthetic.
- Natural, realistic skin texture and details.
${usePro ? '- Premium retouching quality with flawless skin and lighting.\n- Ultra-detailed fabric rendering with visible thread textures.\n- Professional color grading with rich, vibrant tones.' : ''}
`.trim();

  // =============================================
  // DYNAMIC FILTER SECTION (USER SELECTIONS ONLY)
  // =============================================
  const dynamicFilters: string[] = [];
  
  // Model physical attributes
  if (config.gender) {
    dynamicFilters.push(`Model gender: ${config.gender}`);
  }
  
  if (config.ethnicity) {
    dynamicFilters.push(`Model ethnicity: ${config.ethnicity}`);
  }
  
  if (config.skinTone) {
    dynamicFilters.push(`Skin tone: ${config.skinTone}`);
  }
  
  // Hair attributes
  if (config.hairColor) {
    dynamicFilters.push(`Hair color: ${config.hairColor}`);
  }
  
  if (config.hairType) {
    dynamicFilters.push(`Hair type/style: ${config.hairType}`);
  }
  
  if (config.hairStyle) {
    dynamicFilters.push(`Hair styling: ${config.hairStyle}`);
  }
  
  // Eye color
  if (config.eyeColor) {
    dynamicFilters.push(`Eye color: ${config.eyeColor}`);
  }
  
  // Face attributes
  if (config.faceType) {
    dynamicFilters.push(`Face shape: ${config.faceType}`);
  }
  
  if (config.facialExpression) {
    dynamicFilters.push(`Facial expression: ${config.facialExpression}`);
  }
  
  // Beard (for male models)
  if (config.beardType) {
    dynamicFilters.push(`Facial hair: ${config.beardType}`);
  }
  
  // Body type
  if (config.bodyType) {
    dynamicFilters.push(`Body type: ${config.bodyType}`);
  }
  
  // Pose and framing
  if (config.pose) {
    dynamicFilters.push(`Model pose: ${config.pose}`);
  }
  
  // Background
  if (config.background) {
    dynamicFilters.push(`Background setting: ${config.background}`);
  }
  
  // Modest/coverage option
  if (config.modestOption) {
    dynamicFilters.push(`Coverage style: ${config.modestOption}`);
  }

  // Build dynamic section
  const dynamicSection = dynamicFilters.length > 0 
    ? `\n\nMODEL ATTRIBUTES (Apply these characteristics to the model):\n${dynamicFilters.map(f => `- ${f}`).join('\n')}`
    : '';

  // Reference image handling
  let referenceSection = '';
  if (referenceImages && referenceImages.length > 0) {
    const imageTypes = referenceImages.map(img => img.type);
    const hasOutfit = imageTypes.some(t => t === 'outfit');
    const hasJewelry = imageTypes.some(t => t === 'jewelry');
    const hasAccessory = imageTypes.some(t => t === 'accessory');
    
    const referenceItems: string[] = [];
    if (hasOutfit) referenceItems.push('clothing/outfit');
    if (hasJewelry) referenceItems.push('jewelry');
    if (hasAccessory) referenceItems.push('accessories');
    
    referenceSection = `

REFERENCE IMAGES PROVIDED:
The attached reference images contain ${referenceItems.join(', ')} that MUST be reproduced exactly.
- Copy every detail from the reference images with 100% accuracy.
- Do not add, remove, or modify any aspect of the referenced items.
- The model should be wearing/displaying these exact items as shown.`;
  }

  // Combine static + dynamic + reference sections
  const fullPrompt = `${staticBasePrompt}${dynamicSection}${referenceSection}

FINAL INSTRUCTION: Generate the image with the model wearing the EXACT clothing from the reference images (if provided), applying only the specified model attributes above. Never modify the clothing or outfit in any way.`;

  return fullPrompt;
}
