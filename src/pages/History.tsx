import React, { useState, useEffect } from "react";
import { Search, Trash2, Calendar, Globe, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { historyService, HistoryEntry } from "@/services/historyService";
import { useNavigate } from "react-router-dom";

const History: React.FC = () => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<HistoryEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSite, setSelectedSite] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    filterHistory();
  }, [history, searchQuery, selectedDate, selectedSite]);

  const loadHistory = () => {
    const historyData = historyService.getHistory();
    setHistory(historyData);
  };

  const filterHistory = () => {
    let filtered = history;

    // Search filter
    if (searchQuery) {
      filtered = historyService.searchHistory(searchQuery);
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

    // Site filter
    if (selectedSite) {
      filtered = filtered.filter(entry =>
        entry.url.toLowerCase().includes(selectedSite.toLowerCase())
      );
    }

    setFilteredHistory(filtered);
  };

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to clear all browsing history?")) {
      historyService.clearHistory();
      setHistory([]);
      setFilteredHistory([]);
    }
  };

  const openUrl = (url: string) => {
    window.open(url, "_blank");
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

  const groupedHistory = filteredHistory.reduce((groups, entry) => {
    const date = formatDate(entry.timestamp);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(entry);
    return groups;
  }, {} as { [date: string]: HistoryEntry[] });

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
            <h1 className="text-2xl font-bold">Browsing History</h1>
          </div>
          <Button
            variant="destructive"
            onClick={clearHistory}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Clear History
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search history..."
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
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Filter by site..."
                  value={selectedSite}
                  onChange={(e) => setSelectedSite(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* History List */}
        <div className="space-y-6">
          {Object.keys(groupedHistory).length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No history found</h3>
                <p className="text-muted-foreground text-center">
                  {searchQuery || selectedDate || selectedSite
                    ? "Try adjusting your filters to see more results."
                    : "Your browsing history will appear here."}
                </p>
              </CardContent>
            </Card>
          ) : (
            Object.entries(groupedHistory)
              .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
              .map(([date, entries]) => (
                <Card key={date}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      {date}
                      <Badge variant="secondary" className="ml-auto">
                        {entries.length} {entries.length === 1 ? 'visit' : 'visits'}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {entries.map((entry) => (
                        <div
                          key={entry.id}
                          className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => openUrl(entry.url)}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {entry.favicon ? (
                              <img
                                src={entry.favicon}
                                alt=""
                                className="w-4 h-4 rounded"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : (
                              <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium truncate">{entry.title || 'Untitled'}</h4>
                              <p className="text-sm text-muted-foreground truncate">{entry.url}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline" className="text-xs">
                              {getDomain(entry.url)}
                            </Badge>
                            <span>{formatTime(entry.timestamp)}</span>
                            <ExternalLink className="h-4 w-4" />
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

export default History;
