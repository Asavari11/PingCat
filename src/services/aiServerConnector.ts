
export interface GeminiResponse {
  text: string;
  error?: string;
}

class AIServerConnector {
  private isInitialized: boolean = false;

  constructor() {
    
    if ((window as any).electronAPI?.queryGemini) {
      console.log('AIServerConnector: Gemini IPC channel found');
      this.isInitialized = true;
    } else {
      console.error('AIServerConnector: Gemini IPC channel not found!');
      console.log('Available electronAPI methods:', Object.keys((window as any).electronAPI || {}));
    }
  }

  async queryGemini(input: string): Promise<GeminiResponse> {
    console.log('AIServerConnector: Processing query:', input);

    if (!this.isInitialized) {
      console.error('AIServerConnector: Cannot process query - not initialized');
      return {
        text: 'Sorry, the AI service is not properly initialized. Please try again later.',
        error: 'Service not initialized'
      };
    }

    try {
      console.log('AIServerConnector: Sending query to main process...');
      const response = await (window as any).electronAPI.queryGemini(input);
      
      console.log('AIServerConnector: Received response:', response);
      
      if (!response) {
        console.error('AIServerConnector: No response received from main process');
        return {
          text: 'Sorry, I encountered an error processing your request.',
          error: 'No response from Gemini service'
        };
      }

      return response;
    } catch (error) {
      console.error('AIServerConnector: Error querying Gemini:', error);
      return {
        text: 'Sorry, I encountered an error processing your request.',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export const aiServerConnector = new AIServerConnector();