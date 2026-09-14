import Webcam from "react-webcam";

function WebcamView() {

    return (

        <Webcam

            audio={false}

            mirrored

            width={350}

            height={260}

        />

    );

}

export default WebcamView;