import { useMemo, useState, useEffect, useCallback, useContext } from 'react';
import { useLocation, Routes, Route, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from './i18n';
import { AppContext, ThemeContext } from './context';

import { Card, CardContent, Typography, Button, Grid, Dialog, DialogActions, DialogTitle, DialogContent, useTheme, useMediaQuery, createTheme, ThemeProvider, CssBaseline } from '@mui/material';

import BrowserAuth from './components/browserAuth';
import AuthLogin from './routes/auth/login';
import TokenAuth from './routes/auth/token';
import DiscordAuth from './routes/auth/discord/callback';
import SteamAuth from './routes/auth/steam/callback';
import PatreonAuth from './routes/auth/patreon/callback';
import MfaAuth from './routes/auth/mfa';
import EmailAuth from './routes/auth/email';
import Loader from './components/loader';
import Redirect from './components/redirect';
import UpgradeCard from './routes/sponsor';
import Overview from './routes/overview';
import Statistics from './routes/statistics';
import Gallery from './routes/gallery';
import Announcement from './routes/announcement';
import Downloads from './routes/downloads';
import Map from './routes/map';
import Deliveries from './routes/delivery-list';
import Delivery from './routes/delivery';
import Events from './routes/event';
import Challenges from './routes/challenge';
import Divisions from './routes/division';
import Members from './routes/member';
import Leaderboard from './routes/leaderboard';
import Ranking from './routes/ranking';
import FreightMaster from './routes/freightmaster';
import NewApplication from './routes/application/new';
import MyApplication from './routes/application/my';
import AllApplication from './routes/application/all';
import MemberList from './routes/member-list';
import ExternalUsers from './routes/external-user';
import AuditLog from './routes/audit-log';
import Configuration from './routes/config';
import Settings from './routes/settings';
import Notifications from './routes/notifications';
import Poll from './routes/poll';
import Economy from './routes/economy';
import Supporters from './routes/supporters';
import Badges from './routes/badges';
import NotFound from './routes/404';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';

import { getDesignTokens } from './designs';
import './App.css';

import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';

import TopBar from './components/topbar';
import SideBar from './components/sidebar';

import { readLS, writeLS } from './functions.js';

const drivershub = `    ____       _                         __  __      __
   / __ \\_____(_)   _____  __________   / / / /_  __/ /_
  / / / / ___/ / | / / _ \\/ ___/ ___/  / /_/ / / / / __ \\
 / /_/ / /  / /| |/ /  __/ /  (__  )  / __  / /_/ / /_/ /
/_____/_/  /_/ |___/\\___/_/  /____/  /_/ /_/\\__,_/_.___/
                                                      `;

function App() {
    const { t: tr } = useTranslation();
    const { vtcBackground, customBackground, vtcLevel, userLevel, apiConfig, webConfig, userSettings, setUserSettings } = useContext(AppContext);
    const { themeSettings, setThemeSettings } = useContext(ThemeContext);

    useEffect(() => {
        console.log(drivershub);
        console.log(`Drivers Hub: Frontend`);
        console.log(`Copyright (C) ${new Date().getFullYear()} CharlesWithC All rights reserved.`);
    }, []);

    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const themeMode = useMemo(
        () => (themeSettings.theme === "auto" ? (prefersDarkMode ? 'dark' : 'light') : themeSettings.theme),
        [themeSettings]
    );
    const muiTheme = { "dark": "dark", "light": "light", "halloween": "dark" };
    const designTokens = useMemo(
        () => (getDesignTokens({ vtcBackground, customBackground, vtcLevel, userLevel, webConfig }, { themeSettings, setThemeSettings }, themeMode, muiTheme[themeMode], themeSettings.use_custom_theme, themeSettings.theme_background, themeSettings.theme_main, themeSettings.theme_darken_ratio, themeSettings.font_size)),
        [vtcBackground, customBackground, themeSettings, webConfig]
    );
    const theme = useMemo(
        () => createTheme(designTokens, muiTheme[themeMode]),
        [designTokens, themeMode],
    );
    const uTheme = useTheme();
    const isMd = useMediaQuery(uTheme.breakpoints.up('md'));

    const [showSurveyCard, setShowSurveyCard] = useState(+new Date() <= 1710806399000 && (localStorage.getItem("survey-202402") === null || parseInt(localStorage.getItem("survey-202402")) <= +new Date()));

    if (window.location.hostname === "localhost" && window.location.pathname === "/auth/complete") {
        return <ThemeProvider theme={theme}>
            <BrowserAuth completed={true} />
        </ThemeProvider>;
    }

    if (isElectron && window.location.pathname === "/wait") {
        return <ThemeProvider theme={theme}></ThemeProvider>;
    }

    useEffect(() => {
        if (readLS("client-settings", window.dhhost) !== null) {
            let lsSettings = readLS("client-settings", window.dhhost);

            let sKeys = Object.keys(userSettings);
            for (let i = 0; i < sKeys.length; i++) {
                if (Object.keys(lsSettings).includes(sKeys[i])) {
                    userSettings[sKeys[i]] = lsSettings[sKeys[i]];
                }
            }
            setUserSettings(userSettings);

            sKeys = Object.keys(themeSettings);
            for (let i = 0; i < sKeys.length; i++) {
                if (Object.keys(lsSettings).includes(sKeys[i])) {
                    themeSettings[sKeys[i]] = lsSettings[sKeys[i]];
                }
            }
            setThemeSettings(themeSettings);
        }
        if (userSettings.language !== null) {
            i18n.changeLanguage(userSettings.language);
        }
    }, []);

    const [loaded, setRerender] = useState(false);

    const runRerender = () => {
        setTimeout(function () { setRerender(true); }, 500);
    };

    const [aboutCHubModal, setAboutCHubModal] = useState(false);

    const location = useLocation();
    const [sidebarForceHidden, setSidebarForceHidden] = useState(false);
    const [sidebarHidden, setSidebarHidden] = useState(window.innerWidth < 600);
    const [topbarHidden, setTopbarHidden] = useState(false);
    useEffect(() => {
        const handle = () => {
            if (["/auth", "/auth/login", "/auth/email", "/auth/discord/callback", "/auth/discord/redirect", "/auth/steam/callback", "/auth/steam/redirect", "/auth/patreon/callback", "/auth/mfa"].includes(location.pathname)) {
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

    const [cookieSettings, setCookieSettings] = useState(localStorage.getItem("cookie-settings"));
    const updateCookieSettings = useCallback((settings) => {
        setCookieSettings(settings);
        localStorage.setItem("cookie-settings", settings);
    }, []);
    useEffect(() => {
        if (cookieSettings === "analytical" || window.isElectron) {
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

    const hasSpeedDial = (["/announcement", "/gallery", "/challenge", "/delivery", "/division", "/downloads", "/event", "/leaderboard", "/poll", "/ranking", "/member-list", "/external-user"].includes(location.pathname) || location.pathname.startsWith("/delivery"));

    if (window.isElectron && webConfig !== null) {
        window.electron.ipcRenderer.send("presence-settings", userSettings.presence);

        const STATUS_NAMES = { "/": "Viewing Overview", "/overview": "Viewing Overview", "/statistics": "Viewing Statistics", "/gallery": "Viewing Gallery", "/announcement": "Viewing Announcements", "/downloads": "Viewing Downloads", "/poll": "Viewing Polls", "/map": "Viewing Map", "/delivery": "Viewing Deliveries", "/challenge": "Viewing Challenges", "/division": "Viewing Divisions", "/economy": "Viewing Economy", "/event": "Viewing Events", "/member": "Viewing Members", "/leaderboard": "Viewing Leaderboard", "/ranking": "Viewing Rankings", "/freightmaster": "Viewing FreightMaster™", "/apply": "Submitting Application", "/application/new": "Submitting Application", "/application/my": "Viewing Own Applications", "/application/all": "Viewing All Applications", "/member-list": "Viewing Member List", "/external-user": "Viewing External Users", "/audit-log": "Viewing Audit Log", "/config": "Modifying Configuration", "/settings": "Modifying Settings", "/sponsor": "Sponsoring...", "/supporters": "Viewing Supporters", "/badges": "Viewing Badges", "/notifications": "Viewing Notifications", "/auth": "Logging in..." };
        let path = window.location.pathname;
        if (path.startsWith("/auth")) path = "/auth";
        if (Object.keys(STATUS_NAMES).includes(path)) {
            window.electron.ipcRenderer.send("presence-update", {
                details: STATUS_NAMES[path],
                largeImageKey: `https://cdn.chub.page/assets/${webConfig.abbr}/logo.png?${webConfig.logo_key !== undefined ? webConfig.logo_key : ""}`,
                largeImageText: webConfig.name,
                smallImageKey: `https://drivershub.charlws.com/images/logo.png`,
                smallImageText: "The Drivers Hub Project (CHub)",
                startTimestamp: new Date(),
                instance: false,
                buttons: [
                    { label: 'Visit Drivers Hub', url: `https://${window.dhhost}${window.location.pathname}` },
                    { label: 'Powered by CHub', url: "https://drivershub.charlws.com/" }
                ]
            });
        }
    }

    if (!loaded) {
        return (
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Loader onLoaderLoaded={runRerender} />
            </ThemeProvider>)
            ;
    } else {
        return (
            <ThemeProvider theme={theme}>
                {/* createTheme - opacity controls whether image will be shown*/}
                <div style={{
                    backgroundImage: `url(${themeSettings.bg_image})`,
                    backgroundPosition: 'center',
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    overflow: 'hidden'
                }}>
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
                        {!window.isElectron && cookieSettings === null && !sidebarForceHidden && <>
                            <Card sx={{ position: "fixed", zIndex: 100000, bottom: "10px", right: "10px", width: window.innerWidth <= 420 ? "calc(100vw - 20px) !important" : "400px" }}>
                                <CardContent>
                                    <Typography variant="h6" fontWeight="bold">{tr("we_value_your_privacy")}</Typography>
                                    <Typography variant="body2" sx={{ marginBottom: "10px" }}>{tr("we_use_necessary_cookies_for")}<br />{tr("by_clicking_accept_you_consent")}</Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={12} md={6} lg={6}>
                                            <Button onClick={() => { updateCookieSettings("analytical"); }} variant="contained" color="success" sx={{ width: "100%" }}>{tr("accept")}</Button>
                                        </Grid>
                                        <Grid item xs={12} sm={12} md={6} lg={6}>
                                            <Button onClick={() => { updateCookieSettings("essential"); }} variant="contained" color="secondary" sx={{ width: "100%" }}>{tr("decline")}</Button>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </>}
                        {showSurveyCard && !(!window.isElectron && cookieSettings === null) && !sidebarForceHidden && <>
                            <Card sx={{ position: "fixed", zIndex: 100000, bottom: "10px", right: "10px", width: window.innerWidth <= 420 ? "calc(100vw - 20px) !important" : "400px" }}>
                                <CardContent>
                                    <Typography variant="h6" fontWeight="bold">CHub Community Survey</Typography>
                                    <Typography variant="body2" sx={{ marginBottom: "10px" }}>Share your feedback for a chance to win a <b>$10 Steam Giftcard</b>!</Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={12} md={localStorage.getItem("survey-202402") !== null ? 12 : 6} lg={localStorage.getItem("survey-202402") !== null ? 12 : 6}>
                                            <Button onClick={() => { localStorage.setItem("survey-202402", "1710806400000"); setShowSurveyCard(false); window.open("https://charl.ws/survey"); }} variant="contained" color="success" sx={{ width: "100%" }}>Join</Button>
                                        </Grid>
                                        {localStorage.getItem("survey-202402") !== null && <Grid item xs={12} sm={12} md={6} lg={6}>
                                            <Button onClick={() => { localStorage.setItem("survey-202402", "1710806400000"); setShowSurveyCard(false); }} variant="contained" color="secondary" sx={{ width: "100%" }}>Not interested</Button>
                                        </Grid>}
                                        <Grid item xs={12} sm={12} md={6} lg={6}>
                                            <Button onClick={() => { localStorage.setItem("survey-202402", String(+new Date() + 86400000)); setShowSurveyCard(false); }} variant="contained" color="secondary" sx={{ width: "100%" }}>Remind me later</Button>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </>}
                        <SimpleBar style={{ padding: "20px", height: "100%", backgroundColor: theme.palette.background.default }} >
                            <div style={{ display: "flex", flexDirection: "column", minHeight: "calc(100vh - 120px)" }}>
                                <Routes>
                                    <Route path="/" exact element={<Overview />}></Route>
                                    {window.isElectron && <Route path="/auth/complete" exact element={<BrowserAuth />}></Route>}
                                    <Route path="/auth/login" element={<AuthLogin />} />
                                    <Route path="/auth" element={<TokenAuth />} />
                                    <Route path="/auth/discord/callback" element={<DiscordAuth />} />
                                    {apiConfig !== null && apiConfig.discord_client_id !== "1120997206938361877" && <Route path="/auth/discord/redirect" element={<Redirect to={`https://discord.com/oauth2/authorize?client_id=${apiConfig.discord_client_id}&redirect_uri=https%3A%2F%2F${window.dhhost}%2Fauth%2Fdiscord%2Fcallback&response_type=code&scope=identify email role_connections.write`} path="/auth/discord/redirect" />} />}
                                    {apiConfig !== null && apiConfig.discord_client_id === "1120997206938361877" && <Route path="/auth/discord/redirect" element={<Redirect to={`https://oauth.chub.page/discord-auth?domain=${window.dhhost}`} path="/auth/discord/redirect" />} />}
                                    <Route path="/auth/steam/callback" element={<SteamAuth />} />
                                    <Route path="/auth/steam/redirect" element={<Redirect to={`https://steamcommunity.com/openid/loginform/?goto=%2Fopenid%2Flogin%3Fopenid.ns%3Dhttp%253A%252F%252Fspecs.openid.net%252Fauth%252F2.0%26openid.mode%3Dcheckid_setup%26openid.return_to%3Dhttps%253A%252F%252F${window.dhhost}%252Fauth%252Fsteam%252Fcallback%26openid.realm%3Dhttps%253A%252F%252F${window.dhhost}%252Fauth%252Fsteam%252Fcallback%26openid.identity%3Dhttp%253A%252F%252Fspecs.openid.net%252Fauth%252F2.0%252Fidentifier_select%26openid.claimed_id%3Dhttp%253A%252F%252Fspecs.openid.net%252Fauth%252F2.0%252Fidentifier_select%3Fopenid.ns%3Dhttp%253A%252F%252Fspecs.openid.net%252Fauth%252F2.0%26openid.mode%3Dcheckid_setup%26openid.return_to%3Dhttps%253A%252F%252F${window.dhhost}%252Fauth%252Fsteam%252Fcallback%26openid.realm%3Dhttps%253A%252F%252F${window.dhhost}%252Fauth%252Fsteam%252Fcallback%26openid.identity%3Dhttp%253A%252F%252Fspecs.openid.net%252Fauth%252F2.0%252Fidentifier_select%26openid.claimed_id%3Dhttp%253A%252F%252Fspecs.openid.net%252Fauth%252F2.0%252Fidentifier_select`} path="/auth/steam/redirect" />} />
                                    <Route path="/auth/patreon/redirect" element={<Redirect to={"https://oauth.chub.page/patreon-auth?domain=" + window.dhhost} path="/auth/patreon/redirect" />} />
                                    <Route path="/auth/patreon/callback" element={<PatreonAuth />} />
                                    <Route path="/auth/mfa" element={<MfaAuth />} />
                                    <Route path="/auth/email" element={<EmailAuth />} />
                                    <Route path="/settings" element={<Settings />}></Route>
                                    <Route path="/settings/general" element={<Settings defaultTab={0} />}></Route>
                                    <Route path="/settings/profile" element={<Settings defaultTab={1} />}></Route>
                                    <Route path="/settings/appearance" element={<Settings defaultTab={2} />}></Route>
                                    <Route path="/settings/security" element={<Settings defaultTab={3} />}></Route>
                                    <Route path="/settings/sessions" element={<Settings defaultTab={4} />}></Route>
                                    <Route path="/notifications" element={<Notifications />}></Route>
                                    <Route path="/overview" element={<Overview />}></Route>
                                    <Route path="/statistics" element={<Statistics />}></Route>
                                    <Route path="/gallery" element={<Gallery />}></Route>
                                    <Route path="/announcement" element={<Announcement />}></Route>
                                    <Route path="/downloads" element={<Downloads />}></Route>
                                    <Route path="/poll" element={<Poll />}></Route>
                                    <Route path="/map" element={<Map />}></Route>
                                    <Route path="/delivery" element={<Deliveries />}></Route>
                                    <Route path="/delivery/:logid" element={<Delivery />} />
                                    <Route path="/challenge" element={<Challenges />}></Route>
                                    <Route path="/division" element={<Divisions />}></Route>
                                    <Route path="/event" element={<Events />}></Route>
                                    <Route path="/economy" element={<Economy />}></Route>
                                    <Route path="/member" element={<Members />}></Route>
                                    <Route path="/member/:userid" element={<Overview />} />
                                    <Route path="/leaderboard" element={<Leaderboard />}></Route>
                                    <Route path="/ranking" element={<Ranking />}></Route>
                                    <Route path="/freightmaster" element={<FreightMaster />}></Route>
                                    <Route path="/application/new" element={<NewApplication />}></Route>
                                    <Route path="/apply" element={<NewApplication />}></Route>
                                    <Route path="/application/my" element={<MyApplication />}></Route>
                                    <Route path="/application/all" element={<AllApplication />}></Route>
                                    <Route path="/member-list" element={<MemberList />}></Route>
                                    <Route path="/external-user" element={<ExternalUsers />}></Route>
                                    <Route path="/audit-log" element={<AuditLog />}></Route>
                                    <Route path="/config" element={<Configuration />}></Route>
                                    <Route path="/sponsor" element={<UpgradeCard />}></Route>
                                    <Route path="/supporters" element={<Supporters />}></Route>
                                    <Route path="/badges" element={<Badges />}></Route>
                                    <Route path="*" element={<NotFound />}></Route>
                                </Routes>
                                <Dialog open={aboutCHubModal} onClose={() => setAboutCHubModal(false)}>
                                    <DialogTitle>About The Drivers Hub Project (CHub)</DialogTitle>
                                    <DialogContent>
                                        <Typography variant="body2">
                                            Embark on a journey through the digital thoroughfares with <b>{tr("drivers_hub")}</b>, an ethereal portal for Virtual Trucking Communities, crafted to elevate communal experiences and simplify the art of management.
                                        </Typography>
                                        <br />
                                        <Typography variant="body2">
                                            Orchestrated by the visionary mind of <b>CharlesWithC</b>, this symphony is performed under the appellation of CHub, also known as The Drivers Hub Project.
                                        </Typography>
                                        <br />
                                        <Typography variant="body2">
                                            CHub unveils itself as a Software as a Service (SaaS) marvel, inviting you to subscribe and forge your own Drivers Hub. Immerse yourself in the essence of our creation by exploring our <a href="https://drivershub.charlws.com/" target="_blank" rel="noreferrer">sanctuary (drivershub.charlws.com)</a>.
                                        </Typography>
                                        <br />
                                        <Typography variant="body2">
                                            <b>Wander through these portals:</b>&nbsp;&nbsp;
                                            <a href="https://drivershub.charlws.com/" target="_blank" rel="noreferrer">Website</a>&nbsp;&nbsp;
                                            <a href="https://wiki.charlws.com/books/chub" target="_blank" rel="noreferrer">Wiki</a>&nbsp;&nbsp;
                                            <a href="https://discord.gg/KRFsymnVKm" target="_blank" rel="noreferrer">Discord</a>&nbsp;&nbsp;
                                            <a href="https://twitter.com/CHub_DH" target="_blank" rel="noreferrer">Twitter</a>
                                            <br />
                                        </Typography>
                                        <Typography variant="body2">
                                            <b>Our cosmic partners:</b>&nbsp;&nbsp;
                                            <a href="https://truckyapp.com/" target="_blank" rel="noreferrer">Trucky</a>&nbsp;&nbsp;
                                            <a href="https://truckstopradio.co.uk/" target="_blank" rel="noreferrer">TruckStopRadio</a>&nbsp;&nbsp;
                                            <a href="https://discord.gg/trucksim" target="_blank" rel="noreferrer">/r/trucksim</a>&nbsp;&nbsp;
                                            <a href="https://ocsc-event.com/" target="_blank" rel="noreferrer">OCSC Event</a>&nbsp;&nbsp;
                                        </Typography>
                                        <br />
                                        <Typography variant="body2">
                                            Gratitude for embarking on this celestial exploration. As the modal curtain falls, let the harmonies of Drivers Hub serenade your digital travels!
                                        </Typography>
                                    </DialogContent>
                                    <DialogActions>
                                        <Button variant="primary" onClick={() => { setAboutCHubModal(false); }}>{tr("close")}</Button>
                                    </DialogActions>
                                </Dialog>
                                <footer style={{ display: ["/auth", "/auth/login", "/auth/email", "/auth/discord/callback", "/auth/discord/redirect", "/auth/steam/callback", "/auth/steam/redirect", "/auth/patreon/callback", "/auth/mfa"].includes(location.pathname) ? "none" : "block", marginTop: "auto", fontSize: "0.9em" }}>
                                    {isMd && <div style={{ display: 'flex', alignItems: 'center', marginTop: "20px", color: theme.palette.text.secondary }}>
                                        <Typography variant="body2" sx={{ flexGrow: 1, fontWeight: 800 }}>
                                            &copy; {new Date().getFullYear()} <a href="https://charlws.com/" target="_blank" rel="noreferrer">CharlesWithC</a>
                                        </Typography>
                                        <Typography variant="body2" sx={{ marginLeft: "auto", alignSelf: 'flex-end', textAlign: "right", fontWeight: 800, marginRight: hasSpeedDial ? "70px" : 0 }}>
                                            <a href="https://drivershub.charlws.com/" target="_blank" rel="noreferrer">The Drivers Hub Project (CHub)</a>  <FontAwesomeIcon icon={faQuestionCircle} onClick={() => { setAboutCHubModal(true); }} style={{ cursor: "pointer" }} />
                                        </Typography>
                                    </div>}
                                    {!isMd && <div style={{ alignItems: 'center', marginTop: "20px", color: theme.palette.text.secondary }}>
                                        <Typography variant="body2" sx={{ fontWeight: 800 }}>
                                            &copy; {new Date().getFullYear()} <a href="https://charlws.com/" target="_blank" rel="noreferrer">CharlesWithC</a>
                                            <br />
                                            <a href="https://drivershub.charlws.com/" target="_blank" rel="noreferrer">The Drivers Hub Project (CHub)</a>  <FontAwesomeIcon icon={faQuestionCircle} onClick={() => { setAboutCHubModal(true); }} style={{ cursor: "pointer" }} />
                                        </Typography>
                                    </div>}
                                </footer>
                            </div>
                        </SimpleBar>
                    </div>
                </div>
            </ThemeProvider >
        );
    }
}

export default App;
