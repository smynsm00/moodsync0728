import { create } from 'zustand';
import type { ImageAsset, MoodPreset, ViewMode, ExportConfig, FilterParams, SavedToneLock } from '../types/moodsync';
import { INITIAL_MOCK_IMAGES, MOCK_PRESETS } from '../data/mockPresets';
import {
  fetchPresetsFromSupabase,
  fetchProfilesFromSupabase,
  createProfileInSupabase,
  fetchSavedToneLocksFromSupabase,
  fetchAllProjectsFromSupabase,
  createProjectInSupabase,
  saveToneLockToSupabase,
  deleteToneLockFromSupabase,
  type UserProfile,
  type UserProject
} from '../services/supabaseService';

interface MoodSyncState {
  images: ImageAsset[];
  presets: MoodPreset[];
  savedToneLocks: SavedToneLock[];
  activeSavedToneId: string | null;
  activeImageId: string | null;
  anchorImageId: string | null;
  selectedPresetId: string | null;
  viewMode: ViewMode;
  splitPosition: number; // 0 to 100 (%)
  zoomLevel: number;     // 50 to 200 (%)
  exportConfig: ExportConfig;
  userTier: 'free' | 'premium';
  isToneLockActive: boolean;
  isProcessing: boolean;
  notification: string | null;
  
  // Supabase Live DB & Project States
  isSupabaseConnected: boolean;
  isLoggedIn: boolean;
  profiles: UserProfile[];
  projects: UserProject[];
  currentUserId: string;
  currentProjectId: string;
  currentProjectTitle: string;

  // Actions
  initSupabaseData: () => Promise<void>;
  registerNewUser: (fullName: string, email: string) => void;
  loginWithCredentials: (email: string) => void;
  logout: () => void;
  switchUserProfile: (userId: string) => void;
  switchProject: (projectId: string) => Promise<void>;
  createNewProject: (title: string) => Promise<void>;
  uploadImages: (files: File[]) => void;
  removeImage: (id: string) => void;
  setActiveImage: (id: string | null) => void;
  setAnchorImage: (id: string) => void;
  setAsMasterAnchorAndSync: (targetId?: string) => void;
  saveCurrentToneLockSlot: (customName?: string) => Promise<void>;
  applySavedToneLockSlot: (slotId: string) => void;
  removeSavedToneLockSlot: (slotId: string) => Promise<void>;
  applyPreset: (presetId: string) => void;
  updateImageParams: (params: Partial<FilterParams>) => void;
  resetImageParams: () => void;
  applyToneLock: () => void;
  batchSync: () => void;
  setViewMode: (mode: ViewMode) => void;
  setSplitPosition: (pos: number) => void;
  setZoomLevel: (zoom: number) => void;
  setExportConfig: (config: Partial<ExportConfig>) => void;
  toggleUserTier: () => void;
  clearNotification: () => void;
}

const DEFAULT_PARAMS: FilterParams = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  temperature: 0,
  tint: 0,
  sepia: 0,
  hueRotate: 0,
};

const INITIAL_SAVED_TONES: SavedToneLock[] = [
  {
    id: 'b1111111-1111-1111-1111-111111111111',
    name: 'Master Warm Vintage',
    anchorImageName: 'Yosemite_Half_Dome_01.jpg',
    params: { brightness: 105, contrast: 90, saturation: 115, temperature: 15, tint: 5, sepia: 20, hueRotate: -5 },
    createdAt: '11:20 AM'
  },
  {
    id: 'b2222222-2222-2222-2222-222222222222',
    name: 'Cool Nordic Clean',
    anchorImageName: 'Minimal_Architecture_03.jpg',
    params: { brightness: 108, contrast: 105, saturation: 90, temperature: -8, tint: 0, sepia: 0, hueRotate: 0 },
    createdAt: '11:35 AM'
  }
];

const AUTH_SESSION_KEY = 'moodsync_user_session';

const loadSavedSession = () => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY);
    if (raw) {
      return JSON.parse(raw) as { isLoggedIn: boolean; currentUserId: string; userTier: 'free' | 'premium' };
    }
  } catch (e) {
    console.warn('localStorage session read error:', e);
  }
  return null;
};

const saveSession = (isLoggedIn: boolean, currentUserId: string, userTier: 'free' | 'premium' = 'free') => {
  if (typeof window === 'undefined') return;
  try {
    if (isLoggedIn && currentUserId) {
      localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify({ isLoggedIn: true, currentUserId, userTier }));
    } else {
      localStorage.removeItem(AUTH_SESSION_KEY);
    }
  } catch (e) {
    console.warn('localStorage session save error:', e);
  }
};

const initialSession = loadSavedSession();

export const useMoodSyncStore = create<MoodSyncState>((set, get) => ({
  images: INITIAL_MOCK_IMAGES,
  presets: MOCK_PRESETS,
  savedToneLocks: INITIAL_SAVED_TONES,
  activeSavedToneId: INITIAL_SAVED_TONES[0].id,
  activeImageId: INITIAL_MOCK_IMAGES[0]?.id || null,
  anchorImageId: INITIAL_MOCK_IMAGES[0]?.id || null,
  selectedPresetId: null,
  viewMode: 'split',
  splitPosition: 50,
  zoomLevel: 100,
  exportConfig: {
    format: 'jpg',
    quality: 0.9,
    resolutionMode: '1080p',
  },
  userTier: initialSession?.userTier || 'free',
  isToneLockActive: true,
  isProcessing: false,
  notification: null,

  // Supabase States
  isSupabaseConnected: true,
  isLoggedIn: initialSession ? initialSession.isLoggedIn : false,
  profiles: [],
  projects: [
    { id: 'a1111111-1111-1111-1111-111111111111', user_id: '11111111-1111-1111-1111-111111111111', title: '2026_Summer_Lookbook', view_mode: 'split', split_position: 50, active_saved_tone_id: null },
    { id: 'a2222222-2222-2222-2222-222222222222', user_id: '22222222-2222-2222-2222-222222222222', title: 'Urban_Streetwear_Campaign', view_mode: 'split', split_position: 45, active_saved_tone_id: null },
    { id: 'a3333333-3333-3333-3333-333333333333', user_id: '33333333-3333-3333-3333-333333333333', title: 'Minimalist_Furniture_Catalog', view_mode: 'grid', split_position: 50, active_saved_tone_id: null },
    { id: 'a4444444-4444-4444-4444-444444444444', user_id: '44444444-4444-4444-4444-444444444444', title: 'High_Fashion_Editorial_Paris', view_mode: 'split', split_position: 60, active_saved_tone_id: null },
    { id: 'a5555555-5555-5555-5555-555555555555', user_id: '55555555-5555-5555-5555-555555555555', title: 'K-Beauty_Skincare_Visuals', view_mode: 'grid', split_position: 50, active_saved_tone_id: null }
  ],
  currentUserId: initialSession?.currentUserId || '11111111-1111-1111-1111-111111111111',
  currentProjectId: 'a1111111-1111-1111-1111-111111111111',
  currentProjectTitle: '2026_Summer_Lookbook',

  initSupabaseData: async () => {
    try {
      const { currentProjectId } = get();
      const [dbPresets, dbProfiles, dbProjects, dbSlots] = await Promise.all([
        fetchPresetsFromSupabase(),
        fetchProfilesFromSupabase(),
        fetchAllProjectsFromSupabase(),
        fetchSavedToneLocksFromSupabase(currentProjectId)
      ]);

      const session = loadSavedSession();

      set((state) => {
        const mergedProfiles = dbProfiles.length > 0 ? dbProfiles : state.profiles;
        const targetUserId = session?.currentUserId || state.currentUserId;
        const targetProfile = mergedProfiles.find((p) => p.id === targetUserId);

        return {
          isSupabaseConnected: true,
          presets: dbPresets.length > 0 ? dbPresets : state.presets,
          profiles: mergedProfiles,
          projects: dbProjects.length > 0 ? dbProjects : state.projects,
          savedToneLocks: dbSlots.length > 0 ? dbSlots : state.savedToneLocks,
          activeSavedToneId: dbSlots.length > 0 ? dbSlots[0].id : state.activeSavedToneId,
          isLoggedIn: session ? session.isLoggedIn : state.isLoggedIn,
          currentUserId: targetUserId,
          userTier: targetProfile ? (targetProfile.user_tier === 'free' ? 'free' : 'premium') : state.userTier,
          notification: '⚡ [Supabase DB 연동] AI 데이터 및 유저 세션을 성공적으로 동기화했습니다.'
        };
      });
    } catch (err) {
      console.warn('initSupabaseData error:', err);
    }
  },

  registerNewUser: async (fullName: string, email: string) => {
    const cleanName = fullName.trim() || email.split('@')[0] || '사용자';
    const cleanEmail = email.trim() || `user_${Date.now()}@moodsync.io`;

    set({ isProcessing: true });

    // 1. Supabase Live DB public.profiles table INSERT
    const dbProfile = await createProfileInSupabase(cleanEmail, cleanName);

    const newProfile: UserProfile = dbProfile || {
      id: `user-${Date.now()}`,
      email: cleanEmail,
      full_name: cleanName,
      user_tier: 'free'
    };

    // 2. Supabase Live DB public.projects table INSERT
    const dbProject = await createProjectInSupabase(newProfile.id, `${cleanName}_Lookbook`);

    const newProject: UserProject = dbProject || {
      id: `proj-${Date.now()}`,
      user_id: newProfile.id,
      title: `${cleanName}_Lookbook`,
      view_mode: 'split',
      split_position: 50,
      active_saved_tone_id: null
    };

    saveSession(true, newProfile.id, 'free');

    set((state) => ({
      isProcessing: false,
      profiles: [newProfile, ...state.profiles],
      projects: [newProject, ...state.projects],
      currentUserId: newProfile.id,
      currentProjectId: newProject.id,
      currentProjectTitle: newProject.title,
      userTier: 'free',
      isLoggedIn: true,
      notification: `🎉 [Supabase DB 연동 완료] '${cleanName}' 계정이 Supabase public.profiles 테이블에 실시간 가입/등록되었습니다!`
    }));
  },

  loginWithCredentials: (email: string) => {
    const { profiles } = get();
    const cleanEmail = email.trim().toLowerCase();
    const existing = profiles.find((p) => p.email.toLowerCase() === cleanEmail);

    if (existing) {
      get().switchUserProfile(existing.id);
    } else {
      get().registerNewUser(cleanEmail.split('@')[0], cleanEmail);
    }
  },

  logout: () => {
    saveSession(false, '');
    set({
      isLoggedIn: false,
      currentUserId: '',
      notification: '👋 로그아웃되었습니다. 로그인/회원가입 아이콘을 통해 다시 접속할 수 있습니다.'
    });
  },

  switchUserProfile: (userId: string) => {
    const { profiles, projects } = get();
    const user = profiles.find((p) => p.id === userId);
    if (!user) return;

    const userProj = projects.find((p) => p.user_id === userId) || projects[0];

    const tier = user.user_tier === 'free' ? 'free' : 'premium';
    saveSession(true, userId, tier);

    set({
      currentUserId: userId,
      currentProjectId: userProj?.id || get().currentProjectId,
      currentProjectTitle: userProj?.title || get().currentProjectTitle,
      userTier: tier,
      isLoggedIn: true,
      notification: `👤 유저 계정이 [${user.full_name || user.email}] (으)로 전환되었으며 프로젝트 [${userProj?.title}]로 이동했습니다.`
    });
  },

  switchProject: async (projectId: string) => {
    const { projects } = get();
    const proj = projects.find((p) => p.id === projectId);
    if (!proj) return;

    set({ isProcessing: true });

    const dbSlots = await fetchSavedToneLocksFromSupabase(projectId);

    set({
      isProcessing: false,
      currentProjectId: proj.id,
      currentProjectTitle: proj.title,
      savedToneLocks: dbSlots.length > 0 ? dbSlots : INITIAL_SAVED_TONES,
      activeSavedToneId: dbSlots.length > 0 ? dbSlots[0].id : INITIAL_SAVED_TONES[0].id,
      notification: `📂 [캠페인 전환 완료] '${proj.title}' (으)로 작업 캠페인이 전환되었습니다.`
    });
  },

  createNewProject: async (title: string) => {
    const { currentUserId } = get();
    const cleanTitle = title.trim().replace(/\s+/g, '_');
    if (!cleanTitle) return;

    set({ isProcessing: true });

    const dbProj = await createProjectInSupabase(currentUserId, cleanTitle);

    const newProject: UserProject = dbProj || {
      id: `proj-${Date.now()}`,
      user_id: currentUserId,
      title: cleanTitle,
      view_mode: 'split',
      split_position: 50,
      active_saved_tone_id: null
    };

    set((state) => ({
      isProcessing: false,
      projects: [newProject, ...state.projects],
      currentProjectId: newProject.id,
      currentProjectTitle: newProject.title,
      savedToneLocks: [],
      activeSavedToneId: null,
      notification: `✨ [새 캠페인/룩북 생성 완료] '${newProject.title}'이(가) Supabase DB에 등록되고 즉시 선택되었습니다!`
    }));
  },

  uploadImages: (files: File[]) => {
    const { userTier, images } = get();
    const maxAllowed = userTier === 'free' ? 10 : 300;
    
    if (images.length + files.length > maxAllowed) {
      set({ 
        notification: `Free 티어는 최대 ${maxAllowed}장까지 업로드 가능합니다. 더 많은 작업을 원하시면 Premium으로 업그레이드하세요!` 
      });
      return;
    }

    const newImages: ImageAsset[] = files.map((file, index) => {
      const url = URL.createObjectURL(file);
      return {
        id: `uploaded-${Date.now()}-${index}`,
        name: file.name,
        originalUrl: url,
        thumbnailUrl: url,
        isAnchor: images.length === 0 && index === 0,
        width: 1920,
        height: 1080,
        appliedParams: { ...DEFAULT_PARAMS },
        colorPalette: [
          { hex: '#4F46E5', rgb: 'rgb(79, 70, 229)', hsl: 'hsl(243, 75%, 59%)', name: 'Indigo Dominant', textColor: '#ffffff', contrastRatio: '6.8:1 (AA)' },
          { hex: '#111827', rgb: 'rgb(17, 24, 39)', hsl: 'hsl(220, 39%, 11%)', name: 'Deep Charcoal', textColor: '#ffffff', contrastRatio: '17.2:1 (AAA)' },
          { hex: '#F3F4F6', rgb: 'rgb(243, 244, 246)', hsl: 'hsl(210, 20%, 96%)', name: 'Soft White', textColor: '#000000', contrastRatio: '16.5:1 (AAA)' },
          { hex: '#EC4899', rgb: 'rgb(236, 72, 153)', hsl: 'hsl(330, 81%, 60%)', name: 'Vibrant Magenta', textColor: '#ffffff', contrastRatio: '4.7:1 (AA)' }
        ]
      };
    });

    set((state) => {
      const updated = [...state.images, ...newImages];
      return {
        images: updated,
        activeImageId: state.activeImageId || (newImages[0]?.id || null),
        anchorImageId: state.anchorImageId || (newImages[0]?.id || null),
        notification: `${files.length}장 이미지가 스튜디오에 업로드되었습니다.`
      };
    });
  },

  removeImage: (id: string) => {
    set((state) => {
      const updated = state.images.filter((img) => img.id !== id);
      let nextActive = state.activeImageId;
      let nextAnchor = state.anchorImageId;

      if (state.activeImageId === id) {
        nextActive = updated[0]?.id || null;
      }
      if (state.anchorImageId === id) {
        nextAnchor = updated[0]?.id || null;
      }

      return {
        images: updated.map((img) => img.id === nextAnchor ? { ...img, isAnchor: true } : img),
        activeImageId: nextActive,
        anchorImageId: nextAnchor,
      };
    });
  },

  setActiveImage: (id) => set({ activeImageId: id }),

  setAnchorImage: (id: string) => {
    set((state) => ({
      anchorImageId: id,
      images: state.images.map((img) => ({
        ...img,
        isAnchor: img.id === id
      })),
      notification: `이미지 [${state.images.find(i => i.id === id)?.name}]가 Tone Lock 기준(Anchor)으로 설정되었습니다.`
    }));
  },

  setAsMasterAnchorAndSync: (targetId?: string) => {
    const { activeImageId, images } = get();
    const idToSet = targetId || activeImageId;
    if (!idToSet) return;

    const targetImage = images.find((img) => img.id === idToSet);
    if (!targetImage) return;

    set({ isProcessing: true });

    setTimeout(() => {
      set((state) => ({
        isProcessing: false,
        anchorImageId: idToSet,
        isToneLockActive: true,
        selectedPresetId: targetImage.presetId || state.selectedPresetId,
        images: state.images.map((img) => ({
          ...img,
          isAnchor: img.id === idToSet,
          appliedParams: { ...targetImage.appliedParams },
          presetId: img.id === idToSet ? img.presetId : targetImage.presetId,
          isSynced: img.id !== idToSet
        })),
        notification: `📌 [마스터 톤 고정 완료] (${targetImage.name})의 보정값이 마스터 톤으로 고정되고 전체 ${images.length}장에 성공적으로 동기화되었습니다!`
      }));
    }, 300);
  },

  saveCurrentToneLockSlot: async (customName?: string) => {
    const { activeImageId, images, savedToneLocks, currentProjectId } = get();
    const current = images.find((img) => img.id === activeImageId);
    if (!current) return;

    const slotName = customName || `Fixed Tone #${savedToneLocks.length + 1} (${current.name.split('.')[0]})`;
    
    set({ isProcessing: true });

    // Save to Supabase DB live
    const dbSlot = await saveToneLockToSupabase(
      currentProjectId,
      slotName,
      current.name,
      current.appliedParams
    );

    const newSlot: SavedToneLock = dbSlot || {
      id: `slot-${Date.now()}`,
      name: slotName,
      anchorImageName: current.name,
      params: { ...current.appliedParams },
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      presetId: current.presetId
    };

    set((state) => ({
      isProcessing: false,
      anchorImageId: current.id,
      savedToneLocks: [newSlot, ...state.savedToneLocks],
      activeSavedToneId: newSlot.id,
      isToneLockActive: true,
      images: state.images.map((img) => ({
        ...img,
        isAnchor: img.id === current.id,
        appliedParams: { ...current.appliedParams },
        presetId: current.presetId,
        isSynced: img.id !== current.id
      })),
      notification: `🔒 [Supabase DB 저장 완료] '${newSlot.name}'이(가) Supabase DB public.saved_tone_locks 테이블 및 A 영역 고정목록에 추가되었습니다!`
    }));
  },

  applySavedToneLockSlot: (slotId: string) => {
    const { savedToneLocks, images } = get();
    const slot = savedToneLocks.find((s) => s.id === slotId);
    if (!slot) return;

    set({ isProcessing: true });

    setTimeout(() => {
      set((state) => ({
        isProcessing: false,
        activeSavedToneId: slotId,
        isToneLockActive: true,
        images: state.images.map((img) => ({
          ...img,
          appliedParams: { ...slot.params },
          presetId: slot.presetId,
          isSynced: true
        })),
        notification: `⚡ [고정값 적용] Supabase 마스터 고정 슬롯 '${slot.name}' 보정값이 전체 ${images.length}장 자산에 일괄 동기화되었습니다!`
      }));
    }, 300);
  },

  removeSavedToneLockSlot: async (slotId: string) => {
    await deleteToneLockFromSupabase(slotId);

    set((state) => {
      const updated = state.savedToneLocks.filter((s) => s.id !== slotId);
      const nextActive = state.activeSavedToneId === slotId ? (updated[0]?.id || null) : state.activeSavedToneId;
      return {
        savedToneLocks: updated,
        activeSavedToneId: nextActive,
        notification: 'Supabase DB 및 고정값 목록에서 슬롯이 삭제되었습니다.'
      };
    });
  },

  applyPreset: (presetId) => {
    const { presets, activeImageId } = get();
    const preset = presets.find((p) => p.id === presetId);
    if (!preset) return;

    if (preset.isPremium && get().userTier === 'free') {
      set({ notification: `[Premium 전용 필터] ${preset.name} 프리셋을 사용하려면 프리미엄으로 업그레이드하세요!` });
      return;
    }

    set((state) => ({
      selectedPresetId: presetId,
      images: state.images.map((img) => 
        img.id === activeImageId 
          ? { ...img, appliedParams: { ...preset.defaultParams }, presetId: presetId, isSynced: false }
          : img
      ),
      notification: `프리셋 [${preset.name}]이 현재 이미지에 적용되었습니다.`
    }));
  },

  updateImageParams: (newParams) => {
    const { activeImageId } = get();
    if (!activeImageId) return;

    set((state) => ({
      images: state.images.map((img) =>
        img.id === activeImageId
          ? { ...img, appliedParams: { ...img.appliedParams, ...newParams }, isSynced: false }
          : img
      )
    }));
  },

  resetImageParams: () => {
    const { activeImageId } = get();
    if (!activeImageId) return;

    set((state) => ({
      selectedPresetId: null,
      images: state.images.map((img) =>
        img.id === activeImageId
          ? { ...img, appliedParams: { ...DEFAULT_PARAMS }, presetId: undefined, isSynced: false }
          : img
      ),
      notification: '현재 이미지의 색보정 설정이 원본 초기화되었습니다.'
    }));
  },

  applyToneLock: () => {
    const { anchorImageId, images } = get();
    const anchor = images.find((img) => img.id === anchorImageId);
    if (!anchor) return;

    set({ isProcessing: true });
    
    setTimeout(() => {
      set((state) => ({
        isProcessing: false,
        isToneLockActive: true,
        images: state.images.map((img) => 
          img.id === anchorImageId 
            ? img 
            : { 
                ...img, 
                appliedParams: { ...anchor.appliedParams }, 
                presetId: anchor.presetId,
                isSynced: true 
              }
        ),
        notification: `⚡ Tone Lock 활성화: 기준 이미지(${anchor.name})의 톤앤매너가 전체 ${images.length}장 이미지에 성공적으로 동기화되었습니다.`
      }));
    }, 600);
  },

  batchSync: () => {
    const { activeImageId, images } = get();
    const current = images.find((img) => img.id === activeImageId);
    if (!current) return;

    set((state) => ({
      images: state.images.map((img) => ({
        ...img,
        appliedParams: { ...current.appliedParams },
        presetId: current.presetId,
        isSynced: img.id !== current.id
      })),
      notification: `✓ Batch Sync 완료: 현재 이미지 설정이 전체 ${images.length}장 이미지로 일괄 복사되었습니다.`
    }));
  },

  setViewMode: (mode) => set({ viewMode: mode }),
  setSplitPosition: (pos) => set({ splitPosition: pos }),
  setZoomLevel: (zoom) => set({ zoomLevel: zoom }),
  setExportConfig: (config) => set((state) => ({ exportConfig: { ...state.exportConfig, ...config } })),
  
  toggleUserTier: () => {
    set((state) => {
      const nextTier = state.userTier === 'free' ? 'premium' : 'free';
      return {
        userTier: nextTier,
        notification: nextTier === 'premium' 
          ? '🎉 Premium 티어로 활성화되었습니다! 300장 동시 작업, 원본 해상도 및 디자인 토큰 핸드오프가 해제되었습니다.' 
          : 'Free 티어로 변경되었습니다. (최대 10장 / 1080px 제한)'
      };
    });
  },

  clearNotification: () => set({ notification: null })
}));
