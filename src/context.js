import { useState, useEffect, useMemo, useCallback, createContext } from 'react';

import { makeRequestsAuto, makeRequestsWithAuth } from "./functions";
var vars = require("./variables");

export const AppContext = createContext({
    apiPath: "", setApiPath: () => { },
    apiVersion: "", setApiVersion: () => { },

    vtcLogo: localStorage.getItem("cache-logo"), setVtcLogo: () => { },
    vtcBanner: localStorage.getItem("cache-banner"), setVtcBanner: () => { },
    vtcBackground: localStorage.getItem("cache-background"), setVtcBackground: () => { },

    apiConfig: null, setApiConfig: () => { },
    webConfig: null, setWebConfig: () => { },
    languages: [], setLanguages: () => { },
    allRoles: {}, setAllRoles: () => { },
    allPerms: {}, setAllPerms: () => { },
    allRanks: {}, setAllRanks: () => { },

    users: {}, setUsers: () => { },
    userProfiles: {}, setUserProfiles: () => { },
    memberUIDs: [], setMemberUIDs: () => { },

    curUID: null, setCurUID: () => { },
    curUser: {}, setCurUser: () => { },
    curUserPerm: [], setCurUserPerm: () => { },
    curUserBanner: { name: "", role: "", avatar: "" }, setCurUserBanner: () => { },

    userSettings: { "notification_refresh_interval": 30, "unit": "metric", "radio": "disabled", "radio_type": "tsr", "radio_volume": 100, "display_timezone": Intl.DateTimeFormat().resolvedOptions().timeZone, "data_saver": false, "font_size": "regular", "default_row_per_page": 10, "language": null, "presence": "full" }, setUserSettings: () => { },
    // radio: enabled / disabled / auto-play (enabled)
    // radio-type: tsr / {url}

    announcementTypes: null, setAnnouncementTypes: () => { },
    applicationTypes: null, setApplicationTypes: () => { },
    divisions: null, setDivisions: () => { },

    dlogDetailsCache: {}, setDlogDetailsCache: () => { },
    economyCache: { config: null, trucks: [], garagesMap: {}, merchMap: {} }, setEconomyCache: () => { },
    allUsersCache: [], setAllUsersCache: () => { }, // only loaded to purge inactive

    loadMemberUIDs: async () => { },
    loadAnnouncementTypes: async () => { },
    loadApplicationTypes: async () => { },
    loadDivisions: async () => { },
    loadDlogDetails: async () => { },
    loadAllUsers: async () => { },
});

export const AppContextProvider = ({ children }) => {
    const [apiPath, setApiPath] = useState("");
    const [apiVersion, setApiVersion] = useState("");

    const [vtcLogo, setVtcLogo] = useState(localStorage.getItem("cache-logo"));
    const [vtcBanner, setVtcBanner] = useState(localStorage.getItem("cache-banner"));
    const [vtcBackground, setVtcBackground] = useState(localStorage.getItem("cache-background"));

    const [apiConfig, setApiConfig] = useState(null);
    const [webConfig, setWebConfig] = useState(null);
    const [languages, setLanguages] = useState([]);
    const [allRoles, setAllRoles] = useState({});
    const [allPerms, setAllPerms] = useState({});
    const [allRanks, setAllRanks] = useState({});

    const [users, setUsers] = useState({});
    const [userProfiles, setUserProfiles] = useState({});
    const [memberUIDs, setMemberUIDs] = useState([]);

    const [curUID, setCurUID] = useState(null);
    const [curUser, setCurUser] = useState({});
    const [curUserPerm, setCurUserPerm] = useState([]);
    const [curUserBanner, setCurUserBanner] = useState({ name: "", role: "", avatar: "" });

    const [userSettings, setUserSettings] = useState({ "notification_refresh_interval": 30, "unit": "metric", "radio": "disabled", "radio_type": "tsr", "radio_volume": 100, "display_timezone": Intl.DateTimeFormat().resolvedOptions().timeZone, "data_saver": false, "font_size": "regular", "default_row_per_page": 10, "language": null, "presence": "full" });

    const [announcementTypes, setAnnouncementTypes] = useState(null);
    const [applicationTypes, setApplicationTypes] = useState(null);
    const [divisions, setDivisions] = useState(null);

    const [dlogDetailsCache, setDlogDetailsCache] = useState({});
    const [economyCache, setEconomyCache] = useState({ config: null, trucks: [], garagesMap: {}, merchMap: {} });
    const [allUsersCache, setAllUsersCache] = useState([]);

    useEffect(() => {
        if (curUID !== null && users[curUID] !== undefined) {
            setCurUser(users[curUID]);
        }
    }, [curUID, users[curUID]]);

    useEffect(() => {
        if (curUID !== null && users[curUID] !== undefined) {
            let orderedRoles = Object.values(allRoles);
            orderedRoles.sort((a, b) => a.order_id - b.order_id);
            let roleOnDisplay = "";
            for (let i = 0; i < orderedRoles.length; i++) {
                if (users[curUID].roles.includes(orderedRoles[i].id)) {
                    roleOnDisplay = orderedRoles[i].name;
                    break;
                }
            }
            setCurUserBanner({ name: users[curUID].name, role: roleOnDisplay, avatar: users[curUID].avatar });
        } else {
            setCurUserBanner({ name: "Login", role: "", avatar: "https://charlws.com/me.gif" });
        }
    }, [allRoles, curUID, users[curUID]]);

    useEffect(() => {
        if (curUID !== null && users[curUID] !== undefined) {
            const permKeys = Object.keys(allPerms);
            const userPerm = [];
            for (let i = 0; i < users[curUID].roles.length; i++) {
                for (let j = 0; j < permKeys.length; j++) {
                    if (allPerms[permKeys[j]].includes(users[curUID].roles[i]) && !userPerm.includes(permKeys[j])) {
                        userPerm.push(permKeys[j]);
                    }
                }
            }
            setCurUserPerm(userPerm);
        } else {
            setCurUserPerm([]);
        }
    }, [allPerms, curUID, users[curUID]]);

    // background load
    const loadMemberUIDs = useCallback(async () => {
        if (memberUIDs.length > 0) return;

        const orderedRoles = Object.values(allRoles).sort((a, b) => a.order_id - b.order_id).map(role => role.id);

        let allMembers = [];

        let [resp] = await makeRequestsWithAuth([`${apiPath}/member/list?page=1&page_size=250`]);
        let totalPages = resp.total_pages;
        allMembers = resp.list;
        if (totalPages > 1) {
            let urlsBatch = [];
            for (let i = 2; i <= totalPages; i++) {
                urlsBatch.push(`${apiPath}/member/list?page=${i}&page_size=250`);
                if (urlsBatch.length === 5 || i === totalPages) {
                    let resps = await makeRequestsWithAuth(urlsBatch);
                    for (let j = 0; j < resps.length; j++) {
                        allMembers.push(...resps[j].list);
                    }
                    urlsBatch = [];
                }
            }
        }

        for (let i = 0; i < allMembers.length; i++) {
            allMembers[i].roles.sort((a, b) => orderedRoles.indexOf(a) - orderedRoles.indexOf(b));
            setUsers(prevUsers => ({ ...prevUsers, [allMembers[i].uid]: allMembers[i] }));
        }

        let allMemberUIDs = allMembers.map((member) => member.uid);
        setMemberUIDs(allMemberUIDs);
        return allMemberUIDs;
    }, [allRoles, apiPath]);

    // background load
    const loadDlogDetails = useCallback(async () => {
        let [resp] = await makeRequestsAuto([{ url: `${apiPath}/dlog/statistics/details`, auth: true }]);
        if (resp.error === undefined) {
            setDlogDetailsCache(resp);
        }
        return resp;
    }, [apiPath]);

    // background load
    const loadLanguages = useCallback(async () => {
        let [languages] = await makeRequestsAuto([{ url: `${apiPath}/languages`, auth: true }]);
        if (languages) {
            setLanguages(languages.supported);
            return languages.supported;
        } else {
            return [];
        }
    }, [apiPath]);

    // load when needed
    const loadAllUsers = useCallback(async () => {
        let result = [];

        let [resp] = await makeRequestsWithAuth([`${apiPath}/user/list?page=1&page_size=250`]);
        let totalPages = resp.total_pages;
        result = resp.list;
        if (totalPages > 1) {
            let urlsBatch = [];
            for (let i = 2; i <= totalPages; i++) {
                urlsBatch.push(`${apiPath}/user/list?page=${i}&page_size=250`);
                if (urlsBatch.length === 5 || i === totalPages) {
                    let resps = await makeRequestsWithAuth(urlsBatch);
                    for (let i = 0; i < resps.length; i++) {
                        result.push(...resps[i].list);
                    }
                    urlsBatch = [];
                }
            }
        }

        setAllUsersCache(result);
        return result;
    }, [apiPath]);

    // load when needed
    const loadAnnouncementTypes = useCallback(async () => {
        const [announcementTypes] = await makeRequestsAuto([{ url: `${apiPath}/announcements/types`, auth: false }]);
        if (announcementTypes) {
            setAnnouncementTypes(announcementTypes);
            return announcementTypes;
        }
        return null;
    }, [apiPath]);

    // load when needed
    const loadApplicationTypes = useCallback(async () => {
        const [applicationTypes] = await makeRequestsAuto([{ url: `${apiPath}/applications/types`, auth: false }]);
        if (applicationTypes) {
            const applicationTypesMap = {};
            for (let i = 0; i < applicationTypes.length; i++) {
                applicationTypesMap[applicationTypes[i].id] = applicationTypes[i];
            }
            setApplicationTypes(applicationTypesMap);
            return applicationTypesMap;
        }
        return null;
    }, [apiPath]);

    // load when needed
    const loadDivisions = useCallback(async () => {
        const [divisions] = await makeRequestsAuto([{ url: `${apiPath}/divisions/list`, auth: false }]);
        if (divisions) {
            const divisionsMap = {};
            for (let i = 0; i < divisions.length; i++)
                divisionsMap[divisions[i].id] = divisions[i];
            setDivisions(divisionsMap);
            return divisionsMap;
        }
        return null;
    }, [apiPath]);

    const value = useMemo(() => ({
        apiPath, setApiPath,
        apiVersion, setApiVersion,

        vtcLogo, setVtcLogo,
        vtcBanner, setVtcBanner,
        vtcBackground, setVtcBackground,

        apiConfig, setApiConfig,
        webConfig, setWebConfig,
        languages, setLanguages, loadLanguages,
        allRoles, setAllRoles,
        allPerms, setAllPerms,
        allRanks, setAllRanks,

        users, setUsers,
        userProfiles, setUserProfiles,
        memberUIDs, setMemberUIDs, loadMemberUIDs,

        curUID, setCurUID, curUser, setCurUser,
        curUserPerm, setCurUserPerm,
        curUserBanner, setCurUserBanner,

        userSettings, setUserSettings,

        announcementTypes, setAnnouncementTypes, loadAnnouncementTypes,
        applicationTypes, setApplicationTypes, loadApplicationTypes,
        divisions, setDivisions, loadDivisions,

        dlogDetailsCache, setDlogDetailsCache, loadDlogDetails,
        economyCache, setEconomyCache,
        allUsersCache, setAllUsersCache, loadAllUsers
    }), [apiPath, apiVersion, apiConfig, vtcLogo, vtcBanner, vtcBackground, webConfig, languages, allRoles, allPerms, allRanks, users, userProfiles, memberUIDs, curUID, curUser, curUserPerm, curUserBanner, userSettings, announcementTypes, applicationTypes, divisions, dlogDetailsCache, economyCache, allUsersCache]);

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export const ThemeContext = createContext({
    themeSettings: {
        theme: "auto",
        use_custom_theme: false,
        theme_background: null,
        theme_main: null,
        theme_darken_ratio: null,
        bg_image: null
    }
});

export const ThemeContextProvider = ({ children }) => {
    const [themeSettings, setThemeSettings] = useState({
        theme: "auto",
        use_custom_theme: false,
        theme_background: null,
        theme_main: null,
        theme_darken_ratio: null,
        bg_image: null
    });

    const value = useMemo(() => ({ themeSettings, setThemeSettings }), [themeSettings]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};