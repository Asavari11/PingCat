import React, { useState, useEffect } from "react";
import { Search, Trash2, Calendar, Download, ExternalLink, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { downloadService, DownloadEntry } from "@/services/downloadService";
import { useNavigate } from "react-router-dom";

const Downloads: React.FC = () => {
  const [downloads, setDownloads] = useState<DownloadEntry[]>([]);
  const [filteredDownloads, setFilteredDownloads] = useState<DownloadEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    loadDownloads();
  }, []);

  useEffect(() => {
    filterDownloads();
  }, [downloads, searchQuery, selectedDate]);

  const loadDownloads = () => {
    const downloadsData = downloadService.getDownloads();
    setDownloads(downloadsData);
  };

  const filterDownloads = () => {
    let filtered = downloads;

    // Search filter
    if (searchQuery) {
      filtered = downloadService.searchDownloads(searchQuery);
    }

    // Date filter
    if (selectedDate) {
      const date = new Date(selectedDate);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      filtered = filtered.filter(entry =>
        entry.timestamp >= date.getTime() && entry.timestamp < nextDay.getTime()
      );
    }

    setFilteredDownloads(filtered);
  };

  const clearDownloads = () => {
    if (window.confirm("Are you sure you want to clear all download history?")) {
      downloadService.clearDownloads();
      setDownloads([]);
      setFilteredDownloads([]);
    }
  };

  const openFile = (filePath: string) => {
    // Use Electron's shell to open the file
    if (window.electronAPI && window.electronAPI.openFile) {
      window.electronAPI.openFile(filePath);
    } else {
      console.error('Electron API not available for opening files');
    }
  };

  const showInFolder = (filePath: string) => {
    // Use Electron's shell to show file in folder
    if (window.electronAPI && window.electronAPI.showItemInFolder) {
      window.electronAPI.showItemInFolder(filePath);
    } else {
      console.error('Electron API not available for showing in folder');
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  const groupedDownloads = filteredDownloads.reduce((groups, entry) => {
    const date = formatDate(entry.timestamp);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(entry);
    return groups;
  }, {} as { [date: string]: DownloadEntry[] });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'cancelled': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="h-8 w-8"
            >
              ←
            </Button>
            <h1 className="text-2xl font-bold">Downloads</h1>
          </div>
          <Button
            variant="destructive"
            onClick={clearDownloads}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Clear Downloads
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search downloads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Downloads List */}
        <div className="space-y-6">
          {Object.keys(groupedDownloads).length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Download className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No downloads found</h3>
                <p className="text-muted-foreground text-center">
                  {searchQuery || selectedDate
                    ? "Try adjusting your filters to see more results."
                    : "Your download history will appear here."}
                </p>
              </CardContent>
            </Card>
          ) : (
            Object.entries(groupedDownloads)
              .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
              .map(([date, entries]) => (
                <Card key={date}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      {date}
                      <Badge variant="secondary" className="ml-auto">
                        {entries.length} {entries.length === 1 ? 'download' : 'downloads'}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {entries.map((entry) => (
                        <div
                          key={entry.id}
                          className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Download className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium truncate">{entry.filename}</h4>
                              <p className="text-sm text-muted-foreground truncate">{entry.url}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {downloadService.formatFileSize(entry.fileSize)}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {getDomain(entry.url)}
                                </Badge>
                                <div className={`w-2 h-2 rounded-full ${getStatusColor(entry.status)}`} />
                                <span className="text-xs text-muted-foreground capitalize">{entry.status}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{formatTime(entry.timestamp)}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openFile(entry.filePath)}
                              className="h-8 w-8 p-0"
                              title="Open file"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => showInFolder(entry.filePath)}
                              className="h-8 w-8 p-0"
                              title="Show in folder"
                            >
                              <FolderOpen className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Downloads;
