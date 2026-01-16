import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export type SubscriptionPlan = 'trial' | 'starter' | 'pro' | 'creator';

export interface UserSubscription {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  credits_remaining: number;
  pro_generations_remaining: number;
  standard_generations_remaining: number;
  created_at: string;
  updated_at: string;
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSubscription = useCallback(async () => {
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
      
      setSubscription(data as unknown as UserSubscription);
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  // ==========================================
  // PACKAGE TYPE DETECTION
  // ==========================================
  const isTrial = subscription?.plan === 'trial';
  const isPaid = subscription?.plan === 'starter' || 
                 subscription?.plan === 'pro' || 
                 subscription?.plan === 'creator';

  // ==========================================
  // TRIAL PACKAGE CHECKS (NO CREDITS)
  // Trial: 5 standard generations + 2 pro generations
  // ==========================================
  const trialStandardRemaining = subscription?.standard_generations_remaining ?? 0;
  const trialProRemaining = subscription?.pro_generations_remaining ?? 0;
  
  const canTrialGenerate = isTrial && trialStandardRemaining > 0;
  const canTrialGeneratePro = isTrial && trialProRemaining > 0;

  // ==========================================
  // PAID PACKAGE CHECKS (CREDITS)
  // Standard: 1 credit, Pro: 4 credits
  // ==========================================
  const creditsRemaining = subscription?.credits_remaining ?? 0;
  
  const canPaidGenerate = isPaid && creditsRemaining >= 1;
  const canPaidGeneratePro = isPaid && creditsRemaining >= 4;

  // ==========================================
  // UNIFIED CHECKS
  // ==========================================
  // Can use standard generation?
  const canGenerate = canTrialGenerate || canPaidGenerate;
  
  // Can use pro generation?
  const canUseProGeneration = canTrialGeneratePro || canPaidGeneratePro;

  // Has any credits (for paid packages)
  const hasCredits = creditsRemaining > 0;

  // Legacy: hasProAccess means user is on a paid plan
  const hasProAccess = isPaid;

  // Trial Pro limit exhausted - used for feature restrictions
  const isTrialProExhausted = isTrial && trialProRemaining <= 0;

  // Pro feature access - ONLY Pro and Creator plans have access to:
  // Backgrounds, Poses, Camera Angles
  const isStarter = subscription?.plan === 'starter';
  const hasProFeatureAccess = subscription?.plan === 'pro' || subscription?.plan === 'creator';

  // Creator feature access - ONLY Creator plan has access to:
  // Face Types, Expressions, Save & Reuse Models
  const hasCreatorFeatureAccess = subscription?.plan === 'creator';

  // Image retention period in hours
  // Creator: 7 days (168 hours), Others: 24 hours
  const imageRetentionHours = hasCreatorFeatureAccess ? 168 : 24;
  const imageRetentionDays = hasCreatorFeatureAccess ? 7 : 1;

  return {
    subscription,
    loading,
    error,
    // Package type
    isTrial,
    isPaid,
    isStarter,
    // Trial-specific
    trialStandardRemaining,
    trialProRemaining,
    canTrialGenerate,
    canTrialGeneratePro,
    // Paid-specific
    creditsRemaining,
    canPaidGenerate,
    canPaidGeneratePro,
    // Unified
    canGenerate,
    canUseProGeneration,
    hasCredits,
    hasProAccess,
    // Feature restrictions
    isTrialProExhausted,
    hasProFeatureAccess,
    hasCreatorFeatureAccess,
    // Image retention
    imageRetentionHours,
    imageRetentionDays,
    refetch: fetchSubscription,
  };
}
