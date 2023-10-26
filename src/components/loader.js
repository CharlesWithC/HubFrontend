import { useState, useEffect } from 'react';
import { HelmetProvider, Helmet } from 'react-helmet-async';

import { FetchProfile, loadImageAsBase64, customAxios as axios, makeRequestsAuto, getAuthToken } from '../functions';
import { useTheme } from '@emotion/react';

var vars = require('../variables');

var domain = localStorage.getItem("domain");
if (domain === null) {
    domain = window.location.host;
}

// TODO Consider returning the assets links in config.chub.page rather than directly using cdn.chub.page (static)
// Also TODO, rename navio_company_id to tracker_company_id

const Loader = ({ onLoaderLoaded }) => {
    const theme = useTheme();
    const [animateLoader, setLoaderAnimation] = useState(true);
    const [logoSrc, setLogoSrc] = useState(null);
    const [title, setTitle] = useState("Drivers Hub");
    const [loadMessage, setLoadMessage] = useState("Loading");

    if (localStorage.getItem("preload-title") != null && localStorage.getItem("preload-icon") != null
        && title === "Drivers Hub" && logoSrc === null) {
        setTitle(localStorage.getItem("preload-title"));
        setLogoSrc(localStorage.getItem("preload-icon"));
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
                    setTitle("CHub - Drivers Hub");
                    vars.dhlogo = await loadImageAsBase64(`https://drivershub.charlws.com/images/logo.png`);
                    setLogoSrc(vars.dhlogo);
                    if (resp.data.error === "Service Suspended") {
                        setLoadMessage(<>Drivers Hub Suspended<br />Please ask the owner to complete the payment for CHub<br /><br /><a href="https://drivershub.charlws.com/">CHub - Drivers Hub</a></>);
                    } else if (resp.data.error === "Not Found") {
                        setLoadMessage(<>Drivers Hub Not Found<br />We currently do not operate Drivers Hub under this domain<br /><br /><a href="https://drivershub.charlws.com/">CHub - Drivers Hub</a></>);
                    }
                    return;
                }
                let loadedConfig = resp.data;
                vars.dhconfig = loadedConfig.config;
                vars.dhpath = `${vars.dhconfig.api_host}/${vars.dhconfig.abbr}`;

                setTitle(vars.dhconfig.name);
                try {
                    vars.dhlogo = await loadImageAsBase64(`https://cdn.chub.page/assets/${vars.dhconfig.abbr}/logo.png?${vars.dhconfig.logo_key !== undefined ? vars.dhconfig.logo_key : ""}`);
                } catch {
                    vars.dhlogo = "";
                }
                setLogoSrc(vars.dhlogo);
                setLoadMessage(`Loading`);

                localStorage.setItem("preload-title", vars.dhconfig.name);
                localStorage.setItem("preload-icon", `https://cdn.chub.page/assets/${vars.dhconfig.abbr}/logo.png?${vars.dhconfig.logo_key !== undefined ? vars.dhconfig.logo_key : ""}`);

                const urlsBatch1 = [
                    { url: `${vars.dhpath}`, auth: false },
                    { url: "https://config.chub.page/roles", auth: false },
                    { url: "https://config.chub.page/config/user", auth: false },
                    { url: `${vars.dhpath}/config`, auth: false },
                    { url: `${vars.dhpath}/member/roles`, auth: false },
                    { url: `${vars.dhpath}/member/perms`, auth: false },
                    { url: `${vars.dhpath}/member/ranks`, auth: false },
                    { url: `${vars.dhpath}/announcements/types`, auth: false },
                    { url: `${vars.dhpath}/applications/positions`, auth: false },
                    { url: `${vars.dhpath}/applications/types`, auth: false },
                    { url: `${vars.dhpath}/divisions/list`, auth: false },
                ];
                const urlsBatch2 = [
                    { url: `${vars.dhpath}/dlog/statistics/details`, auth: true },
                    { url: `${vars.dhpath}/economy`, auth: true },
                    { url: `${vars.dhpath}/economy/garages`, auth: true },
                    { url: `${vars.dhpath}/economy/trucks`, auth: true },
                    { url: `${vars.dhpath}/economy/merch`, auth: true },
                ];

                const [index, specialRoles, userConfig, config, memberRoles, memberPerms, memberRanks, announcementTypes, applicationPositions, applicationTypes, divisions] = await makeRequestsAuto(urlsBatch1);
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
                if (userConfig) {
                    vars.userConfig = userConfig;
                }
                if (config) {
                    vars.discordClientID = config.config.discord_client_id;
                    vars.apiconfig = config.config;
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
                if (announcementTypes) {
                    vars.announcementTypes = announcementTypes;
                }
                if (applicationPositions) {
                    vars.applicationPositions = applicationPositions;
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
                if (getAuthToken() !== null) {
                    const [dlogDetails, economyConfig, economyGarages, economyTrucks, economyMerch] = await makeRequestsAuto(urlsBatch2);
                    if (dlogDetails && dlogDetails.error === undefined) {
                        vars.dlogDetails = dlogDetails;
                    }
                    if (economyConfig) {
                        vars.economyConfig = economyConfig;
                    }
                    if (economyGarages) {
                        vars.economyGarages = economyGarages;
                        for (let i = 0; i < economyGarages.length; i++) {
                            vars.economyGaragesMap[economyGarages[i].id] = economyGarages[i];
                        }
                    }
                    if (economyTrucks) {
                        vars.economyTrucks = economyTrucks;
                    }
                    if (economyMerch) {
                        vars.economyMerch = economyMerch;
                        for (let i = 0; i < economyMerch.length; i++) {
                            vars.economyMerchMap[economyMerch[i].id] = economyMerch[i];
                        }
                    }
                }

                await FetchProfile();

                if (window.location.hostname !== "localhost" && !["hub.atmvtc.com", "hub.gokboru.net.tr", "hub.movezenvtc.com", "hub.lightninglogisticsvtc.com", "hub.logisticaxtnt.com", "hub.plvtc.com", "md.chub.page", "hub.routevtc.com.tr", "hub.globaltrucking.uk", "midlandgloballogistics.chub.page"].includes(domain)) {
                    if (!vars.isLoggedIn) {
                        setLoaderAnimation(false);
                        setLoadMessage("You must login from alpha web client first!");
                        return;
                    }
                    if (!Object.keys(vars.specialRolesMap).includes(vars.userInfo.discordid)) {
                        setLoaderAnimation(false);
                        setLoadMessage("You are not eligible for CHub Web Client V3 Early Access!");
                        return;
                    }
                }

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

    return (
        <div className="loading-div" style={{ backgroundColor: theme.palette.background.default }}>
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
    );
};

export default Loader;