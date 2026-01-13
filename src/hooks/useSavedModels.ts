import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ModelConfig } from '@/context/ModelConfigContext';

export interface SavedModel {
  id: string;
  user_id: string;
  name: string;
  gender: string;
  ethnicity: string;
  skin_tone: string;
  hair_color: string | null;
  eye_color: string;
  body_type: string;
  hair_type: string | null;
  beard_type: string | null;
  pose: string | null;
  background: string | null;
  face_type: string | null;
  facial_expression: string | null;
  modest_option: string | null;
  created_at: string;
  updated_at: string;
}

export function useSavedModels() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [savedModels, setSavedModels] = useState<SavedModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchSavedModels = useCallback(async () => {
    if (!user) {
      setSavedModels([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Using type assertion since saved_models table was just created
      const { data, error } = await (supabase
        .from('saved_models' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }) as any);

      if (error) throw error;
      setSavedModels((data as SavedModel[]) || []);
    } catch (err) {
      console.error('Error fetching saved models:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSavedModels();
  }, [fetchSavedModels]);

  const saveModel = useCallback(async (config: ModelConfig, name: string): Promise<boolean> => {
    if (!user) {
      toast({
        title: 'Not authenticated',
        description: 'Please sign in to save models.',
        variant: 'destructive',
      });
      return false;
    }

    if (!name.trim()) {
      toast({
        title: 'Name required',
        description: 'Please enter a name for your model.',
        variant: 'destructive',
      });
      return false;
    }

    try {
      setSaving(true);
      // Using type assertion since saved_models table was just created
      const { error } = await (supabase
        .from('saved_models' as any)
        .insert({
          user_id: user.id,
          name: name.trim(),
          gender: config.gender,
          ethnicity: config.ethnicity,
          skin_tone: config.skinTone,
          hair_color: config.hairColor || null,
          eye_color: config.eyeColor,
          body_type: config.bodyType,
          hair_type: config.hairType || null,
          beard_type: config.beardType || null,
          pose: config.pose || null,
          background: config.background || null,
          face_type: config.faceType || null,
          facial_expression: config.facialExpression || null,
          modest_option: config.modestOption || null,
        }) as any);

      if (error) throw error;

      toast({
        title: 'Model saved',
        description: `"${name}" has been saved for future use.`,
      });

      await fetchSavedModels();
      return true;
    } catch (err) {
      console.error('Error saving model:', err);
      toast({
        title: 'Failed to save model',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setSaving(false);
    }
  }, [user, toast, fetchSavedModels]);

  const deleteModel = useCallback(async (id: string): Promise<boolean> => {
    if (!user) return false;

    try {
      setDeleting(id);
      // Using type assertion since saved_models table was just created
      const { error } = await (supabase
        .from('saved_models' as any)
        .delete()
        .eq('id', id) as any);

      if (error) throw error;

      setSavedModels(prev => prev.filter(m => m.id !== id));
      toast({
        title: 'Model deleted',
        description: 'The saved model has been removed.',
      });
      return true;
    } catch (err) {
      console.error('Error deleting model:', err);
      toast({
        title: 'Failed to delete model',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setDeleting(null);
    }
  }, [user, toast]);

  const convertToModelConfig = useCallback((savedModel: SavedModel): Partial<ModelConfig> => {
    return {
      gender: savedModel.gender,
      ethnicity: savedModel.ethnicity,
      skinTone: savedModel.skin_tone,
      hairColor: savedModel.hair_color || '',
      eyeColor: savedModel.eye_color,
      bodyType: savedModel.body_type,
      hairType: savedModel.hair_type || '',
      beardType: savedModel.beard_type || '',
      pose: savedModel.pose || '',
      background: savedModel.background || '',
      faceType: savedModel.face_type || '',
      facialExpression: savedModel.facial_expression || '',
      modestOption: savedModel.modest_option || '',
    };
  }, []);

  return {
    savedModels,
    loading,
    saving,
    deleting,
    saveModel,
    deleteModel,
    convertToModelConfig,
    refetch: fetchSavedModels,
  };
}
