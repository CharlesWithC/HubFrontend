import { useTranslation } from 'react-i18next';
import React from 'react';
import { useRef, useEffect, useState } from 'react';
import { useTheme } from '@mui/material';

import TimeAgo from '../components/timeago';
import CustomTable from "../components/table";
import { makeRequestsAuto } from '../functions';
import MarkdownRenderer from '../components/markdown';
import UserCard from '../components/usercard';

var vars = require("../variables");

const AuditLog = () => {
    const { t: tr } = useTranslation();

    const columns = [
        { id: 'uid', label: 'UID' },
        { id: 'userid', label: tr("user_id") },
        { id: 'user', label: tr("user") },
        { id: 'discordid', label: tr("discord_id") },
        { id: 'time', label: tr("time") },
        { id: 'operation', label: tr("operation") },
    ];

    const [userList, setUserList] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [page, setPage] = useState(1);
    const pageRef = useRef(1);
    const [pageSize, setPageSize] = useState(vars.userSettings.default_row_per_page);

    const theme = useTheme();

    useEffect(() => {
        pageRef.current = page;
    }, [page]);
    useEffect(() => {
        async function doLoad() {
            window.loading += 1;

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

            window.loading -= 1;
        }
        doLoad();
    }, [page, pageSize, theme]);

    return <>
        {userList.length !== 0 &&
            <CustomTable columns={columns} data={userList} totalItems={totalItems} rowsPerPageOptions={[10, 25, 50, 100, 250]} defaultRowsPerPage={pageSize} onPageChange={setPage} onRowsPerPageChange={setPageSize} />
        }
    </>;
};

export default AuditLog;