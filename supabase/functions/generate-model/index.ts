import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Nano Banana API Configuration
const NANOBANANA_BASE_URL = 'https://api.nanobananaapi.ai/api/v1/nanobanana';

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

// Generate image using Nano Banana API (Image-to-Image with task polling)
async function generateWithNanoBanana(
  apiKey: string,
  prompt: string,
  imageUrls: string[],
  usePro: boolean
): Promise<string> {
  const quality = usePro ? 'pro' : 'standard';
  console.log(`Starting Nano Banana ${quality} image generation...`);
  console.log(`Image-to-Image mode with ${imageUrls.length} reference image(s)`);
  
  // Build request body for Image-to-Image mode
  // API uses "IMAGETOIAMGE" (intentional typo in API)
  const requestBody: Record<string, any> = {
    prompt: prompt,
    type: 'IMAGETOIAMGE', // Note: API has typo - IAMGE not IMAGE
    numImages: 1,
    imageUrls: imageUrls, // Required for Image-to-Image
    quality: quality // Pass quality parameter for Pro vs Standard
  };
  
  console.log('Nano Banana request body (Image-to-Image mode):', JSON.stringify({
    type: requestBody.type,
    numImages: requestBody.numImages,
    quality: requestBody.quality,
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
  console.log('Nano Banana generate response:', JSON.stringify(generateResult));
  
  if (!generateResponse.ok || generateResult.code !== 200) {
    throw new Error(`Generation failed: ${generateResult.msg || generateResult.message || 'Unknown error'}`);
  }
  
  const taskId = generateResult.data?.taskId;
  if (!taskId) {
    throw new Error('No taskId returned from Nano Banana API');
  }
  
  console.log(`Task created with ID: ${taskId}. Polling for completion...`);
  
  // Poll for completion (max 5 minutes)
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
    
    // Handle NanoBanana Pro response structure: { code, msg, data: { taskId, info: { resultImageUrl } } }
    const code = statusResult.code;
    const successFlag = statusResult.successFlag ?? statusResult.data?.successFlag ?? statusResult.data?.status;
    
    console.log(`Task status check: code=${code}, successFlag=${successFlag}`);
    
    // Check for completed status (code 200 for NanoBanana Pro)
    if (code === 200) {
      console.log('Generation completed successfully!');
      
      // NanoBanana Pro structure: data.info.resultImageUrl
      let imageUrl = statusResult.data?.info?.resultImageUrl;
      
      // Fallback to other possible locations
      if (!imageUrl) {
        imageUrl = statusResult.data?.resultImageUrl || 
                   statusResult.data?.imageUrl || 
                   statusResult.response?.resultImageUrl ||
                   statusResult.resultImageUrl;
      }
      
      if (imageUrl) {
        console.log('Found result image URL');
        return imageUrl;
      }
      
      console.error('Response structure:', JSON.stringify(statusResult));
      throw new Error('No resultImageUrl in successful response');
    }
    
    // Check for NanoBanana Pro error codes
    if (code === 400) {
      throw new Error('Content policy violation - please adjust your prompt');
    } else if (code === 500) {
      throw new Error('Internal error - please try again later');
    } else if (code === 501) {
      throw new Error('Generation task failed - may need to adjust parameters');
    }
    
    // Check for legacy failed status
    if (successFlag === 2 || successFlag === 3) {
      throw new Error(statusResult.errorMessage || statusResult.data?.errorMessage || 'Generation failed');
    }
    
    // Check if still generating (successFlag 0 or 1, or code not 200 yet)
    if (successFlag === 0 || successFlag === 1 || code === undefined) {
      console.log('Task is still generating...');
    } else {
      console.log('Unknown status, continuing to poll...');
    }
    
    // Wait 3 seconds before next poll
    await sleep(3000);
  }
  
  throw new Error('Generation timeout - exceeded 5 minutes');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ==========================================
    // AUTHENTICATION - Verify JWT token
    // ==========================================
    const authHeader = req.headers.get('Authorization');
    console.log('Auth header present:', !!authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Missing or invalid Authorization header');
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Extract token and use getUser with JWT
    const token = authHeader.replace('Bearer ', '');
    
    // Create admin client and verify the user using the token
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      console.error('Authentication error:', userError?.message || 'No user found');
      return new Response(
        JSON.stringify({ error: 'Invalid authentication', details: userError?.message }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const authenticatedUserId = user.id;
    console.log('Authenticated user:', authenticatedUserId);

    // ==========================================
    // RATE LIMITING - Prevent abuse
    // ==========================================
    const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
    const MAX_REQUESTS_PER_WINDOW = 5;
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
    
    // Check recent requests in rate_limits table
    const { data: rateLimitData, error: rateLimitError } = await supabaseAdmin
      .from('rate_limits')
      .select('request_count, window_start')
      .eq('user_id', authenticatedUserId)
      .eq('endpoint', 'generate-model')
      .gte('window_start', windowStart)
      .order('window_start', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (rateLimitError) {
      console.error('Rate limit check error:', rateLimitError);
    }
    
    const currentMinuteWindow = new Date(Math.floor(Date.now() / 60000) * 60000).toISOString();
    
    if (rateLimitData && rateLimitData.window_start === currentMinuteWindow) {
      if (rateLimitData.request_count >= MAX_REQUESTS_PER_WINDOW) {
        console.warn(`Rate limit exceeded for user ${authenticatedUserId}`);
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please wait a moment before trying again.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      await supabaseAdmin
        .from('rate_limits')
        .update({ request_count: rateLimitData.request_count + 1 })
        .eq('user_id', authenticatedUserId)
        .eq('endpoint', 'generate-model')
        .eq('window_start', currentMinuteWindow);
    } else {
      await supabaseAdmin
        .from('rate_limits')
        .upsert({
          user_id: authenticatedUserId,
          endpoint: 'generate-model',
          window_start: currentMinuteWindow,
          request_count: 1
        }, { onConflict: 'user_id,endpoint,window_start' });
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
    
    const sanitizedConfig = sanitizeConfig(config);
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // ==========================================
    // VERIFY GENERATION OWNERSHIP
    // ==========================================
    const { data: generation, error: genError } = await supabase
      .from('model_generations')
      .select('user_id')
      .eq('id', generationId)
      .single();
    
    if (genError || !generation) {
      return new Response(
        JSON.stringify({ error: 'Generation not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (generation.user_id !== authenticatedUserId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized access to generation' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // ==========================================
    // SUBSCRIPTION & CREDIT VERIFICATION
    // ==========================================
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select('plan, credits_remaining, pro_generations_remaining, standard_generations_remaining')
      .eq('user_id', authenticatedUserId)
      .single();
    
    if (subError || !subscription) {
      console.error('Subscription check error:', subError);
      return new Response(
        JSON.stringify({ error: 'Unable to verify subscription' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('Subscription data:', subscription);
    
    const isTrial = subscription.plan === 'trial';
    const isPaid = ['starter', 'pro', 'creator'].includes(subscription.plan);
    
    // Trial package rules
    if (isTrial) {
      if (usePro) {
        if (subscription.pro_generations_remaining <= 0) {
          console.error('Trial Pro generations exhausted');
          return new Response(
            JSON.stringify({ error: 'Deneme Pro üretim hakkınız dolmuştur' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } else {
        if (subscription.standard_generations_remaining <= 0) {
          console.error('Trial Standard generations exhausted');
          return new Response(
            JSON.stringify({ error: 'Deneme görsel üretim hakkınız dolmuştur' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }
    
    // Paid package rules - Pro uses 8 credits, Standard uses 1
    if (isPaid) {
      const requiredCredits = usePro ? PRO_CREDIT_COST : STANDARD_CREDIT_COST;
      if (subscription.credits_remaining < requiredCredits) {
        const errorMsg = usePro 
          ? `Pro görsel için yeterli krediniz yok (${PRO_CREDIT_COST} kredi gerekli)` 
          : 'Yetersiz kredi';
        console.error(`Insufficient credits: has ${subscription.credits_remaining}, needs ${requiredCredits}`);
        return new Response(
          JSON.stringify({ error: errorMsg }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    // ==========================================
    // ATOMIC PRE-DEDUCTION
    // ==========================================
    if (isTrial) {
      const updateField = usePro ? 'pro_generations_remaining' : 'standard_generations_remaining';
      const currentValue = usePro ? subscription.pro_generations_remaining : subscription.standard_generations_remaining;
      
      const { error: decrementError } = await supabase
        .from('user_subscriptions')
        .update({ [updateField]: currentValue - 1 })
        .eq('user_id', authenticatedUserId)
        .eq(updateField, currentValue);
      
      if (decrementError) {
        console.error('Error decrementing trial generations:', decrementError);
        return new Response(
          JSON.stringify({ error: 'Failed to reserve generation. Please try again.' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.log(`Pre-decremented ${updateField} for trial user. New value: ${currentValue - 1}`);
    } else if (isPaid) {
      const requiredCredits = usePro ? PRO_CREDIT_COST : STANDARD_CREDIT_COST;
      const newBalance = subscription.credits_remaining - requiredCredits;
      
      const { error: decrementError } = await supabase
        .from('user_subscriptions')
        .update({ credits_remaining: newBalance })
        .eq('user_id', authenticatedUserId)
        .eq('credits_remaining', subscription.credits_remaining);
      
      if (decrementError) {
        console.error('Error decrementing credits:', decrementError);
        return new Response(
          JSON.stringify({ error: 'Failed to deduct credits. Please try again.' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.log(`Pre-deducted ${requiredCredits} credits. New balance: ${newBalance}`);
    }
    
    console.log('Generation request validated:', { 
      generationId, 
      config: sanitizedConfig, 
      imageCount: referenceImages?.length || 0,
      usePro,
      quality: usePro ? 'Nano Banana Pro' : 'Nano Banana Standard'
    });

    // Build the prompt
    const prompt = buildPrompt(sanitizedConfig, referenceImages, usePro);
    console.log('Generated prompt:', prompt.substring(0, 500) + '...');

    // Get NanoBanana API key
    const apiKey = Deno.env.get('NANOBANANA_API_KEY');
    
    if (!apiKey) {
      console.error('NANOBANANA_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'NanoBanana API key not configured. Please add NANOBANANA_API_KEY secret.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // CRITICAL: Enforce Image-to-Image only
    if (!referenceImages || referenceImages.length === 0) {
      console.error('No reference images provided - Image-to-Image mode required');
      return new Response(
        JSON.stringify({ error: 'Model oluşturmak için en az 1 adet kıyafet görseli yüklemeniz gerekmektedir.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
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
      console.error('Failed to process any reference images');
      return new Response(
        JSON.stringify({ error: 'Kıyafet görselleri işlenemedi. Lütfen tekrar deneyin.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Prepared ${imageUrls.length} reference image URLs`);
    console.log(`Using ${usePro ? 'Nano Banana Pro' : 'Nano Banana Standard'}`);

    // Call Nano Banana API
    const generatedImageUrl = await generateWithNanoBanana(apiKey, prompt, imageUrls, usePro);

    console.log('Image generated successfully with', usePro ? 'Nano Banana Pro' : 'Nano Banana Standard');
    console.log('Generated image URL:', generatedImageUrl);

    // Update the database
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
        creditsUsed: usePro ? PRO_CREDIT_COST : STANDARD_CREDIT_COST
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
  const qualityLevel = usePro 
    ? 'ULTRA-PREMIUM 16K QUALITY, magazine cover ready, award-winning fashion photography, 4K resolution' 
    : 'Ultra-high resolution, 8K quality, professional fashion photography';

  const isHijab = config.modestOption === 'Hijab';

  const hijabInstructions = isHijab ? `
CRITICAL HIJAB REQUIREMENTS (ABSOLUTE MUST):
- The model MUST be wearing a hijab that FULLY covers ALL hair, neck, and ears.
- NO visible hair whatsoever - the hijab must completely conceal all hair.
- The hijab should be styled elegantly and professionally, covering the head entirely.
- Ears must be completely covered by the hijab fabric.
- Neck should be covered with the hijab draping down.
- The hijab style should look natural, modest, and fashion-appropriate.
- DO NOT show any strands of hair peeking out from under the hijab.
` : '';

  const staticBasePrompt = `
Generate a hyper-realistic, high-resolution fashion photography image featuring a model.
${hijabInstructions}
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

PHOTOREALISM REQUIREMENTS:
- ${qualityLevel}.
- Studio-grade lighting with natural skin tones and fabric rendering.
- Sharp focus, professional depth of field.
- Magazine-quality editorial fashion photography aesthetic.
- Natural, realistic skin texture and details.
${usePro ? '- Premium retouching quality with flawless skin and lighting.\n- Ultra-detailed fabric rendering with visible thread textures.\n- Professional color grading with rich, vibrant tones.\n- 4K resolution output for maximum detail.' : ''}
`.trim();

  const dynamicFilters: string[] = [];
  
  if (config.gender) dynamicFilters.push(`Model gender: ${config.gender}`);
  if (config.ethnicity) dynamicFilters.push(`Model ethnicity: ${config.ethnicity}`);
  if (config.skinTone) dynamicFilters.push(`Skin tone: ${config.skinTone}`);
  
  if (!isHijab) {
    if (config.hairColor) dynamicFilters.push(`Hair color: ${config.hairColor}`);
    if (config.hairType) dynamicFilters.push(`Hair type/style: ${config.hairType}`);
  }
  
  if (config.eyeColor) dynamicFilters.push(`Eye color: ${config.eyeColor}`);
  if (config.faceType) dynamicFilters.push(`Face shape: ${config.faceType}`);
  if (config.facialExpression) dynamicFilters.push(`Facial expression: ${config.facialExpression}`);
  if (config.beardType) dynamicFilters.push(`Facial hair: ${config.beardType}`);
  if (config.bodyType) dynamicFilters.push(`Body type: ${config.bodyType}`);
  if (config.pose) dynamicFilters.push(`Pose: ${config.pose}`);
  if (config.background) dynamicFilters.push(`Background: ${config.background}`);
  
  if (isHijab) {
    dynamicFilters.push(`Head covering: Wearing elegant hijab that fully covers all hair, neck, and ears - NO visible hair`);
  }

  const referenceSection = referenceImages && referenceImages.length > 0
    ? `\nREFERENCE IMAGES PROVIDED (IMAGE-TO-IMAGE - USE THESE EXACTLY):\n${referenceImages.map((img, i) => `- Reference ${i + 1}: ${img.type} clothing - COPY THIS EXACT outfit onto the model without any changes`).join('\n')}\n\nIMPORTANT: The attached images show the exact clothing the model must wear. Do not generate different clothing.`
    : '';

  const filtersSection = dynamicFilters.length > 0
    ? `\nMODEL ATTRIBUTES:\n${dynamicFilters.join('\n')}`
    : '';

  const hijabFinalReminder = isHijab 
    ? ' IMPORTANT: Model must wear a hijab covering all hair, neck and ears completely.' 
    : '';

  return `${staticBasePrompt}${filtersSection}${referenceSection}\n\nFINAL INSTRUCTION: This is IMAGE-TO-IMAGE generation. Generate a photorealistic fashion image with the model wearing the EXACT clothing from the provided reference images. The clothing must be IDENTICAL to the reference - same fabric, same colors, same details.${hijabFinalReminder}`;
}
