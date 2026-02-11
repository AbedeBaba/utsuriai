import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const NANOBANANA_BASE_URL = 'https://api.nanobananaapi.ai/api/v1/nanobanana';

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
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
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

    const { taskId, generationId } = await req.json();

    if (!taskId || !generationId) {
      return new Response(
        JSON.stringify({ error: 'Missing taskId or generationId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Poll NanoBanana for task status
    const statusResponse = await fetch(`${NANOBANANA_BASE_URL}/record-info?taskId=${taskId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${nanoBananaApiKey}` }
    });

    const statusResult = await statusResponse.json();
    const successFlag = statusResult.data?.successFlag ?? statusResult.successFlag;
    const responseData = statusResult.data?.response ?? statusResult.response;
    const infoData = statusResult.data?.info ?? null;

    if (successFlag === 1) {
      const imageUrl = infoData?.resultImageUrl ||
                       responseData?.resultImageUrl ||
                       responseData?.imageUrl ||
                       statusResult.data?.resultImageUrl;

      if (imageUrl) {
        // Update database with result
        await supabase
          .from('model_generations')
          .update({ image_url: imageUrl, status: 'completed' })
          .eq('id', generationId)
          .eq('user_id', user.id);

        return new Response(
          JSON.stringify({ status: 'completed', imageUrl }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (successFlag === 2 || successFlag === 3) {
      const errorMsg = statusResult.data?.errorMessage || 'Generation failed';
      
      await supabase
        .from('model_generations')
        .update({ status: 'failed' })
        .eq('id', generationId)
        .eq('user_id', user.id);

      return new Response(
        JSON.stringify({ status: 'failed', error: errorMsg }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Still processing
    return new Response(
      JSON.stringify({ status: 'processing' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Check generation error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Check failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
