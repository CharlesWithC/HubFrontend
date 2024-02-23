import { useState, useEffect, useMemo, useCallback, createContext } from 'react';

import { makeRequestsAuto, makeRequestsWithAuth } from "./functions";
var vars = require("./variables");

export const AppContext = createContext({
    apiConfig: null,
    webConfig: null,

    users: {},
    userProfiles: {},
    memberUIDs: [],

    curUID: null,
    curUser: {},
    curUserPerm: [],
    curUserBanner: { name: "", role: "", avatar: "" },

    userSettings: { "notification_refresh_interval": 30, "unit": "metric", "radio": "disabled", "radio_type": "tsr", "radio_volume": 100, "display_timezone": Intl.DateTimeFormat().resolvedOptions().timeZone, "data_saver": false, "font_size": "regular", "default_row_per_page": 10, "language": null, "presence": "full" },
    // radio: enabled / disabled / auto-play (enabled)
    // radio-type: tsr / {url}

    announcementTypes: null,
    applicationTypes: null,
    divisions: null,

    dlogDetailsCache: {},
    economyCache: { config: null, trucks: [], garagesMap: {}, merchMap: {} },
    allUsersCache: [], // only loaded to purge inactive

    loadMemberUIDs: async () => { },
    loadAnnouncementTypes: async () => { },
    loadApplicationTypes: async () => { },
    loadDivisions: async () => { },
    loadDlogDetails: async () => { },
    loadAllUsers: async () => { },
});

export const AppContextProvider = ({ children }) => {
    const [apiConfig, setApiConfig] = useState(null);
    const [webConfig, setWebConfig] = useState(null);

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

            const allPerms = Object.keys(vars.perms);
            const userPerm = [];
            for (let i = 0; i < users[curUID].roles.length; i++) {
                for (let j = 0; j < allPerms.length; j++) {
                    if (vars.perms[allPerms[j]].includes(users[curUID].roles[i]) && !userPerm.includes(allPerms[j])) {
                        userPerm.push(allPerms[j]);
                    }
                }
            }
            setCurUserPerm(userPerm);
        }
    }, [curUID, users[curUID]]);

    const loadMemberUIDs = useCallback(async () => {
        if (memberUIDs.length > 0) return;

        let allMembers = [];

        let [resp] = await makeRequestsWithAuth([`${vars.dhpath}/member/list?page=1&page_size=250`]);
        let totalPages = resp.total_pages;
        allMembers = resp.list;
        if (totalPages > 1) {
            let urlsBatch = [];
            for (let i = 2; i <= totalPages; i++) {
                urlsBatch.push(`${vars.dhpath}/member/list?page=${i}&page_size=250`);
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
            setUsers(prevUsers => ({ ...prevUsers, [allMembers[i].uid]: allMembers[i] }));
        }

        let allMemberUIDs = allMembers.map((member) => member.uid);
        setMemberUIDs(allMemberUIDs);
        return allMemberUIDs;
    }, []);

    const loadDlogDetails = useCallback(async () => {
        let [resp] = await makeRequestsAuto([{ url: `${vars.dhpath}/dlog/statistics/details`, auth: true }]);
        if (resp.error === undefined) {
            setDlogDetailsCache(resp);
        }
        return resp;
    }, []);

    const loadAllUsers = useCallback(async () => {
        let result = [];

        let [resp] = await makeRequestsWithAuth([`${vars.dhpath}/user/list?page=1&page_size=250`]);
        let totalPages = resp.total_pages;
        result = resp.list;
        if (totalPages > 1) {
            let urlsBatch = [];
            for (let i = 2; i <= totalPages; i++) {
                urlsBatch.push(`${vars.dhpath}/user/list?page=${i}&page_size=250`);
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
    }, []);

    const loadAnnouncementTypes = useCallback(async () => {
        const [announcementTypes] = await makeRequestsAuto([{ url: `${vars.dhpath}/announcements/types`, auth: false }]);
        if (announcementTypes) {
            setAnnouncementTypes(announcementTypes);
            return announcementTypes;
        }
        return null;
    }, []);

    const loadApplicationTypes = useCallback(async () => {
        const [applicationTypes] = await makeRequestsAuto([{ url: `${vars.dhpath}/applications/types`, auth: false }]);
        if (applicationTypes) {
            const applicationTypesMap = {};
            for (let i = 0; i < applicationTypes.length; i++) {
                applicationTypesMap[applicationTypes[i].id] = applicationTypes[i];
            }
            setApplicationTypes(applicationTypesMap);
            return applicationTypesMap;
        }
        return null;
    }, []);

    const loadDivisions = useCallback(async () => {
        const [divisions] = await makeRequestsAuto([{ url: `${vars.dhpath}/divisions/list`, auth: false }]);
        if (divisions) {
            const divisionsMap = {};
            for (let i = 0; i < divisions.length; i++)
                divisionsMap[divisions[i].id] = divisions[i];
            setDivisions(divisionsMap);
            return divisionsMap;
        }
        return null;
    }, []);

    const value = useMemo(() => ({
        apiConfig, setApiConfig,
        webConfig, setWebConfig,

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
    }), [apiConfig, webConfig, users, userProfiles, memberUIDs, curUID, curUser, curUserPerm, curUserBanner, userSettings, announcementTypes, applicationTypes, divisions, dlogDetailsCache, economyCache, allUsersCache]);

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