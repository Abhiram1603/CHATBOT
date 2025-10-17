
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Chat } from '@google/genai';
import { Message, ChatRole, Personality, User, GroundingChunk } from '../../types';
import { initializeChat, sendMessageStream, isImageGenerationIntent, generateImage, editImage, isImageEditIntent, detectLanguage } from '../../services/geminiService';
import * as api from '../../services/apiService';
import MessageList from '../chat/MessageList';
import ChatInput from '../chat/ChatInput';
import VoiceModeInput from '../chat/VoiceModeInput';
import SettingsMenu from '../ui/SettingsMenu';
import Logo from '../ui/Logo';
import IconButton from '../ui/IconButton';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';
import ExamplePrompts from '../chat/ExamplePrompts';
import { SettingsIcon, SunIcon, MoonIcon, StopCircleIcon } from '../ui/Icons';
import { getInitials } from '../../utils/stringUtils';

type Theme = 'light' | 'dark';

interface ChatPageProps {
  currentUser: User;
  onLogout: () => void;
  onOpenProfile: () => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

const ChatPage: React.FC<ChatPageProps> = ({ currentUser, onLogout, onOpenProfile, theme, onThemeChange }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const chatRef = useRef<Chat | null>(null);
    const stopGenerationRef = useRef(false);
    const { speak } = useTextToSpeech();

    const [personality, setPersonality] = useState<Personality>(Personality.FRIENDLY);
    const [useGoogleSearch, setUseGoogleSearch] = useState(true);

    const [isVoiceMode, setIsVoiceMode] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const isInitialMount = useRef(true);

    useEffect(() => {
        api.apiGetChatHistory(currentUser.email)
            .then(history => {
                setMessages(history);
                chatRef.current = initializeChat(history, personality, useGoogleSearch);
            })
            .catch(error => {
                console.error("Failed to load or initialize chat history:", error);
                setMessages([]);
            })
            .finally(() => {
                isInitialMount.current = false;
            });
    }, [currentUser, personality, useGoogleSearch]);

    useEffect(() => {
        if (!isInitialMount.current && messages.length > 0) {
            api.apiSaveChatHistory(currentUser.email, messages)
                .catch(error => console.error("Failed to save chat history:", error));
        }
    }, [messages, currentUser.email]);
    
    const handleClearHistory = () => {
        api.apiClearChatHistory(currentUser.email)
            .then(() => {
                setMessages([]);
                chatRef.current = initializeChat([], personality, useGoogleSearch);
                setIsSettingsOpen(false);
            })
            .catch(error => console.error("Failed to clear chat history:", error));
    };
    
    const handleStopGeneration = () => {
        stopGenerationRef.current = true;
        setIsLoading(false);
        setMessages(prev => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage && lastMessage.role === ChatRole.MODEL && lastMessage.status) {
                return prev.map(msg => 
                    msg.id === lastMessage.id 
                    ? { 
                        ...msg, 
                        status: undefined, 
                        error: msg.text ? undefined : "Generation stopped.",
                        text: msg.text || ""
                      }
                    : msg
                );
            }
            return prev;
        });
    };

    const handleSendMessage = async (message: { text: string; image?: string }, isVoiceInput = false) => {
        if (isLoading || (!message.text.trim() && !message.image)) return;
    
        setIsLoading(true);
        stopGenerationRef.current = false;
        if (isVoiceMode) setIsVoiceMode(false);
    
        const userMessage: Message = { id: uuidv4(), role: ChatRole.USER, ...message };
        const modelMessageId = uuidv4();
        let status: Message['status'] = 'generating_text';

        if (message.image && message.text && isImageEditIntent(message.text)) {
            status = 'editing_image';
        } else if (!message.image && isImageGenerationIntent(message.text)) {
            status = 'generating_image';
        }
        
        const modelPlaceholder: Message = { id: modelMessageId, role: ChatRole.MODEL, text: '', status };
        setMessages(prev => [...prev, userMessage, modelPlaceholder]);

        try {
            const detectedLanguage = message.text.trim() ? await detectLanguage(message.text) : 'en-US';
    
            if (status === 'editing_image' && message.image) {
                const result = await editImage(message.text, message.image);
                if (stopGenerationRef.current) return;
                const newModelMessage: Message = { id: modelMessageId, role: ChatRole.MODEL, text: result.text, image: result.image, language: detectedLanguage };
                setMessages(prev => prev.map(msg => msg.id === modelMessageId ? newModelMessage : msg));
            } else if (status === 'generating_image') {
                const result = await generateImage(message.text);
                if (stopGenerationRef.current) return;
                const newModelMessage: Message = { id: modelMessageId, role: ChatRole.MODEL, text: result.text, image: result.image, language: detectedLanguage };
                setMessages(prev => prev.map(msg => msg.id === modelMessageId ? newModelMessage : msg));
            } else {
                if (!chatRef.current) chatRef.current = initializeChat(messages, personality, useGoogleSearch);
                const stream = await sendMessageStream(chatRef.current, { ...message });
                let fullText = '';
                let citations: GroundingChunk[] = [];
    
                for await (const chunk of stream) {
                    if (stopGenerationRef.current) break;
                    fullText += chunk.text;
                    if (chunk.candidates?.[0]?.groundingMetadata?.groundingChunks) {
                         citations.push(...chunk.candidates[0].groundingMetadata.groundingChunks);
                    }
                    const updatedMessage: Message = { id: modelMessageId, role: ChatRole.MODEL, text: fullText, citations: [...new Set(citations)], language: detectedLanguage };
                    setMessages(prev => prev.map(msg => msg.id === modelMessageId ? updatedMessage : msg));
                }
                
                if (isVoiceInput) speak(fullText, detectedLanguage);
            }
        } catch (error) {
            if (stopGenerationRef.current) return;
            console.error("Error processing message:", error);
            const errorMessageText = error instanceof Error ? `Error: ${error.message}` : "Sorry, I encountered an unexpected error. Please try again.";
            const errorMessage: Message = { id: modelMessageId, role: ChatRole.MODEL, text: '', error: errorMessageText };
            setMessages(prev => prev.map(msg => msg.id === modelMessageId ? errorMessage : msg));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-transparent">
            <header className="flex items-center justify-between p-4 glassmorphism border-b border-[var(--border-primary)] shadow-lg z-10">
                <Logo />
                <div className="flex items-center space-x-2">
                    <IconButton onClick={() => onThemeChange(theme === 'dark' ? 'light' : 'dark')} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
                        {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
                    </IconButton>
                    <button onClick={onOpenProfile} className="w-8 h-8 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-secondary)] focus:ring-[var(--accent-cyan)]">
                        {currentUser.profilePicture ? (
                            <img src={currentUser.profilePicture} alt="Profile" className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <div className="w-full h-full rounded-full bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--accent-blue)] flex items-center justify-center font-bold text-white text-sm">
                                {getInitials(currentUser.name)}
                            </div>
                        )}
                    </button>
                   <IconButton onClick={() => setIsSettingsOpen(true)} aria-label="Open settings">
                       <SettingsIcon />
                   </IconButton>
                </div>
            </header>
            
            <main className="flex-1 flex flex-col overflow-hidden">
                 {messages.length === 0 && !isLoading ? (
                    <ExamplePrompts 
                        onPromptClick={(prompt) => handleSendMessage({ text: prompt })}
                        currentUser={currentUser}
                    />
                ) : (
                    <MessageList messages={messages} isLoading={isLoading} isSearchEnabled={useGoogleSearch} currentUser={currentUser} />
                )}
                {isLoading && (
                    <div className="px-4 pb-2 text-center">
                        <button
                            onClick={handleStopGeneration}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--text-primary)] bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg hover:bg-gray-700/60 transition-colors"
                            aria-label="Stop generating response"
                        >
                            <StopCircleIcon />
                            Stop generating
                        </button>
                    </div>
                )}
                <ChatInput 
                    onSendMessage={(msg) => handleSendMessage(msg, false)}
                    onVoiceModeToggle={() => setIsVoiceMode(true)}
                    isLoading={isLoading} 
                />
            </main>

            {isVoiceMode && (
                <VoiceModeInput 
                    onSendMessage={(text) => handleSendMessage({ text }, true)}
                    onExitVoiceMode={() => setIsVoiceMode(false)}
                    isLoading={isLoading}
                />
            )}

            <SettingsMenu
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                personality={personality}
                setPersonality={setPersonality}
                useGoogleSearch={useGoogleSearch}
                setUseGoogleSearch={setUseGoogleSearch}
                theme={theme}
                onThemeChange={onThemeChange}
                onClearHistory={handleClearHistory}
                onLogout={onLogout}
            />
        </div>
    );
};

export default ChatPage;
