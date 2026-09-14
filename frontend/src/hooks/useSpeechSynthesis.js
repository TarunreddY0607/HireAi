import { useCallback } from "react";

function useSpeechSynthesis() {

    const speak = useCallback((text) => {

        if (!window.speechSynthesis) {

            alert("Speech Synthesis is not supported.");

            return;

        }

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        utterance.lang = "en-US";

        utterance.rate = 1;

        utterance.pitch = 1;

        utterance.volume = 1;

        const voices = window.speechSynthesis.getVoices();

        const englishVoice = voices.find(

            voice => voice.lang.startsWith("en")

        );

        if (englishVoice) {

            utterance.voice = englishVoice;

        }

        window.speechSynthesis.speak(utterance);

    }, []);

    const stop = () => {

        window.speechSynthesis.cancel();

    };

    return {

        speak,

        stop

    };

}

export default useSpeechSynthesis;