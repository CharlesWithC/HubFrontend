import { useState, useEffect, useRef, useCallback, useContext } from "react";
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '../context';

import { AppBar, Box, Toolbar, Typography, Divider, MenuItem, ListItemIcon, Menu, Snackbar, Alert, LinearProgress, IconButton, Tooltip, useTheme, useMediaQuery } from "@mui/material";
import { AccountBoxRounded, SettingsRounded, FlareRounded, LogoutRounded, MenuRounded, AltRouteRounded } from '@mui/icons-material';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlay, faCirclePause, faClover, faDownload } from '@fortawesome/free-solid-svg-icons';
import { faSpotify } from '@fortawesome/free-brands-svg-icons';

import SimpleBar from 'simplebar-react';

import NotificationsPopover from './notifications';
import UserCard from './usercard';

import { FetchProfile, customAxios as axios, getAuthToken, eraseAuthMode } from "../functions";

const radioURLs = { "tsr": "https://oreo.truckstopradio.co.uk/radio/8000/radio.mp3", "tfm": "https://live.truckers.fm/", "simhit": "https://radio.simulatorhits.com/radio/8000/stream" };
const radioNames = { "tsr": "TruckStopRadio", "tfm": "TruckersFM", "simhit": "SimulatorHits" };
const radioImages = { "tsr": "https://truckstopradio.co.uk/autodj.png", "tfm": "https://truckersfm.s3.fr-par.scw.cloud/static/tfm-2020.png", "simhit": "https://simulatorhits.com/images/SH_Logo.jpg" };

const TopBar = (props) => {
    const { t: tr } = useTranslation();
    const { apiPath, userLevel, webConfig, setUsers, curUID, setCurUID, curUser, setCurUser, setCurUserPerm, curUserBanner, userSettings, setUserSettings } = useContext(AppContext);

    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isSm = useMediaQuery(theme.breakpoints.down('sm'));

    const [snackbarContent, setSnackbarContent] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const handleCloseSnackbar = () => {
        setSnackbarContent("");
    };
    const [showProfileModal, setShowProfileModal] = useState(1);

    const sleep = ms => new Promise(
        resolve => setTimeout(resolve, ms)
    );

    const [downloadUrl, setDownloadUrl] = useState("https://dl.chub.page/general/setup.exe");
    useEffect(() => {
        fetch(`https://dl.chub.page/${webConfig.abbr}/latest.yml`)
            .then(response => {
                if (response.ok) {
                    setDownloadUrl(`https://dl.chub.page/${webConfig.abbr}/setup.exe`);
                }
            })
            .catch(error => console.log(error));
    }, [webConfig]);

    const radioRef = useRef(null);
    const [radioURL, setRadioURL] = useState("");
    const [radioImage, setRadioImage] = useState("");
    const [radioSongName, setRadioSongName] = useState(tr("now_playing"));
    const [radioName, setRadioName] = useState(tr("no_radio"));
    const [radioSpotifyId, setRadioSpotifyId] = useState(undefined);
    const [isPlaying, setIsPlaying] = useState(false);
    const loadRadio = useCallback(async () => {
        if (userSettings.radio !== "disabled") {
            let radioOK = false;
            if (userLevel < 2 && userSettings.radio_type !== "tsr" || userLevel < 4 && !Object.keys(RADIO_TYPES).includes(userSettings.radio_type)) {
                setUserSettings(userSettings => ({ ...userSettings, radio_type: "tsr" }));
            }
            if (Object.keys(radioURLs).includes(userSettings.radio_type)) {
                setRadioURL(radioURLs[userSettings.radio_type]);
                setRadioName(radioNames[userSettings.radio_type]);
                setRadioImage(radioImages[userSettings.radio_type]);
                setRadioSpotifyId(undefined);
                navigator.mediaSession.metadata = new MediaMetadata({
                    title: radioNames[userSettings.radio_type],
                    artwork: [
                        { src: radioImages[userSettings.radio_type], sizes: '256x256', type: 'image/jpeg' }
                    ]
                });
                radioOK = true;
            } else {
                try {
                    new URL(userSettings.radio_type);
                    setRadioSpotifyId(undefined);
                    setRadioURL(userSettings.radio_type);
                    setRadioName(tr("custom_radio"));
                    setRadioImage("./logo.png");
                    navigator.mediaSession.metadata = new MediaMetadata({
                        title: tr("custom_radio"),
                        artwork: [
                            { src: "./logo.png", sizes: '500x500', type: 'image/jpeg' }
                        ]
                    });
                    radioOK = true;
                } catch {
                    // invalid url
                    console.error(`Invalid Radio URL: ${userSettings.radio_type}`);
                }
            }

            if (userSettings.radio === "auto" && radioOK) {
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
            setRadioSpotifyId(undefined);
        }
    }, [userSettings.radio, userSettings.radio_type]);
    useEffect(() => {
        if (radioRef.current !== null) {
            try {
                if (isPlaying) {
                    radioRef.current.load();
                    radioRef.current.play();
                } else {
                    radioRef.current.pause();
                }
            } catch {
                setRadioSongName(tr("failed_to_play"));
            }
        }
    }, [isPlaying]);
    useEffect(() => {
        const interval = setInterval(async () => {
            if (radioRef.current !== null && !radioRef.current.paused) {
                try {
                    if (userLevel < 2 && userSettings.radio_type !== "tsr" || userLevel < 4 && !Object.keys(RADIO_TYPES).includes(userSettings.radio_type)) {
                        setUserSettings(userSettings => ({ ...userSettings, radio_type: "tsr" }));
                    }
                    if (userSettings.radio_type === "tsr") {
                        let resp = await axios({ url: `https://tsr-static.omnibyte.tech/cache.php?url=https://panel.truckstopradio.co.uk/api/v1/song-history/now-playing` });
                        setRadioSongName(resp.data.song.title);
                        if (!userSettings.data_saver) setRadioImage(resp.data.song.graphic.medium);
                        else setRadioImage(radioImages[userSettings.radio_type]);
                        setRadioSpotifyId(resp.data.song.extraInfo.track.external_urls.spotify.split("/").pop());
                        navigator.mediaSession.metadata = new MediaMetadata({
                            title: resp.data.song.title,
                            artist: resp.data.song.artist,
                            album: resp.data.song.album,
                            artwork: userSettings.data_saver ? [] : [
                                { src: resp.data.song.graphic.medium, sizes: '300x300', type: 'image/jpeg' }
                            ]
                        });
                    } else if (userSettings.radio_type === "tfm") {
                        let resp = await axios({ url: `https://radiocloud.pro/api/public/v1/song/current` });
                        setRadioSongName(resp.data.data.title);
                        if (!userSettings.data_saver) setRadioImage(resp.data.data.album_art);
                        else setRadioImage(radioImages[userSettings.radio_type]);
                        setRadioSpotifyId(resp.data.data.link.split("/").pop());
                        navigator.mediaSession.metadata = new MediaMetadata({
                            title: resp.data.data.title,
                            artist: resp.data.data.artist,
                            artwork: userSettings.data_saver ? [] : [
                                { src: resp.data.data.album_art, sizes: '300x300', type: 'image/jpeg' }
                            ]
                        });
                    } else if (userSettings.radio_type === "simhit") {
                        let resp = await axios({ url: `https://api.simulatorhits.com/now-playing` });
                        setRadioSongName(resp.data.song.title);
                        if (!userSettings.data_saver) setRadioImage(resp.data.song.artwork);
                        else setRadioImage(radioImages[userSettings.radio_type]);
                        setRadioSpotifyId(resp.data.song.identifier.spotify);
                        navigator.mediaSession.metadata = new MediaMetadata({
                            title: resp.data.song.title,
                            artist: resp.data.song.artist,
                            artwork: userSettings.data_saver ? [] : [
                                { src: resp.data.song.artwork, sizes: '640x640', type: 'image/jpeg' }
                            ]
                        });
                    }
                } catch {
                    console.error(tr("error_updating_radio_metadata"));
                }
            }
        }, 10000);
        return () => { clearInterval(interval); };
    }, [userSettings]);
    useEffect(() => {
        loadRadio();
    }, [userSettings.radio]);
    useEffect(() => {
        window.addEventListener("radioUpdated", loadRadio);
        return () => {
            window.removeEventListener("radioUpdated", loadRadio);
        };
    }, []);
    useEffect(() => {
        const handleRadioTypeUpdate = async () => {
            setRadioSongName(tr("now_playing"));
            setRadioSpotifyId(undefined);
            await loadRadio();
            try {
                radioRef.current.load();
                radioRef.current.play();
            } catch {
                setRadioSongName(tr("failed_to_play"));
            }
        };
        window.addEventListener("radioTypeUpdated", handleRadioTypeUpdate);
        return () => {
            window.removeEventListener("radioTypeUpdated", handleRadioTypeUpdate);
        };
    }, []);
    async function handleRadioVolumeUpdate() {
        radioRef.current.volume = userSettings.radio_volume / 100;
        radioRef.current.play();
    };
    useEffect(() => {
        window.addEventListener("radioVolumeUpdated", handleRadioVolumeUpdate);
        return () => {
            window.removeEventListener("radioVolumeUpdated", handleRadioVolumeUpdate);
        };
    }, []);
    useEffect(() => {
        const intervalId = setInterval(() => {
            if (radioRef.current && radioRef.current.paused) {
                setIsPlaying(false);
            } else {
                setIsPlaying(true);
            }
        }, 1000);

        return () => {
            clearInterval(intervalId);
        };
    }, []);

    const [anchorEl, setAnchorEl] = useState(null);
    const isMenuOpen = Boolean(anchorEl);
    const handleProfileMenuOpen = (event) => {
        if (curUID === null) {
            navigate("/auth/login");
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
        let intervalId = setInterval(() => {
            if (window.loading > 0) {
                setLoading(true);
            } else if (window.loading <= 0) {
                setLoading(false);
                window.loading = 0;
            }
        }, 50);

        return () => {
            clearInterval(intervalId);
        };
    }, []);
    useEffect(() => {
        window.loading = 0;
    }, [location.pathname]);

    const openProfileModal = () => { setShowProfileModal(2); };

    const logout = useCallback(async () => {
        const bearerToken = getAuthToken();
        eraseAuthMode();
        if (bearerToken === null) {
            setSnackbarSeverity("error");
            setSnackbarContent(tr("already_logged_out"));
            return;
        }
        setSnackbarSeverity("info");
        setSnackbarContent(tr("logging_out_please_wait"));
        setLoading(true);
        try {
            let resp = await axios({ url: `${apiPath}/token`, headers: { "Authorization": `Bearer ${bearerToken}` }, method: `DELETE` });
            localStorage.removeItem("token");
            navigate("/");
            if (parseInt(resp.status / 100) === 2) {
                setSnackbarSeverity("success");
                setSnackbarContent(tr("you_are_logged_out"));
            } else {
                setSnackbarSeverity("error");
                setSnackbarContent(tr("already_logged_out"));
            }
            await FetchProfile({ setUsers, setCurUID, setCurUser, setCurUserPerm }); // loadMemberUIDs not needed
        } catch (error) {
            console.error(error);
            setSnackbarSeverity("error");
            setSnackbarContent(tr("error_occurred"));
        }
        setLoading(false);
        const reloadSideBar = new CustomEvent('reloadSideBar', {});
        window.dispatchEvent(reloadSideBar);
    }, [apiPath]);

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
        {curUser.userid !== -1 && curUser.userid !== null && <MenuItem onClick={openProfileModal}><ListItemIcon><AccountBoxRounded fontSize="small" /></ListItemIcon>{tr("profile")}</MenuItem>}
        <Link to="/settings"><MenuItem><ListItemIcon><SettingsRounded fontSize="small" /></ListItemIcon>{tr("settings")}</MenuItem></Link>
        <Divider sx={{ marginTop: "5px", marginBottom: "5px" }} />
        <Link to="/sponsor"><MenuItem sx={{ color: '#FFC400' }}><ListItemIcon><FlareRounded fontSize="small" /></ListItemIcon>{tr("sponsor")}</MenuItem></Link>
        <Link to="/supporters"><MenuItem sx={{ color: '#f47fff' }}><ListItemIcon><FontAwesomeIcon icon={faClover} style={{ marginLeft: "3px" }} /></ListItemIcon>{tr("supporters")}</MenuItem></Link>
        {!window.isElectron && <>
            <Divider sx={{ marginTop: "5px", marginBottom: "5px" }} />
            <MenuItem onClick={() => { window.location.href = downloadUrl; }}><ListItemIcon><FontAwesomeIcon icon={faDownload} /></ListItemIcon>{tr("download_app")}</MenuItem>
        </>}
        <Divider sx={{ marginTop: "5px", marginBottom: "5px" }} />
        <MenuItem onClick={logout}><ListItemIcon><LogoutRounded fontSize="small" /></ListItemIcon>{tr("logout")}</MenuItem>
    </Menu>);

    return (
        <div do-reload={reload}>
            <UserCard user={curUser} showProfileModal={showProfileModal} onProfileModalClose={() => { setShowProfileModal(1); }} />
            <Box sx={{ flexGrow: 1 }}>
                <AppBar ref={appBarRef} position="static"
                    sx={{
                        backgroundColor: theme.palette.background.default,
                        width: { sm: `calc(100% - ${props.sidebarWidth}px)` },
                        ml: { sm: `${props.sidebarWidth}px` },
                        position: "fixed",
                        zIndex: "100"
                    }}>
                    <SimpleBar style={{
                        width: `calc(100vw${isSm ? '' : ` - ${props.sidebarWidth}px`})`,
                        maxWidth: `calc(100vw${isSm ? '' : ` - ${props.sidebarWidth}px`})`
                    }}>
                        <Toolbar>
                            <Box sx={{ display: "flex", flexGrow: 1, alignItems: "center" }}>
                                <Typography variant="body2">
                                    {isSm && <IconButton onClick={() => {
                                        const toggleSidebar = new CustomEvent('toggleSidebar', {});
                                        window.dispatchEvent(toggleSidebar);
                                    }}><MenuRounded /></IconButton>}
                                    {curUID !== null && <NotificationsPopover />}
                                    {curUID === null && window.isElectron && localStorage.getItem("locked") !== "true" && <Tooltip placement="top" arrow title={tr("switch_drivers_hub")} PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, -10] } }] }}>
                                        <IconButton onClick={() => { localStorage.removeItem("domain"); window.location.reload(); }}><AltRouteRounded /></IconButton>
                                    </Tooltip>}
                                </Typography>
                                {radioURL !== "" &&
                                    <div className="user-profile" style={{ cursor: "default" }}>
                                        <div className="user-avatar">
                                            <img src={radioImage} alt="" />
                                        </div>
                                        <div className="user-info" style={{ marginLeft: "16px" }}>
                                            <div className="user-name" style={{ textAlign: "left", maxWidth: "400px", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{isPlaying ? radioSongName : `Radio Paused`}</div>
                                            <div className="user-role" style={{ textAlign: "left" }}>{isPlaying ? <FontAwesomeIcon icon={faCirclePause} style={{ cursor: "pointer" }} onClick={() => { setIsPlaying(false); }} /> : <FontAwesomeIcon icon={faCirclePlay} style={{ cursor: "pointer" }} onClick={() => { setIsPlaying(true); }} />} {radioSpotifyId !== undefined && <FontAwesomeIcon icon={faSpotify} style={{ cursor: "pointer" }} onClick={() => { window.location.href = `spotify:track:${radioSpotifyId}`; }} />} {radioName}</div>
                                        </div>
                                        <audio ref={radioRef}>
                                            <source src={radioURL} type="audio/mp3" />{tr("browser_does_not_support_audio")}</audio>
                                    </div>}
                            </Box>
                            <div className="user-profile" onClick={handleProfileMenuOpen}>
                                <div className="user-info">
                                    <div className="user-name">{curUserBanner.name}</div>
                                    <div className="user-role">{curUserBanner.role}</div>
                                </div>
                                <div className="user-avatar" style={{ position: 'relative' }}>
                                    <img src={curUserBanner.avatar} alt="" style={{ width: '100%', height: '100%' }} />
                                    {+new Date() >= 1703203200000 && +new Date() <= 1704412800000 && <img src="/images/avatar-light-bulb-square.png" alt="" style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%' }} />}
                                </div>
                            </div>
                            {curUID !== null && loggedInBtns}
                        </Toolbar>
                    </SimpleBar>
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

export default TopBar;