import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJs, BarElement, LinearScale, Title, CategoryScale, Tooltip, Legend } from 'chart.js';
import "../../css/results.css";

ChartJs.register(BarElement, LinearScale, Title, CategoryScale, Tooltip, Legend);


const Results = () => {
    const [results, setResults] = useState([]);
    const [electionName, setElectionName] = useState([]);
    const [electionId, setElectionId] = useState([]);

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
        if (localStorage.getItem('access')) {
            axios.get(`${host}/adminresults`, { headers: headers })
                .then(res => {
                    setResults(res.data.message.results)
                    setElectionName(res.data.message.electionnames)
                    setElectionId(res.data.message.electionids)
                })
                .catch(err =>
                    refreshToken()
                        .then(res => {
                            axios.get(`${host}/adminresults`, { headers: headers })
                                .then(res => {
                                    setResults(res.data.message.results);
                                    setElectionName(res.data.message.electionnames)
                                    setElectionId(res.data.message.electionids)
                                })
                                .catch(err => console.log(err))
                        })
                        .catch(err => console.log(err))
                );
        }
        // eslint-disable-next-line
    }, []);

    let chartData = {};

    if (Object.keys(results).length === 0) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h3>Election Results</h3>
            <div className="bars-container">
                {
                    results.map((obj, id) => {

                        chartData = {
                            labels: Object.keys(obj).map(key => key.toString()),
                            datasets: [
                                {
                                    label: 'Votes',
                                    backgroundColor: 'rgba(75,192,192,0.4)',
                                    borderColor: 'rgba(75,192,192,1)',
                                    borderWidth: 1,
                                    hoverBackgroundColor: 'rgba(75,192,192,0.6)',
                                    hoverBorderColor: 'rgba(75,192,192,1)',
                                    data: Object.values(obj),
                                },
                            ],
                        }
                        return <div key={id} className='bar'>

                            <Bar
                                className='bars'
                                data={chartData}
                                options={{
                                    scales: {
                                        x: {
                                            type: 'category',
                                            labels: Object.keys(obj),
                                        },
                                        y: {
                                            beginAtZero: true,
                                        },
                                    },
                                    plugins: {
                                        title: {
                                            display: true,
                                            text: `${electionName[id]} - ${electionId[id]}`
                                        },
                                        legend: {
                                            display: false
                                        }
                                    }
                                }}
                            />
                        </div>
                    })


                }
            </div>
        </div>
    );
}

export default Results;
