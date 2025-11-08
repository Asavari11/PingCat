import { GoogleGenerativeAI } from '@google/generative-ai';

export interface GeminiConfig {
  apiKey?: string;
  model?: string;
}

export interface GeminiContext {
  currentPage?: {
    title: string;
    url: string;
    content?: string;
  };
  recentHistory?: Array<{
    title: string;
    url: string;
    timestamp: number;
  }>;
  userIntent?: string;
}

export interface GeminiResponse {
  text: string;
  suggestions?: string[];
  actions?: Array<{
    type: 'navigate' | 'search' | 'open_settings' | 'clear_history' | 'new_tab' | 'open_folder' | 'summarize_page';
    label: string;
    data?: any;
  }>;
}

class GeminiService {
  private client: GoogleGenerativeAI | null = null;
  private model = 'gemini-1.5-flash';
  private initialized = false;

  async initialize(): Promise<boolean> {
    try {
      // Try to get API key from environment via electron preload
      const apiKey = await (window as any).electronAPI?.getEnv('GEMINI_API_KEY');
      
      if (!apiKey) {
        console.warn('No Gemini API key found in environment');
        return false;
      }

      this.client = new GoogleGenerativeAI(apiKey);
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize Gemini service:', error);
      return false;
    }
  }

  isReady(): boolean {
    return this.initialized && this.client !== null;
  }

  async generateResponse(query: string, context?: GeminiContext): Promise<GeminiResponse> {
    if (!this.isReady() || !this.client) {
      throw new Error('Gemini service not initialized');
    }

    const model = this.client.getGenerativeModel({ model: this.model });

    // Build context-aware prompt
    const prompt = this.buildPrompt(query, context);

    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // Parse response to extract actions and suggestions
      return this.parseResponse(text, query);
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('Failed to generate response from Gemini');
    }
  }

  private buildPrompt(query: string, context?: GeminiContext): string {
    let prompt = `You are PingCat AI, an intelligent browser assistant. Help users with navigation, search, settings, and productivity tasks.

Available actions you can suggest:
- navigate: Open a URL
- search: Perform web search
- open_settings: Access browser settings
- clear_history: Clear browsing history
- new_tab: Open new tab
- open_folder: Open system folder
- summarize_page: Summarize webpage content

User query: ${query}

`;

    if (context?.currentPage) {
      prompt += `\nCurrent page: ${context.currentPage.title} (${context.currentPage.url})`;
      
      if (context.currentPage.content) {
        prompt += `\nPage content summary: ${context.currentPage.content}`;
      }
    }

    if (context?.recentHistory && context.recentHistory.length > 0) {
      prompt += '\n\nRecent browsing history:';
      context.recentHistory.slice(0, 3).forEach(entry => {
        prompt += `\n- ${entry.title} (${entry.url})`;
      });
    }

    if (context?.userIntent) {
      prompt += `\n\nUser intent: ${context.userIntent}`;
    }

    prompt += '\n\nRespond in a helpful, concise manner. If suggesting actions, format them as structured data the browser can use.';

    return prompt;
  }

  private parseResponse(text: string, originalQuery: string): GeminiResponse {
    const response: GeminiResponse = {
      text: text,
      suggestions: [],
      actions: []
    };

    // Try to extract JSON-formatted actions if present
    const actionMatch = text.match(/\{[\s\S]*?type[\s\S]*?\}/g);
    if (actionMatch) {
      actionMatch.forEach(match => {
        try {
          const action = JSON.parse(match);
          if (action.type && action.label) {
            response.actions?.push(action);
          }
        } catch (e) {
        }
      });
    }

    const suggestionPatterns = [
      /you could try:?\s*((?:[-•*]\s*[^•\n]+\n*)+)/i,
      /suggestions?:?\s*((?:[-•*]\s*[^•\n]+\n*)+)/i,
      /try:?\s*((?:[-•*]\s*[^•\n]+\n*)+)/i
    ];

    for (const pattern of suggestionPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const suggestions = match[1]
          .split(/\n/)
          .map(s => s.replace(/^[-•*]\s*/, '').trim())
          .filter(s => s.length > 0);
        
        response.suggestions = [...new Set([...(response.suggestions || []), ...suggestions])];
      }
    }

    // Clean up the response text by removing JSON and suggestion lists
    response.text = text
      .replace(/\{[\s\S]*?type[\s\S]*?\}/g, '')
      .replace(/suggestions?:?\s*(?:[-•*]\s*[^•\n]+\n*)+/i, '')
      .trim();

    // Limit suggestions to 3 unique items
    if (response.suggestions && response.suggestions.length > 3) {
      response.suggestions = response.suggestions.slice(0, 3);
    }

    return response;
  }

  // Update model settings
  configure(config: GeminiConfig) {
    if (config.model) {
      this.model = config.model;
    }
    
    if (config.apiKey) {
      this.client = new GoogleGenerativeAI(config.apiKey);
      this.initialized = true;
    }
  }
}

export const geminiService = new GeminiService();