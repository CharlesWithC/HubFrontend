import { useRef, useEffect, useState, useCallback, useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { AppContext, CacheContext } from "../context";

import { useTheme, Dialog, DialogTitle, DialogContent, DialogActions, LinearProgress, Typography, Button, SpeedDial, SpeedDialAction, SpeedDialIcon, MenuItem, TextField, Grid, Snackbar, Alert, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Card, CardContent } from "@mui/material";
import Portal from "@mui/material/Portal";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowsRotate, faCodeCompare, faFileExport, faGears, faIdCard, faTruck, faUserGroup, faUsersSlash } from "@fortawesome/free-solid-svg-icons";

import TimeDelta from "../components/timedelta";
import CustomTable from "../components/table";
import UserCard from "../components/usercard";
import UserSelect from "../components/userselect";
import RoleSelect from "../components/roleselect";
import DateTimeField from "../components/datetime";
import SponsorBadge from "../components/sponsorBadge";

import { makeRequestsAuto, customAxios as axios, getAuthToken, removeNUEValues, downloadLocal } from "../functions";

const MemberList = () => {
    const { t: tr } = useTranslation();
    const { apiPath, webConfig, userLevel, allRoles, users, memberUIDs, userSettings, setUsers, allDiscordMembers, loadAllDiscordMembers } = useContext(AppContext);
    const { cache, setCache } = useContext(CacheContext);
    const allMembers = useMemo(() => memberUIDs.map(uid => users[uid]), [memberUIDs, users]);

    const theme = useTheme();

    const [userList, setUserList] = useState(cache.member_list.userList);
    const [page, setPage] = useState(cache.member_list.page);
    const pageRef = useRef(cache.member_list.page);
    const [pageSize, setPageSize] = useState(cache.member_list.pageSize === null ? userSettings.default_row_per_page : cache.member_list.pageSize);
    const [totalItems, setTotalItems] = useState(cache.member_list.totalItems);
    const [search, setSearch] = useState(cache.member_list.search);
    const searchRef = useRef(cache.member_list.search);
    const [listParam, setListParam] = useState(cache.member_list.listParam);
    const [tempListParam, setTempListParam] = useState(cache.member_list.listParam);

    useEffect(() => {
        return () => {
            setCache(cache => ({ ...cache, member_list: { userList, page, pageSize, totalItems, search, listParam } }));
        };
    }, [userList, page, pageSize, totalItems, search, listParam]);

    const [dialogOpen, setDialogOpen] = useState("");
    const [dialogButtonDisabled, setDialogButtonDisabled] = useState(false);
    const [snackbarContent, setSnackbarContent] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const handleCloseSnackbar = useCallback(() => {
        setSnackbarContent("");
    }, []);

    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

    const [logSeverity, setLogSeverity] = useState("success");

    const exportMemberList = useCallback(async () => {
        let csv = "uid,userid,name,email,avatar_url,discordid,steamid,truckersmpid,join_date,roles\n";
        for (let i = 0; i < allMembers.length; i++) {
            let user = allMembers[i];
            csv += `"${user.uid}","${user.userid}","${user.name}","${user.email}","${user.avatar}","${String(user.discordid)}\t","${String(user.steamid)}\t","${String(user.truckersmpid)}\t","${new Date(user.join_timestamp * 1000).toISOString()}","${user.roles.map((roleid, index) => (allRoles[roleid] !== undefined ? `${allRoles[roleid].name} (${roleid})` : `Unknown Role (${roleid})`)).join(", ")}"\n`;
        }
        downloadLocal("members.csv", csv);
    }, [allMembers, allRoles]);

    const [syncProfileLog, setSyncProfileLog] = useState("");
    const [syncProfileCurrent, setSyncProfileCurrent] = useState(0);
    const syncProfile = useCallback(async () => {
        if (userLevel < 4) {
            setSnackbarContent(tr("sync_profiles_platinum_perk"));
            setSnackbarSeverity("warning");
            return;
        }
        setDialogButtonDisabled(true);
        setSyncProfileLog("");
        setSyncProfileCurrent(0);
        for (let i = 0; i < allMembers.length; i++) {
            let sync_to = undefined;
            if (allMembers[i].avatar.startsWith("https://cdn.discordapp.com/")) {
                sync_to = "discord";
            } else if (allMembers[i].avatar.startsWith("https://avatars.steamstatic.com/")) {
                sync_to = "steam";
            } else if (allMembers[i].avatar.startsWith("https://static.truckersmp.com/")) {
                sync_to = "truckersmp";
            } else {
                setSyncProfileCurrent(i + 1);
                continue;
            }
            sync_to = `&sync_to_${sync_to}=true`;
            let st = +new Date();
            let resp = await axios({ url: `${apiPath}/user/profile?uid=${allMembers[i].uid}${sync_to}`, method: "PATCH", headers: { Authorization: `Bearer ${getAuthToken()}` } });
            if (resp.status === 200) {
                setUsers(users => ({ ...users, [allMembers[i].uid]: resp.data }));
                setSyncProfileLog(`Synced ${allMembers[i].name}'s profile`);
                setLogSeverity("success");
                setSyncProfileCurrent(i + 1);
            } else {
                if (resp.data.retry_after !== undefined) {
                    setSyncProfileLog(`We are being rate limited by Drivers Hub API. We will continue after ${resp.data.retry_after} seconds...`);
                    setLogSeverity("warning");
                    await sleep((resp.data.retry_after + 1) * 1000);
                    i -= 1;
                } else {
                    setSyncProfileLog(`Failed to sync ${allMembers[i].name}'s profile: ${resp.data.error}`);
                    setLogSeverity("error");
                    setSyncProfileCurrent(i + 1);
                }
            }
            let ed = +new Date();
            if (ed - st < 4000) await sleep(4000 - (ed - st));
        }
        setDialogButtonDisabled(false);
    }, [apiPath, allMembers]);

    const [tmpVtcId, setTmpVtcId] = useState(String(webConfig.truckersmp_vtc_id) || "");
    const [tmpCompareResult, setMemberCompareResult] = useState([]);
    const compareMembers = useCallback(async () => {
        if (userLevel < 4) {
            setSnackbarContent(tr("compare_members_is_a_platinum_perk_sponsor_at_charlwspatreon"));
            setSnackbarSeverity("warning");
            return;
        }

        setDialogButtonDisabled(true);
        setMemberCompareResult([]);
        let resp = await axios({ url: `https://config.chub.page/proxy?url=https://api.truckersmp.com/v2/vtc/${tmpVtcId}/members`, fetchOnly: true });
        if (resp.status !== 200) {
            setMemberCompareResult(newCompareResult);
            setSnackbarContent(tr("failed_to_fetch_truckersmp_members"));
            setSnackbarSeverity("error");
            return;
        }

        let tmpMembers = resp.data.response.members;
        let tmpIds = [];
        let tmpSteamIds = [];
        for (let i = 0; i < tmpMembers.length; i++) {
            tmpIds.push(tmpMembers[i].user_id);
            tmpSteamIds.push(parseInt(tmpMembers[i].steam_id));
            // tmp's steam id is a int that lost precision
            // we added a parseInt to ensure their api didn't update
        }
        let dhTmpIds = [];
        let dhTmpSteamIds = [];
        for (let i = 0; i < allMembers.length; i++) {
            dhTmpIds.push(allMembers[i].truckersmpid);
            dhTmpSteamIds.push(parseInt(allMembers[i].steamid));
            // so we have to change our own to int that lost precision to do the matching
        }

        let dhNoTmp = [];
        let tmpNoDh = [];
        for (let i = 0; i < tmpMembers.length; i++) {
            if (!dhTmpIds.includes(tmpMembers[i].user_id) && !dhTmpSteamIds.includes(tmpMembers[i].steam_id)) {
                tmpNoDh.push({ ...tmpMembers[i], name: tmpMembers[i].username });
            }
        }
        for (let i = 0; i < allMembers.length; i++) {
            if (!tmpIds.includes(allMembers[i].truckersmpid) && !tmpSteamIds.includes(allMembers[i].steamid)) {
                dhNoTmp.push(allMembers[i]);
            }
        }

        let dhNoDiscord = [];
        if (allDiscordMembers.length > 0) {
            for (let i = 0; i < allMembers.length; i++) {
                if (!allDiscordMembers.includes(allMembers[i].discordid)) {
                    dhNoDiscord.push(allMembers[i]);
                }
            }
        }

        let newCompareResult = [];
        for (let i = 0; i < tmpNoDh.length; i++) {
            newCompareResult.push({ name: tmpNoDh[i].username, steamid: tmpNoDh[i].steam_id, truckersmpid: tmpNoDh[i].user_id, status: tr("not_in_drivers_hub") });
        }
        for (let i = 0; i < dhNoTmp.length; i++) {
            newCompareResult.push({ ...dhNoTmp[i], status: tr("not_in_truckersmp_vtc") });
        }
        for (let i = 0; i < dhNoDiscord.length; i++) {
            newCompareResult.push({ ...dhNoDiscord[i], status: tr("not_in_discord") });
        }
        setMemberCompareResult(newCompareResult);

        setDialogButtonDisabled(false);
    }, [allMembers, tmpVtcId, allDiscordMembers]);

    const [batchRoleUpdateUsers, setBatchRoleUpdateUsers] = useState([]);
    const [batchRoleUpdateRoles, setBatchRoleUpdateRoles] = useState([]);
    const [batchRoleUpdateMode, setBatchRoleUpdateMode] = useState("add");
    const [batchRoleUpdateLog, setBatchRoleUpdateLog] = useState("");
    const [batchRoleUpdateCurrent, setBatchRoleUpdateCurrent] = useState(0);
    const batchUpdateRoles = useCallback(async () => {
        if (userLevel < 4) {
            setSnackbarContent(tr("batch_update_roles_platinum_perk"));
            setSnackbarSeverity("warning");
            return;
        }
        setDialogButtonDisabled(true);
        setBatchRoleUpdateLog("");
        setBatchRoleUpdateCurrent(0);
        if (batchRoleUpdateMode === "overwrite") {
            for (let i = 0; i < batchRoleUpdateUsers.length; i++) {
                let st = +new Date();
                let resp = await axios({ url: `${apiPath}/member/${batchRoleUpdateUsers[i].userid}/roles`, method: "PATCH", data: { roles: batchRoleUpdateRoles }, headers: { Authorization: `Bearer ${getAuthToken()}` } });
                if (resp.status === 204) {
                    setBatchRoleUpdateLog(`Overwritten roles of ${batchRoleUpdateUsers[i].name}`);
                    setLogSeverity("success");
                    setBatchRoleUpdateCurrent(i + 1);
                } else {
                    if (resp.data.retry_after !== undefined) {
                        setBatchRoleUpdateLog(`We are being rate limited by Drivers Hub API. We will continue after ${resp.data.retry_after} seconds...`);
                        setLogSeverity("warning");
                        await sleep((resp.data.retry_after + 1) * 1000);
                        i -= 1;
                    } else {
                        setBatchRoleUpdateLog(`Failed to update ${batchRoleUpdateUsers[i].name}'s roles: ${resp.data.error}`);
                        setLogSeverity("error");
                        setBatchRoleUpdateCurrent(i + 1);
                    }
                }
                let ed = +new Date();
                if (ed - st < 1000) await sleep(1000 - (ed - st));
            }
        } else if (batchRoleUpdateMode === "add" || batchRoleUpdateMode === "remove") {
            for (let i = 0; i < batchRoleUpdateUsers.length; i++) {
                let st = +new Date();
                let resp = await axios({ url: `${apiPath}/user/profile?userid=${batchRoleUpdateUsers[i].userid}`, method: "GET", headers: { Authorization: `Bearer ${getAuthToken()}` } });
                if (resp.status === 200) {
                    let newRoles = resp.data.roles;
                    if (batchRoleUpdateMode === "add") {
                        newRoles = [...new Set([...newRoles, ...batchRoleUpdateRoles])];
                    } else if (batchRoleUpdateMode === "remove") {
                        newRoles = newRoles.filter(role => !batchRoleUpdateRoles.includes(role));
                    }
                    resp = await axios({ url: `${apiPath}/member/${batchRoleUpdateUsers[i].userid}/roles`, method: "PATCH", data: { roles: newRoles }, headers: { Authorization: `Bearer ${getAuthToken()}` } });
                    if (resp.status === 204) {
                        setBatchRoleUpdateLog(`Updated roles of ${batchRoleUpdateUsers[i].name}`);
                        setLogSeverity("success");
                        setBatchRoleUpdateCurrent(i + 1);
                    } else {
                        if (resp.data.retry_after !== undefined) {
                            setBatchRoleUpdateLog(`We are being rate limited by Drivers Hub API. We will continue after ${resp.data.retry_after} seconds...`);
                            setLogSeverity("warning");
                            await sleep((resp.data.retry_after + 1) * 1000);
                            i -= 1;
                        } else {
                            setBatchRoleUpdateLog(`Failed to update ${batchRoleUpdateUsers[i].name}'s roles: ${resp.data.error}`);
                            setLogSeverity("error");
                            setBatchRoleUpdateCurrent(i + 1);
                        }
                    }
                } else {
                    if (resp.data.retry_after !== undefined) {
                        setBatchRoleUpdateLog(`We are being rate limited by Drivers Hub API. We will continue after ${resp.data.retry_after} seconds...`);
                        setLogSeverity("warning");
                        await sleep((resp.data.retry_after + 1) * 1000);
                        i -= 1;
                    } else {
                        setBatchRoleUpdateLog(`Failed to fetch ${batchRoleUpdateUsers[i].name}'s current roles: ${resp.data.error}`);
                        setLogSeverity("error");
                        setBatchRoleUpdateCurrent(i + 1);
                    }
                }
                let ed = +new Date();
                if (ed - st < 1000) await sleep(1000 - (ed - st));
            }
        }
        setTimeout(function () {
            setBatchRoleUpdateLog("");
            setDialogButtonDisabled(false);
        }, 3000);
    }, [apiPath, batchRoleUpdateUsers, batchRoleUpdateRoles, batchRoleUpdateMode]);

    const [batchTrackerUpdateUsers, setBatchTrackerUpdateUsers] = useState([]);
    const [batchTrackerUpdateTo, setBatchTrackerUpdateTo] = useState("trucky");
    const [batchTrackerUpdateLog, setBatchTrackerUpdateLog] = useState("");
    const [batchTrackerUpdateCurrent, setBatchTrackerUpdateCurrent] = useState(0);
    const batchUpdateTrackers = useCallback(async () => {
        if (userLevel < 4) {
            setSnackbarContent(tr("batch_update_tracker_platinum_perk"));
            setSnackbarSeverity("warning");
            return;
        }
        setDialogButtonDisabled(true);
        setBatchTrackerUpdateLog("");
        setBatchTrackerUpdateCurrent(0);
        for (let i = 0; i < batchTrackerUpdateUsers.length; i++) {
            let st = +new Date();
            let resp = await axios({ url: `${apiPath}/user/tracker/switch?uid=${batchTrackerUpdateUsers[i].uid}`, method: "POST", data: { tracker: batchTrackerUpdateTo }, headers: { Authorization: `Bearer ${getAuthToken()}` } });
            if (resp.status === 204) {
                setBatchTrackerUpdateLog(`Updated tracker of ${batchTrackerUpdateUsers[i].name}`);
                setLogSeverity("success");
                setBatchTrackerUpdateCurrent(i + 1);
            } else {
                if (resp.data.retry_after !== undefined) {
                    setBatchTrackerUpdateLog(`We are being rate limited by Drivers Hub API. We will continue after ${resp.data.retry_after} seconds...`);
                    setLogSeverity("warning");
                    await sleep((resp.data.retry_after + 1) * 1000);
                    i -= 1;
                } else {
                    setBatchTrackerUpdateLog(`Failed to update ${batchTrackerUpdateUsers[i].name}'s tracker: ${resp.data.error}`);
                    setLogSeverity("error");
                    setBatchTrackerUpdateCurrent(i + 1);
                }
            }
            let ed = +new Date();
            if (ed - st < 1000) await sleep(1000 - (ed - st));
        }
        setTimeout(function () {
            setBatchTrackerUpdateLog("");
            setDialogButtonDisabled(false);
        }, 3000);
    }, [apiPath, batchTrackerUpdateUsers, batchTrackerUpdateTo]);

    const [batchDismissUsers, setBatchDismissUsers] = useState([]);
    const [batchDismissLastOnline, setBatchDismissLastOnline] = useState(undefined);
    const [batchDismissLog, setBatchDismissLog] = useState("");
    const [batchDismissCurrent, setBatchDismissCurrent] = useState(0);
    const batchDismiss = useCallback(async () => {
        if (userLevel < 4) {
            setSnackbarContent(tr("batch_dismiss_members_platinum_perk"));
            setSnackbarSeverity("warning");
            return;
        }
        setDialogButtonDisabled(true);
        setBatchDismissLog("");
        setBatchDismissCurrent(0);
        for (let i = 0; i < batchDismissUsers.length; i++) {
            let st = +new Date();
            let resp = await axios({ url: `${apiPath}/member/${batchDismissUsers[i].userid}/dismiss`, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
            if (resp.status === 204) {
                setBatchDismissLog(`Dismissed ${batchDismissUsers[i].name}`);
                setLogSeverity("success");
                setBatchDismissCurrent(i + 1);
            } else {
                if (resp.data.retry_after !== undefined) {
                    setBatchDismissLog(`We are being rate limited by Drivers Hub API. We will continue after ${resp.data.retry_after} seconds...`);
                    setLogSeverity("warning");
                    await sleep((resp.data.retry_after + 1) * 1000);
                    i -= 1;
                } else {
                    setBatchDismissLog(`Failed to dismiss ${batchDismissUsers[i].name}: ${resp.data.error}`);
                    setLogSeverity("error");
                    setBatchDismissCurrent(i + 1);
                }
            }
            let ed = +new Date();
            if (ed - st < 1000) await sleep(1000 - (ed - st));
        }
        setTimeout(function () {
            setBatchDismissLog("");
            setDialogButtonDisabled(false);
        }, 3000);
    }, [apiPath, batchDismissUsers]);

    useEffect(() => {
        pageRef.current = page;
    }, [page]);
    useEffect(() => {
        searchRef.current = search;
    }, [search]);
    useEffect(() => {
        async function doLoad() {
            window.loading += 1;

            let processedParam = removeNUEValues(listParam);

            let [_userList] = [{}];
            if (search === "") [_userList] = await makeRequestsAuto([{ url: `${apiPath}/member/list?order=desc&order_by=userid&page=${page}&page_size=${pageSize}&${new URLSearchParams(processedParam).toString()}`, auth: true }]);
            else if (!isNaN(search) && search.length >= 1 && search.length <= 4) {
                // is drivers hub id
                let [_userProfile] = await makeRequestsAuto([{ url: `${apiPath}/user/profile?userid=${search}`, auth: true }]);
                if (_userProfile.error === undefined && _userProfile.userid >= 0 && _userProfile.userid !== null) {
                    _userList = { list: [_userProfile], total_items: 1 };
                } else {
                    _userList = { list: [], total_items: 0 };
                }
            } else if (!isNaN(search) && search.length >= 5 && search.length <= 10) {
                // is truckersmp id
                let [_userProfile] = await makeRequestsAuto([{ url: `${apiPath}/user/profile?truckersmpid=${search}`, auth: true }]);
                if (_userProfile.error === undefined && _userProfile.userid >= 0 && _userProfile.userid !== null) {
                    _userList = { list: [_userProfile], total_items: 1 };
                } else {
                    _userList = { list: [], total_items: 0 };
                }
            } else if (!isNaN(search) && search.length === 17 && search.startsWith("76561")) {
                // is steam id
                let [_userProfile] = await makeRequestsAuto([{ url: `${apiPath}/user/profile?steamid=${search}`, auth: true }]);
                if (_userProfile.error === undefined && _userProfile.userid >= 0 && _userProfile.userid !== null) {
                    _userList = { list: [_userProfile], total_items: 1 };
                } else {
                    _userList = { list: [], total_items: 0 };
                }
            } else if (!isNaN(search) && search.length >= 17 && search.length <= 19) {
                // is discord id
                let [_userProfile] = await makeRequestsAuto([{ url: `${apiPath}/user/profile?discordid=${search}`, auth: true }]);
                if (_userProfile.error === undefined && _userProfile.userid >= 0 && _userProfile.userid !== null) {
                    _userList = { list: [_userProfile], total_items: 1 };
                } else {
                    _userList = { list: [], total_items: 0 };
                }
            } // not any id
            else [_userList] = await makeRequestsAuto([{ url: `${apiPath}/member/list?name=${search}&order=desc&order_by=userid&page=${page}&page_size=${pageSize}&${new URLSearchParams(processedParam).toString()}`, auth: true }]);
            if (_userList.list !== undefined) {
                let newUserList = [];
                for (let i = 0; i < _userList.list.length; i++) {
                    let user = _userList.list[i];
                    newUserList.push({
                        userid: `${user.userid}`,
                        user: <UserCard key={user.uid} user={user} />,
                        discordid: user.discordid,
                        steamid: (
                            <a href={`https://steamcommunity.com/profiles/${user.steamid}`} target="_blank" rel="noreferrer">
                                {user.steamid}
                            </a>
                        ),
                        truckersmpid: (
                            <a href={`https://truckersmp.com/user/${user.truckersmpid}`} target="_blank" rel="noreferrer">
                                {user.truckersmpid}
                            </a>
                        ),
                        joined: <TimeDelta key={`${+new Date()}`} timestamp={user.join_timestamp * 1000} />,
                        last_seen: user.activity !== null && user.activity.last_seen !== undefined ? <TimeDelta key={`${+new Date()}`} timestamp={user.activity.last_seen * 1000} /> : "/",
                    });
                }
                if (pageRef.current === page && searchRef.current === search) {
                    setUserList(newUserList);
                    setTotalItems(_userList.total_items);
                }
            }

            window.loading -= 1;
        }
        doLoad();
    }, [apiPath, theme, page, pageSize, search, listParam]);

    return (
        <>
            <CustomTable
                page={page}
                name={
                    <>
                        <FontAwesomeIcon icon={faUserGroup} />
                        &nbsp;&nbsp;{tr("members")}
                    </>
                }
                order={listParam.order}
                orderBy={listParam.order_by}
                onOrderingUpdate={(order_by, order) => {
                    setListParam({ ...listParam, order_by: order_by, order: order });
                }}
                titlePosition="top"
                columns={[
                    { id: "userid", label: tr("user_id"), orderKey: "userid", defaultOrder: "asc" },
                    { id: "user", label: tr("user"), orderKey: "name", defaultOrder: "asc" },
                    { id: "discordid", label: tr("discord_id"), orderKey: "discordid", defaultOrder: "asc" },
                    { id: "steamid", label: tr("steam_id"), orderKey: "steamid", defaultOrder: "asc" },
                    { id: "truckersmpid", label: tr("truckersmp_id"), orderKey: "truckersmpid", defaultOrder: "asc" },
                    { id: "joined", label: tr("joined"), orderKey: "join_timestamp", defaultOrder: "asc" },
                    { id: "last_seen", label: tr("last_seen"), orderKey: "last_seen", defaultOrder: "desc" },
                ]}
                data={userList}
                totalItems={totalItems}
                rowsPerPageOptions={[10, 25, 50, 100, 250]}
                defaultRowsPerPage={pageSize}
                onPageChange={setPage}
                onRowsPerPageChange={setPageSize}
                onSearch={content => {
                    setPage(1);
                    setSearch(content);
                }}
                searchHint={tr("search_by_username_or_ids")}
            />
            <Dialog
                open={dialogOpen === "sync-profile"}
                onClose={() => {
                    if (!dialogButtonDisabled) setDialogOpen("");
                }}>
                <DialogTitle>
                    <FontAwesomeIcon icon={faArrowsRotate} />
                    &nbsp;&nbsp;{tr("sync_profiles")}&nbsp;&nbsp;
                    <SponsorBadge level={4} />
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2">{tr("sync_profiles_note")}</Typography>
                    <Typography variant="body2">{tr("sync_profiles_note_2")}</Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.warning.main }}>
                        {tr("sync_profiles_note_3")}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.warning.main }}>
                        {tr("prune_users_note_4")}
                    </Typography>
                    <br />
                    {dialogButtonDisabled && (
                        <>
                            <Typography variant="body2" gutterBottom>
                                {tr("completed")}
                                {syncProfileCurrent} / {allMembers.length}
                            </Typography>
                            <LinearProgress variant="determinate" color="info" value={(syncProfileCurrent / allMembers.length) * 100} />
                            <Typography variant="body2" sx={{ color: theme.palette[logSeverity].main }} gutterBottom>
                                {syncProfileLog}
                            </Typography>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="contained"
                        color="info"
                        onClick={() => {
                            syncProfile();
                        }}
                        disabled={dialogButtonDisabled}>
                        {tr("sync")}
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                fullWidth
                open={dialogOpen === "compare-members"}
                onClose={() => {
                    if (!dialogButtonDisabled) setDialogOpen("");
                }}>
                <DialogTitle>
                    <FontAwesomeIcon icon={faCodeCompare} />
                    &nbsp;&nbsp;{tr("compare_members")}&nbsp;&nbsp;
                    <SponsorBadge level={4} />
                </DialogTitle>
                <DialogContent>
                    <TextField
                        size="small"
                        label={tr("truckersmp_vtc_id")}
                        value={tmpVtcId}
                        onChange={e => {
                            if (!isNaN(e.target.value)) setTmpVtcId(e.target.value);
                        }}
                        fullWidth
                        sx={{ mt: "5px", mb: "10px" }}
                    />
                    <br />
                    <Card>
                        <CardContent>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>{tr("name")}</TableCell>
                                            <TableCell>{tr("truckersmp_id")}</TableCell>
                                            <TableCell>{tr("status")}</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {tmpCompareResult.map((row, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{row.userid !== undefined ? <UserCard user={row} /> : row.name}</TableCell>
                                                <TableCell>
                                                    <a href={`https://truckersmp.com/user/${row.truckersmpid}`} target="_blank" rel="noreferrer">
                                                        {row.truckersmpid}
                                                    </a>
                                                </TableCell>
                                                <TableCell>{row.status}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="contained"
                        color="info"
                        onClick={() => {
                            compareMembers();
                        }}
                        disabled={dialogButtonDisabled || tmpVtcId.replaceAll(" ", "") === ""}>
                        {tr("compare")}
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={dialogOpen === "batch-role-update"}
                onClose={() => {
                    if (!dialogButtonDisabled) setDialogOpen("");
                }}>
                <DialogTitle>
                    <FontAwesomeIcon icon={faIdCard} />
                    &nbsp;&nbsp;{tr("batch_update_roles")}&nbsp;&nbsp;
                    <SponsorBadge level={4} />
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2">{tr("batch_update_roles_note")}</Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.warning.main }}>
                        {tr("prune_users_note_3")}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.warning.main }}>
                        {tr("prune_users_note_4")}
                    </Typography>
                    <UserSelect label={tr("users")} users={batchRoleUpdateUsers} isMulti={true} onUpdate={setBatchRoleUpdateUsers} style={{ marginTop: "5px", marginBottom: "5px" }} allowSelectAll={true} />
                    <RoleSelect label={tr("roles")} initialRoles={batchRoleUpdateRoles} onUpdate={newRoles => setBatchRoleUpdateRoles(newRoles.map(role => role.id))} style={{ marginBottom: "12px" }} />
                    <TextField
                        select
                        size="small"
                        label={tr("mode")}
                        value={batchRoleUpdateMode}
                        onChange={e => {
                            setBatchRoleUpdateMode(e.target.value);
                        }}
                        fullWidth>
                        <MenuItem value="add">{tr("add_selected_roles")}</MenuItem>
                        <MenuItem value="remove">{tr("remove_selected_roles")}</MenuItem>
                        <MenuItem value="overwrite">{tr("overwrite_current_roles")}</MenuItem>
                    </TextField>
                    {(dialogButtonDisabled || (batchRoleUpdateCurrent !== 0 && batchRoleUpdateCurrent == batchRoleUpdateUsers.length)) && (
                        <>
                            <Typography variant="body2" gutterBottom sx={{ mt: "5px" }}>
                                {tr("completed")}
                                {batchRoleUpdateCurrent} / {batchRoleUpdateUsers.length}
                            </Typography>
                            <LinearProgress variant="determinate" color="info" value={(batchRoleUpdateCurrent / batchRoleUpdateUsers.length) * 100} />
                            <Typography variant="body2" sx={{ color: theme.palette[logSeverity].main }} gutterBottom>
                                {batchRoleUpdateLog}
                            </Typography>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="contained"
                        color="info"
                        onClick={() => {
                            batchUpdateRoles();
                        }}
                        disabled={dialogButtonDisabled}>
                        {tr("update")}
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={dialogOpen === "batch-tracker-update"}
                onClose={() => {
                    if (!dialogButtonDisabled) setDialogOpen("");
                }}>
                <DialogTitle>
                    <FontAwesomeIcon icon={faTruck} />
                    &nbsp;&nbsp;{tr("batch_update_tracker")}&nbsp;&nbsp;
                    <SponsorBadge level={4} />
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2">{tr("batch_update_tracker_note")}</Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.warning.main }}>
                        {tr("prune_users_note_3")}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.warning.main }}>
                        {tr("prune_users_note_4")}
                    </Typography>
                    <UserSelect label={tr("users")} users={batchTrackerUpdateUsers} isMulti={true} onUpdate={setBatchTrackerUpdateUsers} style={{ marginTop: "5px", marginBottom: "12px" }} allowSelectAll={true} />
                    <TextField
                        select
                        size="small"
                        label={tr("tracker")}
                        value={batchTrackerUpdateTo}
                        onChange={e => {
                            setBatchTrackerUpdateTo(e.target.value);
                        }}
                        fullWidth>
                        <MenuItem value="trucky">Trucky</MenuItem>
                        <MenuItem value="tracksim">TrackSim</MenuItem>
                        <MenuItem value="custom">{tr("custom")}</MenuItem>
                    </TextField>
                    {(dialogButtonDisabled || (batchTrackerUpdateCurrent !== 0 && batchTrackerUpdateCurrent == batchTrackerUpdateUsers.length)) && (
                        <>
                            <Typography variant="body2" gutterBottom sx={{ mt: "5px" }}>
                                {tr("completed")}
                                {batchTrackerUpdateCurrent} / {batchTrackerUpdateUsers.length}
                            </Typography>
                            <LinearProgress variant="determinate" color="info" value={(batchTrackerUpdateCurrent / batchTrackerUpdateUsers.length) * 100} />
                            <Typography variant="body2" sx={{ color: theme.palette[logSeverity].main }} gutterBottom>
                                {batchTrackerUpdateLog}
                            </Typography>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="contained"
                        color="info"
                        onClick={() => {
                            batchUpdateTrackers();
                        }}
                        disabled={dialogButtonDisabled}>
                        {tr("update")}
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={dialogOpen === "batch-member-dismiss"}
                onClose={() => {
                    if (!dialogButtonDisabled) setDialogOpen("");
                }}>
                <DialogTitle>
                    <FontAwesomeIcon icon={faUsersSlash} />
                    &nbsp;&nbsp;{tr("batch_dismiss_members")}&nbsp;&nbsp;
                    <SponsorBadge level={4} />
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2">{tr("batch_dismiss_members_note")}</Typography>
                    <Typography variant="body2">{tr("batch_dismiss_members_note_2")}</Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.warning.main }}>
                        {tr("prune_users_note_3")}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.warning.main }}>
                        {tr("prune_users_note_4")}
                    </Typography>
                    <Grid container spacing={2} sx={{ mt: "5px", mb: "5px" }}>
                        <Grid size={8}>
                            <DateTimeField
                                size="small"
                                label={tr("last_online_before")}
                                defaultValue={batchDismissLastOnline}
                                onChange={timestamp => {
                                    setBatchDismissLastOnline(timestamp);
                                }}
                                fullWidth
                            />
                        </Grid>
                        <Grid size={4}>
                            <Button
                                variant="contained"
                                color="info"
                                onClick={() => {
                                    if (batchDismissLastOnline === undefined) return;
                                    let newList = [];
                                    for (let i = 0; i < allMembers.length; i++) {
                                        if (allMembers[i].activity !== null && allMembers[i].activity.last_seen < batchDismissLastOnline) {
                                            newList.push(allMembers[i]);
                                        }
                                    }
                                    setBatchDismissUsers(newList);
                                }}
                                disabled={dialogButtonDisabled}
                                fullWidth>
                                {tr("select")}
                            </Button>
                        </Grid>
                        <Grid size={12}>
                            <UserSelect label={tr("users")} users={batchDismissUsers} isMulti={true} onUpdate={setBatchDismissUsers} allowSelectAll={true} />
                        </Grid>
                    </Grid>
                    {(dialogButtonDisabled || (batchDismissCurrent !== 0 && batchDismissCurrent == batchDismissUsers.length)) && (
                        <>
                            <Typography variant="body2" gutterBottom sx={{ mt: "5px" }}>
                                {tr("completed")}
                                {batchDismissCurrent} / {batchDismissUsers.length}
                            </Typography>
                            <LinearProgress variant="determinate" color="info" value={(batchDismissCurrent / batchDismissUsers.length) * 100} />
                            <Typography variant="body2" sx={{ color: theme.palette[logSeverity].main }} gutterBottom>
                                {batchDismissLog}
                            </Typography>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={() => {
                            batchDismiss();
                        }}
                        disabled={dialogButtonDisabled}>
                        {tr("dismiss")}
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={dialogOpen === "settings"}
                onClose={() => {
                    setDialogOpen("");
                }}
                fullWidth>
                <DialogTitle>
                    <FontAwesomeIcon icon={faGears} />
                    &nbsp;&nbsp;{tr("settings")}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: "5px" }}>
                        <Grid size={6}>
                            <DateTimeField
                                label={tr("joined_after")}
                                defaultValue={tempListParam.joined_after}
                                onChange={timestamp => {
                                    setTempListParam({ ...tempListParam, joined_after: timestamp });
                                }}
                                fullWidth
                            />
                        </Grid>
                        <Grid size={6}>
                            <DateTimeField
                                label={tr("joined_before")}
                                defaultValue={tempListParam.joined_before}
                                onChange={timestamp => {
                                    setTempListParam({ ...tempListParam, joined_before: timestamp });
                                }}
                                fullWidth
                            />
                        </Grid>
                        <Grid size={6}>
                            <DateTimeField
                                label={tr("last_seen_after")}
                                defaultValue={tempListParam.last_seen_after}
                                onChange={timestamp => {
                                    setTempListParam({ ...tempListParam, last_seen_after: timestamp });
                                }}
                                fullWidth
                            />
                        </Grid>
                        <Grid size={6}>
                            <DateTimeField
                                label={tr("last_seen_before")}
                                defaultValue={tempListParam.last_seen_before}
                                onChange={timestamp => {
                                    setTempListParam({ ...tempListParam, last_seen_before: timestamp });
                                }}
                                fullWidth
                            />
                        </Grid>
                        <Grid
                            size={{
                                xs: 12,
                                md: 6,
                            }}>
                            <RoleSelect initialRoles={tempListParam.include_roles || []} onUpdate={newRoles => setTempListParam({ ...tempListParam, include_roles: newRoles.map(role => role.id) })} label={tr("include_roles")} style={{ marginBottom: "16px" }} showAllRoles={true} />
                        </Grid>
                        <Grid
                            size={{
                                xs: 12,
                                md: 6,
                            }}>
                            <RoleSelect initialRoles={tempListParam.exclude_roles || []} onUpdate={newRoles => setTempListParam({ ...tempListParam, exclude_roles: newRoles.map(role => role.id) })} label={tr("exclude_roles")} style={{ marginBottom: "16px" }} showAllRoles={true} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="contained"
                        onClick={() => {
                            setListParam(tempListParam);
                            setPage(1);
                        }}>
                        {tr("update")}
                    </Button>
                </DialogActions>
            </Dialog>
            <SpeedDial ariaLabel={tr("controls")} sx={{ position: "fixed", bottom: 20, right: 20 }} icon={<SpeedDialIcon />}>
                <SpeedDialAction
                    key="settings"
                    tooltipTitle={tr("settings")}
                    icon={<FontAwesomeIcon icon={faGears} />}
                    onClick={() => {
                        setDialogOpen("settings");
                    }}
                />
                <SpeedDialAction key="export-member-list" icon={<FontAwesomeIcon icon={faFileExport} />} tooltipTitle={tr("export_members")} onClick={() => exportMemberList()} />
                <SpeedDialAction key="sync-profile" icon={<FontAwesomeIcon icon={faArrowsRotate} />} tooltipTitle={tr("sync_profiles")} onClick={() => setDialogOpen("sync-profile")} />
                <SpeedDialAction
                    key="compare-members"
                    icon={<FontAwesomeIcon icon={faCodeCompare} />}
                    tooltipTitle={tr("compare_members")}
                    onClick={() => {
                        setDialogOpen("compare-members");
                        if (allDiscordMembers.length === 0) loadAllDiscordMembers();
                    }}
                />
                <SpeedDialAction key="batch-role-update" icon={<FontAwesomeIcon icon={faIdCard} />} tooltipTitle={tr("batch_update_roles")} onClick={() => setDialogOpen("batch-role-update")} />
                <SpeedDialAction key="batch-tracker-update" icon={<FontAwesomeIcon icon={faTruck} />} tooltipTitle={tr("batch_update_tracker")} onClick={() => setDialogOpen("batch-tracker-update")} />
                <SpeedDialAction key="batch-member-dismiss" icon={<FontAwesomeIcon icon={faUsersSlash} />} tooltipTitle={tr("batch_dismiss_members")} onClick={() => setDialogOpen("batch-member-dismiss")} />
            </SpeedDial>
            <Portal>
                <Snackbar open={!!snackbarContent} autoHideDuration={5000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
                    <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
                        {snackbarContent}
                    </Alert>
                </Snackbar>
            </Portal>
        </>
    );
};

export default MemberList;
