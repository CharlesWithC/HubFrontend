import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context';

import { TextField } from '@mui/material';

import { getTimezoneOffset } from '../functions';

// all in seconds, not milliseconds
const DateTimeField = ({ label, defaultValue, onChange, fullWidth = false, size = undefined, sx = {}, disabled = false }) => {
    const { userLevel, userSettings } = useContext(AppContext);

    let displayTimezone = userSettings.display_timezone;
    if (userLevel < 3) {
        displayTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    }

    const [defaultValueConverted, setDefaultValueConverted] = useState(null); // ISO gives UTC time, we need to calculate the timezone offset
    useEffect(() => { // only consider the initial value
        setDefaultValueConverted(defaultValue !== undefined ? new Date(new Date(defaultValue * 1000).getTime() - getTimezoneOffset(displayTimezone) * 60000).toISOString().slice(0, 16) : undefined);
    }, []);

    const handleChange = (event) => {
        const newTimestamp = new Date(event.target.value).getTime() / 1000;
        onChange(newTimestamp);
    };

    return (
        <>{defaultValueConverted !== null && <TextField
            label={label}
            type="datetime-local"
            defaultValue={defaultValueConverted}
            onChange={handleChange}
            InputLabelProps={{
                shrink: true,
            }}
            fullWidth={fullWidth}
            sx={sx}
            disabled={disabled}
            size={size}
        />}</>
    );
};

export default DateTimeField;