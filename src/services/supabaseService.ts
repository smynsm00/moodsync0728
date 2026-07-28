import { supabase } from '../lib/supabaseClient';
import type { MoodPreset, SavedToneLock, FilterParams } from '../types/moodsync';
import type { Json } from '../types/supabase';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  user_tier: 'free' | 'premium' | 'team';
}

export interface UserProject {
  id: string;
  user_id: string;
  title: string;
  view_mode: string;
  split_position: number;
  active_saved_tone_id: string | null;
}

// 1. Fetch AI Mood Presets from Supabase
export const fetchPresetsFromSupabase = async (): Promise<MoodPreset[]> => {
  try {
    const { data, error } = await supabase
      .from('presets')
      .select('*')
      .order('name');

    if (error) {
      console.warn('Supabase fetch presets error, fallback to local:', error);
      return [];
    }

    if (data && data.length > 0) {
      return data.map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category as MoodPreset['category'],
        description: item.description || '',
        previewColor: item.preview_color,
        defaultParams: item.default_params as unknown as FilterParams,
        isPremium: item.is_premium,
      }));
    }
    return [];
  } catch (err) {
    console.error('Supabase fetchPresets error:', err);
    return [];
  }
};

// 2. Fetch User Profiles from Supabase (5 dummy users)
export const fetchProfilesFromSupabase = async (): Promise<UserProfile[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at');

    if (error) {
      console.warn('Supabase fetchProfiles error:', error);
      return [];
    }
    return (data || []) as UserProfile[];
  } catch (err) {
    console.error('Supabase fetchProfiles error:', err);
    return [];
  }
};

// 2.5. Create New User Profile in Supabase Live DB
export const createProfileInSupabase = async (
  email: string,
  fullName: string
): Promise<UserProfile | null> => {
  try {
    const id = crypto.randomUUID();
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id,
        email,
        full_name: fullName,
        user_tier: 'free',
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase createProfile error:', error);
      return null;
    }
    return data as UserProfile;
  } catch (err) {
    console.error('Supabase createProfile error:', err);
    return null;
  }
};

// 3. Fetch User Projects
export const fetchProjectsFromSupabase = async (userId: string): Promise<UserProject[]> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetchProjects error:', error);
      return [];
    }
    return (data || []) as UserProject[];
  } catch (err) {
    console.error('Supabase fetchProjects error:', err);
    return [];
  }
};

// 4. Fetch All Projects Across All Users
export const fetchAllProjectsFromSupabase = async (): Promise<UserProject[]> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetchAllProjects error:', error);
      return [];
    }
    return (data || []) as UserProject[];
  } catch (err) {
    console.error('Supabase fetchAllProjects error:', err);
    return [];
  }
};

// 5. Create New Project in Supabase
export const createProjectInSupabase = async (
  userId: string,
  title: string
): Promise<UserProject | null> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .insert({
        user_id: userId,
        title,
        view_mode: 'split',
        split_position: 50,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase createProject error:', error);
      return null;
    }
    return data as UserProject;
  } catch (err) {
    console.error('Supabase createProject error:', err);
    return null;
  }
};

// 6. Fetch Saved Tone Lock Slots for a Project
export const fetchSavedToneLocksFromSupabase = async (projectId: string): Promise<SavedToneLock[]> => {
  try {
    const { data, error } = await supabase
      .from('saved_tone_locks')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetchSavedToneLocks error:', error);
      return [];
    }

    if (data && data.length > 0) {
      return data.map((item) => ({
        id: item.id,
        name: item.name,
        anchorImageName: item.anchor_image_name,
        params: item.params as unknown as FilterParams,
        createdAt: new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        presetId: item.preset_id || undefined,
      }));
    }
    return [];
  } catch (err) {
    console.error('Supabase fetchSavedToneLocks error:', err);
    return [];
  }
};

// 7. Save New Tone Lock Slot to Supabase
export const saveToneLockToSupabase = async (
  projectId: string,
  name: string,
  anchorImageName: string,
  params: FilterParams
): Promise<SavedToneLock | null> => {
  try {
    const { data, error } = await supabase
      .from('saved_tone_locks')
      .insert({
        project_id: projectId,
        name,
        anchor_image_name: anchorImageName,
        params: params as unknown as Json,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase saveToneLock error:', error);
      return null;
    }

    if (data) {
      return {
        id: data.id,
        name: data.name,
        anchorImageName: data.anchor_image_name,
        params: data.params as unknown as FilterParams,
        createdAt: new Date(data.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    }
    return null;
  } catch (err) {
    console.error('Supabase saveToneLock error:', err);
    return null;
  }
};

// 8. Delete Saved Tone Lock Slot from Supabase
export const deleteToneLockFromSupabase = async (slotId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('saved_tone_locks')
      .delete()
      .eq('id', slotId);

    if (error) {
      console.error('Supabase deleteToneLock error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase deleteToneLock error:', err);
    return false;
  }
};

// 9. Call Supabase Edge Function with Gemini API
export const analyzeMoodWithGemini = async (imageName?: string): Promise<{ 
  success: boolean; 
  aiAnalysis?: string; 
  recommendedParams?: FilterParams; 
  error?: string 
}> => {
  try {
    const { data, error } = await supabase.functions.invoke('analyze-mood', {
      body: { imageName }
    });

    if (error) {
      console.error('Supabase Edge Function invoke error:', error);
      return { success: false, error: error.message };
    }

    if (data?.error) {
      return { success: false, error: data.error };
    }

    return { 
      success: true, 
      aiAnalysis: data?.aiAnalysis, 
      recommendedParams: data?.recommendedParams as FilterParams 
    };
  } catch (err) {
    console.error('analyzeMoodWithGemini exception:', err);
    return { success: false, error: (err as Error).message };
  }
};
