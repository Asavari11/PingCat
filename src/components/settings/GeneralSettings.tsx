import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BrowserSettings } from '@/services/settingsService';

interface GeneralSettingsProps {
  settings: BrowserSettings;
  onChange: <K extends keyof BrowserSettings>(key: K, value: BrowserSettings[K]) => void;
}

export const GeneralSettings: React.FC<GeneralSettingsProps> = ({ settings, onChange }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>
            Configure basic browser behavior and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Startup Page */}
          <div className="space-y-2">
            <Label htmlFor="startup-page">Startup Page</Label>
            <Input
              id="startup-page"
              value={settings.startupPage}
              onChange={(e) => onChange('startupPage', e.target.value)}
              placeholder="https://www.google.com"
            />
            <p className="text-sm text-muted-foreground">
              The page to open when you start the browser
            </p>
          </div>

          {/* Search Engine */}
          <div className="space-y-2">
            <Label htmlFor="search-engine">Default Search Engine</Label>
            <Select
              value={settings.searchEngine}
              onValueChange={(value: 'google' | 'bing' | 'duckduckgo') =>
                onChange('searchEngine', value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="google">Google</SelectItem>
                <SelectItem value="bing">Bing</SelectItem>
                <SelectItem value="duckduckgo">DuckDuckGo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* New Tab Page */}
          <div className="space-y-2">
            <Label htmlFor="new-tab-page">New Tab Page</Label>
            <Select
              value={settings.newTabPage}
              onValueChange={(value: 'blank' | 'homepage') =>
                onChange('newTabPage', value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="blank">Blank Page</SelectItem>
                <SelectItem value="homepage">Homepage</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
