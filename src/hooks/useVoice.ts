/**
 * useVoice Hook
 * Abstracts the Web Speech API for voice-to-text functionality.
 */

import { useState, useCallback } from "react";

export const useVoice = () => {
  const [isListening, setIsListening] = useState(false);

  const startListening = useCallback(
    (onResult: (transcript: string) => void) => {
      if (
        !("webkitSpeechRecognition" in window) &&
        !("SpeechRecognition" in window)
      ) {
        console.warn("Speech Recognition not supported in this browser.");
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognition =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).SpeechRecognition ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).webkitSpeechRecognition;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const recognition = new SpeechRecognition() as any;

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => setIsListening(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };
      recognition.onend = () => setIsListening(false);

      recognition.start();
    },
    [],
  );

  return { isListening, startListening };
};
