import axios from 'axios';
import React, { useState, useEffect, useContext } from 'react'
import colorContext from '../../context/bgColor/colorContext';
import '../../css/votePage.css'
import { useNavigate } from 'react-router-dom';

const VotePage = (props) => {

    const host = process.env.REACT_APP_API;
    const [candidates, setCandidates] = useState([]);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const context = useContext(colorContext);
    const { mode } = context;

    let history = useNavigate();

    const refresh = localStorage.getItem("refresh");

    const headers = {
        'Content-Type': 'application/json',
        "Authorization": localStorage.getItem("access")
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

        axios.post(`${host}/get-candidates`, { title: props.title, admin: props.admin, electionId: props.electionId }, { headers })
            .then(res => {
                setCandidates(res.data);
            })
            .catch(err => {
                refreshToken()
                    .then(res => {
                        axios.post(`${host}/get-candidates`, { title: props.title, admin: props.admin }, { headers })
                            .then(res => {
                                setCandidates(res.data);
                            })
                            .catch(err => { console.log(err); })
                    })
            })
        // eslint-disable-next-line
    }, [])

    const handleVote = (e) => {
        e.preventDefault();
        if (selectedCandidate) {
            console.log(selectedCandidate);
            console.log(props.electionId);
            axios.post(`${host}/vote`, { candidateId: selectedCandidate.candidateId, electionId: props.electionId }, { headers: headers })
                .then(res => {
                    if (res.data.message === "Vote recorded successfully") {
                        // props.showAlert("Vote Registered Successfully", "success");
                        history("/election");
                    }
                    else {
                        // props.showAlert("You have already voted", "danger");
                        history("/election");
                    }
                })
                .catch(err => {
                    refreshToken()
                        .then(res => {
                            if (res.data.message === "Vote recorded successfully") {
                                // props.showAlert("Vote Registered Successfully", "success");
                                history("/election");
                            }
                            else {
                                // props.showAlert("You have already voted", "danger");
                                history("/election");
                            }
                        })
                        .catch(err => { console.log(err) })
                })
        }
    }

    const handleClear = (e) => {
        e.preventDefault();
        setSelectedCandidate(null);
    }

    return (

        <div className={`vote mode-${mode}`}>
            <h3 className='voteHeading'>{props.title}</h3>
            <div className='inside-box'>
                {candidates.map(candidate => (
                    <div className='candidate-details' key={candidate.Name}>
                        <div className="row align-items-center">
                            <div className="col col-sm-auto">
                                <div className="radio-buttons">
                                    <input
                                        type="radio"
                                        name="candidate"
                                        id="votepage-radio"
                                        checked={selectedCandidate === candidate}
                                        onChange={() => setSelectedCandidate(candidate)}
                                    />
                                </div>
                            </div>
                            <div className="col col-sm-auto"><img src={`data:image/jpeg;base64,${candidate.Sign}`} className="partySign" alt="Party Sign" /></div>
                            <div className="col col-lg-auto"><h4 className='cname'>{candidate.Name}</h4></div>
                            <div className="col col-md-auto"><h4 className='party'>{candidate.Party}</h4></div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="voteButtons">
                <button disabled={!selectedCandidate} className='btn btn-danger votebtn' onClick={handleClear}>Clear</button>
                <button disabled={!selectedCandidate} className='btn btn-success votebtn' onClick={handleVote}>Vote</button>
            </div>
        </div>

    )
}

export default VotePage
