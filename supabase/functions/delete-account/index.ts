import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create a client with the user's token to get their ID
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get the user from the token
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      console.error('Error getting user:', userError);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Deleting account for user:', user.id);

    // Create admin client for deletion operations
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // ==========================================
    // RATE LIMITING - Prevent abuse
    // ==========================================
    const RATE_LIMIT_WINDOW_MS = 3600000; // 1 hour for destructive operations
    const MAX_DELETE_ATTEMPTS_PER_WINDOW = 3;
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
    
    const { data: rateLimitData } = await adminClient
      .from('rate_limits')
      .select('request_count')
      .eq('user_id', user.id)
      .eq('endpoint', 'delete-account')
      .gte('window_start', windowStart)
      .order('window_start', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    const totalAttempts = rateLimitData?.request_count || 0;
    
    if (totalAttempts >= MAX_DELETE_ATTEMPTS_PER_WINDOW) {
      console.warn(`Delete account rate limit exceeded for user ${user.id}`);
      return new Response(
        JSON.stringify({ error: 'Too many delete attempts. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Record this attempt
    const currentHourWindow = new Date(Math.floor(Date.now() / 3600000) * 3600000).toISOString();
    await adminClient
      .from('rate_limits')
      .upsert({
        user_id: user.id,
        endpoint: 'delete-account',
        window_start: currentHourWindow,
        request_count: totalAttempts + 1
      }, { onConflict: 'user_id,endpoint,window_start' });

    // Delete user's model generations
    const { error: generationsError } = await adminClient
      .from('model_generations')
      .delete()
      .eq('user_id', user.id);

    if (generationsError) {
      console.error('Error deleting generations:', generationsError);
    } else {
      console.log('Deleted user generations');
    }

    // Delete user's profile
    const { error: profileError } = await adminClient
      .from('profiles')
      .delete()
      .eq('user_id', user.id);

    if (profileError) {
      console.error('Error deleting profile:', profileError);
    } else {
      console.log('Deleted user profile');
    }

    // Delete the user from auth
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);

    if (deleteError) {
      console.error('Error deleting user from auth:', deleteError);
      return new Response(
        JSON.stringify({ error: 'Failed to delete account', details: deleteError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User account deleted successfully');

    return new Response(
      JSON.stringify({ success: true, message: 'Account deleted successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in delete-account:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});