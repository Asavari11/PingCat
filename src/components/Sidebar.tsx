

import { Settings, Bookmark, Sparkles, Eye, Terminal } from "lucide-react";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import React from 'react';

interface SidebarProps {
    isVerticalLayout: boolean;
   
    isAssistantOpen: boolean; 
    onAssistantToggle: () => void; 
}

export const Sidebar = ({ isVerticalLayout, isAssistantOpen, onAssistantToggle }: SidebarProps) => {
    if (isVerticalLayout) {
        return (
            <div className="fixed bottom-4 left-4 z-50">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" className="rounded-full">
                            <Settings className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">Settings</TooltipContent>
                </Tooltip>
            </div>
        );
    }

    return (
        <div className="w-14 bg-sidebar border-r border-border flex flex-col items-center py-4 gap-2">
            
            <div className="flex-1" />
            
            <Tooltip>
                <TooltipTrigger asChild className="border black">
                    <Button variant="ghost" size="icon">
                        <Terminal className="h-5 w-5" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Preview</TooltipContent>
            </Tooltip>


            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Eye className="h-5 w-5" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Preview</TooltipContent>
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
                    <Button variant="ghost" size="icon">
                        <Bookmark className="h-5 w-5" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Bookmarks</TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Settings className="h-5 w-5" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Settings</TooltipContent>
            </Tooltip>
        </div>
    );
};