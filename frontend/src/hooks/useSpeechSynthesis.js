import { useCallback } from "react";

function useSpeechSynthesis() {

    const speak = useCallback((text) => {

        if (typeof window === "undefined" || !("speechSynthesis" in window)) {
            console.warn("Speech Synthesis is not supported in this browser/device.");
            return;
        }

        try {
            window.speechSynthesis.cancel();

            if (window.speechSynthesis.paused) {
                window.speechSynthesis.resume();
            }

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = "en-US";
            utterance.rate = 0.95;
            utterance.pitch = 1;
            utterance.volume = 1;

            const applyVoiceAndSpeak = () => {
                const voices = window.speechSynthesis.getVoices();
                if (voices && voices.length > 0) {
                    const englishVoice = voices.find(v => v.lang && v.lang.startsWith("en"));
                    if (englishVoice) {
                        utterance.voice = englishVoice;
                    }
                }
                window.speechSynthesis.speak(utterance);
            };

            const initialVoices = window.speechSynthesis.getVoices();
            if (!initialVoices || initialVoices.length === 0) {
                window.speechSynthesis.onvoiceschanged = () => {
                    applyVoiceAndSpeak();
                };
                // Fallback speak if event doesn't fire immediately
                window.speechSynthesis.speak(utterance);
            } else {
                applyVoiceAndSpeak();
            }
        } catch (err) {
            console.error("Speech synthesis error:", err);
        }

    }, []);

    const stop = () => {
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
            window.speechSynthesis.cancel();
        }
    };

    return {
        speak,
        stop
    };

}

export default useSpeechSynthesis;