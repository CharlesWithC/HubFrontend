import { useState, useEffect, useCallback, useContext, useRef } from "react";
import { useTranslation } from "react-i18next";
import { AppContext, ThemeContext } from "../context";

import { HelmetProvider, Helmet } from "react-helmet-async";
import { Typography, TextField, Button, useTheme } from "@mui/material";

import { FetchProfile, loadImageAsBase64, customAxios as axios, makeRequestsAuto, writeLS, readLS, getAuthToken } from "../functions";

const TIPS = ["The pre-login avatar belongs to CharlesWithC (a.k.a Drak0). He's a Night Fury.", "We've got a website which may solve your problems: wiki.charlws.com", "Find hidden features by hovering on the + in the bottom right.", "Some components have context menus. Right-click to find out.", "Multiple rankings is supported, but you'll need JSON knowledge to manage them.", "All statistics and points are traceable, allowing data fetching of any time range."];

const tip = TIPS[Math.floor(Math.random() * TIPS.length)];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const Loader = ({ onLoaderLoaded }) => {
  const [domain, setDomain] = useState(window.location.hostname !== "localhost" ? window.location.hostname : window.dhhost);

  const { t: tr } = useTranslation();
  const appContext = useContext(AppContext);
  const { apiPath, setApiPath, setApiVersion, vtcLogo, setVtcLogo, vtcBanner, setVtcBanner, vtcBackground, setVtcBackground, setUserConfig, setApiConfig, webConfig, setWebConfig, setUsers, setCurUID, loadADPlugins, loadLanguages, setAllRoles, setAllPerms, setAllRanks, loadMemberUIDs, loadDlogDetails } = useContext(AppContext);
  const { themeSettings, setThemeSettings } = useContext(ThemeContext);

  const [isMember, setIsMember] = useState(false);

  const theme = useTheme();
  const [animateLoader, setLoaderAnimation] = useState(true);
  const [title, setTitle] = useState(domain !== null && domain !== "" ? (localStorage.getItem("cache-title") !== null ? localStorage.getItem("cache-title") : tr("drivers_hub")) : null);
  const [loadMessage, setLoadMessage] = useState(!window.isElectron || vtcLogo !== null ? tr("loading") : "");
  const [unknownDomain, setUnknownDomain] = useState(false);

  const errorBlock = useRef(null);
  const loadingStart = useRef(null); // a timestamp
  const [showLoadingPage, setShowLoadingPage] = useState(localStorage.getItem("cache-web-config") === null || localStorage.getItem("cache-preload") === null);
  // we'll show loading page after 1 second if cache is on
  // since cache is used, showing it immediately may lead to flickering
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (loadingStart.current !== null && +new Date() - loadingStart.current > 1000) {
        setShowLoadingPage(true);
        clearInterval(intervalId);
      }
    }, 100);
    return () => clearInterval(intervalId);
  }, []);

  const doLoad = useCallback(async () => {
    if (webConfig !== null) return;

    try {
      if (import.meta.env.VITE_USE_MULTIHUB == "true" && (domain === undefined || domain === null || domain === "")) {
        setLoaderAnimation(false);
        setTitle(tr("drivers_hub"));
        setUnknownDomain(true);
        setLoadMessage(tr("drivers_hub_not_found"));
        return;
      }

      loadingStart.current = +new Date();

      // load web config, return webConfig or throw error
      async function loadWebConfig(domain) {
        let resp = await axios({ url: import.meta.env.VITE_USE_MULTIHUB == "true" ? import.meta.env.VITE_MULTIHUB_DISCOVERY + "?domain=" + domain : import.meta.env.VITE_CONFIG_URL, method: "GET" });
        if (resp.status !== 200) {
          setLoaderAnimation(false);
          setTitle(tr("drivers_hub"));
          setLoadMessage(
            <>
              {tr("drivers_hub_is_experiencing_a_temporary_outage")}
              <br />
              {tr("please_refresh_the_page_later_and_report_the_incident_if")}
            </>
          );
          throw new Error("Drivers Hub is not active");
        }

        const webConfig = resp.data; // local webConfig for this function only
        setWebConfig(webConfig);
        setTitle(webConfig.name);
        setApiPath(`${webConfig.api_host}/${webConfig.abbr}`);

        setLoadMessage(tr("loading"));
        localStorage.setItem("cache-title", webConfig.name);

        return webConfig;
      }
      let cachedWebConfig = readLS("cache-web-config", window.dhhost);
      let webConfig = {}, apiPath = "";
      if (cachedWebConfig === null) {
        try {
          webConfig = await loadWebConfig(domain);
          apiPath = `${webConfig.api_host}/${webConfig.abbr}`;
        } catch {
          return;
        }
      } else {
        webConfig = cachedWebConfig;
        apiPath = `${webConfig.api_host}/${webConfig.abbr}`;
        setWebConfig(webConfig);
        setTitle(webConfig.name);
        setApiPath(apiPath);
        setLoadMessage(tr("loading"));
        loadWebConfig(domain).catch(() => {
          // something went wrong, let's clear cache and reload (rarely happens so it's fine to reload)
          // if everything went smooth, updated data would just be written
          localStorage.removeItem("cache-web-config");
          window.location.reload();
        });
      }

      // load images
      Promise.all([
        loadImageAsBase64(`${apiPath}/client/assets/logo?key=${webConfig.logo_key !== undefined ? webConfig.logo_key : ""}`)
          .then(image => {
            setVtcLogo(image);
            try {
              if (window.electron) {
                localStorage.setItem("cache-logo", image);
              }
            } catch { }
          })
          .catch(() => {
            setVtcLogo("");
          }),
        loadImageAsBase64(`${apiPath}/client/assets/banner?key=${webConfig.banner_key !== undefined ? webConfig.banner_key : ""}`)
          .then(image => {
            setVtcBanner(image);
            try {
              if (window.electron) {
                localStorage.setItem("cache-banner", image);
              }
            } catch { }
          })
          .catch(() => {
            setVtcBanner("");
          }),
        loadImageAsBase64(`${apiPath}/client/assets/bgimage?key=${webConfig.bgimage_key !== undefined ? webConfig.bgimage_key : ""}`)
          .then(image => {
            setVtcBackground(image);
            try {
              if (window.electron) {
                localStorage.setItem("cache-background", image);
              }
            } catch { }
          })
          .catch(() => {
            setVtcBackground("");
          }),
      ]);

      // load api version and status in background
      async function loadApi(apiPath) {
        // we use a cors proxy just in case it's bad gateway and nginx fails to handle cors headers
        const [apiBase, apiStatus] = await makeRequestsAuto([
          { url: `${apiPath}/`, auth: false },
          { url: `${apiPath}/status`, auth: false },
        ]);

        if (apiBase) {
          setApiVersion(apiBase.version);
        }

        if (apiStatus) {
          if (apiStatus.database === "unavailable") {
            errorBlock.current = true; // retrying, don't quite loading page
            setLoadMessage(
              <>
                {tr("drivers_hub_is_experiencing_a_database_outage")}
                <br />
                {tr("an_attempt_has_been_made_to_restart_the_database")}
              </>
            );
            await axios({ url: `${apiPath}/status/database/restart`, method: "POST" });
            await sleep(1000);

            let ok = false;
            for (let i = 0; i < 5; i++) {
              let resp = await axios({ url: `${apiPath}/status`, method: "GET" });
              if (resp.data.database === "unavailable") {
                setLoadMessage(
                  <>
                    {tr("drivers_hub_is_experiencing_a_database_outage")}
                    <br />
                    {tr("an_attempt_has_been_made_to_restart_the_database")}
                  </>
                );
                await axios({ url: `${apiPath}/status/database/restart`, method: "POST" });
                await sleep(i * 1000 + 2000);
              } else {
                setLoadMessage(
                  <>
                    {tr("drivers_hub_database_is_back_online")}
                    <br />
                    {tr("loading_has_resumed")}
                  </>
                );
                ok = true;
                await sleep(1000);
                errorBlock.current = false; // retry succeed, quit loading if it's still loadinhg
                break;
              }
            }
            if (!ok) {
              setLoaderAnimation(false);
              setLoadMessage(
                <>
                  {tr("drivers_hub_is_experiencing_a_database_outage")}
                  <br />
                  {tr("the_attempt_to_restart_the_database_has_failed")}
                  <br />
                  {tr("please_refresh_the_page_later_and_report_the_incident_if")}
                </>
              );
              throw new Error("Drivers Hub Database Outage");
            }
          }
        }
      }
      let apiFlag = localStorage.getItem("load-api-flag");
      if (apiFlag !== null) {
        // an error was flagged, let's just load it with block
        try {
          await loadApi(apiPath);
          localStorage.removeItem("load-api-flag"); // things are back to normal
        } catch {
          return;
        }
      } else {
        // another regular load, would errors occur?
        // NOTE: for database errors, errorBlock would be updated to prevent
        // doLoad from finishing to wait for a catch here
        loadApi(apiPath).catch(() => {
          // something went wrong, let's flag it and reload (rarely happens so it's fine to reload)
          // if everything went smooth, nothing would be sensed by the user
          localStorage.setItem("load-api-flag", 1);
          window.location.reload();
        });
      }

      // load drivers hub data
      async function preloadData(wait = 0) {
        await sleep(wait);

        const urlsBatch1 = [
          { url: `${apiPath}/client/config/user`, auth: false },
        ];

        const [userConfig] = await makeRequestsAuto(urlsBatch1);

        if (userConfig) {
          setUserConfig(userConfig);
        }

        // drivers hub data
        // NOTE: /config may lead to error being detected
        const urlsBatch2 = [
          { url: `${apiPath}/config`, auth: false },
          { url: `${apiPath}/member/roles`, auth: false },
          { url: `${apiPath}/member/perms`, auth: false },
          { url: `${apiPath}/member/ranks`, auth: false },
        ];

        const [config, memberRoles, memberPerms, memberRanks] = await makeRequestsAuto(urlsBatch2);

        if (config) {
          if (config.config === undefined) {
            if (config.error !== undefined) {
              setLoaderAnimation(false);
              setLoadMessage(
                <>
                  An error has occurred while loading: <br />
                  {config.error}
                  <br />
                  Please try again later and report the issue if it persists.
                </>
              );
              throw new Error("Error occurred on loading API config");
            } else {
              setLoaderAnimation(false);
              setTitle(tr("drivers_hub"));
              setUnknownDomain(true);
              setLoadMessage(tr("drivers_hub_not_found"));
              throw new Error("Drivers Hub is not active");
            }
          }
          setApiConfig(config.config);
        }
        let allRoles = {};
        if (memberRoles) {
          for (let i = 0; i < memberRoles.length; i++) allRoles[memberRoles[i].id] = memberRoles[i];
          setAllRoles(allRoles);
        }
        if (memberPerms) {
          setAllPerms(memberPerms);
        }
        if (memberRanks) {
          setAllRanks(memberRanks);
        }

        const preloadCache = { userConfig, apiConfig: config.config, allRoles, allPerms: memberPerms, allRanks: memberRanks };
        writeLS("cache-preload", preloadCache, window.dhhost);

        return preloadCache;
      }

      let { userConfig, apiConfig, allRoles, allPerms, allRanks } = {};

      const cachePreload = readLS("cache-preload", window.dhhost);
      let dataFlag = localStorage.getItem("load-data-flag");

      if (cachePreload !== null && dataFlag === null) {
        ({ userConfig, apiConfig, allRoles, allPerms, allRanks } = cachePreload);
        setUserConfig(userConfig);
        setApiConfig(apiConfig);
        setAllRoles(allRoles);
        setAllPerms(allPerms);
        setAllRanks(allRanks);

        preloadData(500).catch(() => {
          // something went wrong, let's flag it and reload (rarely happens so it's fine to reload)
          // if everything went smooth, nothing would be sensed by the user
          localStorage.setItem("load-data-flag", 1);
          window.location.reload();
        });
      } else {
        try {
          ({ userConfig, apiConfig, allRoles, allPerms, allRanks } = await preloadData());
          localStorage.removeItem("load-data-flag"); // things are back to normal
        } catch {
          return;
        }
      }

      // we'll use cached user first and then check authentication in background
      // not everything about the user will be loaded from cache, but it's enough for now
      const bearerToken = getAuthToken();
      if (bearerToken !== null && localStorage.getItem("cache-user") !== null) {
        const curUser = readLS("cache-user", window.dhhost + bearerToken);
        setUsers(users => ({ ...users, [curUser.uid]: curUser }));
        setCurUID(curUser.uid);
        setIsMember(curUser.userid !== undefined && curUser.userid !== null && curUser.userid !== -1);

        FetchProfile({ ...appContext, apiPath: apiPath, webConfig: webConfig }).then(auth => {
          setIsMember(auth.member);
        });
      } else {
        let auth = await FetchProfile({ ...appContext, apiPath: apiPath, webConfig: webConfig });
        setIsMember(auth.member);
      }

      while (errorBlock.current === true) {
        // wait for updates from automatic error resolution
        await sleep(100);
      }

      loadingStart.current = null; // clear it so loading page will not be shown if 1 sec is not reached

      setThemeSettings(prevSettings => ({ ...prevSettings })); // refresh theme settings
      onLoaderLoaded(); // finish loading
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
    if (apiPath !== "") {
      loadLanguages();
      loadADPlugins();
    }
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
      largeImageKey: "https://drivershub.charlws.com/images/logo.png",
      startTimestamp: new Date(),
      instance: false,
      buttons: [],
    });
  }

  return (
    <div
      style={{
        backgroundImage: showLoadingPage ? `url(${vtcBackground})` : "",
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
      }}>
      <div className="loading-div" style={{ backgroundColor: theme.palette.background.default.substring(0, 7) + "66" }}>
        <HelmetProvider>
          <Helmet>
            <title>{title}</title>
            {vtcLogo !== null && vtcLogo !== "" && <link rel="icon" href={vtcLogo} type="image/x-icon" />}
            {vtcLogo !== null && vtcLogo !== "" && <link rel="apple-touch-icon" href={vtcLogo} />}
          </Helmet>
        </HelmetProvider>
        {showLoadingPage && (
          <>
            {vtcLogo !== null && vtcLogo !== "" && <img src={vtcLogo} className={`loader ${animateLoader ? "loader-animated" : ""}`} alt="" style={{ marginBottom: "10px" }} />}
            {(!window.isElectron || !unknownDomain) && (
              <Typography variant="body1" sx={{ fontSize: "25px" }}>
                {loadMessage}
              </Typography>
            )}
            {(!window.isElectron || !unknownDomain) && animateLoader && (
              <Typography variant="body2" sx={{ fontSize: "15px", opacity: 0.8 }}>
                {tip}
              </Typography>
            )}
          </>
        )}
        {window.isElectron && unknownDomain && (
          <>
            <Typography variant="body1" sx={{ mb: "10px" }}>
              {tr("enter_the_drivers_hub_domain_to_start_your_app_experience")}
            </Typography>
            <TextField
              label={tr("domain")}
              variant="outlined"
              value={!domain.startsWith("localhost") ? domain : ""}
              onChange={e => {
                setDomain(e.target.value);
              }}
              onKeyDown={e => {
                if (e.key === tr("enter")) {
                  handleDomainUpdate();
                }
              }}
              style={{ width: "100%", maxWidth: "400px", marginBottom: "10px" }}
            />
            <Button variant="contained" color="info" style={{ width: "100%", maxWidth: "400px", marginBottom: "10px" }} onClick={handleDomainUpdate}>
              {tr("confirm")}
            </Button>
            <Typography variant="body1" sx={{ mt: "10px" }}>
              {tr("get_custom_build_with_vtc_icon_and_discord_rich_presence")}
              <br />
              {tr("available_for_vtcs_with_more_than_5_platinum_8_gold")}
            </Typography>
          </>
        )}
      </div>
    </div>
  );
};

export default Loader;
