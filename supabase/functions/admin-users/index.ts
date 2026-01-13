import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get auth token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user is admin using the has_role function
    const { data: isAdmin, error: roleError } = await supabaseAdmin.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });

    if (roleError || !isAdmin) {
      return new Response(JSON.stringify({ error: "Access denied. Admin role required." }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, ...params } = await req.json();

    switch (action) {
      case "list_users": {
        // Get all users from auth.users with their subscriptions and profiles
        const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
        
        if (authError) {
          throw new Error(`Failed to list users: ${authError.message}`);
        }

        // Get all subscriptions
        const { data: subscriptions, error: subError } = await supabaseAdmin
          .from("user_subscriptions")
          .select("*");

        if (subError) {
          throw new Error(`Failed to get subscriptions: ${subError.message}`);
        }

        // Get all profiles
        const { data: profiles, error: profError } = await supabaseAdmin
          .from("profiles")
          .select("*");

        if (profError) {
          throw new Error(`Failed to get profiles: ${profError.message}`);
        }

        // Combine the data
        const users = authUsers.users.map((authUser) => {
          const subscription = subscriptions?.find((s) => s.user_id === authUser.id);
          const profile = profiles?.find((p) => p.user_id === authUser.id);
          
          return {
            id: authUser.id,
            email: authUser.email,
            created_at: authUser.created_at,
            first_name: profile?.first_name || null,
            last_name: profile?.last_name || null,
            plan: subscription?.plan || "trial",
            credits_remaining: subscription?.credits_remaining || 0,
            pro_generations_remaining: subscription?.pro_generations_remaining || 2,
            standard_generations_remaining: subscription?.standard_generations_remaining || 5,
          };
        });

        return new Response(JSON.stringify({ users }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "update_credits": {
        const { user_id, credits_remaining, pro_generations_remaining, standard_generations_remaining } = params;

        if (!user_id) {
          return new Response(JSON.stringify({ error: "user_id is required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const updateData: Record<string, number> = {};
        if (credits_remaining !== undefined) updateData.credits_remaining = credits_remaining;
        if (pro_generations_remaining !== undefined) updateData.pro_generations_remaining = pro_generations_remaining;
        if (standard_generations_remaining !== undefined) updateData.standard_generations_remaining = standard_generations_remaining;

        const { error: updateError } = await supabaseAdmin
          .from("user_subscriptions")
          .update(updateData)
          .eq("user_id", user_id);

        if (updateError) {
          throw new Error(`Failed to update credits: ${updateError.message}`);
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "update_plan": {
        const { user_id, plan } = params;

        if (!user_id || !plan) {
          return new Response(JSON.stringify({ error: "user_id and plan are required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const validPlans = ["trial", "starter", "pro", "creator"];
        if (!validPlans.includes(plan)) {
          return new Response(JSON.stringify({ error: "Invalid plan" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Set credits based on plan
        let credits_remaining = 0;
        let pro_generations_remaining = 0;
        let standard_generations_remaining = 0;

        switch (plan) {
          case "trial":
            pro_generations_remaining = 2;
            standard_generations_remaining = 5;
            break;
          case "starter":
            credits_remaining = 100;
            break;
          case "pro":
            credits_remaining = 400;
            break;
          case "creator":
            credits_remaining = 1000;
            break;
        }

        const { error: updateError } = await supabaseAdmin
          .from("user_subscriptions")
          .update({
            plan,
            credits_remaining,
            pro_generations_remaining,
            standard_generations_remaining,
          })
          .eq("user_id", user_id);

        if (updateError) {
          throw new Error(`Failed to update plan: ${updateError.message}`);
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (error: unknown) {
    console.error("Admin users error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
