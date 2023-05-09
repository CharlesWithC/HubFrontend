import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import { NotificationsRounded, AccountBoxRounded, SettingsRounded, FlareRounded, LogoutRounded } from '@mui/icons-material';
import PropTypes from 'prop-types';
import { Snackbar, Alert } from "@mui/material";
import { FetchProfile } from "../functions";
import { useState } from "react";
import LinearProgress from '@mui/material/LinearProgress';

import axios from 'axios';
const axiosRetry = require('axios-retry');
axios.defaults.validateStatus = (status) => status < 600;
axiosRetry(axios, {
    retries: 3,
    retryDelay: (retryCount) => {
        console.log(`retry attempt: ${retryCount}`);
        return retryCount * 1000;
    },
    retryCondition: (error) => {
        return error.response === undefined || error.response.status in [429, 503];
    },
});

var vars = require("../variables");

function TopBar(props) {
    const [loading, setLoading] = useState(false);
    const [snackbarContent, setSnackbarContent] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");

    const handleCloseSnackbar = () => {
        setSnackbarContent("");
    };

    const [anchorEl, setAnchorEl] = React.useState(null);
    const isMenuOpen = Boolean(anchorEl);
    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    async function logout() {
        const bearerToken = localStorage.getItem("token");
        if (bearerToken === null) {
            setSnackbarSeverity("error");
            setSnackbarContent("Looks like you are already logged out");
            return;
        }
        setSnackbarSeverity("info");
        setSnackbarContent("Logging out, please wait...");
        setLoading(true);
        try {
            let resp = await axios({ url: `${vars.dhpath}/token`, headers: { "Authorization": `Bearer ${bearerToken}` }, method: `DELETE` });
            localStorage.removeItem("token");
            if (parseInt(resp.status / 100) === 2) {
                setSnackbarSeverity("success");
                setSnackbarContent("You are logged out");
            } else {
                setSnackbarSeverity("error");
                setSnackbarContent("Looks like you are already logged out");
            }
            await FetchProfile();
        } catch (error) {
            console.error(error);
            setSnackbarSeverity("error");
            setSnackbarContent("Error occurred! Check F12 for more info.");
        }
        setLoading(false);
        const reloadSideBar = new CustomEvent('reloadSideBar', {});
        window.dispatchEvent(reloadSideBar);
    }

    const dropdownButtons = (<Menu
        anchorEl={anchorEl}
        anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
        }}
        id='topbar-dropdown-menu'
        keepMounted
        transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
        }}
        open={isMenuOpen}
        onClose={handleMenuClose}
        sx={{ top: "50px" }}
    >
        <MenuItem><ListItemIcon><AccountBoxRounded fontSize="small" /></ListItemIcon>Profile</MenuItem>
        <MenuItem><ListItemIcon><NotificationsRounded fontSize="small" /></ListItemIcon>Notifications</MenuItem>
        <MenuItem><ListItemIcon><SettingsRounded fontSize="small" /></ListItemIcon>Settings</MenuItem>
        <Divider />
        <MenuItem sx={{ color: '#FFC400' }}><ListItemIcon><FlareRounded fontSize="small" /></ListItemIcon>Upgrade</MenuItem>
        <Divider />
        <MenuItem onClick={logout}><ListItemIcon><LogoutRounded fontSize="small" /></ListItemIcon>Logout</MenuItem>
    </Menu>);
    return (
        <div>
            <Box sx={{ flexGrow: 1 }}>
                <AppBar position="static"
                    sx={{
                        width: { sm: `calc(100% - ${props.sidebarWidth}px)` },
                        ml: { sm: `${props.sidebarWidth}px` },
                    }}>
                    <Toolbar>
                        <Typography component="div" sx={{ flexGrow: 1 }}>
                            <IconButton size="medium" color="inherit">
                                <NotificationsRounded />
                            </IconButton>
                        </Typography>
                        <div className="user-profile" onClick={handleProfileMenuOpen}>
                            <div className="user-info">
                                <div className="user-name">{vars.userBanner.name}</div>
                                <div className="user-role">{vars.userBanner.role}</div>
                            </div>
                            <div className="user-avatar">
                                <img src={vars.userBanner.avatar} alt="User Avatar" />
                            </div>
                        </div>
                        {dropdownButtons}
                    </Toolbar>
                </AppBar>
                {loading && (<LinearProgress />)}
            </Box>
            <Snackbar
                open={!!snackbarContent}
                autoHideDuration={loading ? null : 5000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
                    {snackbarContent}
                </Alert>
            </Snackbar>
        </div>
    );
}

TopBar.propTypes = {
    sidebarWidth: PropTypes.number,
};

export default TopBar;