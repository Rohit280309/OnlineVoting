import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJs, BarElement, LinearScale, Title, CategoryScale, Tooltip, Legend } from 'chart.js';
import "../../css/singleresults.css";
import colorContext from '../../context/bgColor/colorContext';

ChartJs.register(BarElement, LinearScale, Title, CategoryScale, Tooltip, Legend);

const DisplaySingleResults = (props) => {

    const [results, setResults] = useState({});

    const context = useContext(colorContext);
    const { mode } = context;

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
        console.log(props.election.electionId);
        if (localStorage.getItem('access')) {
            axios.post(`${host}/results`, { electionId: props.election.electionId }, { headers: headers })
                .then(res => {
                    setResults(res.data.message);
                    console.log(res.data.message);
                })
                .catch(err =>
                    refreshToken()
                        .then(res => {
                            axios.post(`${host}/results`, { electionId: props.election.electionId }, { headers: headers })
                                .then(res => {
                                    setResults(res.data.message);
                                    console.log(res.data.message);
                                })
                                .catch(err => console.log(err))
                        })
                        .catch(err => console.log(err))
                );
        }
        // eslint-disable-next-line
    }, []);

    let chartData = {
        labels: Object.keys(results).map(key => key.toString()),
        datasets: [
            {
                label: 'Votes',
                backgroundColor: 'rgba(75,192,192,0.4)',
                borderColor: 'rgba(75,192,192,1)',
                borderWidth: 1,
                hoverBackgroundColor: 'rgba(75,192,192,0.6)',
                hoverBorderColor: 'rgba(75,192,192,1)',
                data: Object.values(results),
            },
        ],
    }

    return (
        <div className={`results mode-${mode}`}>
            <h3>Election Result</h3>

            <Bar
                className='bars'
                data={chartData}
                options={{
                    scales: {
                        x: {
                            type: 'category',
                            labels: Object.keys(results),
                        },
                        y: {
                            beginAtZero: true,
                        },
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: props.election.name
                        },
                        legend: {
                            display: false
                        }
                    }
                }}
            />
        </div>
    )
}

export default DisplaySingleResults
