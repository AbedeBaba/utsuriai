import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Nano Banana API endpoints
const NANOBANANA_BASE_URL = 'https://api.nanobananaapi.ai/api/v1/nanobanana';
const NANOBANANA_API_KEY = '8f40e3c4ec5e36d8bbe18354535318d7';

// Lovable AI Gateway for Gemini
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

// Generate using Gemini 2.5 Flash Image for virtual try-on
// Takes base64 images directly to avoid URL fetching issues
async function generateWithGeminiTryOn(
  apiKey: string,
  clothingBase64Images: string[], // Already base64 encoded
  config: Record<string, string | null>,
  supabase: any
): Promise<string> {
  console.log('Starting Gemini virtual try-on generation...');
  console.log(`Processing ${clothingBase64Images.length} clothing image(s)`);
  
  // Build the content array with clothing images and text prompt
  const contentParts: any[] = [];
  
  // Add each clothing image directly as base64
  for (let i = 0; i < clothingBase64Images.length; i++) {
    const base64Image = clothingBase64Images[i];
    console.log(`Adding clothing image ${i + 1} (base64 length: ${base64Image.length})`);
    
    contentParts.push({
      type: "image_url",
      image_url: { url: base64Image }
    });
  }
  
  if (contentParts.length === 0) {
    throw new Error('No clothing images to process');
  }
  
  // Build the virtual try-on prompt
  const modelDescription = buildModelDescription(config);
  
  // Determine if this is a portrait-only pose
  const isPortraitPose = config.pose === 'Face Close-up';
  
  // Check if this is a Hijab/modest model
  const isHijabModel = config.modestOption === 'Hijab';
  
  // Build Hijab-specific prompt sections
  const hijabPromptSection = isHijabModel ? `

CRITICAL - TESETTÜR / MODEST HIJABI MODEL REQUIREMENTS:
This is a fully modest hijabi female model for e-commerce product photography.

ABSOLUTE COVERAGE REQUIREMENTS:
- Hijab (headscarf) MUST fully cover ALL hair - NO hair visible whatsoever, not a single strand
- Neck MUST be FULLY covered by hijab fabric or high-neck clothing
- Chest and décolletage MUST be FULLY covered - absolutely NO cleavage
- Shoulders MUST be completely covered
- Arms MUST be covered with long sleeves to the wrist
- Only face and hands may show skin

MODEST FASHION STYLING:
- Modern, elegant, premium modest fashion aesthetic
- Turkey / Middle East hijab fashion style
- Loose-fitting silhouettes only
- NO Western runway or editorial styling
- Conservative but stylish modest wear

POSE & EXPRESSION FOR MODEST MODEL:
- Natural, dignified, product-focused pose
- Professional e-commerce model posture
- NO provocative or exaggerated poses
- Subtle, confident expression

NEGATIVE CONSTRAINTS (ABSOLUTELY FORBIDDEN):
- no visible hair
- no cleavage
- no open neck
- no transparent fabric
- no tight clothing
- no western fashion look
- no sheer fabric
- no body-hugging silhouettes
- no exposed shoulders
- no short sleeves
- no V-neck or low neckline
` : '';

  // Quality enhancement prompts
  const POSITIVE_PROMPT_ADDITIONS = `high-end fashion photography, editorial fashion shoot, real human model, natural skin texture, visible skin pores, soft natural lighting, diffused light, realistic shadows, premium studio or lifestyle background, clean and minimal environment, natural color grading, neutral tones, true-to-life colors, professional camera look, DSLR photography, shallow depth of field, authentic fabric texture, realistic clothing folds, relaxed and natural pose, confident posture, editorial fashion pose, candid feeling, luxury brand aesthetic, modern fashion campaign`;

  const NEGATIVE_PROMPT = `NEGATIVE PROMPT (AVOID THESE): plastic skin, overly smooth skin, artificial skin texture, waxy skin, CGI skin, doll-like face, porcelain skin, uncanny valley, over-processed face, excessive skin retouching, beauty filter look, AI-generated look, synthetic appearance, low-quality background, cheap background, blurry background, pixelated background, noisy background, flat lighting, unnatural lighting, harsh shadows, overexposed highlights, washed-out colors, unrealistic proportions, distorted anatomy, deformed hands, extra fingers, missing fingers, warped body, asymmetrical face, over-sharpening, oversaturated colors, HDR look, fake depth of field, unnatural bokeh, 3D render, game engine look, illustration style, stiff pose, robotic posture, stock photo look, artificial expression`;

  const tryOnPrompt = `You are a professional fashion photographer AI. Generate a hyper-realistic fashion photography image.

${POSITIVE_PROMPT_ADDITIONS}

CRITICAL TASK: VIRTUAL TRY-ON / CLOTHING TRANSFER
The image(s) above show clothing/outfit items. Your task is to:
1. Generate a photorealistic fashion model with the specified attributes below
2. The model MUST wear the EXACT clothing shown in the reference image(s) above
3. This is a VIRTUAL TRY-ON task - the clothing from the reference images must appear on the generated model
${hijabPromptSection}
MODEL ATTRIBUTES TO GENERATE:
${modelDescription}

CLOTHING TRANSFER RULES (ABSOLUTE REQUIREMENTS):
- The generated model MUST wear the EXACT SAME clothing from the provided reference images
- COPY the outfit EXACTLY: same fabric, same colors, same patterns, same style, same design
- Do NOT invent new clothing - use ONLY what is shown in the reference images
- Do NOT modify, change, or replace the outfit in any way
- Preserve ALL clothing details: texture, stitching, buttons, zippers, prints, logos, embroidery
- The clothing fit should look natural on the model's body
- Maintain the exact garment cut, silhouette, neckline, sleeves, and overall design

CRITICAL FRAMING REQUIREMENTS:
${isPortraitPose ? `- Portrait/face close-up shot as requested` : `- MANDATORY FULL-BODY SHOT: The model's ENTIRE body must be visible from head to toe
- DO NOT crop, zoom in, or frame as upper-body/half-body
- Show the complete figure: head, torso, arms, legs, and feet ALL visible in frame
- Use vertical 9:16 portrait orientation suitable for full-body fashion photography
- Natural full-body standing pose with feet touching or near the bottom of the frame
- Leave minimal space above the head and below the feet`}

PHOTOGRAPHY REQUIREMENTS:
- Ultra-realistic, magazine-quality fashion photography
- Professional studio lighting with soft shadows
- Sharp focus, natural skin texture, realistic fabric rendering
- High resolution output with 9:16 vertical aspect ratio
${config.background ? `- Background setting: ${config.background}` : '- Clean white studio background'}
${isPortraitPose ? `- Model pose: Face close-up portrait` : `- Model pose: ${config.pose || 'Natural, confident standing pose with full body visible head-to-toe'}`}

IMPORTANT: The clothing in the output image MUST be identical to the clothing in the input reference images. Do not create different clothing.
${!isPortraitPose ? 'CRITICAL: Generate a FULL-BODY image. The entire model from head to feet MUST be visible. NO cropping or zooming.' : ''}
${isHijabModel ? `
FINAL REMINDER FOR HIJAB MODEL:
- Hair MUST be completely invisible under the hijab
- Neck, chest, shoulders MUST be fully covered
- Modest, conservative styling only
- This is for Turkish/Middle East modest fashion e-commerce` : ''}

${NEGATIVE_PROMPT}

OUTPUT: A single photorealistic ${isPortraitPose ? 'portrait' : 'FULL-BODY (head to feet visible)'} image of the described model wearing the exact clothing from the reference images in 9:16 vertical format.`;

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
  
  // Create a signed URL since bucket is private
  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from('generated-images')
    .createSignedUrl(fileName, 60 * 60 * 24); // 24 hours
  
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

// Build model description from config
function buildModelDescription(config: Record<string, string | null>): string {
  const parts: string[] = [];
  
  // CRITICAL: If Hijab is selected, override all styling with modest requirements FIRST
  if (config.modestOption === 'Hijab') {
    parts.push('=== TESETTÜR / MODEST HIJABI MODEL - ABSOLUTE REQUIREMENTS ===');
    parts.push('');
    parts.push('CORE IDENTITY: Fully modest hijabi female model for e-commerce product photography.');
    parts.push('');
    parts.push('MANDATORY COVERAGE REQUIREMENTS:');
    parts.push('- Hijab (headscarf) MUST fully cover ALL hair - NO hair visible whatsoever, not a single strand');
    parts.push('- Neck MUST be FULLY covered by hijab fabric or high-neck clothing');
    parts.push('- Chest and décolletage MUST be FULLY covered - absolutely NO cleavage');
    parts.push('- Shoulders MUST be completely covered');
    parts.push('- Arms MUST be covered with long sleeves to the wrist');
    parts.push('- Only face and hands may show skin');
    parts.push('');
    parts.push('CLOTHING STYLE REQUIREMENTS:');
    parts.push('- Fully modest outfit with long sleeves and loose fit');
    parts.push('- Modern, elegant, premium modest fashion aesthetic');
    parts.push('- Turkey / Middle East hijab fashion style');
    parts.push('- NO transparent, sheer, or see-through fabrics');
    parts.push('- NO tight or body-hugging silhouettes');
    parts.push('- NO Western runway or editorial styling');
    parts.push('- Conservative but stylish modest wear');
    parts.push('');
    parts.push('POSE & EXPRESSION:');
    parts.push('- Natural, dignified, product-focused pose');
    parts.push('- Professional e-commerce model posture');
    parts.push('- NO provocative or exaggerated poses');
    parts.push('- Subtle, confident expression');
    parts.push('');
    parts.push('=== END TESETTÜR REQUIREMENTS ===');
    parts.push('');
    parts.push('MODEL ATTRIBUTES (within modest constraints):');
    if (config.ethnicity) parts.push(`- Ethnicity: ${config.ethnicity}`);
    if (config.skinTone) parts.push(`- Skin tone: ${config.skinTone}`);
    if (config.eyeColor) parts.push(`- Eye color: ${config.eyeColor}`);
    if (config.bodyType) parts.push(`- Body type: ${config.bodyType}`);
    if (config.faceType) parts.push(`- Face shape: ${config.faceType}`);
    if (config.facialExpression) parts.push(`- Expression: ${config.facialExpression}`);
    // Hair color and type are NOT shown for Hijab models
    
    return parts.join('\n');
  }
  
  // Standard (non-Hijab) model description
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
  
  return parts.join('\n');
}

// Fallback: Use Nano Banana API with proper virtual try-on prompt
async function generateWithNanoBanana(
  apiKey: string,
  prompt: string,
  imageUrls: string[],
  usePro: boolean
): Promise<string> {
  console.log(`Starting Nano Banana ${usePro ? 'Pro' : 'Standard'} generation...`);
  
  let requestBody: Record<string, any>;
  let endpoint: string;
  
  if (usePro) {
    // Pro API uses different endpoint and parameters
    // FORCE 9:16 vertical aspect ratio for full-body fashion images
    requestBody = {
      prompt: prompt,
      imageUrls: imageUrls,
      resolution: '2K',
      aspectRatio: '9:16'
    };
    endpoint = `${NANOBANANA_BASE_URL}/generate-pro`;
  } else {
    // Standard API
    // FORCE 9:16 vertical aspect ratio for full-body fashion images
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

    // Collect base64 images for Gemini AND URLs for Nano Banana fallback
    const base64Images: string[] = [];
    const imageUrls: string[] = [];
    
    for (let i = 0; i < referenceImages.length; i++) {
      const img = referenceImages[i];
      
      // If already base64, use directly for Gemini
      if (img.data.startsWith('data:')) {
        base64Images.push(img.data);
        
        // Also upload to storage for Nano Banana fallback
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
              // Create signed URL for Nano Banana
              const { data: signedData } = await supabase.storage
                .from('generated-images')
                .createSignedUrl(fileName, 60 * 60); // 1 hour
              
              if (signedData?.signedUrl) {
                imageUrls.push(signedData.signedUrl);
                console.log(`Uploaded clothing image ${i + 1} with signed URL`);
              }
            }
          }
        } catch (err) {
          console.error(`Error uploading image ${i}:`, err);
        }
      } else if (img.data.startsWith('http')) {
        // URL - use for Nano Banana, need to fetch for Gemini
        imageUrls.push(img.data);
        // We'll skip Gemini if we only have URLs (can't easily convert)
      }
    }
    
    if (base64Images.length === 0 && imageUrls.length === 0) {
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

    console.log(`Ready: ${base64Images.length} base64 images, ${imageUrls.length} URLs`);
    console.log(`Quality: ${usePro ? 'Pro' : 'Standard'}`);

    let generatedImageUrl: string;
    
    // Try Gemini first if we have base64 images and API key
    if (lovableApiKey && base64Images.length > 0) {
      try {
        console.log('Using Gemini for virtual try-on...');
        generatedImageUrl = await generateWithGeminiTryOn(lovableApiKey, base64Images, sanitizedConfig, supabase);
        console.log('Gemini generation successful');
      } catch (geminiError) {
        console.error('Gemini generation failed:', geminiError);
        
        // Fallback to Nano Banana if we have URLs
        if (imageUrls.length > 0) {
          console.log('Falling back to Nano Banana...');
          const fallbackPrompt = buildFallbackPrompt(sanitizedConfig);
          generatedImageUrl = await generateWithNanoBanana(NANOBANANA_API_KEY, fallbackPrompt, imageUrls, usePro);
        } else {
          throw geminiError;
        }
      }
    } else if (imageUrls.length > 0) {
      // No Gemini available, use Nano Banana directly
      console.log('Using Nano Banana directly...');
      const fallbackPrompt = buildFallbackPrompt(sanitizedConfig);
      generatedImageUrl = await generateWithNanoBanana(NANOBANANA_API_KEY, fallbackPrompt, imageUrls, usePro);
    } else {
      throw new Error('No valid image sources available');
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

function buildFallbackPrompt(config: Record<string, string | null>): string {
  const parts: string[] = [];
  
  // Determine if this is a portrait-only pose
  const isPortraitPose = config.pose === 'Face Close-up';
  
  // Check if this is a Hijab/modest model - handle this FIRST
  const isHijabModel = config.modestOption === 'Hijab';
  
  // Quality enhancement prompts (shared)
  const POSITIVE_PROMPT = 'high-end fashion photography, editorial fashion shoot, real human model, natural skin texture, visible skin pores, soft natural lighting, diffused light, realistic shadows, premium studio or lifestyle background, clean and minimal environment, natural color grading, neutral tones, true-to-life colors, professional camera look, DSLR photography, shallow depth of field, authentic fabric texture, realistic clothing folds, relaxed and natural pose, confident posture, editorial fashion pose, candid feeling, luxury brand aesthetic, modern fashion campaign';

  const NEGATIVE_PROMPT_GENERAL = 'plastic skin, overly smooth skin, artificial skin texture, waxy skin, CGI skin, doll-like face, porcelain skin, uncanny valley, over-processed face, excessive skin retouching, beauty filter look, AI-generated look, synthetic appearance, low-quality background, cheap background, blurry background, pixelated background, noisy background, flat lighting, unnatural lighting, harsh shadows, overexposed highlights, washed-out colors, unrealistic proportions, distorted anatomy, deformed hands, extra fingers, missing fingers, warped body, asymmetrical face, over-sharpening, oversaturated colors, HDR look, fake depth of field, unnatural bokeh, 3D render, game engine look, illustration style, stiff pose, robotic posture, stock photo look, artificial expression';
  
  if (isHijabModel) {
    // ========================================
    // TESETTÜR / MODEST HIJABI MODEL PROMPT
    // ========================================
    parts.push('VIRTUAL TRY-ON TASK: Generate a fully modest hijabi female model wearing the EXACT clothing shown in the input images.');
    parts.push('');
    parts.push(`STYLE REQUIREMENTS: ${POSITIVE_PROMPT}`);
    parts.push('');
    parts.push('=== TESETTÜR / MODEST HIJABI MODEL - ABSOLUTE REQUIREMENTS ===');
    parts.push('');
    parts.push('CORE IDENTITY:');
    parts.push('- Fully modest hijabi female model for e-commerce product photography');
    parts.push('- Turkey / Middle East hijab fashion aesthetic');
    parts.push('- Modern, elegant, premium modest fashion');
    parts.push('');
    parts.push('MANDATORY COVERAGE REQUIREMENTS (NO EXCEPTIONS):');
    parts.push('- Hijab (headscarf) MUST fully cover ALL hair - NO hair visible whatsoever, not a single strand');
    parts.push('- Neck MUST be FULLY covered by hijab fabric or high-neck clothing');
    parts.push('- Chest and décolletage MUST be FULLY covered - absolutely NO cleavage');
    parts.push('- Shoulders MUST be completely covered');
    parts.push('- Arms MUST be covered with long sleeves to the wrist');
    parts.push('- Only face and hands may show skin');
    parts.push('');
    parts.push('CLOTHING STYLE REQUIREMENTS:');
    parts.push('- Fully modest outfit with loose fit');
    parts.push('- NO transparent, sheer, or see-through fabrics');
    parts.push('- NO tight or body-hugging silhouettes');
    parts.push('- NO Western runway or editorial styling');
    parts.push('- Conservative but stylish modest wear');
    parts.push('');
    parts.push('POSE & EXPRESSION:');
    parts.push('- Natural, dignified, product-focused pose');
    parts.push('- Professional e-commerce model posture');
    parts.push('- NO provocative or exaggerated poses');
    parts.push('- Subtle, confident expression');
    parts.push('');
    parts.push('=== NEGATIVE PROMPT (ABSOLUTELY FORBIDDEN) ===');
    parts.push(`${NEGATIVE_PROMPT_GENERAL}, no visible hair, no cleavage, no open neck, no transparent fabric, no tight clothing, no western fashion look, no sheer fabric, no body-hugging silhouettes, no exposed shoulders, no short sleeves, no V-neck, no low neckline, no exposed skin except face and hands`);
    parts.push('=== END NEGATIVE PROMPT ===');
    parts.push('');
    parts.push('MODEL ATTRIBUTES (within modest constraints):');
    if (config.ethnicity) parts.push(`- Ethnicity: ${config.ethnicity}`);
    if (config.skinTone) parts.push(`- Skin tone: ${config.skinTone}`);
    if (config.eyeColor) parts.push(`- Eye color: ${config.eyeColor}`);
    if (config.bodyType) parts.push(`- Body type: ${config.bodyType}`);
    if (config.faceType) parts.push(`- Face shape: ${config.faceType}`);
    if (config.facialExpression) parts.push(`- Expression: ${config.facialExpression}`);
    // Hair color and type are NOT shown for Hijab models
    if (isPortraitPose) {
      parts.push(`- Pose: Face close-up portrait`);
    } else {
      parts.push(`- Pose: ${config.pose || 'Natural full-body standing pose, head to feet visible'}`);
    }
    if (config.background) parts.push(`- Background: ${config.background}`);
    parts.push('');
    
    // CRITICAL: Full-body framing requirements
    if (!isPortraitPose) {
      parts.push('MANDATORY FULL-BODY FRAMING:');
      parts.push('- Generate a FULL-BODY shot showing the ENTIRE model from head to toe');
      parts.push('- DO NOT crop, zoom in, or create upper-body/half-body shots');
      parts.push('- The complete figure must be visible: head, torso, arms, legs, and FEET');
      parts.push('- Use vertical 9:16 portrait orientation for full-body fashion photography');
      parts.push('- Natural standing pose with feet visible at the bottom of the frame');
      parts.push('');
    }
    
    parts.push('CLOTHING TRANSFER RULES:');
    parts.push('- The model MUST wear the SAME outfit from the input images');
    parts.push('- Do NOT create new or different clothing');
    parts.push('- Preserve exact fabric, colors, patterns, and design');
    parts.push('');
    parts.push('IMAGE FORMAT: Vertical 9:16 aspect ratio');
    if (isPortraitPose) {
      parts.push('OUTPUT: Ultra-realistic modest fashion portrait photography with the hijabi model wearing the exact input clothing.');
    } else {
      parts.push('OUTPUT: Ultra-realistic FULL-BODY modest fashion photography (head to feet visible) with the hijabi model wearing the exact input clothing.');
      parts.push('REMINDER: The ENTIRE body from head to feet MUST be in frame. No cropping. Hair MUST be fully covered by hijab.');
    }
    
    return parts.join('\n');
  }
  
  // ========================================
  // STANDARD (NON-HIJAB) MODEL PROMPT
  // ========================================
  // Uses POSITIVE_PROMPT and NEGATIVE_PROMPT_GENERAL defined above
  
  parts.push('VIRTUAL TRY-ON TASK: Generate a fashion model wearing the EXACT clothing shown in the input images.');
  parts.push('');
  parts.push(`STYLE REQUIREMENTS: ${POSITIVE_PROMPT}`);
  parts.push('');
  parts.push('CRITICAL RULES:');
  parts.push('- The model MUST wear the SAME outfit from the input images');
  parts.push('- Do NOT create new or different clothing');
  parts.push('- Preserve exact fabric, colors, patterns, and design');
  parts.push('');
  
  // CRITICAL: Full-body framing requirements
  if (!isPortraitPose) {
    parts.push('MANDATORY FULL-BODY FRAMING:');
    parts.push('- Generate a FULL-BODY shot showing the ENTIRE model from head to toe');
    parts.push('- DO NOT crop, zoom in, or create upper-body/half-body shots');
    parts.push('- The complete figure must be visible: head, torso, arms, legs, and FEET');
    parts.push('- Use vertical 9:16 portrait orientation for full-body fashion photography');
    parts.push('- Natural standing pose with feet visible at the bottom of the frame');
    parts.push('- NO automatic cropping or zoom-in allowed');
    parts.push('');
  }
  
  parts.push('MODEL ATTRIBUTES:');
  if (config.gender) parts.push(`- Gender: ${config.gender}`);
  if (config.ethnicity) parts.push(`- Ethnicity: ${config.ethnicity}`);
  if (config.skinTone) parts.push(`- Skin tone: ${config.skinTone}`);
  if (config.hairColor) parts.push(`- Hair color: ${config.hairColor}`);
  if (config.hairType) parts.push(`- Hair style: ${config.hairType}`);
  if (config.eyeColor) parts.push(`- Eye color: ${config.eyeColor}`);
  if (config.bodyType) parts.push(`- Body type: ${config.bodyType}`);
  if (config.faceType) parts.push(`- Face shape: ${config.faceType}`);
  if (config.facialExpression) parts.push(`- Expression: ${config.facialExpression}`);
  if (config.beardType && config.gender === 'Male') parts.push(`- Beard/Facial hair: ${config.beardType}`);
  if (isPortraitPose) {
    parts.push(`- Pose: Face close-up portrait`);
  } else {
    parts.push(`- Pose: ${config.pose || 'Natural full-body standing pose, head to feet visible'}`);
  }
  if (config.background) parts.push(`- Background: ${config.background}`);
  
  parts.push('');
  parts.push(`NEGATIVE PROMPT (AVOID THESE): ${NEGATIVE_PROMPT_GENERAL}`);
  parts.push('');
  parts.push('IMAGE FORMAT: Vertical 9:16 aspect ratio');
  if (isPortraitPose) {
    parts.push('OUTPUT: Ultra-realistic fashion portrait photography with the model wearing the exact input clothing.');
  } else {
    parts.push('OUTPUT: Ultra-realistic FULL-BODY fashion photography (head to feet visible) with the model wearing the exact input clothing.');
    parts.push('REMINDER: The ENTIRE body from head to feet MUST be in frame. No cropping.');
  }
  
  return parts.join('\n');
}
