import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader, Bot, User, Sparkles, ChefHat } from 'lucide-react';
import { apiService } from '../services/api.service';

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface ChatWidgetProps {
    platContext?: {
        id: number;
        nom: string;
    };
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ platContext }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: '👋 Bonjour! Je suis l\'assistant RestoDeluxe. Posez-moi vos questions sur nos plats, ingrédients ou allergènes! 🍽️',
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll vers le bas quand un nouveau message arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus sur l'input quand le chat s'ouvre
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    // Ajouter un message contextuel si un plat est sélectionné
    useEffect(() => {
        if (platContext && isOpen) {
            const contextMessage = `Vous consultez: ${platContext.nom}. N'hésitez pas à me poser des questions sur ce plat!`;
            const existingContext = messages.find(m => m.content.includes(platContext.nom));
            if (!existingContext) {
                setMessages(prev => [...prev, {
                    id: `context-${Date.now()}`,
                    role: 'assistant',
                    content: `📌 ${contextMessage}`,
                    timestamp: new Date()
                }]);
            }
        }
    }, [platContext, isOpen]);

    const sendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: inputValue.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            // Préparer l'historique pour l'API
            const conversationHistory = messages
                .filter(m => m.id !== 'welcome')
                .map(m => ({ role: m.role, content: m.content }));

            const response = await apiService.sendChatMessage(
                userMessage.content,
                platContext?.id,
                conversationHistory
            );

            const assistantMessage: ChatMessage = {
                id: `assistant-${Date.now()}`,
                role: 'assistant',
                content: response.response || 'Désolé, je n\'ai pas pu traiter votre demande.',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Erreur chat:', error);
            setMessages(prev => [...prev, {
                id: `error-${Date.now()}`,
                role: 'assistant',
                content: '😔 Oups, une erreur s\'est produite. Réessayez ou contactez notre équipe!',
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Suggestions de questions rapides
    const quickQuestions = [
        "Quels plats recommandez-vous?",
        "Y a-t-il des options végétariennes?",
        "Quels sont les allergènes?"
    ];

    return (
        <>
            {/* Bouton flottant */}
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-24 right-4 md:bottom-8 md:right-8 z-50 w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-[#FC8A06] to-orange-600 rounded-full shadow-2xl shadow-orange-500/40 flex items-center justify-center text-white hover:scale-110 transition-all duration-300 ${isOpen ? 'hidden' : 'animate-bounce-slow'}`}
                aria-label="Ouvrir le chat"
            >
                <MessageCircle className="w-7 h-7 md:w-8 md:h-8" />
                {/* Badge notification */}
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <Sparkles className="w-3 h-3" />
                </span>
            </button>

            {/* Modal Chat */}
            {isOpen && (
                <div className="fixed inset-0 z-[100] md:inset-auto md:bottom-8 md:right-8 md:w-[400px] md:h-[600px] flex flex-col">
                    {/* Overlay mobile */}
                    <div
                        className="absolute inset-0 bg-black/50 md:hidden"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Chat Container */}
                    <div className="relative flex flex-col h-full md:h-auto md:max-h-[600px] bg-white md:rounded-[2rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300 m-4 md:m-0 rounded-[2rem]">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-[#FC8A06] to-orange-600 p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                    <ChefHat className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg">Assistant RestoDeluxe</h3>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                        <span className="text-white/80 text-xs font-medium">En ligne • IA Rapide</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white min-h-[300px] max-h-[400px]">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                                >
                                    {/* Avatar */}
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.role === 'user'
                                            ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                                            : 'bg-gradient-to-br from-[#FC8A06] to-orange-600'
                                        }`}>
                                        {message.role === 'user'
                                            ? <User className="w-4 h-4 text-white" />
                                            : <Bot className="w-4 h-4 text-white" />
                                        }
                                    </div>

                                    {/* Message Bubble */}
                                    <div className={`max-w-[75%] p-3 rounded-2xl ${message.role === 'user'
                                            ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-br-md'
                                            : 'bg-white shadow-md border border-gray-100 text-gray-800 rounded-bl-md'
                                        }`}>
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                                        <span className={`text-[10px] mt-1 block ${message.role === 'user' ? 'text-white/70' : 'text-gray-400'
                                            }`}>
                                            {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            ))}

                            {/* Loading indicator */}
                            {isLoading && (
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FC8A06] to-orange-600 flex items-center justify-center">
                                        <Bot className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="bg-white shadow-md border border-gray-100 p-3 rounded-2xl rounded-bl-md">
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Questions */}
                        {messages.length <= 2 && (
                            <div className="px-4 pb-2">
                                <p className="text-xs text-gray-400 mb-2 font-medium">💡 Questions suggérées:</p>
                                <div className="flex flex-wrap gap-2">
                                    {quickQuestions.map((q, i) => (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                setInputValue(q);
                                                inputRef.current?.focus();
                                            }}
                                            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full transition-all"
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Input */}
                        <div className="p-4 border-t border-gray-100 bg-white">
                            <div className="flex items-center gap-2">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Posez votre question..."
                                    disabled={isLoading}
                                    className="flex-1 bg-gray-100 border-none rounded-full px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FC8A06]/50 placeholder-gray-400 disabled:opacity-50"
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={!inputValue.trim() || isLoading}
                                    className="w-11 h-11 bg-gradient-to-br from-[#FC8A06] to-orange-600 rounded-full flex items-center justify-center text-white hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-orange-500/30"
                                >
                                    {isLoading ? (
                                        <Loader className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Send className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            <p className="text-[10px] text-gray-400 text-center mt-2">
                                Propulsé par Llama 3.3 🦙 • Réponses instantanées
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* CSS pour l'animation */}
            <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
        </>
    );
};

export default ChatWidget;
