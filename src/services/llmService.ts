// Environment variables are loaded in the main process and accessed via IPC
// Note: This service runs in the renderer process and uses IPC to get env vars

interface LLMConfig {
  provider: 'deepseek' | 'gemini' | 'openai';
  apiKey: string;
  model?: string;
  baseURL?: string;
}

interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface LLMResponse {
  content: string;
  actions?: Array<{
    type: string;
    label: string;
    data?: any;
  }>;
  suggestions?: string[];
}

class LLMService {
  private config: LLMConfig | null = null;

  // Initialize with API configuration
  initialize(provider: LLMConfig['provider'], apiKey: string, model?: string) {
    this.config = {
      provider,
      apiKey,
      model: model || this.getDefaultModel(provider),
      baseURL: this.getBaseURL(provider)
    };
  }

  // Load configuration from environment variables
  async loadFromEnv() {
    try {
      const provider = ((await (window as any).electronAPI?.getEnv('LLM_PROVIDER')) as LLMConfig['provider']) || 'gemini';
      const apiKey = await (window as any).electronAPI?.getEnv('GEMINI_API_KEY') || await (window as any).electronAPI?.getEnv('LLM_API_KEY');
      const model = await (window as any).electronAPI?.getEnv('LLM_MODEL');

      if (!apiKey) {
        console.warn('No API key found in environment variables (checked GEMINI_API_KEY and LLM_API_KEY)');
        return false;
      }

      console.log('LLM Service initializing with provider:', provider);
      this.initialize(provider, apiKey, model);
      return true;
    } catch (error) {
      console.error('Error loading LLM config from env:', error);
      return false;
    }
  }

  // Check if service is configured
  isConfigured(): boolean {
    return this.config !== null && !!this.config.apiKey;
  }

  // Generate AI response using configured LLM
  async generateResponse(
    messages: LLMMessage[],
    context?: {
      currentTab?: { url: string; title: string };
      recentHistory?: Array<{ title: string; url: string }>;
      availableActions?: string[];
    }
  ): Promise<LLMResponse> {
    if (!this.isConfigured()) {
      throw new Error('LLM service not configured. Please set API key.');
    }

    // Create system prompt with browser context
    const systemPrompt = this.createSystemPrompt(context);

    const fullMessages: LLMMessage[] = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    try {
      const response = await this.callLLM(fullMessages);

      // Parse the response to extract actions and suggestions
      return this.parseLLMResponse(response);
    } catch (error) {
      console.error('LLM API error:', error);
      throw new Error('Failed to get AI response. Please check your API configuration.');
    }
  }

  private createSystemPrompt(context?: any): string {
    let prompt = `You are PingCat AI, an intelligent browser assistant. You help users with web browsing, file management, and productivity tasks.

Available actions you can suggest:
- navigate: Open a specific URL
- search: Perform a web search
- open_folder: Open a system folder (desktop, documents, downloads, etc.)
- open_settings: Open browser settings
- summarize_page: Summarize current webpage content
- new_tab: Open a new browser tab

Current context:
${context?.currentTab ? `- Current page: ${context.currentTab.title} (${context.currentTab.url})` : '- No active tab'}

${context?.recentHistory?.length ? `- Recent history: ${context.recentHistory.slice(0, 3).map(h => h.title).join(', ')}` : ''}

When responding:
1. Be helpful and concise
2. Suggest specific actions when appropriate
3. Include 2-3 relevant suggestions for follow-up
4. Use the available actions to perform tasks
5. Format actions as JSON objects in your response when needed

Response format: Provide helpful text, and if suggesting actions, include them in a structured way.`;

    return prompt;
  }

  private async callLLM(messages: LLMMessage[]): Promise<string> {
    if (!this.config) throw new Error('LLM not configured');

    const { provider, apiKey, model, baseURL } = this.config;

    switch (provider) {
      case 'deepseek':
        return this.callDeepSeek(messages, apiKey, model!, baseURL!);
      case 'gemini':
        return this.callGemini(messages, apiKey, model!);
      case 'openai':
        return this.callOpenAI(messages, apiKey, model!);
      default:
        throw new Error(`Unsupported LLM provider: ${provider}`);
    }
  }

  private async callDeepSeek(messages: LLMMessage[], apiKey: string, model: string, baseURL: string): Promise<string> {
    const response = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private async callGemini(messages: LLMMessage[], apiKey: string, model: string): Promise<string> {
    // Convert messages to Gemini format
    const geminiMessages = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: geminiMessages,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  private async callOpenAI(messages: LLMMessage[], apiKey: string, model: string): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private parseLLMResponse(response: string): LLMResponse {
    // Try to extract structured data from the response
    const actionPattern = /ACTION:\s*(\{[\s\S]*?\})/i;
    const suggestionPattern = /SUGGESTIONS:\s*(\[[\s\S]*?\])/i;

    let actions: LLMResponse['actions'] = [];
    let suggestions: string[] = [];

    // Extract actions
    const actionMatch = response.match(actionPattern);
    if (actionMatch) {
      try {
        const actionData = JSON.parse(actionMatch[1]);
        if (Array.isArray(actionData)) {
          actions = actionData;
        } else {
          actions = [actionData];
        }
      } catch (e) {
        console.warn('Failed to parse actions from LLM response');
      }
    }

    // Extract suggestions
    const suggestionMatch = response.match(suggestionPattern);
    if (suggestionMatch) {
      try {
        suggestions = JSON.parse(suggestionMatch[1]);
      } catch (e) {
        console.warn('Failed to parse suggestions from LLM response');
      }
    }

    // Clean the response text
    let cleanText = response
      .replace(actionPattern, '')
      .replace(suggestionPattern, '')
      .trim();

    // If no structured data found, try to infer actions from text
    if (actions.length === 0) {
      actions = this.inferActionsFromText(cleanText);
    }

    return {
      content: cleanText,
      actions,
      suggestions: suggestions.length > 0 ? suggestions : this.generateDefaultSuggestions(cleanText)
    };
  }

  private inferActionsFromText(text: string): LLMResponse['actions'] {
    const actions: LLMResponse['actions'] = [];
    const lowerText = text.toLowerCase();

    // Check for navigation intents
    if (lowerText.includes('navigate') || lowerText.includes('go to') || lowerText.includes('visit')) {
      const urlMatch = text.match(/(https?:\/\/[^\s]+)/i) || text.match(/([a-zA-Z0-9-]+\.[a-zA-Z]{2,})/);
      if (urlMatch) {
        actions.push({
          type: 'navigate',
          label: `Go to ${urlMatch[1]}`,
          data: { url: urlMatch[1] }
        });
      }
    }

    // Check for search intents
    if (lowerText.includes('search') || lowerText.includes('find') || lowerText.includes('look for')) {
      const searchMatch = text.match(/(?:search for|find|look for)\s+(.+)/i);
      if (searchMatch) {
        actions.push({
          type: 'search',
          label: `Search for "${searchMatch[1]}"`,
          data: { query: searchMatch[1] }
        });
      }
    }

    // Check for folder operations
    if (lowerText.includes('open folder') || lowerText.includes('show folder')) {
      const folderMatch = text.match(/(?:open|show)\s+folder\s+(.+)/i);
      if (folderMatch) {
        actions.push({
          type: 'open_folder',
          label: `Open ${folderMatch[1]} folder`,
          data: { path: folderMatch[1] }
        });
      }
    }

    return actions;
  }

  private generateDefaultSuggestions(text: string): string[] {
    const suggestions = [];
    const lowerText = text.toLowerCase();

    if (lowerText.includes('search') || lowerText.includes('find')) {
      suggestions.push('Search for something else', 'Use different search terms');
    }

    if (lowerText.includes('navigate') || lowerText.includes('go to')) {
      suggestions.push('Visit another website', 'Go to popular sites');
    }

    if (lowerText.includes('folder') || lowerText.includes('file')) {
      suggestions.push('Open another folder', 'Show file locations');
    }

    if (lowerText.includes('settings') || lowerText.includes('preferences')) {
      suggestions.push('Change theme', 'Privacy settings', 'Profile settings');
    }

    // Default suggestions if none match
    if (suggestions.length === 0) {
      suggestions.push('What can you help me with?', 'Show browser features', 'Give me tips');
    }

    return suggestions.slice(0, 3);
  }

  private getDefaultModel(provider: LLMConfig['provider']): string {
    switch (provider) {
      case 'deepseek': return 'deepseek-chat';
      case 'gemini': return 'gemini-1.5-flash';
      case 'openai': return 'gpt-3.5-turbo';
      default: return 'deepseek-chat';
    }
  }

  private getBaseURL(provider: LLMConfig['provider']): string {
    switch (provider) {
      case 'deepseek': return 'https://api.deepseek.com/v1';
      case 'gemini': return 'https://generativelanguage.googleapis.com';
      case 'openai': return 'https://api.openai.com/v1';
      default: return 'https://api.deepseek.com/v1';
    }
  }
}

export const llmService = new LLMService();
export type { LLMConfig, LLMMessage, LLMResponse };
