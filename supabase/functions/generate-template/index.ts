import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Nano Banana API endpoints - SAME AS generate-model
const NANOBANANA_BASE_URL = 'https://api.nanobananaapi.ai/api/v1/nanobanana';
const NANOBANANA_API_KEY = '8f40e3c4ec5e36d8bbe18354535318d7';

// Credit costs per template (4 poses)
const STANDARD_CREDIT_COST = 4; // 1 credit per pose × 4 poses
const PRO_CREDIT_COST = 16; // 4 credits per pose × 4 poses

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Build Hijab constraint prompt injection - SAME AS generate-model
function buildHijabConstraint(): string {
  return `
=== HIJAB/MODEST MODEL - MANDATORY REQUIREMENTS ===
This MUST be a hijabi (covered/modest) female model.
REQUIRED - Headscarf (hijab) fully covering ALL hair - NO hair visible whatsoever
REQUIRED - Neck must be FULLY covered by the hijab or clothing
REQUIRED - Chest/décolletage must be FULLY covered - NO cleavage
REQUIRED - Shoulders must be covered
REQUIRED - Long sleeves covering arms completely
REQUIRED - Modest, conservative clothing style

STRICTLY FORBIDDEN when Hijab is selected:
- ANY visible hair (not a single strand)
- Exposed neck or neckline
- Any cleavage or chest exposure
- Short sleeves or exposed shoulders
- Open collar, V-neck, or transparent fabrics
- Any skin exposure beyond face and hands

The Hijab requirement OVERRIDES all default styling and takes ABSOLUTE PRIORITY.
=== END HIJAB REQUIREMENTS ===
`;
}

// Upload base64 image to Supabase storage and get a signed URL
async function uploadBase64ToStorageForApi(
  supabase: any,
  base64Image: string,
  folder: string
): Promise<string> {
  const matches = base64Image.match(/^data:([^;]+);base64,(.+)$/);
  if (!matches) {
    throw new Error('Invalid base64 image format');
  }
  
  const mimeType = matches[1];
  const base64Data = matches[2];
  const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
  
  const extension = mimeType.split('/')[1] || 'png';
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`;
  
  const { error: uploadError } = await supabase.storage
    .from('generated-images')
    .upload(fileName, binaryData, {
      contentType: mimeType,
      upsert: true
    });
  
  if (uploadError) {
    console.error('Upload error:', uploadError);
    throw new Error('Failed to upload image to storage');
  }
  
  // Create signed URL for NanoBanana API
  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from('generated-images')
    .createSignedUrl(fileName, 60 * 60); // 1 hour
  
  if (signedUrlError || !signedUrlData?.signedUrl) {
    console.error('Signed URL error:', signedUrlError);
    throw new Error('Failed to create signed URL');
  }
  
  return signedUrlData.signedUrl;
}

// Fetch image from URL and upload to Supabase storage, return signed URL
async function uploadUrlImageToStorageForApi(
  supabase: any,
  imageUrl: string,
  folder: string
): Promise<string> {
  console.log('Fetching pose image from URL:', imageUrl);
  
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch pose image: ${response.status}`);
  }
  
  const blob = await response.blob();
  const arrayBuffer = await blob.arrayBuffer();
  const binaryData = new Uint8Array(arrayBuffer);
  
  // Extract extension from original URL (more reliable than blob.type for some servers)
  const urlPath = new URL(imageUrl).pathname;
  const urlExtension = urlPath.split('.').pop()?.toLowerCase();
  
  // Determine the correct extension and mime type
  let extension = 'png';
  let mimeType = 'image/png';
  
  if (urlExtension && ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(urlExtension)) {
    extension = urlExtension === 'jpg' ? 'jpeg' : urlExtension;
    mimeType = `image/${extension}`;
  } else if (blob.type && blob.type.startsWith('image/')) {
    // Only use blob.type if it's a valid image type
    const blobExt = blob.type.split('/')[1]?.split(';')[0]; // Handle "image/png;charset=utf-8"
    if (blobExt && ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(blobExt)) {
      extension = blobExt;
      mimeType = `image/${extension}`;
    }
  }
  
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`;
  console.log('Uploading with mimeType:', mimeType, 'extension:', extension);
  
  const { error: uploadError } = await supabase.storage
    .from('generated-images')
    .upload(fileName, binaryData, {
      contentType: mimeType,
      upsert: true
    });
  
  if (uploadError) {
    console.error('Upload error:', uploadError);
    throw new Error('Failed to upload pose image to storage');
  }
  
  // Create signed URL for NanoBanana API
  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from('generated-images')
    .createSignedUrl(fileName, 60 * 60); // 1 hour
  
  if (signedUrlError || !signedUrlData?.signedUrl) {
    console.error('Signed URL error:', signedUrlError);
    throw new Error('Failed to create signed URL for pose image');
  }
  
  console.log('Pose image uploaded to storage with signed URL');
  return signedUrlData.signedUrl;
}

// Poll for NanoBanana task completion - SAME AS generate-model
async function pollForTaskCompletion(apiKey: string, taskId: string): Promise<string> {
  const maxWaitTime = 300000; // 5 minutes
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWaitTime) {
    const statusResponse = await fetch(`${NANOBANANA_BASE_URL}/record-info?taskId=${taskId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    
    const statusResult = await statusResponse.json();
    console.log('Poll response:', JSON.stringify(statusResult));
    
    const successFlag = statusResult.data?.successFlag ?? statusResult.successFlag;
    const responseData = statusResult.data?.response ?? statusResult.response;
    const infoData = statusResult.data?.info ?? null;
    
    if (successFlag === 1) {
      let imageUrl = infoData?.resultImageUrl ||
                     responseData?.resultImageUrl ||
                     responseData?.imageUrl ||
                     statusResult.data?.resultImageUrl;
      
      if (imageUrl) {
        console.log('Found result image URL:', imageUrl);
        return imageUrl;
      }
      throw new Error('No resultImageUrl in NanoBanana response');
    }
    
    if (successFlag === 2 || successFlag === 3) {
      const errorMsg = statusResult.data?.errorMessage || 'NanoBanana generation failed';
      console.error('NanoBanana error:', errorMsg);
      throw new Error(errorMsg);
    }
    
    // Poll every 3 seconds
    await sleep(3000);
  }
  
  throw new Error('NanoBanana generation timeout after 5 minutes');
}

// Generate using NanoBanana API - SAME LOGIC AS generate-model
async function generateWithNanoBanana(
  apiKey: string,
  prompt: string,
  imageUrls: string[],
  usePro: boolean,
  isHijab: boolean = false
): Promise<string> {
  console.log(`Starting NanoBanana ${usePro ? 'Pro' : 'Standard'} generation...`);
  console.log(`Images count: ${imageUrls.length}, Hijab mode: ${isHijab}`);
  
  // Inject Hijab constraint if enabled
  let finalPrompt = prompt;
  if (isHijab) {
    finalPrompt = buildHijabConstraint() + '\n\n' + prompt;
    console.log('Hijab constraint injected into prompt');
  }
  
  let requestBody: Record<string, any>;
  let endpoint: string;
  
  if (usePro) {
    // Pro API uses different endpoint and parameters
    requestBody = {
      prompt: finalPrompt,
      imageUrls: imageUrls,
      resolution: '2K',
      aspectRatio: '9:16'
    };
    endpoint = `${NANOBANANA_BASE_URL}/generate-pro`;
  } else {
    // Standard API - NanoBanana uses IMAGETOIAMGE (their API spec)
    // Use image_size parameter for aspect ratio
    requestBody = {
      prompt: finalPrompt,
      type: 'IMAGETOIAMGE',
      numImages: 1,
      imageUrls: imageUrls,
      image_size: '9:16'
    };
    endpoint = `${NANOBANANA_BASE_URL}/generate`;
  }
  
  console.log('NanoBanana request endpoint:', endpoint);
  console.log('NanoBanana image URLs:', JSON.stringify(imageUrls));
  
  const generateResponse = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  const generateResult = await generateResponse.json();
  console.log('NanoBanana response:', JSON.stringify(generateResult));
  
  if (!generateResponse.ok || generateResult.code !== 200) {
    const errorMsg = generateResult.msg || generateResult.message || JSON.stringify(generateResult);
    console.error('NanoBanana API error:', errorMsg);
    throw new Error(`NanoBanana generation failed: ${errorMsg}`);
  }
  
  const taskId = generateResult.data?.taskId;
  if (!taskId) {
    console.error('No taskId in response:', generateResult);
    throw new Error('No taskId returned from NanoBanana');
  }
  
  console.log(`NanoBanana Task ID: ${taskId}, starting poll...`);
  return await pollForTaskCompletion(apiKey, taskId);
}

// Upload result image to storage for persistence
async function uploadResultToStorage(
  supabase: any,
  imageUrl: string,
  folder: string
): Promise<string> {
  // Fetch the image from NanoBanana
  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) {
    throw new Error('Failed to fetch generated image from NanoBanana');
  }
  
  const imageBlob = await imageResponse.blob();
  const arrayBuffer = await imageBlob.arrayBuffer();
  const binaryData = new Uint8Array(arrayBuffer);
  
  const mimeType = imageBlob.type || 'image/png';
  const extension = mimeType.split('/')[1] || 'png';
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`;
  
  const { error: uploadError } = await supabase.storage
    .from('generated-images')
    .upload(fileName, binaryData, {
      contentType: mimeType,
      upsert: true
    });
  
  if (uploadError) {
    console.error('Upload error:', uploadError);
    throw new Error('Failed to save generated image');
  }
  
  // Create signed URL for client
  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from('generated-images')
    .createSignedUrl(fileName, 60 * 60 * 24); // 24 hours
  
  if (signedUrlError || !signedUrlData?.signedUrl) {
    console.error('Signed URL error:', signedUrlError);
    const { data: urlData } = supabase.storage
      .from('generated-images')
      .getPublicUrl(fileName);
    return urlData?.publicUrl || '';
  }
  
  return signedUrlData.signedUrl;
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
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
      poseImageUrl, 
      productImageBase64, 
      prompt,
      usePro = false,
      isHijab = false
    } = await req.json();
    
    console.log(`Template generation request - templateId: ${templateId}, poseIndex: ${poseIndex}, usePro: ${usePro}, isHijab: ${isHijab}`);
    
    if (!templateId || typeof poseIndex !== 'number' || !poseImageUrl || !productImageBase64 || !prompt) {
      console.error('Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Missing required fields: templateId, poseIndex, poseImageUrl, productImageBase64, prompt' }),
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

    // Upload product image to storage and get a signed URL for NanoBanana
    console.log('Uploading product image to storage...');
    const productImageSignedUrl = await uploadBase64ToStorageForApi(
      supabase,
      productImageBase64,
      `templates/${templateId}/products`
    );
    console.log('Product image uploaded:', productImageSignedUrl);

    // Upload pose template image to storage (NanoBanana can't access lovableproject.com URLs)
    console.log('Uploading pose template image to storage...');
    const poseImageSignedUrl = await uploadUrlImageToStorageForApi(
      supabase,
      poseImageUrl,
      `templates/${templateId}/poses`
    );
    console.log('Pose image uploaded:', poseImageSignedUrl);

    // Prepare image URLs for NanoBanana API - BOTH must be signed URLs
    const imageUrls = [poseImageSignedUrl, productImageSignedUrl];
    
    console.log(`Generating pose ${poseIndex + 1} for template ${templateId}...`);
    console.log('Image URLs (signed):', imageUrls);

    // Call NanoBanana API - SAME AS generate-model
    const generatedImageUrl = await generateWithNanoBanana(
      NANOBANANA_API_KEY,
      prompt,
      imageUrls,
      usePro,
      isHijab
    );
    
    console.log('NanoBanana generation complete, uploading result...');
    
    // Upload generated image to our storage for persistence
    const storedImageUrl = await uploadResultToStorage(
      supabase, 
      generatedImageUrl, 
      `templates/${templateId}/generated`
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
