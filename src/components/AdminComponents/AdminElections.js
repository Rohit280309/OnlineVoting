import React, { useEffect, useContext, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom';
import colorContext from '../../context/bgColor/colorContext';
import axios from 'axios';
import Alert from '../Alert';
import "../../css/adminelection.css";
import AddElection from './AddElection';
import AddCandidates from './AddCandidates';
import AdminDashboard from './AdminDashboard';
import DisplayCandidates from './DisplayCandidates';
import OngoingElections from './OngoingElections';
import EditElection from './EditElection';
import CompletedElections from './CompletedElections';
import DisplaySingleResults from './DisplaySingleResults';
import Votes from './Votes';

const AdminElections = (props) => {

    const [election, setElection] = useState([]);
    const [electionItem, setElectionItem] = useState([]);
    const host = process.env.REACT_APP_API;
    const refresh = localStorage.getItem("refresh");
    let access = localStorage.getItem("access");

    const [display, setDisplay] = useState('dashboard');

    const [user, setUser] = useState({
        name: "",
        role: "",
        image: ""
    })

    let history = useNavigate();

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

    const handleLogout = () => {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        history("/");
    };

    useEffect(() => {
        if (localStorage.getItem('access')) {

            axios.get(`${host}/get-adminelection`, { headers: headers })
                .then(res => {
                    setElection(res.data);
                })
                .catch(err => {

                    refreshToken()
                        .then(res => {
                            axios.get(`${host}/get-adminelection`, { headers: headers })
                                .then(res => {
                                    setElection(res.data);
                                })
                                .catch(err => { console.log(err); })
                        })
                        .catch(err => { console.log(err); })
                })

            axios.get(`${host}/getuser`, { headers: headers })
                .then(res => {
                    console.log(res.data);
                    setUser(res.data);
                })
                .catch(err => {

                    refreshToken()
                        .then(res => {
                            axios.get(`${host}/getuser`, { headers: headers })
                                .then(res => {
                                    console.log(res.data);
                                    setUser(res.data);
                                })
                                .catch(err => { console.log(err); })
                        })
                        .catch(err => { console.log(err); })
                })
        }
        else {
            handleLogout();
        }
        //eslint-disable-next-line
    }, []);

    const handleDashboard = (e) => {
        e.preventDefault();
        setDisplay('dashboard')
    }

    const handleAddElection = (e) => {
        e.preventDefault();
        setDisplay('addelection')
    }

    const handleAddCandidates = (e) => {
        e.preventDefault();
        setDisplay('addcandidates')
    }

    const handleModifyCandidates = (e) => {
        e.preventDefault();
        setDisplay('modifycandidate');
    }

    const handleVotes = (e) => {
        e.preventDefault();
        setDisplay('votes');
    }

    const handleOnGoingElection = () => {
        setDisplay('ongoingelections');
    }

    const handleCompletedElections = () => {
        setDisplay('completedelections');
    }

    const handleEditElection = () => {

        setDisplay('editelection');
    }

    const handleResults = () => {
        setDisplay('results');
    }

    const handleElection = (election) => {
        setElectionItem(election);
        let currentDate = new Date();
        if (currentDate >= new Date(election.EndDate)) {
            handleResults();
        }
        else {

            handleEditElection();
        }
    }

    const deleteElection = (id) => {
        axios.delete(`${host}/deleteelection/${id}`, { headers: headers })
            .then(res => {
                if (res.data.message) {
                    showAlert("Election Deleted Successfully", "success");
                    setDisplay('completedelections');
                }
            })
            .catch(err => {
                refreshToken()
                    .then(res => {
                        axios.delete(`${host}/deleteelection/${id}`, { headers: headers })
                            .then(res => {
                                if (res.data.message) {
                                    showAlert("Election Deleted Successfully", "success");
                                    setDisplay('completedelections');
                                }
                            })
                            .catch(err => {
                                showAlert("Error Deleting the Election Try Again", "danger");
                            })
                    })
                    .catch(err => {
                        showAlert("Error Deleting the Election Try Again", "danger");
                    })
            })
    }

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

    const AdminSidebar = ({ handleDashboard, handleOnGoingElection, handleCompletedElections, handleModifyCandidates, handleLogout }) => {
        const context = useContext(colorContext);
        const { mode } = context;

        return (
            <div className={`side mode-${mode}`}>
                <ul>
                    <li>
                        <div className="user-panel">
                            <div className="userProfile">
                                <img src={`data:image/jpeg;base64,${user.image}`} alt="..." />
                            </div>
                            <div className="info">
                                <label htmlFor="name">{user.name}</label>
                                <label htmlFor="role">{user.role}</label>
                            </div>
                        </div>
                    </li>
                    <li className='sideheader'>
                        <b>REPORTS</b>
                    </li>
                    <li>
                        <Link to="#" onClick={handleDashboard}><i className="fa-solid fa-gauge"></i> Dashboard</Link>
                    </li>
                    <li className='sideheader'>
                        <b>MANAGE</b>
                    </li>
                    <li>
                        <Link to="#" onClick={handleOnGoingElection}> <i className="fa-solid fa-circle-info"></i> On Going Elections</Link>
                    </li>
                    <li>
                        <Link to="#" onClick={handleCompletedElections}> <i className="fa-solid fa-circle-info"></i> Completed Elections</Link>
                    </li>
                    <li>
                        <Link to="#" onClick={handleModifyCandidates}> <i className="fa-solid fa-circle-info"></i> Candidates</Link>
                    </li>
                    <li id='logout'>
                        <Link to="/" onClick={handleLogout}>Log Out <i className="fa-solid fa-right-from-bracket"></i></Link>
                    </li>

                </ul>
            </div>
        );
    };

    return (
        <>
            <div className='elections'>

                <AdminSidebar
                    handleDashboard={handleDashboard}
                    handleOnGoingElection={handleOnGoingElection}
                    handleCompletedElections={handleCompletedElections}
                    handleModifyCandidates={handleModifyCandidates}
                    handleLogout={handleLogout}
                />
                <Alert alert={alert} size={"half"} />

                {
                    display === "dashboard" ?

                        <AdminDashboard handleAddCandidates={handleAddCandidates} handleVotes={handleVotes} handleAddElection={handleAddElection} elections={election.length} />
                        :

                        display === "addelection" ?

                            <AddElection showAlert={showAlert} handleDashboard={handleDashboard} /> :

                            display === "addcandidates" ?

                                <AddCandidates handleDashboard={handleDashboard} /> :

                                display === "votes" ?

                                    <Votes /> :

                                    display === "modifycandidate" ?

                                        <DisplayCandidates showAlert={showAlert} /> :

                                        display === "ongoingelections" ?

                                            <OngoingElections handleElection={handleElection} /> :

                                            display === "editelection" ?

                                                <EditElection handleOnGoingElection={handleOnGoingElection} election={electionItem} /> :

                                                display === "completedelections" ?

                                                    <CompletedElections showAlert={showAlert} handleElection={handleElection} deleteElection={deleteElection} /> :

                                                    display === "results" ?

                                                        <DisplaySingleResults election={electionItem} /> :

                                                        null

                }
            </div>
        </>
    )
}

export default AdminElections
