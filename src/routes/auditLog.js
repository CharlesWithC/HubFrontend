import React from 'react';
import { useEffect, useState } from 'react';
import { Tooltip, useTheme } from '@mui/material';

import TimeAgo from '../components/timeago';
import CustomTable from "../components/table";
import { FetchProfile, makeRequestsAuto } from '../functions';
import MarkdownRenderer from '../components/markdown';
import UserCard from '../components/usercard';

var vars = require("../variables");

const puColumns = [
    { id: 'uid', label: 'UID' },
    { id: 'name', label: 'Name' },
    { id: 'discordid', label: 'Discord ID' },
    { id: 'time', label: 'Time'},
    { id: 'operation', label: 'Operation' },
];

const AuditLog = () => {
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
                { url: `${vars.dhpath}/audit/list?order=desc&order_by=uid&page=${myPage}&page_size=${pageSize}`, auth: true },
            ]);

            let newUserList = [];
            for (let i = 0; i < _userList.list.length; i++) {
                let user = _userList.list[i];
                newUserList.push({ uid: user.user.uid, name: user.user.name, discordid: user.user.discordid, time: <TimeAgo timestamp={user.timestamp * 1000}/>, operation: <MarkdownRenderer>{user.operation}</MarkdownRenderer> });
            }

            setUserList(newUserList);
            setTotalItems(_userList.total_items);

            const loadingEnd = new CustomEvent('loadingEnd', {});
            window.dispatchEvent(loadingEnd);
        }
        doLoad();
    }, [page, pageSize, theme]);

    function handleClickPU(data) {
        return;
    }

    return <>
        {userList.length !== 0 &&
            <CustomTable name="Audit Log" columns={puColumns} data={userList} totalItems={totalItems} rowsPerPageOptions={[10, 25, 50, 100, 250]} defaultRowsPerPage={pageSize} onPageChange={setPagePU} onRowsPerPageChange={setPageSizePU} onRowClick={handleClickPU} />
        }
    </>;
};

export default AuditLog;