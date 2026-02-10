import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Nano Banana API endpoints - ONLY API used for image generation (same as generate-model)
const NANOBANANA_BASE_URL = 'https://api.nanobananaapi.ai/api/v1/nanobanana';

// Credit costs per template (4 poses)
const STANDARD_CREDIT_COST = 4; // 1 credit per pose × 4 poses
const PRO_CREDIT_COST = 16; // 4 credits per pose × 4 poses

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Poll Nano Banana for task completion (same as generate-model)
async function pollForTaskCompletion(apiKey: string, taskId: string): Promise<string> {
  const maxWaitTime = 300000; // 5 minutes
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWaitTime) {
    const statusResponse = await fetch(`${NANOBANANA_BASE_URL}/record-info?taskId=${taskId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    
    const statusResult = await statusResponse.json();
    const successFlag = statusResult.data?.successFlag ?? statusResult.successFlag;
    const responseData = statusResult.data?.response ?? statusResult.response;
    const infoData = statusResult.data?.info ?? null;
    
    if (successFlag === 1) {
      let imageUrl = infoData?.resultImageUrl ||
                     responseData?.resultImageUrl ||
                     responseData?.imageUrl ||
                     statusResult.data?.resultImageUrl;
      
      if (imageUrl) {
        console.log('Found result image URL from Nano Banana');
        return imageUrl;
      }
      throw new Error('No resultImageUrl in Nano Banana response');
    }
    
    if (successFlag === 2 || successFlag === 3) {
      throw new Error(statusResult.data?.errorMessage || 'Nano Banana generation failed');
    }
    
    await sleep(3000);
  }
  
  throw new Error('Nano Banana generation timeout');
}

// Generate using Nano Banana API (same structure as generate-model)
async function generateWithNanoBanana(
  apiKey: string,
  prompt: string,
  imageUrls: string[],
  usePro: boolean
): Promise<string> {
  console.log(`Starting Nano Banana ${usePro ? 'Pro' : 'Standard'} template generation...`);
  
  let requestBody: Record<string, any>;
  let endpoint: string;
  
  if (usePro) {
    requestBody = {
      prompt: prompt,
      imageUrls: imageUrls,
      resolution: '2K',
      aspectRatio: '9:16'
    };
    endpoint = `${NANOBANANA_BASE_URL}/generate-pro`;
  } else {
    requestBody = {
      prompt: prompt,
      type: 'IMAGETOIAMGE',
      numImages: 1,
      imageUrls: imageUrls,
      aspectRatio: '9:16'
    };
    endpoint = `${NANOBANANA_BASE_URL}/generate`;
  }
  
  console.log('Nano Banana request:', JSON.stringify({ endpoint, imageCount: imageUrls.length }));
  
  const generateResponse = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  const generateResult = await generateResponse.json();
  console.log('Nano Banana response:', JSON.stringify(generateResult));
  
  if (!generateResponse.ok || generateResult.code !== 200) {
    throw new Error(`Nano Banana generation failed: ${generateResult.msg || 'Unknown error'}`);
  }
  
  const taskId = generateResult.data?.taskId;
  if (!taskId) {
    throw new Error('No taskId returned from Nano Banana');
  }
  
  console.log(`Nano Banana Task ID: ${taskId}, polling for result...`);
  return await pollForTaskCompletion(apiKey, taskId);
}

// Build prompt for template clothing replacement - ONLY replaces clothing, nothing else changes
function buildTemplatePrompt(): string {
  return `VIRTUAL TRY-ON / CLOTHING REPLACEMENT TASK — Editorial Fashion Photography Standard.

You have TWO images:
1. FIRST IMAGE: A professional model photo showing a person in a specific pose, environment, and outfit
2. SECOND IMAGE: A product photo showing a clothing item that needs to replace the clothing on the model

CRITICAL TASK - CLOTHING REPLACEMENT ONLY:
Replace ONLY the relevant clothing item on the model with the product from the second image.

ABSOLUTE PRESERVATION REQUIREMENTS - DO NOT CHANGE:
- The model's face, skin tone, hair, and body MUST remain EXACTLY the same
- The model's pose and body position MUST remain EXACTLY the same
- The background and environment MUST remain EXACTLY the same
- The lighting conditions and shadows MUST remain EXACTLY the same
- The camera angle and framing MUST remain EXACTLY the same
- Any accessories or other clothing items that are not being replaced MUST stay the same

CLOTHING REPLACEMENT RULES:
- Identify the clothing type from the product image (shirt, pants, dress, etc.)
- Replace ONLY that specific type of clothing on the model
- Maintain EXACT color, fabric texture, pattern, print, design, style, cut, and silhouette
- Preserve ALL details: buttons, zippers, logos, embroidery, stitching
- Natural fabric folds and draping based on the model's pose
- Proper shadows and lighting interaction with the new clothing

CAMERA & COMPOSITION:
- Maintain existing camera angle from the template
- Ensure editorial framing with visual balance
- Natural depth with subtle foreground/background separation

LIGHTING (HIGH-END STUDIO):
- Soft key light from side/front (window-like softness)
- Gentle shadow falloff for depth and dimension
- Neutral-premium color temperature (no yellow or blue cast)
- Lighting must enhance texture and material, not wash it out

PRODUCT LOCK (NON-NEGOTIABLE):
- Product shape, color, texture, proportions = 100% unchanged from input
- No stylization, no redesign, no "AI improvement"
- Fabric details must remain sharp and realistic

QUALITY REQUIREMENTS:
- Photorealistic, high-end editorial fashion photography quality
- Natural skin texture on any visible body parts
- Sharp focus and professional DSLR camera look
- 9:16 vertical aspect ratio (portrait orientation)
- E-commerce and social media ready output
- TRUE TO LIFE colors for accurate online shopping
- Must look like a premium brand campaign, not AI-generated

high-end editorial fashion photography, premium brand campaign, real human model, natural skin texture, soft directional lighting, realistic shadows, professional camera look, DSLR photography, authentic fabric texture, realistic clothing folds, quiet confidence, luxury brand aesthetic

NEGATIVE: flat angle, straight-on camera, stiff mannequin pose, plastic skin, over-smoothing, harsh studio flash, washed-out lighting, distorted proportions, fashion illustration look, AI artifacts, unrealistic blur, cheap catalog photo, symmetry lock, robotic posture, CGI skin, AI-generated look, synthetic appearance, distorted anatomy, deformed hands, oversaturated colors, 3D render, illustration style, fake gradient background

FINAL OVERRIDE: If there is any conflict, prioritize fashion photography realism and editorial aesthetics while strictly preserving the original product. The final image must look like it was shot by a senior fashion photographer for a premium brand campaign.

OUTPUT: A single photorealistic editorial image where ONLY the specified clothing has been replaced, with everything else remaining EXACTLY identical to the original model photo.`;
}

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
    const nanoBananaApiKey = Deno.env.get('NANOBANANA_API_KEY');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    if (!nanoBananaApiKey) {
      console.error('Missing NANOBANANA_API_KEY');
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

      // Templates require credits (not trial generations)
      // Check credits_remaining regardless of plan (supports admin-added credits for trial users too)
      if (subscription.credits_remaining < creditCost) {
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

    console.log(`Generating pose ${poseIndex + 1} for template ${templateId} using Nano Banana...`);

    // Upload base64 images to storage and get signed URLs for Nano Banana
    const imageUrls: string[] = [];
    
    // Upload pose image
    try {
      const poseMatches = poseImageBase64.match(/^data:([^;]+);base64,(.+)$/);
      if (poseMatches) {
        const mimeType = poseMatches[1];
        const base64Data = poseMatches[2];
        const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
        
        const extension = mimeType.split('/')[1] || 'png';
        const fileName = `templates/${templateId}/pose-${poseIndex}-${Date.now()}.${extension}`;
        
        const { error: uploadError } = await supabase.storage
          .from('generated-images')
          .upload(fileName, binaryData, { contentType: mimeType, upsert: true });
        
        if (!uploadError) {
          const { data: signedData } = await supabase.storage
            .from('generated-images')
            .createSignedUrl(fileName, 60 * 60); // 1 hour
          
          if (signedData?.signedUrl) {
            imageUrls.push(signedData.signedUrl);
            console.log(`Uploaded pose image with signed URL`);
          }
        } else {
          console.error('Error uploading pose image:', uploadError);
        }
      }
    } catch (err) {
      console.error('Error processing pose image:', err);
    }
    
    // Upload product image
    try {
      const productMatches = productImageBase64.match(/^data:([^;]+);base64,(.+)$/);
      if (productMatches) {
        const mimeType = productMatches[1];
        const base64Data = productMatches[2];
        const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
        
        const extension = mimeType.split('/')[1] || 'png';
        const fileName = `templates/${templateId}/product-${poseIndex}-${Date.now()}.${extension}`;
        
        const { error: uploadError } = await supabase.storage
          .from('generated-images')
          .upload(fileName, binaryData, { contentType: mimeType, upsert: true });
        
        if (!uploadError) {
          const { data: signedData } = await supabase.storage
            .from('generated-images')
            .createSignedUrl(fileName, 60 * 60); // 1 hour
          
          if (signedData?.signedUrl) {
            imageUrls.push(signedData.signedUrl);
            console.log(`Uploaded product image with signed URL`);
          }
        } else {
          console.error('Error uploading product image:', uploadError);
        }
      }
    } catch (err) {
      console.error('Error processing product image:', err);
    }
    
    if (imageUrls.length < 2) {
      console.error('Failed to upload both images');
      return new Response(
        JSON.stringify({ error: 'Failed to process images for generation' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Ready: ${imageUrls.length} image URLs for Nano Banana`);

    // Build prompt and generate with Nano Banana
    const prompt = buildTemplatePrompt();
    const generatedImageUrl = await generateWithNanoBanana(nanoBananaApiKey, prompt, imageUrls, usePro);
    
    console.log(`Pose ${poseIndex + 1} generated successfully: ${generatedImageUrl}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        imageUrl: generatedImageUrl,
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
