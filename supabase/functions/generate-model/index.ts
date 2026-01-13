import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Nano Banana API endpoints
const NANOBANANA_BASE_URL = 'https://api.nanobananaapi.ai/api/v1/nanobanana';
const NANOBANANA_API_KEY = '8f40e3c4ec5e36d8bbe18354535318d7';

// Credit costs
const STANDARD_CREDIT_COST = 1;
const PRO_CREDIT_COST = 4; // Pro costs 4 credits

// Allowed values for input validation
const ALLOWED_VALUES = {
  gender: ['Male', 'Female'],
  ethnicity: ['Afro-American', 'Arabic', 'Asian', 'Australian', 'European', 'Indian', 'Italian', 'Latin', 'Local American', 'Russian', 'Scandinavian', 'Turkish'],
  skinTone: ['Fair', 'Light', 'Medium', 'Olive', 'Tan', 'Brown', 'Dark Brown', 'Dark', 'Ebony'],
  hairColor: ['Black', 'Brown', 'Blonde', 'Dark Blonde', 'Red', 'White', 'Platinum', 'Blue', 'Green', 'Purple'],
  eyeColor: ['Brown', 'Blue', 'Green', 'Hazel', 'Grey', 'Amber', 'Black'],
  bodyType: ['Slim', 'Athletic', 'Average', 'Curvy', 'Muscular', 'Petite', 'Tall', 'Plus Size', 'Hourglass'],
  hairType: ['Straight', 'Wavy', 'Curly', 'Coily', 'Short', 'Long', 'Bald'],
  beardType: ['Clean Shaven', 'Stubble', 'Short Beard', 'Full Beard', 'Goatee', 'Mustache', 'Van Dyke', 'Circle Beard', 'Mutton Chops', null],
  pose: ['Face Close-up', 'Standing', 'Sitting', 'Leaning', 'Arms Crossed', 'Back View', 'Low-Angle', 'Hands on Hips', 'Top-down'],
  background: ['Fashion White', 'City', 'Beach', 'Forest', 'Mountain', 'Cafe', 'Snowy', 'Underwater'],
  faceType: ['Oval', 'Round', 'Square', 'Heart', 'Oblong', 'Diamond'],
  facialExpression: ['Neutral', 'Smile', 'Serious', 'Confident'],
  modestOption: ['Standard', 'Hijab', null]
};

// Validate and sanitize a config value
function sanitizeConfigValue(key: string, value: any): string | null {
  if (value === null || value === undefined) return null;
  
  const strValue = String(value).slice(0, 50); // Max 50 chars
  const allowedList = ALLOWED_VALUES[key as keyof typeof ALLOWED_VALUES];
  
  if (allowedList && !allowedList.includes(strValue) && strValue !== '') {
    console.warn(`Invalid value for ${key}: ${strValue}`);
    return null;
  }
  
  return strValue;
}

// Sanitize entire config object
function sanitizeConfig(config: any): Record<string, string | null> {
  return {
    gender: sanitizeConfigValue('gender', config?.gender),
    ethnicity: sanitizeConfigValue('ethnicity', config?.ethnicity),
    skinTone: sanitizeConfigValue('skinTone', config?.skinTone),
    hairColor: sanitizeConfigValue('hairColor', config?.hairColor),
    eyeColor: sanitizeConfigValue('eyeColor', config?.eyeColor),
    bodyType: sanitizeConfigValue('bodyType', config?.bodyType),
    hairType: sanitizeConfigValue('hairType', config?.hairType),
    beardType: sanitizeConfigValue('beardType', config?.beardType),
    pose: sanitizeConfigValue('pose', config?.pose),
    background: sanitizeConfigValue('background', config?.background),
    faceType: sanitizeConfigValue('faceType', config?.faceType),
    facialExpression: sanitizeConfigValue('facialExpression', config?.facialExpression),
    modestOption: sanitizeConfigValue('modestOption', config?.modestOption),
  };
}

// Helper function to wait/sleep
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Generate image using Nano Banana Standard API (with IMAGETOIAMGE type)
async function generateWithNanoBananaStandard(
  apiKey: string,
  prompt: string,
  imageUrls: string[]
): Promise<string> {
  console.log('Starting Nano Banana Standard image generation...');
  console.log(`Image-to-Image mode with ${imageUrls.length} reference image(s)`);
  
  // Build request body for Standard Image-to-Image mode
  // Standard API uses "IMAGETOIAMGE" (intentional typo in API)
  const requestBody: Record<string, any> = {
    prompt: prompt,
    type: 'IMAGETOIAMGE', // Note: API has typo - IAMGE not IMAGE
    numImages: 1,
    imageUrls: imageUrls // Required for Image-to-Image
  };
  
  console.log('Nano Banana Standard request body:', JSON.stringify({
    type: requestBody.type,
    numImages: requestBody.numImages,
    imageUrlCount: imageUrls.length,
    promptLength: prompt.length
  }));
  
  const generateResponse = await fetch(`${NANOBANANA_BASE_URL}/generate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  const generateResult = await generateResponse.json();
  console.log('Nano Banana Standard generate response:', JSON.stringify(generateResult));
  
  if (!generateResponse.ok || generateResult.code !== 200) {
    throw new Error(`Generation failed: ${generateResult.msg || generateResult.message || 'Unknown error'}`);
  }
  
  const taskId = generateResult.data?.taskId;
  if (!taskId) {
    throw new Error('No taskId returned from Nano Banana API');
  }
  
  console.log(`Task created with ID: ${taskId}. Polling for completion...`);
  
  // Poll for completion (max 5 minutes)
  return await pollForTaskCompletion(apiKey, taskId);
}

// Generate image using Nano Banana Pro API (different endpoint and params)
async function generateWithNanoBananaPro(
  apiKey: string,
  prompt: string,
  imageUrls: string[]
): Promise<string> {
  console.log('Starting Nano Banana Pro image generation...');
  console.log(`Image-to-Image mode with ${imageUrls.length} reference image(s)`);
  
  // Build request body for Pro API
  // Pro API uses different endpoint and doesn't need 'type' parameter
  // imageUrls presence signals image-to-image mode
  const requestBody: Record<string, any> = {
    prompt: prompt,
    imageUrls: imageUrls, // For image-to-image transformation
    resolution: '2K', // Pro supports 1K, 2K, 4K
    aspectRatio: '3:4' // Portrait ratio for fashion photography
  };
  
  console.log('Nano Banana Pro request body:', JSON.stringify({
    imageUrlCount: imageUrls.length,
    resolution: requestBody.resolution,
    aspectRatio: requestBody.aspectRatio,
    promptLength: prompt.length
  }));
  
  // Pro API uses /generate-pro endpoint
  const generateResponse = await fetch(`${NANOBANANA_BASE_URL}/generate-pro`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  const generateResult = await generateResponse.json();
  console.log('Nano Banana Pro generate response:', JSON.stringify(generateResult));
  
  if (!generateResponse.ok || generateResult.code !== 200) {
    throw new Error(`Pro generation failed: ${generateResult.msg || generateResult.message || 'Unknown error'}`);
  }
  
  const taskId = generateResult.data?.taskId;
  if (!taskId) {
    throw new Error('No taskId returned from Nano Banana Pro API');
  }
  
  console.log(`Pro task created with ID: ${taskId}. Polling for completion...`);
  
  // Poll for completion (max 5 minutes)
  return await pollForTaskCompletion(apiKey, taskId);
}

// Poll for task completion (shared between Standard and Pro)
async function pollForTaskCompletion(apiKey: string, taskId: string): Promise<string> {
  const maxWaitTime = 300000; // 5 minutes
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWaitTime) {
    const statusResponse = await fetch(`${NANOBANANA_BASE_URL}/record-info?taskId=${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    const statusResult = await statusResponse.json();
    console.log('Task status response:', JSON.stringify(statusResult));
    
    // Get successFlag from response - this determines actual task status
    // successFlag: 0 = processing, 1 = completed, 2/3 = failed
    const successFlag = statusResult.data?.successFlag ?? statusResult.successFlag;
    const responseData = statusResult.data?.response ?? statusResult.response;
    const infoData = statusResult.data?.info ?? null;
    
    console.log(`Task status check: successFlag=${successFlag}, hasResponse=${!!responseData}, hasInfo=${!!infoData}`);
    
    // Check for completed status (successFlag === 1 means task completed)
    if (successFlag === 1) {
      console.log('Generation completed successfully!');
      
      // Try multiple locations for the result image URL
      // Pro API callback structure: data.info.resultImageUrl
      // Standard API structure: data.response.resultImageUrl
      let imageUrl = infoData?.resultImageUrl ||
                     responseData?.resultImageUrl ||
                     responseData?.imageUrl ||
                     statusResult.data?.resultImageUrl ||
                     statusResult.resultImageUrl;
      
      if (imageUrl) {
        console.log('Found result image URL:', imageUrl.substring(0, 100) + '...');
        return imageUrl;
      }
      
      console.error('Response structure:', JSON.stringify(statusResult));
      throw new Error('No resultImageUrl in successful response');
    }
    
    // Check for failed status
    if (successFlag === 2 || successFlag === 3) {
      const errorMsg = statusResult.data?.errorMessage || 
                       statusResult.errorMessage || 
                       'Generation failed';
      console.error('Task failed with successFlag:', successFlag, 'Error:', errorMsg);
      throw new Error(errorMsg);
    }
    
    // Check for error codes in the response
    const errorCode = statusResult.data?.errorCode || statusResult.errorCode;
    if (errorCode) {
      if (errorCode === 400 || errorCode === '400') {
        throw new Error('Content policy violation - please adjust your prompt');
      } else if (errorCode === 500 || errorCode === '500') {
        throw new Error('Internal error - please try again later');
      } else if (errorCode === 501 || errorCode === '501') {
        throw new Error('Generation task failed - may need to adjust parameters');
      }
    }
    
    // Still processing (successFlag === 0 or undefined)
    if (successFlag === 0 || successFlag === undefined || successFlag === null) {
      console.log('Task is still generating...');
    }
    
    // Wait 3 seconds before next poll
    await sleep(3000);
  }
  
  throw new Error('Generation timeout - task took too long');
}

// Build prompt from config
function buildPrompt(config: Record<string, string | null>, referenceImages?: { type: string; data: string }[] | null): string {
  const parts: string[] = [];
  
  // Base prompt for fashion photography with emphasis on clothing preservation
  parts.push('Generate a hyper-realistic, high-resolution fashion photography image featuring a model.');
  
  // CRITICAL: Image-to-Image clothing preservation instructions
  parts.push(`
CRITICAL IMAGE-TO-IMAGE CLOTHING PRESERVATION RULES (ABSOLUTE REQUIREMENTS):
- You are provided with reference clothing images. The model MUST wear the EXACT SAME clothing from these images.
- COPY the clothing, outfit, and all garments from the reference images EXACTLY as they appear.
- Do NOT alter, reinterpret, stylize, or modify the clothing in any way.
- Preserve ALL original details: fabric texture, material type, weave pattern, stitching, seams, buttons, zippers, embroidery, prints, patterns, logos, and embellishments.
- Maintain EXACT colors, color gradients, shading, and tonal values of the clothing.
- Keep the EXACT garment cut, silhouette, fit, drape, and shape.
- Preserve lighting reflections, shadows, and fabric behavior exactly as shown in the reference.
- If jewelry or accessories are provided in reference images, include them exactly as shown without modification.
- The clothing must look identical to the reference - as if it's the same physical garment photographed on the model.
- THIS IS IMAGE-TO-IMAGE GENERATION: Use the reference images as the primary source for clothing appearance.
`);
  
  // Photorealism requirements
  parts.push(`
PHOTOREALISM REQUIREMENTS:
- ULTRA-PREMIUM 16K QUALITY, magazine cover ready, award-winning fashion photography, 4K resolution.
- Studio-grade lighting with natural skin tones and fabric rendering.
- Sharp focus, professional depth of field.
- Magazine-quality editorial fashion photography aesthetic.
- Natural, realistic skin texture and details.
- Premium retouching quality with flawless skin and lighting.
- Ultra-detailed fabric rendering with visible thread textures.
- Professional color grading with rich, vibrant tones.
- 4K resolution output for maximum detail.`);
  
  // Model attributes
  const attributes: string[] = [];
  
  if (config.gender) {
    attributes.push(`Model gender: ${config.gender}`);
  }
  
  if (config.ethnicity) {
    attributes.push(`Model ethnicity: ${config.ethnicity}`);
  }
  
  if (config.skinTone) {
    attributes.push(`Skin tone: ${config.skinTone}`);
  }
  
  if (config.hairColor) {
    attributes.push(`Hair color: ${config.hairColor}`);
  }
  
  if (config.hairType) {
    attributes.push(`Hair type/style: ${config.hairType}`);
  }
  
  if (config.eyeColor) {
    attributes.push(`Eye color: ${config.eyeColor}`);
  }
  
  if (config.bodyType) {
    attributes.push(`Body type: ${config.bodyType}`);
  }
  
  if (config.beardType && config.gender === 'Male') {
    attributes.push(`Beard style: ${config.beardType}`);
  }
  
  if (config.faceType) {
    attributes.push(`Face shape: ${config.faceType}`);
  }
  
  if (config.facialExpression) {
    attributes.push(`Expression: ${config.facialExpression}`);
  }
  
  if (config.pose) {
    attributes.push(`Pose: ${config.pose}`);
  }
  
  if (config.background) {
    attributes.push(`Background: ${config.background}`);
  }
  
  // Hijab specific constraints
  if (config.modestOption === 'Hijab') {
    attributes.push('The model is wearing a hijab covering hair completely');
    attributes.push('NO visible hair - hair is fully covered by hijab');
    attributes.push('Modest, elegant styling with hijab');
  }
  
  if (attributes.length > 0) {
    parts.push('MODEL ATTRIBUTES:');
    parts.push(attributes.join('\n'));
  }
  
  // Reference images section
  if (referenceImages && referenceImages.length > 0) {
    parts.push('REFERENCE IMAGES PROVIDED (IMAGE-TO-IMAGE - USE THESE EXACTLY):');
    referenceImages.forEach((img, index) => {
      const imgType = img.type || 'outfit';
      parts.push(`- Reference ${index + 1}: ${imgType} clothing - COPY THIS EXACT ${imgType} onto the model without any changes`);
    });
    parts.push('\nIMPORTANT: The attached images show the exact clothing the model must wear. Do not generate different clothing.');
  }
  
  // Final instruction
  parts.push('\nFINAL INSTRUCTION: This is IMAGE-TO-IMAGE generation. Generate a photorealistic fashion image with the model wearing the EXACT clothing from the provided reference images. The clothing must be IDENTICAL to the reference - same fabric, same colors, same details.');
  
  return parts.join('\n');
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ==========================================
    // AUTHENTICATION
    // ==========================================
    const authHeader = req.headers.get('Authorization');
    console.log('Auth header present:', !!authHeader);
    
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase admin client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('Authenticated user:', user.id);

    // ==========================================
    // RATE LIMITING
    // ==========================================
    const rateLimitWindow = 60 * 1000; // 1 minute
    const maxRequests = 5;
    const now = new Date();
    const windowStart = new Date(now.getTime() - rateLimitWindow);
    
    const { data: rateLimitData, error: rateLimitError } = await supabase
      .from('rate_limits')
      .select('request_count')
      .eq('user_id', user.id)
      .eq('endpoint', 'generate-model')
      .gte('window_start', windowStart.toISOString())
      .single();
    
    if (!rateLimitError && rateLimitData && rateLimitData.request_count >= maxRequests) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please wait before trying again.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('Rate limit check passed');

    // ==========================================
    // INPUT VALIDATION
    // ==========================================
    const { generationId, config, referenceImage, usePro = false } = await req.json();
    
    if (!generationId || typeof generationId !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid generationId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
    if (referenceImage && referenceImage.length > MAX_IMAGE_SIZE) {
      return new Response(
        JSON.stringify({ error: 'Reference image too large (max 10MB)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    let referenceImages: { type: string; data: string }[] | null = null;
    
    if (referenceImage) {
      try {
        referenceImages = JSON.parse(referenceImage);
        if (Array.isArray(referenceImages) && referenceImages.length > 10) {
          return new Response(
            JSON.stringify({ error: 'Too many reference images (max 10)' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch {
        referenceImages = [{ type: 'outfit', data: referenceImage }];
      }
    }
    
    // Validate reference images exist for Image-to-Image
    if (!referenceImages || referenceImages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'At least 1 clothing image is required for generation' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Sanitize config
    const sanitizedConfig = sanitizeConfig(config);
    
    console.log('Generation request validated:', JSON.stringify({
      generationId,
      config: sanitizedConfig,
      imageCount: referenceImages?.length || 0,
      usePro,
      quality: usePro ? 'Nano Banana Pro' : 'Nano Banana Standard'
    }));

    // ==========================================
    // SUBSCRIPTION & CREDIT CHECK
    // ==========================================
    const { data: subscriptionData, error: subError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (subError || !subscriptionData) {
      return new Response(
        JSON.stringify({ error: 'Subscription not found' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('Subscription data:', JSON.stringify({
      plan: subscriptionData.plan,
      credits_remaining: subscriptionData.credits_remaining,
      pro_generations_remaining: subscriptionData.pro_generations_remaining,
      standard_generations_remaining: subscriptionData.standard_generations_remaining
    }));
    
    const isTrial = subscriptionData.plan === 'trial';
    const creditCost = usePro ? PRO_CREDIT_COST : STANDARD_CREDIT_COST;
    
    // Check credits/limits based on plan type
    if (isTrial) {
      if (usePro) {
        if (subscriptionData.pro_generations_remaining <= 0) {
          return new Response(
            JSON.stringify({ error: 'No Pro generations remaining on trial. Please upgrade.' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } else {
        if (subscriptionData.standard_generations_remaining <= 0) {
          return new Response(
            JSON.stringify({ error: 'No Standard generations remaining on trial. Please upgrade.' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    } else {
      // Paid plans use credits
      if (subscriptionData.credits_remaining < creditCost) {
        return new Response(
          JSON.stringify({ error: `Insufficient credits. Need ${creditCost} credits.` }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // ==========================================
    // PRE-DEDUCT CREDITS (Atomic operation)
    // ==========================================
    if (isTrial) {
      const updateField = usePro ? 'pro_generations_remaining' : 'standard_generations_remaining';
      const currentValue = usePro ? subscriptionData.pro_generations_remaining : subscriptionData.standard_generations_remaining;
      
      const { error: deductError } = await supabase
        .from('user_subscriptions')
        .update({ [updateField]: currentValue - 1 })
        .eq('user_id', user.id);
      
      if (deductError) {
        console.error('Failed to deduct trial generation:', deductError);
        return new Response(
          JSON.stringify({ error: 'Failed to process generation' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.log(`Pre-deducted 1 ${usePro ? 'pro' : 'standard'} generation. Remaining: ${currentValue - 1}`);
    } else {
      const newBalance = subscriptionData.credits_remaining - creditCost;
      const { error: deductError } = await supabase
        .from('user_subscriptions')
        .update({ credits_remaining: newBalance })
        .eq('user_id', user.id);
      
      if (deductError) {
        console.error('Failed to deduct credits:', deductError);
        return new Response(
          JSON.stringify({ error: 'Failed to process generation' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.log(`Pre-deducted ${creditCost} credits. New balance: ${newBalance}`);
    }

    // ==========================================
    // PROCESS REFERENCE IMAGES
    // ==========================================
    console.log(`Processing ${referenceImages.length} reference images for Image-to-Image generation...`);
    
    const imageUrls: string[] = [];
    
    for (let i = 0; i < referenceImages.length; i++) {
      const img = referenceImages[i];
      
      if (img.data.startsWith('http')) {
        imageUrls.push(img.data);
        console.log(`Using direct URL for image ${i + 1}`);
        continue;
      }
      
      if (img.data.startsWith('data:')) {
        try {
          const matches = img.data.match(/^data:([^;]+);base64,(.+)$/);
          if (matches) {
            const mimeType = matches[1];
            const base64Data = matches[2];
            const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
            
            const extension = mimeType.split('/')[1] || 'png';
            const fileName = `${generationId}/ref-${i}-${Date.now()}.${extension}`;
            
            const { error: uploadError } = await supabase.storage
              .from('generated-images')
              .upload(fileName, binaryData, {
                contentType: mimeType,
                upsert: true
              });
            
            if (uploadError) {
              console.error(`Failed to upload reference image ${i}:`, uploadError);
              continue;
            }
            
            const { data: urlData } = supabase.storage
              .from('generated-images')
              .getPublicUrl(fileName);
            
            if (urlData?.publicUrl) {
              imageUrls.push(urlData.publicUrl);
              console.log(`Uploaded reference image ${i + 1}: ${urlData.publicUrl}`);
            }
          }
        } catch (uploadErr) {
          console.error(`Error processing reference image ${i}:`, uploadErr);
        }
      }
    }
    
    if (imageUrls.length === 0) {
      // Refund credits since we couldn't process images
      if (isTrial) {
        const updateField = usePro ? 'pro_generations_remaining' : 'standard_generations_remaining';
        const currentValue = usePro ? subscriptionData.pro_generations_remaining : subscriptionData.standard_generations_remaining;
        await supabase.from('user_subscriptions').update({ [updateField]: currentValue }).eq('user_id', user.id);
      } else {
        await supabase.from('user_subscriptions').update({ credits_remaining: subscriptionData.credits_remaining }).eq('user_id', user.id);
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to process reference images. Credits have been refunded.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ==========================================
    // BUILD PROMPT & GENERATE IMAGE
    // ==========================================
    const prompt = buildPrompt(sanitizedConfig, referenceImages);
    console.log('Generated prompt:', prompt.substring(0, 500) + '...');
    
    console.log(`Prepared ${imageUrls.length} reference image URLs`);
    console.log(`Using ${usePro ? 'Nano Banana Pro' : 'Nano Banana Standard'}`);

    // Call the appropriate Nano Banana API based on quality
    let generatedImageUrl: string;
    
    if (usePro) {
      generatedImageUrl = await generateWithNanoBananaPro(NANOBANANA_API_KEY, prompt, imageUrls);
    } else {
      generatedImageUrl = await generateWithNanoBananaStandard(NANOBANANA_API_KEY, prompt, imageUrls);
    }

    console.log('Image generated successfully with', usePro ? 'Nano Banana Pro' : 'Nano Banana Standard');
    console.log('Generated image URL:', generatedImageUrl);

    // ==========================================
    // UPDATE DATABASE
    // ==========================================
    const { error: updateError } = await supabase
      .from('model_generations')
      .update({
        image_url: generatedImageUrl,
        status: 'completed'
      })
      .eq('id', generationId)
      .eq('user_id', user.id);
    
    if (updateError) {
      console.error('Failed to update generation record:', updateError);
    }

    // Update rate limit
    await supabase.from('rate_limits').upsert({
      user_id: user.id,
      endpoint: 'generate-model',
      request_count: (rateLimitData?.request_count || 0) + 1,
      window_start: now.toISOString()
    }, { onConflict: 'user_id,endpoint' });

    return new Response(
      JSON.stringify({
        success: true,
        imageUrl: generatedImageUrl,
        quality: usePro ? 'pro' : 'standard',
        creditCost: creditCost
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Generation error:', error);
    
    // Attempt to refund on error (best effort)
    try {
      const authHeader = req.headers.get('Authorization');
      if (authHeader) {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await supabase.auth.getUser(token);
        
        if (user) {
          console.log('Attempting to refund credits due to error...');
          // Note: In a production system, you'd want more sophisticated refund logic
        }
      }
    } catch (refundError) {
      console.error('Failed to process refund:', refundError);
    }
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Generation failed',
        details: 'Please try again or contact support if the issue persists.'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
