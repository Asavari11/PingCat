# Fix dotenv process error in Electron app

## Problem
- App not loading due to "Uncaught ReferenceError: process is not defined" in llmService.ts
- dotenv.config() tries to access process.env in renderer process, which doesn't have Node.js globals

## Solution
- Move environment variable loading to main process (electron/main.ts)
- Expose env vars via IPC to renderer process
- Update llmService.ts to use exposed env vars instead of direct process.env

## Steps
- [ ] Load dotenv in electron/main.ts and store env vars
- [ ] Add IPC handler in main.ts to provide env vars
- [ ] Update preload.js to expose getEnv method
- [ ] Remove dotenv import from llmService.ts and use exposed env vars
- [ ] Test the app loads without errors
