import { useState, useEffect, useContext, useCallback } from 'react';
import { AppContext } from '../context';

import { TextField } from '@mui/material';

import { getTimezoneOffset } from '../functions';


// all in seconds, not milliseconds
// always takes in utc, displays local, returns utc
const DateTimeField = ({ label, defaultValue, onChange, fullWidth = false, size = undefined, sx = {}, disabled = false, noDate = false }) => {
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
        if (noDate) {
            if (defaultValue && defaultValue !== "") {
                const today = new Date();
                const [hours, minutes] = defaultValue.split(':').map(Number);
                const dateInUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes));
                const localTimeString = dateInUTC.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
                setDefaultValueConverted(localTimeString);
                return;
            }
            return;
        }
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

        if (noDate) {
            const [hours, minutes] = event.target.value.split(':').map(Number);
            const today = new Date();
            const localDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes);
            const utcHours = localDate.getUTCHours().toString().padStart(2, '0');
            const utcMinutes = localDate.getUTCMinutes().toString().padStart(2, '0');
            const utcTimeString = `${utcHours}:${utcMinutes}`;
            onChange(utcTimeString);
            return;
        }

        onChange(newTimestamp);
    };

    return (
        <>{defaultValueConverted !== null && <TextField
            key={prevDefaultValue}
            label={label}
            type={!noDate ? "datetime-local" : "time"}
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