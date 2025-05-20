
export interface InterviewType {
  id: string;
  userId: string;
  resumeId: string;
  jobDescriptionId: string;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface MessageType {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface FeedbackType {
  overallFeedback: string;
  strengths: string[];
  areasForImprovement: string[];
  questionAnalysis?: {
    question: string;
    answer: string;
    feedback: string;
  }[];
  score: number;
}

export interface ResumeData {
  id: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  content?: string;
}

export interface JobDescriptionData {
  id: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  content?: string;
}

// Web Speech API type declarations
declare global {
  interface SpeechRecognitionEventMap {
    audioend: Event;
    audiostart: Event;
    end: Event;
    error: SpeechRecognitionErrorEvent;
    nomatch: SpeechRecognitionEvent;
    result: SpeechRecognitionEvent;
    soundend: Event;
    soundstart: Event;
    speechend: Event;
    speechstart: Event;
    start: Event;
  }

  class SpeechRecognition extends EventTarget {
    continuous: boolean;
    grammars: SpeechGrammarList;
    interimResults: boolean;
    lang: string;
    maxAlternatives: number;
    
    constructor();
    
    abort(): void;
    start(): void;
    stop(): void;

    onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
    onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
    onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onstart: ((this: SpeechRecognition, ev: Event) => any) | null;

    addEventListener<K extends keyof SpeechRecognitionEventMap>(
      type: K,
      listener: (this: SpeechRecognition, ev: SpeechRecognitionEventMap[K]) => any,
      options?: boolean | AddEventListenerOptions
    ): void;
    addEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions
    ): void;
    removeEventListener<K extends keyof SpeechRecognitionEventMap>(
      type: K,
      listener: (this: SpeechRecognition, ev: SpeechRecognitionEventMap[K]) => any,
      options?: boolean | EventListenerOptions
    ): void;
    removeEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | EventListenerOptions
    ): void;
  }

  interface SpeechRecognitionErrorEvent extends Event {
    readonly error: 'aborted' | 'audio-capture' | 'bad-grammar' | 'language-not-supported' | 'network' | 'no-speech' | 'not-allowed' | 'service-not-allowed';
    readonly message: string;
  }

  interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number;
    readonly results: SpeechRecognitionResultList;
  }

  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

export {};