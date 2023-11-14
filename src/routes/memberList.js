import React from 'react';
import { useRef, useEffect, useState, useCallback } from 'react';
import { useTheme, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, LinearProgress, Typography, Button } from '@mui/material';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsRotate, faUserGroup } from '@fortawesome/free-solid-svg-icons';

import TimeAgo from '../components/timeago';
import CustomTable from "../components/table";
import { makeRequestsAuto, customAxios as axios, getAuthToken, removeNUEValues } from '../functions';
import UserCard from '../components/usercard';

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

    const inited = useRef(false);
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

    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const [syncProfileLog, setSyncProfileLog] = useState("");
    const [syncProfileCurrent, setSyncProfileCurrent] = useState(0);
    const syncProfile = useCallback(async () => {
        setDialogButtonDisabled(true);
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
                setSnackbarSeverity("success");
                setSyncProfileCurrent(i + 1);
            } else {
                if (resp.data.retry_after !== undefined) {
                    setSyncProfileLog(`We are being rate limited by Drivers Hub API. We will continue after ${resp.data.retry_after} seconds...`);
                    setSnackbarSeverity("warning");
                    await sleep((resp.data.retry_after + 1) * 1000);
                    i -= 1;
                } else {
                    setSyncProfileLog(`Failed to sync ${vars.members[i].name}'s profile: ${resp.data.error}`);
                    setSnackbarSeverity("error");
                }
            }
            let ed = +new Date();
            if (ed - st < 4000) await sleep(4000 - (ed - st));
        }
        setDialogButtonDisabled(false);
    }, []);

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
        <CustomTable name={<><FontAwesomeIcon icon={faUserGroup} />&nbsp;&nbsp;Members&nbsp;&nbsp;<IconButton onClick={() => { setDialogOpen("sync-profile"); }}><FontAwesomeIcon icon={faArrowsRotate} /></IconButton></>} order={listParam.order} orderBy={listParam.order_by} onOrderingUpdate={(order_by, order) => { setListParam({ ...listParam, order_by: order_by, order: order }); }} titlePosition="top" columns={columns} data={userList} totalItems={totalItems} rowsPerPageOptions={[10, 25, 50, 100, 250]} defaultRowsPerPage={pageSize} onPageChange={setPage} onRowsPerPageChange={setPageSize} onSearch={(content) => { setPage(1); setSearch(content); }} searchHint="Search by username or discord id" />
        <Dialog open={dialogOpen === "sync-profile"} onClose={() => { if (!dialogButtonDisabled) setDialogOpen(""); }}>
            <DialogTitle><FontAwesomeIcon icon={faArrowsRotate} />&nbsp;&nbsp;Sync Profiles</DialogTitle>
            <DialogContent>
                <Typography variant="body2">- The profiles of all users will be updated to to the current one in Discord, Steam or TruckersMP.</Typography>
                <Typography variant="body2">- This function is mainly used to sync outdated profile. Custom profiles will not be synced.</Typography>
                <Typography variant="body2">- When importing syncing profiles, do not close the tab, or the process will stop.</Typography>
                <br />
                <Typography variant="body2" gutterBottom>Completed {syncProfileCurrent} / {vars.members.length}</Typography>
                <LinearProgress variant="determinate" value={syncProfileCurrent / vars.members.list} />
                <Typography variant="body2" sx={{ color: theme.palette[snackbarSeverity].main }} gutterBottom>{syncProfileLog}</Typography>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" color="info" onClick={() => { syncProfile(); }} disabled={dialogButtonDisabled}>Sync</Button>
            </DialogActions>
        </Dialog>
    </>;
};

export default MemberList;