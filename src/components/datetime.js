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
    const [prevDefaultValue, setPrevDefaultValue] = useState(defaultValue);

    // init
    useEffect(() => { // only consider the initial value
        try {
            setDefaultValueConverted(defaultValue !== undefined ? new Date(new Date(defaultValue * 1000).getTime() - getTimezoneOffset(displayTimezone) * 60000).toISOString().slice(0, 16) : undefined);
        } catch (error) { // invalid date
            setDefaultValueConverted(undefined);
        }
    }, []);

    useEffect(() => { // only consider the initial value
        if (defaultValue !== undefined && prevDefaultValue === undefined) {
            setDefaultValueConverted(new Date(new Date(defaultValue * 1000).getTime() - getTimezoneOffset(displayTimezone) * 60000).toISOString().slice(0, 16));
            setPrevDefaultValue(defaultValue);
        }
        if (defaultValue === undefined) {
            setDefaultValueConverted(undefined);
            setPrevDefaultValue(undefined);
        }
    }, [defaultValue]);

    const handleChange = (event) => {
        const newTimestamp = new Date(event.target.value).getTime() / 1000 + getTimezoneOffset(displayTimezone, Intl.DateTimeFormat().resolvedOptions().timeZone) * 60;

        if (prevDefaultValue === undefined) {
            setDefaultValueConverted(newTimestamp);
            setTimeout(function () {
                setPrevDefaultValue(newTimestamp);
            }, 50);
        }

        onChange(newTimestamp);
    };

    return (
        <>{defaultValueConverted !== null && <TextField
            key={prevDefaultValue}
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