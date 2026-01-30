import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// NanoBanana API endpoints
const NANOBANANA_STANDARD_URL = 'https://api.nanobananaapi.ai/api/v1/nanobanana/generate';
const NANOBANANA_PRO_URL = 'https://api.nanobananaapi.ai/api/v1/nanobanana/generate-pro';
const NANOBANANA_TASK_URL = 'https://api.nanobananaapi.ai/api/v1/nanobanana/record-info';

// Credit costs per template (4 poses)
const STANDARD_CREDIT_COST = 4; // 1 credit per pose × 4 poses
const PRO_CREDIT_COST = 16; // 4 credits per pose × 4 poses

// Fixed prompt for template generation - DO NOT CHANGE
const TEMPLATE_PROMPT = `Use the uploaded images as strict references.

The first image is the template model image.

The second image is the user-uploaded product image.

Replace ONLY the clothing item worn on the model with the user-uploaded product.

Preserve the original clothing's:
- texture realism
- fabric structure
- color accuracy
- material details

Do NOT recolor, stylize, or reinterpret the product.

The product must look exactly like the uploaded image.

STRICT PRESERVATION RULES:
- Keep the same model
- Keep the same pose
- Keep the same body proportions
- Keep the same camera angle
- Keep the same framing and crop
- Keep the same background
- Keep the same lighting and shadows

Do NOT change:
- pose or posture
- body shape
- background or environment
- camera distance or angle
- lighting style

The result must look like a realistic product photoshoot.

Clean, photorealistic, e-commerce ready output.

Portrait orientation.

9:16 aspect ratio.

No editorial, fashion magazine, or artistic styling.`;

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Build Hijab constraint prompt injection
function buildHijabConstraint(isUpperWear: boolean = false): string {
  let constraint = `
=== HIJAB/MODEST MODEL - MANDATORY REQUIREMENTS ===
This MUST be a hijabi (covered/modest) female model.
REQUIRED - Headscarf (eşarp/şal) fully covering ALL hair - NO hair visible whatsoever
REQUIRED - Neck must be FULLY covered by the hijab or clothing
REQUIRED - Chest/décolletage must be FULLY covered - NO cleavage
REQUIRED - Shoulders must be covered
REQUIRED - Long sleeves covering arms completely - wrists and above must NOT be visible
REQUIRED - ONLY face and hands can be visible
REQUIRED - Modest, conservative clothing style

STRICTLY FORBIDDEN when Hijab is selected:
- ANY visible hair (not a single strand)
- Exposed neck or neckline
- Any cleavage or chest exposure
- Short sleeves or exposed shoulders
- Open collar, V-neck, or transparent fabrics
- Any skin exposure beyond face and hands (including wrists)
`;

  // Add modest skirt requirement for upper wear templates
  if (isUpperWear) {
    constraint += `
=== MODEST SKIRT REQUIREMENT FOR UPPER WEAR ===
REQUIRED - The model MUST wear a long, ankle-length "Tesettür Giyim Eteği" (modest/Islamic fashion long skirt)
REQUIRED - The skirt must reach down to the feet/ankles - NO short or knee-length skirts
REQUIRED - NO pants, jeans, or fitted bottom wear - ONLY long flowing modest skirts
REQUIRED - The skirt should be loose-fitting, not tight or form-fitting
REQUIRED - Appropriate for Islamic modest fashion (tesettür giyim)

STRICTLY FORBIDDEN for bottom wear:
- Mini skirts, short skirts, knee-length skirts
- Tight pants, jeans, leggings
- Any bottom wear that reveals body shape or legs
`;
  }

  constraint += `
The Hijab requirement OVERRIDES all default styling and takes ABSOLUTE PRIORITY.
=== END HIJAB REQUIREMENTS ===
`;

  return constraint;
}

// Upload base64 image to storage and return public URL for NanoBanana
async function uploadBase64ToStorage(
  supabase: any,
  base64Data: string,
  templateId: string,
  prefix: string
): Promise<string> {
  console.log(`Uploading ${prefix} image to storage...`);
  
  // Parse base64 data
  const matches = base64Data.match(/^data:([^;]+);base64,(.+)$/);
  if (!matches) {
    throw new Error('Invalid base64 format');
  }
  
  const mimeType = matches[1];
  const base64Content = matches[2];
  const binaryData = Uint8Array.from(atob(base64Content), c => c.charCodeAt(0));
  
  const extension = mimeType.split('/')[1]?.replace('jpeg', 'jpg') || 'png';
  const fileName = `templates/${templateId}/${prefix}-${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`;
  
  const { error: uploadError } = await supabase.storage
    .from('generated-images')
    .upload(fileName, binaryData, {
      contentType: mimeType,
      upsert: true
    });
  
  if (uploadError) {
    console.error('Upload error:', uploadError);
    throw new Error(`Failed to upload ${prefix} image: ${uploadError.message}`);
  }
  
  // Get public URL
  const { data: urlData } = supabase.storage
    .from('generated-images')
    .getPublicUrl(fileName);
  
  const publicUrl = urlData?.publicUrl || '';
  console.log(`${prefix} image uploaded successfully:`, publicUrl);
  return publicUrl;
}

// Download image from URL and upload to storage to get accessible URL
async function downloadAndUploadImage(
  supabase: any,
  imageUrl: string,
  templateId: string,
  prefix: string
): Promise<string> {
  console.log(`Downloading image from: ${imageUrl}`);
  
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const binaryData = new Uint8Array(arrayBuffer);
    
    const contentType = response.headers.get('content-type') || 'image/png';
    const extension = contentType.includes('jpeg') || contentType.includes('jpg') ? 'jpg' : 
                      contentType.includes('webp') ? 'webp' : 'png';
    
    const fileName = `templates/${templateId}/${prefix}-${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`;
    
    const { error: uploadError } = await supabase.storage
      .from('generated-images')
      .upload(fileName, binaryData, {
        contentType,
        upsert: true
      });
    
    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(`Failed to upload ${prefix} image: ${uploadError.message}`);
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('generated-images')
      .getPublicUrl(fileName);
    
    const publicUrl = urlData?.publicUrl || '';
    console.log(`${prefix} image downloaded and uploaded successfully:`, publicUrl);
    return publicUrl;
  } catch (error) {
    console.error(`Error downloading/uploading ${prefix} image:`, error);
    throw error;
  }
}

// Poll for task completion using successFlag
// successFlag: 0=GENERATING, 1=SUCCESS, 2=CREATE_TASK_FAILED, 3=GENERATE_FAILED
async function pollForTaskCompletion(
  taskId: string,
  apiKey: string,
  maxAttempts: number = 120,
  intervalMs: number = 5000
): Promise<any> {
  console.log(`Polling for task ${taskId} completion...`);
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await sleep(intervalMs);
    
    try {
      const url = `${NANOBANANA_TASK_URL}?taskId=${encodeURIComponent(taskId)}`;
      console.log(`Polling attempt ${attempt + 1}: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.error(`Task poll HTTP error: ${response.status}`);
        const errorText = await response.text();
        console.error(`Error response: ${errorText}`);
        continue;
      }
      
      const result = await response.json();
      console.log(`Task status (attempt ${attempt + 1}):`, JSON.stringify(result));
      
      // The response structure can be either { data: { successFlag, response } } or { successFlag, response }
      const taskData = result.data || result;
      const successFlag = taskData.successFlag;
      
      if (successFlag === 1) {
        // SUCCESS
        console.log('Task completed successfully');
        return taskData;
      }
      
      if (successFlag === 2) {
        // CREATE_TASK_FAILED
        throw new Error(`Task creation failed: ${taskData.errorMessage || 'Unknown error'}`);
      }
      
      if (successFlag === 3) {
        // GENERATE_FAILED
        throw new Error(`Generation failed: ${taskData.errorMessage || 'Unknown error'}`);
      }
      
      // successFlag === 0 means still GENERATING, continue polling
      console.log('Task still generating, continuing to poll...');
      
    } catch (error) {
      console.error(`Polling attempt ${attempt + 1} error:`, error);
      if (attempt === maxAttempts - 1) {
        throw error;
      }
    }
  }
  
  throw new Error('Task polling timeout - generation took too long');
}

// Generate image using NanoBanana STANDARD API (IMAGETOIAMGE mode)
async function generateWithNanoBananaStandard(
  apiKey: string,
  poseImageUrl: string,
  productImageUrl: string,
  supabase: any,
  templateId: string,
  isHijab: boolean = false,
  isUpperWear: boolean = false
): Promise<string> {
  console.log('Starting NanoBanana STANDARD image-to-image generation...');
  console.log('Pose image URL:', poseImageUrl);
  console.log('Product image URL:', productImageUrl);
  
  // Use fixed template prompt, optionally with Hijab constraint
  let finalPrompt = TEMPLATE_PROMPT;
  if (isHijab) {
    finalPrompt = buildHijabConstraint(isUpperWear) + '\n\n' + TEMPLATE_PROMPT;
    console.log('Hijab constraint injected into prompt (isUpperWear:', isUpperWear, ')');
  }
  
  // Create a dummy callback URL (required by API but we'll poll instead)
  const callbackUrl = 'https://webhook.site/dummy-callback';
  
  // Build request body according to NanoBanana API spec for STANDARD endpoint
  const requestBody = {
    prompt: finalPrompt,
    type: 'IMAGETOIAMGE', // Image-to-image editing mode (note: typo is in official API)
    callBackUrl: callbackUrl,
    numImages: 1,
    imageUrls: [poseImageUrl, productImageUrl], // Both pose and product images
    image_size: '9:16' // Portrait aspect ratio for fashion templates
  };
  
  console.log('NanoBanana STANDARD request body:', JSON.stringify({
    ...requestBody,
    prompt: requestBody.prompt.substring(0, 100) + '...',
    imageUrls: requestBody.imageUrls
  }));
  
  const response = await fetch(NANOBANANA_STANDARD_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });
  
  const responseText = await response.text();
  console.log('NanoBanana STANDARD raw response:', responseText);
  
  if (!response.ok) {
    console.error('NanoBanana API error:', responseText);
    throw new Error(`NanoBanana API HTTP error: ${response.status} - ${responseText}`);
  }
  
  let result;
  try {
    result = JSON.parse(responseText);
  } catch (e) {
    throw new Error(`Failed to parse NanoBanana response: ${responseText}`);
  }
  
  console.log('NanoBanana parsed response:', JSON.stringify(result));
  
  if (result.code !== 200) {
    throw new Error(`NanoBanana API error: ${result.msg || 'Unknown error'} (code: ${result.code})`);
  }
  
  const taskId = result.data?.taskId;
  if (!taskId) {
    throw new Error('No taskId returned from NanoBanana API');
  }
  
  console.log(`Task submitted with ID: ${taskId}, polling for completion...`);
  
  // Poll for task completion
  const taskResult = await pollForTaskCompletion(taskId, apiKey);
  
  // Extract generated image URL from task result
  const generatedImageUrl = taskResult.response?.resultImageUrl || taskResult.response?.originImageUrl;
  
  if (!generatedImageUrl) {
    console.error('No image URL in task result:', JSON.stringify(taskResult));
    throw new Error('No generated image URL in task result');
  }
  
  return await downloadAndStoreImage(supabase, generatedImageUrl, templateId);
}

// Generate image using NanoBanana PRO API
async function generateWithNanoBananaPro(
  apiKey: string,
  poseImageUrl: string,
  productImageUrl: string,
  supabase: any,
  templateId: string,
  isHijab: boolean = false,
  isUpperWear: boolean = false
): Promise<string> {
  console.log('Starting NanoBanana PRO image generation...');
  console.log('Pose image URL:', poseImageUrl);
  console.log('Product image URL:', productImageUrl);
  
  // Use fixed template prompt, optionally with Hijab constraint
  let finalPrompt = TEMPLATE_PROMPT;
  if (isHijab) {
    finalPrompt = buildHijabConstraint(isUpperWear) + '\n\n' + TEMPLATE_PROMPT;
    console.log('Hijab constraint injected into prompt (isUpperWear:', isUpperWear, ')');
  }
  
  // Create a dummy callback URL (required by API but we'll poll instead)
  const callbackUrl = 'https://webhook.site/dummy-callback';
  
  // Build request body according to NanoBanana PRO API spec
  // PRO endpoint uses different parameters: resolution, aspectRatio (not image_size)
  const requestBody = {
    prompt: finalPrompt,
    imageUrls: [poseImageUrl, productImageUrl], // Both pose and product images
    resolution: '2K', // High quality: 1K, 2K, or 4K
    aspectRatio: '9:16', // Portrait aspect ratio for fashion templates
    callBackUrl: callbackUrl
  };
  
  console.log('NanoBanana PRO request body:', JSON.stringify({
    ...requestBody,
    prompt: requestBody.prompt.substring(0, 100) + '...',
    imageUrls: requestBody.imageUrls
  }));
  
  const response = await fetch(NANOBANANA_PRO_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });
  
  const responseText = await response.text();
  console.log('NanoBanana PRO raw response:', responseText);
  
  if (!response.ok) {
    console.error('NanoBanana PRO API error:', responseText);
    throw new Error(`NanoBanana PRO API HTTP error: ${response.status} - ${responseText}`);
  }
  
  let result;
  try {
    result = JSON.parse(responseText);
  } catch (e) {
    throw new Error(`Failed to parse NanoBanana PRO response: ${responseText}`);
  }
  
  console.log('NanoBanana PRO parsed response:', JSON.stringify(result));
  
  // PRO API returns code 200 on success
  if (result.code !== 200) {
    throw new Error(`NanoBanana PRO API error: ${result.message || result.msg || 'Unknown error'} (code: ${result.code})`);
  }
  
  const taskId = result.data?.taskId;
  if (!taskId) {
    throw new Error('No taskId returned from NanoBanana PRO API');
  }
  
  console.log(`PRO Task submitted with ID: ${taskId}, polling for completion...`);
  
  // Poll for task completion (PRO may take longer, so more attempts)
  const taskResult = await pollForTaskCompletion(taskId, apiKey, 180, 5000);
  
  // Extract generated image URL from task result
  const generatedImageUrl = taskResult.response?.resultImageUrl || taskResult.response?.originImageUrl;
  
  if (!generatedImageUrl) {
    console.error('No image URL in PRO task result:', JSON.stringify(taskResult));
    throw new Error('No generated image URL in PRO task result');
  }
  
  return await downloadAndStoreImage(supabase, generatedImageUrl, templateId);
}

// Download image from URL and store in Supabase storage
async function downloadAndStoreImage(
  supabase: any,
  imageUrl: string,
  templateId: string
): Promise<string> {
  console.log('Generated image URL:', imageUrl);
  
  // Download and re-upload to our storage for persistence
  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) {
    throw new Error(`Failed to download generated image: ${imageResponse.status}`);
  }
  
  const imageBuffer = await imageResponse.arrayBuffer();
  const fileName = `templates/${templateId}/generated/${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
  
  const { error: uploadError } = await supabase.storage
    .from('generated-images')
    .upload(fileName, new Uint8Array(imageBuffer), {
      contentType: 'image/png',
      upsert: true
    });
  
  if (uploadError) {
    console.error('Failed to upload to storage:', uploadError);
    throw new Error('Failed to save generated image');
  }
  
  // Create signed URL for the stored image
  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from('generated-images')
    .createSignedUrl(fileName, 60 * 60 * 24 * 7); // 7 days for Creator users
  
  if (signedUrlError || !signedUrlData?.signedUrl) {
    console.error('Failed to create signed URL:', signedUrlError);
    const { data: urlData } = supabase.storage
      .from('generated-images')
      .getPublicUrl(fileName);
    return urlData?.publicUrl || '';
  }
  
  console.log('Generated image uploaded with signed URL');
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
      poseImageBase64, // Now receives base64 instead of URL
      productImageBase64, 
      usePro = false,
      isHijab = false,
      isUpperWear = false
    } = await req.json();
    
    console.log(`Template generation request - templateId: ${templateId}, poseIndex: ${poseIndex}, usePro: ${usePro}, isHijab: ${isHijab}, isUpperWear: ${isUpperWear}`);
    
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

    // Upload both images to storage to get public URLs for NanoBanana API
    console.log('Uploading pose image to storage...');
    const poseImageUrl = await uploadBase64ToStorage(supabase, poseImageBase64, templateId, 'pose');
    console.log('Pose image uploaded:', poseImageUrl);
    
    console.log('Uploading product image to storage...');
    const productImageUrl = await uploadBase64ToStorage(supabase, productImageBase64, templateId, 'product');
    console.log('Product image uploaded:', productImageUrl);
    
    console.log(`Generating pose ${poseIndex + 1} for template ${templateId} using ${usePro ? 'PRO' : 'STANDARD'} mode...`);

    // Call appropriate NanoBanana API based on usePro flag
    let storedImageUrl: string;
    
    if (usePro) {
      // Use NanoBanana PRO API for higher quality
      storedImageUrl = await generateWithNanoBananaPro(
        nanoBananaApiKey,
        poseImageUrl,
        productImageUrl,
        supabase,
        templateId,
        isHijab,
        isUpperWear
      );
    } else {
      // Use NanoBanana STANDARD API
      storedImageUrl = await generateWithNanoBananaStandard(
        nanoBananaApiKey,
        poseImageUrl,
        productImageUrl,
        supabase,
        templateId,
        isHijab,
        isUpperWear
      );
    }
    
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
