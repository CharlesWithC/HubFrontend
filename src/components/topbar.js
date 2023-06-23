import * as React from 'react';
import { useState, useEffect, useRef } from "react";
import PropTypes from 'prop-types';
import { AppBar, Box, Toolbar, Typography, Divider, MenuItem, ListItemIcon, Menu, Snackbar, Alert, LinearProgress } from "@mui/material";
import { AccountBoxRounded, SettingsRounded, FlareRounded, LogoutRounded } from '@mui/icons-material';
import { Link } from 'react-router-dom';

import { FetchProfile, customAxios as axios } from "../functions";
import NotificationsPopover from './notifications';

var vars = require("../variables");

const TopBar = (props) => {
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

    const appBarRef = useRef(null);
    const progressBarRef = useRef(null);
    const [progressBarStyle, setProgressBarStyle] = useState({});
    useEffect(() => {
        const updateProgressBarWidth = () => {
            const appBarElement = appBarRef.current;
            const progressBarElement = progressBarRef.current;

            if (appBarElement && progressBarElement) {
                const appBarRect = appBarElement.getBoundingClientRect();
                const progressBarStyle = {
                    left: `${appBarRect.left}px`,
                    width: `${appBarRect.width}px`,
                };
                setProgressBarStyle(progressBarStyle);
            }
        };

        updateProgressBarWidth();

        window.addEventListener('resize', updateProgressBarWidth);
        return () => {
            window.removeEventListener('resize', updateProgressBarWidth);
        };
    }, []);

    const [reload, setReload] = useState(+new Date());
    useEffect(() => {
        const handleReloadEvent = () => {
            setReload(+new Date());
        };
        window.addEventListener("reloadTopBar", handleReloadEvent);
        return () => {
            window.removeEventListener("reloadTopBar", handleReloadEvent);
        };
    }, []);

    useEffect(() => {
        const handleLoadingStartEvent = () => {
            setLoading(true);
        };
        const handleLoadingEndEvent = () => {
            setLoading(false);
        };
        window.addEventListener("loadingStart", handleLoadingStartEvent);
        window.addEventListener("loadingEnd", handleLoadingEndEvent);
        return () => {
            window.removeEventListener("loadingStart", handleLoadingStartEvent);
            window.removeEventListener("loadingEnd", handleLoadingEndEvent);
        };
    }, []);

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

    const loggedInBtns = (<Menu
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
        <MenuItem><ListItemIcon><SettingsRounded fontSize="small" /></ListItemIcon>Settings</MenuItem>
        <Divider />
        <Link to="/upgrade"><MenuItem sx={{ color: '#FFC400', marginBottom: "10px" }}><ListItemIcon><FlareRounded fontSize="small" /></ListItemIcon>Upgrade</MenuItem></Link>
        <Divider />
        <MenuItem onClick={logout}><ListItemIcon><LogoutRounded fontSize="small" /></ListItemIcon>Logout</MenuItem>
    </Menu>);

    const notLoggedInBtns = (<Menu
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
        <MenuItem><Link to="/discord-redirect" >Discord</Link></MenuItem>
        <MenuItem><Link to="/steam-redirect">Steam</Link></MenuItem>
    </Menu>);

    return (
        <div do-reload={reload}>
            <Box sx={{ flexGrow: 1 }}>
                <AppBar ref={appBarRef} position="static"
                    sx={{
                        width: { sm: `calc(100% - ${props.sidebarWidth}px)` },
                        ml: { sm: `${props.sidebarWidth}px` },
                        position: "fixed",
                        zIndex: "100"
                    }}>
                    <Toolbar>
                        <Typography component="div" sx={{ flexGrow: 1 }}>
                            <NotificationsPopover />
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
                        {vars.isLoggedIn && loggedInBtns}
                        {!vars.isLoggedIn && notLoggedInBtns}
                    </Toolbar>
                </AppBar>
                <LinearProgress ref={progressBarRef} sx={{ ...progressBarStyle, top: "80px", position: "fixed", zIndex: 101, display: loading ? "block" : "none" }} />
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