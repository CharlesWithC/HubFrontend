import { useState, useEffect } from 'react';
import { HelmetProvider, Helmet } from 'react-helmet-async';

import { FetchProfile, loadImageAsBase64, customAxios as axios, makeRequests } from '../functions';
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

                var urlsBatch = [
                    "https://config.chub.page/roles",
                    `${vars.dhpath}/config`,
                    `${vars.dhpath}/member/roles`,
                    `${vars.dhpath}/member/perms`,
                    `${vars.dhpath}/member/ranks`,
                    `${vars.dhpath}/announcements/types`,
                    `${vars.dhpath}/applications/positions`,
                    `${vars.dhpath}/applications/types`,
                    `${vars.dhpath}/divisions/list`,
                ];

                const [specialRoles, config, memberRoles, memberPerms, memberRanks, announcementTypes, applicationPositions, applicationTypes, divisions] = await makeRequests(urlsBatch);
                if (specialRoles) {
                    const SPECIAL_COLOR = { "project_team": "#2fc1f7", "community_manager": "#e488b9", "development_team": "#e75757", "support_manager": "#f6529a", "marketing_manager": "#ecb484", "support_team": "#b12773", "marketing_team": "#e28843", "graphic_team": "#11b17f", "translation_team": "#49a4af", "community_legend": "#b2db80", "patron": "#DAA520", "server_booster": "#DAA520", "fv3ea": "#9a63c2" };
                    let keys = Object.keys(specialRoles);
                    for (let i = 0; i < keys.length; i++) {
                        for (let j = 0; j < specialRoles[keys[i]].length; j++) {
                            if (!Object.keys(specialRoles).includes(specialRoles[keys[i]][j]))
                                vars.specialRoles[specialRoles[keys[i]][j]] = [];
                            vars.specialRoles[specialRoles[keys[i]][j]].push({ "name": keys[i], "color": SPECIAL_COLOR[keys[i]] });
                        }
                    }
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

                await FetchProfile();

                if (!["hub.atmvtc.com", "hub.gokboru.net.tr", "hub.movezenvtc.com", "hub.lightninglogisticsvtc.com", "hub.logisticaxtnt.com"].includes(domain)) {
                    if (!vars.isLoggedIn) {
                        setLoaderAnimation(false);
                        setLoadMessage("You must login from alpha web client first!");
                        return;
                    }
                    if (!Object.keys(vars.specialRoles).includes(vars.userInfo.discordid)) {
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