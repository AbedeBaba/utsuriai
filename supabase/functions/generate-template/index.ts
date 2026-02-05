import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Lovable AI Gateway for Gemini (same as generate-model)
const LOVABLE_AI_GATEWAY = 'https://ai.gateway.lovable.dev/v1/chat/completions';

// Credit costs per template (4 poses)
const STANDARD_CREDIT_COST = 4; // 1 credit per pose × 4 poses
const PRO_CREDIT_COST = 16; // 4 credits per pose × 4 poses

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Missing authorization header');
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    if (!lovableApiKey) {
      console.error('Missing LOVABLE_API_KEY');
      return new Response(
        JSON.stringify({ error: 'Server configuration error - missing API key' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('Authenticated user:', user.id);

    const { 
      templateId, 
      poseIndex, 
      poseImageBase64,
      productImageBase64, 
      usePro = false
    } = await req.json();
    
    console.log(`Template generation request - templateId: ${templateId}, poseIndex: ${poseIndex}, usePro: ${usePro}`);
    
    if (!templateId || typeof poseIndex !== 'number' || !poseImageBase64 || !productImageBase64) {
      console.error('Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Missing required fields: templateId, poseIndex, poseImageBase64, productImageBase64' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check subscription and credits (only for first pose to avoid multiple deductions)
    if (poseIndex === 0) {
      const creditCost = usePro ? PRO_CREDIT_COST : STANDARD_CREDIT_COST;
      
      const { data: subscription, error: subError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (subError || !subscription) {
        console.error('Subscription error:', subError);
        return new Response(
          JSON.stringify({ error: 'No subscription found' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const hasCredits = subscription.credits_remaining >= creditCost;
      
      if (!hasCredits) {
        console.error(`Insufficient credits: ${subscription.credits_remaining} < ${creditCost}`);
        return new Response(
          JSON.stringify({ 
            error: 'Insufficient credits', 
            required: creditCost, 
            available: subscription.credits_remaining 
          }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Deduct credits upfront for the entire template
      const { error: updateError } = await supabase
        .from('user_subscriptions')
        .update({
          credits_remaining: subscription.credits_remaining - creditCost,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Failed to update credits:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to process credits' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.log(`Deducted ${creditCost} credits for template generation`);
    }

    console.log(`Generating pose ${poseIndex + 1} for template ${templateId} using Gemini...`);

    // Generate using Gemini via Lovable AI Gateway
    const storedImageUrl = await generateWithGemini(
      lovableApiKey,
      poseImageBase64,
      productImageBase64,
      supabase,
      templateId,
      usePro
    );
    
    console.log(`Pose ${poseIndex + 1} generated and stored successfully`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        imageUrl: storedImageUrl,
        poseIndex
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Template generation error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Generate image using Gemini via Lovable AI Gateway
async function generateWithGemini(
  apiKey: string,
  poseImageBase64: string,
  productImageBase64: string,
  supabase: any,
  templateId: string,
  usePro: boolean
): Promise<string> {
  console.log('Starting Gemini template generation...');
  
  // Build the content array with both images and the prompt
  const contentParts: any[] = [];
  
  // First image: the template model/pose image
  contentParts.push({
    type: "image_url",
    image_url: { url: poseImageBase64 }
  });
  console.log('Added pose image to request');
  
  // Second image: the user's product image
  contentParts.push({
    type: "image_url",
    image_url: { url: productImageBase64 }
  });
  console.log('Added product image to request');
  
  // Template-specific prompt that ONLY replaces clothing
  const templatePrompt = `You are an expert fashion photo editor. Your task is to perform a CLOTHING REPLACEMENT on a model photo.

CRITICAL TASK - CLOTHING REPLACEMENT ONLY:
You have TWO images:
1. FIRST IMAGE: A professional model photo showing a person in a specific pose, environment, and outfit
2. SECOND IMAGE: A product photo showing a clothing item that needs to replace the clothing on the model

YOUR MISSION:
Replace ONLY the relevant clothing item on the model with the product from the second image.

ABSOLUTE PRESERVATION REQUIREMENTS - DO NOT CHANGE:
- The model's face, skin tone, hair, and body MUST remain EXACTLY the same
- The model's pose and body position MUST remain EXACTLY the same
- The background and environment MUST remain EXACTLY the same
- The lighting conditions and shadows MUST remain EXACTLY the same
- The camera angle and framing MUST remain EXACTLY the same
- The image composition MUST remain EXACTLY the same
- Any accessories or other clothing items that are not being replaced MUST stay the same

CLOTHING REPLACEMENT RULES:
- Look at the product image and identify what type of clothing it is (shirt, pants, dress, etc.)
- Replace ONLY that specific type of clothing on the model
- The product must maintain its EXACT:
  - Color and color accuracy
  - Fabric texture and material appearance
  - Pattern, print, or design
  - Style, cut, and silhouette
  - All details: buttons, zippers, logos, embroidery, stitching
- The product must fit naturally on the model's body
- Realistic fabric folds and draping based on the model's pose
- Proper shadows and lighting interaction with the new clothing

QUALITY REQUIREMENTS:
- Photorealistic, high-end fashion photography quality
- Natural skin texture on any visible body parts
- Sharp focus and professional studio quality
- 9:16 vertical aspect ratio (portrait orientation)
- E-commerce and social media ready output

NEGATIVE CONSTRAINTS - AVOID:
- Changing the model's face or appearance in any way
- Changing the model's pose or body position
- Changing the background or environment
- Changing the lighting or shadows inappropriately
- Creating plastic or artificial-looking skin
- CGI or AI-generated appearance
- Distorting the product's colors or design
- Adding or removing any elements not related to the clothing change

OUTPUT: A single photorealistic image where ONLY the specified clothing has been replaced, with everything else remaining EXACTLY identical to the original model photo.`;

  contentParts.push({
    type: "text",
    text: templatePrompt
  });
  
  console.log('Sending request to Gemini for clothing replacement...');
  
  // Use pro model for better quality if usePro is true
  const model = usePro ? 'google/gemini-2.5-pro' : 'google/gemini-2.5-flash';
  console.log(`Using model: ${model}`);
  
  const response = await fetch(LOVABLE_AI_GATEWAY, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: 'user',
          content: contentParts
        }
      ],
      modalities: ['image', 'text']
    })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gemini API error:', errorText);
    throw new Error(`Gemini API failed: ${response.status} - ${errorText}`);
  }
  
  const result = await response.json();
  console.log('Gemini response received');
  
  // Extract the generated image
  const generatedImage = result.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  
  if (!generatedImage) {
    console.error('No image in Gemini response:', JSON.stringify(result).substring(0, 500));
    throw new Error('No image generated by Gemini');
  }
  
  console.log('Generated image received, uploading to storage...');
  
  // Upload the base64 image to Supabase storage
  const matches = generatedImage.match(/^data:([^;]+);base64,(.+)$/);
  if (!matches) {
    throw new Error('Invalid base64 image format from Gemini');
  }
  
  const mimeType = matches[1];
  const base64Data = matches[2];
  const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
  
  const extension = mimeType.split('/')[1] || 'png';
  const fileName = `templates/${templateId}/generated/${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`;
  
  const { error: uploadError } = await supabase.storage
    .from('generated-images')
    .upload(fileName, binaryData, {
      contentType: mimeType,
      upsert: true
    });
  
  if (uploadError) {
    console.error('Failed to upload generated image:', uploadError);
    throw new Error('Failed to save generated image');
  }
  
  // Create a signed URL for the stored image (7 days for template users)
  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from('generated-images')
    .createSignedUrl(fileName, 60 * 60 * 24 * 7); // 7 days
  
  if (signedUrlError || !signedUrlData?.signedUrl) {
    console.error('Failed to create signed URL:', signedUrlError);
    // Fallback to public URL attempt
    const { data: urlData } = supabase.storage
      .from('generated-images')
      .getPublicUrl(fileName);
    return urlData?.publicUrl || '';
  }
  
  console.log('Generated image uploaded with signed URL');
  return signedUrlData.signedUrl;
}
