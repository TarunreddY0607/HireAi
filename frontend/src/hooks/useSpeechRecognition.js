import { useEffect, useRef, useState } from "react";

function useSpeechRecognition() {

    const SpeechRecognition =
        typeof window !== "undefined" ?
            (window.SpeechRecognition || window.webkitSpeechRecognition) : null;

    const recognitionRef = useRef(null);
    const [transcript, setTranscript] = useState("");
    const [listening, setListening] = useState(false);
    const [supported, setSupported] = useState(Boolean(SpeechRecognition));

    useEffect(() => {
        if (!SpeechRecognition) {
            setSupported(false);
            return;
        }

        try {
            const recognition = new SpeechRecognition();
            recognition.lang = "en-US";
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.maxAlternatives = 1;

            recognition.onstart = () => {
                setListening(true);
            };

            recognition.onend = () => {
                setListening(false);
            };

            recognition.onerror = (event) => {
                console.warn("Speech recognition error:", event.error);
                setListening(false);
            };

            recognition.onresult = (event) => {
                let text = "";
                for (let i = 0; i < event.results.length; i++) {
                    text += event.results[i][0].transcript + " ";
                }
                setTranscript(text);
            };

            recognitionRef.current = recognition;
            setSupported(true);
        } catch (err) {
            console.warn("Speech recognition init error:", err);
            setSupported(false);
        }

        return () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch (e) {}
            }
        };
    }, []);

    const startListening = () => {
        if (recognitionRef.current) {
            try {
                setTranscript("");
                recognitionRef.current.start();
            } catch (err) {
                console.warn("SpeechRecognition already started or error:", err);
            }
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (err) {
                console.warn("SpeechRecognition stop error:", err);
            }
        }
    };

    return {
        transcript,
        listening,
        supported,
        startListening,
        stopListening
    };

}

export default useSpeechRecognition;