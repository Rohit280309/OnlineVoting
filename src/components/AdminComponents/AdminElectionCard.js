import React, { useContext } from 'react'
import colorContext from '../../context/bgColor/colorContext';
import "../../css/electioncard.css"

const AdminElectionCard = (props) => {

    const { title, start, end, image } = props;
    const electionId = props.electionItem.electionId;
    console.log(electionId);
    let startDateTime = new Date(start);
    let endDateTime = new Date(end);
    const options = { timeZone: 'Asia/Kolkata' };

    const startTime = startDateTime.toLocaleString('en-US', options);
    const endTime = endDateTime.toLocaleString('en-US', options);

    let startArr = startTime.split(",");
    let endArr = endTime.split(",");

    const context = useContext(colorContext);
    const { mode } = context;

    const handleClick = () => {
        props.handleElection(props.electionItem);

    }

    const handleDelete = () => {
        props.deleteElection(props.electionItem.id);
    }

    let currentDate = new Date();

    return (
        <>

            <div className={`card mode-${mode}`} style={{ "width": "18rem", "height": "26rem", "margin": "20px" }}>
                <img src={`data:image/jpeg;base64,${image}`} className="card-img-top card-image" alt="..." />
                <div className="card-body">
                    <h5 className="card-title">{`${title} - ${electionId}`}</h5>
                    <p className="card-text">Start Date : {startArr[0]}</p>
                    <p className="card-text">Start Time : {startArr[1].slice(0, 11)}</p>
                    <p className="card-text">End Date : {endArr[0]}</p>
                    <p className="card-text">End Time : {endArr[1].slice(0, 11)}</p>
                    <div className="electionCardBtn">
                        <button onClick={handleClick} className="btn btn-outline-primary" type='submit'>{currentDate <= new Date(end) ? <>Edit <i className='fa-solid fa-pen-to-square'></i></> : "See Results"}</button>
                        {currentDate <= new Date(end) ? null : <button onClick={handleDelete} className="btn btn-outline-danger" type='submit'>Delete</button> }
                    </div>
                </div>
            </div>

        </>
    )
}

export default AdminElectionCard
