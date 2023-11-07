import React from 'react';
import { TextField } from '@mui/material';

function getTimezoneOffset(timezone) {
    const date = new Date();
    const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
    return (utcDate - tzDate) / (1000 * 60);
}

// all in seconds, not milliseconds
const DateTimeField = ({ label, defaultValue, onChange, fullWidth = false, sx = {}, disabled = false }) => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone; // this could be configured in settings soon

    const defaultValueConverted = defaultValue !== undefined ? new Date(new Date(defaultValue * 1000).getTime() - getTimezoneOffset(timezone) * 60000).toISOString().slice(0, 16) : undefined; // ISO gives UTC time, we need to calculate the timezone offset

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
        />
    );
};

export default DateTimeField;