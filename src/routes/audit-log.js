import React from 'react';
import { useRef, useEffect, useState } from 'react';
import { useTheme } from '@mui/material';

import TimeAgo from '../components/timeago';
import CustomTable from "../components/table";
import { makeRequestsAuto } from '../functions';
import MarkdownRenderer from '../components/markdown';
import UserCard from '../components/usercard';

var vars = require("../variables");

const puColumns = [
    { id: 'uid', label: 'UID' },
    { id: 'userid', label: 'User ID' },
    { id: 'user', label: 'User' },
    { id: 'discordid', label: 'Discord ID' },
    { id: 'time', label: 'Time' },
    { id: 'operation', label: 'Operation' },
];

const AuditLog = () => {
    const [userList, setUserList] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [page, setPage] = useState(1);
    const pageRef = useRef(1);
    const [pageSize, setPageSize] = useState(10);

    const theme = useTheme();

    useEffect(() => {
        pageRef.current = page;
    }, [page]);
    useEffect(() => {
        async function doLoad() {
            const loadingStart = new CustomEvent('loadingStart', {});
            window.dispatchEvent(loadingStart);

            const [_userList] = await makeRequestsAuto([
                { url: `${vars.dhpath}/audit/list?order=desc&order_by=uid&page=${page}&page_size=${pageSize}`, auth: true },
            ]);

            let newUserList = [];
            for (let i = 0; i < _userList.list.length; i++) {
                let row = _userList.list[i];
                newUserList.push({ uid: row.user.uid, userid: row.user.userid, user: <UserCard user={row.user} />, discordid: row.user.discordid, time: <TimeAgo key={`${+new Date()}`} timestamp={row.timestamp * 1000} />, operation: <MarkdownRenderer>{row.operation}</MarkdownRenderer> });
            }

            if (pageRef.current === page) {
                setUserList(newUserList);
                setTotalItems(_userList.total_items);
            }

            const loadingEnd = new CustomEvent('loadingEnd', {});
            window.dispatchEvent(loadingEnd);
        }
        doLoad();
    }, [page, pageSize, theme]);

    return <>
        {userList.length !== 0 &&
            <CustomTable columns={puColumns} data={userList} totalItems={totalItems} rowsPerPageOptions={[10, 25, 50, 100, 250]} defaultRowsPerPage={pageSize} onPageChange={setPage} onRowsPerPageChange={setPageSize} />
        }
    </>;
};

export default AuditLog;