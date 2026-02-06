import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Nano Banana API endpoints - ONLY API used for image generation
const NANOBANANA_BASE_URL = 'https://api.nanobananaapi.ai/api/v1/nanobanana';

// Credit costs (1 image per generation)
const STANDARD_CREDIT_COST = 1;
const PRO_CREDIT_COST = 4;

// Preset definitions with prompts and negative prompts
const PRESETS: Record<string, { prompt: string; negativePrompt: string }> = {
  'hand-only': {
    prompt: 'Editorial jewelry close-up: human hand only, cropped from mid-palm to fingertips, wearing the jewelry from the reference image. Realistic skin texture, natural wrinkles and pores. Soft key light from side with window-like softness, gentle shadow falloff for depth, neutral-premium color temperature. Slight 3/4 diagonal angle (20-30 degrees) for editorial depth. Neutral to warm skin tone. Subtle shadows to emphasize finger structure. Premium brand campaign jewelry photography, DSLR camera, shallow depth of field, clean minimal background that never competes with product. Jewelry design, color, and proportions preserved 100% unchanged.',
    negativePrompt: 'arm, wrist, body, face, person, mannequin, full body, extra fingers, distorted hand, plastic skin, over-smoothed texture, AI artifacts, 3D render, illustration, CGI, synthetic appearance, deformed jewelry, flat angle, straight-on camera, harsh studio flash, washed-out lighting, cheap catalog photo, fake gradient background',
  },
  'hand-wrist': {
    prompt: 'Editorial jewelry photography: realistic human hand and wrist only, cropped from mid-forearm to fingertips, wearing the jewelry from the reference image. Natural relaxed hand pose with subtle tension. Soft key light from side/front with gentle shadow falloff, neutral-premium color temperature. Slight angle for editorial composition. Natural skin texture, controlled highlights for metal reflection. Premium brand campaign aesthetic, DSLR camera, clean minimal background. Jewelry design preserved 100% unchanged.',
    negativePrompt: 'elbow, shoulder, face, torso, mannequin, full body, extra limbs, shiny plastic skin, blur, artifacts, 3D render, illustration, CGI, synthetic appearance, deformed jewelry, flat angle, straight-on camera, harsh studio flash, cheap catalog photo, fake gradient background',
  },
  'neck-closeup': {
    prompt: 'Editorial jewelry close-up: human neck only, cropped from chin base to mid-neck, wearing the jewelry from the reference image. Clean realistic skin texture with visible pores. Soft frontal key light with gentle shadow falloff, neutral-premium color temperature. Slight 3/4 angle for depth. Gentle shadow under jewelry for dimension. Even skin tone, professional DSLR quality. Premium brand campaign aesthetic, clean minimal background. Jewelry design preserved 100% unchanged.',
    negativePrompt: 'face, lips, shoulders, chest, hair covering jewelry, full body, mannequin, AI artifacts, 3D render, illustration, CGI, synthetic appearance, deformed jewelry, flat angle, harsh lighting, cheap catalog photo, fake gradient background',
  },
  'neck-collarbone': {
    prompt: 'Editorial jewelry photography: human neck and collarbone only, cropped from lower chin to upper chest, wearing the jewelry from the reference image. Realistic anatomy with natural skin texture. Soft diffused key light from side with gentle shadow falloff, neutral-premium color temperature. Slight angle to show collarbone depth and structure. Natural matte skin finish. Premium brand campaign aesthetic, DSLR camera, clean minimal background. Jewelry design preserved 100% unchanged.',
    negativePrompt: 'face focus, breasts, shoulders wide, full torso, mannequin, plastic skin, AI look, 3D render, illustration, CGI, synthetic appearance, deformed jewelry, flat angle, harsh lighting, cheap catalog photo, fake gradient background',
  },
  'single-ear': {
    prompt: 'Editorial jewelry close-up: single human ear only, side profile, hair tucked back, wearing the jewelry from the reference image. Realistic skin texture around ear with natural pores. Soft side key light to enhance metal shine and create gentle shadow falloff, neutral-premium color temperature. Editorial framing with visual balance. Natural skin texture, soft shadow separation. Premium brand campaign aesthetic, DSLR camera, clean minimal background. Jewelry design preserved 100% unchanged.',
    negativePrompt: 'full face, eyes, mouth, both ears, mannequin, artificial skin, blur, artifacts, 3D render, illustration, CGI, synthetic appearance, deformed jewelry, flat angle, harsh lighting, cheap catalog photo, fake gradient background',
  },
  'anklet-focus': {
    prompt: 'Editorial jewelry photography: human ankle and foot only, cropped from lower calf to foot, wearing the jewelry from the reference image. Natural skin texture with realistic detail. Soft ambient key light with gentle shadow falloff, slight warm tone for lifestyle editorial feel. Natural relaxed foot position with subtle tension. Premium brand campaign aesthetic, DSLR camera, clean minimal background. Jewelry design preserved 100% unchanged.',
    negativePrompt: 'legs full, body, shoes, floor clutter, mannequin, plastic skin, AI artifacts, 3D render, illustration, CGI, synthetic appearance, deformed jewelry, flat angle, harsh lighting, cheap catalog photo, fake gradient background',
  },
};

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Poll Nano Banana for task completion
async function pollForTaskCompletion(apiKey: string, taskId: string): Promise<string> {
  const maxWaitTime = 300000; // 5 minutes
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
  
  throw new Error('Nano Banana generation timeout');
}

// Generate using Nano Banana API
async function generateWithNanoBanana(
  apiKey: string,
  prompt: string,
  imageUrls: string[],
  usePro: boolean
): Promise<string> {
  console.log(`Starting Nano Banana ${usePro ? 'Pro' : 'Standard'} jewelry generation...`);
  
  let requestBody: Record<string, any>;
  let endpoint: string;
  
  if (usePro) {
    requestBody = {
      prompt: prompt,
      imageUrls: imageUrls,
      resolution: '2K',
      aspectRatio: '1:1'
    };
    endpoint = `${NANOBANANA_BASE_URL}/generate-pro`;
  } else {
    requestBody = {
      prompt: prompt,
      type: 'IMAGETOIAMGE',
      numImages: 1,
      imageUrls: imageUrls,
      aspectRatio: '1:1'
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
  return await pollForTaskCompletion(apiKey, taskId);
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
      .eq('endpoint', 'generate-jewelry')
      .gte('window_start', windowStart.toISOString())
      .single();
    
    if (rateLimitData && rateLimitData.request_count >= maxRequests) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { presetId, jewelryImageBase64, usePro = false } = await req.json();
    
    if (!presetId || !jewelryImageBase64) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: presetId, jewelryImageBase64' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const preset = PRESETS[presetId];
    if (!preset) {
      return new Response(
        JSON.stringify({ error: `Invalid preset: ${presetId}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
      console.log(`Pre-deducted 1 ${usePro ? 'pro' : 'standard'} trial generation for jewelry`);
    } else if (useCredits) {
      const newBalance = subscriptionData.credits_remaining - creditCost;
      await supabase.from('user_subscriptions').update({ credits_remaining: newBalance }).eq('user_id', user.id);
      console.log(`Pre-deducted ${creditCost} credits for jewelry. New balance: ${newBalance}`);
    }

    // Upload jewelry image to storage
    const imageUrls: string[] = [];
    
    try {
      const matches = jewelryImageBase64.match(/^data:([^;]+);base64,(.+)$/);
      if (matches) {
        const mimeType = matches[1];
        const base64Data = matches[2];
        const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
        
        const extension = mimeType.split('/')[1] || 'png';
        const fileName = `jewelry/${user.id}/${presetId}-${Date.now()}.${extension}`;
        
        const { error: uploadError } = await supabase.storage
          .from('generated-images')
          .upload(fileName, binaryData, { contentType: mimeType, upsert: true });
        
        if (!uploadError) {
          const { data: signedData } = await supabase.storage
            .from('generated-images')
            .createSignedUrl(fileName, 60 * 60);
          
          if (signedData?.signedUrl) {
            imageUrls.push(signedData.signedUrl);
            console.log('Uploaded jewelry image with signed URL');
          }
        } else {
          console.error('Error uploading jewelry image:', uploadError);
        }
      }
    } catch (err) {
      console.error('Error processing jewelry image:', err);
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
        JSON.stringify({ error: 'Failed to process jewelry image' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating jewelry for preset: ${presetId}, quality: ${usePro ? 'Pro' : 'Standard'}`);

    // Build full prompt with negative prompt appended
    const fullPrompt = `${preset.prompt}\n\nNEGATIVE: ${preset.negativePrompt}`;
    const generatedImageUrl = await generateWithNanoBanana(nanoBananaApiKey, fullPrompt, imageUrls, usePro);

    console.log('Jewelry generation successful:', generatedImageUrl);

    // Update rate limit
    await supabase.from('rate_limits').upsert({
      user_id: user.id,
      endpoint: 'generate-jewelry',
      request_count: (rateLimitData?.request_count || 0) + 1,
      window_start: now.toISOString()
    }, { onConflict: 'user_id,endpoint' });

    return new Response(
      JSON.stringify({
        success: true,
        imageUrl: generatedImageUrl,
        presetId,
        quality: usePro ? 'pro' : 'standard',
        creditCost
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Jewelry generation error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Jewelry generation failed'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
