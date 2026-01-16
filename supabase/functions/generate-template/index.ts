import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Lovable AI Gateway for Nano Banana image generation
const LOVABLE_AI_GATEWAY = 'https://ai.gateway.lovable.dev/v1/chat/completions';

// Credit costs per template (4 poses)
const STANDARD_CREDIT_COST = 4; // 1 credit per pose
const PRO_CREDIT_COST = 16; // 4 credits per pose

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Build Hijab constraint prompt injection
function buildHijabConstraint(): string {
  return `
=== HIJAB/MODEST MODEL - MANDATORY REQUIREMENTS ===
This MUST be a hijabi (covered/modest) female model.
REQUIRED - Headscarf (hijab) fully covering ALL hair - NO hair visible whatsoever
REQUIRED - Neck must be FULLY covered by the hijab or clothing
REQUIRED - Chest/décolletage must be FULLY covered - NO cleavage
REQUIRED - Shoulders must be covered
REQUIRED - Long sleeves covering arms completely
REQUIRED - Modest, conservative clothing style

STRICTLY FORBIDDEN when Hijab is selected:
- ANY visible hair (not a single strand)
- Exposed neck or neckline
- Any cleavage or chest exposure
- Short sleeves or exposed shoulders
- Open collar, V-neck, or transparent fabrics
- Any skin exposure beyond face and hands

The Hijab requirement OVERRIDES all default styling and takes ABSOLUTE PRIORITY.
=== END HIJAB REQUIREMENTS ===
`;
}

async function generateWithNanoBanana(
  apiKey: string,
  prompt: string,
  templatePoseImageUrl: string,
  productImageBase64: string,
  usePro: boolean,
  isHijab: boolean = false
): Promise<string> {
  console.log(`Generating with Nano Banana ${usePro ? 'Pro' : 'Standard'}...`);
  console.log(`Hijab mode: ${isHijab}`);
  
  // Inject Hijab constraint if enabled
  let finalPrompt = prompt;
  if (isHijab) {
    finalPrompt = buildHijabConstraint() + '\n\n' + prompt;
    console.log('Hijab constraint injected into prompt');
  }
  
  // Build content with both images
  const contentParts: any[] = [
    {
      type: "image_url",
      image_url: { url: templatePoseImageUrl }
    },
    {
      type: "image_url",
      image_url: { url: productImageBase64 }
    },
    {
      type: "text",
      text: finalPrompt
    }
  ];
  
  const model = usePro 
    ? 'google/gemini-3-pro-image-preview' 
    : 'google/gemini-2.5-flash-image-preview';
  
  console.log(`Using model: ${model}`);
  
  const response = await fetch(LOVABLE_AI_GATEWAY, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: model,
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
    console.error('AI Gateway error:', errorText);
    
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    if (response.status === 402) {
      throw new Error('Payment required. Please add credits to continue.');
    }
    throw new Error(`AI generation failed: ${response.status}`);
  }
  
  const result = await response.json();
  const generatedImage = result.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  
  if (!generatedImage) {
    console.error('No image in response:', JSON.stringify(result).substring(0, 500));
    throw new Error('No image generated');
  }
  
  return generatedImage;
}

async function uploadBase64ToStorage(
  supabase: any,
  base64Image: string,
  folder: string
): Promise<string> {
  const matches = base64Image.match(/^data:([^;]+);base64,(.+)$/);
  if (!matches) {
    throw new Error('Invalid base64 image format');
  }
  
  const mimeType = matches[1];
  const base64Data = matches[2];
  const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
  
  const extension = mimeType.split('/')[1] || 'png';
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`;
  
  const { error: uploadError } = await supabase.storage
    .from('generated-images')
    .upload(fileName, binaryData, {
      contentType: mimeType,
      upsert: true
    });
  
  if (uploadError) {
    console.error('Upload error:', uploadError);
    throw new Error('Failed to save image');
  }
  
  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from('generated-images')
    .createSignedUrl(fileName, 60 * 60 * 24);
  
  if (signedUrlError || !signedUrlData?.signedUrl) {
    console.error('Signed URL error:', signedUrlError);
    const { data: urlData } = supabase.storage
      .from('generated-images')
      .getPublicUrl(fileName);
    return urlData?.publicUrl || '';
  }
  
  return signedUrlData.signedUrl;
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

    if (!lovableApiKey) {
      return new Response(
        JSON.stringify({ error: 'LOVABLE_API_KEY not configured' }),
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

    const { 
      templateId, 
      poseIndex, 
      poseImageUrl, 
      productImageBase64, 
      prompt,
      usePro = false,
      isHijab = false  // Support for Hijab/modest model generation
    } = await req.json();
    
    console.log(`Template generation request - templateId: ${templateId}, poseIndex: ${poseIndex}, usePro: ${usePro}, isHijab: ${isHijab}`);
    
    if (!templateId || typeof poseIndex !== 'number' || !poseImageUrl || !productImageBase64 || !prompt) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: templateId, poseIndex, poseImageUrl, productImageBase64, prompt' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check subscription and credits (only for first pose to avoid multiple deductions)
    if (poseIndex === 0) {
      const creditCost = usePro ? PRO_CREDIT_COST : STANDARD_CREDIT_COST;
      
      const { data: subscription, error: subError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (subError || !subscription) {
        return new Response(
          JSON.stringify({ error: 'No subscription found' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const hasCredits = subscription.credits_remaining >= creditCost;
      
      if (!hasCredits) {
        return new Response(
          JSON.stringify({ 
            error: 'Insufficient credits', 
            required: creditCost, 
            available: subscription.credits_remaining 
          }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Deduct credits upfront for the entire template
      const { error: updateError } = await supabase
        .from('user_subscriptions')
        .update({
          credits_remaining: subscription.credits_remaining - creditCost,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Failed to update credits:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to process credits' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.log(`Deducted ${creditCost} credits for template generation`);
    }

    // Generate the image
    console.log(`Generating pose ${poseIndex + 1} for template ${templateId}...`);
    
    const generatedBase64 = await generateWithNanoBanana(
      lovableApiKey,
      prompt,
      poseImageUrl,
      productImageBase64,
      usePro,
      isHijab
    );
    
    // Upload to storage
    const imageUrl = await uploadBase64ToStorage(
      supabase, 
      generatedBase64, 
      `templates/${templateId}`
    );
    
    console.log(`Pose ${poseIndex + 1} generated successfully`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        imageUrl,
        poseIndex
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Template generation error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
