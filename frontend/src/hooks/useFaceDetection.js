import { useEffect, useRef, useState } from "react";
import {
    FaceLandmarker,
    FilesetResolver
} from "@mediapipe/tasks-vision";

function useFaceDetection({ onLookAwayTimeout, timeoutSeconds = 5 } = {}) {

    const videoRef = useRef(null);

    const [faceDetected, setFaceDetected] = useState(false);

    const [lookingForward, setLookingForward] = useState(false);

    const [lookAwaySeconds, setLookAwaySeconds] = useState(0);

    const lookAwayStartRef = useRef(null);
    const timeoutTriggeredRef = useRef(false);
    const callbackRef = useRef(onLookAwayTimeout);

    useEffect(() => {
        callbackRef.current = onLookAwayTimeout;
    }, [onLookAwayTimeout]);

    useEffect(() => {

        let faceLandmarker = null;
        let animationId;
        let mounted = true;

        const loadModel = async () => {

            try {

                const vision = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
                );

                faceLandmarker = await FaceLandmarker.createFromOptions(
                    vision,
                    {
                        baseOptions: {
                            modelAssetPath:
                                "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task"
                        },
                        runningMode: "VIDEO",
                        numFaces: 1,
                        outputFaceBlendshapes: true,
                        outputFacialTransformationMatrixes: true
                    }
                );

                detect();

            } catch (err) {
                console.error("Face Model Error:", err);
            }

        };

        const detect = () => {

            if (!mounted) return;

            const video = videoRef.current;

            if (
                faceLandmarker &&
                video &&
                video.readyState >= 2 &&
                video.videoWidth > 0 &&
                video.videoHeight > 0
            ) {

                try {
                    const result = faceLandmarker.detectForVideo(
                        video,
                        performance.now()
                    );

                    let isFacePresent = false;
                    let isFacingFront = false;

                    if (result && result.faceLandmarks && result.faceLandmarks.length > 0) {
                        isFacePresent = true;
                        const landmarks = result.faceLandmarks[0];

                        const nose = landmarks[1] || landmarks[4];
                        const leftCheek = landmarks[234];
                        const rightCheek = landmarks[454];

                        if (nose && leftCheek && rightCheek) {
                            const earDist = Math.abs(rightCheek.x - leftCheek.x);
                            const noseToLeft = Math.abs(nose.x - leftCheek.x);
                            const ratio = earDist > 0.05 ? (noseToLeft / earDist) : 0.5;

                            if (ratio >= 0.28 && ratio <= 0.72) {
                                isFacingFront = true;
                            }
                        } else {
                            isFacingFront = true;
                        }
                    }

                    setFaceDetected(isFacePresent);
                    setLookingForward(isFacingFront);

                    const isLookingAway = !isFacePresent || !isFacingFront;

                    if (isLookingAway) {
                        if (!lookAwayStartRef.current) {
                            lookAwayStartRef.current = Date.now();
                            timeoutTriggeredRef.current = false;
                        } else {
                            const elapsed = (Date.now() - lookAwayStartRef.current) / 1000;
                            const elapsedSec = Math.floor(elapsed);
                            setLookAwaySeconds(Math.min(timeoutSeconds, elapsedSec));

                            if (elapsed >= timeoutSeconds && !timeoutTriggeredRef.current) {
                                timeoutTriggeredRef.current = true;
                                lookAwayStartRef.current = null;
                                setLookAwaySeconds(0);
                                if (typeof callbackRef.current === "function") {
                                    callbackRef.current();
                                }
                            }
                        }
                    } else {
                        lookAwayStartRef.current = null;
                        timeoutTriggeredRef.current = false;
                        setLookAwaySeconds(0);
                    }
                } catch (e) {
                    // Ignore transient frame detection errors
                }

            }

            animationId = requestAnimationFrame(detect);

        };

        loadModel();

        return () => {
            mounted = false;
            cancelAnimationFrame(animationId);
        };

    }, [timeoutSeconds]);

    return {
        videoRef,
        faceDetected,
        lookingForward,
        lookAwaySeconds
    };

}

export default useFaceDetection;