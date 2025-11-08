import { GoogleGenerativeAI } from '@google/generative-ai';
import { llmService, LLMConfig, LLMMessage, LLMResponse } from '../services/llmService';
import { aiService, AIContext } from '../services/aiService';

export interface AIControllerConfig {
  geminiApiKey?: string;
  defaultProvider?: 'deepseek' | 'gemini' | 'openai';
  enableFallback?: boolean;
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

export class AIController {
  private config: AIControllerConfig;
  private geminiClient?: GoogleGenerativeAI;
  private initialized = false;

  constructor(config: AIControllerConfig = {}) {
    // Avoid referencing `process` directly in renderer builds where `process` may be undefined.
    // Use a typeof check to prevent a ReferenceError when this module is imported in the browser.
    const geminiApiKeyFromEnv = (typeof process !== 'undefined' && (process as any).env)
      ? (process as any).env.GEMINI_API_KEY
      : undefined;

    this.config = {
      defaultProvider: 'gemini',
      enableFallback: true,
      geminiApiKey: geminiApiKeyFromEnv,
      ...config
    };
  }

  // Initialize the AI controller with API keys and services
  async initialize(): Promise<boolean> {
    try {
      // Initialize LLM service from environment
      const llmInitialized = await llmService.loadFromEnv();

      // Try to obtain Gemini API key from multiple places.
      // Preference order:
      // 1. Explicit config passed to constructor
      // 2. IPC-provided env via preload (window.electronAPI.getEnv)
      // 3. Already set value (e.g. from process.env guarded in constructor)

      let geminiKey: string | undefined = this.config.geminiApiKey;

      try {
        // In renderer/Electron contexts, the preload script exposes electronAPI.getEnv
        if (typeof window !== 'undefined' && (window as any).electronAPI?.getEnv) {
          const ipcKey = await (window as any).electronAPI.getEnv('GEMINI_API_KEY');
          if (ipcKey) geminiKey = ipcKey;
        }
      } catch (e) {
        // Ignore IPC errors and fall back to any existing key
        console.warn('Failed to load GEMINI_API_KEY from preload IPC:', e);
      }

      // Initialize Gemini client if API key is available
      if (geminiKey) {
        this.geminiClient = new GoogleGenerativeAI(geminiKey);
      }

      this.initialized = true;
      console.log('AI Controller initialized successfully');
      console.log('Status:', this.getStatus());
      return true;
    } catch (error) {
      console.error('AI Controller initialization failed:', error);
      this.initialized = false;
      return false;
    }
  }

  // Check if the controller is ready to process requests
  isReady(): boolean {
    return this.initialized && (llmService.isConfigured() || !!this.geminiClient);
  }

  // Process a user query and return AI response
  async processQuery(
    query: string,
    context?: AIContext
  ): Promise<AIResponse> {
    console.log('AI Controller processing query:', query);
    console.log('Controller ready:', this.isReady());
    console.log('Status:', this.getStatus());

    if (!this.isReady()) {
      console.warn('AI Controller not ready, falling back to rule-based system');
      // Fallback to the existing AI service (which uses LLM service)
      return await aiService.processQuery(query);
    }

    // Update AI service context
    if (context) {
      aiService.updateContext(context);
    }

    // Try Gemini first if available
    if (this.geminiClient && this.config.defaultProvider === 'gemini') {
      try {
        console.log('Trying Gemini API...');
        const result = await this.processWithGemini(query, context);
        console.log('Gemini response successful');
        return result;
      } catch (error) {
        console.warn('Gemini processing failed, falling back to LLM service:', error);
        if (!this.config.enableFallback) {
          throw error;
        }
      }
    }

    // Fallback to the existing AI service (which uses LLM service)
    console.log('Using fallback AI service');
    return await aiService.processQuery(query);
  }

  // Process query using Gemini API
  private async processWithGemini(
    query: string,
    context?: AIContext
  ): Promise<AIResponse> {
    if (!this.geminiClient) {
      throw new Error('Gemini client not initialized');
    }

    const model = this.geminiClient.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Create context-aware prompt
    let prompt = query;

    if (context?.currentTab) {
      prompt = `Current page: ${context.currentTab.title} (${context.currentTab.url})\n\n${query}`;
    }

    if (context?.recentHistory && context.recentHistory.length > 0) {
      const historyText = context.recentHistory
        .slice(0, 3)
        .map(entry => `${entry.title} (${entry.url})`)
        .join('\n');
      prompt = `Recent browsing history:\n${historyText}\n\n${prompt}`;
    }

    // Add system instructions
    const systemPrompt = `You are PingCat AI, an intelligent browser assistant. Help users with navigation, search, settings, and productivity tasks. Provide helpful, actionable responses with specific suggestions when possible.`;

    const fullPrompt = `${systemPrompt}\n\nUser query: ${prompt}`;

    try {
      const result = await model.generateContent(fullPrompt);
      const response = result.response;
      const text = response.text();

      // Parse the response for actions and suggestions
      return this.parseGeminiResponse(text, query);
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('Failed to get AI response from Gemini');
    }
  }

  // Parse Gemini response to extract actions and suggestions
  private parseGeminiResponse(text: string, originalQuery: string): AIResponse {
    const response: AIResponse = {
      text: text,
      suggestions: [],
      actions: []
    };

    const lowerText = text.toLowerCase();
    const lowerQuery = originalQuery.toLowerCase();

    // Extract suggestions from the response
    const suggestionPatterns = [
      /you could try (.+?)(?:\.|$)/gi,
      /try (.+?)(?:\.|$)/gi,
      /consider (.+?)(?:\.|$)/gi,
      /you might (.+?)(?:\.|$)/gi
    ];

    suggestionPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const suggestion = match[1].trim();
        if (suggestion.length > 5 && suggestion.length < 50) {
          response.suggestions!.push(suggestion);
        }
      }
    });

    // Generate actions based on query type
    if (lowerQuery.includes('search') || lowerQuery.includes('find') || lowerQuery.includes('look for')) {
      const searchMatch = originalQuery.match(/(?:search for|find|look for)\s+(.+)/i);
      if (searchMatch) {
        response.actions!.push({
          type: 'search',
          label: `Search for "${searchMatch[1]}"`,
          data: { query: searchMatch[1] }
        });
      }
    }

    if (lowerQuery.includes('go to') || lowerQuery.includes('navigate') || lowerQuery.includes('visit')) {
      const urlMatch = originalQuery.match(/(?:go to|navigate to|visit)\s+(.+)/i);
      if (urlMatch) {
        let url = urlMatch[1].trim();
        if (!url.startsWith('http')) {
          url = `https://${url}`;
        }
        response.actions!.push({
          type: 'navigate',
          label: `Go to ${url}`,
          data: { url }
        });
      }
    }

    if (lowerQuery.includes('open folder') || lowerQuery.includes('show folder')) {
      const folderMatch = originalQuery.match(/(?:open|show)\s+folder\s+(.+)/i);
      if (folderMatch) {
        response.actions!.push({
          type: 'open_folder',
          label: `Open ${folderMatch[1]} folder`,
          data: { path: folderMatch[1] }
        });
      }
    }

    if (lowerQuery.includes('settings') || lowerQuery.includes('preferences')) {
      response.actions!.push({
        type: 'open_settings',
        label: 'Open Settings',
        data: { section: 'general' }
      });
    }

    // Limit suggestions to 3
    if (response.suggestions!.length > 3) {
      response.suggestions = response.suggestions!.slice(0, 3);
    }

    return response;
  }

  // Get available AI providers
  getAvailableProviders(): string[] {
    const providers = [];
    if (llmService.isConfigured()) {
      providers.push('llm-service');
    }
    if (this.geminiClient) {
      providers.push('gemini');
    }
    return providers;
  }

  // Configure LLM service directly
  configureLLM(provider: LLMConfig['provider'], apiKey: string, model?: string): void {
    llmService.initialize(provider, apiKey, model);
  }

  // Get current configuration status
  getStatus(): {
    initialized: boolean;
    providers: string[];
    geminiReady: boolean;
    llmReady: boolean;
  } {
    return {
      initialized: this.initialized,
      providers: this.getAvailableProviders(),
      geminiReady: !!this.geminiClient,
      llmReady: llmService.isConfigured()
    };
  }
}

// Export singleton instance
export const aiController = new AIController();
