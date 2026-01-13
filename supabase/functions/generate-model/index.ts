import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Nano Banana API endpoints
const NANOBANANA_BASE_URL = 'https://api.nanobananaapi.ai/api/v1/nanobanana';
const NANOBANANA_API_KEY = '8f40e3c4ec5e36d8bbe18354535318d7';

// Lovable AI Gateway for Gemini (for true virtual try-on)
const LOVABLE_AI_GATEWAY = 'https://ai.gateway.lovable.dev/v1/chat/completions';

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
  background: ['Fashion White', 'City', 'Beach', 'Forest', 'Mountain', 'Cafe', 'Snowy', 'Underwater'],
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

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Fetch image and convert to base64
async function imageUrlToBase64(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status}`);
  }
  const buffer = await response.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
  const contentType = response.headers.get('content-type') || 'image/png';
  return `data:${contentType};base64,${base64}`;
}

// Generate using Gemini 2.5 Flash Image (Nano Banana style virtual try-on)
// This model understands multi-image compositing for clothing transfer
async function generateWithGeminiTryOn(
  apiKey: string,
  clothingImageUrls: string[],
  config: Record<string, string | null>,
  supabase: any
): Promise<string> {
  console.log('Starting Gemini virtual try-on generation...');
  console.log(`Processing ${clothingImageUrls.length} clothing image(s)`);
  
  // Build the content array with clothing images and text prompt
  const contentParts: any[] = [];
  
  // Add each clothing image
  for (let i = 0; i < clothingImageUrls.length; i++) {
    try {
      const imageUrl = clothingImageUrls[i];
      console.log(`Processing clothing image ${i + 1}: ${imageUrl.substring(0, 80)}...`);
      
      // Convert URL to base64 for Gemini
      const base64Image = await imageUrlToBase64(imageUrl);
      
      contentParts.push({
        type: "image_url",
        image_url: { url: base64Image }
      });
    } catch (err) {
      console.error(`Failed to process clothing image ${i + 1}:`, err);
    }
  }
  
  if (contentParts.length === 0) {
    throw new Error('No clothing images could be processed');
  }
  
  // Build the virtual try-on prompt
  const modelDescription = buildModelDescription(config);
  
  const tryOnPrompt = `You are a professional fashion photographer AI. Generate a hyper-realistic fashion photography image.

CRITICAL TASK: VIRTUAL TRY-ON / CLOTHING TRANSFER
You are provided with clothing/outfit reference images above. Your task is to:
1. Generate a photorealistic fashion model with the specified attributes
2. The model MUST wear the EXACT clothing shown in the reference images
3. This is a VIRTUAL TRY-ON task - transfer the clothing from the reference images onto the generated model

MODEL ATTRIBUTES TO GENERATE:
${modelDescription}

CLOTHING TRANSFER RULES (ABSOLUTE REQUIREMENTS):
- The generated model MUST wear the EXACT SAME clothing from the provided reference images
- COPY the outfit EXACTLY: same fabric, same colors, same patterns, same style
- Do NOT invent new clothing or modify the outfit in any way
- Preserve ALL clothing details: texture, stitching, buttons, zippers, prints, logos
- The clothing fit should be natural on the model's body type
- Maintain the exact garment cut, silhouette, and design

PHOTOGRAPHY REQUIREMENTS:
- Ultra-realistic, magazine-quality fashion photography
- Professional studio lighting
- Sharp focus, natural skin texture
- 4K resolution quality
${config.background ? `- Background setting: ${config.background}` : '- Clean, professional background'}
${config.pose ? `- Model pose: ${config.pose}` : '- Natural, confident pose'}

OUTPUT: A single photorealistic image of the described model wearing the exact clothing from the reference images.`;

  contentParts.push({
    type: "text",
    text: tryOnPrompt
  });
  
  console.log('Sending request to Gemini for virtual try-on...');
  
  const response = await fetch(LOVABLE_AI_GATEWAY, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
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
    throw new Error(`Gemini API failed: ${response.status}`);
  }
  
  const result = await response.json();
  console.log('Gemini response received');
  
  // Extract the generated image
  const generatedImage = result.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  
  if (!generatedImage) {
    console.error('No image in Gemini response:', JSON.stringify(result).substring(0, 500));
    throw new Error('No image generated by Gemini');
  }
  
  console.log('Generated image received (base64), uploading to storage...');
  
  // Upload the base64 image to Supabase storage
  const matches = generatedImage.match(/^data:([^;]+);base64,(.+)$/);
  if (!matches) {
    throw new Error('Invalid base64 image format');
  }
  
  const mimeType = matches[1];
  const base64Data = matches[2];
  const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
  
  const extension = mimeType.split('/')[1] || 'png';
  const fileName = `generated/${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`;
  
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
  
  const { data: urlData } = supabase.storage
    .from('generated-images')
    .getPublicUrl(fileName);
  
  if (!urlData?.publicUrl) {
    throw new Error('Failed to get public URL for generated image');
  }
  
  console.log('Generated image uploaded:', urlData.publicUrl);
  return urlData.publicUrl;
}

// Build model description from config
function buildModelDescription(config: Record<string, string | null>): string {
  const parts: string[] = [];
  
  if (config.gender) parts.push(`Gender: ${config.gender}`);
  if (config.ethnicity) parts.push(`Ethnicity: ${config.ethnicity}`);
  if (config.skinTone) parts.push(`Skin tone: ${config.skinTone}`);
  if (config.hairColor) parts.push(`Hair color: ${config.hairColor}`);
  if (config.hairType) parts.push(`Hair style: ${config.hairType}`);
  if (config.eyeColor) parts.push(`Eye color: ${config.eyeColor}`);
  if (config.bodyType) parts.push(`Body type: ${config.bodyType}`);
  if (config.faceType) parts.push(`Face shape: ${config.faceType}`);
  if (config.facialExpression) parts.push(`Expression: ${config.facialExpression}`);
  if (config.beardType && config.gender === 'Male') parts.push(`Beard: ${config.beardType}`);
  
  if (config.modestOption === 'Hijab') {
    parts.push('Wearing hijab (hair fully covered)');
  }
  
  return parts.join('\n');
}

// Fallback: Use Nano Banana Standard API
async function generateWithNanoBananaStandard(
  apiKey: string,
  prompt: string,
  imageUrls: string[]
): Promise<string> {
  console.log('Fallback: Starting Nano Banana Standard generation...');
  
  const requestBody: Record<string, any> = {
    prompt: prompt,
    type: 'IMAGETOIAMGE',
    numImages: 1,
    imageUrls: imageUrls
  };
  
  const generateResponse = await fetch(`${NANOBANANA_BASE_URL}/generate`, {
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
    throw new Error(`Generation failed: ${generateResult.msg || 'Unknown error'}`);
  }
  
  const taskId = generateResult.data?.taskId;
  if (!taskId) {
    throw new Error('No taskId returned');
  }
  
  console.log(`Task ID: ${taskId}, polling...`);
  return await pollForTaskCompletion(apiKey, taskId);
}

async function pollForTaskCompletion(apiKey: string, taskId: string): Promise<string> {
  const maxWaitTime = 300000;
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
        console.log('Found result image URL');
        return imageUrl;
      }
      throw new Error('No resultImageUrl in response');
    }
    
    if (successFlag === 2 || successFlag === 3) {
      throw new Error(statusResult.data?.errorMessage || 'Generation failed');
    }
    
    await sleep(3000);
  }
  
  throw new Error('Generation timeout');
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
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
    
    // Check credits
    if (isTrial) {
      if (usePro && subscriptionData.pro_generations_remaining <= 0) {
        return new Response(
          JSON.stringify({ error: 'No Pro generations remaining' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (!usePro && subscriptionData.standard_generations_remaining <= 0) {
        return new Response(
          JSON.stringify({ error: 'No Standard generations remaining' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else if (subscriptionData.credits_remaining < creditCost) {
      return new Response(
        JSON.stringify({ error: `Insufficient credits. Need ${creditCost} credits.` }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Pre-deduct credits
    if (isTrial) {
      const field = usePro ? 'pro_generations_remaining' : 'standard_generations_remaining';
      const value = usePro ? subscriptionData.pro_generations_remaining : subscriptionData.standard_generations_remaining;
      await supabase.from('user_subscriptions').update({ [field]: value - 1 }).eq('user_id', user.id);
      console.log(`Pre-deducted 1 ${usePro ? 'pro' : 'standard'} generation`);
    } else {
      const newBalance = subscriptionData.credits_remaining - creditCost;
      await supabase.from('user_subscriptions').update({ credits_remaining: newBalance }).eq('user_id', user.id);
      console.log(`Pre-deducted ${creditCost} credits. New balance: ${newBalance}`);
    }

    // Process clothing images - upload to storage to get URLs
    const imageUrls: string[] = [];
    
    for (let i = 0; i < referenceImages.length; i++) {
      const img = referenceImages[i];
      
      if (img.data.startsWith('http')) {
        imageUrls.push(img.data);
        console.log(`Direct URL for image ${i + 1}`);
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
              .upload(fileName, binaryData, { contentType: mimeType, upsert: true });
            
            if (uploadError) {
              console.error(`Failed to upload image ${i}:`, uploadError);
              continue;
            }
            
            const { data: urlData } = supabase.storage
              .from('generated-images')
              .getPublicUrl(fileName);
            
            if (urlData?.publicUrl) {
              imageUrls.push(urlData.publicUrl);
              console.log(`Uploaded clothing image ${i + 1}: ${urlData.publicUrl}`);
            }
          }
        } catch (err) {
          console.error(`Error processing image ${i}:`, err);
        }
      }
    }
    
    if (imageUrls.length === 0) {
      // Refund
      if (isTrial) {
        const field = usePro ? 'pro_generations_remaining' : 'standard_generations_remaining';
        const value = usePro ? subscriptionData.pro_generations_remaining : subscriptionData.standard_generations_remaining;
        await supabase.from('user_subscriptions').update({ [field]: value }).eq('user_id', user.id);
      } else {
        await supabase.from('user_subscriptions').update({ credits_remaining: subscriptionData.credits_remaining }).eq('user_id', user.id);
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to process clothing images' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Ready to generate with ${imageUrls.length} clothing image(s)`);
    console.log(`Quality: ${usePro ? 'Pro' : 'Standard'}`);

    let generatedImageUrl: string;
    
    // Use Gemini for proper virtual try-on (clothing transfer)
    if (lovableApiKey) {
      try {
        console.log('Using Gemini for virtual try-on...');
        generatedImageUrl = await generateWithGeminiTryOn(lovableApiKey, imageUrls, sanitizedConfig, supabase);
      } catch (geminiError) {
        console.error('Gemini generation failed:', geminiError);
        // Fallback to Nano Banana
        console.log('Falling back to Nano Banana...');
        const fallbackPrompt = buildFallbackPrompt(sanitizedConfig, referenceImages);
        generatedImageUrl = await generateWithNanoBananaStandard(NANOBANANA_API_KEY, fallbackPrompt, imageUrls);
      }
    } else {
      // No Lovable API key, use Nano Banana directly
      console.log('Using Nano Banana (no Lovable API key)...');
      const fallbackPrompt = buildFallbackPrompt(sanitizedConfig, referenceImages);
      generatedImageUrl = await generateWithNanoBananaStandard(NANOBANANA_API_KEY, fallbackPrompt, imageUrls);
    }

    console.log('Generation successful:', generatedImageUrl);

    // Update database
    await supabase
      .from('model_generations')
      .update({ image_url: generatedImageUrl, status: 'completed' })
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
        imageUrl: generatedImageUrl,
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

function buildFallbackPrompt(config: Record<string, string | null>, referenceImages: { type: string; data: string }[]): string {
  const parts: string[] = [];
  
  parts.push('VIRTUAL TRY-ON TASK: Generate a fashion model wearing the EXACT clothing from the provided images.');
  parts.push('');
  parts.push('CRITICAL: The model MUST wear the SAME outfit shown in the input images. Do NOT create new clothing.');
  parts.push('');
  
  parts.push('MODEL ATTRIBUTES:');
  if (config.gender) parts.push(`- Gender: ${config.gender}`);
  if (config.ethnicity) parts.push(`- Ethnicity: ${config.ethnicity}`);
  if (config.skinTone) parts.push(`- Skin tone: ${config.skinTone}`);
  if (config.hairColor) parts.push(`- Hair color: ${config.hairColor}`);
  if (config.hairType) parts.push(`- Hair style: ${config.hairType}`);
  if (config.eyeColor) parts.push(`- Eye color: ${config.eyeColor}`);
  if (config.bodyType) parts.push(`- Body type: ${config.bodyType}`);
  if (config.pose) parts.push(`- Pose: ${config.pose}`);
  if (config.background) parts.push(`- Background: ${config.background}`);
  
  if (config.modestOption === 'Hijab') {
    parts.push('- Wearing hijab (hair fully covered)');
  }
  
  parts.push('');
  parts.push('CLOTHING REQUIREMENTS:');
  parts.push('- Transfer the EXACT clothing from reference images onto the model');
  parts.push('- Preserve all fabric details, colors, patterns, and design');
  parts.push('- Do NOT modify or replace the outfit');
  
  parts.push('');
  parts.push('OUTPUT: Ultra-realistic fashion photography, magazine quality, 4K resolution.');
  
  return parts.join('\n');
}
