import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Nano Banana API endpoints - ONLY API used for image generation
const NANOBANANA_BASE_URL = 'https://api.nanobananaapi.ai/api/v1/nanobanana';

// Credit costs
const STANDARD_CREDIT_COST = 1;
const PRO_CREDIT_COST = 4;

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
  background: ['Fashion White', 'City', 'Beach', 'Forest', 'Mountain', 'Cafe', 'Snowy', 'Underwater', 'Home'],
  faceType: ['Oval', 'Round', 'Square', 'Heart', 'Oblong', 'Diamond'],
  facialExpression: ['Neutral', 'Smile', 'Serious', 'Confident'],
  modestOption: ['Standard', 'Hijab', null]
};

function sanitizeConfigValue(key: string, value: any): string | null {
  if (value === null || value === undefined) return null;
  const strValue = String(value).slice(0, 50);
  const allowedList = ALLOWED_VALUES[key as keyof typeof ALLOWED_VALUES];
  if (allowedList && !allowedList.includes(strValue) && strValue !== '') {
    console.warn(`Invalid value for ${key}: ${strValue}`);
    return null;
  }
  return strValue;
}

function sanitizeAge(age: any): number {
  if (age === null || age === undefined) return 25;
  const numAge = Number(age);
  if (isNaN(numAge) || numAge < 18 || numAge > 60) return 25;
  return Math.round(numAge);
}

function sanitizeConfig(config: any): Record<string, string | number | null> {
  return {
    gender: sanitizeConfigValue('gender', config?.gender),
    age: sanitizeAge(config?.age),
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

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Poll Nano Banana for task completion with a time limit
async function pollForTaskCompletion(apiKey: string, taskId: string, maxWaitMs: number = 120000): Promise<string | null> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWaitMs) {
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
  
  // Return null instead of throwing - means still processing
  console.log('Polling time limit reached, task still processing');
  return null;
}

// Generate using Nano Banana API - returns { imageUrl, taskId }
async function generateWithNanoBanana(
  apiKey: string,
  prompt: string,
  imageUrls: string[],
  usePro: boolean
): Promise<{ imageUrl: string | null; taskId: string }> {
  console.log(`Starting Nano Banana ${usePro ? 'Pro' : 'Standard'} generation...`);
  
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
  
  // For standard, poll up to 120s. For pro, poll up to 60s then let frontend continue polling.
  const pollTime = usePro ? 60000 : 120000;
  const imageUrl = await pollForTaskCompletion(apiKey, taskId, pollTime);
  
  return { imageUrl, taskId };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
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
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('Authenticated user:', user.id);

    // Rate limiting
    const rateLimitWindow = 60 * 1000;
    const maxRequests = 5;
    const now = new Date();
    const windowStart = new Date(now.getTime() - rateLimitWindow);
    
    const { data: rateLimitData } = await supabase
      .from('rate_limits')
      .select('request_count')
      .eq('user_id', user.id)
      .eq('endpoint', 'generate-model')
      .gte('window_start', windowStart.toISOString())
      .single();
    
    if (rateLimitData && rateLimitData.request_count >= maxRequests) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { generationId, config, referenceImage, usePro = false } = await req.json();
    
    if (!generationId || typeof generationId !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid generationId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Parse reference images - REQUIRED for virtual try-on
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
    
    // CRITICAL: Generation MUST fail if no clothing image is uploaded
    if (!referenceImages || referenceImages.length === 0) {
      console.error('BLOCKED: No clothing images provided');
      return new Response(
        JSON.stringify({ error: 'At least 1 clothing image is required for generation' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Received ${referenceImages.length} clothing image(s) for virtual try-on`);
    
    const sanitizedConfig = sanitizeConfig(config);
    console.log('Config:', JSON.stringify(sanitizedConfig));

    // Subscription check
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
    
    const isTrial = subscriptionData.plan === 'trial';
    const creditCost = usePro ? PRO_CREDIT_COST : STANDARD_CREDIT_COST;
    
    // Determine credit source: trial generations first, then credits_remaining as fallback
    let useTrialGenerations = false;
    let useCredits = false;
    
    if (isTrial) {
      // First try trial-specific generations
      if (usePro && subscriptionData.pro_generations_remaining > 0) {
        useTrialGenerations = true;
      } else if (!usePro && subscriptionData.standard_generations_remaining > 0) {
        useTrialGenerations = true;
      }
      // Fallback: check credits_remaining (admin-added credits)
      else if (subscriptionData.credits_remaining >= creditCost) {
        useCredits = true;
      } else {
        const errorMsg = usePro ? 'No Pro generations remaining' : 'No Standard generations remaining';
        return new Response(
          JSON.stringify({ error: errorMsg }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      if (subscriptionData.credits_remaining >= creditCost) {
        useCredits = true;
      } else {
        return new Response(
          JSON.stringify({ error: `Insufficient credits. Need ${creditCost} credits.` }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Pre-deduct credits based on source
    if (useTrialGenerations) {
      const field = usePro ? 'pro_generations_remaining' : 'standard_generations_remaining';
      const value = usePro ? subscriptionData.pro_generations_remaining : subscriptionData.standard_generations_remaining;
      await supabase.from('user_subscriptions').update({ [field]: value - 1 }).eq('user_id', user.id);
      console.log(`Pre-deducted 1 ${usePro ? 'pro' : 'standard'} trial generation`);
    } else if (useCredits) {
      const newBalance = subscriptionData.credits_remaining - creditCost;
      await supabase.from('user_subscriptions').update({ credits_remaining: newBalance }).eq('user_id', user.id);
      console.log(`Pre-deducted ${creditCost} credits. New balance: ${newBalance}`);
    }

    // Upload base64 images to storage and get signed URLs for Nano Banana
    const imageUrls: string[] = [];
    
    for (let i = 0; i < referenceImages.length; i++) {
      const img = referenceImages[i];
      
      if (img.data.startsWith('data:')) {
        // Upload base64 to storage
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
              .upload(fileName, binaryData, { contentType: mimeType, upsert: true });
            
            if (!uploadError) {
              const { data: signedData } = await supabase.storage
                .from('generated-images')
                .createSignedUrl(fileName, 60 * 60); // 1 hour
              
              if (signedData?.signedUrl) {
                imageUrls.push(signedData.signedUrl);
                console.log(`Uploaded clothing image ${i + 1} with signed URL`);
              }
            } else {
              console.error(`Error uploading image ${i}:`, uploadError);
            }
          }
        } catch (err) {
          console.error(`Error processing image ${i}:`, err);
        }
      } else if (img.data.startsWith('http')) {
        // Already a URL, use directly
        imageUrls.push(img.data);
        console.log(`Using existing URL for image ${i + 1}`);
      }
    }
    
    if (imageUrls.length === 0) {
      // Refund credits based on deduction source
      if (useTrialGenerations) {
        const field = usePro ? 'pro_generations_remaining' : 'standard_generations_remaining';
        const value = usePro ? subscriptionData.pro_generations_remaining : subscriptionData.standard_generations_remaining;
        await supabase.from('user_subscriptions').update({ [field]: value }).eq('user_id', user.id);
      } else if (useCredits) {
        await supabase.from('user_subscriptions').update({ credits_remaining: subscriptionData.credits_remaining }).eq('user_id', user.id);
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to process clothing images' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Ready: ${imageUrls.length} image URLs for Nano Banana`);
    console.log(`Quality: ${usePro ? 'Pro' : 'Standard'}`);

    // Build prompt and generate with Nano Banana
    const prompt = buildPrompt(sanitizedConfig);
    const result = await generateWithNanoBanana(nanoBananaApiKey, prompt, imageUrls, usePro);

    if (result.imageUrl === null) {
      // Generation still processing - return taskId for frontend polling
      console.log('Generation still processing, returning taskId for polling:', result.taskId);
      return new Response(
        JSON.stringify({
          success: true,
          status: 'processing',
          taskId: result.taskId,
          generationId: generationId,
          quality: usePro ? 'pro' : 'standard',
          creditCost
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Nano Banana generation successful:', result.imageUrl);

    // Update database
    await supabase
      .from('model_generations')
      .update({ image_url: result.imageUrl, status: 'completed' })
      .eq('id', generationId)
      .eq('user_id', user.id);

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
        status: 'completed',
        imageUrl: result.imageUrl,
        quality: usePro ? 'pro' : 'standard',
        creditCost
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Generation error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Generation failed'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Build prompt for Nano Banana (MUST stay under 5000 chars)
function buildPrompt(config: Record<string, string | number | null>): string {
  const parts: string[] = [];
  
  const isPortraitPose = config.pose === 'Face Close-up';
  const isHijabModel = config.modestOption === 'Hijab';
  
  if (isHijabModel) {
    parts.push('VIRTUAL TRY-ON: Generate a modest hijabi female model wearing the EXACT clothing from the input images. High-end editorial fashion photography, premium brand aesthetic, real human model with natural skin texture.');
    parts.push('');
    parts.push('HIJAB REQUIREMENTS: Hijab MUST fully cover ALL hair, no hair visible. Neck fully covered. No cleavage, no transparent fabric, no tight clothing. Only face and hands may show skin. Loose fit, conservative but stylish.');
    parts.push('');
    parts.push('MODEL:');
    if (config.ethnicity) parts.push(`- Ethnicity: ${config.ethnicity}`);
    if (config.skinTone) parts.push(`- Skin tone: ${config.skinTone}`);
    if (config.eyeColor) parts.push(`- Eye color: ${config.eyeColor}`);
    if (config.bodyType) parts.push(`- Body type: ${config.bodyType}`);
    if (config.faceType) parts.push(`- Face shape: ${config.faceType}`);
    if (config.facialExpression) parts.push(`- Expression: ${config.facialExpression}`);
    if (isPortraitPose) {
      parts.push('- Pose: Face close-up portrait, 3/4 angle');
    } else {
      parts.push(`- Pose: ${config.pose || 'Full-body standing, head to feet visible'}`);
    }
    if (config.background) parts.push(`- Background: ${config.background}`);
  } else {
    parts.push('VIRTUAL TRY-ON: Generate a fashion model wearing the EXACT clothing from the input images. High-end editorial fashion photography, premium brand aesthetic, real human model with natural skin texture, slight 3/4 camera angle, soft key light, DSLR shallow depth of field.');
    parts.push('');
    parts.push('MODEL:');
    if (config.gender) parts.push(`- Gender: ${config.gender}`);
    if (config.ethnicity) parts.push(`- Ethnicity: ${config.ethnicity}`);
    if (config.skinTone) parts.push(`- Skin tone: ${config.skinTone}`);
    if (config.hairColor) parts.push(`- Hair color: ${config.hairColor}`);
    if (config.hairType) parts.push(`- Hair style: ${config.hairType}`);
    if (config.eyeColor) parts.push(`- Eye color: ${config.eyeColor}`);
    if (config.bodyType) parts.push(`- Body type: ${config.bodyType}`);
    if (config.faceType) parts.push(`- Face shape: ${config.faceType}`);
    if (config.facialExpression) parts.push(`- Expression: ${config.facialExpression}`);
    if (config.beardType && config.gender === 'Male') parts.push(`- Beard: ${config.beardType}`);
    if (isPortraitPose) {
      parts.push('- Pose: Face close-up portrait, 3/4 angle');
    } else {
      parts.push(`- Pose: ${config.pose || 'Full-body standing, head to feet visible'}`);
    }
    if (config.background) parts.push(`- Background: ${config.background}`);
  }
  
  parts.push('');
  parts.push('RULES: Product shape/color/texture/pattern MUST be 100% unchanged from input. No redesign. Preserve exact fabric details.');
  
  if (!isPortraitPose) {
    parts.push('FRAMING: FULL-BODY shot, head to feet visible, vertical 9:16, no cropping.');
  } else {
    parts.push('FRAMING: Portrait close-up, vertical 9:16.');
  }
  
  parts.push('AVOID: flat angle, stiff pose, plastic skin, AI artifacts, distorted proportions, deformed hands, stock photo look.');
  parts.push('OUTPUT: Ultra-realistic editorial fashion photography, 9:16 vertical.');
  
  const result = parts.join('\n');
  
  // Safety: truncate to 4900 chars max
  if (result.length > 4900) {
    console.warn(`Prompt too long (${result.length} chars), truncating to 4900`);
    return result.substring(0, 4900);
  }
  
  console.log(`Prompt length: ${result.length} chars`);
  return result;
}
