import { useState, useEffect } from 'react';
import { HelmetProvider, Helmet } from 'react-helmet-async';

import { FetchProfile, loadImageAsBase64, customAxios as axios, makeRequestsAuto, getAuthToken, compareVersions } from '../functions';
import { useTheme } from '@emotion/react';

var vars = require('../variables');

var domain = localStorage.getItem("domain");
if (domain === null) {
    domain = window.location.host;
}

const Loader = ({ onLoaderLoaded }) => {
    const theme = useTheme();
    const [animateLoader, setLoaderAnimation] = useState(true);
    const [logoSrc, setLogoSrc] = useState(null);
    const [bgSrc, setBgSrc] = useState(null);
    const [title, setTitle] = useState("Drivers Hub");
    const [loadMessage, setLoadMessage] = useState("Loading");

    if (localStorage.getItem("preload-title") != null && localStorage.getItem("preload-icon") != null
        && title === "Drivers Hub" && logoSrc === null) {
        setTitle(localStorage.getItem("preload-title"));
        setLogoSrc(localStorage.getItem("preload-icon"));
        setBgSrc(localStorage.getItem("preload-background"));
    }

    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get("domain") !== null) {
        domain = searchParams.get("domain");
        localStorage.setItem("domain", domain);
    }

    if (localStorage.getItem("update-discord") !== null && +new Date() - localStorage.getItem("update-discord") > 60000) {
        localStorage.removeItem("update-discord");
    }
    if (localStorage.getItem("update-steam") !== null && +new Date() - localStorage.getItem("update-steam") > 60000) {
        localStorage.removeItem("update-steam");
    }

    useEffect(() => {
        async function doLoad() {
            try {
                // fetch config
                let resp = await axios({ url: `https://config.chub.page/config?domain=${domain}`, method: "GET" });
                if (resp.status !== 200) {
                    setLoaderAnimation(false);
                    setTitle("The Drivers Hub Project (CHub)");
                    vars.dhlogo = await loadImageAsBase64(`https://cdn.chub.page/assets/logo.png`);
                    setLogoSrc(vars.dhlogo);
                    if (resp.data.error === "Service Suspended") {
                        setLoadMessage(<>Drivers Hub Suspended<br />Please ask the owner to complete the payment to CHub<br /><br /><a href="https://drivershub.charlws.com/">The Drivers Hub Project (CHub)</a></>);
                    } else if (resp.data.error === "Not Found") {
                        setLoadMessage(<>Drivers Hub Not Found<br />We currently do not operate Drivers Hub under this domain<br /><br /><a href="https://drivershub.charlws.com/">The Drivers Hub Project (CHub)</a></>);
                    }
                    return;
                }
                let loadedConfig = resp.data;
                vars.dhconfig = loadedConfig.config;
                vars.dhpath = `${vars.dhconfig.api_host}/${vars.dhconfig.abbr}`;

                if (vars.dhconfig.api_host === "https://drivershub.charlws.com") {
                    vars.vtcLevel = 3;
                } else if (vars.dhconfig.api_host === "https://drivershub05.charlws.com") {
                    vars.vtcLevel = 1;
                } else if (vars.dhconfig.api_host === "https://drivershub.charlws.com") {
                    vars.vtcLevel = 0;
                }

                setTitle(vars.dhconfig.name);
                try {
                    vars.dhlogo = await loadImageAsBase64(`https://cdn.chub.page/assets/${vars.dhconfig.abbr}/logo.png?${vars.dhconfig.logo_key !== undefined ? vars.dhconfig.logo_key : ""}`, fallback = "https://cdn.chub.page/assets/logo.png");
                } catch {
                    vars.dhlogo = "";
                }
                try {
                    vars.dhvtcbg = await loadImageAsBase64(`https://cdn.chub.page/assets/${vars.dhconfig.abbr}/bgimage.png?${vars.dhconfig.bgimage_key !== undefined ? vars.dhconfig.bgimage_key : ""}`);
                } catch {
                    vars.dhvtcbg = "";
                }
                setLogoSrc(vars.dhlogo);
                setBgSrc(vars.dhvtcbg);
                setLoadMessage(`Loading`);

                localStorage.setItem("preload-title", vars.dhconfig.name);
                localStorage.setItem("preload-icon", vars.dhlogo !== null ? vars.dhlogo : `https://cdn.chub.page/assets/${vars.dhconfig.abbr}/logo.png?${vars.dhconfig.logo_key !== undefined ? vars.dhconfig.logo_key : ""}`);
                localStorage.setItem("preload-background", vars.dhvtcbg !== null ? vars.dhvtcbg : `https://cdn.chub.page/assets/${vars.dhconfig.abbr}/bgimage.png?${vars.dhconfig.bgimage_key !== undefined ? vars.dhconfig.bgimage_key : ""}`);

                const urlsBatch = [
                    { url: `${vars.dhpath}/`, auth: false },
                    { url: "https://config.chub.page/roles", auth: false },
                    { url: "https://config.chub.page/patrons", auth: false },
                    { url: `https://config.chub.page/config/user?abbr=${vars.dhconfig.abbr}`, auth: false },
                    { url: `${vars.dhpath}/config`, auth: false },
                    { url: `${vars.dhpath}/languages`, auth: false },
                    { url: `${vars.dhpath}/member/roles`, auth: false },
                    { url: `${vars.dhpath}/member/perms`, auth: false },
                    { url: `${vars.dhpath}/member/ranks`, auth: false },
                    { url: `${vars.dhpath}/applications/types`, auth: false },
                    { url: `${vars.dhpath}/divisions/list`, auth: false },
                    { url: `${vars.dhpath}/dlog/statistics/details`, auth: true },
                ];

                const [index, specialRoles, patrons, userConfig, config, languages, memberRoles, memberPerms, memberRanks, applicationTypes, divisions, dlogDetails] = await makeRequestsAuto(urlsBatch);
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
                    vars.discordClientID = config.config.discord_client_id;
                    vars.apiconfig = config.config;
                    if (compareVersions(vars.apiversion, "2.8.6") < 0) {
                        vars.apiconfig.trackers = vars.apiconfig.tracker;
                    }
                }
                if (languages) {
                    vars.languages = languages.supported;
                }
                if (memberRoles) {
                    let roles = memberRoles;
                    for (let i = 0; i < roles.length; i++) {
                        vars.roles[roles[i].id] = roles[i];
                    }
                    vars.orderedRoles = roles.sort((a, b) => a.order_id - b.order_id).map(role => role.id);
                }
                if (memberPerms) {
                    vars.perms = memberPerms;
                }
                if (memberRanks) {
                    vars.ranks = memberRanks;
                }
                if (applicationTypes) {
                    for (let i = 0; i < applicationTypes.length; i++) {
                        vars.applicationTypes[applicationTypes[i].id] = applicationTypes[i];
                    }
                }
                if (divisions) {
                    for (let i = 0; i < divisions.length; i++) {
                        vars.divisions[divisions[i].id] = divisions[i];
                    }
                }
                if (dlogDetails && dlogDetails.error === undefined) {
                    vars.dlogDetails = dlogDetails;
                }

                await FetchProfile();

                const themeUpdated = new CustomEvent('themeUpdated', {});
                window.dispatchEvent(themeUpdated);

                onLoaderLoaded();
            } catch (error) {
                setLoaderAnimation(false);
                console.error("An error occurred when initializing!");
                console.error(error);
                setLoadMessage("Error occurred! Check F12 for more info.");
            }
        }
        doLoad();
    }, [onLoaderLoaded]);

    function intToHex(intValue) {
        const scaledInt = Math.floor(intValue * 255 / 100);
        let hexValue = scaledInt.toString(16);
        if (hexValue.length === 1) hexValue = '0' + hexValue;
        return hexValue;
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
            <div className="loading-div" style={{ backgroundColor: theme.palette.background.default.substring(0, 7) + (vars.userSettings.theme_darken_ratio !== null ? intToHex(vars.userSettings.theme_darken_ratio * 100) : "66") }}>
                <HelmetProvider>
                    <Helmet>
                        <title>{title}</title>
                        {logoSrc && <link rel="icon" href={logoSrc} type="image/x-icon" />}
                        {logoSrc && <link rel="apple-touch-icon" href={logoSrc} />}
                    </Helmet>
                </HelmetProvider>
                {logoSrc && <img src={logoSrc} className={`loader ${animateLoader ? "loader-animated" : ""}`} alt="" />}
                <p>
                    {loadMessage}
                </p>
            </div>
        </div>
    );
};

export default Loader;