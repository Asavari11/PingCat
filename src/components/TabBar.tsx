import { X, Plus, PanelLeftOpen, PanelTopOpen, Search, Eye, Sparkles, Bookmark } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState, useRef, useEffect } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { File as FileIcon } from "lucide-react";


export interface Tab {
  id: string;
  title: string;
  icon?: string;
}

interface TabBarProps {
  tabs: Tab[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onTabAdd: () => void;
  isVertical?: boolean;
  onLayoutToggle: () => void;
}

export const TabBar = ({
  tabs,
  activeTabId,
  onTabChange,
  onTabClose,
  onTabAdd,
  isVertical = false,
  onLayoutToggle,
}: TabBarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(200);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);

  const filteredTabs = tabs.filter((tab) =>
    tab.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const newWidth = Math.min(Math.max(e.clientX, 50), 200);
      setSidebarWidth(newWidth);
      setIsCollapsed(newWidth < 100);
    };

    const handleMouseUp = () => {
      if (isResizing.current) isResizing.current = false;
      document.body.style.cursor = "default";
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  if (isVertical) {
    return (
      
      <div
  ref={sidebarRef} 
  className="h-full flex flex-col relative border-r border-border"
  style={{
    width: sidebarWidth,
    background: `linear-gradient(180deg, hsl(var(--tab-bar-bg)) 0%, hsl(var(--tab-bar-bg)) 100%)`,
    boxShadow: `0 2px 8px rgba(0, 0, 0, 0.1)`,
  }}
>



        <div className="flex items-center gap-2 px-2 py-2 border-b border-border bg-sidebar/50">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onLayoutToggle}>
                <PanelTopOpen className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Switch to horizontal</TooltipContent>
          </Tooltip>

          {sidebarWidth > 160 && (
            <>
              <div className="flex-1" />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Eye className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Preview</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Sparkles className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>AI Assistant</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Bookmark className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Bookmarks</TooltipContent>
              </Tooltip>

              <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Search className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2">
                  <Input
                    placeholder="Search tabs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8"
                  />
                  {searchQuery && (
                    <div className="mt-2 max-h-48 overflow-y-auto scrollbar-hide">
                      {filteredTabs.map((tab) => (
                        <div
                          key={tab.id}
                          onClick={() => {
                            onTabChange(tab.id);
                            setIsSearchOpen(false);
                            setSearchQuery("");
                          }}
                          className="px-2 py-1.5 hover:bg-accent rounded cursor-pointer text-sm"
                        >
                          {tab.title}
                        </div>
                      ))}
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onTabAdd}>
                <Plus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>New Tab</TooltipContent>
          </Tooltip>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide py-2 px-1 space-y-1">
          {[...tabs].reverse().map((tab) => (
            <div
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`group relative flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-all duration-200 ${
                activeTabId === tab.id
                  ? "bg-tab-active shadow-lg border-l-2 border-primary"
                  : "bg-tab-inactive hover:bg-tab-hover"
              }`}
            >
              <div className="flex items-center gap-2 flex-1 truncate">
                {tab.icon ? (
                  <img src={tab.icon} alt="" className="w-4 h-4 rounded-sm" />
                ) : (
                  isCollapsed && <div className="w-3 h-3 bg-gray-400 rounded-sm" />
                )}

                {!isCollapsed && (
                  <span className="truncate text-xs font-medium text-foreground">
                    {tab.title}
                  </span>
                )}
              </div>

              { (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-1 w-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-secondary/80 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTabClose(tab.id);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>

        <div
          onMouseDown={() => (isResizing.current = true)}
          className="absolute top-0 right-0 h-full w-1 cursor-ew-resize bg-transparent hover:bg-gray-300/40"
        />
      </div>
    );
  }

  const horizontalTabsRef = useRef<HTMLDivElement>(null);

  return (
    <div
  className="flex items-end gap-1 px-2 pt-2 border-b border-border overflow-hidden min-h-[48px] max-h-[200px]"
  style={{
    background: `linear-gradient(90deg, hsl(var(--tab-bar-bg)) 0%, hsl(var(--tab-bar-bg)) 100%)`,
    boxShadow: `0 2px 8px rgba(0,0,0,0.1)`,
  }}
>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={onLayoutToggle}
            className="h-8 w-8 rounded-full hover:bg-tab-hover transition-colors mb-1 flex-shrink-0"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Switch to vertical</TooltipContent>
      </Tooltip>

      <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-tab-hover transition-colors mb-1 flex-shrink-0">
            <Search className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2">
          <Input
            placeholder="Search tabs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8"
          />
          {searchQuery && (
            <div className="mt-2 max-h-48 overflow-y-auto scrollbar-hide">
              {filteredTabs.map((tab) => (
                <div
                  key={tab.id}
                  onClick={() => {
                    onTabChange(tab.id);
                    setIsSearchOpen(false);
                    setSearchQuery("");
                  }}
                  className="px-2 py-1.5 hover:bg-accent rounded cursor-pointer text-sm"
                >
                  {tab.title}
                </div>
              ))}
            </div>
          )}
        </PopoverContent>
      </Popover>

      <div className="flex-1 flex overflow-x-auto scrollbar-hide gap-1" ref={horizontalTabsRef}>
        {tabs.map((tab) => {
          const minWidth = Math.max(60, 180 - tabs.length * 10); 
          return (
            <div
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              style={{ minWidth }}
              className={`group relative flex items-center gap-2 px-2 py-2 rounded-t-lg cursor-pointer transition-all duration-200 ${
                activeTabId === tab.id
                  ? "bg-tab-active shadow-lg border-t-2 border-primary"
                  : "bg-tab-inactive hover:bg-tab-hover"
              }`}
            >
              <div className="flex items-center gap-2 flex-1 truncate">
                {tab.icon && <img src={tab.icon} alt="" className="w-4 h-4 rounded-sm" />}
                <span className="truncate text-xs font-medium text-foreground">{tab.title}</span>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-secondary/80 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onTabClose(tab.id);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          );
        })}
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={onTabAdd}
        className="h-8 w-8 rounded-full hover:bg-tab-hover transition-colors mb-1 flex-shrink-0"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};
