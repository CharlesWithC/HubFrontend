import { useState, useEffect, useMemo, useCallback, createContext } from 'react';

import { makeRequestsWithAuth } from "./functions";
var vars = require("./variables");

export const AppContext = createContext({
    users: {},
    userProfiles: {},
    memberUIDs: [],
    curUID: null,
    curUser: {},
    curUserPerm: [],
    economyCache: { config: null, trucks: [], garagesMap: {}, merchMap: {} },
    initMemberUIDs: async () => { }
});

export const AppContextProvider = ({ children }) => {
    const [users, setUsers] = useState({});
    const [userProfiles, setUserProfiles] = useState({});
    const [memberUIDs, setMemberUIDs] = useState([]);

    const [curUID, setCurUID] = useState(null);
    const [curUser, setCurUser] = useState({});
    const [curUserPerm, setCurUserPerm] = useState([]);

    const [economyCache, setEconomyCache] = useState({ config: null, trucks: [], garagesMap: {}, merchMap: {} });

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

    const initMemberUIDs = useCallback(async () => {
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
    }, []);

    const value = useMemo(() => ({
        users, setUsers,
        userProfiles, setUserProfiles,
        memberUIDs, setMemberUIDs, initMemberUIDs,
        curUID, setCurUID, curUser, setCurUser,
        curUserPerm, setCurUserPerm,
        economyCache, setEconomyCache,
    }), [users, userProfiles, memberUIDs, curUID, curUser, curUserPerm, economyCache]);

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};