import React, { useContext, useEffect, useState } from 'react'
import "../../css/admindashboard.css";
import colorContext from '../../context/bgColor/colorContext';
import { Link } from "react-router-dom";
import axios from 'axios';
import Results from './Results';

const AdminDashboard = (props) => {

    const context = useContext(colorContext);
    const { mode } = context;

    const [candidates, setCandidates] = useState(0);
    const [vote, setVote] = useState([]);
    const [eectionCount, setElectionCount] = useState(0);

    const host = process.env.REACT_APP_API;
    const refresh = localStorage.getItem("refresh");
    let access = localStorage.getItem("access");

    const headers = {
        'Content-Type': 'application/json',
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

    useEffect(() => {
        if (localStorage.getItem("access")) {
            axios.get(`${host}/getcount`, { headers: headers })
                .then(res => {
                    setCandidates(res.data.message);
                })
                .catch(err => {
                    refreshToken()
                        .then(res => {
                            axios.get(`${host}/getcount`, { headers: headers })
                                .then(res => {
                                    setCandidates(res.data.message);
                                })
                                .catch(err => { console.log(err); })
                        })
                        .catch(err => { console.log(err); })
                })

            axios.get(`${host}/getallvotes`, { headers: headers })
                .then(res => {
                    setVote(res.data.message);
                })
                .catch(err => {

                    refreshToken()
                        .then(res => {
                            axios.get(`${host}/getallvotes`, { headers: headers })
                                .then(res => {
                                    setVote(res.data.message);
                                })
                                .catch(err => { console.log(err); })
                        })
                        .catch(err => { console.log(err); })
                })

            axios.get(`${host}/getElectionCount`, { headers: headers })
                .then(res => {
                    setElectionCount(res.data.message);
                })
                .catch(err => {
                    refreshToken()
                        .then(res => {
                            axios.get(`${host}/getcount`, { headers: headers })
                                .then(res => {
                                    setElectionCount(res.data.message);
                                })
                                .catch(err => { console.log(err); })
                        })
                        .catch(err => { console.log(err); })
                })
        }
        //eslint-disable-next-line
    }, []);

    return (
        <div className={`dashboard mode-${mode}`}>
            <h4 className={`dashboard-header mode-${mode}`}>Dashboard</h4>
            <div className="dashboard-cards">
                <div className="small-box elections">
                    <div className="info">
                        <h2>{eectionCount}</h2>
                        <p>No. of Elections</p>
                    </div>
                    <div className="icon">
                        <i className="fa-solid fa-list"></i>
                    </div>
                    <Link className="box-footer elections" to="#" onClick={props.handleAddElection}>Add Election <i className="fa-solid fa-plus"></i></Link>
                </div>
                <div className="small-box candidates">
                    <div className="info">
                        <h2>{candidates}</h2>
                        <p>No. of Candidates</p>
                    </div>
                    <div className="icon">
                        <i className="fa-solid fa-users"></i>
                    </div>
                    <Link className="box-footer candidates" to="#" onClick={props.handleAddCandidates}>Add Candidates <i className="fa-solid fa-plus"></i></Link>
                </div>
                <div className="small-box voters">
                    <div className="info">
                        <h2>{vote.length}</h2>
                        <p>No. of Votes</p>
                    </div>
                    <div className="icon">
                        <i className="fa-solid fa-square-poll-vertical"></i>
                    </div>
                    <Link className="box-footer voters" to="#" onClick={props.handleVotes}>More info <i className="fa-solid fa-circle-info"></i></Link>
                </div>

            </div>

            <h4 className={`dashboard-header mode-${mode}`}>Votes</h4>
            <div className="results-container">
                <Results />
            </div>

        </div>
    )
}

export default AdminDashboard
