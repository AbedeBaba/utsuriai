import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { generationId, config, referenceImage, usePro = false } = await req.json();
    
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

    // Choose API key based on Pro mode
    let apiKey: string | undefined;
    let apiEndpoint: string;
    let model: string;

    if (usePro) {
      // Use Nano Banana Pro API
      apiKey = Deno.env.get('NANO_BANANA_PRO_API_KEY');
      apiEndpoint = "https://ai.gateway.lovable.dev/v1/chat/completions";
      model = "google/gemini-3-pro-image-preview"; // Pro model
      
      if (!apiKey) {
        console.error('NANO_BANANA_PRO_API_KEY is not configured');
        return new Response(
          JSON.stringify({ error: 'Pro API key not configured' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.log('Using Nano Banana Pro API');
    } else {
      // Use standard Lovable API
      apiKey = Deno.env.get('LOVABLE_API_KEY');
      apiEndpoint = "https://ai.gateway.lovable.dev/v1/chat/completions";
      model = "google/gemini-2.5-flash-image-preview"; // Standard model
      
      if (!apiKey) {
        console.error('LOVABLE_API_KEY is not configured');
        return new Response(
          JSON.stringify({ error: 'AI API key not configured' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.log('Using standard Lovable API');
    }

    // Build the prompt for the AI model
    const prompt = buildPrompt(config, referenceImages, usePro);
    console.log('Generated prompt:', prompt);

    // Prepare content array with text and all images
    const contentParts: any[] = [{ type: "text", text: prompt }];
    
    if (referenceImages && referenceImages.length > 0) {
      referenceImages.forEach((img, index) => {
        contentParts.push({
          type: "image_url",
          image_url: { url: img.data }
        });
        console.log(`Added reference image ${index + 1} (type: ${img.type})`);
      });
    }

    // Prepare messages for AI request
    const messages: any[] = [
      {
        role: "user",
        content: contentParts.length > 1 ? contentParts : prompt
      }
    ];

    console.log(`Calling ${usePro ? 'Nano Banana Pro' : 'Nano Banana'} API with model: ${model}...`);

    // Call AI Gateway
    const aiResponse = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        modalities: ["image", "text"],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'AI generation failed', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    console.log('AI response received');

    // Extract the generated image from the response
    const generatedImageUrl = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!generatedImageUrl) {
      console.error('No image in AI response:', JSON.stringify(aiData));
      return new Response(
        JSON.stringify({ error: 'AI did not generate an image', response: aiData }),
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
