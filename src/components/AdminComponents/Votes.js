import React, { useEffect, useContext, useState } from 'react'
import axios from 'axios';
import colorContext from '../../context/bgColor/colorContext';
import "../../css/votes.css";

const Votes = () => {

    const [vote, setVote] = useState([]);
    const host = process.env.REACT_APP_API;
    const refresh = localStorage.getItem("refresh");
    let access = localStorage.getItem("access");
    const options = { timeZone: 'Asia/Kolkata' };
    let timeStamp = null;
    let istTime = null;

    let timeDate = [];

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

    useEffect(() => {
        if (localStorage.getItem('access')) {

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

        }
        //eslint-disable-next-line
    }, []);

    return (
        <div className={`votes-container mode-${mode}`}>
            <h3>List of All Votes : </h3>
            <table className={`table ${mode === "light" ? "table-light" : "table-dark"} table-striped`}>
                <thead>
                    <tr>
                        <th scope="col">Id</th>
                        <th scope="col">Election</th>
                        <th scope="col">Candidate</th>
                        <th scope="col">Date</th>
                        <th scope="col">Time</th>
                    </tr>
                </thead>
                <tbody>

                    {
                        vote.map((vote, key) => {
                            timeStamp = new Date(vote.Timestamp);
                            istTime = timeStamp.toLocaleString('en-US', options);
                            
                            timeDate = istTime.split(",");
                            return <>
                                <tr key={key}>
                                    <th scope='row'>{vote.Id}</th>
                                    <td>{vote.Election}</td>
                                    <td>{vote.Candidate}</td>
                                    <td>{timeDate[0]}</td>
                                    <td>{timeDate[1].slice(0, 12)}</td>
                                </tr>
                            </>
                        })
                    }
                </tbody>
            </table>
        </div>
    )
}

export default Votes
