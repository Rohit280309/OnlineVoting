import React from 'react'

const Alert = (props) => {
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

        <div style={style}>
            {props.alert &&
                <div className={`alert sticky-top alert-${props.alert.type} alert-dismissible fade show p-1`} style={{ display: "flex", justifyContent: "center", alignItems: "center", height: '100%', fontSize: "15x" }} role="alert">
                    <div>
                        {props.alert.message}
                    </div>
                </div>}
        </div>
    )
}

export default Alert
