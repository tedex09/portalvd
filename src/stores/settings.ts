import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { updateCssVariables } from '@/lib/utils';

interface Settings {
  requestLimitPerDay: number;
  requestLimitPerWeek: number;
  whatsappEnabled: boolean;
  twilioAccountSid?: string;
  twilioAuthToken?: string;
  twilioPhoneNumber?: string;
  primaryColor: string;
  platformEnabled: boolean;
  disabledMessage: string;
  registrationEnabled: boolean;
}

interface SettingsState {
  settings: Settings;
  setSettings: (settings: Partial<Settings>) => void;
  initializeSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: {
        requestLimitPerDay: 10,
        requestLimitPerWeek: 50,
        whatsappEnabled: false,
        primaryColor: '#B91D3A',
        platformEnabled: true,
        disabledMessage: '',
        registrationEnabled: true,
      },
      setSettings: (newSettings) => {
        set((state) => {
          const updatedSettings = { ...state.settings, ...newSettings };
          
          // Apply primary color to CSS variables when it changes
          if (newSettings.primaryColor && typeof window !== 'undefined') {
            updateCssVariables(newSettings.primaryColor);
          }
          
          return { settings: updatedSettings };
        });
      },
      initializeSettings: async () => {
        try {
          const response = await fetch('/api/admin/settings');
          if (response.ok) {
            const data = await response.json();
            get().setSettings(data);
          }
        } catch (error) {
          console.error('Failed to initialize settings:', error);
        }
      }
    }),
    {
      name: 'settings-storage',
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);