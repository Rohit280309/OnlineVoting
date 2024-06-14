import React, { useState, useContext, useRef } from 'react'
import colorContext from '../../context/bgColor/colorContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "../../css/addcandidates.css";

const AddCandidates = (props) => {

    const context = useContext(colorContext);
    const { mode } = context;

    let goback = useRef(null);

    const host = process.env.REACT_APP_API;
    const refresh = localStorage.getItem("refresh");
    let access = localStorage.getItem("access");
    const headers = {
        'Content-Type': 'application/json',
        "Authorization": access
    };
    let history = useNavigate();

    const [ formData, setFormData ] = useState({
        name: '',
        party: '',
        sign: ''
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

    
    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
            setFormData({...formData, [e.target.name]: reader.result});
        };
    };

    const handleCandidateAdd = (e) => {
        e.preventDefault();
        refreshToken()
        .then(res => {
            if(localStorage.getItem("access"))
            {
                axios.post(`${host}/addcandidates`, formData , {headers: headers})
                .then(res => {
                    console.log(res.data);
                    goback.current.click();
                    history("/adminelection")
                })
                .catch(err => {
                    console.log(err);
                })
            }
        }
        )
        .catch(err => {
            console.log(err);
        })
    }

    return (
        <div className={`addCandidate-container mode-${mode}`}>
            <form id='addelection' method='post' className={`addelection-form`}>
                <h4 id='addCandidate-h4'>Enter Candidate's Details's</h4>
                <div className="mb-3">
                    <label htmlFor="title" className="form-label">Enter Name of the Candidate : </label>
                    <input type="text" className="form-control" id="title" name='name' onChange={handleChange} />
                </div>
                <div className="mb-3">
                    <label htmlFor="party" className="form-label">Enter Party : </label>
                    <input type="text" className="form-control" id="party" name='party' onChange={handleChange} aria-describedby="emailHelp" />
                </div>
                <div className="mb-3">
                    <label htmlFor="formFileSm" className="form-label">Upload Sign : </label>
                    <input className="form-control form-control-sm" name='sign' onChange={handleImageChange} id="formFileSm" type="file" />
                </div>

                <div className="addcandiadtebuttons mb-3">
                    <button disabled={formData.name.length < 1} type="submit" className="btn btn-outline-success" onClick={handleCandidateAdd} >Add Candidate</button>
                    <button ref={goback} type="submit" className="btn btn-outline-danger" style={{width: "130px"}} onClick={props.handleDashboard} >Go Back</button>
                </div>
            </form>
        </div>
    )
}

export default AddCandidates
