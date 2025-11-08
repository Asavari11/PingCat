export interface DownloadEntry {
  id: string;
  filename: string;
  url: string;
  fileSize: number;
  timestamp: number;
  filePath: string;
  status: 'completed' | 'failed' | 'cancelled';
}

class DownloadService {
  private readonly STORAGE_KEY = 'browser_downloads';
  private readonly MAX_ENTRIES = 1000;

  getDownloads(): DownloadEntry[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading downloads:', error);
      return [];
    }
  }

  addEntry(entry: Omit<DownloadEntry, 'id' | 'timestamp'>): void {
    try {
      const downloads = this.getDownloads();
      const newEntry: DownloadEntry = {
        ...entry,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
      };

      downloads.unshift(newEntry);

      const limitedDownloads = downloads.slice(0, this.MAX_ENTRIES);

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(limitedDownloads));
    } catch (error) {
      console.error('Error saving download entry:', error);
    }
  }

  searchDownloads(query: string): DownloadEntry[] {
    const downloads = this.getDownloads();
    const lowerQuery = query.toLowerCase();

    return downloads.filter(entry =>
      entry.filename.toLowerCase().includes(lowerQuery) ||
      entry.url.toLowerCase().includes(lowerQuery)
    );
  }

  filterByDate(startDate: Date, endDate: Date): DownloadEntry[] {
    const downloads = this.getDownloads();
    const startTime = startDate.getTime();
    const endTime = endDate.getTime();

    return downloads.filter(entry =>
      entry.timestamp >= startTime && entry.timestamp <= endTime
    );
  }

  clearDownloads(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing downloads:', error);
    }
  }

  getDownloadsGroupedByDate(): { [date: string]: DownloadEntry[] } {
    const downloads = this.getDownloads();
    const grouped: { [date: string]: DownloadEntry[] } = {};

    downloads.forEach(entry => {
      const date = new Date(entry.timestamp).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(entry);
    });

    return grouped;
  }

  getRecentDownloads(limit: number = 50): DownloadEntry[] {
    return this.getDownloads().slice(0, limit);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export const downloadService = new DownloadService();
