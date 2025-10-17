




import React, { useState, useRef, ChangeEvent, KeyboardEvent, useEffect } from 'react';
import IconButton from '../ui/IconButton';
import { fileToBase64 } from '../../utils/fileUtils';
import { isImageGenerationIntent } from '../../services/geminiService';
import { PaperclipIcon, SendIcon, MicIcon, XIcon } from '../ui/Icons';
import { useDebounce } from '../../hooks/useDebounce';

interface ChatInputProps {
  onSendMessage: (message: { text: string; image?: string }) => void;
  onVoiceModeToggle: () => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, onVoiceModeToggle, isLoading }) => {
  const [text, setText] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [placeholder, setPlaceholder] = useState('Message VSAI...');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        const scrollHeight = textareaRef.current.scrollHeight;
        // Cap the height to avoid excessively large textareas
        const maxHeight = 160; // Corresponds to max-h-40
        textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [text]);

  useEffect(() => {
    if (image) {
        setPlaceholder('Describe how you want to edit the image...');
    } else {
        setPlaceholder('Message VSAI...');
    }
  }, [image]);


  const handleSendMessage = () => {
    if ((text.trim() || image) && !isLoading) {
      onSendMessage({ 
        text, 
        image: image || undefined,
      });
      setText('');
      setImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        alert('File size should not exceed 4MB.');
        return;
      }
      try {
        const base64Image = await fileToBase64(file);
        setImage(base64Image);
      } catch (error) {
        console.error('Error converting file to base64:', error);
        alert('Error processing image file. Please try a different file.');
      }
    }
  };
  
  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setImage(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };
  
  const canSend = !isLoading && (text.trim() || image);

  return (
    <div className="px-4 pb-4 bg-transparent">
       <div className="w-full max-w-4xl mx-auto glassmorphism rounded-xl shadow-2xl">
            {image && (
                <div className="p-2 border-b border-gray-700/50">
                    <div className="flex items-center justify-between gap-4">
                       <div className="relative inline-block">
                            <img src={image} alt="Preview" className="h-20 w-auto rounded-lg" />
                            <button
                                onClick={handleRemoveImage}
                                className="absolute -top-2 -right-2 bg-gray-900/50 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs hover:bg-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
                                aria-label="Remove image"
                            >
                                <XIcon size={12}/>
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className="flex items-end p-2">
                <IconButton onClick={handleAttachClick} className="mr-2" aria-label="Attach file">
                    <PaperclipIcon />
                </IconButton>
                <textarea
                    ref={textareaRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={placeholder}
                    className="flex-1 bg-transparent text-[var(--text-primary)] placeholder-[var(--text-secondary)] resize-none focus:outline-none max-h-40"
                    rows={1}
                    disabled={isLoading}
                />
                <IconButton onClick={onVoiceModeToggle} className="mx-2" aria-label="Toggle voice mode">
                    <MicIcon />
                </IconButton>
                <button 
                  onClick={handleSendMessage} 
                  disabled={!canSend} 
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                             bg-[var(--accent-cyan)] text-white hover:brightness-110
                             disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed" 
                  aria-label="Send message"
                >
                    <SendIcon />
                </button>
            </div>
       </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
      />
    </div>
  );
};

export default ChatInput;