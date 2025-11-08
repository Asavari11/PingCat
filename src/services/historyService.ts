export interface HistoryEntry {
  id: string;
  url: string;
  title: string;
  timestamp: number;
  favicon?: string;
}

class HistoryService {
  private readonly STORAGE_KEY = 'browser_history';
  private readonly MAX_ENTRIES = 1000;

  // Get all history entries
  getHistory(): HistoryEntry[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading history:', error);
      return [];
    }
  }

  // Add a new history entry
  addEntry(entry: Omit<HistoryEntry, 'id' | 'timestamp'>): void {
    try {
      const history = this.getHistory();
      const newEntry: HistoryEntry = {
        ...entry,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
      };

      // Remove duplicate URLs (keep the most recent)
      const filteredHistory = history.filter(h => h.url !== entry.url);

      // Add new entry at the beginning
      filteredHistory.unshift(newEntry);

      // Limit the number of entries
      const limitedHistory = filteredHistory.slice(0, this.MAX_ENTRIES);

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(limitedHistory));
    } catch (error) {
      console.error('Error saving history entry:', error);
    }
  }

  // Search history entries
  searchHistory(query: string): HistoryEntry[] {
    const history = this.getHistory();
    const lowerQuery = query.toLowerCase();

    return history.filter(entry =>
      entry.title.toLowerCase().includes(lowerQuery) ||
      entry.url.toLowerCase().includes(lowerQuery)
    );
  }

  // Filter by date range
  filterByDate(startDate: Date, endDate: Date): HistoryEntry[] {
    const history = this.getHistory();
    const startTime = startDate.getTime();
    const endTime = endDate.getTime();

    return history.filter(entry =>
      entry.timestamp >= startTime && entry.timestamp <= endTime
    );
  }

  // Filter by domain/site
  filterBySite(site: string): HistoryEntry[] {
    const history = this.getHistory();
    const lowerSite = site.toLowerCase();

    return history.filter(entry =>
      entry.url.toLowerCase().includes(lowerSite)
    );
  }

  // Clear all history
  clearHistory(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  }

  // Get history grouped by date
  getHistoryGroupedByDate(): { [date: string]: HistoryEntry[] } {
    const history = this.getHistory();
    const grouped: { [date: string]: HistoryEntry[] } = {};

    history.forEach(entry => {
      const date = new Date(entry.timestamp).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(entry);
    });

    return grouped;
  }

  // Get recent history (last N entries)
  getRecentHistory(limit: number = 50): HistoryEntry[] {
    return this.getHistory().slice(0, limit);
  }
}

export const historyService = new HistoryService();
