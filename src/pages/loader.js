
import { loadConfig } from '../functions/config';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';

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
    const [loadMessage, setLoadMessage] = useState("");

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

                // load cache
                const specialRolesResp = await axios({ url: "https://config.chub.page/roles" });
                if (specialRolesResp.status === 200) {
                    vars.specialRoles = specialRolesResp.data;
                }

                const configResp = await axios({ url: `${vars.dhpath}/config` });
                if (configResp.status === 200) {
                    vars.discordClientID = configResp.data.config.discord_client_id;
                }

                const memberRolesResp = await axios({ url: `${vars.dhpath}/member/roles` });
                if (memberRolesResp.status === 200) {
                    let roles = memberRolesResp.data;
                    for (let i = 0; i < roles.length; i++) {
                        vars.roles[roles[i].id] = roles[i];
                    }
                }

                const memberPermsResp = await axios({ url: `${vars.dhpath}/member/perms` });
                if (memberPermsResp.status === 200) {
                    vars.perms = memberPermsResp.data;
                }

                const memberRanksResp = await axios({ url: `${vars.dhpath}/member/ranks` });
                if (memberRanksResp.status === 200) {
                    let ranks = memberRanksResp.data;
                    for (let i = 0; i < ranks.length; i++) {
                        vars.ranks[ranks[i].points] = ranks[i];
                    }
                }

                const applicationPositionsResp = await axios({ url: `${vars.dhpath}/applications/positions` });
                if (applicationPositionsResp.status === 200) {
                    vars.applicationPositions = applicationPositionsResp.data;
                }

                const applicationTypesResp = await axios({ url: `${vars.dhpath}/applications/types` });
                if (applicationTypesResp.status === 200) {
                    let applicationTypes = applicationTypesResp.data;
                    for (let i = 0; i < applicationTypes.length; i++) {
                        vars.applicationTypes[applicationTypes[i].id] = applicationTypes[i];
                    }
                }

                const divisionsResp = await axios({ url: `${vars.dhpath}/divisions/list` });
                if (divisionsResp.status === 200) {
                    let divisions = divisionsResp.data;
                    for (let i = 0; i < divisions.length; i++) {
                        vars.divisions[divisions[i].id] = divisions[i];
                    }
                }

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
            <Helmet>
                <title>{title}</title>
                {logoSrc && <link rel="icon" href={logoSrc} type="image/x-icon" />}
                {logoSrc && <link rel="apple-touch-icon" href={logoSrc} />}
            </Helmet>
            {logoSrc && <img src={logoSrc} className={`loader ${animateLoader ? "loader-animated" : ""}`} alt=""/>}
            <p>
                {loadMessage}
            </p>
        </div>
    );
}

export default Loader;