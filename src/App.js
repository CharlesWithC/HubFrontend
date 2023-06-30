import './App.css';
import { useMemo, useState, useEffect } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from "@mui/material/CssBaseline";
import { useLocation, Routes, Route } from 'react-router-dom';

import TokenAuth from './routes/auth/tokenAuth';
import DiscordAuth from './routes/auth/discordAuth';
import SteamAuth from './routes/auth/steamAuth';
import MfaAuth from './routes/auth/mfaAuth';
import Loader from './components/loader';
import Redirect from './components/redirect';
import UpgradeCard from './routes/upgrade';
import Overview from './routes/overview';
import Announcement from './routes/announcements';
import Downloads from './routes/downloads';
import Map from './routes/map';
import Deliveries from './routes/deliveries';
import Delivery from './routes/delivery';
import Events from './routes/events';
import { getDesignTokens } from './designs';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';

import TopBar from './components/topbar';
import SideBar from './components/sidebar';

var vars = require('./variables');

function App() {
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const themeMode = vars.userSettings.theme === null ? (prefersDarkMode ? 'dark' : 'light') : vars.userSettings.theme;
    const theme = useMemo(
        () =>
            createTheme(getDesignTokens(themeMode), themeMode),
        [themeMode],
    );

    const [, setRerender] = useState(false);

    const runRerender = () => {
        setTimeout(function () { setRerender(true); }, 500);
    };

    const location = useLocation();
    const [sidebarHidden, setSidebarHidden] = useState(window.innerWidth < 600);
    const [topbarHidden, setTopbarHidden] = useState(false);
    useEffect(() => {
        const handle = () => {
            if (["/auth", "/discord-auth", "/discord-redirect", "/steam-auth", "/steam-redirect", "/mfa"].includes(location.pathname)) {
                setSidebarHidden(true);
                setTopbarHidden(true);
            } else {
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
                {!sidebarHidden &&
                    <SideBar width={260}></SideBar>
                }
                {/* For mobile view, use a "menu button" on topbar, click it to show a full-width sidebar, without banner on top and with a close button on top */}
                <div style={(!sidebarHidden && { position: "relative", left: "260px", top: !topbarHidden ? "80px" : "0", width: "calc(100vw - 260px)", height: !topbarHidden ? "calc(100vh - 80px)" : "100vh", overflow: "hidden" })
                    || (sidebarHidden && { position: "relative", left: "0", top: !topbarHidden ? "80px" : "0", width: "calc(100vw)", height: !topbarHidden ? "calc(100vh - 80px)" : "100vh", overflow: "hidden" })}>
                    <SimpleBar style={{ padding: "20px", height: "100%" }} >
                        <Routes>
                            <Route path="/auth" element={<TokenAuth />} />
                            <Route path="/discord-auth" element={<DiscordAuth />} />
                            <Route path="/discord-redirect" element={<Redirect to={`https://discord.com/oauth2/authorize?client_id=${vars.discordClientID}&redirect_uri=${protocol}%3A%2F%2F${window.location.host}%2Fdiscord-auth&response_type=code&scope=identify email role_connections.write`} />} />
                            <Route path="/steam-auth" element={<SteamAuth />} />
                            <Route path="/steam-redirect" element={<Redirect to={`https://steamcommunity.com/openid/loginform/?goto=%2Fopenid%2Flogin%3Fopenid.ns%3Dhttp%253A%252F%252Fspecs.openid.net%252Fauth%252F2.0%26openid.mode%3Dcheckid_setup%26openid.return_to%3D${protocol}%253A%252F%252F${window.location.host}%252Fsteam-auth%26openid.realm%3D${protocol}%253A%252F%252F${window.location.host}%252Fsteam-auth%26openid.identity%3Dhttp%253A%252F%252Fspecs.openid.net%252Fauth%252F2.0%252Fidentifier_select%26openid.claimed_id%3Dhttp%253A%252F%252Fspecs.openid.net%252Fauth%252F2.0%252Fidentifier_select%3Fopenid.ns%3Dhttp%253A%252F%252Fspecs.openid.net%252Fauth%252F2.0%26openid.mode%3Dcheckid_setup%26openid.return_to%3D${protocol}%253A%252F%252F${window.location.host}%252Fsteam-auth%26openid.realm%3D${protocol}%253A%252F%252F${window.location.host}%252Fsteam-auth%26openid.identity%3Dhttp%253A%252F%252Fspecs.openid.net%252Fauth%252F2.0%252Fidentifier_select%26openid.claimed_id%3Dhttp%253A%252F%252Fspecs.openid.net%252Fauth%252F2.0%252Fidentifier_select`} />} />
                            <Route path="/mfa" element={<MfaAuth />} />
                            <Route exact path="/" element={<Overview />}></Route>
                            <Route path="/upgrade" element={<UpgradeCard />}></Route>
                            <Route path="/announcement" element={<Announcement />}></Route>
                            <Route path="/downloads" element={<Downloads />}></Route>
                            <Route path="/map" element={<Map />}></Route>
                            <Route path="/delivery" element={<Deliveries />}></Route>
                            <Route path="/delivery/:logid" element={<Delivery />} />
                            <Route path="/event" element={<Events />}></Route>
                        </Routes>
                    </SimpleBar>
                </div>
            </ThemeProvider>
        );
    }
}

export default App;
