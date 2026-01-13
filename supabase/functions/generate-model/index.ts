import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Nano Banana Pro API Configuration - uses chat/completions endpoint
const NANOBANANA_API_URL = 'https://api.apiyi.com/v1/chat/completions';

// Model names for Nano Banana
const NANO_BANANA_STANDARD = 'gemini-2.5-flash-image';
const NANO_BANANA_PRO = 'gemini-3-pro-image-preview';

// Credit costs
const STANDARD_CREDIT_COST = 1;
const PRO_CREDIT_COST = 8; // Pro costs 8 credits

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

// Generate image using Nano Banana API (Chat Completions endpoint with image-to-image)
async function generateWithNanoBanana(
  apiKey: string,
  prompt: string,
  imageUrls: string[],
  usePro: boolean
): Promise<string> {
  const model = usePro ? NANO_BANANA_PRO : NANO_BANANA_STANDARD;
  console.log(`Starting Nano Banana image generation with model: ${model}`);
  console.log(`Image-to-Image mode with ${imageUrls.length} reference image(s)`);
  
  // Build message content array with text prompt and reference images
  const contentArray: any[] = [
    {
      type: "text",
      text: prompt
    }
  ];
  
  // Add all reference images to the message content
  // This ensures the AI sees and uses the clothing from the reference images
  for (let i = 0; i < imageUrls.length; i++) {
    contentArray.push({
      type: "image_url",
      image_url: {
        url: imageUrls[i]
      }
    });
    console.log(`Added reference image ${i + 1}: ${imageUrls[i].substring(0, 100)}...`);
  }
  
  const requestBody = {
    model: model,
    stream: false,
    messages: [
      {
        role: "user",
        content: contentArray
      }
    ]
  };
  
  console.log('Nano Banana request (Image-to-Image via chat/completions):', JSON.stringify({
    model: requestBody.model,
    stream: requestBody.stream,
    messageContentTypes: contentArray.map(c => c.type),
    imageCount: imageUrls.length
  }));
  
  const response = await fetch(NANOBANANA_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  const result = await response.json();
  console.log('Nano Banana response status:', response.status);
  
  if (!response.ok) {
    console.error('Nano Banana API error:', JSON.stringify(result));
    throw new Error(`Generation failed: ${result.error?.message || result.message || 'Unknown error'}`);
  }
  
  // Extract image from response - check multiple possible locations
  let imageUrl: string | null = null;
  
  // Check if response has choices with message content containing images
  if (result.choices && result.choices.length > 0) {
    const choice = result.choices[0];
    const message = choice.message;
    
    // Check for images array in message (Nano Banana format)
    if (message?.images && message.images.length > 0) {
      const img = message.images[0];
      if (img.image_url?.url) {
        imageUrl = img.image_url.url;
        console.log('Found image in message.images');
      }
    }
    
    // Check for inline base64 in content
    if (!imageUrl && message?.content) {
      const content = message.content;
      // Look for base64 image data
      const base64Match = content.match(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/);
      if (base64Match) {
        imageUrl = base64Match[0];
        console.log('Found base64 image in content');
      }
    }
  }
  
  // Check for direct image_url in response
  if (!imageUrl && result.image_url) {
    imageUrl = result.image_url;
    console.log('Found image_url at root level');
  }
  
  // Check for data array format
  if (!imageUrl && result.data && result.data.length > 0) {
    if (result.data[0].url) {
      imageUrl = result.data[0].url;
      console.log('Found image in data array');
    } else if (result.data[0].b64_json) {
      imageUrl = `data:image/png;base64,${result.data[0].b64_json}`;
      console.log('Found base64 in data array');
    }
  }
  
  if (!imageUrl) {
    console.error('Full response structure:', JSON.stringify(result));
    throw new Error('No image found in API response');
  }
  
  console.log('Successfully extracted image URL/data');
  return imageUrl;
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
      // Don't block on rate limit errors, just log
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
      
      // Increment existing counter
      await supabaseAdmin
        .from('rate_limits')
        .update({ request_count: rateLimitData.request_count + 1 })
        .eq('user_id', authenticatedUserId)
        .eq('endpoint', 'generate-model')
        .eq('window_start', currentMinuteWindow);
    } else {
      // Create new rate limit entry for this window
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

    
    // Validate generationId
    if (!generationId || typeof generationId !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid generationId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate reference image size (max 10MB per image)
    const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
    if (referenceImage && referenceImage.length > MAX_IMAGE_SIZE) {
      return new Response(
        JSON.stringify({ error: 'Reference image too large (max 10MB)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Parse and validate reference images
    let referenceImages: { type: string; data: string }[] | null = null;
    
    if (referenceImage) {
      try {
        referenceImages = JSON.parse(referenceImage);
        
        // Validate array length (max 10 images)
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
    
    // Sanitize config values
    const sanitizedConfig = sanitizeConfig(config);
    
    // Create service role client for database operations
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
    // SERVER-SIDE SUBSCRIPTION & CREDIT VERIFICATION
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
    
    // ==========================================
    // TRIAL PACKAGE RULES (NO CREDITS)
    // ==========================================
    if (isTrial) {
      if (usePro) {
        // Trial Pro: Check pro_generations_remaining
        if (subscription.pro_generations_remaining <= 0) {
          console.error('Trial Pro generations exhausted');
          return new Response(
            JSON.stringify({ error: 'Deneme Pro üretim hakkınız dolmuştur' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } else {
        // Trial Standard: Check standard_generations_remaining
        if (subscription.standard_generations_remaining <= 0) {
          console.error('Trial Standard generations exhausted');
          return new Response(
            JSON.stringify({ error: 'Deneme görsel üretim hakkınız dolmuştur' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }
    
    // ==========================================
    // PAID PACKAGE RULES (CREDITS)
    // Pro uses 8 credits, Standard uses 1 credit
    // ==========================================
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
    // ATOMIC PRE-DEDUCTION (BEFORE GENERATION)
    // This prevents race conditions and duplicate deductions
    // ==========================================
    if (isTrial) {
      const updateField = usePro ? 'pro_generations_remaining' : 'standard_generations_remaining';
      const currentValue = usePro ? subscription.pro_generations_remaining : subscription.standard_generations_remaining;
      
      const { error: decrementError } = await supabase
        .from('user_subscriptions')
        .update({ [updateField]: currentValue - 1 })
        .eq('user_id', authenticatedUserId)
        .eq(updateField, currentValue); // Atomic check to prevent race conditions
      
      if (decrementError) {
        console.error('Error decrementing trial generations:', decrementError);
        return new Response(
          JSON.stringify({ error: 'Failed to reserve generation. Please try again.' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.log(`Pre-decremented ${updateField} for trial user ${authenticatedUserId}. New value: ${currentValue - 1}`);
    } else if (isPaid) {
      const requiredCredits = usePro ? PRO_CREDIT_COST : STANDARD_CREDIT_COST;
      const newBalance = subscription.credits_remaining - requiredCredits;
      
      const { error: decrementError } = await supabase
        .from('user_subscriptions')
        .update({ credits_remaining: newBalance })
        .eq('user_id', authenticatedUserId)
        .eq('credits_remaining', subscription.credits_remaining); // Atomic check
      
      if (decrementError) {
        console.error('Error decrementing credits:', decrementError);
        return new Response(
          JSON.stringify({ error: 'Failed to deduct credits. Please try again.' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.log(`Pre-deducted ${requiredCredits} credits for user ${authenticatedUserId}. New balance: ${newBalance}`);
    }
    
    console.log('Generation request validated:', { 
      generationId, 
      config: sanitizedConfig, 
      imageCount: referenceImages?.length || 0,
      usePro,
      userId: authenticatedUserId
    });

    // Build the prompt for the AI model
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

    // CRITICAL: Enforce Image-to-Image only - block generation without reference images
    let imageUrls: string[] = [];
    if (!referenceImages || referenceImages.length === 0) {
      console.error('No reference images provided - Image-to-Image mode required');
      return new Response(
        JSON.stringify({ error: 'Model oluşturmak için en az 1 adet kıyafet görseli yüklemeniz gerekmektedir.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Processing ${referenceImages.length} reference images for Image-to-Image generation...`);
    
    for (let i = 0; i < referenceImages.length; i++) {
      const img = referenceImages[i];
      
      // If already an HTTP URL, use directly
      if (img.data.startsWith('http')) {
        imageUrls.push(img.data);
        console.log(`Using direct URL for image ${i + 1}`);
        continue;
      }
      
      // Convert base64 to blob and upload
      if (img.data.startsWith('data:')) {
        try {
          const matches = img.data.match(/^data:([^;]+);base64,(.+)$/);
          if (matches) {
            const mimeType = matches[1];
            const base64Data = matches[2];
            const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
            
            const extension = mimeType.split('/')[1] || 'png';
            const fileName = `${generationId}/ref-${i}-${Date.now()}.${extension}`;
            
            // Upload to storage bucket
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('generated-images')
              .upload(fileName, binaryData, {
                contentType: mimeType,
                upsert: true
              });
            
            if (uploadError) {
              console.error(`Failed to upload reference image ${i}:`, uploadError);
              continue;
            }
            
            // Get public URL
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
    
    // Final validation - must have at least one valid image URL
    if (imageUrls.length === 0) {
      console.error('Failed to process any reference images');
      return new Response(
        JSON.stringify({ error: 'Kıyafet görselleri işlenemedi. Lütfen tekrar deneyin.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Prepared ${imageUrls.length} reference image URLs for Nano Banana API`);
    console.log(`Using ${usePro ? 'Nano Banana Pro (gemini-3-pro-image-preview)' : 'Nano Banana Standard (gemini-2.5-flash-image)'}`);

    // Call the Nano Banana API with proper Image-to-Image
    const generatedImageUrl = await generateWithNanoBanana(apiKey, prompt, imageUrls, usePro);

    console.log('Image generated successfully with', usePro ? 'Pro' : 'Standard', 'quality');
    
    // If result is base64, upload to storage
    let finalImageUrl = generatedImageUrl;
    if (generatedImageUrl.startsWith('data:')) {
      try {
        const matches = generatedImageUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (matches) {
          const mimeType = matches[1];
          const base64Data = matches[2];
          const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
          
          const extension = mimeType.split('/')[1] || 'png';
          const fileName = `${generationId}/generated-${Date.now()}.${extension}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('generated-images')
            .upload(fileName, binaryData, {
              contentType: mimeType,
              upsert: true
            });
          
          if (!uploadError) {
            const { data: urlData } = supabase.storage
              .from('generated-images')
              .getPublicUrl(fileName);
            
            if (urlData?.publicUrl) {
              finalImageUrl = urlData.publicUrl;
              console.log('Uploaded generated image to storage:', finalImageUrl);
            }
          }
        }
      } catch (e) {
        console.error('Failed to upload generated image:', e);
        // Keep the base64 URL as fallback
      }
    }
    
    console.log('Final image URL:', finalImageUrl.substring(0, 100) + '...');

    // Update the database with the generated image
    const { error: updateError } = await supabase
      .from('model_generations')
      .update({ 
        image_url: finalImageUrl,
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
        imageUrl: finalImageUrl,
        quality: usePro ? 'pro' : 'standard',
        model: usePro ? NANO_BANANA_PRO : NANO_BANANA_STANDARD,
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

  // Check if Hijab is selected
  const isHijab = config.modestOption === 'Hijab';

  // Hijab-specific prompt additions
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
  
  // Only add hair attributes if NOT Hijab
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
  
  // Add explicit hijab instruction to dynamic filters
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
