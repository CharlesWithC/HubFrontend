import React from 'react';
import { useRef, useEffect, useState, useCallback } from 'react';
import { useTheme, Dialog, DialogTitle, DialogContent, DialogActions, LinearProgress, Typography, Button, SpeedDial, SpeedDialAction, SpeedDialIcon, MenuItem, TextField, Chip } from '@mui/material';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsRotate, faIdCard, faUserGroup } from '@fortawesome/free-solid-svg-icons';

import TimeAgo from '../components/timeago';
import CustomTable from "../components/table";
import { makeRequestsAuto, customAxios as axios, getAuthToken, removeNUEValues } from '../functions';
import UserCard from '../components/usercard';
import UserSelect from '../components/userselect';
import RoleSelect from '../components/roleselect';

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
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState("");
    const searchRef = useRef("");
    const [listParam, setListParam] = useState({ order_by: "userid", order: "asc" });

    const [dialogOpen, setDialogOpen] = useState("");
    const [dialogButtonDisabled, setDialogButtonDisabled] = useState(false);

    const sleep = ms => new Promise(
        resolve => setTimeout(resolve, ms)
    );

    const [logSeverity, setLogSeverity] = useState("success");

    const [syncProfileLog, setSyncProfileLog] = useState("");
    const [syncProfileCurrent, setSyncProfileCurrent] = useState(0);
    const syncProfile = useCallback(async () => {
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
                        setBatchRoleUpdateLog(`Failed to update ${vars.members[i].name}'s roles: ${resp.data.error}`);
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
                            setBatchRoleUpdateLog(`Failed to update ${vars.members[i].name}'s roles: ${resp.data.error}`);
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
                        setBatchRoleUpdateLog(`Failed to fetch ${vars.members[i].name}'s current roles: ${resp.data.error}`);
                        setLogSeverity("error");
                        setBatchRoleUpdateCurrent(i + 1);
                    }
                }
                let ed = +new Date();
                if (ed - st < 1000) await sleep(1000 - (ed - st));
            }
        }
        setDialogButtonDisabled(false);
    }, [batchRoleUpdateUsers, batchRoleUpdateRoles, batchRoleUpdateMode]);

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
                    <LinearProgress variant="determinate" value={syncProfileCurrent / vars.members.list} />
                    <Typography variant="body2" sx={{ color: theme.palette[logSeverity].main }} gutterBottom>{syncProfileLog}</Typography>
                </>}
            </DialogContent>
            <DialogActions>
                <Button variant="contained" color="info" onClick={() => { syncProfile(); }} disabled={dialogButtonDisabled}>Sync</Button>
            </DialogActions>
        </Dialog>
        <Dialog open={dialogOpen === "batch-role-update"} onClose={() => { if (!dialogButtonDisabled) setDialogOpen(""); }}>
            <DialogTitle><FontAwesomeIcon icon={faIdCard} />&nbsp;&nbsp;Batch Role Update  <Chip sx={{ bgcolor: "#387aff", height: "20px", borderRadius: "5px", marginTop: "-3px" }} label="Experimental" /></DialogTitle>
            <DialogContent>
                <Typography variant="body2" sx={{ color: theme.palette.info.main }}>- This is an experimental function and it may break.</Typography>
                <Typography variant="body2">- You may add / remove / overwrite roles for a list of members.</Typography>
                <Typography variant="body2" sx={{ color: theme.palette.warning.main }}>- When performing the changes, do not close the tab, or the process will stop.</Typography>
                <Typography variant="body2" sx={{ color: theme.palette.warning.main }}>- The dialog cannot be closed once the process starts, you may open a new tab to continue using the Drivers Hub.</Typography>
                <UserSelect label="Users" initialUsers={batchRoleUpdateUsers} isMulti={true} onUpdate={setBatchRoleUpdateUsers} style={{ marginTop: "5px", marginBottom: "5px" }} />
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
                {dialogButtonDisabled && <>
                    <Typography variant="body2" gutterBottom  sx={{ mt: "5px" }}>Completed {batchRoleUpdateCurrent} / {batchRoleUpdateUsers.length}</Typography>
                    <LinearProgress variant="determinate" value={batchRoleUpdateCurrent / batchRoleUpdateUsers.length} />
                    <Typography variant="body2" sx={{ color: theme.palette[logSeverity].main }} gutterBottom>{batchRoleUpdateLog}</Typography>
                </>}
            </DialogContent>
            <DialogActions>
                <Button variant="contained" color="info" onClick={() => { batchUpdateRoles(); }} disabled={dialogButtonDisabled}>Update</Button>
            </DialogActions>
        </Dialog>
        <SpeedDial
            ariaLabel="Controls"
            sx={{ position: 'fixed', bottom: 20, right: 20 }}
            icon={<SpeedDialIcon />}
        >
            <SpeedDialAction
                key="batch-role-update"
                icon={<FontAwesomeIcon icon={faIdCard} />}
                tooltipTitle="Batch Role Update"
                onClick={() => setDialogOpen("batch-role-update")}
            />
            <SpeedDialAction
                key="sync-profile"
                icon={<FontAwesomeIcon icon={faArrowsRotate} />}
                tooltipTitle="Sync Profiles"
                onClick={() => setDialogOpen("sync-profile")}
            />
        </SpeedDial>
    </>;
};

export default MemberList;