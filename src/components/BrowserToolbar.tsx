import {
  Undo,
  Redo,
  RefreshCw,
  Search,
  Sun,
  Moon,
  MoreVertical,
  Check,
  Bookmark,
  AppWindow,
  HistoryIcon,
  LogOutIcon,
  DownloadIcon,
  HelpCircleIcon,
  Settings,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useTheme } from "next-themes";
import { useRef, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

interface Profile {
  id: string;
  name: string;
}

export const BrowserToolbar = ({
  searchValue,
  onSearchChange,
  onUrlSubmit,
  onGoBack,
  onGoForward,
  onReload,
  activeTabId,
  profileName,
  activeProfileId,
  allProfiles,
  onProfileSwitch,
}: {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onUrlSubmit: (url: string) => void;
  onGoBack?: () => void;
  onGoForward?: () => void;
  onReload?: () => void;
  activeTabId: string;
  profileName: string;
  activeProfileId: string;
  allProfiles: Profile[];
  onProfileSwitch: (id: string, name: string) => void;
}) => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const avatarFallbackLetter = profileName ? profileName.charAt(0).toUpperCase() : "U";

  useEffect(() => {
    if (!searchValue) inputRef.current?.focus();
  }, [activeTabId]);

  const handleLogout = () => {
    window.location.reload();
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-background border-b border-border">
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onGoBack}>
        <Undo className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onGoForward}>
        <Redo className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onReload}>
        <RefreshCw className="h-4 w-4" />
      </Button>
      <div className="flex-1 flex items-center gap-2 px-3 py-1 bg-secondary/50 rounded-lg border border-input">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          placeholder="Search or enter address..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onUrlSubmit(searchValue);
            }
          }}
          className="border-0 bg-transparent h-7 px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="h-8 w-8 cursor-pointer hover:opacity-80 transition-opacity">
            <AvatarImage src="" alt={profileName} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {avatarFallbackLetter}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Profiles</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {allProfiles && allProfiles.length > 0 ? (
            allProfiles.map((profile) => (
              <DropdownMenuItem
                key={profile.id}
                onClick={() => onProfileSwitch(profile.id, profile.name)}
                className="flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center">
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarFallback className="bg-primary text-foreground text-xs">
                      {profile.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {profile.name}
                </div>
                {profile.id === activeProfileId && <Check className="h-4 w-4 text-primary" />}
              </DropdownMenuItem>
            ))
          ) : (
            <DropdownMenuItem disabled>No profiles available</DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem 
              onClick={() => {
                window.open("/manage-profiles", "_blank", "width=800,height=600");
              }}
          >
            Manage Profiles
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout}>
            <LogOutIcon className="h-4 w-4 mr-3 text-red-500" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={() => {
            // Open new window with same behavior as closing last tab
            if ((window as any).electronAPI && (window as any).electronAPI.createNewWindow) {
              // For Electron, create a proper new window
              (window as any).electronAPI.createNewWindow();
            } else {
              // Fallback for web environment
              window.open(window.location.href, "_blank", "width=1200,height=800");
            }
          }}>
            <AppWindow className="h-4 w-4 mr-3" />
            New window
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => window.open("/incognito", "_blank", "width=1200,height=800")}>
            New incognito window
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/history")}>
            <HistoryIcon className="h-4 w-4 mr-3" />
            History
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/settings')}>
            <Settings className="h-4 w-4 mr-3" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/downloads')}>
            <DownloadIcon className="h-4 w-4 mr-3" />
            Downloads
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout}>
            <LogOutIcon className="h-4 w-4 mr-3 text-red-500" />
            Exit
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
