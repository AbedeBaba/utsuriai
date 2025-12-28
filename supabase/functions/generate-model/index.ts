import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { generationId, config } = await req.json();
    
    console.log('Generation request received:', { generationId, config });

    const n8nWebhookUrl = Deno.env.get('N8N_WEBHOOK_URL');
    
    if (!n8nWebhookUrl) {
      console.error('N8N_WEBHOOK_URL is not configured');
      return new Response(
        JSON.stringify({ error: 'Webhook URL not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Calling n8n webhook:', n8nWebhookUrl);

    // Send request to n8n webhook and wait for response
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        generationId,
        config,
        timestamp: new Date().toISOString(),
      }),
    });

    console.log('n8n response status:', n8nResponse.status);

    // Get the response from n8n (from "Respond to Webhook" node)
    const responseText = await n8nResponse.text();
    console.log('n8n response body:', responseText);

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      // If response is not JSON, wrap it
      responseData = { 
        success: n8nResponse.ok, 
        data: responseText,
        status: n8nResponse.status
      };
    }

    if (!n8nResponse.ok) {
      console.error('n8n webhook error:', responseData);
      return new Response(
        JSON.stringify({ 
          error: 'Webhook request failed', 
          details: responseData,
          status: n8nResponse.status 
        }),
        { status: n8nResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        generationId,
        ...responseData
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
