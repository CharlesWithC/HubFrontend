import { useRef, useEffect, useState, useCallback, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AppContext, CacheContext } from '../context';

import { useTheme, Typography, Snackbar, Alert, SpeedDial, SpeedDialAction, SpeedDialIcon, Dialog, DialogTitle, DialogActions, DialogContent, Grid, Button, LinearProgress, MenuItem } from '@mui/material';
import { Portal } from '@mui/base';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faBan, faUsersSlash } from '@fortawesome/free-solid-svg-icons';

import TimeDelta from '../components/timedelta';
import CustomTable from "../components/table";
import { makeRequestsAuto, removeNullValues, customAxios as axios, getAuthToken, removeNUEValues } from '../functions';
import UserCard from '../components/usercard';
import UserSelect from '../components/userselect';
import DateTimeField from '../components/datetime';
import SponsorBadge from '../components/sponsorBadge';

const ExternalUsers = () => {
    const { t: tr } = useTranslation();
    const { apiPath, userLevel, userSettings, allUsersCache, loadAllUsers } = useContext(AppContext);
    const { cache, setCache } = useContext(CacheContext);
    const theme = useTheme();

    const puColumns = useMemo(() => ([
        { id: 'uid', label: 'UID', orderKey: 'uid', defaultOrder: 'desc' },
        { id: 'user', label: tr("user"), orderKey: 'name', defaultOrder: 'asc' },
        { id: 'email', label: tr("email"), orderKey: 'email', defaultOrder: 'asc' },
        { id: 'discordid', label: tr("discord_id"), orderKey: 'discordid', defaultOrder: 'asc' },
        { id: 'steamid', label: tr("steam_id"), orderKey: 'steamid', defaultOrder: 'asc' },
        { id: 'truckersmpid', label: tr("truckersmp_id"), orderKey: 'truckersmpid', defaultOrder: 'asc' },
        { id: 'joined', label: tr("joined"), orderKey: 'join_timestamp', defaultOrder: 'asc' }
    ]), []);
    const buColumns = useMemo(() => ([
        { id: 'uid', label: 'UID', orderKey: 'uid', defaultOrder: 'desc' },
        { id: 'user', label: tr("user"), orderKey: 'name', defaultOrder: 'asc' },
        { id: 'email', label: tr("email"), orderKey: 'email', defaultOrder: 'asc' },
        { id: 'discordid', label: tr("discord_id"), orderKey: 'discordid', defaultOrder: 'asc' },
        { id: 'steamid', label: tr("steam_id"), orderKey: 'steamid', defaultOrder: 'asc' },
        { id: 'truckersmpid', label: tr("truckersmp_id"), orderKey: 'truckersmpid', defaultOrder: 'asc' },
        { id: 'reason', label: tr("ban_reason") },
        { id: 'expire', label: tr("expire") }
    ]), []);

    const [snackbarContent, setSnackbarContent] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const handleCloseSnackbar = useCallback(() => {
        setSnackbarContent("");
    }, []);

    const [dialogOpen, setDialogOpen] = useState("");
    const [dialogButtonDisabled, setDialogButtonDisabled] = useState(false);
    const [logSeverity, setLogSeverity] = useState("info");

    const [batchDeleteUsers, setBatchDeleteUsers] = useState([]);
    const [batchDeleteLastOnline, setBatchDeleteLastOnline] = useState(undefined);
    const [batchDeleteLog, setBatchDeleteLog] = useState("");
    const [batchDeleteCurrent, setBatchDeleteCurrent] = useState(0);
    const [batchDeleteLoading, setBatchDeleteLoading] = useState(false);
    const batchDelete = useCallback(async () => {
        if (userLevel < 4) {
            setSnackbarContent(tr("prune_user_platinum_perk"));
            setSnackbarSeverity("warning");
            return;
        }
        setDialogButtonDisabled(true);
        setBatchDeleteLog("");
        setBatchDeleteCurrent(0);
        for (let i = 0; i < batchDeleteUsers.length; i++) {
            let st = +new Date();
            let resp = await axios({ url: `${apiPath}/user/${batchDeleteUsers[i].uid}`, method: "DELETE", headers: { Authorization: `Bearer ${getAuthToken()}` } });
            if (resp.status === 204) {
                setBatchDeleteLog(`Deleted ${batchDeleteUsers[i].name}`);
                setLogSeverity("success");
                setBatchDeleteCurrent(i + 1);
            } else {
                if (resp.data.retry_after !== undefined) {
                    setBatchDeleteLog(`We are being rate limited by Drivers Hub API. We will continue after ${resp.data.retry_after} seconds...`);
                    setLogSeverity("warning");
                    await sleep((resp.data.retry_after + 1) * 1000);
                    i -= 1;
                } else {
                    setBatchDeleteLog(`Failed to delete ${batchDeleteUsers[i].name}: ${resp.data.error}`);
                    setLogSeverity("error");
                    setBatchDeleteCurrent(i + 1);
                }
            }
            let ed = +new Date();
            if (ed - st < 1000) await sleep(1000 - (ed - st));
        }
        setTimeout(function () { setBatchDeleteLog(""); setDialogButtonDisabled(false); }, 3000);
    }, [apiPath, batchDeleteUsers]);
    const loadUserList = useCallback(async () => {
        if (allUsersCache.length === 0) {
            setBatchDeleteLoading(true);
            await loadAllUsers();
            setBatchDeleteLoading(false);
        }
    }, [allUsersCache]);

    const [userList, setUserList] = useState(cache.external_user.userList);
    const [userPage, setUserPage] = useState(cache.external_user.userPage);
    const userPageRef = useRef(cache.external_user.userPage);
    const [userPageSize, setUserPageSize] = useState(
        cache.external_user.userPageSize === null ? userSettings.default_row_per_page : cache.external_user.userPageSize
    );
    const [userTotalItems, setUserTotalItems] = useState(cache.external_user.userTotalItems);
    const [userSearch, setUserSearch] = useState(cache.external_user.userSearch);
    const userSearchRef = useRef(cache.external_user.userSearch);
    const [userListParam, setUserListParam] = useState(cache.external_user.userListParam);

    const [banList, setBanList] = useState(cache.external_user.banList);
    const [banPage, setBanPage] = useState(cache.external_user.banPage);
    const banPageRef = useRef(cache.external_user.banPage);
    const [banPageSize, setBanPageSize] = useState(
        cache.external_user.banPageSize === null ? userSettings.default_row_per_page : cache.external_user.banPageSize
    );
    const [banTotalItems, setBanTotalItems] = useState(cache.external_user.banTotalItems);
    const [banSearch, setBanSearch] = useState(cache.external_user.banSearch);
    const banSearchRef = useRef(cache.external_user.banSearch);
    const [banListParam, setBanListParam] = useState(cache.external_user.banListParam);

    useEffect(() => {
        return () => {
            setCache(cache => ({
                ...cache,
                external_user: {
                    ...cache.external_user,
                    userList,
                    userPage,
                    userPageSize,
                    userTotalItems,
                    userSearch,
                    userListParam,
                    banList,
                    banPage,
                    banPageSize,
                    banTotalItems,
                    banSearch,
                    banListParam
                }
            }));
        };
    }, [userList, userPage, userPageSize, userTotalItems, userSearch, userListParam, banList, banPage, banPageSize, banTotalItems, banSearch, banListParam]);

    useEffect(() => {
        userPageRef.current = userPage;
    }, [userPage]);
    useEffect(() => {
        userSearchRef.current = userSearch;
    }, [userSearch]);
    useEffect(() => {
        async function doLoadUser() {
            window.loading += 1;

            let processedParam = removeNUEValues(userListParam);

            let [_userList] = [{}];
            if (userSearch === "") {
                [_userList] = await makeRequestsAuto([
                    { url: `${apiPath}/user/list?order=desc&order_by=uid&page=${userPage}&page_size=${userPageSize}&${new URLSearchParams(processedParam).toString()}`, auth: true },
                ]);
            } else if (!isNaN(userSearch) && userSearch.length >= 1 && userSearch.length <= 4) { // is drivers hub id
                let [_userProfile] = await makeRequestsAuto([
                    { url: `${apiPath}/user/profile?userid=${userSearch}`, auth: true },
                ]);
                if (_userProfile.error === undefined && _userProfile.userid >= 0 && _userProfile.userid !== null) {
                    _userList = { list: [_userProfile], total_items: 1 };
                } else {
                    _userList = { list: [], total_items: 0 };
                }
            } else if (!isNaN(userSearch) && userSearch.length >= 5 && userSearch.length <= 10) { // is truckersmp id
                let [_userProfile] = await makeRequestsAuto([
                    { url: `${apiPath}/user/profile?truckersmpid=${userSearch}`, auth: true },
                ]);
                if (_userProfile.error === undefined) {
                    _userList = { list: [_userProfile], total_items: 1 };
                } else {
                    _userList = { list: [], total_items: 0 };
                }
            } else if (!isNaN(userSearch) && userSearch.length === 17 && userSearch.startsWith("76561")) { // is steam id
                let [_userProfile] = await makeRequestsAuto([
                    { url: `${apiPath}/user/profile?steamid=${userSearch}`, auth: true },
                ]);
                if (_userProfile.error === undefined) {
                    _userList = { list: [_userProfile], total_items: 1 };
                } else {
                    _userList = { list: [], total_items: 0 };
                }
            } else if (!isNaN(userSearch) && userSearch.length >= 17 && userSearch.length <= 19) { // is discord id
                let [_userProfile] = await makeRequestsAuto([
                    { url: `${apiPath}/user/profile?discordid=${userSearch}`, auth: true },
                ]);
                if (_userProfile.error === undefined) {
                    _userList = { list: [_userProfile], total_items: 1 };
                } else {
                    _userList = { list: [], total_items: 0 };
                }
            } else { // not any id
                [_userList] = await makeRequestsAuto([
                    { url: `${apiPath}/user/list?name=${userSearch}&order=desc&order_by=uid&page=${userPage}&page_size=${userPageSize}&${new URLSearchParams(processedParam).toString()}`, auth: true },
                ]);
            }
            if (_userList.list !== undefined) {
                let newUserList = [];
                for (let i = 0; i < _userList.list.length; i++) {
                    let user = _userList.list[i];
                    let banMark = <></>;
                    if (user.ban !== null) banMark = <FontAwesomeIcon icon={faBan} style={{ color: theme.palette.error.main }} />;
                    newUserList.push({ uid: <Typography variant="body2" sx={{ flexGrow: 1, display: 'flex', alignItems: "center" }}><span>{user.uid}</span>&nbsp;{banMark}</Typography>, user: <UserCard key={user.uid} user={user} />, email: user.email, discordid: user.discordid, steamid: <a href={`https://steamcommunity.com/profiles/${user.steamid}`} target="_blank" rel="noreferrer" >{user.steamid}</a>, truckersmpid: <a href={`https://truckersmp.com/user/${user.truckersmpid}`} target="_blank" rel="noreferrer" >{user.truckersmpid}</a>, joined: <TimeDelta key={`${+new Date()}`} timestamp={user.join_timestamp * 1000} rough={true} shortenedMonth={true} /> });
                }
                if (userPageRef.current === userPage && userSearchRef.current === userSearch) {
                    setUserList(newUserList);
                    setUserTotalItems(_userList.total_items);
                }
            }

            window.loading -= 1;
        }
        doLoadUser();
    }, [apiPath, theme, userPage, userPageSize, userSearch, userListParam]);
    useEffect(() => {
        banPageRef.current = banPage;
    }, [banPage]);
    useEffect(() => {
        banSearchRef.current = banSearch;
    }, [banSearch]);
    useEffect(() => {
        async function doLoadBan() {
            window.loading += 1;

            let processedParam = removeNUEValues(banListParam);

            let [_banList] = [{}];
            if (banSearch === "") {
                [_banList] = await makeRequestsAuto([
                    { url: `${apiPath}/user/ban/list?order=desc&order_by=uid&page=${userPage}&page_size=${banPageSize}&${new URLSearchParams(processedParam).toString()}`, auth: true },
                ]);
            } else if (!isNaN(banSearch) && banSearch.length >= 1 && banSearch.length <= 4) { // is drivers hub id
                let [_userProfile] = await makeRequestsAuto([
                    { url: `${apiPath}/user/profile?userid=${banSearch}`, auth: true },
                ]);
                if (_userProfile.error === undefined && _userProfile.userid >= 0 && _userProfile.userid !== null) {
                    _userList = { list: [_userProfile], total_items: 1 };
                } else {
                    _userList = { list: [], total_items: 0 };
                }
            } else if (!isNaN(banSearch) && banSearch.length >= 5 && banSearch.length <= 10) { // is truckersmp id
                let [_banProfile] = await makeRequestsAuto([
                    { url: `${apiPath}/user/ban?truckersmpid=${banSearch}`, auth: true },
                ]);
                if (_banProfile.error === undefined) {
                    _banList = { list: [_banProfile], total_items: 1 };
                } else {
                    _banList = { list: [], total_items: 0 };
                }
            } else if (!isNaN(banSearch) && banSearch.length === 17 && banSearch.startsWith("76561")) { // is steam id
                let [_banProfile] = await makeRequestsAuto([
                    { url: `${apiPath}/user/ban?steamid=${banSearch}`, auth: true },
                ]);
                if (_banProfile.error === undefined) {
                    _banList = { list: [_banProfile], total_items: 1 };
                } else {
                    _banList = { list: [], total_items: 0 };
                }
            } else if (!isNaN(banSearch) && banSearch.length >= 17 && banSearch.length <= 19) { // is discord id
                let [_banProfile] = await makeRequestsAuto([
                    { url: `${apiPath}/user/ban?discordid=${banSearch}`, auth: true },
                ]);
                if (_banProfile.error === undefined) {
                    _banList = { list: [_banProfile], total_items: 1 };
                } else {
                    _banList = { list: [], total_items: 0 };
                }
            } else { // not any id
                [_banList] = await makeRequestsAuto([
                    { url: `${apiPath}/user/ban/list?name=${banSearch}&order=desc&order_by=uid&page=${userPage}&page_size=${banPageSize}&${new URLSearchParams(processedParam).toString()}`, auth: true },
                ]);
            }

            if (_banList.list !== undefined) {
                let newBanList = [];
                for (let i = 0; i < _banList.list.length; i++) {
                    let ban = _banList.list[i];
                    let expireDT = <TimeDelta key={`${+new Date()}`} timestamp={ban.ban.expire * 1000} rough={true} shortenedMonth={true} />;
                    if (ban.ban.expire >= 4102444800 || ban.ban.expire === null) expireDT = "/";
                    newBanList.push({ uid: ban.meta.uid, user: ban.user === null ? undefined : <UserCard key={ban.user.uid} user={ban.user} />, email: ban.meta.email, discordid: ban.meta.discordid, steamid: <a href={`https://steamcommunity.com/profiles/${ban.meta.steamid}`} target="_blank" rel="noreferrer" >{ban.meta.steamid}</a>, truckersmpid: <a href={`https://truckersmp.com/user/${ban.meta.truckersmpid}`} target="_blank" rel="noreferrer" >{ban.meta.truckersmpid}</a>, reason: ban.ban.reason, expire: expireDT, contextMenu: <MenuItem onClick={() => { unbanUser(ban.meta); doLoadBan(); }}>{tr("unban")}</MenuItem> });
                }
                if (banPageRef.current === banPage && banSearchRef.current === banSearch) {
                    setBanList(newBanList);
                    setBanTotalItems(_banList.total_items);
                }
            }

            window.loading -= 1;
        }
        doLoadBan();
    }, [apiPath, theme, banPage, banPageSize, banSearch, banListParam]);

    const unbanUser = useCallback(async (meta) => {
        meta = removeNullValues(meta);
        let resp = await axios({ url: `${apiPath}/user/ban`, method: "DELETE", headers: { Authorization: `Bearer ${getAuthToken()}` }, data: meta });
        if (resp.status === 204) {
            setSnackbarContent(tr("user_unbanned"));
            setSnackbarSeverity("success");
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
    }, [apiPath]);

    return <>
        <CustomTable page={userPage} name={<><FontAwesomeIcon icon={faUserPlus} />&nbsp;&nbsp;{tr("external_users")}</>} order={userListParam.order} orderBy={userListParam.order_by} onOrderingUpdate={(order_by, order) => { setUserListParam({ ...userListParam, order_by: order_by, order: order }); }} titlePosition="top" columns={puColumns} data={userList} totalItems={userTotalItems} rowsPerPageOptions={[10, 25, 50, 100, 250]} defaultRowsPerPage={userPageSize} onPageChange={setUserPage} onRowsPerPageChange={setUserPageSize} onSearch={(content) => { setUserPage(1); setUserSearch(content); }} searchHint={tr("search_by_username_or_ids")} />
        <CustomTable page={banPage} name={<><FontAwesomeIcon icon={faBan} />&nbsp;&nbsp;{tr("banned_users")}</>} order={banListParam.order} orderBy={banListParam.order_by} onOrderingUpdate={(order_by, order) => { setBanListParam({ ...banListParam, order_by: order_by, order: order }); }} titlePosition="top" columns={buColumns} data={banList} totalItems={banTotalItems} rowsPerPageOptions={[10, 25, 50, 100, 250]} defaultRowsPerPage={banPageSize} onPageChange={setBanPage} onRowsPerPageChange={setBanPageSize} style={{ marginTop: "15px" }} onSearch={(content) => { setBanPage(1); setBanSearch(content); }} searchHint={tr("search_by_username_or_ids")} />
        <Portal>
            <Snackbar
                open={!!snackbarContent}
                autoHideDuration={5000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
                    {snackbarContent}
                </Alert>
            </Snackbar>
        </Portal>
        <Dialog open={dialogOpen === "prune-user"} onClose={() => { if (!dialogButtonDisabled) setDialogOpen(""); }}>
            <DialogTitle><FontAwesomeIcon icon={faUsersSlash} />&nbsp;&nbsp;{tr("prune_users")}&nbsp;&nbsp;<SponsorBadge level={4} /></DialogTitle>
            <DialogContent>
                <Typography variant="body2">{tr("prune_users_note")}</Typography>
                <Typography variant="body2">{tr("prune_users_note_2")}</Typography>
                <Typography variant="body2" sx={{ color: theme.palette.warning.main }}>{tr("prune_users_note_3")}</Typography>
                <Typography variant="body2" sx={{ color: theme.palette.warning.main }}>{tr("prune_users_note_4")}</Typography>
                <Grid container spacing={2} sx={{ mt: "5px", mb: "5px" }}>
                    <Grid item xs={8}>
                        <DateTimeField size="small"
                            label={tr("last_online_before")}
                            defaultValue={batchDeleteLastOnline}
                            onChange={(timestamp) => { setBatchDeleteLastOnline(timestamp); }}
                            fullWidth
                            disabled={batchDeleteLoading}
                        />
                    </Grid>
                    <Grid item xs={4}>
                        <Button variant="contained" color="info" onClick={() => {
                            if (batchDeleteLastOnline === undefined) return;
                            let newList = [];
                            for (let i = 0; i < allUsersCache.length; i++) {
                                if (allUsersCache[i].activity !== null && allUsersCache[i].activity.last_seen < batchDeleteLastOnline) {
                                    newList.push(allUsersCache[i]);
                                }
                            }
                            setBatchDeleteUsers(newList);
                        }} disabled={dialogButtonDisabled || batchDeleteLoading} fullWidth>{tr("select")}</Button>
                    </Grid>
                    <Grid item xs={12}>
                        {/*This has to be done because UserSelect does not support update on userList*/}
                        {allUsersCache.length === 0 && <UserSelect userList={allUsersCache} label={tr("users")} users={batchDeleteUsers} isMulti={true} onUpdate={setBatchDeleteUsers} disabled={batchDeleteLoading} allowSelectAll={true} />}
                        {allUsersCache.length !== 0 && <UserSelect userList={allUsersCache} label={tr("users")} users={batchDeleteUsers} isMulti={true} onUpdate={setBatchDeleteUsers} disabled={batchDeleteLoading} allowSelectAll={true} />}
                    </Grid>
                </Grid>
                {(dialogButtonDisabled || batchDeleteCurrent !== 0 && batchDeleteCurrent == batchDeleteUsers.length) && <>
                    <Typography variant="body2" gutterBottom sx={{ mt: "5px" }}>{tr("completed")}{batchDeleteCurrent} / {batchDeleteUsers.length}</Typography>
                    <LinearProgress variant="determinate" color="info" value={batchDeleteCurrent / batchDeleteUsers.length * 100} />
                    <Typography variant="body2" sx={{ color: theme.palette[logSeverity].main }} gutterBottom>{batchDeleteLog}</Typography>
                </>}
                {batchDeleteLoading && <>
                    <Typography variant="body2" gutterBottom sx={{ mt: "5px" }}>{tr("loading_user_list_please_wait")}</Typography>
                    <LinearProgress variant="indeterminate" color="info" />
                </>}
            </DialogContent>
            <DialogActions>
                <Button variant="contained" color="error" onClick={() => { batchDelete(); }} disabled={dialogButtonDisabled || batchDeleteLoading}>{tr("delete")}</Button>
            </DialogActions>
        </Dialog>
        <SpeedDial
            ariaLabel={tr("controls")}
            sx={{ position: 'fixed', bottom: 20, right: 20 }}
            icon={<SpeedDialIcon />}
        >
            <SpeedDialAction
                key="prune-user"
                icon={<FontAwesomeIcon icon={faUsersSlash} />}
                tooltipTitle={tr("prune_users")}
                onClick={() => { loadUserList(); setDialogOpen("prune-user"); }}
            />
        </SpeedDial>
    </>;
};

export default ExternalUsers;