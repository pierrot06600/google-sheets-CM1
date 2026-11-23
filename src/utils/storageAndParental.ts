export interface AccessibilitySettings {
  dyslexiaMode: boolean;
  highContrast: boolean;
  textScale: 'normal' | 'lg' | 'xl';
  reducedMotion: boolean;
}

export interface LocalProgressState {
  completedStepIds: string[];
  unlockedBadges: string[];
  accessibility: AccessibilitySettings;
}

export const STORAGE_KEY = 'atelier_tableur_cm1_local_v1';

export const DEFAULT_LOCAL_STATE: LocalProgressState = {
  completedStepIds: [],
  unlockedBadges: [],
  accessibility: {
    dyslexiaMode: false,
    highContrast: false,
    textScale: 'normal',
    reducedMotion: false,
  },
};

export function loadLocalState(): LocalProgressState {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return structuredClone(DEFAULT_LOCAL_STATE);
    }
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_LOCAL_STATE);
    const parsed = JSON.parse(raw) as Partial<LocalProgressState>;
    return {
      completedStepIds: Array.isArray(parsed.completedStepIds) ? parsed.completedStepIds : [],
      unlockedBadges: Array.isArray(parsed.unlockedBadges) ? parsed.unlockedBadges : [],
      accessibility: {
        ...DEFAULT_LOCAL_STATE.accessibility,
        ...(parsed.accessibility ?? {}),
      },
    };
  } catch {
    return structuredClone(DEFAULT_LOCAL_STATE);
  }
}

export function saveLocalState(state: LocalProgressState): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  } catch {
    // Ignore storage quota errors gracefully
  }
}

export function wipeAllLocalData(): LocalProgressState {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Ignore
  }
  return structuredClone(DEFAULT_LOCAL_STATE);
}
