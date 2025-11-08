import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Download, Upload } from 'lucide-react';
import { BrowserSettings } from '@/services/settingsService';
import { settingsService } from '@/services/settingsService';
import { useToast } from '@/hooks/use-toast';

interface AdvancedSettingsProps {
  settings: BrowserSettings;
  onChange: <K extends keyof BrowserSettings>(key: K, value: BrowserSettings[K]) => void;
}

export const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({ settings, onChange }) => {
  const { toast } = useToast();

  const handleExportSettings = () => {
    const settingsJson = settingsService.exportSettings();
    const blob = new Blob([settingsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pingcat-settings.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Settings exported",
      description: "Your settings have been exported successfully.",
    });
  };

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const success = settingsService.importSettings(content);
      if (success) {
        // Reload settings
        const newSettings = settingsService.getSettings();
        Object.keys(newSettings).forEach(key => {
          onChange(key as keyof BrowserSettings, newSettings[key as keyof BrowserSettings]);
        });
        toast({
          title: "Settings imported",
          description: "Your settings have been imported successfully.",
        });
      } else {
        toast({
          title: "Import failed",
          description: "Failed to import settings. Please check the file format.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Advanced Settings</CardTitle>
          <CardDescription>
            Advanced configuration options for power users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Hardware Acceleration */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="hardware-accel">Hardware Acceleration</Label>
              <p className="text-sm text-muted-foreground">
                Use GPU acceleration for better performance (requires restart)
              </p>
            </div>
            <Switch
              id="hardware-accel"
              checked={settings.hardwareAcceleration}
              onCheckedChange={(checked) => onChange('hardwareAcceleration', checked)}
            />
          </div>

          {/* Developer Tools */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="dev-tools">Enable Developer Tools</Label>
              <p className="text-sm text-muted-foreground">
                Allow access to browser developer tools and debugging features
              </p>
            </div>
            <Switch
              id="dev-tools"
              checked={settings.enableDevTools}
              onCheckedChange={(checked) => onChange('enableDevTools', checked)}
            />
          </div>

          {/* Performance Settings */}
          <div className="space-y-4">
            <Label className="text-base">Performance</Label>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="max-tabs">Maximum Tabs</Label>
                <Input
                  id="max-tabs"
                  type="number"
                  min="1"
                  max="100"
                  value={settings.maxTabs}
                  onChange={(e) => onChange('maxTabs', parseInt(e.target.value) || 20)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="memory-limit">Memory Limit (MB)</Label>
                <Input
                  id="memory-limit"
                  type="number"
                  min="128"
                  max="2048"
                  value={settings.memoryLimit}
                  onChange={(e) => onChange('memoryLimit', parseInt(e.target.value) || 512)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="preload-tabs">Preload Tabs</Label>
                <p className="text-sm text-muted-foreground">
                  Load tab content in background for faster switching
                </p>
              </div>
              <Switch
                id="preload-tabs"
                checked={settings.preloadTabs}
                onCheckedChange={(checked) => onChange('preloadTabs', checked)}
              />
            </div>
          </div>

          {/* Proxy Settings */}
          <div className="space-y-4">
            <Label className="text-base">Proxy Settings</Label>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="proxy-enabled">Enable Proxy</Label>
                <p className="text-sm text-muted-foreground">
                  Use a proxy server for all connections
                </p>
              </div>
              <Switch
                id="proxy-enabled"
                checked={settings.proxySettings.enabled}
                onCheckedChange={(checked) =>
                  onChange('proxySettings', { ...settings.proxySettings, enabled: checked })
                }
              />
            </div>

            {settings.proxySettings.enabled && (
              <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-muted">
                <div className="space-y-2">
                  <Label htmlFor="proxy-host">Proxy Host</Label>
                  <Input
                    id="proxy-host"
                    value={settings.proxySettings.host}
                    onChange={(e) =>
                      onChange('proxySettings', { ...settings.proxySettings, host: e.target.value })
                    }
                    placeholder="proxy.example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="proxy-port">Proxy Port</Label>
                  <Input
                    id="proxy-port"
                    type="number"
                    min="1"
                    max="65535"
                    value={settings.proxySettings.port}
                    onChange={(e) =>
                      onChange('proxySettings', {
                        ...settings.proxySettings,
                        port: parseInt(e.target.value) || 8080
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="proxy-username">Username (Optional)</Label>
                  <Input
                    id="proxy-username"
                    value={settings.proxySettings.username || ''}
                    onChange={(e) =>
                      onChange('proxySettings', {
                        ...settings.proxySettings,
                        username: e.target.value
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="proxy-password">Password (Optional)</Label>
                  <Input
                    id="proxy-password"
                    type="password"
                    value={settings.proxySettings.password || ''}
                    onChange={(e) =>
                      onChange('proxySettings', {
                        ...settings.proxySettings,
                        password: e.target.value
                      })
                    }
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Settings Management</CardTitle>
          <CardDescription>
            Import or export your browser settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button variant="outline" onClick={handleExportSettings}>
              <Download className="h-4 w-4 mr-2" />
              Export Settings
            </Button>
            <div>
              <input
                type="file"
                accept=".json"
                onChange={handleImportSettings}
                className="hidden"
                id="import-settings"
              />
              <Button variant="outline" onClick={() => document.getElementById('import-settings')?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Import Settings
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Export your settings to a JSON file or import settings from a previously exported file.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
