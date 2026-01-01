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
    const { generationId, config, referenceImage } = await req.json();
    
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
      imageCount: referenceImages?.length || 0 
    });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build the prompt for the AI model
    const prompt = buildPrompt(config, referenceImages);
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

    console.log('Calling Lovable AI Gateway with Nano Banana model...');

    // Call Lovable AI Gateway with Nano Banana (image generation model)
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
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

    console.log('Image generated successfully');

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

function buildPrompt(config: any, referenceImages: ReferenceImage[] | null): string {
  const parts: string[] = [];
  
  // Base description
  parts.push('Generate a high-quality, photorealistic fashion model image.');
  
  // Physical attributes
  parts.push(`The model is a ${config.gender?.toLowerCase() || 'person'}`);
  if (config.ethnicity) parts.push(`with ${config.ethnicity} ethnicity`);
  if (config.skinTone) parts.push(`and ${config.skinTone.toLowerCase()} skin tone.`);
  
  // Hair
  if (config.hairColor || config.hairType) {
    parts.push(`Hair: ${config.hairColor || ''} ${config.hairType || ''}.`.trim());
  }
  
  // Eyes
  if (config.eyeColor) {
    parts.push(`Eye color: ${config.eyeColor}.`);
  }
  
  // Body type
  if (config.bodyType) {
    parts.push(`Body type: ${config.bodyType}.`);
  }
  
  // Beard (for males)
  if (config.beardType) {
    parts.push(`Facial hair: ${config.beardType}.`);
  }
  
  // Reference images instruction
  if (referenceImages && referenceImages.length > 0) {
    const outfits = referenceImages.filter(img => img.type === 'outfit');
    const jewelry = referenceImages.filter(img => img.type === 'jewelry');
    const accessories = referenceImages.filter(img => img.type === 'accessory');
    
    if (outfits.length > 0) {
      parts.push(`The model should be wearing the outfit/clothing shown in the reference images.`);
    }
    if (jewelry.length > 0) {
      parts.push(`The model should be wearing the jewelry shown in the reference images (necklaces, earrings, rings, bracelets, etc.).`);
    }
    if (accessories.length > 0) {
      parts.push(`Include the accessories shown in the reference images (bags, hats, scarves, watches, etc.).`);
    }
    parts.push('Combine all the referenced items into a cohesive fashion look.');
  } else {
    parts.push('The model should be wearing stylish, professional fashion attire.');
  }
  
  // Quality instructions
  parts.push('Studio lighting, high resolution, professional fashion photography, full body shot, clean background, magazine quality.');
  
  return parts.join(' ');
}
