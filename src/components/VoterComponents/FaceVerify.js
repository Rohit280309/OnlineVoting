import React, { useEffect, useRef, useContext, useState } from 'react'
import axios from 'axios';
import colorContext from '../../context/bgColor/colorContext';
import { useNavigate } from 'react-router-dom'
import "../../css/faceverify.css"
import Alert from "../Alert.js";

const FaceVerify = (props) => {

    const context = useContext(colorContext);
    const { mode } = context;

    
    const [clicked, setClicked] = useState(false);

    const videoRef = useRef(null);
    const imt = useRef(false);
    let history = useNavigate();

    const host = process.env.REACT_APP_API;
    const refresh = localStorage.getItem("refresh");
    let access = localStorage.getItem("access");

    const headers = {
        'Content-Type': 'multipart/form-data',
        "Authorization": access
    };

    const refreshToken = async () => {
        try {
            const response = await axios.post(`${host}/token/refresh/`, { refresh: refresh });
            let accessToken = response.data.access;
            localStorage.setItem('access', accessToken);
            headers.Authorization = `${accessToken}`;
        } catch (error) {
            console.log("Error accessing the token");
        }
    }

    const [alert, setAlert] = useState(null);

    const uploadImage = async (img) => {

        const formData = new FormData();
        console.log(img)
        formData.append('image', img);

        try {
            // Send the image to the Django backend
            const response = await axios.post(`${host}/upload-image`, formData, { headers: headers })
            if (response.data.Status === "Image Matched") {
                history("/castvote");
            }
            else if (response.data.Status === "Image Not Matched") {
                showAlert("Image not matched", "danger");
                setClicked(false);
            }
            else {
                refreshToken()
                    .then(res => {
                        axios.post(`${host}/upload-image`, formData, { headers: headers })
                            .then(res => {
                                if (res.data.Status === "Image Matched") {
                                    // props.showAlert(response.data.Status, "success");
                                    history("/castvote");
                                }
                                else {
                                    showAlert("Image not matched", "danger");
                                    setClicked(false);
                                }
                            })
                            .catch(err => { console.log(err) })
                    })
                    .catch(err => { console.log(err) })
            }

            // Image uploaded successfully
            console.log('Image uploaded!');
        } catch (error) {
            // Handle error
            showAlert("Image not matched", "danger");

        }
    }
    let videoStream = useRef();

    const dataURItoBlob = (dataURI) => {
        // Split the data URI into metadata and data parts
        var parts = dataURI.split(';');
        var mimeType = parts[0].split(':')[1];
        var base64 = parts[1].split(',')[1];

        // Convert base64 to binary
        var binary = atob(base64);

        // Create Uint8Array from binary data
        var array = [];
        for (var i = 0; i < binary.length; i++) {
            array.push(binary.charCodeAt(i));
        }

        // Create Blob
        return new Blob([new Uint8Array(array)], { type: mimeType });
    }

    useEffect(() => {

        const videoElement = videoRef.current;
        // Access the webcam video
        if (navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices
                .getUserMedia({ video: true })
                .then((stream) => {
                    videoElement.srcObject = stream;
                    videoStream.current = stream;
                })
                .catch((error) => {
                    console.error('Error accessing webcam:', error);
                });
        } else {
            console.error('getUserMedia is not supported in this browser.');
        }

        // Run operations on each video frame
        const processVideo = () => {
            if (videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                context.canvas.willReadFrequently = true;

                canvas.width = videoElement.videoWidth;
                canvas.height = videoElement.videoHeight;

                // Draw the current video frame onto the canvas
                context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);



                if (imt.current === true) {
                    var imgurl = canvas.toDataURL();
                    uploadImage(dataURItoBlob(imgurl));
                    imt.current = false;
                }

                // Call processVideo recursively to process the next video frame
                requestAnimationFrame(processVideo);
            } else {
                // If the video is not ready, call processVideo again after a short delay
                setTimeout(processVideo, 100);
            }
        };

        // Start processing the video frames
        processVideo();

        return () => {
            if (videoStream.current) {
                const tracks = videoStream.current.getTracks();
                tracks.forEach((track) => track.stop());
            }
        };
        // eslint-disable-next-line
    }, []);

    const handleClick = (e) => {
        e.preventDefault();
        setClicked(true);
        imt.current = true;
    }

    const handleBackClick = () => {
        props.onBackClick();
        history("/election");
        return () => {
            if (videoStream.current) {
                const tracks = videoStream.current.getTracks();
                tracks.forEach((track) => track.stop());
            }
        };
    }

    const handleRouteChange = () => {
        history("/")
        const currentPath = window.location.pathname;
        if (currentPath === '/') {
            localStorage.removeItem('access');
            localStorage.removeItem('refresh');
        }
    };

    useEffect(() => {
        window.addEventListener('popstate', handleRouteChange);

        return () => {
            window.removeEventListener('popstate', handleRouteChange);
        };
        // eslint-disable-next-line
    }, []);

    const showAlert = (message, type) => {
        setAlert({
            message: message,
            type: type
        });

        setTimeout(() => {
            setAlert(null);
        }, 3500);
    }

    return (
        <>
            <Alert alert={alert} size={"full"} />
            <div className={`face-container mode-${mode}`}>
                <h2 className='face-verify-h2'>Verify your face</h2>
                <video className="video-container" ref={videoRef} width="640" height="480" autoPlay style={{ transform: "scaleX(-1)" }}></video>
                <div className="face-verify-buttons">
                    <button type="button" className="btn btn-outline-success" onClick={handleBackClick}>Go Back</button>
                    <button disabled={clicked} type="button" className="btn btn-outline-success mx-4" onClick={handleClick}>
                        {
                            clicked ?
                                <>
                                    <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
                                    <span role="status">Verifying...</span>
                                </>
                                : "Verify"
                        }
                    </button>
                </div>
            </div>
        </>
    )
}

export default FaceVerify
