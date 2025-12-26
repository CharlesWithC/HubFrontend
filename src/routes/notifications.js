import { useRef, useEffect, useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { AppContext } from '../context';

import { useTheme } from '@mui/material';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';

import TimeDelta from '../components/timedelta';
import CustomTable from "../components/table";
import { makeRequestsAuto } from '../functions';
import MarkdownRenderer from '../components/markdown';

const Notifications = () => {
    const { t: tr } = useTranslation();
    const { apiPath, userSettings } = useContext(AppContext);
    const theme = useTheme();

    const columns = [
        { id: 'content', label: tr("content") },
        { id: 'time', label: tr("time") },
    ];

    const [notiList, setNotiList] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [page, setPage] = useState(1);
    const pageRef = useRef(1);
    const [pageSize, setPageSize] = useState(userSettings.default_row_per_page);

    useEffect(() => {
        pageRef.current = page;
    }, [page]);
    useEffect(() => {
        async function doLoad() {
            window.loading += 1;

            const [_notiList] = await makeRequestsAuto([
                { url: `${apiPath}/user/notification/list?order=desc&order_by=notificationid&page=${page}&page_size=${pageSize}`, auth: true },
            ]);

            let newNotiList = [];
            for (let i = 0; i < _notiList.list.length; i++) {
                let row = _notiList.list[i];
                newNotiList.push({ id: row.notificationid, content: <MarkdownRenderer>{row.content}</MarkdownRenderer>, time: <TimeDelta key={row.notificationid} timestamp={row.timestamp * 1000} /> });
            }

            if (pageRef.current === page) {
                setNotiList(newNotiList);
                setTotalItems(_notiList.total_items);
            }

            window.loading -= 1;
        }
        doLoad();
    }, [apiPath, page, pageSize, theme]);

    return <>
        {notiList.length !== 0 &&
            <CustomTable page={page} name={<><FontAwesomeIcon icon={faBell} />&nbsp;&nbsp;{tr("notifications")}</>} columns={columns} data={notiList} totalItems={totalItems} rowsPerPageOptions={[10, 25, 50, 100, 250]} defaultRowsPerPage= {pageSize} onPageChange={setPage} onRowsPerPageChange={setPageSize} />
        }
    </>;
};

export default Notifications;