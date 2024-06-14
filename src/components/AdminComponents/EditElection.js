import React, { useContext, useEffect, useRef, useState } from 'react'
import '../../css/editelection.css'
import colorContext from '../../context/bgColor/colorContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'

const EditElection = (props) => {
    const election = props;
    const host = process.env.REACT_APP_API;
    const refresh = localStorage.getItem("refresh");
    let access = localStorage.getItem("access");
    const headers = {
        'Content-Type': 'application/json',
        "Authorization": access
    };
    let history = useNavigate();

    const refCandidateModal = useRef(null);
    const refVoterModal = useRef(null);

    const [formData, setFormData] = useState({
        title: '',
        startDate: '',
        endDate: '',
        admin: '',
        electionId: election.election.electionId,
        voters: [],
        candidates: [],
        image: ''
    });

    const [allCandidates, setAllCandidates] = useState({ candidates: [] });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });

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

    const fetchData = () => {
        if (localStorage.getItem('access')) {
            axios.get(`${host}/createelection`, { headers: headers })
                .then(res => {
                    setAllCandidates({ candidates: res.data });
                    console.log(election);
                    console.log(res.data);
                    console.log(allCandidates);
                })
                .catch(err => {

                    refreshToken()
                        .then(res => {
                            axios.get(`${host}/createelection`, { headers: headers })
                                .then(res => {
                                    setAllCandidates({ candidates: res.data });
                                    console.log(allCandidates);
                                    console.log(res.data);
                                })
                                .catch(err => { console.log(err); })
                        })
                        .catch(err => { console.log(err); })


                })
        }
        else {
            history("/");
        }
    };

    useEffect(() => {
        fetchData();
        //eslint-disable-next-line
    }, []);

    useEffect(() => {
        if (props.election) {

            const startDateUTC = new Date(election.election.StartDate);
            const endDateUTC = new Date(election.election.EndDate);

            const formatDate = (date) => {
                const year = date.getFullYear();
                const month = `0${date.getMonth() + 1}`.slice(-2);
                const day = `0${date.getDate()}`.slice(-2);
                const hours = `0${date.getHours()}`.slice(-2);
                const minutes = `0${date.getMinutes()}`.slice(-2);
                return `${year}-${month}-${day}T${hours}:${minutes}`;
            };

            setFormData({
                title: election.election.Title,
                startDate: formatDate(startDateUTC),
                endDate: formatDate(endDateUTC),
                admin: election.election.admin,
                voters: election.election.voters,
                candidates: election.election.candidates,
                image: election.election.image
            });

            // const base64String = "data:image/png;base64,iVBORw0KG...";
            // const img = new Image();

            // img.src = base64String;
            // img.onload = function () {
            //     const imageContainer = document.getElementById("imageContainer");
            //     imageContainer.appendChild(img);
            // };

            console.log(formData.candidates);
        }


        // eslint-disable-next-line
    }, []);

    const DisplaySelectedCandidates = ({ candidates }) => {
        return (
            <textarea
                value={candidates.map(candidate => `${candidate.name} - ${candidate.party}`).join("\n")}
                rows={candidates.length > 0 ? candidates.length : 1}
                readOnly
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'selected')}

            />

        )
    }
    const SelectedCandidates = ({ candidates }) => {
        return (
            <div className={`modalbox selectedcandidates`}>
                {candidates.map((candidate) => (
                    <div
                        key={candidate.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, candidate)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, 'selected')}
                        onDoubleClick={() => handleRemoveFromSelected(candidate)}
                    >
                        {`${candidate.id}-${candidate.name} - ${candidate.party}`}
                    </div>
                ))}
            </div>
        );
    };

    const AllCandidates = ({ candidates }) => {

        if (!candidates) {
            return <div className={`modalbox mode-${mode}`}>Loading...</div>;
        }
        return (
            <div className={`modalbox allcandidates`}>
                {candidates.map((candidate) => (
                    <div
                        key={candidate.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, candidate)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, 'all')}
                    >
                        {`${candidate.id}-${candidate.name} - ${candidate.party}`}
                    </div>
                ))}
            </div>
        );
    };


    const EligibleVoters = ({ voters }) => {
        return (
            <textarea
                value={voters.map(voter => `${voter.id} - ${voter.voterId}`).join("\n")}
                rows={voters.length > 0 ? voters.length : 1}
                readOnly
            />
        );
    }

    const handleAddCandidate = (candidateString) => {
        const candidate = allCandidates.candidates.find(
            c => `${c.name} - ${c.party}` === candidateString
        );
        if (candidate) {
            const updatedCandidates = [...formData.candidates, candidate];
            setFormData({ ...formData, candidates: updatedCandidates });
            console.log(formData.candidates);
        }
    };

    const handleRemoveCandidate = (candidateString) => {
        const candidate = formData.candidates.find(
            c => `${c.name} - ${c.party}` === candidateString
        );
        if (candidate) {
            const updatedCandidates = formData.candidates.filter(c => c !== candidate);
            setFormData({ ...formData, candidates: updatedCandidates });
            console.log(formData.candidates);
        }
    };

    const handleDragStart = (e, candidate) => {
        e.dataTransfer.setData('text/plain', JSON.stringify(candidate));
    };

    const handleDragOver = (e) => {
        e.preventDefault();

    };

    const handleDrop = (e, type) => {
        e.preventDefault();
        const data = e.dataTransfer.getData('text/plain');
        const droppedCandidate = JSON.parse(data);

        if (type === 'selected') {
            const isDuplicate = formData.candidates.some(candidate => candidate.id === droppedCandidate.id);
            if (!isDuplicate) {
                const updatedCandidates = [...formData.candidates, droppedCandidate];
                setFormData({ ...formData, candidates: updatedCandidates });
            }
        }
        else if (type === 'all') {
            const isDuplicate = formData.candidates.some(candidate => candidate.id === droppedCandidate.id);
            if (!isDuplicate) {
                const updatedSelectedCandidates = [...formData.candidates, droppedCandidate];
                setFormData({ ...formData, candidates: updatedSelectedCandidates });
            }
        }
    };

    const handleRemoveFromSelected = (candidate) => {
        if (formData.candidates.length <= 2) {
            alert("There should be minimun 2 candidates")
        }
        else {
            const updatedCandidates = formData.candidates.filter((c) => c.id !== candidate.id);
            setFormData({ ...formData, candidates: updatedCandidates });
        }

    };

    const editCandidates = () => {
        refCandidateModal.current.click();
    }

    const handleEditCandidates = () => {
        editCandidates();
    };

    const editVoters = () => {
        refVoterModal.current.click();
    }

    const handleEditVoters = () => {
        editVoters();
    }

    const handleRemoveVoter = (voter) => {

        const updatedVoters = formData.voters.filter((v) => v.id !== voter.id);
        setFormData({ ...formData, voters: updatedVoters });

    }

    const RemoveVoters = ({ voters }) => {
        if (!voters) {
            return <div className={`modalbox mode-${mode}`}>Loading...</div>;
        }
        return (
            <div className={`modalbox allcandidates`}>
                {voters.map((voter) => (
                    <div
                        key={voter.id}
                        onDoubleClick={() => handleRemoveVoter(voter)}

                    >
                        {`${voter.id} - ${voter.voterId}`}
                    </div>
                ))}
            </div>
        );
    }

    const data = {
        title: formData.title,
        startDate: formData.startDate,
        endDate: formData.endDate,
        candidates: formData.candidates.map(candidate => `${candidate.id}`),
        voters: (formData.voters && formData.voters.length > 0) ? formData.voters.map(voter => `${voter.id}`) : [],
    }


    const handleSubmit = (e) => {
        e.preventDefault();
        axios.put(`${host}/elections/${election.election.id}`, data, { headers: headers })
            .then(res => {
                if (res) {

                    history("/adminelection");
                    props.handleOnGoingElection();
                }
            })
            .catch(err => {
                refreshToken()
                    .then(res => {
                        axios.put(`${host}/elections/${election.election.id}`, data, { headers: headers })
                            .then(res => {
                                if (res) {
                                    console.log("Election Updated");
                                    props.handleOnGoingElection();
                                }
                            })
                            .catch(err => console.log(err))
                    })

            })
    }

    const context = useContext(colorContext);
    const { mode } = context;

    return (
        <>
            {/* Candidates Update Modal */}
            <button ref={refCandidateModal} type="button" className="btn btn-primary d-none" data-bs-toggle="modal" data-bs-target="#candidateModal">
                Launch demo modal
            </button>

            <div className="modal fade" style={{ color: mode === 'light' ? 'black' : 'white' }} id="candidateModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog" style={{ backgroundColor: mode === 'light' ? 'white' : 'black' }}>
                    <div className="modal-content" style={{ backgroundColor: mode === 'light' ? 'white' : 'grey' }}>
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="exampleModalLabel">Drag and drop to Add and Double Click to remove</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body" style={{ display: "flex", flexDirection: "column" }}>
                            <label htmlFor="candidates" className="form-label">All Candidates:</label>
                            <AllCandidates
                                candidates={allCandidates.candidates}
                                handleAddCandidate={handleAddCandidate}
                                handleDragStart={handleDragStart}
                                handleDragOver={handleDragOver}
                                handleDrop={handleDrop}
                                type="all"
                            />
                            <div className="line"></div>
                            <label htmlFor="candidates" className="form-label">Selected Candidates:</label>
                            <SelectedCandidates
                                candidates={formData.candidates}
                                handleRemoveCandidate={handleRemoveCandidate}
                                handleDragStart={handleDragStart}
                                handleDragOver={handleDragOver}
                                handleDrop={handleDrop}
                                type="selected"
                            />
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" className="btn btn-primary" data-bs-dismiss="modal">Save Changes</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Voters Update Modal */}

            <button ref={refVoterModal} type="button" className="btn btn-primary d-none" data-bs-toggle="modal" data-bs-target="#voterModal">
                Launch demo modal
            </button>

            <div className="modal fade" style={{ color: mode === 'light' ? 'black' : 'white' }} id="voterModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog" style={{ backgroundColor: mode === 'light' ? 'white' : 'black' }}>
                    <div className="modal-content" style={{ backgroundColor: mode === 'light' ? 'white' : 'grey' }}>
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="exampleModalLabel">Double Click the Voter ID to remove Voter</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body" style={{ display: "flex", flexDirection: "column" }}>
                            <label htmlFor="customTextArea">Enter Voter Id:</label>
                            <RemoveVoters voters={formData.voters}/>
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" className="btn btn-primary" data-bs-dismiss="modal">Save Changes</button>
                        </div>
                    </div>
                </div>
            </div>


            {/* EditElection Page */}
            <div className={`container mode-${mode}`} >
                <form className='edit'>
                    <div className="mb-3">
                        <label htmlFor="exampleInputEmail1" className="form-label">Title : </label>
                        <input type="text" name='title' value={formData.title} onChange={handleChange} className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" />

                    </div>
                    <div className="mb-3">
                        <label htmlFor="exampleInputEmail1" className="form-label">Start : </label>
                        <input type="datetime-local" name='startDate' value={formData.startDate} onChange={handleChange} className="form-control" id="exampleInputEmail2" aria-describedby="emailHelp" />

                    </div>
                    <div className="mb-3">
                        <label htmlFor="exampleInputEmail1" className="form-label">End : </label>
                        <input type="datetime-local" name='endDate' value={formData.endDate} onChange={handleChange} className="form-control" id="exampleInputEmail3" aria-describedby="emailHelp" />

                    </div>

                    <div className="mb-3" style={{ display: "flex", flexDirection: "column", width: "400px", height: "85px" }}>
                        <label htmlFor="candidates" className="form-label">Candidates : <i className="fa-solid fa-pen-to-square" style={{cursor: "pointer"}} onClick={() => handleEditCandidates()}></i></label>

                        <DisplaySelectedCandidates candidates={formData.candidates} />
                    </div>

                    <div className="mb-3" style={{ display: "flex", flexDirection: "column", width: "400px", height: "85px" }}>
                        <label htmlFor="voters" className="form-label">Voters : <i className="fa-solid fa-pen-to-square" style={{cursor: "pointer"}} onClick={() => handleEditVoters()}></i></label>
                        <EligibleVoters voters={formData.voters} />
                    </div>
                    <div className="buttons">
                        <button type="submit" className="btn btn-outline-primary" onClick={(e) => handleSubmit(e)}>Save</button>
                        <button type="submit" className="btn btn-outline-danger" onClick={props.handleOnGoingElection}>Go Back</button>
                    </div>
                </form>
            </div>
        </>
    )
}

export default EditElection
