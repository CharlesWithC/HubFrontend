import React from 'react';
import { useEffect, useState } from 'react';
import { useTheme } from '@mui/material';

import TimeAgo from '../components/timeago';
import CustomTable from "../components/table";
import { makeRequestsAuto, getFormattedDate } from '../functions';
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
    { id: 'email', label: 'Email' },
    { id: 'discordid', label: 'Discord ID' },
    { id: 'steamid', label: 'Steam ID' },
    { id: 'truckersmpid', label: 'TruckersMP ID' },
    { id: 'reason', label: 'Ban Reason' },
    { id: 'expire', label: 'Expire' }
];

const ExternalUsers = () => {
    const [userList, setUserList] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [page, setPagePU] = useState(-1);
    const [pageSize, setPageSizePU] = useState(10);

    const [banList, setBanList] = useState([]);
    const [banTotalItems, setBanTotalItems] = useState(0);
    const [banPage, setBanPagePU] = useState(-1);
    const [banPageSize, setBanPageSizePU] = useState(10);

    const theme = useTheme();

    useEffect(() => {
        async function doLoad() {
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

            let newUserList = [];
            for (let i = 0; i < _userList.list.length; i++) {
                let user = _userList.list[i];
                newUserList.push({ uid: user.uid, user: <UserCard user={user} />, discordid: user.discordid, steamid: <a href={`https://steamcommunity.com/profiles/${user.steamid}`} target="_blank" rel="noreferrer" >{user.steamid}</a>, truckersmpid: <a href={`https://truckersmp.com/user/${user.truckersmpid}`} target="_blank" rel="noreferrer" >{user.truckersmpid}</a>, joined: <TimeAgo timestamp={user.join_timestamp * 1000} /> });
            }
            let newBanList = [];
            for (let i = 0; i < _banList.list.length; i++) {
                let ban = _banList.list[i];
                let expireDT = getFormattedDate(new Date(ban.ban.expire * 1000));
                if(ban.ban.expire >= 4102444800 || ban.ban.expire === null) expireDT = "/";
                newBanList.push({ uid: ban.meta.uid, email: ban.meta.email, discordid: ban.meta.discordid, steamid: <a href={`https://steamcommunity.com/profiles/${ban.meta.steamid}`} target="_blank" rel="noreferrer" >{ban.meta.steamid}</a>, truckersmpid: <a href={`https://truckersmp.com/user/${ban.meta.truckersmpid}`} target="_blank" rel="noreferrer" >{ban.meta.truckersmpid}</a>, reason: ban.ban.reason, expire: expireDT });
            }

            // PU Manage should be a right-click dropdown like Fv2
            // Move "Sync to Discord Profile" to "Edit Custom Profile", and add the function to sync to Steam/TruckersMP

            // Ban right-click should be a dropdown of unban button

            setUserList(newUserList);
            setTotalItems(_userList.total_items);
            setBanList(newBanList);
            setBanTotalItems(_banList.total_items);

            const loadingEnd = new CustomEvent('loadingEnd', {});
            window.dispatchEvent(loadingEnd);
        }
        doLoad();
    }, [page, pageSize, banPage, banPageSize, theme]);

    function handleClickPU(data) {
        // Popup showing user info
    }
    function handleClickBU(data) { }

    return <>
        {userList.length !== 0 &&
            <>
                <CustomTable name="External Users" columns={puColumns} data={userList} totalItems={totalItems} rowsPerPageOptions={[10, 25, 50, 100, 250]} defaultRowsPerPage={pageSize} onPageChange={setPagePU} onRowsPerPageChange={setPageSizePU} onRowClick={handleClickPU} />
                <CustomTable name="Banned Users" columns={buColumns} data={banList} totalItems={banTotalItems} rowsPerPageOptions={[10, 25, 50, 100, 250]} defaultRowsPerPage={banPageSize} onPageChange={setBanPagePU} onRowsPerPageChange={setBanPageSizePU} onRowClick={handleClickBU} style={{ marginTop: "15px" }}  />
            </>
        }
    </>;
};

export default ExternalUsers;