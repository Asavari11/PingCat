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

  getHistory(): HistoryEntry[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading history:', error);
      return [];
    }
  }

  addEntry(entry: Omit<HistoryEntry, 'id' | 'timestamp'>): void {
    try {
      const history = this.getHistory();
      const newEntry: HistoryEntry = {
        ...entry,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
      };

      const filteredHistory = history.filter(h => h.url !== entry.url);

      filteredHistory.unshift(newEntry);

      const limitedHistory = filteredHistory.slice(0, this.MAX_ENTRIES);

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(limitedHistory));
    } catch (error) {
      console.error('Error saving history entry:', error);
    }
  }

  searchHistory(query: string): HistoryEntry[] {
    const history = this.getHistory();
    const lowerQuery = query.toLowerCase();

    return history.filter(entry =>
      entry.title.toLowerCase().includes(lowerQuery) ||
      entry.url.toLowerCase().includes(lowerQuery)
    );
  }

  filterByDate(startDate: Date, endDate: Date): HistoryEntry[] {
    const history = this.getHistory();
    const startTime = startDate.getTime();
    const endTime = endDate.getTime();

    return history.filter(entry =>
      entry.timestamp >= startTime && entry.timestamp <= endTime
    );
  }

  filterBySite(site: string): HistoryEntry[] {
    const history = this.getHistory();
    const lowerSite = site.toLowerCase();

    return history.filter(entry =>
      entry.url.toLowerCase().includes(lowerSite)
    );
  }

  clearHistory(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  }

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

  getRecentHistory(limit: number = 50): HistoryEntry[] {
    return this.getHistory().slice(0, limit);
  }
}

export const historyService = new HistoryService();
