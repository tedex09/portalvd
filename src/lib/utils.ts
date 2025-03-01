import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function updateCssVariables(color: string) {
  if (typeof document === 'undefined') return;
  
  // Convert hex to HSL
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  // Convert to degrees and percentages
  const hDeg = Math.round(h * 360);
  const sPct = Math.round(s * 100);
  const lPct = Math.round(l * 100);

  // Update CSS variables
  document.documentElement.style.setProperty('--primary', `${hDeg} ${sPct}% ${lPct}%`);
}

// Apply stored settings on client side
export function applyStoredSettings() {
  if (typeof window === 'undefined') return;
  
  try {
    const settingsStr = localStorage.getItem('settings-storage');
    if (settingsStr) {
      const settings = JSON.parse(settingsStr);
      if (settings?.state?.settings?.primaryColor) {
        updateCssVariables(settings.state.settings.primaryColor);
      }
    }
  } catch (error) {
    console.error('Failed to apply stored settings:', error);
  }
}