import React from 'react';
import { useRef, useEffect, useState, useCallback } from 'react';
import { useTheme, Typography, MenuItem, Snackbar, Alert, SpeedDial, SpeedDialAction, SpeedDialIcon, Dialog, DialogTitle, DialogActions, DialogContent, Chip, Grid, Button, LinearProgress } from '@mui/material';
import { Portal } from '@mui/base';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faBan, faUsersSlash } from '@fortawesome/free-solid-svg-icons';

import TimeAgo from '../components/timeago';
import CustomTable from "../components/table";
import { makeRequestsAuto, getFormattedDate, removeNullValues, customAxios as axios, getAuthToken, removeNUEValues, loadAllUsers } from '../functions';
import UserCard from '../components/usercard';
import UserSelect from '../components/userselect';
import DateTimeField from '../components/datetime';

var vars = require("../variables");

const puColumns = [
    { id: 'uid', label: 'UID', orderKey: 'uid', defaultOrder: 'desc' },
    { id: 'user', label: 'User', orderKey: 'name', defaultOrder: 'asc' },
    { id: 'email', label: 'Email', orderKey: 'email', defaultOrder: 'asc' },
    { id: 'discordid', label: 'Discord ID', orderKey: 'discordid', defaultOrder: 'asc' },
    { id: 'steamid', label: 'Steam ID', orderKey: 'steamid', defaultOrder: 'asc' },
    { id: 'truckersmpid', label: 'TruckersMP ID', orderKey: 'truckersmpid', defaultOrder: 'asc' },
    { id: 'joined', label: 'Joined', orderKey: 'join_timestamp', defaultOrder: 'asc' }
];
const buColumns = [
    { id: 'uid', label: 'UID', orderKey: 'uid', defaultOrder: 'desc' },
    { id: 'user', label: 'User', orderKey: 'name', defaultOrder: 'asc' },
    { id: 'email', label: 'Email', orderKey: 'email', defaultOrder: 'asc' },
    { id: 'discordid', label: 'Discord ID', orderKey: 'discordid', defaultOrder: 'asc' },
    { id: 'steamid', label: 'Steam ID', orderKey: 'steamid', defaultOrder: 'asc' },
    { id: 'truckersmpid', label: 'TruckersMP ID', orderKey: 'truckersmpid', defaultOrder: 'asc' },
    { id: 'reason', label: 'Ban Reason' },
    { id: 'expire', label: 'Expire' }
];

const ExternalUsers = () => {
    const theme = useTheme();

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
        setDialogButtonDisabled(true);
        setBatchDeleteLog("");
        setBatchDeleteCurrent(0);
        for (let i = 0; i < batchDeleteUsers.length; i++) {
            let st = +new Date();
            let resp = await axios({ url: `${vars.dhpath}/user/${batchDeleteUsers[i].uid}`, method: "DELETE", headers: { Authorization: `Bearer ${getAuthToken()}` } });
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
    }, [batchDeleteUsers]);
    const loadUserList = useCallback(async () => {
        if (vars.allUsers.length === 0) {
            setBatchDeleteLoading(true);
            await loadAllUsers();
            setBatchDeleteLoading(false);
        }
    }, [vars.allUsers]);

    const [userList, setUserList] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [page, setPage] = useState(1);
    const pageRef = useRef(1);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState("");
    const searchRef = useRef("");
    const [listParam, setListParam] = useState({ order_by: "uid", order: "desc" });

    const [banList, setBanList] = useState([]);
    const [banTotalItems, setBanTotalItems] = useState(0);
    const [banPage, setBanPage] = useState(1);
    const banPageRef = useRef(1);
    const [banPageSize, setBanPageSize] = useState(10);
    const [banSearch, setBanSearch] = useState("");
    const banSearchRef = useRef("");
    const [banListParam, setBanListParam] = useState({ order_by: "uid", order: "desc" });

    const unbanUser = useCallback(async (meta) => {
        meta = removeNullValues(meta);
        let resp = await axios({ url: `${vars.dhpath}/user/ban`, method: "DELETE", headers: { Authorization: `Bearer ${getAuthToken()}` }, data: meta });
        if (resp.status === 204) {
            setSnackbarContent("User unbanned");
            setSnackbarSeverity("success");
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
    }, []);

    useEffect(() => {
        pageRef.current = page;
    }, [page]);
    useEffect(() => {
        searchRef.current = search;
    }, [search]);
    const doLoadUser = useCallback(async () => {
        const loadingStart = new CustomEvent('loadingStart', {});
        window.dispatchEvent(loadingStart);

        let processedParam = removeNUEValues(listParam);

        let [_userList] = [{}];
        if (search === "")
            [_userList] = await makeRequestsAuto([
                { url: `${vars.dhpath}/user/list?order=desc&order_by=uid&page=${page}&page_size=${pageSize}&${new URLSearchParams(processedParam).toString()}`, auth: true },
            ]);
        else if (isNaN(search) || !isNaN(search) && (search.length < 17 || search.length > 19)) // not discord id
            [_userList] = await makeRequestsAuto([
                { url: `${vars.dhpath}/user/list?name=${search}&order=desc&order_by=uid&page=${page}&page_size=${pageSize}&${new URLSearchParams(processedParam).toString()}`, auth: true },
            ]);
        else if (!isNaN(search) && search.length >= 17 && search.length <= 19) { // is discord id
            let [_userProfile] = await makeRequestsAuto([
                { url: `${vars.dhpath}/user/profile?discordid=${search}`, auth: true },
            ]);
            if (_userProfile.error === undefined) {
                _userList = { list: [_userProfile], total_items: 1 };
            } else {
                _userList = { list: [], total_items: 0 };
            }
        }
        if (_userList.list !== undefined) {
            let newUserList = [];
            for (let i = 0; i < _userList.list.length; i++) {
                let user = _userList.list[i];
                let banMark = <></>;
                if (user.ban !== null) banMark = <FontAwesomeIcon icon={faBan} style={{ color: theme.palette.error.main }} />;
                newUserList.push({ uid: <Typography variant="body2" sx={{ flexGrow: 1, display: 'flex', alignItems: "center" }}><span>{user.uid}</span>&nbsp;{banMark}</Typography>, user: <UserCard key={user.uid} user={user} />, email: user.email, discordid: user.discordid, steamid: <a href={`https://steamcommunity.com/profiles/${user.steamid}`} target="_blank" rel="noreferrer" >{user.steamid}</a>, truckersmpid: <a href={`https://truckersmp.com/user/${user.truckersmpid}`} target="_blank" rel="noreferrer" >{user.truckersmpid}</a>, joined: <TimeAgo key={`${+new Date()}`} timestamp={user.join_timestamp * 1000} /> });
            }
            if (pageRef.current === page && searchRef.current === search) {
                setUserList(newUserList);
                setTotalItems(_userList.total_items);
            }
        }

        const loadingEnd = new CustomEvent('loadingEnd', {});
        window.dispatchEvent(loadingEnd);
    }, [theme, page, pageSize, search, listParam]);
    useEffect(() => {
        banPageRef.current = banPage;
    }, [banPage]);
    useEffect(() => {
        banSearchRef.current = banSearch;
    }, [banSearch]);
    const doLoadBan = useCallback(async () => {
        const loadingStart = new CustomEvent('loadingStart', {});
        window.dispatchEvent(loadingStart);

        let processedParam = removeNUEValues(banListParam);

        let [_banList] = [{}];
        if (banSearch === "")
            [_banList] = await makeRequestsAuto([
                { url: `${vars.dhpath}/user/ban/list?order=desc&order_by=uid&page=${page}&page_size=${banPageSize}&${new URLSearchParams(processedParam).toString()}`, auth: true },
            ]);
        else if (isNaN(banSearch) || !isNaN(banSearch) && (banSearch.length < 17 || banSearch.length > 19)) // not discord id
            [_banList] = await makeRequestsAuto([
                { url: `${vars.dhpath}/user/ban/list?name=${banSearch}&order=desc&order_by=uid&page=${page}&page_size=${banPageSize}&${new URLSearchParams(processedParam).toString()}`, auth: true },
            ]);
        else if (!isNaN(banSearch) && banSearch.length >= 17 && banSearch.length <= 19) { // is discord id
            let [_banProfile] = await makeRequestsAuto([
                { url: `${vars.dhpath}/user/ban?discordid=${banSearch}`, auth: true },
            ]);
            if (_banProfile.error === undefined) {
                _banList = { list: [_banProfile], total_items: 1 };
            } else {
                _banList = { list: [], total_items: 0 };
            }
        }

        if (_banList.list !== undefined) {
            let newBanList = [];
            for (let i = 0; i < _banList.list.length; i++) {
                let ban = _banList.list[i];
                let expireDT = getFormattedDate(new Date(ban.ban.expire * 1000));
                if (ban.ban.expire >= 4102444800 || ban.ban.expire === null) expireDT = "/";
                newBanList.push({ uid: ban.meta.uid, user: <UserCard key={ban.user.uid} user={ban.user} />, email: ban.meta.email, discordid: ban.meta.discordid, steamid: <a href={`https://steamcommunity.com/profiles/${ban.meta.steamid}`} target="_blank" rel="noreferrer" >{ban.meta.steamid}</a>, truckersmpid: <a href={`https://truckersmp.com/user/${ban.meta.truckersmpid}`} target="_blank" rel="noreferrer" >{ban.meta.truckersmpid}</a>, reason: ban.ban.reason, expire: expireDT, contextMenu: <MenuItem onClick={() => { unbanUser(ban.meta); doLoad(); }}>Unban</MenuItem> });
            }
            if (banPageRef.current === banPage && banSearchRef.current === banSearch) {
                setBanList(newBanList);
                setBanTotalItems(_banList.total_items);
            }
        }

        const loadingEnd = new CustomEvent('loadingEnd', {});
        window.dispatchEvent(loadingEnd);
    }, [theme, banPage, banPageSize, banSearch, banListParam]);
    useEffect(() => {
        doLoadUser();
    }, [doLoadUser]);
    useEffect(() => {
        doLoadBan();
    }, [doLoadBan]);

    useEffect(() => {
        const handleUpdateEvent = () => {
            doLoadUser();
            doLoadBan();
        };
        window.addEventListener("updateExternalUserTable", handleUpdateEvent);
        return () => {
            window.removeEventListener("updateExternalUserTable", handleUpdateEvent);
        };
    }, [doLoadUser, doLoadBan]);

    return <>
        <CustomTable name={<><FontAwesomeIcon icon={faUserPlus} />&nbsp;&nbsp;External Users</>} order={listParam.order} orderBy={listParam.order_by} onOrderingUpdate={(order_by, order) => { setListParam({ ...listParam, order_by: order_by, order: order }); }} titlePosition="top" columns={puColumns} data={userList} totalItems={totalItems} rowsPerPageOptions={[10, 25, 50, 100, 250]} defaultRowsPerPage={pageSize} onPageChange={setPage} onRowsPerPageChange={setPageSize} onSearch={(content) => { setPage(1); setSearch(content); }} searchHint="Search by username or discord id" />
        <CustomTable name={<><FontAwesomeIcon icon={faBan} />&nbsp;&nbsp;Banned Users</>} order={banListParam.order} orderBy={banListParam.order_by} onOrderingUpdate={(order_by, order) => { setBanListParam({ ...banListParam, order_by: order_by, order: order }); }} titlePosition="top" columns={buColumns} data={banList} totalItems={banTotalItems} rowsPerPageOptions={[10, 25, 50, 100, 250]} defaultRowsPerPage={banPageSize} onPageChange={setBanPage} onRowsPerPageChange={setBanPageSize} style={{ marginTop: "15px" }} onSearch={(content) => { setBanPage(1); setBanSearch(content); }} searchHint="Search by username or discord id" />
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
            <DialogTitle><FontAwesomeIcon icon={faUsersSlash} />&nbsp;&nbsp;Prune Users  <Chip sx={{ bgcolor: "#387aff", height: "20px", borderRadius: "5px", marginTop: "-3px" }} label="Beta" /></DialogTitle>
            <DialogContent>
                <Typography variant="body2">- You could delete a list of users.</Typography>
                <Typography variant="body2">- By setting the value of "Last Online Before" and clicking "Select", you could select a list of inactive users to delete. Note that users whose last online was a long time ago might not be detected.</Typography>
                <Typography variant="body2" sx={{ color: theme.palette.warning.main }}>- When performing the changes, do not close the tab, or the process will stop.</Typography>
                <Typography variant="body2" sx={{ color: theme.palette.warning.main }}>- The dialog cannot be closed once the process starts, you may open a new tab to continue using the Drivers Hub.</Typography>
                <Grid container spacing={2} sx={{ mt: "5px", mb: "5px" }}>
                    <Grid item xs={8}>
                        <DateTimeField size="small"
                            label="Last Online Before"
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
                            for (let i = 0; i < vars.allUsers.length; i++) {
                                if (vars.allUsers[i].activity !== null && vars.allUsers[i].activity.last_seen < batchDeleteLastOnline) {
                                    newList.push(vars.allUsers[i]);
                                }
                            }
                            setBatchDeleteUsers(newList);
                        }} disabled={dialogButtonDisabled || batchDeleteLoading} fullWidth>Select</Button>
                    </Grid>
                    <Grid item xs={12}>
                        {/*This has to be done because UserSelect does not support update on userList*/}
                        {vars.allUsers.length === 0 && <UserSelect userList={vars.allUsers} label="Users" users={batchDeleteUsers} isMulti={true} onUpdate={setBatchDeleteUsers} disabled={batchDeleteLoading} allowSelectAll={true} />}
                        {vars.allUsers.length !== 0 && <UserSelect userList={vars.allUsers} label="Users" users={batchDeleteUsers} isMulti={true} onUpdate={setBatchDeleteUsers} disabled={batchDeleteLoading} allowSelectAll={true} />}
                    </Grid>
                </Grid>
                {(dialogButtonDisabled || batchDeleteCurrent !== 0 && batchDeleteCurrent == batchDeleteUsers.length) && <>
                    <Typography variant="body2" gutterBottom sx={{ mt: "5px" }}>Completed {batchDeleteCurrent} / {batchDeleteUsers.length}</Typography>
                    <LinearProgress variant="determinate" color="info" value={batchDeleteCurrent / batchDeleteUsers.length * 100} />
                    <Typography variant="body2" sx={{ color: theme.palette[logSeverity].main }} gutterBottom>{batchDeleteLog}</Typography>
                </>}
                {batchDeleteLoading && <>
                    <Typography variant="body2" gutterBottom sx={{ mt: "5px" }}>Loading user list, please wait...</Typography>
                    <LinearProgress variant="indeterminate" color="info" />
                </>}
            </DialogContent>
            <DialogActions>
                <Button variant="contained" color="error" onClick={() => { batchDelete(); }} disabled={dialogButtonDisabled || batchDeleteLoading}>Delete</Button>
            </DialogActions>
        </Dialog>
        <SpeedDial
            ariaLabel="Controls"
            sx={{ position: 'fixed', bottom: 20, right: 20 }}
            icon={<SpeedDialIcon />}
        >
            <SpeedDialAction
                key="prune-user"
                icon={<FontAwesomeIcon icon={faUsersSlash} />}
                tooltipTitle="Prune Users"
                onClick={() => { loadUserList(); setDialogOpen("prune-user"); }}
            />
        </SpeedDial>
    </>;
};

export default ExternalUsers;