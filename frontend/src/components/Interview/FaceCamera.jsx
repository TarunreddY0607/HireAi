import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import useFaceDetection from "../../hooks/useFaceDetection";

function FaceCamera({ onLookAwayTimeout }) {

    const webcamRef = useRef(null);
    const [cameraError, setCameraError] = useState(false);

    const {
        videoRef,
        faceDetected,
        lookingForward,
        lookAwaySeconds
    } = useFaceDetection({ onLookAwayTimeout, timeoutSeconds: 5 });

    useEffect(() => {

        const timer = setInterval(() => {

            if (
                webcamRef.current &&
                webcamRef.current.video
            ) {
                videoRef.current = webcamRef.current.video;
            }

        }, 100);

        return () => clearInterval(timer);

    }, [videoRef]);

    return (

        <div className="face-camera">

            {cameraError ? (
                <div className="camera-error-box" style={{
                    width: "100%",
                    maxWidth: 350,
                    height: 220,
                    background: "#fef2f2",
                    border: "1px dashed #f87171",
                    borderRadius: 14,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 16,
                    textAlign: "center",
                    color: "#991b1b"
                }}>
                    <span style={{ fontSize: 32, marginBottom: 8 }}>📷</span>
                    <strong style={{ fontSize: 13, marginBottom: 4 }}>Camera Access Required</strong>
                    <p style={{ fontSize: 11.5, margin: 0, color: "#b91c1c" }}>
                        Please allow camera permissions in your mobile browser or open on https:// or localhost.
                    </p>
                </div>
            ) : (
                <Webcam
                    ref={webcamRef}
                    audio={false}
                    mirrored={true}
                    playsInline={true}
                    width={350}
                    height={260}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{
                        facingMode: "user",
                        width: { ideal: 640 },
                        height: { ideal: 480 }
                    }}
                    onUserMediaError={(err) => {
                        console.warn("Webcam UserMedia Error:", err);
                        setCameraError(true);
                    }}
                />
            )}

            <div className="camera-status">

                <p>
                    {
                        faceDetected
                            ? "🟢 Face Detected"
                            : "🔴 Face Not Detected"
                    }
                </p>

                <p>
                    {
                        lookingForward
                            ? "👀 Looking Forward"
                            : "⚠️ Look at the Camera"
                    }
                </p>

                {lookAwaySeconds > 0 && (
                    <p style={{
                        color: "#dc2626",
                        fontWeight: 700,
                        fontSize: 12,
                        background: "#fee2e2",
                        padding: "3px 8px",
                        borderRadius: 6,
                        margin: 0
                    }}>
                        ⏱️ Warning: {5 - lookAwaySeconds}s before new question!
                    </p>
                )}

            </div>

        </div>

    );

}

export default FaceCamera;