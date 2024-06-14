import React, { useState, useContext, useRef, useEffect } from 'react'
import '../../css/otp.css'
import colorContext from '../../context/bgColor/colorContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'

const VoterSignupOtp = () => {

    let history = useNavigate();
    const host = process.env.REACT_APP_API;
    const context = useContext(colorContext);
    const { mode } = context;
    const initialInputState = ['', '', '', '', '', ''];
    const [seconds, setSeconds] = useState(120);
    // eslint-disable-next-line
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

    const combineContents = () => {
        const combinedContent = inputs.join('');
        console.log(document.cookie)
        axios.post(`${host}/createvoter`, { otp: combinedContent }, {
            headers: {
                "Content-Type": "application/json"
                // "Cookie": document.cookie 
            },
            withCredentials: true,
        })
            .then(res => {
                if (res.data.message === "Account Created") {
                    
                    history("/");
                }
            })
            .catch(err => { console.log(err) });
    }

    return (
        <>
            <div className={`otp-input-container mode-${mode}`}>
                <div className="otpitems">
                    <h2>Enter 6 digit OTP</h2>
                    {[1, 2, 3, 4, 5, 6].map((index) => (
                        <input
                            key={index}
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
                    {seconds === 0 ? (
                        <div className='timer-resend'>
                            <label >Time's up! Resend OTP : &nbsp;</label>
                            
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

export default VoterSignupOtp
