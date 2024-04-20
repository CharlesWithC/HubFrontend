import { useState, useEffect, useMemo, useCallback, createContext } from 'react';
import _ from 'lodash';

import { makeRequestsAuto, makeRequestsWithAuth, getTodayUTC, readLS, writeLS } from "./functions";

export const AppContext = createContext({
    apiPath: "", setApiPath: () => { },
    apiVersion: "", setApiVersion: () => { },

    vtcLogo: localStorage.getItem("cache-logo"), setVtcLogo: () => { },
    vtcBanner: localStorage.getItem("cache-banner"), setVtcBanner: () => { },
    vtcBackground: localStorage.getItem("cache-background"), setVtcBackground: () => { },
    customBackground: (localStorage.getItem("custom-background") !== null ? localStorage.getItem("custom-background") : ""), setCustomBackground: () => { },

    // chub team / supporter etc
    specialRoles: {}, setSpecialRoles: () => { }, // {role: [users]}
    specialUsers: {}, setSpecialUsers: () => { }, // {user[discordid]: [roles]}
    patrons: {}, setPatrons: () => { },
    curUserPatreonID: null, setCurUserPatreonID: () => { },
    fmRewards: [], setFMRewards: () => { },
    fmRewardsDistributed: {}, setFMRewardsDistributed: () => { }, // freightmaster rewards (uid: [rewards])
    userConfig: {}, setUserConfig: () => { }, // all users

    vtcLevel: 0, setVtcLevel: () => { }, // 0: regular / 1: premium / 3: special
    userLevel: -1, setUserLevel: () => { },

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

    userSettings: { "notification_refresh_interval": 30, "unit": "metric", "radio": "disabled", "radio_type": "tsr", "radio_volume": 100, "display_timezone": Intl.DateTimeFormat().resolvedOptions().timeZone, "data_saver": false, "font_size": "regular", "default_row_per_page": 10, "language": null, "presence": "full", "streamer_mode": false }, setUserSettings: () => { },
    // radio: enabled / disabled / auto-play (enabled)
    // radio-type: tsr / {url}

    announcementTypes: null, setAnnouncementTypes: () => { },
    applicationTypes: null, setApplicationTypes: () => { },
    divisions: null, setDivisions: () => { },

    dlogDetailsCache: {}, setDlogDetailsCache: () => { }, // dlogDetails from ATM database
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
    const [customBackground, setCustomBackground] = useState(localStorage.getItem("custom-background") !== null ? localStorage.getItem("custom-background") : "");

    const [specialRoles, setSpecialRoles] = useState({});
    const [specialUsers, setSpecialUsers] = useState({});
    const [patrons, setPatrons] = useState({});
    const [curUserPatreonID, setCurUserPatreonID] = useState(null);
    const [fmRewards, setFMRewards] = useState([]);
    const [fmRewardsDistributed, setFMRewardsDistributed] = useState({});
    const [userConfig, setUserConfig] = useState({});

    const [vtcLevel, setVtcLevel] = useState(0);
    const [userLevel, setUserLevel] = useState(-1);

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

    const [userSettings, setUserSettings] = useState({ "notification_refresh_interval": 30, "unit": "metric", "radio": "disabled", "radio_type": "tsr", "radio_volume": 100, "display_timezone": Intl.DateTimeFormat().resolvedOptions().timeZone, "data_saver": false, "font_size": "regular", "default_row_per_page": 10, "language": null, "presence": "full", "streamer_mode": false });

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
            if (userPerm.length > 1) {
                loadDivisions();
            }
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
        // use atm's data
        let [resp] = await makeRequestsAuto([{ url: `https://corsproxy.io/?https%3A%2F%2Fdrivershub.charlws.com%2Fatm%2Fdlog%2Fstatistics%2Fdetails`, auth: true }]);
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
        customBackground, setCustomBackground,

        specialRoles, setSpecialRoles,
        specialUsers, setSpecialUsers,
        patrons, setPatrons,
        curUserPatreonID, setCurUserPatreonID,
        fmRewards, setFMRewards,
        fmRewardsDistributed, setFMRewardsDistributed,
        userConfig, setUserConfig,

        userLevel, setUserLevel,
        vtcLevel, setVtcLevel,

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
    }), [apiPath, apiVersion, apiConfig, vtcLogo, vtcBanner, vtcBackground, customBackground, specialRoles, specialUsers, patrons, curUserPatreonID, userConfig, userLevel, vtcLevel, webConfig, languages, allRoles, allPerms, allRanks, users, userProfiles, memberUIDs, curUID, curUser, curUserPerm, curUserBanner, userSettings, announcementTypes, applicationTypes, divisions, dlogDetailsCache, economyCache, allUsersCache]);

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

const DEFAULT_CACHE = {
    announcement: {
        announcements: [],
        page: 1,
        totalPages: 1
    },
    audit_log: {
        auditList: [],
        page: 1,
        pageSize: null,
        totalPages: 1
    },
    challenge: {
        challengeList: [],
        upcomingChallenges: [],
        activeChallenges: [],
        page: 1,
        pageSize: null,
        totalItems: 1,
        listParam: { order_by: "challengeid", order: "desc" },
        rawUpcomingChallenges: [],
        rawActiveChallenges: [],
        rawChallengeList: []
    },
    delivery_list: {
        detailStats: "loading",
        dlogList: [],
        page: 1,
        pageSize: null,
        totalItems: 1,
        listParam: { order_by: "logid", order: "desc", after: undefined, before: undefined, game: 0, status: 0 }
    },
    division: {
        dlog: {
            dlogList: [],
            page: 1,
            pageSize: null,
            totalItems: 1,
        },
        pending: {
            dlogList: [],
            page: 1,
            pageSize: null,
            totalItems: 1,
        },
        listParam: { after: undefined, before: undefined }
    },
    downloads: {
        downloadableItems: [],
        page: 1,
        totalPages: 1
    },
    event: {
        upcomingEvents: [],
        calendarEvents: [],
        allEvents: []
    },
    external_user: {
        userList: [],
        userPage: 1,
        userPageSize: null,
        userTotalItems: 1,
        userSearch: "",
        userListParam: { order_by: "uid", order: "desc" },

        banList: [],
        banPage: 1,
        banPageSize: null,
        banTotalItems: 1,
        banSearch: "",
        banListParam: { order_by: "uid", order: "desc" }
    },
    leaderboard: {
        monthly: [],
        allTime: [],
        leaderboard: [],
        totalItems: 1,
        page: 1,
        pageSize: null,
        listParam: { after: undefined, before: undefined, game: 0, point_types: ["bonus", "distance", "challenge", "division", "event"], users: [] }
    },
    member_list: {
        userList: [],
        page: 1,
        pageSize: null,
        totalItems: 1,
        search: "",
        listParam: { order_by: "userid", order: "asc" }
    },
    overview: {
        latest: { driver: 0, job: 0, distance: 0, fuel: 0, profit_euro: 0, profit_dollar: 0 },
        charts: { driver: [], job: [], distance: [], fuel: [], profit_euro: [], profit_dollar: [] },
        leaderboard: [],
        recentVisitors: [],
        newestMember: null,
        latestDelivery: null
    },
    poll: {
        polls: [],
        page: 1,
        totalPages: 1
    },
    statistics: {
        startTime: getTodayUTC() / 1000 - 86400 * 7,
        endTime: getTodayUTC() / 1000,
        selectedUser: { userid: -1000 },
        latest: { driver: 0, job: 0, distance: 0, fuel: 0, profit_euro: 0, profit_dollar: 0 },
        charts: { driver: [], job: [], distance: [], fuel: [], profit_euro: [], profit_dollar: [] },
        originalChart: { driver: [], job: [], distance: [], fuel: [], profit_euro: [], profit_dollar: [] },
        xAxis: [],
        detailStats: {}
    },
    ranking: {
        userPoints: 0,
        detailedPoints: { distance: 0, challenge: 0, event: 0, division: 0, bonus: 0 },
        bonusStreak: "/",
        curRankTypeId: null
    },
    freightmaster: {
        seasonName: "Unknown Season",
        startTime: "2024/01/01",
        endTime: "2025/01/01",
        rankd: "Unranked",
        pointd: 0,
        ranka: "Unranked",
        pointa: 0,
        page: 1,
        pageSize: 10,
        totalItems: 0,
        fMode: "d"
    }
};

export const CacheContext = createContext({
    cache: DEFAULT_CACHE,
    setCache: () => { }
});

export const CacheContextProvider = ({ children }) => {
    const [cache, setCache] = useState(DEFAULT_CACHE);

    const value = useMemo(() => ({ cache, setCache }), [cache]);

    useEffect(() => {
        // Get the initial listParam values from localStorage
        const initialListParamCache = readLS("cache-list-param", window.dhhost) || {};

        // Overwrite the default cache's listParams with the values from localStorage
        Object.keys(initialListParamCache).forEach(path => {
            setCache(prevCache => _.set({ ...prevCache }, path, initialListParamCache[path]));
        });
    }, []);
    useEffect(() => {
        // Get the initial listParam values from localStorage
        const initialListParamCache = readLS("cache-list-param", window.dhhost) || {};

        // Check if any listParam values have changed
        const listParamPaths = [
            'challenge.listParam',
            'delivery_list.listParam',
            'external_user.userListParam',
            'external_user.banListParam',
            'leaderboard.listParam',
            'member_list.listParam',
            'ranking.detailedPoints',
            'ranking.curRankTypeId',
            'division.listParam'
        ];

        const listParamCache = listParamPaths.reduce((acc, path) => {
            const listParamValue = _.get(cache, path);
            if (!_.isEqual(listParamValue, initialListParamCache[path])) {
                acc[path] = listParamValue;
            }
            return acc;
        }, {});

        // If any listParam values have changed, save them to localStorage
        if (!_.isEmpty(listParamCache)) {
            writeLS("cache-list-param", listParamCache, window.dhhost);
        }
    }, [cache]);

    return (
        <CacheContext.Provider value={value}>
            {children}
        </CacheContext.Provider>
    );
};