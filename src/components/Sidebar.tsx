
import { Bookmark, Sparkles, Terminal } from "lucide-react";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import React from 'react';
import { useNavigate } from "react-router-dom";

interface SidebarProps {
    isVerticalLayout: boolean;

    isAssistantOpen: boolean;
    onAssistantToggle: () => void;
    // current active tab url (optional)
    currentUrl?: string;
    // called when user single-clicks bookmark button
    onToggleBookmark?: (url?: string) => void;
    // called when user double-clicks bookmark button
    onOpenBookmarks?: () => void;
    // whether currentUrl is bookmarked
    isBookmarked?: boolean;
}

export const Sidebar = ({ isVerticalLayout, isAssistantOpen, onAssistantToggle, currentUrl, onToggleBookmark, onOpenBookmarks, isBookmarked }: SidebarProps) => {
    const navigate = useNavigate();

    if (isVerticalLayout) {
        // vertical layout no longer shows a dedicated settings button
        return null;
    }

    return (
        <div className="w-14 bg-sidebar border-r border-border flex flex-col items-center py-4 gap-2">

            <div className="flex-1" />

            <Tooltip>
                <TooltipTrigger asChild className="border black">
                    <Button variant="ghost" size="icon" onClick={() => (window as any).electronAPI?.openTerminal && (window as any).electronAPI.openTerminal()}>
                        <Terminal className="h-5 w-5" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Terminal</TooltipContent>
            </Tooltip>





            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant={isAssistantOpen ? 'default' : 'ghost'}
                        size="icon"
                        className={isAssistantOpen ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}
                        onClick={onAssistantToggle}
                    >
                        <Sparkles className="h-5 w-5" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="right">AI Assistant</TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant={isBookmarked ? 'default' : 'ghost'}
                        size="icon"
                        onClick={() => currentUrl && onToggleBookmark && onToggleBookmark(currentUrl)}
                        onDoubleClick={() => onOpenBookmarks && onOpenBookmarks()}
                        title={!currentUrl ? 'Double-click to see bookmarks' : 
                               isBookmarked ? 'Bookmarked (double-click to open bookmarks)' : 
                               'Bookmark this page (double-click to open bookmarks)'}
                    >
                        <Bookmark className="h-5 w-5" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Bookmarks</TooltipContent>
            </Tooltip>
        </div>
    );
};
