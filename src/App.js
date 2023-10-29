import './App.css';
import { useMemo, useState, useEffect, useCallback } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from "@mui/material/CssBaseline";
import { useLocation, Routes, Route, useNavigate } from 'react-router-dom';
import { Card, CardContent, Typography, Button, Grid, Dialog, DialogActions, DialogTitle, DialogContent, useTheme } from '@mui/material';

import AuthLogin from './routes/auth/login';
import TokenAuth from './routes/auth/tokenAuth';
import DiscordAuth from './routes/auth/discordAuth';
import SteamAuth from './routes/auth/steamAuth';
import MfaAuth from './routes/auth/mfaAuth';
import EmailAuth from './routes/auth/emailAuth';
import Loader from './components/loader';
import Redirect from './components/redirect';
import UpgradeCard from './routes/sponsor';
import Overview from './routes/overview';
import Announcement from './routes/announcements';
import Downloads from './routes/downloads';
import Map from './routes/map';
import Deliveries from './routes/deliveries';
import Delivery from './routes/delivery';
import Events from './routes/events';
import Challenges from './routes/challenges';
import Divisions from './routes/divisions';
import Members from './routes/members';
import Leaderboard from './routes/leaderboard';
import Ranking from './routes/ranking';
import NewApplication from './routes/applicationNew';
import MyApplication from './routes/applicationMy';
import AllApplication from './routes/applicationAll';
import MemberList from './routes/memberList';
import ExternalUsers from './routes/externalUsers';
import AuditLog from './routes/auditLog';
import Configuration from './routes/configuration';
import Settings from './routes/settings';
import Notifications from './routes/notifications';
import Poll from './routes/polls';
import Economy from './routes/economy';
import Supporters from './routes/supporters';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClover, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';

import { getDesignTokens } from './designs';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';

import TopBar from './components/topbar';
import SideBar from './components/sidebar';

var vars = require('./variables');

const drivershub = `    ____       _                         __  __      __
   / __ \\_____(_)   _____  __________   / / / /_  __/ /_
  / / / / ___/ / | / / _ \\/ ___/ ___/  / /_/ / / / / __ \\
 / /_/ / /  / /| |/ /  __/ /  (__  )  / __  / /_/ / /_/ /
/_____/_/  /_/ |___/\\___/_/  /____/  /_/ /_/\\__,_/_.___/
                                                      `;

function App() {
    useEffect(() => {
        console.log(drivershub);
        console.log("Drivers Hub: Frontend");
        console.log(`Copyright (C) ${new Date().getFullYear()} CharlesWithC All rights reserved.`);
        console.log("This is the beta build. Functions may be updated or removed.");
    }, []);

    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const [themeMode, updateThemeMode] = useState(vars.userSettings.theme === "auto" ? (prefersDarkMode ? 'dark' : 'light') : vars.userSettings.theme);
    const muiTheme = { "dark": "dark", "light": "light", "halloween": "dark" };
    const [designTokens, setDesignTokens] = useState(getDesignTokens(themeMode, muiTheme[themeMode], vars.userSettings.use_custom_theme, vars.userSettings.theme_background, vars.userSettings.theme_main, vars.userSettings.theme_darken_ratio));
    const theme = useMemo(
        () => createTheme(designTokens, muiTheme[themeMode]),
        [designTokens, themeMode],
    );
    const uTheme = useTheme();
    const isMd = useMediaQuery(uTheme.breakpoints.up('md'));

    useEffect(() => {
        const handleUpdateTheme = () => {
            const tm = vars.userSettings.theme === "auto" ? (prefersDarkMode ? 'dark' : 'light') : vars.userSettings.theme;
            updateThemeMode(tm);
            setDesignTokens(getDesignTokens(tm, muiTheme[tm], vars.userSettings.use_custom_theme, vars.userSettings.theme_background, vars.userSettings.theme_main, vars.userSettings.theme_darken_ratio));
        };
        window.addEventListener("themeUpdated", handleUpdateTheme);
        return () => {
            window.removeEventListener("themeUpdated", handleUpdateTheme);
        };
    }, [updateThemeMode]);

    const [, setRerender] = useState(false);

    const runRerender = () => {
        setTimeout(function () { setRerender(true); }, 500);
    };

    const [aboutCHubModal, setAboutCHubModal] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarForceHidden, setSidebarForceHidden] = useState(false);
    const [sidebarHidden, setSidebarHidden] = useState(window.innerWidth < 600);
    const [topbarHidden, setTopbarHidden] = useState(false);
    useEffect(() => {
        const handle = () => {
            if (["/auth", "/auth/login", "/auth/email", "/auth/discord/callback", "/auth/discord/redirect", "/auth/steam/callback", "/auth/steam/redirect", "/auth/mfa"].includes(location.pathname)) {
                setSidebarForceHidden(true);
                setSidebarHidden(true);
                setTopbarHidden(true);
            } else {
                setSidebarForceHidden(false);
                if (window.innerWidth >= 600) {
                    setSidebarHidden(false);
                } else {
                    setSidebarHidden(true);
                }
                setTopbarHidden(false);
            }
        };
        handle();
        window.addEventListener('resize', handle);
        return () => {
            window.removeEventListener('resize', handle);
        };
    }, [location.pathname]);

    const protocol = window.location.protocol.replace(":", "");

    const [cookieSettings, setCookieSettings] = useState(localStorage.getItem("cookie-settings"));
    const updateCookieSettings = useCallback((settings) => {
        setCookieSettings(settings);
        localStorage.setItem("cookie-settings", settings);
    }, []);
    useEffect(() => {
        if (cookieSettings === "analytical") {
            const script = document.createElement('script');
            script.src = 'https://www.googletagmanager.com/gtag/js?id=G-SLZ5TY9MVN';
            script.async = true;
            document.head.appendChild(script);

            window.dataLayer = window.dataLayer || [];
            function gtag() { window.dataLayer.push(arguments); }
            gtag('js', new Date());
            gtag('config', 'G-SLZ5TY9MVN');
        }
    }, [cookieSettings]);

    if (vars.dhconfig == null) {
        return (
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Loader onLoaderLoaded={runRerender} />
            </ThemeProvider>)
            ;
    } else {
        return (
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {!topbarHidden &&
                    <TopBar sidebarWidth={260}></TopBar>
                }
                {!sidebarForceHidden &&
                    <SideBar width={260}></SideBar>
                }
                {/* For mobile view, use a "menu button" on topbar, click it to show a full-width sidebar, without banner on top and with a close button on top */}
                <div style={(!sidebarHidden && { position: "relative", left: "260px", top: !topbarHidden ? "80px" : "0", width: "calc(100vw - 260px)", height: !topbarHidden ? "calc(100vh - 80px)" : "100vh", overflow: "hidden" })
                    || (sidebarHidden && { position: "relative", left: "0", top: !topbarHidden ? "80px" : "0", width: "calc(100vw)", height: !topbarHidden ? "calc(100vh - 80px)" : "100vh", overflow: "hidden" })}>
                    {cookieSettings === null && !sidebarForceHidden && <>
                        <Card sx={{ position: "fixed", zIndex: 100000, bottom: "10px", right: "10px", width: window.innerWidth <= 420 ? "calc(100vw - 20px) !important" : "400px" }}>
                            <CardContent>
                                <Typography variant="h6">
                                    We value your privacy
                                </Typography>
                                <Typography variant="body2" sx={{ marginBottom: "10px" }}>
                                    We use necessary cookies for smooth functionality and rely on Google Analytics to anonymously track user interactions, helping us improve the site.<br />
                                    By clicking "Accept", you consent to analytical cookie usage. Otherwise only essential cookies will be used.
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={12} md={6} lg={6}>
                                        <Button onClick={() => { updateCookieSettings("analytical"); }} variant="contained" color="success" sx={{ width: "100%" }}>
                                            Accept
                                        </Button>
                                    </Grid>
                                    <Grid item xs={12} sm={12} md={6} lg={6}>
                                        <Button onClick={() => { updateCookieSettings("essential"); }} variant="contained" color="secondary" sx={{ width: "100%" }}>
                                            Decline
                                        </Button>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </>}
                    <SimpleBar style={{ padding: "20px", height: "100%", backgroundColor: theme.palette.background.default }} >
                        <Routes>
                            <Route path="/auth/login" element={<AuthLogin />} />
                            <Route path="/auth" element={<TokenAuth />} />
                            <Route path="/auth/discord/callback" element={<DiscordAuth />} />
                            {vars.discordClientID !== 1120997206938361877 && <Route path="/auth/discord/redirect" element={<Redirect to={`https://discord.com/oauth2/authorize?client_id=${vars.discordClientID}&redirect_uri=${protocol}%3A%2F%2F${window.location.host}%2Fauth%2Fdiscord%2Fcallback&response_type=code&scope=identify email role_connections.write`} />} />}
                            {vars.discordClientID === 1120997206938361877 && <Route path="/auth/discord/redirect" element={<Redirect to={`https://shared-discord-application.chub.page/discord-auth?domain=${window.location.host}`} />} />}
                            <Route path="/auth/steam/callback" element={<SteamAuth />} />
                            <Route path="/auth/steam/redirect" element={<Redirect to={`https://steamcommunity.com/openid/loginform/?goto=%2Fopenid%2Flogin%3Fopenid.ns%3Dhttp%253A%252F%252Fspecs.openid.net%252Fauth%252F2.0%26openid.mode%3Dcheckid_setup%26openid.return_to%3D${protocol}%253A%252F%252F${window.location.host}%252Fauth%252Fsteam%252Fcallback%26openid.realm%3D${protocol}%253A%252F%252F${window.location.host}%252Fauth%252Fsteam%252Fcallback%26openid.identity%3Dhttp%253A%252F%252Fspecs.openid.net%252Fauth%252F2.0%252Fidentifier_select%26openid.claimed_id%3Dhttp%253A%252F%252Fspecs.openid.net%252Fauth%252F2.0%252Fidentifier_select%3Fopenid.ns%3Dhttp%253A%252F%252Fspecs.openid.net%252Fauth%252F2.0%26openid.mode%3Dcheckid_setup%26openid.return_to%3D${protocol}%253A%252F%252F${window.location.host}%252Fauth%252Fsteam%252Fcallback%26openid.realm%3D${protocol}%253A%252F%252F${window.location.host}%252Fauth%252Fsteam%252Fcallback%26openid.identity%3Dhttp%253A%252F%252Fspecs.openid.net%252Fauth%252F2.0%252Fidentifier_select%26openid.claimed_id%3Dhttp%253A%252F%252Fspecs.openid.net%252Fauth%252F2.0%252Fidentifier_select`} />} />
                            <Route path="/auth/mfa" element={<MfaAuth />} />
                            <Route path="/auth/email" element={<EmailAuth />} />
                            <Route path="/" exact element={<Overview />}></Route>
                            <Route path="/overview" element={<Overview />}></Route>
                            <Route path="/sponsor" element={<UpgradeCard />}></Route>
                            <Route path="/announcement" element={<Announcement />}></Route>
                            <Route path="/downloads" element={<Downloads />}></Route>
                            <Route path="/map" element={<Map />}></Route>
                            <Route path="/delivery" element={<Deliveries />}></Route>
                            <Route path="/delivery/:logid" element={<Delivery />} />
                            <Route path="/event" element={<Events />}></Route>
                            <Route path="/challenge" element={<Challenges />}></Route>
                            <Route path="/division" element={<Divisions />}></Route>
                            <Route path="/member" element={<Members />}></Route>
                            <Route path="/leaderboard" element={<Leaderboard />}></Route>
                            <Route path="/ranking" element={<Ranking />}></Route>
                            <Route path="/application/new" element={<NewApplication />}></Route>
                            <Route path="/apply" element={<NewApplication />}></Route>
                            <Route path="/application/my" element={<MyApplication />}></Route>
                            <Route path="/application/all" element={<AllApplication />}></Route>
                            <Route path="/member-list" element={<MemberList />}></Route>
                            <Route path="/external-user" element={<ExternalUsers />}></Route>
                            <Route path="/audit-log" element={<AuditLog />}></Route>
                            <Route path="/config" element={<Configuration />}></Route>
                            <Route path="/settings" element={<Settings />}></Route>
                            <Route path="/notifications" element={<Notifications />}></Route>
                            <Route path="/poll" element={<Poll />}></Route>
                            <Route path="/economy" element={<Economy />}></Route>
                            <Route path="/supporters" element={<Supporters />}></Route>
                        </Routes>
                        <Dialog open={aboutCHubModal} onClose={() => setAboutCHubModal(false)}>
                            <DialogTitle>About The Drivers Hub Project (CHub)</DialogTitle>
                            <DialogContent>
                                <Typography variant="body2">
                                    The website you are currently using is a <b>Drivers Hub</b>, a portal for VTCs, enhancing community experience and making management easier.
                                </Typography>
                                <br />
                                <Typography variant="body2">
                                    The project is developed and owned by <b>CharlesWithC</b>, operated under the name of CHub, or The Drivers Hub Project.
                                </Typography>
                                <br />
                                <Typography variant="body2">
                                    CHub is a SaaS service which you may subscribe, starting your own Drivers Hub. You may visit our <a href="https://drivershub.charlws.com/" target="_blank" rel="noreferrer">website (drivershub.charlws.com)</a> to know more.
                                </Typography>
                                <br />
                                <Typography variant="body2">
                                    <b>Some useful links:</b>&nbsp;&nbsp;
                                    <a href="https://drivershub.charlws.com/" target="_blank" rel="noreferrer">Website</a>&nbsp;&nbsp;
                                    <a href="https://wiki.charlws.com/books/chub" target="_blank" rel="noreferrer">Wiki</a>&nbsp;&nbsp;
                                    <a href="https://discord.gg/KRFsymnVKm" target="_blank" rel="noreferrer">Discord</a>&nbsp;&nbsp;
                                    <a href="https://twitter.com/CHub_DH" target="_blank" rel="noreferrer">Twitter</a>
                                    <br />
                                </Typography>
                                <Typography variant="body2">
                                    <b>Our partners:</b>&nbsp;&nbsp;
                                    <a href="https://truckyapp.com/" target="_blank" rel="noreferrer">Trucky</a>&nbsp;&nbsp;
                                    <a href="https://truckstopradio.co.uk/" target="_blank" rel="noreferrer">TruckStopRadio</a>&nbsp;&nbsp;
                                    <a href="https://discord.gg/trucksim" target="_blank" rel="noreferrer">/r/trucksim</a>&nbsp;&nbsp;
                                    <a href="https://ocsc-event.com/" target="_blank" rel="noreferrer">OCSC Event</a>&nbsp;&nbsp;
                                </Typography>
                                <br />
                                <Typography variant="body2">
                                    Thanks for reading these. You may close the modal dialog and enjoy the Drivers Hub now!
                                </Typography>
                            </DialogContent>
                            <DialogActions>
                                <Button variant="primary" onClick={() => { setAboutCHubModal(false); }}>Close</Button>
                            </DialogActions>
                        </Dialog>
                        <footer style={{ display: ["/auth", "/auth/login", "/auth/email", "/auth/discord/callback", "/auth/discord/redirect", "/auth/steam/callback", "/auth/steam/redirect", "/auth/mfa"].includes(location.pathname) ? "none" : "block" }}>
                            {isMd && <div style={{ display: 'flex', alignItems: 'center', marginTop: "20px", color: theme.palette.text.secondary }}>
                                <Typography variant="body2" sx={{ flexGrow: 1, fontWeight: 800 }}>
                                    &copy; {new Date().getFullYear()} <a href="https://charlws.com/" target="_blank" rel="noreferrer">CharlesWithC</a>
                                    <br />
                                    <a href="https://drivershub.charlws.com/" target="_blank" rel="noreferrer">The Drivers Hub Project (CHub)</a>  <FontAwesomeIcon icon={faQuestionCircle} onClick={() => { setAboutCHubModal(true); }} style={{ cursor: "pointer" }} /> <FontAwesomeIcon icon={faClover} onClick={() => { navigate("/supporters"); }} style={{ cursor: "pointer" }} />
                                </Typography>
                                <Typography variant="body2" sx={{ marginLeft: "auto", alignSelf: 'flex-end', textAlign: "right", fontWeight: 800 }}>
                                    {vars.dhconfig.name}
                                    <br />
                                    API: v{vars.apiversion} | Client: v3.0.1
                                </Typography>
                            </div>}
                            {!isMd && <div style={{ alignItems: 'center', marginTop: "20px", color: theme.palette.text.secondary }}>
                                <Typography variant="body2" sx={{ fontWeight: 800 }}>
                                    &copy; {new Date().getFullYear()} <a href="https://charlws.com/" target="_blank" rel="noreferrer">CharlesWithC</a>
                                    <br />
                                    API: v{vars.apiversion} | Client: v3.0.1
                                    <br />
                                    <a href="https://drivershub.charlws.com/" target="_blank" rel="noreferrer">The Drivers Hub Project (CHub)</a>  <FontAwesomeIcon icon={faQuestionCircle} onClick={() => { setAboutCHubModal(true); }} style={{ cursor: "pointer" }} /> <FontAwesomeIcon icon={faClover} onClick={() => { navigate("/supporters"); }} style={{ cursor: "pointer" }} />
                                </Typography>
                            </div>}
                        </footer>
                    </SimpleBar>
                </div>
            </ThemeProvider >
        );
    }
}

export default App;
