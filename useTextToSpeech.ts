import { useState, useEffect, useRef, useCallback } from 'react';
import { generateSpeech } from '../services/geminiService';

// FIX: Add type declaration for webkitAudioContext to support Safari and older browsers.
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

interface TextToSpeechHook {
  isSpeaking: boolean;
  speak: (text: string, lang?: string) => void;
  stop: () => void;
  supported: boolean;
}

// Helper function to decode base64 string to Uint8Array
function decode(base64: string): Uint8Array {
  try {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  } catch (error) {
    console.error("Base64 decoding failed:", error);
    return new Uint8Array(0); // Return empty array on failure
  }
}

// Helper function to decode raw PCM audio data into an AudioBuffer
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
    if (data.length === 0) {
        throw new Error("Cannot decode empty audio data.");
    }
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}


export const useTextToSpeech = (): TextToSpeechHook => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  // Use a ref to hold the queue of audio sources to be able to cancel them
  const audioQueueRef = useRef<AudioBufferSourceNode[]>([]);
  // Use a ref to track if a stop request was made
  const stopRequestedRef = useRef(false);

  useEffect(() => {
    try {
        if (typeof window !== 'undefined' && !audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
        }
    } catch (error) {
        console.error("Could not create AudioContext:", error);
    }

    return () => {
        // Enhanced cleanup on unmount
        stopRequestedRef.current = true;
        if(audioQueueRef.current.length > 0) {
          audioQueueRef.current.forEach(source => {
            try { source.stop(); } catch(e) { /* ignore */ }
          });
          audioQueueRef.current = [];
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
             audioContextRef.current.close().catch(console.error);
        }
    }
  }, []);

  const speak = useCallback(async (text: string, lang: string = 'en-US') => {
    if (!audioContextRef.current || isSpeaking) return;

    if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
    }
    
    stopRequestedRef.current = false;
    setIsSpeaking(true);
    
    // Split text into sentences for chunked playback
    const sentences = text.match(/[^.!?]+[.!?\s]*/g) || [text];
    let nextStartTime = audioContextRef.current.currentTime;
    const sources: AudioBufferSourceNode[] = [];

    try {
        const nonEmptySentences = sentences.filter(s => s.trim().length > 0);
        if (nonEmptySentences.length === 0) {
            setIsSpeaking(false);
            return;
        }

        for (let i = 0; i < nonEmptySentences.length; i++) {
            const sentence = nonEmptySentences[i];
            if (stopRequestedRef.current) break;
            
            // The lang parameter is not used by generateSpeech, but we respect the hook's interface
            const base64Audio = await generateSpeech(sentence);
            if (stopRequestedRef.current) break;

            const audioData = decode(base64Audio);
            if (audioData.length === 0) continue;

            const audioBuffer = await decodeAudioData(audioData, audioContextRef.current, 24000, 1);
            if (stopRequestedRef.current) break;

            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContextRef.current.destination);
            source.start(nextStartTime);
            
            sources.push(source);
            nextStartTime += audioBuffer.duration;

            // If this is the last sentence, attach the onended handler to clean up state
            if (i === nonEmptySentences.length - 1) {
                source.onended = () => {
                    // Check if stop was requested before automatically setting state to not speaking
                    if (!stopRequestedRef.current) {
                        setIsSpeaking(false);
                        audioQueueRef.current = [];
                    }
                };
            }
        }
        audioQueueRef.current = sources;

        // If the loop was stopped early and nothing was queued to play
        if (sources.length === 0) {
            setIsSpeaking(false);
        }
    } catch (error) {
        console.error("Error during text-to-speech playback:", error);
        setIsSpeaking(false); // Ensure state is reset on error
        audioQueueRef.current = [];
    }
  }, [isSpeaking]);

  const stop = useCallback(() => {
    if (!audioContextRef.current) return;
    
    stopRequestedRef.current = true;
    
    audioQueueRef.current.forEach(source => {
      try {
        source.stop();
        source.onended = null; // Prevent onended from firing after manual stop
      } catch (e) {
        // Ignore errors if source has already stopped or not started
      }
    });
    
    audioQueueRef.current = [];
    setIsSpeaking(false);
  }, []);

  return { isSpeaking, speak, stop, supported: !!audioContextRef.current };
};
