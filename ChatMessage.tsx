
import React, { useState } from 'react';
import { Message, ChatRole, User } from '../../types';
import SourceCitation from '../ui/SourceCitation';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';
import IconButton from '../ui/IconButton';
import Logo from '../ui/Logo';
import CodeBlock from './CodeBlock';
import Spinner from '../ui/Spinner';
import { SpeakerIcon, StopIcon, DownloadIcon, CopyIcon, CheckIcon, ImageIcon, ErrorIcon } from '../ui/Icons';
import { getInitials } from '../../utils/stringUtils';

const UserIcon = ({ user }: { user: User }) => (
    <div className="w-8 h-8 rounded-full flex-shrink-0 shadow-lg">
        {user.profilePicture ? (
            <img src={user.profilePicture} alt="Profile" className="w-full h-full rounded-full object-cover" />
        ) : (
            <div className="w-full h-full rounded-full bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--accent-blue)] flex items-center justify-center font-bold text-white text-sm">
                {getInitials(user.name)}
            </div>
        )}
    </div>
);


const ModelIcon = () => (
    <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0 shadow-lg relative">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[var(--accent-cyan)] z-10">
            <defs>
                <linearGradient id="icon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--accent-cyan)" />
                    <stop offset="100%" stopColor="var(--accent-blue)" />
                </linearGradient>
            </defs>
            <path d="M12 2L2 12L12 22L22 12L12 2Z" fill="url(#icon-gradient)" fillOpacity="0.2"/>
            <path d="M12 2L2 12L12 22L22 12L12 2Z" stroke="url(#icon-gradient)" strokeWidth="1.5"/>
            <path d="M7 12L12 7L17 12L12 17L7 12Z" stroke="url(#icon-gradient)" strokeWidth="1.5" strokeLinejoin="round"/>
        </svg>
        <div className="absolute inset-0 bg-[var(--accent-cyan)] rounded-full blur-md opacity-30 animate-pulse"></div>
    </div>
);

const renderMessageContent = (text: string, isLoading: boolean) => {
    // Regex to find python code blocks and split the text
    const parts = text.split(/(```python\n[\s\S]*?```)/g);
    
    const content = parts.map((part, index) => {
        if (part.startsWith('```python')) {
            const code = part.replace(/^```python\n|```$/g, '');
            return <CodeBlock key={index} code={code} />;
        }

        // Handle simulated output prefixed with >>>
        const outputParts = part.split(/(^>>>\s.*)/gm);
        return outputParts.map((p, i) => {
            if (p.startsWith('>>>')) {
                return (
                    <pre key={`${index}-${i}`} className="bg-black/30 text-[var(--accent-cyan)] p-3 rounded-md mt-2 text-sm whitespace-pre-wrap font-mono">
                        <code>{p.substring(4)}</code>
                    </pre>
                )
            }
            if (p.trim()) {
                 return <p key={`${index}-${i}`} className="whitespace-pre-wrap">{p}</p>;
            }
            return null;
        });
    });

    return (
        <div className="prose prose-invert prose-sm max-w-none text-[var(--text-primary)]">
            {content}
            {isLoading && <span className="inline-block w-0.5 h-4 bg-[var(--accent-cyan)] animate-[pulse_1s_ease-in-out_infinite] ml-1" />}
        </div>
    )
};


interface ChatMessageProps {
    message: Message;
    isLoading: boolean;
    isSearchEnabled?: boolean;
    currentUser: User;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isLoading, isSearchEnabled, currentUser }) => {
    const { isSpeaking, speak, stop } = useTextToSpeech();
    const [isCopied, setIsCopied] = useState(false);

    const isUser = message.role === ChatRole.USER;

    const handleCopy = () => {
        if (!message.text) return;
        navigator.clipboard.writeText(message.text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleSpeak = () => {
        if (!message.text || message.error) return;
        if (isSpeaking) {
            stop();
        } else {
            speak(message.text, message.language);
        }
    };

    const handleDownload = () => {
        if (message.image) {
            try {
                const link = document.createElement('a');
                link.href = message.image;
                link.download = `vsai-generated-${Date.now()}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } catch (error) {
                console.error("Failed to trigger download:", error);
            }
        }
    };

    const ErrorDisplay = () => (
        <div className="flex items-center text-red-300">
            <ErrorIcon />
            <p className="whitespace-pre-wrap">{message.error}</p>
        </div>
    );
    
    const LoadingIndicator = () => {
        const isImageTask = message.status === 'editing_image' || message.status === 'generating_image';

        if (isImageTask) {
             const loadingText = message.status === 'editing_image' ? 'Editing your image...' : 'Generating your image...';
             return (
                <div className="flex flex-col items-center">
                    <div className="w-48 h-48 bg-gray-900/50 rounded-lg animate-pulse flex items-center justify-center">
                        <ImageIcon />
                    </div>
                    <span className="mt-3 text-sm text-[var(--text-secondary)]">{loadingText}</span>
                </div>
             )
        }
        
        const loadingText = isSearchEnabled ? "Searching the web..." : "Thinking...";
        
        return (
            <div className="flex items-center py-1 space-x-3">
                <Spinner />
                <span className="text-sm text-[var(--text-secondary)]">{loadingText}</span>
            </div>
        );
    };

    const messageBubbleStyles = isUser
        ? 'bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--accent-blue)] text-white rounded-t-2xl rounded-bl-2xl'
        : message.error
        ? 'glassmorphism border-red-700/50 rounded-t-2xl rounded-br-2xl'
        : 'glassmorphism rounded-t-2xl rounded-br-2xl';
    const messageAlignment = isUser ? 'flex-row-reverse' : 'flex-row';

    return (
        <div className={`group flex items-start gap-3 ${messageAlignment} fade-in`}>
            {isUser ? <UserIcon user={currentUser} /> : <ModelIcon />}
            <div className={`flex flex-col w-full max-w-3xl ${isUser ? 'items-end' : 'items-start'}`}>
                <div className={`px-4 py-3 shadow-lg ${messageBubbleStyles}`}>
                    {isLoading && !message.text && !message.image && !message.error ? (
                        <LoadingIndicator />
                    ) : message.error ? (
                        <ErrorDisplay />
                    ) : (
                       message.text && <div>{renderMessageContent(message.text, isLoading)}</div>
                    )}

                    {message.image && (
                        <div className="mt-2 relative max-w-sm bg-black/20 rounded-lg overflow-hidden">
                            <img src={message.image} alt="Generated content" className="rounded-lg" />
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <IconButton
                                    onClick={handleDownload}
                                    className="bg-black/50"
                                    aria-label="Download image"
                                    title="Download image"
                                >
                                    <DownloadIcon />
                                </IconButton>
                            </div>
                        </div>
                    )}

                    {message.citations && message.citations.length > 0 && <SourceCitation citations={message.citations} />}
                </div>
                {!isUser && !isLoading && (message.text || message.image) && !message.error && (
                    <div className="flex items-center space-x-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {message.text && (
                            <>
                                <IconButton onClick={handleSpeak} aria-label={isSpeaking ? 'Stop speaking' : 'Read message aloud'}>
                                    {isSpeaking ? <StopIcon /> : <SpeakerIcon />}
                                </IconButton>
                                <IconButton onClick={handleCopy} aria-label="Copy message text">
                                    {isCopied ? <CheckIcon /> : <CopyIcon />}
                                </IconButton>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatMessage;