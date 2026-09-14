import { useEffect, useRef, useState } from "react";

function useSpeechRecognition() {

    const SpeechRecognition =

        window.SpeechRecognition ||

        window.webkitSpeechRecognition;

    const recognitionRef = useRef(null);

    const [transcript, setTranscript] = useState("");

    const [listening, setListening] = useState(false);

    useEffect(() => {

        if (!SpeechRecognition) return;

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

        recognition.onresult = (event) => {

            let text = "";

            for (

                let i = 0;

                i < event.results.length;

                i++

            ) {

                text += event.results[i][0].transcript + " ";

            }

            setTranscript(text);

        };

        recognitionRef.current = recognition;

    }, []);

    const startListening = () => {

        if (recognitionRef.current) {

            setTranscript("");

            recognitionRef.current.start();

        }

    };

    const stopListening = () => {

        if (recognitionRef.current) {

            recognitionRef.current.stop();

        }

    };

    return {

        transcript,

        listening,

        startListening,

        stopListening

    };

}

export default useSpeechRecognition;