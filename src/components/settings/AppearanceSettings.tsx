import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { BrowserSettings } from '@/services/settingsService';

interface AppearanceSettingsProps {
  settings: BrowserSettings;
  onChange: <K extends keyof BrowserSettings>(key: K, value: BrowserSettings[K]) => void;
}

export const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({ settings, onChange }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize the look and feel of your browser
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme */}
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Select
              value={settings.theme}
              onValueChange={(value: 'light' | 'dark' | 'system') =>
                onChange('theme', value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Choose your preferred color theme
            </p>
          </div>

          {/* Layout */}
          <div className="space-y-2">
            <Label htmlFor="layout">Layout</Label>
            <Select
              value={settings.layout}
              onValueChange={(value: 'horizontal' | 'vertical') =>
                onChange('layout', value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="horizontal">Horizontal</SelectItem>
                <SelectItem value="vertical">Vertical</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Choose the tab bar layout orientation
            </p>
          </div>

          {/* Font Size */}
          <div className="space-y-2">
            <Label htmlFor="font-size">Font Size</Label>
            <Select
              value={settings.fontSize}
              onValueChange={(value: 'small' | 'medium' | 'large') =>
                onChange('fontSize', value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Adjust the font size throughout the browser
            </p>
          </div>

          {/* UI Elements */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="bookmarks-bar">Show Bookmarks Bar</Label>
                <p className="text-sm text-muted-foreground">
                  Display bookmarks bar below the toolbar
                </p>
              </div>
              <Switch
                id="bookmarks-bar"
                checked={settings.showBookmarksBar}
                onCheckedChange={(checked) => onChange('showBookmarksBar', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="status-bar">Show Status Bar</Label>
                <p className="text-sm text-muted-foreground">
                  Display status information at the bottom
                </p>
              </div>
              <Switch
                id="status-bar"
                checked={settings.showStatusBar}
                onCheckedChange={(checked) => onChange('showStatusBar', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
