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

interface Profile {
  id: string;
  name: string;
}

export const BrowserToolbar = ({
  searchValue,
  onSearchChange,
  activeTabId,
  profileName,
  activeProfileId,
  allProfiles,
  onProfileSwitch,
}: {
  searchValue: string;
  onSearchChange: (value: string) => void;
  activeTabId: string;
  profileName: string;
  activeProfileId: string;
  allProfiles: Profile[];
  onProfileSwitch: (id: string, name: string) => void;
}) => {
  const { theme, setTheme } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const avatarFallbackLetter = profileName
    ? profileName.charAt(0).toUpperCase()
    : "U";

  useEffect(() => {
    if (!searchValue) {
      inputRef.current?.focus();
    }
  }, [activeTabId]);

  const handleLogout = () => {
    // Reloads the app (redirects to welcome or login page)
    window.location.reload();
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-background border-b border-border">
      {/* Undo / Redo / Refresh */}
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <Undo className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <Redo className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <RefreshCw className="h-4 w-4" />
      </Button>

      {/* Search bar */}
      <div
        className="flex-1 flex items-center gap-2 px-3 py-1 bg-secondary/50 rounded-lg border border-input
        focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-opacity-150
        focus-within:shadow-md transition-all duration-200"
      >
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          placeholder="Search or enter address..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="border-0 bg-transparent h-7 px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>

      {/* Theme toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        {theme === "dark" ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
      </Button>

      {/* Profile Dropdown */}
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

          {/* All Profiles */}
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
                {profile.id === activeProfileId && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </DropdownMenuItem>
            ))
          ) : (
            <DropdownMenuItem disabled>No profiles available</DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => console.log("Manage Profiles")}
            className="cursor-pointer text-sm text-foreground hover:text-foreground"
          >
            Manage Profiles
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleLogout}
            className="cursor-pointer text-sm text-foreground hover:text-foreground"
          >
            <LogOutIcon className="h-4 w-4 mr-3 text-red-500" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* More Options */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem>
            <AppWindow className="h-4 w-4 mr-3" />
            New window
          </DropdownMenuItem>
          <DropdownMenuItem>New incognito window</DropdownMenuItem>
          <DropdownMenuItem>
            <DownloadIcon className="h-4 w-4 mr-3" />
            Downloads
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2 bg-white/15">
            <Avatar className="h-6 w-6 cursor-pointer hover:opacity-80 transition-opacity">
              <AvatarImage src="" alt={profileName} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {avatarFallbackLetter}
              </AvatarFallback>
            </Avatar>
            {profileName}
          </DropdownMenuItem>
          <DropdownMenuItem>
            <HistoryIcon className="h-4 w-4 mr-3" />
            History
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Bookmark className="h-4 w-4 mr-3" />
            Bookmarks
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="h-4 w-4 mr-3" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem>
            <HelpCircleIcon className="h-4 w-4 mr-3" />
            Help
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
