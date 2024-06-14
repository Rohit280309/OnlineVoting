import React, { useEffect, useContext, useState, useRef } from 'react'
import axios from 'axios';
import colorContext from '../../context/bgColor/colorContext';
import "../../css/displaycandidates.css";


const DisplayCandidates = (props) => {

    const [candidates, setCandidates] = useState([]);
    // const [image, setImage] = useState(null);
    const [updated, setUpdated] = useState({
        id: "",
        name: "",
        party: "",
        sign: ""
    });

    const [delId, setDelId] = useState(null);

    const host = process.env.REACT_APP_API;
    const refresh = localStorage.getItem("refresh");
    let access = localStorage.getItem("access");

    let ref = useRef(null);
    let delRef = useRef(null);
    let closeRef = useRef(null);

    const headers = {
        'Content-Type': 'application/json',
        "Authorization": access
    };

    const context = useContext(colorContext);
    const { mode } = context;

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

    const getAllCandidates = () => {
        axios.get(`${host}/getcandidatedetails`, { headers: headers })
            .then(res => {
                setCandidates(res.data);
                console.log(res.data);
            })
            .catch(err => {
                refreshToken()
                    .then(res => {
                        axios.get(`${host}/getcandidatedetails`, { headers: headers })
                            .then(res => {
                                setCandidates(res.data);
                                console.log(res.data);
                            })
                            .catch(err => console.log(err))
                    })
                    .catch(err => { console.log(err) })
            })

    }

    useEffect(() => {
        getAllCandidates();
        // eslint-disable-next-line
    }, []);

    const handleUpdateCandidates = (id, name, party, sign) => {
        // e.preventDefault();
        ref.current.click();
        console.log(id);

        setUpdated({
            id: id,
            name: name,
            party: party,
            sign: `data:image/jpeg;base64,${sign}`
        });
    }

    const handleDeleteCandidates = (id) => {
        delRef.current.click();
        setDelId(id);
    }

    const handleDelete = () => {
        axios.delete(`${host}/deletecandidates/${delId}`, { headers: headers })
            .then(res => {
                if (res.data.message) {
                    closeRef.current.click();
                    props.showAlert("Candidate Deleted Succesfully", "success");
                    getAllCandidates();
                }
            })
            .catch(err => {
                refreshToken()
                    .then(res => {
                        axios.delete(`${host}/deletecandidates/${delId}`, { headers: headers })
                            .then(res => {
                                if (res.data.message) {
                                    closeRef.current.click();
                                    props.showAlert("Candidate Deleted Succesfully", "success");
                                    getAllCandidates();
                                }
                            })
                            .catch(err => {
                                props.showAlert("Error Deleting Candidate Try Again", "danger");
                            })
                    })
                    .catch(err => {
                        props.showAlert("Error Deleting Candidate Try Again", "danger");
                    })
            })
    };

    const handleChange = (e) => {
        setUpdated({ ...updated, [e.target.name]: e.target.value });

    }

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
            // setImage(reader.result);
            setUpdated({ ...updated, [e.target.name]: reader.result });
        };

    };

    const handleSubmit = () => {
        // console.log(updated);
        const formData = {
            "id": updated.id,
            "name": updated.name,
            "party": updated.party,
            "sign": updated.sign
        }
        console.log(formData);

        axios.put(`${host}/updatecandidates/${updated.id}`, formData, { headers: headers })
            .then(res => {
                if (res.data.message) {
                    closeRef.current.click();
                    props.showAlert("Candidate Updated Succesfully", "success");
                    let newCandidate = res.data.message;
                    setCandidates((prevCandidates) => {
                        // Create a new array with the updated object
                        return prevCandidates.map((obj) => (obj.id === newCandidate.id ? { ...obj, ...newCandidate } : obj));
                    });
                }
            })
            .catch(err => {
                refreshToken()
                    .then(res => {
                        axios.put(`${host}/updatecandidates/${updated.id}`, formData, { headers: headers })
                            .then(res => {
                                if (res.data.message) {
                                    closeRef.current.click();
                                    props.showAlert("Candidate Updated Succesfully", "success");
                                    let newCandidate = res.data.message;
                                    setCandidates((prevCandidates) => {
                                        // Create a new array with the updated object
                                        return prevCandidates.map((obj) => (obj.id === newCandidate.id ? { ...obj, ...newCandidate } : obj));
                                    });
                                }
                            })
                            .catch((err) => {
                                props.showAlert("Error Updating Candidate Try again", "danger");

                            })
                    })
                    .catch((err) => {
                        props.showAlert("Error Updating Candidate Try again", "danger");

                    })
            })
    }

    return (


        <>

            {/* Hidden button to launch update modal */}
            <button ref={ref} type="button" className="btn btn-primary d-none" data-bs-toggle="modal" data-bs-target="#exampleModal">
                Launch demo modal
            </button>

            <div className="modal fade" style={{ color: mode === 'light' ? 'black' : 'white' }} id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content" style={{ backgroundColor: mode === 'light' ? 'white' : 'grey' }}>
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="exampleModalLabel">Update the Candidate</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <form className={`addelection-form`}>
                                <h4>Update Candidates</h4>
                                <div className="mb-3">
                                    <label htmlFor="title" className="form-label">Enter Name : </label>
                                    <input type="text" className="form-control" id="title" name='name' onChange={handleChange} value={updated.name} />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="party" className="form-label">Enter Party : </label>
                                    <input type="text" className="form-control" id="party" name='party' onChange={handleChange} value={updated.party} aria-describedby="emailHelp" />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="formFileSm" className="form-label">Upload Image</label>
                                    <input className="form-control form-control-sm" name='sign' onChange={handleImageChange} id="formFileSm" type="file" />
                                </div>

                                {/* <div className="mb-3">
                                    <button type="submit" className="btn btn-primary" >Add</button>
                                </div> */}
                            </form>
                        </div>
                        <div className="modal-footer">
                            <button ref={closeRef} type="button" className="btn btn-danger" data-bs-dismiss="modal">Close</button>
                            <button type="button" className="btn btn-success" onClick={handleSubmit}>Save changes</button>
                        </div>
                    </div>
                </div>
            </div>


            <button ref={delRef} type="button" className="btn btn-primary d-none" data-bs-toggle="modal" data-bs-target="#exampleModal2">
                Launch demo modal
            </button>

            <div className="modal fade" style={{ color: mode === 'light' ? 'black' : 'white' }} id="exampleModal2" tabindex="-1" aria-labelledby="exampleModalLabel2" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content" style={{ backgroundColor: mode === 'light' ? 'white' : 'grey' }}>
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="exampleModalLabel">Online Voter</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            Are You Sure you want to Delete ?
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-danger" onClick={handleDelete}>Yes</button>
                            <button ref={closeRef} type="button" className="btn btn-success" data-bs-dismiss="modal">No</button>
                        </div>
                    </div>
                </div>
            </div>
            {/* <Alert alert={alert} /> */}
            <div className={`candidate-container mode-${mode}`}>
                <h3>List of Candidates : </h3>
                <table className={`table ${mode === "light" ? "table-light" : "table-dark"} table-striped`}>
                    <thead>
                        <tr>
                            <th scope="col">Id</th>
                            <th scope="col">Name</th>
                            <th scope="col">Party</th>
                            <th scope="col">Sign</th>
                            <th scope="col"></th> { /* For bottom line of the headers*/}
                        </tr>
                    </thead>
                    <tbody>

                        {
                            candidates.map((candidate) => {
                                return <>
                                    <tr>
                                        <th scope='row'>{candidate.id}</th>
                                        <td>{candidate.name}</td>
                                        <td>{candidate.party}</td>
                                        <td><img src={`data:image/jpeg;base64,${candidate.Sign}`} id='candidate-sign' alt="candidate sign" /></td>
                                        <td>
                                            <button id='action-buttons' className="btn btn-outline-primary edit-btn" onClick={() => handleUpdateCandidates(candidate.id, candidate.name, candidate.party, candidate.Sign)}><i className="fa-solid fa-pen-to-square"></i> Edit</button>
                                            <button id='action-buttons' className="btn btn-outline-danger edit-btn" onClick={() => handleDeleteCandidates(candidate.id)}><i className="fa-regular fa-trash-can"></i> Delete</button>
                                        </td>
                                    </tr>
                                </>
                            })
                        }
                    </tbody>
                </table>
            </div>

        </>
    )
}

export default DisplayCandidates
