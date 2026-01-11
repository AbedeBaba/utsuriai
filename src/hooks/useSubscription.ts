import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export type SubscriptionPlan = 'trial' | 'starter' | 'pro' | 'creator';

export interface UserSubscription {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  credits_remaining: number;
  pro_generations_remaining: number;
  created_at: string;
  updated_at: string;
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSubscription = async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      
      // Cast the plan to our type
      setSubscription(data as unknown as UserSubscription);
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  // Check if user has access to Pro quality generation
  const hasProAccess = subscription?.plan === 'starter' || 
                       subscription?.plan === 'pro' || 
                       subscription?.plan === 'creator';

  // For trial users, check if they have Pro generations remaining
  const canUseProGeneration = hasProAccess || 
                              (subscription?.plan === 'trial' && (subscription?.pro_generations_remaining ?? 0) > 0);

  const hasCredits = (subscription?.credits_remaining ?? 0) > 0;

  return {
    subscription,
    loading,
    error,
    hasProAccess,
    canUseProGeneration,
    hasCredits,
    refetch: fetchSubscription,
  };
}
