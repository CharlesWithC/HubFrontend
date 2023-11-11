import React from 'react';
import { useEffect, useState, useCallback } from 'react';
import { useTheme, Typography, MenuItem, Snackbar, Alert } from '@mui/material';
import { Portal } from '@mui/base';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faBan } from '@fortawesome/free-solid-svg-icons';

import TimeAgo from '../components/timeago';
import CustomTable from "../components/table";
import { makeRequestsAuto, getFormattedDate, removeNullValues, customAxios as axios, getAuthToken, removeNUEValues } from '../functions';
import UserCard from '../components/usercard';

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

    const [userList, setUserList] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [page, setPage] = useState(-1);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState("");
    const [listParam, setListParam] = useState({ order_by: "uid", order: "desc" });

    const [banList, setBanList] = useState([]);
    const [banTotalItems, setBanTotalItems] = useState(0);
    const [banPage, setBanPage] = useState(-1);
    const [banPageSize, setBanPageSize] = useState(10);
    const [banSearch, setBanSearch] = useState("");
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

    const doLoadUser = useCallback(async () => {
        const loadingStart = new CustomEvent('loadingStart', {});
        window.dispatchEvent(loadingStart);

        let myPage = page;
        myPage === -1 ? myPage = 1 : myPage += 1;

        let processedParam = removeNUEValues(listParam);

        let [_userList] = [{}];
        if (search === "")
            [_userList] = await makeRequestsAuto([
                { url: `${vars.dhpath}/user/list?order=desc&order_by=uid&page=${myPage}&page_size=${pageSize}&${new URLSearchParams(processedParam).toString()}`, auth: true },
            ]);
        else if (isNaN(search) || !isNaN(search) && (search.length < 17 || search.length > 19)) // not discord id
            [_userList] = await makeRequestsAuto([
                { url: `${vars.dhpath}/user/list?name=${search}&order=desc&order_by=uid&page=${myPage}&page_size=${pageSize}&${new URLSearchParams(processedParam).toString()}`, auth: true },
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
            setUserList(newUserList);
            setTotalItems(_userList.total_items);
        }

        const loadingEnd = new CustomEvent('loadingEnd', {});
        window.dispatchEvent(loadingEnd);
    }, [theme, page, pageSize, search, listParam]);
    const doLoadBan = useCallback(async () => {
        const loadingStart = new CustomEvent('loadingStart', {});
        window.dispatchEvent(loadingStart);

        let myBanPage = banPage;
        myBanPage === -1 ? myBanPage = 1 : myBanPage += 1;

        let processedParam = removeNUEValues(banListParam);

        let [_banList] = [{}];
        if (banSearch === "")
            [_banList] = await makeRequestsAuto([
                { url: `${vars.dhpath}/user/ban/list?order=desc&order_by=uid&page=${myBanPage}&page_size=${banPageSize}&${new URLSearchParams(processedParam).toString()}`, auth: true },
            ]);
        else if (isNaN(banSearch) || !isNaN(banSearch) && (banSearch.length < 17 || banSearch.length > 19)) // not discord id
            [_banList] = await makeRequestsAuto([
                { url: `${vars.dhpath}/user/ban/list?name=${banSearch}&order=desc&order_by=uid&page=${myBanPage}&page_size=${banPageSize}&${new URLSearchParams(processedParam).toString()}`, auth: true },
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
            setBanList(newBanList);
            setBanTotalItems(_banList.total_items);
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
        <CustomTable name={<><FontAwesomeIcon icon={faUserPlus} />&nbsp;&nbsp;External Users</>} order={listParam.order} orderBy={listParam.order_by} onOrderingUpdate={(order_by, order) => { setListParam({ ...listParam, order_by: order_by, order: order }); }} titlePosition="top" columns={puColumns} data={userList} totalItems={totalItems} rowsPerPageOptions={[10, 25, 50, 100, 250]} defaultRowsPerPage={pageSize} onPageChange={setPage} onRowsPerPageChange={setPageSize} onSearch={(content) => { setPage(-1); setSearch(content); }} searchHint="Search by username or discord id" />
        <CustomTable name={<><FontAwesomeIcon icon={faBan} />&nbsp;&nbsp;Banned Users</>} order={banListParam.order} orderBy={banListParam.order_by} onOrderingUpdate={(order_by, order) => { setBanListParam({ ...banListParam, order_by: order_by, order: order }); }} titlePosition="top" columns={buColumns} data={banList} totalItems={banTotalItems} rowsPerPageOptions={[10, 25, 50, 100, 250]} defaultRowsPerPage={banPageSize} onPageChange={setBanPage} onRowsPerPageChange={setBanPageSize} style={{ marginTop: "15px" }} onSearch={(content) => { setBanPage(-1); setBanSearch(content); }} searchHint="Search by username or discord id" />
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

export default ExternalUsers;