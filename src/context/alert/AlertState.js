import { React, useState } from 'react'
import AlertContext from './alertContext';

const AlertState = (props) => {

    const [alert, setAlert] = useState(null);

    const showAlert = (message, type) => {
        setAlert({
            message: message,
            type: type
        });

        setTimeout(() => {
            setAlert(null);
        }, 2000);
    }

    const style1 = {
        height: "30px",
        marginLeft: "200px",
        marginTop: 0,
        marginBottom: "20px",
    }

    const style2 = {
        height: "30px",
        marginBottom: "20px",
    }

    const style = props.size === "full" ? style2 : style1;
    return (
        <>
            <div style={style}>
                {props.alert &&
                    <div className={`alert sticky-top alert-${alert.type} alert-dismissible fade show p-1`} style={{ display: "flex", justifyContent: "center", alignItems: "center", height: '100%', fontSize: "15x" }} role="alert">
                        {/* <strong>{capatalize(props.alert.type)}</strong>: {props.alert.message} */}
                        <div>
                            {alert.message}
                        </div>
                    </div>}
            </div>

            <AlertContext.Provider value={{ alert, showAlert }}>
                {props.children}
            </AlertContext.Provider>
        </>
    )
}

export default AlertState
