import React from 'react';
import { useEffect, useState, useCallback } from 'react';
import { useTheme, Typography, MenuItem, Snackbar, Alert } from '@mui/material';
import { Portal } from '@mui/base';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBan } from '@fortawesome/free-solid-svg-icons';

import TimeAgo from '../components/timeago';
import CustomTable from "../components/table";
import { makeRequestsAuto, getFormattedDate, removeNullValues, customAxios as axios, getAuthToken } from '../functions';
import UserCard from '../components/usercard';

var vars = require("../variables");

const puColumns = [
    { id: 'uid', label: 'UID' },
    { id: 'user', label: 'User' },
    { id: 'discordid', label: 'Discord ID' },
    { id: 'steamid', label: 'Steam ID' },
    { id: 'truckersmpid', label: 'TruckersMP ID' },
    { id: 'joined', label: 'Joined' }
];
const buColumns = [
    { id: 'uid', label: 'UID' },
    { id: 'user', label: 'User' },
    { id: 'email', label: 'Email' },
    { id: 'discordid', label: 'Discord ID' },
    { id: 'steamid', label: 'Steam ID' },
    { id: 'truckersmpid', label: 'TruckersMP ID' },
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
    const [page, setPagePU] = useState(-1);
    const [pageSize, setPageSizePU] = useState(10);

    const [banList, setBanList] = useState([]);
    const [banTotalItems, setBanTotalItems] = useState(0);
    const [banPage, setBanPagePU] = useState(-1);
    const [banPageSize, setBanPageSizePU] = useState(10);

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

    const doLoad = useCallback(async () => {
        const loadingStart = new CustomEvent('loadingStart', {});
        window.dispatchEvent(loadingStart);

        let myPage = page;
        myPage === -1 ? myPage = 1 : myPage += 1;

        let myBanPage = banPage;
        myBanPage === -1 ? myBanPage = 1 : myBanPage += 1;

        const [_userList, _banList] = await makeRequestsAuto([
            { url: `${vars.dhpath}/user/list?order=desc&order_by=uid&page=${myPage}&page_size=${pageSize}`, auth: true },
            { url: `${vars.dhpath}/user/ban/list?order=desc&order_by=uid&page=${myBanPage}&page_size=${banPageSize}`, auth: true },
        ]);

        if (_userList.list !== undefined) {
            let newUserList = [];
            for (let i = 0; i < _userList.list.length; i++) {
                let user = _userList.list[i];
                let banMark = <></>;
                if (user.ban !== null) banMark = <FontAwesomeIcon icon={faBan} style={{ color: theme.palette.error.main }} />;
                newUserList.push({ uid: <Typography variant="body2" sx={{ flexGrow: 1, display: 'flex', alignItems: "center" }}><span>{user.uid}</span>&nbsp;{banMark}</Typography>, user: <UserCard user={user} />, discordid: user.discordid, steamid: <a href={`https://steamcommunity.com/profiles/${user.steamid}`} target="_blank" rel="noreferrer" >{user.steamid}</a>, truckersmpid: <a href={`https://truckersmp.com/user/${user.truckersmpid}`} target="_blank" rel="noreferrer" >{user.truckersmpid}</a>, joined: <TimeAgo timestamp={user.join_timestamp * 1000} /> });
            }
            setUserList(newUserList);
            setTotalItems(_userList.total_items);
        }
        if (_banList.list !== undefined) {
            let newBanList = [];
            for (let i = 0; i < _banList.list.length; i++) {
                let ban = _banList.list[i];
                let expireDT = getFormattedDate(new Date(ban.ban.expire * 1000));
                if (ban.ban.expire >= 4102444800 || ban.ban.expire === null) expireDT = "/";
                newBanList.push({ uid: ban.meta.uid, user: <UserCard user={ban.user} />, email: ban.meta.email, discordid: ban.meta.discordid, steamid: <a href={`https://steamcommunity.com/profiles/${ban.meta.steamid}`} target="_blank" rel="noreferrer" >{ban.meta.steamid}</a>, truckersmpid: <a href={`https://truckersmp.com/user/${ban.meta.truckersmpid}`} target="_blank" rel="noreferrer" >{ban.meta.truckersmpid}</a>, reason: ban.ban.reason, expire: expireDT, contextMenu: <MenuItem onClick={() => { unbanUser(ban.meta); doLoad(); }}>Unban</MenuItem> });
            }
            setBanList(newBanList);
            setBanTotalItems(_banList.total_items);
        }

        const loadingEnd = new CustomEvent('loadingEnd', {});
        window.dispatchEvent(loadingEnd);
    }, [theme, page, pageSize, banPage, banPageSize]);
    useEffect(() => {
        doLoad();
    }, [doLoad]);

    useEffect(() => {
        const handleUpdateEvent = () => {
            doLoad();
        };
        window.addEventListener("updateExternalUserTable", handleUpdateEvent);
        return () => {
            window.removeEventListener("updateExternalUserTable", handleUpdateEvent);
        };
    }, [doLoad]);

    return <>
        {userList.length !== 0 &&
            <>
                <CustomTable name="External Users" columns={puColumns} data={userList} totalItems={totalItems} rowsPerPageOptions={[10, 25, 50, 100, 250]} defaultRowsPerPage={pageSize} onPageChange={setPagePU} onRowsPerPageChange={setPageSizePU} />
                <CustomTable name="Banned Users" columns={buColumns} data={banList} totalItems={banTotalItems} rowsPerPageOptions={[10, 25, 50, 100, 250]} defaultRowsPerPage={banPageSize} onPageChange={setBanPagePU} onRowsPerPageChange={setBanPageSizePU} style={{ marginTop: "15px" }} />
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
            </>
        }
    </>;
};

export default ExternalUsers;