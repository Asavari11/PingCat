import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { BrowserSettings } from '@/services/settingsService';
import { historyService } from '@/services/historyService';
import { downloadService } from '@/services/downloadService';
import { useToast } from '@/hooks/use-toast';

interface PrivacySettingsProps {
  settings: BrowserSettings;
  onChange: <K extends keyof BrowserSettings>(key: K, value: BrowserSettings[K]) => void;
}

export const PrivacySettings: React.FC<PrivacySettingsProps> = ({ settings, onChange }) => {
  const { toast } = useToast();

  const handleClearHistory = () => {
    historyService.clearHistory();
    toast({
      title: "History cleared",
      description: "All browsing history has been cleared.",
    });
  };

  const handleClearDownloads = () => {
    downloadService.clearDownloads();
    toast({
      title: "Downloads cleared",
      description: "All download history has been cleared.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Privacy & Security</CardTitle>
          <CardDescription>
            Control your privacy settings and data management
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Incognito Mode */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="incognito">Enable Incognito Mode</Label>
              <p className="text-sm text-muted-foreground">
                Allow opening incognito windows for private browsing
              </p>
            </div>
            <Switch
              id="incognito"
              checked={settings.enableIncognito}
              onCheckedChange={(checked) => onChange('enableIncognito', checked)}
            />
          </div>

          {/* Clear on Exit */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="clear-history">Clear History on Exit</Label>
              <p className="text-sm text-muted-foreground">
                Automatically clear browsing history when closing the browser
              </p>
            </div>
            <Switch
              id="clear-history"
              checked={settings.clearHistoryOnExit}
              onCheckedChange={(checked) => onChange('clearHistoryOnExit', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="clear-downloads">Clear Downloads on Exit</Label>
              <p className="text-sm text-muted-foreground">
                Automatically clear download history when closing the browser
              </p>
            </div>
            <Switch
              id="clear-downloads"
              checked={settings.clearDownloadsOnExit}
              onCheckedChange={(checked) => onChange('clearDownloadsOnExit', checked)}
            />
          </div>

          {/* Third-party Cookies */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="block-cookies">Block Third-party Cookies</Label>
              <p className="text-sm text-muted-foreground">
                Prevent websites from storing cookies from other domains
              </p>
            </div>
            <Switch
              id="block-cookies"
              checked={settings.blockThirdPartyCookies}
              onCheckedChange={(checked) => onChange('blockThirdPartyCookies', checked)}
            />
          </div>

          {/* Do Not Track */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="do-not-track">Send "Do Not Track" Signal</Label>
              <p className="text-sm text-muted-foreground">
                Request websites not to track your browsing activity
              </p>
            </div>
            <Switch
              id="do-not-track"
              checked={settings.enableDoNotTrack}
              onCheckedChange={(checked) => onChange('enableDoNotTrack', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>
            Clear your browsing data and history
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Clear Browsing History</Label>
              <p className="text-sm text-muted-foreground">
                Remove all browsing history permanently
              </p>
            </div>
            <Button variant="destructive" size="sm" onClick={handleClearHistory}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear History
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Clear Download History</Label>
              <p className="text-sm text-muted-foreground">
                Remove all download history permanently
              </p>
            </div>
            <Button variant="destructive" size="sm" onClick={handleClearDownloads}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Downloads
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
