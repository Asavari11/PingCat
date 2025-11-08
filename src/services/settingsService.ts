export interface BrowserSettings {
  // General
  theme: 'light' | 'dark' | 'system';
  startupPage: string;
  searchEngine: 'google' | 'bing' | 'duckduckgo';
  newTabPage: 'blank' | 'homepage';

  // Privacy & Security
  enableIncognito: boolean;
  clearHistoryOnExit: boolean;
  clearDownloadsOnExit: boolean;
  blockThirdPartyCookies: boolean;
  enableDoNotTrack: boolean;

  // Appearance
  layout: 'horizontal' | 'vertical';
  showBookmarksBar: boolean;
  showStatusBar: boolean;
  fontSize: 'small' | 'medium' | 'large';

  // Advanced
  hardwareAcceleration: boolean;
  enableDevTools: boolean;
  proxySettings: {
    enabled: boolean;
    host: string;
    port: number;
    username?: string;
    password?: string;
  };

  // Performance
  maxTabs: number;
  preloadTabs: boolean;
  memoryLimit: number; // MB
}

class SettingsService {
  private readonly STORAGE_KEY = 'browser_settings';
  private settings: BrowserSettings;

  constructor() {
    this.settings = this.loadSettings();
  }

  private getDefaultSettings(): BrowserSettings {
    return {
      // General
      theme: 'system',
      startupPage: 'https://www.google.com',
      searchEngine: 'google',
      newTabPage: 'blank',

      // Privacy & Security
      enableIncognito: true,
      clearHistoryOnExit: false,
      clearDownloadsOnExit: false,
      blockThirdPartyCookies: false,
      enableDoNotTrack: false,

      // Appearance
      layout: 'horizontal',
      showBookmarksBar: true,
      showStatusBar: true,
      fontSize: 'medium',

      // Advanced
      hardwareAcceleration: true,
      enableDevTools: true,
      proxySettings: {
        enabled: false,
        host: '',
        port: 8080,
      },

      // Performance
      maxTabs: 20,
      preloadTabs: false,
      memoryLimit: 512,
    };
  }

  private loadSettings(): BrowserSettings {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...this.getDefaultSettings(), ...parsed };
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
    return this.getDefaultSettings();
  }

  private saveSettings(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  // Get all settings
  getSettings(): BrowserSettings {
    return { ...this.settings };
  }

  // Update specific setting
  updateSetting<K extends keyof BrowserSettings>(
    key: K,
    value: BrowserSettings[K]
  ): void {
    this.settings[key] = value;
    this.saveSettings();
  }

  // Update multiple settings
  updateSettings(updates: Partial<BrowserSettings>): void {
    this.settings = { ...this.settings, ...updates };
    this.saveSettings();
  }

  // Reset to defaults
  resetToDefaults(): void {
    this.settings = this.getDefaultSettings();
    this.saveSettings();
  }

  // Export settings as JSON
  exportSettings(): string {
    return JSON.stringify(this.settings, null, 2);
  }

  // Import settings from JSON
  importSettings(jsonString: string): boolean {
    try {
      const imported = JSON.parse(jsonString);
      const validated = { ...this.getDefaultSettings(), ...imported };
      this.settings = validated;
      this.saveSettings();
      return true;
    } catch (error) {
      console.error('Error importing settings:', error);
      return false;
    }
  }

  // Get search engine URL
  getSearchEngineUrl(): string {
    const engines = {
      google: 'https://www.google.com/search?q=',
      bing: 'https://www.bing.com/search?q=',
      duckduckgo: 'https://duckduckgo.com/?q=',
    };
    return engines[this.settings.searchEngine];
  }

  // Check if setting is default
  isDefaultSetting<K extends keyof BrowserSettings>(key: K): boolean {
    const defaults = this.getDefaultSettings();
    return this.settings[key] === defaults[key];
  }
}

export const settingsService = new SettingsService();
