import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Bookmark, Trash2 } from "lucide-react";

interface BookmarkListProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    bookmarks: Array<{
        url: string;
        title?: string;
        favicon?: string;
        id?: string;
    }>;
    onNavigate: (url: string) => void;  // Changed from onOpenBookmark to onNavigate
    onRemoveBookmark: (url: string) => void;
}

export const BookmarkList: React.FC<BookmarkListProps> = ({
    open,
    onOpenChange,
    bookmarks,
    onNavigate,
    onRemoveBookmark
}) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Bookmark className="h-5 w-5" />
                        Bookmarks
                    </DialogTitle>
                </DialogHeader>

                <ScrollArea className="h-[60vh] w-full pr-4">
                    {bookmarks.length === 0 ? (
                        <div className="text-center text-muted-foreground p-4">
                            No bookmarks yet
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {bookmarks.map((bookmark) => (
                                <div
                                    key={bookmark.id || bookmark.url}
                                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted group"
                                >
                                    {bookmark.favicon ? (
                                        <img
                                            src={bookmark.favicon}
                                            alt=""
                                            className="w-4 h-4"
                                            onError={(e) => {
                                                // Hide broken favicons
                                                (e.target as HTMLImageElement).style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <Bookmark className="w-4 h-4 text-muted-foreground" />
                                    )}

                                    <div
                                        className="flex-1 cursor-pointer overflow-hidden"
                                        onClick={() => onNavigate(bookmark.url)}
                                    >
                                        <div className="font-medium truncate">
                                            {bookmark.title || bookmark.url}
                                        </div>
                                        {bookmark.title && (
                                            <div className="text-sm text-muted-foreground truncate">
                                                {bookmark.url}
                                            </div>
                                        )}
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => onRemoveBookmark(bookmark.url)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};