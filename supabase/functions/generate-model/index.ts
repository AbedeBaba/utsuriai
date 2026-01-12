import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Nano Banana API Configuration
const NANOBANANA_BASE_URL = 'https://api.nanobananaapi.ai/api/v1/nanobanana';

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

// Generate image using Nano Banana API
async function generateWithNanoBanana(
  apiKey: string,
  prompt: string,
  imageUrls: string[] | null,
  usePro: boolean
): Promise<string> {
  console.log('Starting Nano Banana image generation...');
  
  // Step 1: Create generation task
  // CRITICAL: Image-to-Image only mode - use IMAGETOIMAGE type
  // Note: API documentation shows typos but we use the correct spelling
  const requestBody: Record<string, any> = {
    prompt,
    type: 'IMAGETOIMAGE', // Always use Image-to-Image mode
    numImages: 1,
    imageUrls: imageUrls // Required for Image-to-Image
  };
  
  console.log('Nano Banana request body (Image-to-Image mode):', JSON.stringify(requestBody));
  
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
  
  // Step 2: Poll for completion (max 5 minutes)
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
    console.log('Full status response:', JSON.stringify(statusResult));
    
    // Handle different API response structures
    // The status might be in statusResult directly or in statusResult.data
    const successFlag = statusResult.successFlag ?? statusResult.data?.successFlag ?? statusResult.data?.status;
    const responseData = statusResult.response ?? statusResult.data?.response ?? statusResult.data;
    
    console.log(`Task status check: successFlag=${successFlag}, hasResponse=${!!responseData}`);
    
    // Check for completed status
    if (successFlag === 1 || statusResult.code === 200 && responseData?.resultImageUrl) {
      console.log('Generation completed successfully!');
      const imageUrl = responseData?.resultImageUrl || responseData?.imageUrl || responseData?.url;
      if (!imageUrl) {
        // Try to find image URL in other locations
        const possibleUrls = [
          statusResult.resultImageUrl,
          statusResult.imageUrl,
          statusResult.data?.resultImageUrl,
          statusResult.data?.imageUrl
        ].filter(Boolean);
        
        if (possibleUrls.length > 0) {
          return possibleUrls[0];
        }
        console.error('Response structure:', JSON.stringify(statusResult));
        throw new Error('No resultImageUrl in successful response');
      }
      return imageUrl;
    }
    
    // Check for failed status
    if (successFlag === 2 || successFlag === 3) {
      throw new Error(statusResult.errorMessage || statusResult.data?.errorMessage || 'Generation failed');
    }
    
    // Check if still generating (successFlag === 0 or undefined while still processing)
    if (successFlag === 0) {
      console.log('Task is still generating...');
    } else if (successFlag === undefined || successFlag === null) {
      console.log('Unknown/pending status, continuing to poll...');
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
    // SERVER-SIDE SUBSCRIPTION VERIFICATION
    // ==========================================
    if (usePro) {
      const { data: subscription, error: subError } = await supabase
        .from('user_subscriptions')
        .select('plan, pro_generations_remaining')
        .eq('user_id', authenticatedUserId)
        .single();
      
      if (subError) {
        console.error('Subscription check error:', subError);
        return new Response(
          JSON.stringify({ error: 'Unable to verify subscription' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Check if user has Pro access
      const hasProAccess = ['starter', 'pro', 'creator'].includes(subscription.plan);
      const hasTrialPro = subscription.plan === 'trial' && subscription.pro_generations_remaining > 0;
      
      if (!hasProAccess && !hasTrialPro) {
        return new Response(
          JSON.stringify({ error: 'Pro access required. Please upgrade your plan or you have exhausted your trial Pro generations.' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Decrement trial pro generations BEFORE generation (prevent race conditions)
      if (subscription.plan === 'trial') {
        const { error: decrementError } = await supabase
          .from('user_subscriptions')
          .update({ 
            pro_generations_remaining: subscription.pro_generations_remaining - 1 
          })
          .eq('user_id', authenticatedUserId);
        
        if (decrementError) {
          console.error('Error decrementing pro generations:', decrementError);
        } else {
          console.log(`Pre-decremented pro_generations_remaining for trial user ${authenticatedUserId}. Remaining: ${subscription.pro_generations_remaining - 1}`);
        }
      }
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
    let imageUrls: string[] | null = null;
    if (!referenceImages || referenceImages.length === 0) {
      console.error('No reference images provided - Image-to-Image mode required');
      return new Response(
        JSON.stringify({ error: 'Model oluşturmak için en az 1 adet kıyafet görseli yüklemeniz gerekmektedir.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Uploading ${referenceImages.length} reference images to storage...`);
    imageUrls = [];
    
    for (let i = 0; i < referenceImages.length; i++) {
      const img = referenceImages[i];
      
      // If already an HTTP URL, use directly
      if (img.data.startsWith('http')) {
        imageUrls.push(img.data);
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
              console.log(`Uploaded reference image ${i}: ${urlData.publicUrl}`);
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
    
    console.log(`Prepared ${imageUrls.length} reference image URLs for Nano Banana API (Image-to-Image mode)`);

    console.log(`Using Nano Banana API with ${usePro ? 'Pro' : 'Standard'} model`);

    // Call the Nano Banana API
    const generatedImageUrl = await generateWithNanoBanana(apiKey, prompt, imageUrls, usePro);

    console.log('Image generated successfully with', usePro ? 'Pro' : 'Standard', 'quality');
    console.log('Generated image URL:', generatedImageUrl);

    // Update the database with the generated image
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
    ? 'ULTRA-PREMIUM 16K QUALITY, magazine cover ready, award-winning fashion photography' 
    : 'Ultra-high resolution, 8K quality, professional fashion photography';

  const staticBasePrompt = `
Generate a hyper-realistic, high-resolution fashion photography image featuring a model.

CRITICAL CLOTHING PRESERVATION RULES (ABSOLUTE REQUIREMENTS):
- The clothing, outfit, and all garments shown in the reference images MUST be reproduced EXACTLY as they appear.
- Do NOT alter, reinterpret, stylize, or modify the clothing in any way.
- Preserve ALL original details: fabric texture, material type, weave pattern, stitching, seams, buttons, zippers, embroidery, prints, patterns, logos, and embellishments.
- Maintain EXACT colors, color gradients, shading, and tonal values of the clothing.
- Keep the EXACT garment cut, silhouette, fit, drape, and shape.
- Preserve lighting reflections, shadows, and fabric behavior exactly as shown.
- If jewelry or accessories are provided in reference images, include them exactly as shown without modification.
- The clothing must look identical to the reference - as if it's the same physical garment photographed on the model.

PHOTOREALISM REQUIREMENTS:
- ${qualityLevel}.
- Studio-grade lighting with natural skin tones and fabric rendering.
- Sharp focus, professional depth of field.
- Magazine-quality editorial fashion photography aesthetic.
- Natural, realistic skin texture and details.
${usePro ? '- Premium retouching quality with flawless skin and lighting.\n- Ultra-detailed fabric rendering with visible thread textures.\n- Professional color grading with rich, vibrant tones.' : ''}
`.trim();

  const dynamicFilters: string[] = [];
  
  if (config.gender) dynamicFilters.push(`Model gender: ${config.gender}`);
  if (config.ethnicity) dynamicFilters.push(`Model ethnicity: ${config.ethnicity}`);
  if (config.skinTone) dynamicFilters.push(`Skin tone: ${config.skinTone}`);
  if (config.hairColor) dynamicFilters.push(`Hair color: ${config.hairColor}`);
  if (config.hairType) dynamicFilters.push(`Hair type/style: ${config.hairType}`);
  if (config.eyeColor) dynamicFilters.push(`Eye color: ${config.eyeColor}`);
  if (config.faceType) dynamicFilters.push(`Face shape: ${config.faceType}`);
  if (config.facialExpression) dynamicFilters.push(`Facial expression: ${config.facialExpression}`);
  if (config.beardType) dynamicFilters.push(`Facial hair: ${config.beardType}`);
  if (config.bodyType) dynamicFilters.push(`Body type: ${config.bodyType}`);
  if (config.pose) dynamicFilters.push(`Pose: ${config.pose}`);
  if (config.background) dynamicFilters.push(`Background: ${config.background}`);
  if (config.modestOption === 'Hijab') dynamicFilters.push(`Wearing a hijab headscarf`);

  const referenceSection = referenceImages && referenceImages.length > 0
    ? `\nREFERENCE IMAGES PROVIDED:\n${referenceImages.map((img, i) => `- Reference ${i + 1}: ${img.type} - Copy this EXACTLY onto the model`).join('\n')}\n`
    : '';

  const filtersSection = dynamicFilters.length > 0
    ? `\nMODEL ATTRIBUTES:\n${dynamicFilters.join('\n')}`
    : '';

  return `${staticBasePrompt}${filtersSection}${referenceSection}\n\nFINAL INSTRUCTION: Generate a photorealistic fashion image with the exact clothing from reference images (if provided) on a model with the specified attributes. The clothing must be identical to the reference.`;
}
