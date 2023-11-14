import React from 'react';
import { useRef, useEffect, useState } from 'react';
import { useTheme } from '@mui/material';

import TimeAgo from '../components/timeago';
import CustomTable from "../components/table";
import { makeRequestsAuto } from '../functions';
import MarkdownRenderer from '../components/markdown';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';

var vars = require("../variables");

const columns = [
    { id: 'content', label: 'Content' },
    { id: 'time', label: 'Time' },
];

const Notifications = () => {
    const [notiList, setNotiList] = useState([]);
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

            const [_notiList] = await makeRequestsAuto([
                { url: `${vars.dhpath}/user/notification/list?order=desc&order_by=notificationid&page=${page}&page_size=${pageSize}`, auth: true },
            ]);

            let newNotiList = [];
            for (let i = 0; i < _notiList.list.length; i++) {
                let row = _notiList.list[i];
                newNotiList.push({ id: row.notificationid, content: <MarkdownRenderer>{row.content}</MarkdownRenderer>, time: <TimeAgo key={row.notificationid} timestamp={row.timestamp * 1000} /> });
            }

            if (pageRef.current === page) {
                setNotiList(newNotiList);
                setTotalItems(_notiList.total_items);
            }

            const loadingEnd = new CustomEvent('loadingEnd', {});
            window.dispatchEvent(loadingEnd);
        }
        doLoad();
    }, [page, pageSize, theme]);

    return <>
        {notiList.length !== 0 &&
            <CustomTable name={<><FontAwesomeIcon icon={faBell} />&nbsp;&nbsp;Notifications</>} columns={columns} data={notiList} totalItems={totalItems} rowsPerPageOptions={[10, 25, 50, 100, 250]} defaultRowsPerPage={pageSize} onPageChange={setPage} onRowsPerPageChange={setPageSize} />
        }
    </>;
};

export default Notifications;