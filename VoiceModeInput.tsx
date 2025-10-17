
import React, { useEffect } from 'react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { MicIcon, XIcon, SendIcon } from '../ui/Icons';

interface VoiceModeInputProps {
  onSendMessage: (text: string) => void;
  onExitVoiceMode: () => void;
  isLoading: boolean;
}

const VoiceModeInput: React.FC<VoiceModeInputProps> = ({ onSendMessage, onExitVoiceMode, isLoading }) => {
  const { isListening, finalTranscript, interimTranscript, startListening, stopListening, error } = useSpeechRecognition();
  const fullTranscript = (finalTranscript + interimTranscript).trim();

  const handleMicClick = () => {
    isListening ? stopListening() : startListening();
  };
  
  const handleSendClick = () => {
      if (fullTranscript && !isLoading) {
          onSendMessage(fullTranscript);
      }
  };

  useEffect(() => {
    // Automatically start listening when the component mounts
    startListening();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="voice-mode-title"
      className="fixed inset-0 bg-gray-900/50 backdrop-blur-lg flex flex-col items-center justify-center z-50 p-4 fade-in"
    >
      <h2 id="voice-mode-title" className="sr-only">Voice Input Mode</h2>
      
      <button 
        onClick={onExitVoiceMode} 
        className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        aria-label="Exit voice mode"
      >
        <XIcon size={32} />
      </button>

      <div className="flex flex-col items-center justify-center flex-grow w-full">
        <div className="relative flex items-center justify-center">
            <button
              onClick={handleMicClick}
              disabled={isLoading}
              className={`w-32 h-32 rounded-full flex items-center justify-center text-white transition-all duration-300 transform hover:scale-105
                ${ isListening ? 'bg-red-600' : 'bg-[var(--accent-cyan)]' } 
                ${ isLoading ? 'bg-gray-600 cursor-not-allowed' : '' }`}
              aria-label={isListening ? 'Stop listening' : 'Start listening'}
            >
              {isListening && <div className="absolute w-full h-full bg-white/30 rounded-full pulse-animation"></div>}
              <MicIcon size={64} />
            </button>
        </div>
        
        <div className="mt-8 text-white text-lg text-center min-h-[56px] w-full max-w-2xl px-4">
           {fullTranscript ? (
                <p>
                    <span>{finalTranscript}</span>
                    <span className="text-gray-400">{interimTranscript}</span>
                </p>
           ) : (
                <p className="text-gray-400">
                    {isListening ? "Listening..." : "Tap the mic to start."}
                </p>
           )}
        </div>

        {error && <p className="text-red-400 mt-4" role="alert">{`Error: ${error}`}</p>}
      </div>
      
      <div className="p-4 w-full max-w-2xl flex flex-col items-center">
          <button 
            onClick={handleSendClick}
            disabled={!fullTranscript || isLoading}
            className="w-full max-w-xs bg-[var(--accent-cyan)] text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors
                       hover:brightness-110 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
              <SendIcon />
              <span>Send Message</span>
          </button>
          <p aria-live="polite" className="sr-only">
            {isListening ? 'Listening for voice input.' : 'Not listening.'}
          </p>
      </div>
    </div>
  );
};

export default VoiceModeInput;