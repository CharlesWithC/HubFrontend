import React from 'react';
import { TextField } from '@mui/material';
import { getTimezoneOffset } from '../functions';

var vars = require("../variables");

// all in seconds, not milliseconds
const DateTimeField = ({ label, defaultValue, onChange, fullWidth = false, sx = {}, disabled = false }) => {
    const defaultValueConverted = defaultValue !== undefined ? new Date(new Date(defaultValue * 1000).getTime() - getTimezoneOffset(vars.userSettings.display_timezone) * 60000).toISOString().slice(0, 16) : undefined; // ISO gives UTC time, we need to calculate the timezone offset

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