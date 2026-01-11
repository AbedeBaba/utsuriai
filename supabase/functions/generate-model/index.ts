import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_AI_GATEWAY = 'https://ai.gateway.lovable.dev/v1/chat/completions';

// Allowed values for input validation
const ALLOWED_VALUES = {
  gender: ['Male', 'Female'],
  ethnicity: ['Afro-American', 'Arabic', 'Asian', 'Australian', 'European', 'Indian', 'Italian', 'Latin', 'Local American', 'Russian', 'Scandinavian', 'Turkish'],
  skinTone: ['Fair', 'Light', 'Medium', 'Olive', 'Tan', 'Brown', 'Dark Brown', 'Ebony'],
  hairColor: ['Black', 'Brown', 'Blonde', 'Dark Blonde', 'Red', 'White', 'Platinum', 'Blue', 'Green', 'Purple'],
  eyeColor: ['Brown', 'Blue', 'Green', 'Hazel', 'Grey', 'Amber', 'Black'],
  bodyType: ['Slim', 'Athletic', 'Average', 'Curvy', 'Muscular', 'Petite', 'Tall', 'Plus Size', 'Hourglass'],
  hairType: ['Straight', 'Wavy', 'Curly', 'Coily', 'Short', 'Long', 'Bald'],
  beardType: ['Clean Shaven', 'Stubble', 'Short Beard', 'Full Beard', 'Goatee', 'Mustache', 'Van Dyke', 'Circle Beard', 'Mutton Chops', null],
  pose: ['Face Close-up', 'Standing', 'Sitting', 'Leaning', 'Arms Crossed', 'Back View', 'Low-Angle', 'Hands on Hips'],
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
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
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

    // Get the Lovable API key (automatically provided by Lovable Cloud)
    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    
    if (!apiKey) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Select model based on quality mode
    const model = usePro 
      ? 'google/gemini-3-pro-image-preview' 
      : 'google/gemini-2.5-flash-image-preview';
    
    console.log(`Using Gemini model: ${model}`);

    // Build message content - text prompt + reference images
    const messageContent: any[] = [
      {
        type: 'text',
        text: prompt
      }
    ];

    // Add reference images to the message if provided
    if (referenceImages && referenceImages.length > 0) {
      referenceImages.forEach((img, index) => {
        const imageUrl = img.data.startsWith('data:') 
          ? img.data 
          : `data:image/jpeg;base64,${img.data}`;
        
        messageContent.push({
          type: 'image_url',
          image_url: {
            url: imageUrl
          }
        });
        console.log(`Added reference image ${index + 1} (type: ${img.type})`);
      });
    }

    // Call the Lovable AI Gateway with Gemini model
    const response = await fetch(LOVABLE_AI_GATEWAY, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'user',
            content: messageContent
          }
        ],
        modalities: ['image', 'text']
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add more credits.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 401 || response.status === 403) {
        return new Response(
          JSON.stringify({ error: 'AI service authentication error.' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'AI generation failed', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('Gemini API response received');

    // Extract the generated image from the response
    const generatedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!generatedImageUrl) {
      console.error('No image in response:', JSON.stringify(data).substring(0, 500));
      return new Response(
        JSON.stringify({ error: 'Image generation failed - no image returned' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Image generated successfully with', usePro ? 'Pro' : 'Standard', 'quality');

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
  if (config.pose) dynamicFilters.push(`Model pose: ${config.pose}`);
  if (config.background) dynamicFilters.push(`Background setting: ${config.background}`);
  if (config.modestOption) dynamicFilters.push(`Coverage style: ${config.modestOption}`);

  const dynamicSection = dynamicFilters.length > 0 
    ? `\n\nMODEL ATTRIBUTES (Apply these characteristics to the model):\n${dynamicFilters.map(f => `- ${f}`).join('\n')}`
    : '';

  let referenceSection = '';
  if (referenceImages && referenceImages.length > 0) {
    const imageTypes = referenceImages.map(img => img.type);
    const hasOutfit = imageTypes.some(t => t === 'outfit');
    const hasJewelry = imageTypes.some(t => t === 'jewelry');
    const hasAccessory = imageTypes.some(t => t === 'accessory');
    
    const referenceItems: string[] = [];
    if (hasOutfit) referenceItems.push('clothing/outfit');
    if (hasJewelry) referenceItems.push('jewelry');
    if (hasAccessory) referenceItems.push('accessories');
    
    referenceSection = `

REFERENCE IMAGES PROVIDED:
The attached reference images contain ${referenceItems.join(', ')} that MUST be reproduced exactly.
- Copy every detail from the reference images with 100% accuracy.
- Do not add, remove, or modify any aspect of the referenced items.
- The model should be wearing/displaying these exact items as shown.`;
  }

  const fullPrompt = `${staticBasePrompt}${dynamicSection}${referenceSection}

FINAL INSTRUCTION: Generate the image with the model wearing the EXACT clothing from the reference images (if provided), applying only the specified model attributes above. Never modify the clothing or outfit in any way.`;

  return fullPrompt;
}