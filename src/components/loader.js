import { useState, useEffect, useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { AppContext, ThemeContext } from '../context';

import { HelmetProvider, Helmet } from 'react-helmet-async';
import { Typography, TextField, Button, useTheme } from '@mui/material';

import { FetchProfile, loadImageAsBase64, customAxios as axios, makeRequestsAuto, compareVersions, writeLS, readLS } from '../functions';

const TIPS = [
    "The pre-login avatar belongs to CharlesWithC. He's a Night Fury.",
    "The Drivers Hub is operated by CHub, owned by CharlesWithC.",
    "CHub was originally called GeHub, as part of the Gecko ecosystem.",
    "We've got a website which may solve your problems: wiki.charlws.com",
    "Find hidden features by hovering on the + in the bottom right.",
    "Some components have context menus. Right-click to find out.",
    "CHub is an open platform that supports Trucky, TrackSim and custom trackers.",
    "Multiple rankings is supported, but you'll need JSON knowledge to manage them.",
    "All statistics and points are traceable, allowing data fetching of any time range."
];

const tip = TIPS[Math.floor(Math.random() * TIPS.length)];

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const Loader = ({ onLoaderLoaded }) => {
    const [domain, setDomain] = useState(window.location.hostname !== "localhost" ? window.location.hostname : window.dhhost);

    const { t: tr } = useTranslation();
    const appContext = useContext(AppContext);
    const { apiPath, setApiPath, setApiVersion, vtcLogo, setVtcLogo, vtcBanner, setVtcBanner, vtcBackground, setVtcBackground, setSpecialRoles, setSpecialUsers, setPatrons, setFMRewards, setFMRewardsDistributed, setVtcLevel, setUserConfig, setApiConfig, webConfig, setWebConfig, loadLanguages, setAllRoles, setAllPerms, setAllRanks, loadMemberUIDs, loadDlogDetails } = useContext(AppContext);
    const { themeSettings, setThemeSettings } = useContext(ThemeContext);

    const [isMember, setIsMember] = useState(false);

    const theme = useTheme();
    const [animateLoader, setLoaderAnimation] = useState(true);
    const [title, setTitle] = useState(domain !== null && domain !== "" ? (localStorage.getItem("cache-title") !== null ? localStorage.getItem("cache-title") : tr("drivers_hub")) : null);
    const [loadMessage, setLoadMessage] = useState((!window.isElectron || vtcLogo !== null) ? tr("loading") : "");
    const [unknownDomain, setUnknownDomain] = useState(false);

    const doLoad = useCallback(async () => {
        if (webConfig !== null) return;

        try {
            if (domain === undefined || domain === null || domain === "") {
                setLoaderAnimation(false);
                setTitle(tr("drivers_hub"));
                setVtcLogo(await loadImageAsBase64(`./logo.png`));
                setUnknownDomain(true);
                setLoadMessage(<>{tr("drivers_hub_not_found")}<br />{tr("no_drivers_hub_under_domain")}<br /><br /><a href="https://drivershub.charlws.com/">The Drivers Hub Project (CHub)</a></>);
                return;
            }
            // fetch config
            let resp = await axios({ url: `https://config.chub.page/config?domain=${domain}`, method: "GET" });
            if (resp.status !== 200) {
                setLoaderAnimation(false);
                setTitle(tr("drivers_hub"));
                setVtcLogo(await loadImageAsBase64(`./logo.png`));
                if (resp.data.error === tr("service_suspended")) {
                    setLoadMessage(<>{tr("drivers_hub_suspended")}<br />{tr("ask_for_payment")}<br /><br /><a href="https://drivershub.charlws.com/">The Drivers Hub Project (CHub)</a></>);
                } else if (resp.data.error === tr("not_found")) {
                    setUnknownDomain(true);
                    setLoadMessage(<>{tr("drivers_hub_not_found")}<br />{tr("no_drivers_hub_under_domain")}<br /><br /><a href="https://drivershub.charlws.com/">The Drivers Hub Project (CHub)</a></>);
                }
                return;
            }
            let loadedConfig = resp.data;
            const webConfig = loadedConfig.config; // local webConfig for this function only
            const apiPath = `${webConfig.api_host}/${webConfig.abbr}`; // local apiPath for this function only
            setWebConfig(loadedConfig.config);
            setApiPath(`${webConfig.api_host}/${webConfig.abbr}`);

            let vtcLevel = 0;
            if (webConfig.api_host === "https://drivershub.charlws.com") {
                vtcLevel = 3;
                setVtcLevel(3);
            } else if (webConfig.api_host === "https://drivershub05.charlws.com") {
                vtcLevel = 1;
                setVtcLevel(1);
            } else if (webConfig.api_host === "https://drivershub.charlws.com") {
                vtcLevel = 0;
                setVtcLevel(0);
            }

            setLoadMessage(tr("loading"));
            setTitle(webConfig.name);
            localStorage.setItem("cache-title", webConfig.name);
            let imageLoaded = (vtcLogo !== null) + (vtcBackground !== null) + (vtcBanner !== null);
            Promise.all([
                loadImageAsBase64(`https://cdn.chub.page/assets/${webConfig.abbr}/logo.png?${webConfig.logo_key !== undefined ? webConfig.logo_key : ""}`, "./logo.png")
                    .then((image) => {
                        if (vtcLogo === null) imageLoaded += 1;
                        setVtcLogo(image);
                        try {
                            if (window.electron) {
                                localStorage.setItem("cache-logo", image);
                            }
                        } catch { }
                    })
                    .catch(() => {
                        if (vtcLogo === null) imageLoaded += 1;
                        setVtcLogo("");
                    }),
                loadImageAsBase64(`https://cdn.chub.page/assets/${webConfig.abbr}/banner.png?${webConfig.banner_key !== undefined ? webConfig.banner_key : ""}`)
                    .then((image) => {
                        if (vtcBanner === null) imageLoaded += 1;
                        setVtcBanner(image);
                        try {
                            if (window.electron) {
                                localStorage.setItem("cache-banner", image);
                            }
                        } catch { }
                    })
                    .catch(() => {
                        if (vtcBanner === null) imageLoaded += 1;
                        setVtcBanner("");
                    }),
                loadImageAsBase64(`https://cdn.chub.page/assets/${webConfig.abbr}/bgimage.png?${webConfig.bgimage_key !== undefined ? webConfig.bgimage_key : ""}`)
                    .then((image) => {
                        if (vtcBackground === null) imageLoaded += 1;
                        if (vtcLevel >= 1) {
                            setVtcBackground(image);
                            try {
                                if (window.electron) {
                                    localStorage.setItem("cache-background", image);
                                }
                            } catch { }
                        } else {
                            setVtcBackground("");
                            localStorage.removeItem("cache-background");
                        }
                    })
                    .catch(() => {
                        if (vtcBackground === null) imageLoaded += 1;
                        setVtcBackground("");
                    })
            ]).then(() => { imageLoaded = 3; });

            const [index, apiStatus] = await makeRequestsAuto([{ url: `https://corsproxy.io/?${apiPath}/`, auth: false },
            { url: `${apiPath}/status`, auth: false }]);

            if (index) {
                if (String(index).toLowerCase().indexOf(`bad gateway`) !== -1) {
                    setLoaderAnimation(false);
                    setLoadMessage(<>{tr("drivers_hub_is_experiencing_a_temporary_outage")}<br />{tr("please_refresh_the_page_later_and_report_the_incident_if")}</>);
                    return;
                }
                setApiVersion(index.version);
            }
            if (apiStatus) {
                if (apiStatus.database === "unavailable") {
                    setLoadMessage(<>{tr("drivers_hub_is_experiencing_a_database_outage")}<br />{tr("an_attempt_has_been_made_to_restart_the_database")}</>);
                    await axios({ url: `${apiPath}/status/database/restart`, method: "POST" });
                    await sleep(1000);

                    let ok = false;
                    for (let i = 0; i < 5; i++) {
                        let resp = await axios({ url: `${apiPath}/status`, method: "GET" });
                        if (resp.data.database === "unavailable") {
                            setLoadMessage(<>{tr("drivers_hub_is_experiencing_a_database_outage")}<br />{tr("an_attempt_has_been_made_to_restart_the_database")}</>);
                            await axios({ url: `${apiPath}/status/database/restart`, method: "POST" });
                            await sleep(i * 1000 + 2000);
                        } else {
                            setLoadMessage(<>{tr("drivers_hub_database_is_back_online")}<br />{tr("loading_has_resumed")}</>);
                            ok = true;
                            await sleep(1000);
                            break;
                        }
                    }
                    if (!ok) {
                        setLoaderAnimation(false);
                        setLoadMessage(<>{tr("drivers_hub_is_experiencing_a_database_outage")}<br />{tr("the_attempt_to_restart_the_database_has_failed")}<br />{tr("please_refresh_the_page_later_and_report_the_incident_if")}</>);
                        return;
                    }
                }
            }

            const urlsBatch = [
                { url: "https://config.chub.page/roles", auth: false },
                { url: "https://config.chub.page/patrons", auth: false },
                { url: "https://config.chub.page/freightmaster/rewards", auth: false },
                { url: `https://config.chub.page/freightmaster/rewards/distributed?abbr=${webConfig.abbr}`, auth: false },
                { url: `https://config.chub.page/config/user?abbr=${webConfig.abbr}`, auth: false },
                { url: `${apiPath}/config`, auth: false },
                { url: `${apiPath}/member/roles`, auth: false },
                { url: `${apiPath}/member/perms`, auth: false },
                { url: `${apiPath}/member/ranks`, auth: false },
            ];

            const [specialRoles, patrons, fmRewards, fmRewardsDistributed, userConfig, config, memberRoles, memberPerms, memberRanks] = await makeRequestsAuto(urlsBatch);

            const specialUsers = {};
            if (specialRoles) {
                setSpecialRoles(specialRoles);
                let roleNames = Object.keys(specialRoles);
                for (let i = 0; i < roleNames.length; i++) {
                    let roleName = roleNames[i];
                    for (let j = 0; j < specialRoles[roleName].length; j++) {
                        let user = specialRoles[roleName][j];
                        if (!Object.keys(specialUsers).includes(user.id))
                            specialUsers[user.id] = [];
                        specialUsers[user.id].push({ "role": roleName, "color": user.color });
                    }
                }
                setSpecialUsers(specialUsers);
            }
            if (patrons) {
                setPatrons(patrons);
            }
            if (fmRewards) {
                setFMRewards(fmRewards);
            }
            if (fmRewardsDistributed) {
                let fmrd = {};
                for (let i = 0; i < fmRewardsDistributed.length; i++) {
                    let ureward = fmRewardsDistributed[i];
                    let uruid = ureward.uid;
                    if (fmrd[uruid] === undefined) fmrd[uruid] = [ureward];
                    else fmrd[uruid].push(ureward);
                }
                setFMRewardsDistributed(fmrd);
            }
            if (userConfig) {
                setUserConfig(userConfig);
            }
            if (config) {
                if (config.config === undefined) {
                    if (config.error !== undefined) {
                        setLoaderAnimation(false);
                        if (config.error === "Client validation failed") {
                            setLoadMessage(<>Your client cannot be validated by server.<br />Please make sure the clock of your device is synchronized.</>);
                        } else {
                            setLoadMessage(<>An error has occurred while loading: <br />{config.error}<br />Please try again later and report the issue if it persists.</>);
                        }
                        return;
                    } else {
                        setLoaderAnimation(false);
                        setTitle(tr("drivers_hub"));
                        setVtcLogo(await loadImageAsBase64(`./logo.png`));
                        setUnknownDomain(true);
                        setLoadMessage(<>{tr("drivers_hub_not_found")}<br />{tr("no_drivers_hub_under_domain")}<br /><br /><a href="https://drivershub.charlws.com/">The Drivers Hub Project (CHub)</a></>);
                        return;
                    }
                }
                setApiConfig(config.config);
            }
            let allRoles = {}; // to be used by FetchProfile
            if (memberRoles) {
                for (let i = 0; i < memberRoles.length; i++)
                    allRoles[memberRoles[i].id] = memberRoles[i];
                setAllRoles(allRoles);
            }
            if (memberPerms) {
                setAllPerms(memberPerms);
            }
            if (memberRanks) {
                setAllRanks(memberRanks);
            }

            let auth = await FetchProfile({ ...appContext, apiPath: apiPath, webConfig: webConfig, specialUsers: specialUsers, patrons: patrons });
            setIsMember(auth.member);

            setThemeSettings(prevSettings => ({ ...prevSettings })); // refresh theme settings

            while (imageLoaded < 3) {
                await sleep(10);
            }
            onLoaderLoaded();
        } catch (error) {
            setLoaderAnimation(false);
            console.error(tr("an_error_occurred_when_initializing"));
            console.error(error);
            setLoadMessage(tr("error_occurred"));
        }
    }, [domain]);
    useEffect(() => {
        doLoad();
    }, []);

    useEffect(() => {
        if (isMember && apiPath !== "") {
            // init these values which are auth-required and required config to be loaded
            loadMemberUIDs();
            loadDlogDetails();
        }
    }, [apiPath, isMember]);
    useEffect(() => {
        if (apiPath !== "")
            loadLanguages();
    }, [apiPath]);

    const handleDomainUpdate = useCallback(() => {
        localStorage.setItem("domain", domain);
        window.dhhost = domain;
        setLoaderAnimation(true);
        setTitle(tr("drivers_hub"));
        setLoadMessage(tr("loading"));
        setUnknownDomain(false);
        doLoad();
    }, [domain]);

    if (window.isElectron && unknownDomain) {
        window.electron.ipcRenderer.send("presence-update", {
            details: tr("launching"),
            largeImageKey: 'https://drivershub.charlws.com/images/logo.png',
            startTimestamp: new Date(),
            instance: false,
            buttons: [
                { label: tr("powered_by_chub"), url: "https://drivershub.charlws.com/" }
            ]
        });
    }

    return (
        <div style={{
            backgroundImage: `url(${vtcBackground})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
        }}>
            <div className="loading-div" style={{ backgroundColor: theme.palette.background.default.substring(0, 7) + "66" }}>
                <HelmetProvider>
                    <Helmet>
                        <title>{title}</title>
                        {vtcLogo !== null && vtcLogo !== "" && <link rel="icon" href={vtcLogo} type="image/x-icon" />}
                        {vtcLogo !== null && vtcLogo !== "" && <link rel="apple-touch-icon" href={vtcLogo} />}
                    </Helmet>
                </HelmetProvider>
                {vtcLogo !== null && vtcLogo !== "" && <img src={vtcLogo} className={`loader ${animateLoader ? "loader-animated" : ""}`} alt="" style={{ marginBottom: "10px" }} />}
                {(!window.isElectron || !unknownDomain) && <Typography variant="body1" sx={{ fontSize: "25px" }}>{loadMessage}</Typography>}
                {(!window.isElectron || !unknownDomain) && animateLoader && <Typography variant="body2" sx={{ fontSize: "15px", opacity: 0.8 }}>{tip}</Typography>}
                {(window.isElectron && unknownDomain) && <>
                    <Typography variant="body1" sx={{ mb: "10px" }}>{tr("enter_the_drivers_hub_domain_to_start_your_app_experience")}</Typography>
                    <TextField
                        label={tr("domain")}
                        variant="outlined"
                        value={!domain.startsWith("localhost") ? domain : ""}
                        onChange={(e) => {
                            setDomain(e.target.value);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === tr("enter")) {
                                handleDomainUpdate();
                            }
                        }}
                        style={{ width: "100%", maxWidth: "400px", marginBottom: "10px" }}
                    />
                    <Button variant="contained" color="info"
                        style={{ width: "100%", maxWidth: "400px", marginBottom: "10px" }}
                        onClick={handleDomainUpdate}>{tr("confirm")}</Button>
                    <Typography variant="body1" sx={{ mt: "10px" }}>{tr("get_custom_build_with_vtc_icon_and_discord_rich_presence")}<br />{tr("available_for_vtcs_with_more_than_5_platinum_8_gold")}</Typography>
                </>}
            </div>
        </div>
    );
};

export default Loader;