import React, { useContext, useEffect, useState } from 'react'
import AdminElectionCard from './AdminElectionCard';
import axios from 'axios';
import colorContext from '../../context/bgColor/colorContext';
import "../../css/ongoingelections.css";

const OngoingElections = (props) => {

    const [election, setElection] = useState([]);
    const host = process.env.REACT_APP_API;
    const refresh = localStorage.getItem("refresh");
    let access = localStorage.getItem("access");

    const context = useContext(colorContext);
    const { mode } = context;

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

        }
        //eslint-disable-next-line
    }, []);

    let currentDate = new Date();

    return (
        <div className='ongoing row'>
            {
                election.length === 0 || !election.some(electionItem => new Date(electionItem.EndDate) >= currentDate) ? 
                
                <h3 className={`ongoing-stat mode-${mode}`}>There are no ongoing Elections</h3>
                
                : 

                election.map((electionItem, id) => {
                    return (
                        new Date(electionItem.EndDate) >= currentDate ?
                            <div className="col-md-5" key={id}><AdminElectionCard key={id} handleElection={props.handleElection} title={electionItem.Title} image={electionItem.image} start={electionItem.StartDate} end={electionItem.EndDate} electionItem={electionItem} /></div>
                            :
                            null
                    )
                })
            }
        </div>
    )
}

export default OngoingElections
