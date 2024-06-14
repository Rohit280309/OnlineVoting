import React, { useEffect, useState } from 'react'
import ColorContext from './colorContext';

const ColorState = (props) => {

    const [mode, setMode] = useState('light');

    const toggleMode = () => {

        if (mode === 'light') {
            setMode('dark');
            document.body.style.backgroundColor = 'rgb(33 37 41)';
        }
        else {
            setMode('light');
            document.body.style.backgroundColor = 'rgb(248, 249, 250)';
        }
    }

    const updateScrollbarStyles = (theme) => {
        const thumbColor = theme === 'light' ? '#ccc' : '#333';
        const trackColor = theme === 'light' ? '#f4f4f4' : '#222';
        document.documentElement.style.setProperty('--scrollbar-thumb', thumbColor);
        document.documentElement.style.setProperty('--scrollbar-track', trackColor);
    };

    useEffect(() => {
        updateScrollbarStyles(mode);
    }, [mode]);

    return (
        <ColorContext.Provider value={{ mode, toggleMode }}>
            {props.children}
        </ColorContext.Provider>
    )
}

export default ColorState
