
import { loadConfig } from '../functions/config';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { FetchProfile } from '../functions';

const axiosRetry = require('axios-retry');
axiosRetry(axios, {
    retries: 3,
    retryDelay: (retryCount) => {
        console.log(`retry attempt: ${retryCount}`);
        return retryCount * 1000;
    },
    retryCondition: (error) => {
        return error.response === undefined || error.response.status in [429, 503];
    },
});

var vars = require('../variables');

const domain = "hub.atmvtc.com"; // use window.location.hostname

// TODO Consider returning the assets links in config.chub.page rather than directly using cdn.chub.page (static)
// Also TODO, rename navio_company_id to tracker_company_id

function Loader({ onLoaderLoaded }) {
    const [animateLoader, setLoaderAnimation] = useState(true);
    const [logoSrc, setLogoSrc] = useState(null);
    const [title, setTitle] = useState("Drivers Hub");
    const [loadMessage, setLoadMessage] = useState("Loading");

    if (localStorage.getItem("preload-title") != null && localStorage.getItem("preload-icon") != null
        && title === "Drivers Hub" && logoSrc === null) {
        setTitle(localStorage.getItem("preload-title"));
        setLogoSrc(localStorage.getItem("preload-icon"));
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
                setLogoSrc(`https://cdn.chub.page/assets/${vars.dhconfig.abbr}/logo.png`);
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
                    `${vars.dhpath}/applications/positions`,
                    `${vars.dhpath}/applications/types`,
                    `${vars.dhpath}/divisions/list`,
                ];

                const [specialRoles, config, memberRoles, memberPerms, memberRanks, applicationPositions, applicationTypes, divisions] = await makeRequests(urlsBatch);
                if (specialRoles) {
                    vars.specialRoles = specialRoles;
                }
                if (config) {
                    vars.discordClientID = config.config.discord_client_id;
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
                    let ranks = memberRanks;
                    for (let i = 0; i < ranks.length; i++) {
                        vars.ranks[ranks[i].points] = ranks[i];
                    }
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

                onLoaderLoaded();
            } catch (error) {
                setLoaderAnimation(false);
                console.error("An error occurred when loading configuration!");
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
}

export default Loader;