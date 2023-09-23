import { useState, useEffect } from 'react';
import { HelmetProvider, Helmet } from 'react-helmet-async';

import { loadConfig } from '../functions/config';
import { FetchProfile, loadImageAsBase64, customAxios as axios } from '../functions';

var vars = require('../variables');

var domain = localStorage.getItem("domain");
if (domain === null) {
    domain = window.location.host;
}

// TODO Consider returning the assets links in config.chub.page rather than directly using cdn.chub.page (static)
// Also TODO, rename navio_company_id to tracker_company_id

const Loader = ({ onLoaderLoaded }) => {
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

    useEffect(() => {
        async function doLoad() {
            try {
                // fetch config
                let loadedConfig = (await loadConfig(domain));
                vars.dhconfig = loadedConfig.config;
                vars.dhapplication = loadedConfig.application;
                vars.dhstyle = loadedConfig.style;
                vars.dhpath = `${vars.dhconfig.api_host}/${vars.dhconfig.abbr}`;

                setTitle(vars.dhconfig.name);
                try {
                    vars.dhlogo = await loadImageAsBase64(`https://cdn.chub.page/assets/${vars.dhconfig.abbr}/logo.png`);
                } catch {
                    vars.dhlogo = "";
                }
                setLogoSrc(vars.dhlogo);
                setLoadMessage(`Loading`);

                localStorage.setItem("preload-title", vars.dhconfig.name);
                localStorage.setItem("preload-icon", `https://cdn.chub.page/assets/${vars.dhconfig.abbr}/logo.png`);

                // load cache
                const makeRequests = async (urls) => {
                    const responses = await Promise.all(
                        urls.map((url) =>
                            axios({
                                url,
                            })
                        )
                    );
                    return responses.map((response) => response.data);
                };

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
                            vars.specialRoles[specialRoles[keys[i]][j]] = SPECIAL_COLOR[keys[i]];
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

                if (!vars.isLoggedIn) {
                    setLoaderAnimation(false);
                    setLoadMessage("You must login from alpha web client first!");
                    return;
                }
                if (!["#9a63c2", "#2fc1f7", "#e488b9", "#e75757", "#f6529a", "#ecb484"].includes(vars.specialRoles[vars.userInfo.discordid])) {
                    setLoaderAnimation(false);
                    setLoadMessage("You are not eligible for CHub Web Client V3 Early Access!");
                    return;
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
        <div className="loading-div">
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