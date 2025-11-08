import React, { useState, useEffect } from 'react';
import { Sparkles, Send, ArrowLeft, ExternalLink, Search, Settings, History, Lightbulb } from 'lucide-react';

import { geminiDirectQuery } from '@/services/geminiDirectAI';

import type { WebViewRef } from './WebView';

interface AIAssistantProps {
    onClose: () => void;
    currentTab?: {
        url: string;
        title: string;
        searchQuery?: string;
    };
    webviewRef?: React.RefObject<WebViewRef>;
    onNavigate?: (url: string) => void;
    onSearch?: (query: string) => void;
    onOpenSettings?: (section?: string) => void;
}

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'ai';
    suggestions?: string[];
    actions?: Array<{
        type: string;
        label: string;
        data?: any;
    }>;
}

const FIXED_WIDTH = 280;

export const AIAssistant: React.FC<AIAssistantProps> = ({
    onClose,
    currentTab,
    webviewRef,
    onNavigate,
    onSearch,
    onOpenSettings
}) => {
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Hello! I'm your PingCat AI assistant. I can help you navigate, search, manage settings, and provide productivity tips. What would you like to do?",
            sender: 'ai' as const,
            suggestions: ['Go to google.com', 'Search for cats', 'Show my history', 'Change theme']
        }
    ] as Message[]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isWindowFocused, setIsWindowFocused] = useState(true);

    // No initialization needed for simple AI
    useEffect(() => {
        console.log('AIAssistant mounted');
    }, []);

    // Handle window focus/blur events to maintain responsiveness
    useEffect(() => {
        const handleWindowFocus = () => setIsWindowFocused(true);
        const handleWindowBlur = () => setIsWindowFocused(false);

        window.addEventListener('focus', handleWindowFocus);
        window.addEventListener('blur', handleWindowBlur);

        return () => {
            window.removeEventListener('focus', handleWindowFocus);
            window.removeEventListener('blur', handleWindowBlur);
        };
    }, []);

    const sendMessage = async () => {
        if (input.trim() === '') return;

        const userMessage: Message = { id: Date.now(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        const userQuery = input;
        setInput('');
        setLoading(true);

        try {
            const aiText = await geminiDirectQuery(userQuery);
            const aiMessage: Message = {
                id: Date.now() + 1,
                text: aiText,
                sender: 'ai',
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('AI processing error:', error);
            const errorMessage: Message = {
                id: Date.now() + 1,
                text: "Sorry, I encountered an error processing your request. Please try again.",
                sender: 'ai'
            };
            setMessages(prev => [...prev, errorMessage]);
        }

        setLoading(false);
    };

    const handleSuggestionClick = (suggestion: string) => {
        setInput(suggestion);
    };

    const handlePageSummarization = async (data: any) => {
        console.log('AIAssistant: handlePageSummarization called with data:', data);
        setLoading(true);
        try {
            const url = data?.url || currentTab?.url;
            console.log('AIAssistant: URL to summarize:', url);
            if (!url) {
                console.log('AIAssistant: No URL available');
                const noPageMsg: Message = { id: Date.now() + 2, text: 'No page URL available to summarize.', sender: 'ai' };
                setMessages(prev => [...prev, noPageMsg]);
                setLoading(false);
                return;
            }

            // Try to get content from webview first
            let pageContent: string | null = null;
            try {
                let webview: Electron.WebviewTag | null = null;
                console.log('AIAssistant: Trying to get webview reference');
                const strategies = [
                    { desc: 'direct webview ref', fn: () => document.querySelector('webview') },
                    { desc: 'flex container webview', fn: () => document.querySelector('.flex-1.flex.flex-col.relative webview') },
                    { desc: 'webview by src', fn: () => document.querySelector(`webview[src="${url}"]`) }
                ];
                for (const strategy of strategies) {
                    console.log(`AIAssistant: Trying to find webview using ${strategy.desc}`);
                    webview = strategy.fn() as Electron.WebviewTag | null;
                    if (webview) {
                        console.log(`AIAssistant: Found webview using ${strategy.desc}:`, {
                            src: webview.src,
                            ready: webview.getTitle ? 'yes' : 'no'
                        });
                        break;
                    }
                }
                console.log('Found webview:', webview);
                if (webview) {
                    console.log('AIAssistant: Attempting to extract content from webview');
                    const script = `
                        (function() {
                            try {
                                console.log('Content extraction script running');
                                const selectors = [
                                    '#mainContent', 
                                    '.mainContent',
                                    'main',
                                    'article',
                                    '.content',
                                    '.article',
                                    '#content',
                                    'body'
                                ];
                                for (const selector of selectors) {
                                    const el = document.querySelector(selector);
                                    if (el) {
                                        console.log('Found element:', selector, el.tagName);
                                        const text = (el.innerText || el.textContent || '').toString();
                                        console.log('Extracted text length from', selector + ':', text.length);
                                        return text;
                                    } else {
                                        console.log('No element found for selector:', selector);
                                    }
                                }
                                console.log('No content element found in any selector');
                                return '';
                            } catch (e) {
                                console.error('Error in content extraction:', e);
                                return '';
                            }
                        })();
                    `;
                    console.log('AIAssistant: Executing content extraction script');
                    const mainContent = await webview.executeJavaScript(script);
                    if (mainContent && typeof mainContent === 'string' && mainContent.trim()) {
                        pageContent = mainContent.trim();
                    }
                }
            } catch (e) {
                console.error('Failed to get webview content:', e);
            }
            console.log('Content extraction attempt complete');
            if (!pageContent) {
                console.log('Could not get content from webview, falling back to fetch');
                const res = await (window as any).electronAPI?.fetchUrl(url);
                if (!res || res.error) {
                    const errMsg: Message = { id: Date.now() + 2, text: `Failed to fetch page: ${res?.error || 'unknown'}`, sender: 'ai' };
                    setMessages(prev => [...prev, errMsg]);
                    setLoading(false);
                    return;
                }
                const html = res.content as string;
                pageContent = html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
                    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
                    .replace(/<[^>]+>/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim();
            }
            const snippet = pageContent.slice(0, 15000);
            const prompt = `Summarize the following webpage content in a concise paragraph, and provide 2-3 suggested follow-ups:\n\n${snippet}`;
            // Gemini direct mode: summarization and other advanced actions are not supported in minimal mode
            // Only show the final summary message, not the placeholder
            setMessages(prev => [
                ...prev.filter(m => !m.text.startsWith('Summary for')),
                {
                    id: Date.now() + 3,
                    text: `Summary for "${data?.title || url}":\n\n(Summarization not supported in minimal Gemini mode)`,
                    sender: 'ai'
                }
            ]);
        } catch (error) {
            console.error('Page summarization error:', error);
            const errorMessage: Message = { id: Date.now() + 4, text: 'Sorry, failed to summarize the page.', sender: 'ai' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleActionClick = (action: Message['actions'][0]) => {
        switch (action.type) {
            case 'navigate':
                if (onNavigate && action.data?.url) {
                    onNavigate(action.data.url);
                }
                break;
            case 'search':
                if (onSearch && action.data?.query) {
                    onSearch(action.data.query);
                }
                break;
            case 'open_settings':
                if (onOpenSettings) {
                    onOpenSettings(action.data?.section);
                }
                break;
            case 'open_folder':
                if (action.data?.path) {
                    // Use Electron API to open folder
                    if ((window as any).electronAPI?.openFolder) {
                        (window as any).electronAPI.openFolder(action.data.path);
                    }
                }
                break;
            case 'summarize_page':
                // Handle page summarization
                handlePageSummarization(action.data);
                break;
            case 'new_tab':
                // Handle new tab action
                break;
        }
    };

    const getActionIcon = (type: string) => {
        switch (type) {
            case 'navigate': return <ExternalLink className="h-3 w-3" />;
            case 'search': return <Search className="h-3 w-3" />;
            case 'open_settings': return <Settings className="h-3 w-3" />;
            case 'clear_history': return <History className="h-3 w-3" />;
            default: return <Lightbulb className="h-3 w-3" />;
        }
    };

    return (
        <div
            className="flex flex-col bg-card border-r border-border shadow-2xl z-50 h-screen flex-shrink-0"
            style={{ width: `${FIXED_WIDTH}px` }}
        >

            <div className="flex items-center justify-between p-2 border-b border-border">

                <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded transition-colors" title="Back to Sidebar">
                    <ArrowLeft className="h-5 w-5" />
                </button>

                <h3 className="text-sm font-semibold flex items-center gap-1 text-blue-500">
                    <Sparkles className="h-4 w-4" /> Assistant
                </h3>
            </div>

            <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-full p-2 rounded-xl text-xs ${
                            msg.sender === 'user'
                                ? 'bg-blue-600 text-white rounded-br-none'
                                : 'bg-accent text-foreground rounded-tl-none'
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="p-2 rounded-xl text-xs bg-accent text-foreground">
                            <span className="animate-pulse">Thinking...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Suggestions */}
            {messages[messages.length - 1]?.suggestions && (
                <div className="px-2 pb-1 space-y-1">
                    {messages[messages.length - 1].suggestions!.slice(0, 2).map((suggestion, index) => (
                        <button
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="w-full text-left p-1 text-xs bg-accent hover:bg-accent/80 rounded transition-colors"
                            disabled={loading}
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>
            )}

            {/* Actions */}
            {messages[messages.length - 1]?.actions && (
                <div className="px-2 pb-1 space-y-1">
                    {messages[messages.length - 1].actions!.map((action, index) => (
                        <button
                            key={index}
                            onClick={() => handleActionClick(action)}
                            className="w-full flex items-center gap-2 p-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                            disabled={loading}
                        >
                            {getActionIcon(action.type)}
                            {action.label}
                        </button>
                    ))}
                </div>
            )}

            <div className="p-2 border-t border-border flex items-center gap-1">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Ask..."
                    className="flex-1 p-1 border border-input rounded-lg bg-background focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs"
                    disabled={loading}
                    autoFocus={isWindowFocused}
                />
                <button
                    onClick={sendMessage}
                    className={`p-1 rounded-lg transition-colors ${
                        loading ? 'bg-gray-500' : 'bg-blue-600 hover:bg-blue-700'
                    } text-white`}
                    disabled={loading || input.trim() === ''}
                >
                    <Send className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};
