import { historyService, HistoryEntry } from './historyService';
import { settingsService, BrowserSettings } from './settingsService';
import { llmService, LLMMessage, LLMResponse } from './llmService';
import { aiServerConnector } from './aiServerConnector';

export interface AIContext {
  currentTab?: {
    url: string;
    title: string;
    searchQuery?: string;
  };
  recentHistory?: HistoryEntry[];
  settings?: Partial<BrowserSettings>;
  userProfiles?: Array<{ username: string; email: string }>;
}

export interface AIResponse {
  text: string;
  suggestions?: string[];
  actions?: Array<{
    type: 'navigate' | 'search' | 'open_settings' | 'clear_history' | 'new_tab' | 'open_folder' | 'summarize_page';
    label: string;
    data?: any;
  }>;
}

class AIService {
  private context: AIContext = {};

  
  updateContext(context: AIContext) {
    this.context = { ...this.context, ...context };
  }

  
  async processQuery(query: string): Promise<AIResponse> {
    console.log('Processing query:', query);
    
    
    const normalizedQuery = query.trim();
    
    
    const commandWords = ['go to', 'open', 'search', 'find', 'show', 'settings', 'history'];
    const isLikelyCommand = commandWords.some(word => 
      normalizedQuery.toLowerCase().startsWith(word.toLowerCase())
    );
    
    if (isLikelyCommand) {
      console.log('Query appears to be a command, checking built-in handlers...');
      
      
      if (this.isNavigationQuery(normalizedQuery)) {
        return this.handleNavigationQuery(normalizedQuery);
      }
      
      if (this.isSearchQuery(normalizedQuery)) {
        return this.handleSearchQuery(normalizedQuery);
      }
      
      if (this.isSettingsQuery(normalizedQuery)) {
        return this.handleSettingsQuery(normalizedQuery);
      }
      
      if (this.isHistoryQuery(normalizedQuery)) {
        return this.handleHistoryQuery(normalizedQuery);
      }
      
      if (this.isFileSystemQuery(normalizedQuery)) {
        return this.handleFileSystemQuery(normalizedQuery);
      }
      
      if (this.isSummarizeQuery(normalizedQuery)) {
        return this.handleSummarizeQuery(normalizedQuery);
      }
    }

    
    console.log('Using Gemini for response...');
    try {
      const geminiResponse = await aiServerConnector.queryGemini(query);
      console.log('Gemini response:', geminiResponse);
      
      
      if (geminiResponse.error) {
        console.warn('Gemini query failed:', geminiResponse.error);
        return this.handleGeneralQuery(query);
      }

      
      return {
        text: geminiResponse.text,
        suggestions: [
          'Tell me more about this',
          'Ask another question',
          this.generateContextualSuggestion(query)
        ],
        
        actions: [{
          type: 'search',
          label: `Search for "${query}"`,
          data: { query }
        }]
      };
    } catch (error) {
      console.error('Failed to query Gemini:', error);
      
      return this.handleGeneralQuery(query);
    }

    
    const lowerQuery = query.toLowerCase().trim();

    
    if (this.isFileSystemQuery(lowerQuery)) {
      return this.handleFileSystemQuery(query);
    }

    
    if (this.isSummarizeQuery(lowerQuery)) {
      return this.handleSummarizeQuery(query);
    }

    
    if (this.isNavigationQuery(lowerQuery)) {
      return this.handleNavigationQuery(query);
    }

    
    if (this.isSearchQuery(lowerQuery)) {
      return this.handleSearchQuery(query);
    }

   
    if (this.isSettingsQuery(lowerQuery)) {
      return this.handleSettingsQuery(query);
    }

    
    if (this.isHistoryQuery(lowerQuery)) {
      return this.handleHistoryQuery(query);
    }

    
    if (this.isProductivityQuery(lowerQuery)) {
      return this.handleProductivityQuery(query);
    }

    
    if (this.isPageAnalysisQuery(lowerQuery)) {
      return this.handlePageAnalysisQuery(query);
    }

    
    if (this.isHelpQuery(lowerQuery)) {
      return this.handleHelpQuery(query);
    }

    
    return this.handleGeneralQuery(query);
  }

  private isNavigationQuery(query: string): boolean {
    const navKeywords = ['go to', 'navigate', 'open', 'visit', 'take me to', 'show me'];
    return navKeywords.some(keyword => query.includes(keyword));
  }

  private isSearchQuery(query: string): boolean {
    const searchKeywords = ['search', 'find', 'look for', 'google', 'bing'];
    return searchKeywords.some(keyword => query.includes(keyword));
  }

  private isSettingsQuery(query: string): boolean {
    const settingsKeywords = ['settings', 'preferences', 'config', 'theme', 'privacy', 'profile'];
    return settingsKeywords.some(keyword => query.includes(keyword));
  }

  private isHistoryQuery(query: string): boolean {
    const historyKeywords = ['history', 'visited', 'recent', 'browsing'];
    return historyKeywords.some(keyword => query.includes(keyword));
  }

  private isProductivityQuery(query: string): boolean {
    const productivityKeywords = ['tips', 'productivity', 'efficient', 'shortcuts', 'keyboard'];
    return productivityKeywords.some(keyword => query.includes(keyword));
  }

  private isPageAnalysisQuery(query: string): boolean {
    const analysisKeywords = ['summarize', 'what is this', 'analyze', 'content', 'page'];
    return analysisKeywords.some(keyword => query.includes(keyword));
  }

  private isFileSystemQuery(query: string): boolean {
    const fsKeywords = ['open folder', 'open directory', 'show folder', 'open file', 'folder', 'directory'];
    return fsKeywords.some(keyword => query.includes(keyword));
  }

  private isSummarizeQuery(query: string): boolean {
    const summarizeKeywords = ['summarize page', 'summarize this', 'what is this page', 'page summary', 'summarize the page'];
    return summarizeKeywords.some(keyword => query.includes(keyword));
  }

  private isHelpQuery(query: string): boolean {
    const helpKeywords = ['help', 'how to', 'what can you do', 'commands', 'features'];
    return helpKeywords.some(keyword => query.includes(keyword));
  }

  private handleNavigationQuery(query: string): AIResponse {
    const urlPatterns = [
      /(?:go to|visit|open)\s+(https?:\/\/[^\s]+)/i,
      /(?:go to|visit|open)\s+([^\s]+\.[^\s]+)/i
    ];

    for (const pattern of urlPatterns) {
      const match = query.match(pattern);
      if (match) {
        const url = match[1];
        const fullUrl = url.startsWith('http') ? url : `https://${url}`;
        return {
          text: `I'll navigate to ${fullUrl} for you.`,
          actions: [{
            type: 'navigate',
            label: `Open ${url}`,
            data: { url: fullUrl }
          }]
        };
      }
    }

    return {
      text: "I can help you navigate to websites. Try saying 'go to google.com' or 'visit github.com'.",
      suggestions: ['go to google.com', 'visit github.com', 'open youtube.com']
    };
  }

  private handleSearchQuery(query: string): AIResponse {
    const searchTerm = query.replace(/^(search for|find|look for)\s+/i, '').trim();

    if (!searchTerm) {
      return {
        text: "What would you like to search for?",
        suggestions: ['search for cats', 'find restaurants near me', 'look for programming tutorials']
      };
    }

    const searchEngine = settingsService.getSettings().searchEngine;
    const engineUrls = {
      google: `https://www.google.com/search?q=${encodeURIComponent(searchTerm)}`,
      bing: `https://www.bing.com/search?q=${encodeURIComponent(searchTerm)}`,
      duckduckgo: `https://duckduckgo.com/?q=${encodeURIComponent(searchTerm)}`
    };

    return {
      text: `I'll search for "${searchTerm}" using ${searchEngine}.`,
      actions: [{
        type: 'search',
        label: `Search for "${searchTerm}"`,
        data: { query: searchTerm, engine: searchEngine }
      }]
    };
  }

  private handleSettingsQuery(query: string): AIResponse {
    const settings = settingsService.getSettings();

    if (query.includes('theme')) {
      const currentTheme = settings.theme;
      return {
        text: `Your current theme is set to "${currentTheme}". You can change it in settings.`,
        actions: [{
          type: 'open_settings',
          label: 'Open Appearance Settings',
          data: { section: 'appearance' }
        }],
        suggestions: ['change theme to dark', 'switch to light mode', 'open settings']
      };
    }

    if (query.includes('privacy') || query.includes('incognito')) {
      return {
        text: `Your privacy settings include ${settings.enableIncognito ? 'incognito mode enabled' : 'incognito mode disabled'}, and ${settings.clearHistoryOnExit ? 'history clearing on exit' : 'history preservation'}.`,
        actions: [{
          type: 'open_settings',
          label: 'Open Privacy Settings',
          data: { section: 'privacy' }
        }]
      };
    }

    return {
      text: "I can help you with browser settings. You can configure themes, privacy options, profiles, and more.",
      actions: [{
        type: 'open_settings',
        label: 'Open Settings',
        data: { section: 'general' }
      }],
      suggestions: ['change theme', 'privacy settings', 'manage profiles']
    };
  }

  private handleHistoryQuery(query: string): AIResponse {
    const recentHistory = historyService.getRecentHistory(5);

    if (recentHistory.length === 0) {
      return {
        text: "You don't have any browsing history yet. Start browsing and I'll help you track your visited sites!",
        suggestions: ['show history', 'recent websites', 'browsing activity']
      };
    }

    let response = "Here are your recently visited sites:\n";
    recentHistory.slice(0, 3).forEach((entry, index) => {
      response += `${index + 1}. ${entry.title} (${entry.url})\n`;
    });

    if (recentHistory.length > 3) {
      response += `...and ${recentHistory.length - 3} more sites.`;
    }

    return {
      text: response,
      actions: [{
        type: 'navigate',
        label: 'View Full History',
        data: { url: '/history' }
      }],
      suggestions: ['show all history', 'recent sites', 'clear history']
    };
  }

  private handleProductivityQuery(query: string): AIResponse {
    const tips = [
      " Use Ctrl+T to open new tabs quickly",
      " Press Ctrl+H to access your browsing history",
      " Use Ctrl+Shift+T to reopen recently closed tabs",
      " Right-click links to open them in new tabs",
      " Use Ctrl+L to quickly focus the address bar"
    ];

    if (query.includes('shortcuts') || query.includes('keyboard')) {
      return {
        text: "Here are some useful keyboard shortcuts:\n\n" + tips.join('\n'),
        suggestions: ['more tips', 'browser shortcuts', 'productivity hacks']
      };
    }

    return {
      text: "Here are some productivity tips for PingCat:\n\n" + tips.slice(0, 3).join('\n'),
      suggestions: ['keyboard shortcuts', 'browsing tips', 'efficiency tricks']
    };
  }

  private handlePageAnalysisQuery(query: string): AIResponse {
    if (!this.context.currentTab) {
      return {
        text: "I need to know which page you're currently viewing. Try opening a webpage first!",
        suggestions: ['analyze current page', 'summarize this site', 'what is this page about']
      };
    }

    const { title, url } = this.context.currentTab;

    if (query.includes('summarize') || query.includes('summary')) {
      return {
        text: `You're currently viewing "${title}" at ${url}. This appears to be a ${this.guessPageType(url)} page.`,
        suggestions: ['analyze content', 'page details', 'site information']
      };
    }

    return {
      text: `Current page: "${title}"\nURL: ${url}\n\nI can help you analyze this page's content, find related information, or suggest similar sites.`,
      suggestions: ['summarize this page', 'find similar sites', 'page analysis']
    };
  }

  private handleHelpQuery(query: string): AIResponse {
    return {
      text: `I'm your PingCat AI assistant! I can help you with:

🌐 **Navigation**: Go to websites, search the web
🔍 **Search**: Find information using your preferred search engine
⚙️ **Settings**: Configure themes, privacy, and preferences
📚 **History**: View and manage your browsing history
💡 **Tips**: Productivity advice and keyboard shortcuts
📄 **Page Analysis**: Summarize current webpage content

Try asking me things like:
• "Go to google.com"
• "Search for cats"
• "Change theme to dark"
• "Show my history"
• "Give me productivity tips"`,
      suggestions: ['navigation help', 'search commands', 'settings guide']
    };
  }

  private handleGeneralQuery(query: string): AIResponse {
    
    if (query.includes('.') && !query.includes(' ')) {
     
      return {
        text: `Did you mean to visit "${query}"? I can navigate there for you.`,
        actions: [{
          type: 'navigate',
          label: `Go to ${query}`,
          data: { url: query.startsWith('http') ? query : `https://${query}` }
        }],
        suggestions: [`search for ${query}`, `go to ${query}`]
      };
    }

    
    return {
      text: `I'm not sure what you mean by "${query}". Would you like me to search for it, or try asking about browser features, navigation, or settings?`,
      actions: [{
        type: 'search',
        label: `Search for "${query}"`,
        data: { query }
      }],
      suggestions: ['help', 'what can you do', 'browser features']
    };
  }

  private handleFileSystemQuery(query: string): AIResponse {
    
    const folderPatterns = [
      /(?:open folder|open directory|show folder)\s+(.+)/i,
      /(?:open|show)\s+(.+)\s+(?:folder|directory)/i
    ];

    let folderPath = '';

    for (const pattern of folderPatterns) {
      const match = query.match(pattern);
      if (match) {
        folderPath = match[1].trim();
        break;
      }
    }

    const commonFolders: { [key: string]: string } = {
      'desktop': 'C:/Users/' + (process.env.USERNAME || 'User') + '/Desktop',
      'documents': 'C:/Users/' + (process.env.USERNAME || 'User') + '/Documents',
      'downloads': 'C:/Users/' + (process.env.USERNAME || 'User') + '/Downloads',
      'pictures': 'C:/Users/' + (process.env.USERNAME || 'User') + '/Pictures',
      'music': 'C:/Users/' + (process.env.USERNAME || 'User') + '/Music',
      'videos': 'C:/Users/' + (process.env.USERNAME || 'User') + '/Videos'
    };

    const lowerPath = folderPath.toLowerCase();
    if (commonFolders[lowerPath]) {
      folderPath = commonFolders[lowerPath];
    }

    if (!folderPath) {
      return {
        text: "I can help you open folders on your system. Try saying 'open folder desktop' or 'show folder documents'.",
        suggestions: ['open folder desktop', 'open folder documents', 'open folder downloads']
      };
    }

    return {
      text: `I'll open the folder: ${folderPath}`,
      actions: [{
        type: 'open_folder',
        label: `Open ${folderPath}`,
        data: { path: folderPath }
      }]
    };
  }

  private handleSummarizeQuery(query: string): AIResponse {
    if (!this.context.currentTab) {
      return {
        text: "I need to know which page you're currently viewing to summarize it. Try opening a webpage first!",
        suggestions: ['summarize this page', 'what is this page about', 'analyze current page']
      };
    }

    const { title, url } = this.context.currentTab;

    return {
      text: `I'll summarize the current page for you.`,
      actions: [{
        type: 'summarize_page',
        label: `Summarize "${title}"`,
        data: { url, title }
      }]
    };
  }

  private guessPageType(url: string): string {
    const domain = url.toLowerCase();

    if (domain.includes('google')) return 'search engine';
    if (domain.includes('youtube') || domain.includes('vimeo')) return 'video';
    if (domain.includes('github') || domain.includes('gitlab')) return 'development';
    if (domain.includes('stackoverflow')) return 'programming Q&A';
    if (domain.includes('news') || domain.includes('cnn') || domain.includes('bbc')) return 'news';
    if (domain.includes('amazon') || domain.includes('ebay')) return 'shopping';
    if (domain.includes('wikipedia')) return 'encyclopedia';
    if (domain.includes('facebook') || domain.includes('twitter')) return 'social media';

    return 'website';
  }

  private inferUserIntent(query: string): string {
    const lowerQuery = query.toLowerCase();
    
    if (this.isNavigationQuery(lowerQuery)) return 'navigation';
    if (this.isSearchQuery(lowerQuery)) return 'search';
    if (this.isSettingsQuery(lowerQuery)) return 'settings';
    if (this.isHistoryQuery(lowerQuery)) return 'history';
    if (this.isProductivityQuery(lowerQuery)) return 'productivity';
    if (this.isPageAnalysisQuery(lowerQuery)) return 'analysis';
    if (this.isFileSystemQuery(lowerQuery)) return 'filesystem';
    if (this.isSummarizeQuery(lowerQuery)) return 'summarize';
    if (this.isHelpQuery(lowerQuery)) return 'help';
    
    return 'general';
  }

  private generateContextualSuggestion(query: string): string {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('where') || lowerQuery.includes('location')) {
      return 'Show me directions';
    }
    
    if (lowerQuery.startsWith('what') || lowerQuery.startsWith('how')) {
      return 'Learn more about this topic';
    }
    
    if (lowerQuery.includes('when') || lowerQuery.includes('history')) {
      return 'Show historical timeline';
    }
    
    if (lowerQuery.includes('vs') || lowerQuery.includes('versus') || lowerQuery.includes('compare')) {
      return 'Compare with alternatives';
    }
    
    return 'Find related information';
  }
}

export const aiService = new AIService();
