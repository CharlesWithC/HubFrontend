import React, { useState, useEffect } from 'react';
import { Box, Popover, TextField, Tooltip, useTheme } from '@mui/material';
import { HexColorPicker } from 'react-colorful';
import { CheckRounded, ColorizeRounded } from '@mui/icons-material';

const isValidHexColor = (color) => /^#([0-9A-F]{3}){1,2}$/i.test(color);

// color = / for default | #hex for custom
const ColorInput = ({ color, onChange, disableDefault = false }) => {
    const theme = useTheme();
    const [customColor, setCustomColor] = useState(color);
    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;
    return (
        <Box display="flex" flexDirection="row">
            {!disableDefault && <Tooltip placement="bottom" arrow title="Default Color"
                PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, -10] } }] }}>
                <Box width="120px" height="60px" bgcolor="#777777" p={1} m={1} display="flex" justifyContent="center" alignItems="center" borderRadius="5px" onClick={() => { setCustomColor('/'); onChange('/'); }} style={{ cursor: 'pointer' }}>
                    {customColor === '/' && <CheckRounded />}
                </Box>
            </Tooltip>}
            <Tooltip placement="bottom" arrow title="Custom Color"
                PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, -10] } }] }}>
                <Box width="120px" height="60px" bgcolor={customColor} onClick={handleClick} p={1} m={1} position="relative" borderRadius="5px" style={{ cursor: 'pointer', border: !isValidHexColor(customColor) ? `0.5px solid ${theme.palette.text.primary}88` : 'none' }}>
                    <ColorizeRounded style={{ position: 'absolute', top: 0, right: 0 }} />
                    {isValidHexColor(customColor) && <Box display="flex" justifyContent="center" alignItems="center" style={{ height: '100%' }}><CheckRounded /></Box>}
                </Box>
            </Tooltip>
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
                <Box m={2}>
                    <HexColorPicker color={customColor} onChange={(val) => { setCustomColor(val); onChange(val); }} />
                </Box>
                <Box m={2}>
                    <TextField value={customColor} onChange={(e) => { setCustomColor(e.target.value); onChange(e.target.value); }} sx={{ width: "200px" }} />
                </Box>
            </Popover>
        </Box >
    );
};

export default ColorInput;