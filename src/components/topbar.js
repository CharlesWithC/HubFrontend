import * as React from 'react';
import { useState, useEffect, useRef } from "react";
import PropTypes from 'prop-types';
import { AppBar, Box, Toolbar, Typography, Divider, MenuItem, ListItemIcon, Menu, Snackbar, Alert, LinearProgress, useTheme } from "@mui/material";
import { AccountBoxRounded, SettingsRounded, FlareRounded, LogoutRounded } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlay, faCirclePause } from '@fortawesome/free-solid-svg-icons';

import { FetchProfile, customAxios as axios, getAuthToken } from "../functions";
import NotificationsPopover from './notifications';
import UserCard from './usercard';

var vars = require("../variables");

const radioURLs = { "tsr": "https://oreo.truckstopradio.co.uk/radio/8000/radio.mp3" };
const radioNames = { "tsr": "TruckStopRadio" };
const radioImages = { "tsr": "https://truckstopradio.co.uk/autodj.png" };

const TopBar = (props) => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const theme = useTheme();

    const [snackbarContent, setSnackbarContent] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const handleCloseSnackbar = () => {
        setSnackbarContent("");
    };
    const [showProfileModal, setShowProfileModal] = useState(1);

    const sleep = ms => new Promise(
        resolve => setTimeout(resolve, ms)
    );

    const radioRef = useRef(null);
    const [radioURL, setRadioURL] = useState("");
    const [radioImage, setRadioImage] = useState("");
    const [radioSongName, setRadioSongName] = useState("Now Playing");
    const [radioName, setRadioName] = useState("No Radio");
    const [isPlaying, setIsPlaying] = useState(false);
    async function loadRadio() {
        if (vars.userSettings.radio !== "disabled") {
            let radioOK = false;
            if (Object.keys(radioURLs).includes(vars.userSettings.radio_type)) {
                setRadioURL(radioURLs[vars.userSettings.radio_type]);
                setRadioName(radioNames[vars.userSettings.radio_type]);
                setRadioImage(radioImages[vars.userSettings.radio_type]);
                radioOK = true;
            } else {
                try {
                    new URL(vars.userSettings.radio_type);
                    setRadioURL(vars.userSettings.radio_type);
                    setRadioName("Custom Radio");
                    setRadioImage("https://drivershub.charlws.com/images/logo.png");
                    radioOK = true;
                } catch {
                    // invalid url
                    console.error(`Invalid Radio URL: ${vars.userSettings.radio_type}`);
                }
            }

            if (vars.userSettings.radio === "auto" && radioOK) {
                for (let i = 0; i <= 10; i++) {
                    try {
                        radioRef.current.play();
                        setIsPlaying(true);
                        break;
                    } catch {
                        await sleep(1000);
                    }
                }
            }
        } else {
            setIsPlaying(false);
            setRadioURL("");
        }
    }
    useEffect(() => {
        if (radioRef.current !== null) {
            if (isPlaying) {
                radioRef.current.play();
            } else {
                radioRef.current.pause();
            }
        }
    }, [isPlaying]);
    useEffect(() => {
        const interval = setInterval(async () => {
            if (isPlaying) {
                let resp = await axios({ url: `https://tsr-static.omnibyte.tech/cache.php?url=https://panel.truckstopradio.co.uk/api/v1/song-history/now-playing` });
                setRadioSongName(resp.data.song.title);
                setRadioImage(resp.data.song.graphic.medium);
            }
        }, 10000);
        return () => { clearInterval(interval); };
    }, [isPlaying]);
    useEffect(() => {
        loadRadio();
    }, [vars.userSettings.radio]);
    useEffect(() => {
        window.addEventListener("radioUpdated", loadRadio);
        return () => {
            window.removeEventListener("radioUpdated", loadRadio);
        };
    }, []);

    const [anchorEl, setAnchorEl] = React.useState(null);
    const isMenuOpen = Boolean(anchorEl);
    const handleProfileMenuOpen = (event) => {
        if (!vars.isLoggedIn) {
            navigate("/beta/auth/login");
        }
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

    const openProfileModal = () => { setShowProfileModal(2); };

    async function logout() {
        const bearerToken = getAuthToken();
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
            navigate("/beta/");
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

    let loggedInBtns = (<Menu
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
        <MenuItem onClick={openProfileModal}><ListItemIcon><AccountBoxRounded fontSize="small" /></ListItemIcon>Profile</MenuItem>
        <Link to="/beta/settings"><MenuItem><ListItemIcon><SettingsRounded fontSize="small" /></ListItemIcon>Settings</MenuItem></Link>
        <Divider sx={{ marginTop: "5px", marginBottom: "5px" }} />
        <Link to="/beta/sponsor"><MenuItem sx={{ color: '#FFC400' }}><ListItemIcon><FlareRounded fontSize="small" /></ListItemIcon>Sponsor</MenuItem></Link>
        <Divider sx={{ marginTop: "5px", marginBottom: "5px" }} />
        <MenuItem onClick={logout}><ListItemIcon><LogoutRounded fontSize="small" /></ListItemIcon>Logout</MenuItem>
    </Menu>);

    if (window.location.hostname !== "localhost") {
        loggedInBtns = (<Menu
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
            <MenuItem onClick={openProfileModal}><ListItemIcon><AccountBoxRounded fontSize="small" /></ListItemIcon>Profile</MenuItem>
            <Link to="/beta/settings"><MenuItem><ListItemIcon><SettingsRounded fontSize="small" /></ListItemIcon>Settings</MenuItem></Link>
            <Divider sx={{ marginTop: "5px", marginBottom: "5px" }} />
            <MenuItem onClick={logout}><ListItemIcon><LogoutRounded fontSize="small" /></ListItemIcon>Logout</MenuItem>
        </Menu>);
    }

    return (
        <div do-reload={reload}>
            <UserCard user={vars.userInfo} showProfileModal={showProfileModal} onProfileModalClose={() => { setShowProfileModal(1); }} />
            <Box sx={{ flexGrow: 1 }}>
                <AppBar ref={appBarRef} position="static"
                    sx={{
                        width: { sm: `calc(100% - ${props.sidebarWidth}px)` },
                        ml: { sm: `${props.sidebarWidth}px` },
                        position: "fixed",
                        zIndex: "100"
                    }}>
                    <Toolbar>
                        <Box sx={{ display: "flex", flexGrow: 1, alignItems: "center" }}>
                            <Typography variant="body2"><NotificationsPopover /></Typography>
                            {radioURL !== "" &&
                                <div className="user-profile" style={{ cursor: "default" }}>
                                    <div className="user-avatar">
                                        <img src={radioImage} alt="" />
                                    </div>
                                    <div className="user-info" style={{ marginLeft: "16px" }}>
                                        <div className="user-name" style={{ textAlign: "left", maxWidth: "400px", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{isPlaying ? radioSongName : `Radio Paused`}</div>
                                        <div className="user-role" style={{ textAlign: "left" }}>{isPlaying ? <FontAwesomeIcon icon={faCirclePause} style={{ cursor: "pointer" }} onClick={() => { setIsPlaying(false); }} /> : <FontAwesomeIcon icon={faCirclePlay} style={{ cursor: "pointer" }} onClick={() => { setIsPlaying(true); }} />} {radioName}</div>
                                    </div>
                                    <audio ref={radioRef}>
                                        <source src={radioURL} type="audio/mp3" />
                                        Your browser does not support the audio element.
                                    </audio>
                                </div>}
                        </Box>
                        <div className="user-profile" onClick={handleProfileMenuOpen}>
                            <div className="user-info">
                                <div className="user-name">{vars.userBanner.name}</div>
                                <div className="user-role">{vars.userBanner.role}</div>
                            </div>
                            <div className="user-avatar">
                                <img src={vars.userBanner.avatar} alt="" />
                            </div>
                        </div>
                        {vars.isLoggedIn && loggedInBtns}
                    </Toolbar>
                </AppBar>
                <LinearProgress ref={progressBarRef} sx={{ ...progressBarStyle, top: "80px", position: "fixed", zIndex: 101, display: loading ? "block" : "none", '& .MuiLinearProgress-barColorPrimary': { backgroundColor: theme.palette.info.main } }} />
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
        </div >
    );
};

TopBar.propTypes = {
    sidebarWidth: PropTypes.number,
};

export default TopBar;