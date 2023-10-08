import React from 'react';
import { useEffect, useState, useCallback } from 'react';
import { useTheme, Typography } from '@mui/material';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserGroup } from '@fortawesome/free-solid-svg-icons';

import TimeAgo from '../components/timeago';
import CustomTable from "../components/table";
import { makeRequestsAuto } from '../functions';
import UserCard from '../components/usercard';

var vars = require("../variables");

const columns = [
    { id: 'userid', label: 'User ID' },
    { id: 'user', label: 'User' },
    { id: 'discordid', label: 'Discord ID' },
    { id: 'steamid', label: 'Steam ID' },
    { id: 'truckersmpid', label: 'TruckersMP ID' },
    { id: 'joined', label: 'Joined' },
    { id: 'last_seen', label: 'Last Seen' }
];

const MemberList = () => {
    const theme = useTheme();

    const [userList, setUserList] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [page, setPage] = useState(-1);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState("");

    const doLoad = useCallback(async () => {
        const loadingStart = new CustomEvent('loadingStart', {});
        window.dispatchEvent(loadingStart);

        let myPage = page;
        myPage === -1 ? myPage = 1 : myPage += 1;

        let [_userList] = [{}];
        if (search === "")
            [_userList] = await makeRequestsAuto([
                { url: `${vars.dhpath}/member/list?order=desc&order_by=userid&page=${myPage}&page_size=${pageSize}`, auth: true },
            ]);
        else if (isNaN(search) || !isNaN(search) && (search.length < 17 || search.length > 19)) // not discord id
            [_userList] = await makeRequestsAuto([
                { url: `${vars.dhpath}/member/list?query=${search}&order=desc&order_by=userid&page=${myPage}&page_size=${pageSize}`, auth: true },
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
            setUserList(newUserList);
            setTotalItems(_userList.total_items);
        }

        const loadingEnd = new CustomEvent('loadingEnd', {});
        window.dispatchEvent(loadingEnd);
    }, [theme, page, pageSize, search]);
    useEffect(() => {
        doLoad();
    }, [doLoad]);

    return <>
        <CustomTable name={<><FontAwesomeIcon icon={faUserGroup} />&nbsp;&nbsp;Members</>} titlePosition="top" columns={columns} data={userList} totalItems={totalItems} rowsPerPageOptions={[10, 25, 50, 100, 250]} defaultRowsPerPage={pageSize} onPageChange={setPage} onRowsPerPageChange={setPageSize} onSearch={(content) => { setPage(-1); setSearch(content); }} searchHint="Search by username or discord id" />
    </>;
};

export default MemberList;