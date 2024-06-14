import React, { useContext, useEffect, useRef, useState } from 'react';
import colorContext from '../../context/bgColor/colorContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../css/addelection.css';

const AddElection = (props) => {

    const context = useContext(colorContext);
    const { mode } = context;

    const host = process.env.REACT_APP_API;
    const refresh = localStorage.getItem("refresh");
    let access = localStorage.getItem("access");
    const headers = {
        'Content-Type': 'application/json',
        "Authorization": access
    };
    let history = useNavigate();

    let goback = useRef(null);

    const [allCandidates, setAllCandidates] = useState({ candidates: [] });
    const refCandidateModal = useRef(null);
    const [formData, setFormData] = useState({
        title: '',
        startDate: '',
        endDate: '',
        candidates: [],
        image: null,
        password: '',
    });

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

    const data = {
        title: formData.title,
        startDate: formData.startDate,
        endDate: formData.endDate,
        password: formData.password,
        candidates: formData.candidates.map(candidate => `${candidate.id}`),
        image: formData.image
    }

    const handleElectionAdd = (e) => {
        e.preventDefault();

        if (formData.title.length >= 20) {
            props.showAlert('Election name should be less than 20 characters.', "danger");
            return;
        }
        if (!formData.image) {
            props.showAlert('Please select an image file.', "danger");
            return;
        }

        if (localStorage.getItem("access")) {
            axios.post(`${host}/createelection`, data, { headers: headers })
                .then(res => {
                    props.showAlert("Election Created Successfully", "success")
                    setTimeout(() => {
                        goback.current.click();
                        history("/adminelection");

                    }, 2000);
                })
                .catch(err => {
                    refreshToken()
                        .then(res => {
                            axios.post(`${host}/createelection`, data, { headers: headers })
                                .then(res => {
                                    props.showAlert("Election Created Successfully", "success")
                                    setTimeout(() => {
                                        goback.current.click();
                                        history("/adminelection");

                                    }, 2000);
                                })
                                .catch(err => {
                                    console.log(err);
                                })
                        }
                        )
                        .catch(err => {
                            console.log(err);
                        })
                })

        }
        console.log(formData);

    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
            setFormData({ ...formData, [e.target.name]: reader.result });
        };
    };

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
        if (!candidates) {
            return <div className={`modalbox mode-${mode}`}>No Candidates selected</div>;
        }

        const handleDropSelected = (e) => {
            handleDrop(e, 'selected');
        };

        return (
            <div className={`modalbox`} style={{ height: "50px", maxHeight: "50px", overflow: "auto" }} onDrop={handleDropSelected} onDragOver={handleDragOver}>
                {candidates.map((candidate) => (
                    <div
                        key={candidate.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, candidate)}
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

        const handleDropAll = (e) => {
            handleDrop(e, 'selected');
        };

        return (
            <div className={`modalbox`} onDrop={handleDropAll} onDragOver={handleDragOver}>
                {candidates.map((candidate) => (
                    <div
                        key={candidate.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, candidate)}
                        onDrop={(e) => handleDrop(e, 'selected')}
                    >
                        {`${candidate.id}-${candidate.name} - ${candidate.party}`}
                    </div>
                ))}
            </div>
        );
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

    return (
        <>

            <button ref={refCandidateModal} type="button" className="btn btn-primary d-none" data-bs-toggle="modal" data-bs-target="#candidateModal">
                Launch demo modal
            </button>
            <div className="modal fade" style={{ color: mode === 'light' ? 'black' : 'white' }} id="candidateModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog" style={{ backgroundColor: mode === 'light' ? 'white' : 'black' }}>
                    <div className="modal-content" style={{ backgroundColor: mode === 'light' ? 'white' : 'grey' }}>
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="exampleModalLabel">Drag and drop to Add (Minimum 2) and Double Click to remove</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body" style={{ display: "flex", flexDirection: "column" }}>
                            <label htmlFor="candidates" className="form-label">All Candidates:</label>
                            <AllCandidates
                                candidates={allCandidates.candidates}
                            // handleAddCandidate={handleAddCandidate}
                            // handleDragStart={handleDragStart}
                            // handleDragOver={handleDragOver}
                            // handleDrop={handleDrop}
                            // type="all"
                            />
                            <div className="line"></div>
                            <label htmlFor="candidates" className="form-label">Selected Candidates:</label>

                            <SelectedCandidates candidates={formData.candidates} />

                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" className="btn btn-primary" data-bs-dismiss="modal">Save Changes</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className={`addelectioncontainer mode-${mode}`}>
                <form id='addelection' method='post' className={`addelection-form`}>
                    <h4>Add Election</h4>
                    <div className="mb-3">
                        <label htmlFor="title" className="form-label">Enter Title : </label>
                        <input type="text" className="form-control" id="title" name='title' onChange={handleChange} />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="exampleInputEmail1" className="form-label">Start : </label>
                        <input type="datetime-local" name='startDate' value={formData.startDate} onChange={handleChange} className="form-control" id="exampleInputEmail2" aria-describedby="emailHelp" />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="exampleInputEmail1" className="form-label">End : </label>
                        <input type="datetime-local" name='endDate' value={formData.endDate} onChange={handleChange} className="form-control" id="exampleInputEmail3" aria-describedby="emailHelp" />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">Enter password : </label>
                        <input type="password" className="form-control" id="password" name='password' onChange={handleChange} aria-describedby="emailHelp" />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="formFileSm" className="form-label">Upload Image : </label>
                        <input className="form-control form-control-sm" name='image' onChange={handleImageChange} id="formFileSm" type="file" />
                    </div>
                    <div className="mb-3" style={{ display: "flex", flexDirection: "column", width: "400px", height: "64px" }}>
                        <label htmlFor="candidates" className="form-label">Candidates : <i className="fa-solid fa-pen-to-square" style={{ cursor: "pointer" }} onClick={() => editCandidates()}></i></label>
                        <DisplaySelectedCandidates candidates={formData.candidates} />
                    </div>
                    <div className="addelectionbuttons mb-3">
                        <button disabled={formData.title.length < 1 || formData.candidates.length < 2} type="submit" className="btn btn-outline-primary" onClick={handleElectionAdd}>Create Election</button>
                        <button ref={goback} type="submit" className="btn btn-outline-danger" onClick={props.handleDashboard}>Go Back</button>
                    </div>
                </form>
            </div>

        </>
    )
}

export default AddElection
