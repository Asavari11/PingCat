import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, RotateCcw } from 'lucide-react';
import { settingsService, BrowserSettings } from '@/services/settingsService';
import { GeneralSettings } from '@/components/settings/GeneralSettings';
import { PrivacySettings } from '@/components/settings/PrivacySettings';
import { AppearanceSettings } from '@/components/settings/AppearanceSettings';
import { ProfileSettings } from '@/components/settings/ProfileSettings';
import { AdvancedSettings } from '@/components/settings/AdvancedSettings';
import { useToast } from '@/hooks/use-toast';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [settings, setSettings] = useState<BrowserSettings>(settingsService.getSettings());
  const [hasChanges, setHasChanges] = useState(false);

  const handleSettingChange = <K extends keyof BrowserSettings>(
    key: K,
    value: BrowserSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    settingsService.updateSettings(settings);
    setHasChanges(false);
    toast({
      title: "Settings saved",
      description: "Your settings have been saved successfully.",
    });
  };

  const handleReset = () => {
    const defaultSettings = settingsService.getSettings();
    // Reset to defaults but keep current theme
    const resetSettings = { ...defaultSettings, theme: settings.theme };
    setSettings(resetSettings);
    settingsService.updateSettings(resetSettings);
    setHasChanges(false);
    toast({
      title: "Settings reset",
      description: "Settings have been reset to defaults.",
    });
  };

  const handleBack = () => {
    if (hasChanges) {
      const confirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to leave?"
      );
      if (!confirmed) return;
    }
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Settings</h1>
              <p className="text-muted-foreground">Customize your PingCat browser experience</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Defaults
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="profiles">Profiles</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <GeneralSettings settings={settings} onChange={handleSettingChange} />
          </TabsContent>

          <TabsContent value="privacy">
            <PrivacySettings settings={settings} onChange={handleSettingChange} />
          </TabsContent>

          <TabsContent value="appearance">
            <AppearanceSettings settings={settings} onChange={handleSettingChange} />
          </TabsContent>

          <TabsContent value="profiles">
            <ProfileSettings settings={settings} onChange={handleSettingChange} />
          </TabsContent>

          <TabsContent value="advanced">
            <AdvancedSettings settings={settings} onChange={handleSettingChange} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
