

import React, { useState } from 'react';
import { Sparkles, Send, ArrowLeft } from 'lucide-react'; 

interface AIAssistantProps {
    onClose: () => void; 
    
}

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'ai';
}

const FIXED_WIDTH = 200;

export const AIAssistant: React.FC<AIAssistantProps> = ({ onClose }) => {
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! I'm your AI browser assistant.", sender: 'ai' }
    ] as Message[]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const sendMessage = async () => {
        if (input.trim() === '') return;

        const userMessage: Message = { id: Date.now(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const aiResponse: Message = { 
            id: Date.now() + 1, 
            text: `(AI) Response to: "${userMessage.text}".`, 
            sender: 'ai' 
        };

        setMessages(prev => [...prev, aiResponse]);
        setLoading(false);
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

            <div className="p-2 border-t border-border flex items-center gap-1">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Ask..."
                    className="flex-1 p-1 border border-input rounded-lg bg-background focus:ring-1 focus-ring-blue-500 focus:border-blue-500 text-xs"
                    disabled={loading}
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