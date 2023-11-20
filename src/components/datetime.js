import React from 'react';
import { TextField } from '@mui/material';
import { getTimezoneOffset } from '../functions';

var vars = require("../variables");

// all in seconds, not milliseconds
const DateTimeField = ({ label, defaultValue, onChange, fullWidth = false, size = undefined, sx = {}, disabled = false }) => {
    let displayTimezone = vars.userSettings.display_timezone;
    if (vars.userLevel < 3) {
        displayTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    }

    const defaultValueConverted = defaultValue !== undefined ? new Date(new Date(defaultValue * 1000).getTime() - getTimezoneOffset(displayTimezone) * 60000).toISOString().slice(0, 16) : undefined; // ISO gives UTC time, we need to calculate the timezone offset

    const handleChange = (event) => {
        const newTimestamp = new Date(event.target.value).getTime() / 1000;
        onChange(newTimestamp);
    };

    return (
        <TextField
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
        />
    );
};

export default DateTimeField;