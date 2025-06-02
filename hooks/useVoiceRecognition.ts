/**
 * Custom hook for handling Web Speech API voice recognition functionality
 * Provides a simple interface to start and stop voice recognition and track its status
 * 
 * @param onResult - Optional callback function that receives the raw speech recognition result event
 * @returns Object containing recognition status, error state, and control functions
 */
import { useState, useCallback, useRef } from 'react';
import { VoiceRecognitionStatus } from '@/lib/types/webSpeech';

export const useVoiceRecognition = (onResult?: (event: any) => void) => {
    // Track the current status of voice recognition
    const [status, setStatus] = useState<VoiceRecognitionStatus>('idle');
    // Store any error messages that occur during recognition
    const [error, setError] = useState<string | null>(null);
    // Maintain a reference to the SpeechRecognition instance
    const recognitionRef = useRef<any>(null);

    const startListening = useCallback(() => {
        try {
            // Get the appropriate SpeechRecognition constructor for the browser
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                throw new Error('Speech recognition is not supported in this browser');
            }

            // Initialize new speech recognition instance
            recognitionRef.current = new SpeechRecognition();
            const recognition = recognitionRef.current;

            // Configure recognition settings
            recognition.continuous = false;      // Stop recognition after user stops speaking
            recognition.interimResults = false;  // Only return final results
            recognition.lang = 'en-US';         // Set recognition language to English

            // Event handler when recognition starts
            recognition.onstart = () => {
                setStatus('listening');
                setError(null);
            };

            // Event handler when recognition ends
            recognition.onend = () => {
                setStatus('idle');
            };

            // Event handler for recognition results
            recognition.onresult = (event: any) => {
                if (onResult) {
                    onResult(event);
                }
            };

            // Event handler for recognition errors
            recognition.onerror = (event: any) => {
                setStatus('error');
                setError(event.error);
            };

            // Start the recognition process
            recognition.start();
        } catch (err: any) {
            setStatus('error');
            setError(err.message);
        }
    }, [onResult]);

    // Function to stop the recognition process
    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    }, []);

    return {
        status,      // Current recognition status ('idle', 'listening', 'error')
        error,       // Error message if something goes wrong
        startListening,  // Function to start voice recognition
        stopListening    // Function to stop voice recognition
    };
}; 