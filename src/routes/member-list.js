import React from 'react';
import { useRef, useEffect, useState, useCallback } from 'react';
import { useTheme, Dialog, DialogTitle, DialogContent, DialogActions, LinearProgress, Typography, Button, SpeedDial, SpeedDialAction, SpeedDialIcon, MenuItem, TextField, Grid, Snackbar, Alert } from '@mui/material';
import { Portal } from '@mui/base';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsRotate, faIdCard, faTruck, faUserGroup, faUsersSlash } from '@fortawesome/free-solid-svg-icons';

import TimeAgo from '../components/timeago';
import CustomTable from "../components/table";
import { makeRequestsAuto, customAxios as axios, getAuthToken, removeNUEValues } from '../functions';
import UserCard from '../components/usercard';
import UserSelect from '../components/userselect';
import RoleSelect from '../components/roleselect';
import DateTimeField from '../components/datetime';
import SponsorBadge from '../components/sponsorBadge';

var vars = require("../variables");

const columns = [
    { id: 'userid', label: 'User ID', orderKey: 'userid', defaultOrder: 'asc' },
    { id: 'user', label: 'User', orderKey: 'name', defaultOrder: 'asc' },
    { id: 'discordid', label: 'Discord ID', orderKey: 'discordid', defaultOrder: 'asc' },
    { id: 'steamid', label: 'Steam ID', orderKey: 'steamid', defaultOrder: 'asc' },
    { id: 'truckersmpid', label: 'TruckersMP ID', orderKey: 'truckersmpid', defaultOrder: 'asc' },
    { id: 'joined', label: 'Joined', orderKey: 'join_timestamp', defaultOrder: 'asc' },
    { id: 'last_seen', label: 'Last Seen', orderKey: 'last_seen', defaultOrder: 'desc' }
];

const MemberList = () => {
    const theme = useTheme();

    const [userList, setUserList] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [page, setPage] = useState(1);
    const pageRef = useRef(1);
    const [pageSize, setPageSize] = useState(vars.userSettings.default_row_per_page);
    const [search, setSearch] = useState("");
    const searchRef = useRef("");
    const [listParam, setListParam] = useState({ order_by: "userid", order: "asc" });

    const [dialogOpen, setDialogOpen] = useState("");
    const [dialogButtonDisabled, setDialogButtonDisabled] = useState(false);
    const [snackbarContent, setSnackbarContent] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const handleCloseSnackbar = useCallback(() => {
        setSnackbarContent("");
    }, []);

    const sleep = ms => new Promise(
        resolve => setTimeout(resolve, ms)
    );

    const [logSeverity, setLogSeverity] = useState("success");

    const [syncProfileLog, setSyncProfileLog] = useState("");
    const [syncProfileCurrent, setSyncProfileCurrent] = useState(0);
    const syncProfile = useCallback(async () => {
        if (vars.userLevel < 4) {
            setSnackbarContent("Sync Profiles is a Platinum Perk! Sponsor at charl.ws/patreon");
            setSnackbarSeverity("warning");
            return;
        }
        setDialogButtonDisabled(true);
        setSyncProfileLog("");
        setSyncProfileCurrent(0);
        for (let i = 0; i < vars.members.length; i++) {
            let sync_to = undefined;
            if (vars.members[i].avatar.startsWith("https://cdn.discordapp.com/")) {
                sync_to = "discord";
            } else if (vars.members[i].avatar.startsWith("https://avatars.steamstatic.com/")) {
                sync_to = "steam";
            } else if (vars.members[i].avatar.startsWith("https://static.truckersmp.com/")) {
                sync_to = "truckersmp";
            } else {
                setSyncProfileCurrent(i + 1);
                continue;
            }
            sync_to = `&sync_to_${sync_to}=true`;
            let st = +new Date();
            let resp = await axios({ url: `${vars.dhpath}/user/profile?uid=${vars.members[i].uid}${sync_to}`, method: "PATCH", headers: { Authorization: `Bearer ${getAuthToken()}` } });
            if (resp.status === 204) {
                setSyncProfileLog(`Synced ${vars.members[i].name}'s profile`);
                setLogSeverity("success");
                setSyncProfileCurrent(i + 1);
            } else {
                if (resp.data.retry_after !== undefined) {
                    setSyncProfileLog(`We are being rate limited by Drivers Hub API. We will continue after ${resp.data.retry_after} seconds...`);
                    setLogSeverity("warning");
                    await sleep((resp.data.retry_after + 1) * 1000);
                    i -= 1;
                } else {
                    setSyncProfileLog(`Failed to sync ${vars.members[i].name}'s profile: ${resp.data.error}`);
                    setLogSeverity("error");
                    setSyncProfileCurrent(i + 1);
                }
            }
            let ed = +new Date();
            if (ed - st < 4000) await sleep(4000 - (ed - st));
        }
        setDialogButtonDisabled(false);
    }, []);

    const [batchRoleUpdateUsers, setBatchRoleUpdateUsers] = useState([]);
    const [batchRoleUpdateRoles, setBatchRoleUpdateRoles] = useState([]);
    const [batchRoleUpdateMode, setBatchRoleUpdateMode] = useState("add");
    const [batchRoleUpdateLog, setBatchRoleUpdateLog] = useState("");
    const [batchRoleUpdateCurrent, setBatchRoleUpdateCurrent] = useState(0);
    const batchUpdateRoles = useCallback(async () => {
        if (vars.userLevel < 4) {
            setSnackbarContent("Batch Update Roles is a Platinum Perk! Sponsor at charl.ws/patreon");
            setSnackbarSeverity("warning");
            return;
        }
        setDialogButtonDisabled(true);
        setBatchRoleUpdateLog("");
        setBatchRoleUpdateCurrent(0);
        if (batchRoleUpdateMode === "overwrite") {
            for (let i = 0; i < batchRoleUpdateUsers.length; i++) {
                let st = +new Date();
                let resp = await axios({ url: `${vars.dhpath}/member/${batchRoleUpdateUsers[i].userid}/roles`, method: "PATCH", data: { roles: batchRoleUpdateRoles }, headers: { Authorization: `Bearer ${getAuthToken()}` } });
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
                let resp = await axios({ url: `${vars.dhpath}/user/profile?userid=${batchRoleUpdateUsers[i].userid}`, method: "GET", headers: { Authorization: `Bearer ${getAuthToken()}` } });
                if (resp.status === 200) {
                    let newRoles = resp.data.roles;
                    if (batchRoleUpdateMode === "add") {
                        newRoles = [...new Set([...newRoles, ...batchRoleUpdateRoles])];
                    } else if (batchRoleUpdateMode === "remove") {
                        newRoles = newRoles.filter((role) => (!batchRoleUpdateRoles.includes(role)));
                    }
                    resp = await axios({ url: `${vars.dhpath}/member/${batchRoleUpdateUsers[i].userid}/roles`, method: "PATCH", data: { roles: newRoles }, headers: { Authorization: `Bearer ${getAuthToken()}` } });
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
        setTimeout(function () { setBatchRoleUpdateLog(""); setDialogButtonDisabled(false); }, 3000);
    }, [batchRoleUpdateUsers, batchRoleUpdateRoles, batchRoleUpdateMode]);

    const [batchTrackerUpdateUsers, setBatchTrackerUpdateUsers] = useState([]);
    const [batchTrackerUpdateTo, setBatchTrackerUpdateTo] = useState("trucky");
    const [batchTrackerUpdateLog, setBatchTrackerUpdateLog] = useState("");
    const [batchTrackerUpdateCurrent, setBatchTrackerUpdateCurrent] = useState(0);
    const batchUpdateTrackers = useCallback(async () => {
        if (vars.userLevel < 4) {
            setSnackbarContent("Batch Update Tracker is a Platinum Perk! Sponsor at charl.ws/patreon");
            setSnackbarSeverity("warning");
            return;
        }
        setDialogButtonDisabled(true);
        setBatchTrackerUpdateLog("");
        setBatchTrackerUpdateCurrent(0);
        for (let i = 0; i < batchTrackerUpdateUsers.length; i++) {
            let st = +new Date();
            let resp = await axios({ url: `${vars.dhpath}/user/tracker/switch?uid=${batchTrackerUpdateUsers[i].uid}`, method: "POST", data: { tracker: batchTrackerUpdateTo }, headers: { Authorization: `Bearer ${getAuthToken()}` } });
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
        setTimeout(function () { setBatchTrackerUpdateLog(""); setDialogButtonDisabled(false); }, 3000);
    }, [batchTrackerUpdateUsers, batchTrackerUpdateTo]);

    const [batchDismissUsers, setBatchDismissUsers] = useState([]);
    const [batchDismissLastOnline, setBatchDismissLastOnline] = useState(undefined);
    const [batchDismissLog, setBatchDismissLog] = useState("");
    const [batchDismissCurrent, setBatchDismissCurrent] = useState(0);
    const batchDismiss = useCallback(async () => {
        if (vars.userLevel < 4) {
            setSnackbarContent("Batch Dismiss Members is a Platinum Perk! Sponsor at charl.ws/patreon");
            setSnackbarSeverity("warning");
            return;
        }
        setDialogButtonDisabled(true);
        setBatchDismissLog("");
        setBatchDismissCurrent(0);
        for (let i = 0; i < batchDismissUsers.length; i++) {
            let st = +new Date();
            let resp = await axios({ url: `${vars.dhpath}/member/${batchDismissUsers[i].userid}/dismiss`, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
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
        setTimeout(function () { setBatchDismissLog(""); setDialogButtonDisabled(false); }, 3000);
    }, [batchDismissUsers]);

    useEffect(() => {
        pageRef.current = page;
    }, [page]);
    useEffect(() => {
        searchRef.current = search;
    }, [search]);
    const doLoad = useCallback(async () => {
        const loadingStart = new CustomEvent('loadingStart', {});
        window.dispatchEvent(loadingStart);

        let processedParam = removeNUEValues(listParam);

        let [_userList] = [{}];
        if (search === "")
            [_userList] = await makeRequestsAuto([
                { url: `${vars.dhpath}/member/list?order=desc&order_by=userid&page=${page}&page_size=${pageSize}&${new URLSearchParams(processedParam).toString()}`, auth: true },
            ]);
        else if (isNaN(search) || !isNaN(search) && (search.length < 17 || search.length > 19)) // not discord id
            [_userList] = await makeRequestsAuto([
                { url: `${vars.dhpath}/member/list?name=${search}&order=desc&order_by=userid&page=${page}&page_size=${pageSize}&${new URLSearchParams(processedParam).toString()}`, auth: true },
            ]);
        else if (!isNaN(search) && search.length >= 17 && search.length <= 19) { // is discord id
            let [_userProfile] = await makeRequestsAuto([
                { url: `${vars.dhpath}/user/profile?discordid=${search}`, auth: true },
            ]);
            if (_userProfile.error === undefined && _userProfile.userid >= 0 && _userProfile.userid !== null) {
                _userList = { list: [_userProfile], total_items: 1 };
            } else {
                _userList = { list: [], total_items: 0 };
            }
        }
        if (_userList.list !== undefined) {
            let newUserList = [];
            for (let i = 0; i < _userList.list.length; i++) {
                let user = _userList.list[i];
                newUserList.push({ userid: `${user.userid}`, user: <UserCard key={user.uid} user={user} />, discordid: user.discordid, steamid: <a href={`https://steamcommunity.com/profiles/${user.steamid}`} target="_blank" rel="noreferrer" >{user.steamid}</a>, truckersmpid: <a href={`https://truckersmp.com/user/${user.truckersmpid}`} target="_blank" rel="noreferrer" >{user.truckersmpid}</a>, joined: <TimeAgo key={`${+new Date()}`} timestamp={user.join_timestamp * 1000} />, last_seen: user.activity !== null && user.activity.last_seen !== undefined ? <TimeAgo key={`${+new Date()}`} timestamp={user.activity.last_seen * 1000} /> : "/" });
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
        doLoad();
    }, [doLoad]);

    return <>
        <CustomTable name={<><FontAwesomeIcon icon={faUserGroup} />&nbsp;&nbsp;Members</>} order={listParam.order} orderBy={listParam.order_by} onOrderingUpdate={(order_by, order) => { setListParam({ ...listParam, order_by: order_by, order: order }); }} titlePosition="top" columns={columns} data={userList} totalItems={totalItems} rowsPerPageOptions={[10, 25, 50, 100, 250]} defaultRowsPerPage={pageSize} onPageChange={setPage} onRowsPerPageChange={setPageSize} onSearch={(content) => { setPage(1); setSearch(content); }} searchHint="Search by username or discord id" />
        <Dialog open={dialogOpen === "sync-profile"} onClose={() => { if (!dialogButtonDisabled) setDialogOpen(""); }}>
            <DialogTitle><FontAwesomeIcon icon={faArrowsRotate} />&nbsp;&nbsp;Sync Profiles</DialogTitle>
            <DialogContent>
                <Typography variant="body2">- The profiles of all users will be updated to to the current one in Discord, Steam or TruckersMP.</Typography>
                <Typography variant="body2">- This function is mainly used to sync outdated profile. Custom profiles will not be synced.</Typography>
                <Typography variant="body2" sx={{ color: theme.palette.warning.main }}>- When importing syncing profiles, do not close the tab, or the process will stop.</Typography>
                <Typography variant="body2" sx={{ color: theme.palette.warning.main }}>- The dialog cannot be closed once the process starts, you may open a new tab to continue using the Drivers Hub.</Typography>
                <br />
                {dialogButtonDisabled && <>
                    <Typography variant="body2" gutterBottom>Completed {syncProfileCurrent} / {vars.members.length}</Typography>
                    <LinearProgress variant="determinate" color="info" value={syncProfileCurrent / vars.members.length * 100} />
                    <Typography variant="body2" sx={{ color: theme.palette[logSeverity].main }} gutterBottom>{syncProfileLog}</Typography>
                </>}
            </DialogContent>
            <DialogActions>
                <Button variant="contained" color="info" onClick={() => { syncProfile(); }} disabled={dialogButtonDisabled}>Sync</Button>
            </DialogActions>
        </Dialog>
        <Dialog open={dialogOpen === "batch-role-update"} onClose={() => { if (!dialogButtonDisabled) setDialogOpen(""); }}>
            <DialogTitle><FontAwesomeIcon icon={faIdCard} />&nbsp;&nbsp;Batch Update Roles  <SponsorBadge level={4} /></DialogTitle>
            <DialogContent>
                <Typography variant="body2">- You could add / remove / overwrite roles for a list of members.</Typography>
                <Typography variant="body2" sx={{ color: theme.palette.warning.main }}>- When performing the changes, do not close the tab, or the process will stop.</Typography>
                <Typography variant="body2" sx={{ color: theme.palette.warning.main }}>- The dialog cannot be closed once the process starts, you may open a new tab to continue using the Drivers Hub.</Typography>
                <UserSelect label="Users" users={batchRoleUpdateUsers} isMulti={true} onUpdate={setBatchRoleUpdateUsers} style={{ marginTop: "5px", marginBottom: "5px" }} allowSelectAll={true} />
                <RoleSelect label="Roles" initialRoles={batchRoleUpdateRoles} onUpdate={(newRoles) => setBatchRoleUpdateRoles(newRoles.map((role) => (role.id)))} style={{ marginBottom: "12px" }} />
                <TextField select size="small"
                    label="Mode"
                    value={batchRoleUpdateMode}
                    onChange={(e) => { setBatchRoleUpdateMode(e.target.value); }}
                    fullWidth
                >
                    <MenuItem value="add">Add selected roles</MenuItem>
                    <MenuItem value="remove">Remove selected roles</MenuItem>
                    <MenuItem value="overwrite">Overwrite current roles</MenuItem>
                </TextField>
                {(dialogButtonDisabled || batchRoleUpdateCurrent !== 0 && batchRoleUpdateCurrent == batchRoleUpdateUsers.length) && <>
                    <Typography variant="body2" gutterBottom sx={{ mt: "5px" }}>Completed {batchRoleUpdateCurrent} / {batchRoleUpdateUsers.length}</Typography>
                    <LinearProgress variant="determinate" color="info" value={batchRoleUpdateCurrent / batchRoleUpdateUsers.length * 100} />
                    <Typography variant="body2" sx={{ color: theme.palette[logSeverity].main }} gutterBottom>{batchRoleUpdateLog}</Typography>
                </>}
            </DialogContent>
            <DialogActions>
                <Button variant="contained" color="info" onClick={() => { batchUpdateRoles(); }} disabled={dialogButtonDisabled}>Update</Button>
            </DialogActions>
        </Dialog>
        <Dialog open={dialogOpen === "batch-tracker-update"} onClose={() => { if (!dialogButtonDisabled) setDialogOpen(""); }}>
            <DialogTitle><FontAwesomeIcon icon={faTruck} />&nbsp;&nbsp;Batch Update Tracker  <SponsorBadge level={4} /></DialogTitle>
            <DialogContent>
                <Typography variant="body2">- You could set the tracker for a list of members.</Typography>
                <Typography variant="body2" sx={{ color: theme.palette.warning.main }}>- When performing the changes, do not close the tab, or the process will stop.</Typography>
                <Typography variant="body2" sx={{ color: theme.palette.warning.main }}>- The dialog cannot be closed once the process starts, you may open a new tab to continue using the Drivers Hub.</Typography>
                <UserSelect label="Users" users={batchTrackerUpdateUsers} isMulti={true} onUpdate={setBatchTrackerUpdateUsers} style={{ marginTop: "5px", marginBottom: "12px" }} allowSelectAll={true} />
                <TextField select size="small"
                    label="Tracker"
                    value={batchTrackerUpdateTo}
                    onChange={(e) => { setBatchTrackerUpdateTo(e.target.value); }}
                    fullWidth
                >
                    <MenuItem value="trucky">Trucky</MenuItem>
                    <MenuItem value="tracksim">TrackSim</MenuItem>
                </TextField>
                {(dialogButtonDisabled || batchTrackerUpdateCurrent !== 0 && batchTrackerUpdateCurrent == batchTrackerUpdateUsers.length) && <>
                    <Typography variant="body2" gutterBottom sx={{ mt: "5px" }}>Completed {batchTrackerUpdateCurrent} / {batchTrackerUpdateUsers.length}</Typography>
                    <LinearProgress variant="determinate" color="info" value={batchTrackerUpdateCurrent / batchTrackerUpdateUsers.length * 100} />
                    <Typography variant="body2" sx={{ color: theme.palette[logSeverity].main }} gutterBottom>{batchTrackerUpdateLog}</Typography>
                </>}
            </DialogContent>
            <DialogActions>
                <Button variant="contained" color="info" onClick={() => { batchUpdateTrackers(); }} disabled={dialogButtonDisabled}>Update</Button>
            </DialogActions>
        </Dialog>
        <Dialog open={dialogOpen === "batch-member-dismiss"} onClose={() => { if (!dialogButtonDisabled) setDialogOpen(""); }}>
            <DialogTitle><FontAwesomeIcon icon={faUsersSlash} />&nbsp;&nbsp;Batch Dismiss Members  <SponsorBadge level={4} /></DialogTitle>
            <DialogContent>
                <Typography variant="body2">- You could dismiss a list of members.</Typography>
                <Typography variant="body2">- By setting the value of "Last Online Before" and clicking "Select", you could select a list of inactive members to dismiss. Note that members whose last online was a long time ago might not be detected.</Typography>
                <Typography variant="body2" sx={{ color: theme.palette.warning.main }}>- When performing the changes, do not close the tab, or the process will stop.</Typography>
                <Typography variant="body2" sx={{ color: theme.palette.warning.main }}>- The dialog cannot be closed once the process starts, you may open a new tab to continue using the Drivers Hub.</Typography>
                <Grid container spacing={2} sx={{ mt: "5px", mb: "5px" }}>
                    <Grid item xs={8}>
                        <DateTimeField size="small"
                            label="Last Online Before"
                            defaultValue={batchDismissLastOnline}
                            onChange={(timestamp) => { setBatchDismissLastOnline(timestamp); }}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={4}>
                        <Button variant="contained" color="info" onClick={() => {
                            if (batchDismissLastOnline === undefined) return;
                            let newList = [];
                            for (let i = 0; i < vars.members.length; i++) {
                                if (vars.members[i].activity !== null && vars.members[i].activity.last_seen < batchDismissLastOnline) {
                                    newList.push(vars.members[i]);
                                }
                            }
                            setBatchDismissUsers(newList);
                        }} disabled={dialogButtonDisabled} fullWidth>Select</Button>
                    </Grid>
                    <Grid item xs={12}>
                        <UserSelect label="Users" users={batchDismissUsers} isMulti={true} onUpdate={setBatchDismissUsers} allowSelectAll={true} />
                    </Grid>
                </Grid>
                {(dialogButtonDisabled || batchDismissCurrent !== 0 && batchDismissCurrent == batchDismissUsers.length) && <>
                    <Typography variant="body2" gutterBottom sx={{ mt: "5px" }}>Completed {batchDismissCurrent} / {batchDismissUsers.length}</Typography>
                    <LinearProgress variant="determinate" color="info" value={batchDismissCurrent / batchDismissUsers.length * 100} />
                    <Typography variant="body2" sx={{ color: theme.palette[logSeverity].main }} gutterBottom>{batchDismissLog}</Typography>
                </>}
            </DialogContent>
            <DialogActions>
                <Button variant="contained" color="error" onClick={() => { batchDismiss(); }} disabled={dialogButtonDisabled}>Dismiss</Button>
            </DialogActions>
        </Dialog>
        <SpeedDial
            ariaLabel="Controls"
            sx={{ position: 'fixed', bottom: 20, right: 20 }}
            icon={<SpeedDialIcon />}
        >
            <SpeedDialAction
                key="batch-member-dismiss"
                icon={<FontAwesomeIcon icon={faUsersSlash} />}
                tooltipTitle="Batch Dismiss Members"
                onClick={() => setDialogOpen("batch-member-dismiss")}
            />
            <SpeedDialAction
                key="batch-tracker-update"
                icon={<FontAwesomeIcon icon={faTruck} />}
                tooltipTitle="Batch Update Tracker"
                onClick={() => setDialogOpen("batch-tracker-update")}
            />
            <SpeedDialAction
                key="batch-role-update"
                icon={<FontAwesomeIcon icon={faIdCard} />}
                tooltipTitle="Batch Update Roles"
                onClick={() => setDialogOpen("batch-role-update")}
            />
            <SpeedDialAction
                key="sync-profile"
                icon={<FontAwesomeIcon icon={faArrowsRotate} />}
                tooltipTitle="Sync Member Profiles"
                onClick={() => setDialogOpen("sync-profile")}
            />
        </SpeedDial>
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
    </>;
};

export default MemberList;