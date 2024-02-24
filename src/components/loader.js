import { useState, useEffect, useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { AppContext, ThemeContext } from '../context';

import { HelmetProvider, Helmet } from 'react-helmet-async';
import { Typography, TextField, Button, useTheme } from '@mui/material';

import { FetchProfile, loadImageAsBase64, customAxios as axios, makeRequestsAuto, compareVersions, writeLS, readLS } from '../functions';

var vars = require('../variables');

const Loader = ({ onLoaderLoaded }) => {
    const [domain, setDomain] = useState(window.location.hostname !== "localhost" ? window.location.hostname : window.dhhost);

    const { t: tr } = useTranslation();
    const appContext = useContext(AppContext);
    const { apiPath, setApiPath, setApiConfig, webConfig, setWebConfig, loadLanguages, setAllRoles, setAllPerms, setAllRanks, loadMemberUIDs, loadDlogDetails } = useContext(AppContext);
    const { themeSettings, setThemeSettings } = useContext(ThemeContext);

    const [isMember, setIsMember] = useState(false);

    const theme = useTheme();
    const [animateLoader, setLoaderAnimation] = useState(true);
    const [logoSrc, setLogoSrc] = useState(domain !== null && domain !== "" ? localStorage.getItem("cache-logo") : null);
    const [bgSrc, setBgSrc] = useState(domain !== null && domain !== "" ? localStorage.getItem("cache-background") : null);
    const [title, setTitle] = useState(domain !== null && domain !== "" ? (localStorage.getItem("cache-title") !== null ? localStorage.getItem("cache-title") : tr("drivers_hub")) : null);
    const [loadMessage, setLoadMessage] = useState((!window.isElectron || logoSrc !== null) ? tr("loading") : "");
    const [unknownDomain, setUnknownDomain] = useState(false);

    const doLoad = useCallback(async () => {
        if (webConfig !== null) return;

        try {
            if (domain === undefined || domain === null || domain === "") {
                setLoaderAnimation(false);
                setTitle(tr("drivers_hub"));
                vars.dhlogo = await loadImageAsBase64(`./logo.png`);
                setLogoSrc(vars.dhlogo);
                setBgSrc(null);
                setUnknownDomain(true);
                setLoadMessage(<>{tr("drivers_hub_not_found")}<br />{tr("no_drivers_hub_under_domain")}<br /><br /><a href="https://drivershub.charlws.com/">The Drivers Hub Project (CHub)</a></>);
                return;
            }
            // fetch config
            let resp = await axios({ url: `https://config.chub.page/config?domain=${domain}`, method: "GET" });
            if (resp.status !== 200) {
                setLoaderAnimation(false);
                setTitle(tr("drivers_hub"));
                vars.dhlogo = await loadImageAsBase64(`./logo.png`);
                setLogoSrc(vars.dhlogo);
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

            if (webConfig.api_host === "https://drivershub.charlws.com") {
                vars.vtcLevel = 3;
            } else if (webConfig.api_host === "https://drivershub05.charlws.com") {
                vars.vtcLevel = 1;
            } else if (webConfig.api_host === "https://drivershub.charlws.com") {
                vars.vtcLevel = 0;
            }

            setLoadMessage(tr("loading"));
            setTitle(webConfig.name);
            localStorage.setItem("cache-title", webConfig.name);
            let imageLoaded = false;
            Promise.all([
                loadImageAsBase64(`https://cdn.chub.page/assets/${webConfig.abbr}/logo.png?${webConfig.logo_key !== undefined ? webConfig.logo_key : ""}`, "./logo.png")
                    .then((image) => {
                        vars.dhlogo = image;
                        try {
                            localStorage.setItem("cache-logo", vars.dhlogo);
                        } catch { }
                        setLogoSrc(vars.dhlogo);
                    })
                    .catch(() => {
                        vars.dhlogo = "";
                    }),
                loadImageAsBase64(`https://cdn.chub.page/assets/${webConfig.abbr}/bgimage.png?${webConfig.bgimage_key !== undefined ? webConfig.bgimage_key : ""}`)
                    .then((image) => {
                        if (vars.vtcLevel >= 1) {
                            vars.dhvtcbg = image;
                            try {
                                localStorage.setItem("cache-background", vars.dhvtcbg);
                            } catch { }
                            setBgSrc(vars.dhvtcbg);
                        } else {
                            vars.dhvtcbg = "";
                            setBgSrc(vars.dhvtcbg);
                            localStorage.removeItem("cache-background");
                        }
                    })
                    .catch(() => {
                        vars.dhvtcbg = "";
                    }),
                loadImageAsBase64(`https://cdn.chub.page/assets/${webConfig.abbr}/banner.png?${webConfig.banner_key !== undefined ? webConfig.banner_key : ""}`)
                    .then((image) => {
                        vars.dhbanner = image;
                    })
                    .catch(() => {
                        vars.dhbanner = "";
                    })
            ]).then(() => { imageLoaded = true; });

            let [index, specialRoles, patrons, userConfig, config, memberRoles, memberPerms, memberRanks] = [null, null, null, null, null, null, null, null, null];
            let useCache = false;

            let cache = readLS("cache", window.dhhost + webConfig.abbr + webConfig.api_host);
            if (cache !== null) {
                if (cache.timestamp === undefined || +new Date() - cache.timestamp > 86400000) {
                    localStorage.removeItem("cache");
                } else {
                    useCache = true;
                    config = cache.config;
                    memberRoles = cache.memberRoles;
                    memberPerms = cache.memberPerms;
                    memberRanks = cache.memberRanks;
                }
            }

            if (!useCache) {
                const urlsBatch = [
                    { url: `${apiPath}/`, auth: false },
                    { url: "https://config.chub.page/roles", auth: false },
                    { url: "https://config.chub.page/patrons", auth: false },
                    { url: `https://config.chub.page/config/user?abbr=${webConfig.abbr}`, auth: false },
                    { url: `${apiPath}/config`, auth: false },
                    { url: `${apiPath}/member/roles`, auth: false },
                    { url: `${apiPath}/member/perms`, auth: false },
                    { url: `${apiPath}/member/ranks`, auth: false },
                ];

                [index, specialRoles, patrons, userConfig, config, memberRoles, memberPerms, memberRanks] = await makeRequestsAuto(urlsBatch);
            } else {
                const urlsBatch = [
                    { url: `${apiPath}/`, auth: false },
                    { url: "https://config.chub.page/roles", auth: false },
                    { url: "https://config.chub.page/patrons", auth: false },
                    { url: `https://config.chub.page/config/user?abbr=${webConfig.abbr}`, auth: false },
                ];

                [index, specialRoles, patrons, userConfig] = await makeRequestsAuto(urlsBatch);
            }
            if (index) {
                vars.apiversion = index.version;
            }
            if (specialRoles) {
                vars.specialRoles = specialRoles;
                let roleNames = Object.keys(specialRoles);
                for (let i = 0; i < roleNames.length; i++) {
                    let roleName = roleNames[i];
                    for (let j = 0; j < specialRoles[roleName].length; j++) {
                        let user = specialRoles[roleName][j];
                        if (!Object.keys(vars.specialRolesMap).includes(user.id))
                            vars.specialRolesMap[user.id] = [];
                        vars.specialRolesMap[user.id].push({ "role": roleName, "color": user.color });
                    }
                }
            }
            if (patrons) {
                vars.patrons = patrons;
            }
            if (userConfig) {
                vars.userConfig = userConfig;
            }
            if (config) {
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

            if (!useCache) {
                let cache = {
                    timestamp: +new Date(),
                    config: config,
                    memberRoles: memberRoles,
                    memberPerms: memberPerms,
                    memberRanks: memberRanks
                };
                writeLS("cache", cache, window.dhhost + webConfig.abbr + webConfig.api_host);
            }

            let auth = await FetchProfile({ ...appContext, apiPath: apiPath, webConfig: webConfig });
            setIsMember(auth.member);

            setThemeSettings(prevSettings => ({ ...prevSettings })); // refresh theme settings

            function sleep(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }
            while (!imageLoaded && (vars.dhlogo === null || vars.dhbanner === null || vars.dhvtcbg === null)) {
                await sleep(10);
            }
            onLoaderLoaded();
        } catch (error) {
            setLoaderAnimation(false);
            console.error(tr("an_error_occurred_when_initializing"));
            console.error(error);
            setLoadMessage(tr("error_occurred"));
        }
    }, []);
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

    function intToHex(intValue) {
        const scaledInt = Math.floor(intValue * 255 / 100);
        let hexValue = scaledInt.toString(16);
        if (hexValue.length === 1) hexValue = '0' + hexValue;
        return hexValue;
    }

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
            backgroundImage: `url(${bgSrc})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
        }}>
            <div className="loading-div" style={{ backgroundColor: theme.palette.background.default.substring(0, 7) + (themeSettings.theme_darken_ratio !== null ? intToHex(themeSettings.theme_darken_ratio * 100) : "66") }}>
                <HelmetProvider>
                    <Helmet>
                        <title>{title}</title>
                        {logoSrc !== null && logoSrc !== "" && <link rel="icon" href={logoSrc} type="image/x-icon" />}
                        {logoSrc !== null && logoSrc !== "" && <link rel="apple-touch-icon" href={logoSrc} />}
                    </Helmet>
                </HelmetProvider>
                {logoSrc !== null && logoSrc !== "" && <img src={logoSrc} className={`loader ${animateLoader ? "loader-animated" : ""}`} alt="" style={{ marginBottom: "10px" }} />}
                {(!window.isElectron || !unknownDomain) && <Typography variant="body1" sx={{ fontSize: "25px" }}>{loadMessage}</Typography>}
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