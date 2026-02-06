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
    prompt: 'Close-up of a human hand only, cropped from mid-palm to fingertips, wearing the jewelry from the reference image. Realistic skin texture, natural wrinkles and pores, soft directional lighting from the side, neutral background. Jewelry remains sharp and detailed with exact design preserved. Slight 30 degree diagonal angle for depth. Neutral to warm skin tone. Subtle shadows to emphasize finger structure. High-end e-commerce jewelry photography, premium quality, photographed look, DSLR camera.',
    negativePrompt: 'arm, wrist, body, face, person, mannequin, full body, extra fingers, distorted hand, plastic skin, over-smoothed texture, AI artifacts, 3D render, illustration, CGI, synthetic appearance, deformed jewelry',
  },
  'hand-wrist': {
    prompt: 'Realistic human hand and wrist only, cropped from mid-forearm to fingertips, wearing the jewelry from the reference image. Natural relaxed hand pose, realistic skin texture, controlled highlights, minimal neutral background. Soft studio lighting, balanced highlights for metal reflection. Natural skin undertone, not glossy. High-end e-commerce jewelry photography, premium quality, photographed look, DSLR camera.',
    negativePrompt: 'elbow, shoulder, face, torso, mannequin, full body, extra limbs, shiny plastic skin, blur, artifacts, 3D render, illustration, CGI, synthetic appearance, deformed jewelry',
  },
  'neck-closeup': {
    prompt: 'Close-up of a human neck only, cropped from chin base to mid-neck, wearing the jewelry from the reference image. Clean skin texture, soft frontal lighting, neutral minimal background. Front-facing or slight side angle. Gentle shadow under jewelry. Even skin tone, no harsh contrast. High-end e-commerce jewelry photography, premium quality, photographed look, DSLR camera.',
    negativePrompt: 'face, lips, shoulders, chest, hair covering jewelry, full body, mannequin, AI artifacts, 3D render, illustration, CGI, synthetic appearance, deformed jewelry',
  },
  'neck-collarbone': {
    prompt: 'Human neck and collarbone only, cropped from lower chin to upper chest, wearing the jewelry from the reference image. Realistic anatomy, soft diffused lighting, clean minimal background. Slight angle to show collarbone depth. Highlights on collarbone structure. Natural matte skin finish. High-end e-commerce jewelry photography, premium quality, photographed look, DSLR camera.',
    negativePrompt: 'face focus, breasts, shoulders wide, full torso, mannequin, plastic skin, AI look, 3D render, illustration, CGI, synthetic appearance, deformed jewelry',
  },
  'single-ear': {
    prompt: 'Close-up of a single human ear only, side profile, hair tucked back, wearing the jewelry from the reference image. Realistic skin texture, soft side lighting, minimal neutral background. Side lighting to enhance metal shine. Natural skin texture around ear. Soft shadow separation. High-end e-commerce jewelry photography, premium quality, photographed look, DSLR camera.',
    negativePrompt: 'full face, eyes, mouth, both ears, mannequin, artificial skin, blur, artifacts, 3D render, illustration, CGI, synthetic appearance, deformed jewelry',
  },
  'anklet-focus': {
    prompt: 'Close-up of a human ankle and foot only, cropped from lower calf to foot, wearing the jewelry from the reference image. Natural skin texture, soft ambient lighting, clean minimal background. Natural relaxed foot position. Slight warm tone for lifestyle feel. Texture preserved on skin. High-end e-commerce jewelry photography, premium quality, photographed look, DSLR camera.',
    negativePrompt: 'legs full, body, shoes, floor clutter, mannequin, plastic skin, AI artifacts, 3D render, illustration, CGI, synthetic appearance, deformed jewelry',
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
      console.log(`Pre-deducted 1 ${usePro ? 'pro' : 'standard'} generation for jewelry`);
    } else {
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
      // Refund credits
      if (isTrial) {
        const field = usePro ? 'pro_generations_remaining' : 'standard_generations_remaining';
        const value = usePro ? subscriptionData.pro_generations_remaining : subscriptionData.standard_generations_remaining;
        await supabase.from('user_subscriptions').update({ [field]: value }).eq('user_id', user.id);
      } else {
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
