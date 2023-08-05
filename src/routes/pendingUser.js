import React from 'react';
import { useEffect, useState } from 'react';
import { Tooltip, useTheme } from '@mui/material';

import TimeAgo from '../components/timeago';
import CustomTable from "../components/table";
import { makeRequestsAuto } from '../functions';

var vars = require("../variables");

const puColumns = [
    { id: 'uid', label: 'UID' },
    { id: 'name', label: 'Name' },
    { id: 'discordid', label: 'Discord ID' },
    { id: 'steamid', label: 'Steam ID' },
    { id: 'truckersmpid', label: 'TruckersMP ID' },
    { id: 'joined', label: 'Joined' },
    { id: 'manage', label: 'Manage' }
];

const PendingUser = () => {
    const [userList, setUserList] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [page, setPagePU] = useState(-1);
    const [pageSize, setPageSizePU] = useState(10);

    const theme = useTheme();

    useEffect(() => {
        async function doLoad() {
            const loadingStart = new CustomEvent('loadingStart', {});
            window.dispatchEvent(loadingStart);

            let myPage = page;
            if (myPage === -1) {
                myPage = 1;
            } else {
                myPage += 1;
            }

            const [_userList] = await makeRequestsAuto([
                { url: `${vars.dhpath}/user/list?order=desc&order_by=uid&page=${myPage}&page_size=${pageSize}`, auth: true },
            ]);

            let newUserList = [];
            for (let i = 0; i < _userList.list.length; i++) {
                let user = _userList.list[i];
                newUserList.push({ uid: user.uid, name: user.name, discordid: user.discordid, steamid: <a href={`https://steamcommunity.com/profiles/${user.steamid}`} target="_blank" rel="noreferrer" >{user.steamid}</a>, truckersmpid: <a href={`https://truckersmp.com/user/${user.truckersmpid}`} target="_blank" rel="noreferrer" >{user.truckersmpid}</a>, joined: <TimeAgo timestamp={user.join_timestamp * 1000} />, manage: 'Under Development' });
            }

            // Manage should be a dropdown like Fv2
            // Move "Sync to Discord Profile" to "Edit Custom Profile", and add the function to sync to Steam/TruckersMP

            setUserList(newUserList);
            setTotalItems(_userList.total_items);

            const loadingEnd = new CustomEvent('loadingEnd', {});
            window.dispatchEvent(loadingEnd);
        }
        doLoad();
    }, [page, pageSize, theme]);

    function handleClickPU(data) {
        // Popup showing user info
    }

    return <>
        {userList.length !== 0 &&
            <CustomTable name="Pending Users" columns={puColumns} data={userList} totalItems={totalItems} rowsPerPageOptions={[10, 25, 50, 100, 250]} defaultRowsPerPage={pageSize} onPageChange={setPagePU} onRowsPerPageChange={setPageSizePU} onRowClick={handleClickPU} />
        }
    </>;
};

export default PendingUser;