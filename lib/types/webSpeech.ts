interface IWindow extends Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
}

declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

export type VoiceRecognitionStatus = 'idle' | 'listening' | 'processing' | 'error'; 