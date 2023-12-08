import { useState, useEffect, useCallback } from 'react';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { Typography, TextField, Button } from '@mui/material';

import { FetchProfile, loadImageAsBase64, customAxios as axios, makeRequestsAuto, compareVersions, writeLS, readLS } from '../functions';
import { useTheme } from '@emotion/react';

import { useTranslation } from 'react-i18next';

var vars = require('../variables');

const Loader = ({ onLoaderLoaded }) => {
    const [domain, setDomain] = useState(localStorage.getItem("domain") !== null ? localStorage.getItem("domain") : vars.host);

    const { t: tr } = useTranslation();

    const theme = useTheme();
    const [animateLoader, setLoaderAnimation] = useState(true);
    const [logoSrc, setLogoSrc] = useState(null);
    const [bgSrc, setBgSrc] = useState(null);
    const [title, setTitle] = useState(tr("drivers_hub"));
    const [loadMessage, setLoadMessage] = useState(!window.isElectron ? tr("loading") : "");
    const [unknownDomain, setUnknownDomain] = useState(false);

    const searchParams = new URLSearchParams(window.location.search);
    if (window.location.hostname === "localhost" && searchParams.get("domain") !== null) {
        setDomain(searchParams.get("domain"));
        localStorage.setItem("domain", domain);
    }

    if (localStorage.getItem("update-discord") !== null && +new Date() - localStorage.getItem("update-discord") > 60000) {
        localStorage.removeItem("update-discord");
    }
    if (localStorage.getItem("update-steam") !== null && +new Date() - localStorage.getItem("update-steam") > 60000) {
        localStorage.removeItem("update-steam");
    }

    async function doLoad() {
        if (vars.dhconfig !== null) return;

        try {
            // fetch config
            let resp = await axios({ url: `https://config.chub.page/config?domain=${domain}`, method: "GET" });
            if (resp.status !== 200) {
                setLoaderAnimation(false);
                setTitle("The Drivers Hub Project (CHub)");
                vars.dhlogo = await loadImageAsBase64(`https://cdn.chub.page/assets/logo.png`);
                setLogoSrc(vars.dhlogo);
                if (resp.data.error === tr("service_suspended")) {
                    setLoadMessage(<>{tr("drivers_hub_suspended")}<br />{tr("ask_for_payment")}<br /><br /><a href="https://drivershub.charlws.com/">The Drivers Hub Project (CHub)</a></>);
                } else if (resp.data.error === tr("not_found")) {
                    setUnknownDomain(true);
                    setLoadMessage(<>{tr("drivers_hub_not_found")}<br />{tr("no_drivers_hub_under_domain")}<br /><br /><a href="https://drivershub.charlws.com/">The Drivers Hub Project (CHub)</a></>);
                }
                return;
            }
            setLoadMessage(tr("loading"));
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
                vars.dhlogo = await loadImageAsBase64(`https://cdn.chub.page/assets/${vars.dhconfig.abbr}/logo.png?${vars.dhconfig.logo_key !== undefined ? vars.dhconfig.logo_key : ""}`, "https://cdn.chub.page/assets/logo.png");
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
            setLoadMessage(tr("loading"));

            let [index, specialRoles, patrons, userConfig, config, languages, memberRoles, memberPerms, memberRanks, applicationTypes, divisions, dlogDetails] = [null, null, null, null, null, null, null, null, null, null, null, null];
            let useCache = false;

            let cache = readLS("cache", vars.host + vars.dhconfig.abbr + vars.dhconfig.api_host);
            if (cache !== null) {
                if (cache.timestamp === undefined || +new Date() - cache.timestamp > 86400000) {
                    localStorage.removeItem("cache");
                } else {
                    useCache = true;
                    config = cache.config;
                    languages = cache.languages;
                    memberRoles = cache.memberRoles;
                    memberPerms = cache.memberPerms;
                    memberRanks = cache.memberRanks;
                    applicationTypes = cache.applicationTypes;
                    divisions = cache.divisions;
                    dlogDetails = cache.dlogDetails;
                    if (cache.members !== undefined) {
                        vars.members = cache.members;
                        for (let i = 0; i < vars.members.length; i++) {
                            vars.users[vars.members[i].uid] = vars.members[i];
                        }
                    }
                }
            }

            if (!useCache) {
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

                [index, specialRoles, patrons, userConfig, config, languages, memberRoles, memberPerms, memberRanks, applicationTypes, divisions, dlogDetails] = await makeRequestsAuto(urlsBatch);
            } else {
                const urlsBatch = [
                    { url: `${vars.dhpath}/`, auth: false },
                    { url: "https://config.chub.page/roles", auth: false },
                    { url: "https://config.chub.page/patrons", auth: false },
                    { url: `https://config.chub.page/config/user?abbr=${vars.dhconfig.abbr}`, auth: false },
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

            if (!useCache) {
                let cache = {
                    timestamp: +new Date(),
                    config: config,
                    languages: languages,
                    memberRoles: memberRoles,
                    memberPerms: memberPerms,
                    memberRanks: memberRanks,
                    applicationTypes: applicationTypes,
                    divisions: divisions,
                    dlogDetails: dlogDetails
                };
                writeLS("cache", cache, vars.host + vars.dhconfig.abbr + vars.dhconfig.api_host);
            }

            await FetchProfile();

            const themeUpdated = new CustomEvent('themeUpdated', {});
            window.dispatchEvent(themeUpdated);

            onLoaderLoaded();
        } catch (error) {
            setLoaderAnimation(false);
            console.error(tr("an_error_occurred_when_initializing"));
            console.error(error);
            setLoadMessage(tr("error_occurred"));
        }
    }
    useEffect(() => {
        doLoad();
    }, [onLoaderLoaded]);

    const handleDomainUpdate = useCallback(() => {
        localStorage.setItem("domain", domain);
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
                </>}
            </div>
        </div>
    );
};

export default Loader;