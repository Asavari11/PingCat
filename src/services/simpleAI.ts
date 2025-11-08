import { aiServerConnector } from './aiServerConnector';

export interface AIResponse {
  text: string;
  suggestions?: string[];
  actions?: Array<{
    type: 'navigate' | 'search' | 'open_settings' | 'clear_history' | 'new_tab' | 'open_folder' | 'summarize_page';
    label: string;
    data?: any;
  }>;
}

class SimpleAI {
  // Check if the query is a built-in command
  private isCommand(query: string): boolean {
    const commandPrefixes = ['go to', 'open', 'search for', 'show', 'settings', 'clear history', 'find'];
    return commandPrefixes.some(prefix => query.toLowerCase().startsWith(prefix));
  }

  // Handle built-in commands
  private handleCommand(query: string): AIResponse {
    const lowerQuery = query.toLowerCase();

    // Navigation command
    if (lowerQuery.startsWith('go to') || lowerQuery.startsWith('open ')) {
      const parts = query.split(' ').slice(2);
      const url = parts.join(' ') || '';
      const finalUrl = url.startsWith('http') ? url : `https://${url}`;
      return {
        text: `Navigating to ${finalUrl}`,
        actions: [{
          type: 'navigate',
          label: `Open ${finalUrl}`,
          data: { url: finalUrl }
        }]
      };
    }

    // Search command
    if (lowerQuery.startsWith('search for') || lowerQuery.startsWith('find')) {
      const searchTerm = query.replace(/^(search for|find)\s+/i, '').trim();
      return {
        text: `Searching for ${searchTerm}`,
        actions: [{
          type: 'search',
          label: `Search for "${searchTerm}"`,
          data: { query: searchTerm }
        }]
      };
    }

    // Settings command
    if (lowerQuery.includes('settings')) {
      return {
        text: 'Opening settings',
        actions: [{
          type: 'open_settings',
          label: 'Open Settings',
          data: { section: 'general' }
        }]
      };
    }

    return {
      text: "I'm not sure how to handle that command. Try asking me a question instead!",
      suggestions: ['Try asking a question', 'Search for something', 'Open a website']
    };
  }

  // Main query processing function
  async processQuery(query: string): Promise<AIResponse> {
    console.log('SimpleAI: processing query:', query);

    // Handle built-in commands
    if (this.isCommand(query)) {
      console.log('SimpleAI: handling built-in command');
      return this.handleCommand(query);
    }

    // Natural language file creation patterns
    const makeFilePatterns = [
      /(?:make|create) (?:a )?(?:new )?file (?:called |named )?["']?([^"']+?)["']? (?:with|containing) (?:the )?(?:content|text)?[:\s]+([^]*)/i,
      /(?:make|create) (?:a )?(?:new )?file (?:called |named )?["']?([^"']+?)["']?[:\s]+([^]*)/i,
      /(?:write|save) (?:this )?(?:content|text) to (?:a )?(?:new )?file (?:called |named )?["']?([^"']+?)["']?[:\s]+([^]*)/i,
    ];

    // Try each pattern to match file creation requests
    for (const pattern of makeFilePatterns) {
      const match = query.match(pattern);
      if (match) {
        const [_, filename, content] = match;
        if (!filename || !content) {
          return { 
            text: "I need both a filename and content to create a file. Try something like:\n" +
                  "'create file hello.txt with content Hello World' or\n" +
                  "'make a file test.js containing console.log(\"test\")'"
          };
        }

        try {
          // Get the project root path first
          const projectRoot = await (window as any).electronAPI?.getProjectRoot();
          if (!projectRoot) {
            return { text: 'Could not determine project location.' };
          }

          const fullPath = (window as any).electronAPI?.path.join(projectRoot, filename);
          const res = await (window as any).electronAPI?.fsWrite(filename, content);
          if (res?.ok) {
            return { 
              text: `✅ File created successfully!\n\nLocation: ${fullPath}\nContent:\n${content}\n\n` +
                    `Note: All files are created in the PingCat project folder. ` +
                    `You can use paths like "src/file.txt" or "public/data.json" to create files in those subfolders.`
            };
          }
          return { text: `Failed to create file: ${res?.error || 'unknown error'}` };
        } catch (e: any) {
          return { text: `Error creating file: ${e?.message || String(e)}` };
        }
      }
    }

    // File system and terminal commands
    const runTerminalMatch = query.match(/^(?:run|execute|terminal)\s+command\s+(.+)/i);
    if (runTerminalMatch) {
      const command = runTerminalMatch[1].trim();
      try {
        // Security: Only allow safe read-only commands
        const safeCommands = ['dir', 'ls', 'type', 'cat', 'pwd', 'cd', 'echo'];
        const cmd = command.split(' ')[0].toLowerCase();
        if (!safeCommands.includes(cmd)) {
          return { text: `Command '${cmd}' is not allowed. Allowed commands: ${safeCommands.join(', ')}` };
        }

        const terminalId = await (window as any).electronAPI?.executeInTerminal?.(command);
        if (!terminalId) {
          return { text: `Failed to execute command: ${command}` };
        }

        // Wait for output
        const maxAttempts = 10;
        for (let i = 0; i < maxAttempts; i++) {
          await new Promise(resolve => setTimeout(resolve, 500));
          const output = await (window as any).electronAPI?.getTerminalOutput?.(terminalId);
          if (output) {
            return { text: `Command output:\n${output}` };
          }
        }
        return { text: 'Command timed out or produced no output.' };
      } catch (e: any) {
        return { text: `Error executing command: ${e?.message || String(e)}` };
      }
    }

    // Direct file system operations via IPC
    const createFileMatch = query.match(/^create file\s+([^\s]+)\s+with\s+content\s+([\s\S]+)/i);
    if (createFileMatch) {
      const relPath = createFileMatch[1];
      const content = createFileMatch[2];
      try {
        const res = await (window as any).electronAPI?.fsWrite(relPath, content);
        if (res?.ok) return { text: `File created: ${relPath}` };
        return { text: `Failed to create file: ${res?.error || 'unknown error'}` };
      } catch (e: any) {
        return { text: `Error creating file: ${e?.message || String(e)}` };
      }
    }

    const createDirMatch = query.match(/^create (?:directory|dir|folder)\s+(.+)/i);
    if (createDirMatch) {
      const relPath = createDirMatch[1].trim();
      try {
        const res = await (window as any).electronAPI?.fsMkdir(relPath);
        if (res?.ok) return { text: `Directory created: ${relPath}` };
        return { text: `Failed to create directory: ${res?.error || 'unknown error'}` };
      } catch (e: any) {
        return { text: `Error creating directory: ${e?.message || String(e)}` };
      }
    }

    const readFileMatch = query.match(/^(?:read|show|open) file\s+(.+)/i);
    if (readFileMatch) {
      const relPath = readFileMatch[1].trim();
      try {
        // First try IPC fs read
        const res = await (window as any).electronAPI?.fsRead(relPath);
        if (res?.content !== undefined) return { text: res.content };
        
        // If IPC fails, try using cat/type command
        const isWindows = (window as any).electronAPI?.platform === 'win32';
        const cmd = isWindows ? `type "${relPath}"` : `cat "${relPath}"`;
        const terminalId = await (window as any).electronAPI?.executeInTerminal?.(cmd);
        if (terminalId) {
          // Wait for output
          await new Promise(resolve => setTimeout(resolve, 500));
          const output = await (window as any).electronAPI?.getTerminalOutput?.(terminalId);
          if (output) return { text: output };
        }
        
        return { text: `Failed to read file: ${res?.error || 'unknown error'}` };
      } catch (e: any) {
        return { text: `Error reading file: ${e?.message || String(e)}` };
      }
    }

    const listDirMatch = query.match(/^(?:list|show) (?:files|folder|dir|directory)\s*(.*)/i);
    if (listDirMatch) {
      const relPath = (listDirMatch[1] || '.').trim();
      try {
        // First try IPC fs list
        const res = await (window as any).electronAPI?.fsList(relPath);
        if (!res?.error) {
          const items = (res || []).map((i: any) => `${i.isDirectory ? '[DIR]' : '[FILE]'} ${i.name}`).join('\n');
          return { text: `Contents of ${relPath}:\n${items}` };
        }
        
        // If IPC fails, try using dir/ls command
        const isWindows = (window as any).electronAPI?.platform === 'win32';
        const cmd = isWindows ? `dir "${relPath || '.'}"` : `ls -la "${relPath || '.'}"`;
        const terminalId = await (window as any).electronAPI?.executeInTerminal?.(cmd);
        if (terminalId) {
          // Wait for output
          await new Promise(resolve => setTimeout(resolve, 500));
          const output = await (window as any).electronAPI?.getTerminalOutput?.(terminalId);
          if (output) return { text: output };
        }

        return { text: `Failed to list folder: ${res?.error}` };
      } catch (e: any) {
        return { text: `Error listing folder: ${e?.message || String(e)}` };
      }
    }

    const deleteMatch = query.match(/^(?:delete|remove)\s+(.+)/i);
    if (deleteMatch) {
      const relPath = deleteMatch[1].trim();
      try {
        const res = await (window as any).electronAPI?.fsDelete(relPath);
        if (res?.ok) return { text: `Deleted: ${relPath}` };
        return { text: `Failed to delete: ${res?.error || 'unknown error'}` };
      } catch (e: any) {
        return { text: `Error deleting: ${e?.message || String(e)}` };
      }
    }

    // Handle "summarize the page" command
    const summarizeMatch = query.match(/^summarize(?:\s+(?:the\s+)?page)?(?:\s+(https?:\/\/\S+))?/i);
    if (summarizeMatch) {
      console.log('SimpleAI: Matched summarize command, triggering summarize_page action');
      return {
        text: 'Getting page content for summarization...',
        actions: [{
          type: 'summarize_page',
          label: 'Summarize current page',
          data: { url: summarizeMatch[1] }  // Optional URL if provided
        }]
      };
    }

    // Legacy URL summarization (kept for backward compatibility)
    const summarizeUrlMatch = query.match(/^summarize\s+url\s+(https?:\/\/\S+)/i);
    if (summarizeUrlMatch) {
      const url = summarizeUrlMatch[1];
      try {
        const res = await (window as any).electronAPI?.fetchUrl(url);
        if (res?.error) return { text: `Failed to fetch page: ${res.error}` };
        const html = res.content as string;
        const text = html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        const snippet = text.slice(0, 15000);
        const prompt = `Summarize the following webpage content concisely:\n\n${snippet}`;
        const aiResp = await aiServerConnector.queryGemini(prompt);
        if (aiResp.error) return { text: `AI error: ${aiResp.error}` };
        return { text: aiResp.text };
      } catch (e: any) {
        return { text: `Error summarizing URL: ${e?.message || String(e)}` };
      }
    }

    // For everything else, proxy the query to the aiServer via IPC
    try {
      console.log('SimpleAI: forwarding query to aiServer via IPC');
      const response = await aiServerConnector.queryGemini(query);
      console.log('SimpleAI: received response from aiServer:', response);
      if (response.error) {
        const errMsg = typeof response.error === 'string' ? response.error : JSON.stringify(response.error);
        console.error('SimpleAI: aiServer returned error:', errMsg);
        return {
          text: `Sorry, I encountered an error contacting the AI service: ${errMsg}`,
          suggestions: ['Try again', 'Ask something else', 'Get help']
        };
      }
      if (!response.text || response.text.trim() === '') {
        console.warn('SimpleAI: Gemini response text is empty!');
        return {
          text: 'Sorry, the AI did not return a summary.',
          suggestions: ['Try again', 'Ask something else', 'Get help']
        };
      }
      return {
        text: response.text,
        suggestions: ['Ask another question', 'Try a command', 'Get help']
      };
    } catch (err) {
      console.error('SimpleAI: error while querying aiServer:', err);
      return {
        text: 'Sorry, I encountered an error. Please try again.',
        suggestions: ['Try again', 'Ask something else', 'Get help']
      };
    }
  }
}

export const simpleAI = new SimpleAI();