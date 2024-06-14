import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios';
import ElectionCard from './ElectionCard';
import { useNavigate } from 'react-router-dom'
import colorContext from '../../context/bgColor/colorContext';
import '../../css/election.css';
import Alert from '../Alert';

const Election = (props) => {

    const host = process.env.REACT_APP_API;
    const electionInitial = []
    const [election, setElection] = useState(electionInitial);
    const refresh = localStorage.getItem("refresh");
    let access = localStorage.getItem("access");
    let history = useNavigate();
    const context = useContext(colorContext);
    const { mode } = context;

    const [addElection, setAddElection] = useState({ electionId: "", password: "" });

    const { voterId } = props;
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

    const fetchElection = () => {
        if (localStorage.getItem('access')) {

            axios.get(`${host}/get-election`, { headers: headers })
                .then(res => {
                    setElection(res.data);
                })
                .catch(err => {

                    refreshToken()
                        .then(res => {
                            axios.get(`${host}/get-election`, { headers: headers })
                                .then(res => {
                                    setElection(res.data);
                                })
                                .catch(err => { console.log(err); })
                        })
                        .catch(err => { console.log(err); })


                })
        }
        else {
            history("/");
        }
    }

    useEffect(() => {
        fetchElection();
        //eslint-disable-next-line
    }, []);

    const onChange = (e) => {
        setAddElection({ ...addElection, [e.target.name]: e.target.value });
    }

    const handleElectionAdd = (e) => {
        e.preventDefault();
        axios.post(`${host}/addvoter`, addElection, { headers: headers })
            .then(res => {
                showAlert("Election Added", "success");
                fetchElection();
            })
            .catch(err => {
                if (err.response.data.message === "Incorrect Password") {
                    showAlert("Incorrect Password", "danger");
                }
                else if (err.response.data.message === "Election does not exist") {
                    showAlert("Incorrect Election Id", "danger");
                }
                else {
                    refreshToken()
                        .then(res => {
                            axios.post(`${host}/addvoter`, addElection, { headers: headers })
                                .then(res => {
                                    fetchElection();
                                })
                                .catch(err => {
                                    if (err.response.data.message === "Incorrect Password") {
                                        showAlert("Incorrect Password", "danger");
                                    }
                                    else if (err.response.data.message === "Election does not exist") {
                                        showAlert("Incorrect Election Id", "danger");
                                    }
                                })
                        })
                        .catch(err => { console.log(err); })
                }
            })

    }

    const [ alert, setAlert ] = useState(null);

    const showAlert = (message, type) => {
        setAlert({
            message: message,
            type: type
        });

        setTimeout(() => {
            setAlert(null);
        }, 2000);
    }

    let currentDate = new Date();

    return (
        <div>
            <Alert alert={alert} size={"full"} />
            <div className={`add mode-${mode}`}>
                <form>
                    <h3>Add Election</h3>
                    <div className="mb-3">
                        <label htmlFor="exampleInputEmail1" className="form-label">Election Id :</label>
                        <input type="text" className="form-control" name='electionId' onChange={onChange} id="exampleInputEmail1" aria-describedby="emailHelp" />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="exampleInputPassword1" className="form-label">Password :</label>
                        <input type="password" className="form-control" name='password' onChange={onChange} id="exampleInputPassword1" />
                    </div>
                    <button type="submit" className="btn btn-outline-success" onClick={handleElectionAdd} style={{ marginTop: "4%" }}>Add</button>
                    <button type="reset" className="btn btn-outline-danger" style={{ marginLeft: "42%", marginTop: "4%" }}>Clear</button>
                </form>
            </div>
            <div className={`bottomLine mode-${mode}`}></div>
            <div className="container">
                <h3 className={`elections-status-label mode-${mode}`}>On Going Elections</h3>
                {
                    election.length === 0 || !election.some(electionItem => new Date(electionItem.EndDate) >= currentDate) ?

                        <p className={`elections-status-label mode-${mode}`}>There are no ongoing Elections</p>

                        :
                        <div className="row">
                            {election.map((electionItem, id) => {
                                return (
                                    new Date(electionItem.EndDate) >= currentDate ?
                                        <div className="col-md-3" style={{ marginTop: "2%" }} key={id}><ElectionCard key={id} showAlert={showAlert} handleElection={props.handleElection} handleGetCandidate={props.handleCandidate} electionItem={electionItem} electionId={electionItem.electionId} title={electionItem.Title} start={electionItem.StartDate} end={electionItem.EndDate} image={electionItem.image} voterId={voterId} admin={electionItem.admin} /></div>
                                        :
                                        null
                                )


                            })}
                        </div>

                }
            </div>
            <div className={`bottomLine mode-${mode}`}></div>
            <div className="container">
                <h3 className={`elections-status-label mode-${mode}`}>Completed Elections</h3>
                {
                    election.length === 0 || !election.some(electionItem => new Date(electionItem.EndDate) <= currentDate) ?

                        <p className={`elections-status-label mode-${mode}`}>There are no completed Elections</p>
                        :
                        <div className="row">
                            {election.map((electionItem, id) => {
                                return (
                                    new Date(electionItem.EndDate) <= currentDate ?
                                        <div className="col-md-3" style={{ marginTop: "2%" }} key={id}><ElectionCard key={id} handleElection={props.handleElection} handleGetCandidate={props.handleCandidate} electionItem={electionItem} electionId={electionItem.electionId} title={electionItem.Title} start={electionItem.StartDate} end={electionItem.EndDate} image={electionItem.image} voterId={voterId} admin={electionItem.admin} /></div>
                                        :
                                        null
                                )


                            })}
                        </div>

                }
            </div>
        </div>
    )
}

export default Election
