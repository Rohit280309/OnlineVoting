import React, { useContext, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import "../../css/electioncard.css"
import colorContext from '../../context/bgColor/colorContext';
import axios from 'axios';
import logo from "../../assets/logo.png";
import { Toast } from 'bootstrap';

const ElectionCard = (props) => {
    const { title, start, end, admin, image, electionId } = props;

    let startDateTime = new Date(start);
    let endDateTimeStamp = new Date(end);
    const options = { timeZone: 'Asia/Kolkata' };

    const startTime = startDateTime.toLocaleString('en-US', options);
    const endTime = endDateTimeStamp.toLocaleString('en-US', options);

    let startArr = startTime.split(",");
    let endArr = endTime.split(",");

    const context = useContext(colorContext);
    const { mode } = context;

    const currentDateTime = new Date();
    const endDateTime = new Date(end);

    const showButton = endDateTime > currentDateTime;

    const host = process.env.REACT_APP_API;
    const refresh = localStorage.getItem("refresh");
    let access = localStorage.getItem("access");

    const headers = {
        'Content-Type': 'multipart/form-data',
        "Authorization": access
    };

    const toastRef = useRef(null);
    const showToast = (message) => {
        const toastElement = toastRef.current;
        if (toastElement) {
            toastElement.querySelector('.toast-body').textContent = message;
            const toast = new Toast(toastElement);
            toastElement.querySelector('.toast-header').style.backgroundColor = "rgb(209,231,221)";
            toastElement.querySelector('.toast-header').style.color = "rgb(10,54,34)";
            toastElement.style.backgroundColor = "rgb(209,231,221)";
            toastElement.style.color = "rgb(10,54,34)";
            toast.show();
        }
    }

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

    let history = useNavigate();

    const handleCastClick = () => {
        props.handleGetCandidate(title, admin, electionId);
        axios.post(`${host}/checkvoted`, { electionId: electionId }, { headers: headers })
            .then(res => {
                if (res.data.message === "Not Voted") {
                    history("/faceverify");
                }
                else if (res.data.message === "Voted") {
                    showToast("You Have Already Voted in this Election");
                }
            })
            .catch(err => {
                refreshToken()
                    .then(res => {
                        axios.post(`${host}/checkvoted`, { electionId: electionId }, { headers: headers })
                            .then(res => {
                                if (res.data.message === "Not Voted") {
                                    history("/faceverify");
                                }
                                else if (res.data.message === "Voted") {
                                    showToast("You Have Already Voted in this Election");
                                }
                            })
                            .catch(err => console.log(err));
                    })
                    .catch(err => console.log(err));
            });
    }

    const handleResultClick = () => {
        props.handleElection(props.electionItem);
        history("/results");
    }

    return (
        <>
            <div className={`card mode-${mode}`} style={{ "width": "18rem", "height": "26rem", "margin": "20px" }}>
                <img src={`data:image/jpeg;base64,${image}`} className="card-img-top card-image" alt="..." />
                <div className="card-body">
                    <h5 className="card-title">{title}</h5>
                    <p className="card-text">Start Date : {startArr[0]}</p>
                    <p className="card-text">Start Time : {startArr[1].slice(0, 11)}</p>
                    <p className="card-text">End Date : {endArr[0]}</p>
                    <p className="card-text">End Time : {endArr[1].slice(0, 11)}</p>
                    {showButton ? <button className="btn btn-primary" type='submit' onClick={handleCastClick}>Cast Vote</button> : <button className="btn btn-primary" type='submit' onClick={handleResultClick}>See Results</button>}
                </div>
            </div>
            <div>
                <button type="button" className="btn btn-primary d-none" id="liveToastBtn">
                    Show live toast
                </button>

                <div className="toast-container position-fixed bottom-0 end-0 p-3">
                    <div ref={toastRef} id="liveToast" className="toast" role="alert" aria-live="assertive" aria-atomic="true">
                        <div className="toast-header">
                            <img src={`${logo}`} className="rounded me-2" alt="..." />
                            <strong className="me-auto">Online Voter</strong>
                            {/* <small>2's ago</small> */}
                            <button type="button" className="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                        </div>
                        <div className="toast-body">
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ElectionCard
