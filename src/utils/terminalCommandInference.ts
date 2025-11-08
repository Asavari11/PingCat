/**
 * Utility function to convert natural language instructions into Windows terminal commands
 * @param instruction - The user's natural language input (e.g., "go to folder D", "list all files")
 * @returns The inferred Windows command or null if unable to infer
 */
export function inferTerminalCommand(instruction: string): string | null {
  const lowerInstruction = instruction.toLowerCase().trim();

  // Common command mappings
  const commandMappings: { [key: string]: string } = {
    // Navigation
    'go to folder': 'cd',
    'change directory': 'cd',
    'navigate to': 'cd',

    // Listing files
    'list all files': 'dir',
    'show files': 'dir',
    'list files': 'dir',
    'directory listing': 'dir',
    'what files are here': 'dir',

    // Creating directories
    'make a new folder': 'mkdir',
    'create a folder': 'mkdir',
    'create directory': 'mkdir',
    'new folder': 'mkdir',

    // Deleting files
    'delete file': 'del',
    'remove file': 'del',
    'erase file': 'del',

    // Copying files
    'copy file': 'copy',
    'duplicate file': 'copy',

    // Moving files
    'move file': 'move',
    'rename file': 'move',

    // System info
    'system info': 'systeminfo',
    'computer info': 'systeminfo',
    'show system information': 'systeminfo',

    // Network
    'ping': 'ping',
    'network status': 'ipconfig',
    'ip address': 'ipconfig',

    // Process management
    'show processes': 'tasklist',
    'running processes': 'tasklist',
    'kill process': 'taskkill',

    // Other common commands
    'clear screen': 'cls',
    'date': 'date',
    'time': 'time',
    'help': 'help'
  };

  // Check for direct command matches
  for (const [phrase, command] of Object.entries(commandMappings)) {
    if (lowerInstruction.includes(phrase)) {
      // Extract the argument (e.g., folder name, file name)
      const argMatch = instruction.match(new RegExp(`${phrase}\\s+(.+)`, 'i'));
      if (argMatch) {
        const arg = argMatch[1].trim();
        return `${command} ${arg}`;
      } else {
        return command;
      }
    }
  }

  // Handle specific patterns
  const patterns = [
    // cd commands
    { regex: /(?:go to|change to|navigate to)\s+folder\s+(\w+)/i, command: 'cd $1' },
    { regex: /(?:go to|change to|navigate to)\s+(\w+)/i, command: 'cd $1' },

    // mkdir commands
    { regex: /(?:make|create)\s+(?:a\s+)?(?:new\s+)?folder\s+(?:called\s+)?(\w+)/i, command: 'mkdir $1' },
    { regex: /(?:make|create)\s+directory\s+(\w+)/i, command: 'mkdir $1' },

    // del commands
    { regex: /delete\s+all\s+(\.\w+)\s+files\s+in\s+folder\s+(\w+)/i, command: 'del $2\\*$1' },
    { regex: /delete\s+(\w+)/i, command: 'del $1' },

    // dir commands
    { regex: /list\s+files\s+in\s+(\w+)/i, command: 'dir $1' },

    // ping commands
    { regex: /ping\s+(\S+)/i, command: 'ping $1' },

    // taskkill commands
    { regex: /kill\s+process\s+(\w+)/i, command: 'taskkill /IM $1.exe /F' }
  ];

  for (const pattern of patterns) {
    const match = instruction.match(pattern.regex);
    if (match) {
      let command = pattern.command;
      match.slice(1).forEach((arg, index) => {
        command = command.replace(`$${index + 1}`, arg);
      });
      return command;
    }
  }

  // If no match found, return null
  return null;
}

/**
 * Example usage:
 *
 * const command = inferTerminalCommand("go to folder D");
 * // Returns: "cd D"
 *
 * const command2 = inferTerminalCommand("list all files in the current folder");
 * // Returns: "dir"
 *
 * const command3 = inferTerminalCommand("make a new folder called Test");
 * // Returns: "mkdir Test"
 */
