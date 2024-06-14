import React, { useState, useContext, useRef, useEffect } from 'react'
import '../../css/otp.css'
import colorContext from '../../context/bgColor/colorContext';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom'
import Alert from '../Alert';

const Otp = (props) => {

    let history = useNavigate();
    const host = process.env.REACT_APP_API;
    const context = useContext(colorContext);
    const { mode } = context;
    const initialInputState = ['', '', '', '', '', ''];
    const [seconds, setSeconds] = useState(120);
    const [isTimerActive, setIsTimerActive] = useState(true);

    const [inputs, setInputs] = useState(initialInputState);
    const inputRefs = [
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null),
    ];
    useEffect(() => {
        let interval = null;
        if (isTimerActive) {
            interval = setInterval(() => {
                setSeconds((prevSeconds) => prevSeconds - 1);
            }, 1000);
        }
        if (seconds === 0) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [seconds, isTimerActive]);

    const handleRouteChange = () => {

        const currentPath = window.location.pathname;
        if (currentPath === '/') {
            localStorage.removeItem('access');
            localStorage.removeItem('refresh');
        }
    };

    useEffect(() => {

        if (props.valid === "valid") {
            showAlert("Previous Otp is still valid", "success");
        }
        else {
            showAlert("Otp sent to your E-Mail.", "success");

        }
        window.addEventListener('popstate', handleRouteChange);

        return () => {
            window.removeEventListener('popstate', handleRouteChange);
        };
        // eslint-disable-next-line
    }, []);

    const handleResendClick = async () => {

        await axios.post(`${host}/sendvoterotp`, { voterId: props.voterId })
            .then(res => {
                if (res.data === "OTP sent") {
                    showAlert("OTP sent successfully", "success");
                    setSeconds(120);
                    setIsTimerActive(true);
                }
                else {
                    showAlert("Error sending OTP check Credentials", "danger");
                }
            })
    };

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const handleInputChange = (inputIndex, value) => {
        const newInputs = [...inputs];
        newInputs[inputIndex] = value;
        setInputs(newInputs);

        if (value !== '' && inputIndex < 5) {
            inputRefs[inputIndex + 1].current.focus();
        }

        if (value === '' && inputIndex > 0) {
            inputRefs[inputIndex - 1].current.focus();
        }
    };

    const [alert, setAlert] = useState(null);

    const showAlert = (message, type) => {
        setAlert({
            message: message,
            type: type
        });

        setTimeout(() => {
            setAlert(null);
        }, 2000);
    }

    const combineContents = () => {
        const combinedContent = inputs.join('');
        axios.post(`${host}/verifyvoterotp`, { otp: combinedContent, voterId: props.voterId })
            .then(res => {
                if (res) {
                    localStorage.setItem("access", res.data.access);
                    localStorage.setItem("refresh", res.data.refresh);
                    history("/election");
                }
            })
            .catch(err => { console.log("Error") });
    }

    return (
        <>
            <Alert alert={alert} size={"full"} />
            <div className={`otp-input-container mode-${mode}`}>
                <div className="otpitems">
                    <h2 id='otpheader'>Enter 6 digit OTP</h2>
                    <div className="otpinputs">
                        {[1, 2, 3, 4, 5, 6].map((index) => (
                            <input
                                key={index}
                                // type="number"
                                type="tel"
                                maxLength={1}
                                pattern='[0-9]'
                                className="otp-input"
                                value={inputs[index - 1]}
                                onChange={(e) => handleInputChange(index - 1, e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Backspace' && inputs[index - 1] === '' && index > 1) {
                                        inputRefs[index - 2].current.focus();
                                    }
                                }}
                                ref={inputRefs[index - 1]}
                            />
                        ))}
                    </div>
                    {seconds === 0 ? (
                        <div className='timer-resend'>
                            <label >Time's up! Resend OTP : &nbsp;</label>
                            <Link style={{ textDecoration: "none" }} onClick={handleResendClick}>Resend OTP</Link>
                        </div>
                    ) : (
                        <div className='timer'>
                            <h6>Timer: {formatTime(seconds)}</h6>
                        </div>
                    )}

                    <button id="verifyButton" onClick={combineContents}>Verify</button>

                </div>
            </div >
        </>
    )
}

export default Otp
