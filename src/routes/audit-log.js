import { useRef, useEffect, useState, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AppContext, CacheContext } from '../context';

import { useTheme } from '@mui/material';

import TimeAgo from '../components/timeago';
import CustomTable from "../components/table";
import { makeRequestsAuto } from '../functions';
import MarkdownRenderer from '../components/markdown';
import UserCard from '../components/usercard';

const AuditLog = () => {
    const { t: tr } = useTranslation();
    const { apiPath, userSettings } = useContext(AppContext);
    const { cache, setCache } = useContext(CacheContext);
    const theme = useTheme();

    const [auditList, setAuditList] = useState(cache.audit_log.auditList);
    const [totalItems, setTotalItems] = useState(cache.audit_log.totalItems);
    const [page, setPage] = useState(cache.audit_log.page);
    const pageRef = useRef(cache.audit_log.page);
    const [pageSize, setPageSize] = useState(cache.audit_log.pageSize === null ? userSettings.default_row_per_page : cache.audit_log.pageSize);
    useEffect(() => {
        pageRef.current = page;
    }, [page]);

    useEffect(() => {
        return () => {
            setCache({ ...cache, audit_log: { auditList, totalItems, page, pageSize } });
        };
    }, [auditList, totalItems, page, pageSize]);


    useEffect(() => {
        async function doLoad() {
            window.loading += 1;

            const [_auditList] = await makeRequestsAuto([
                { url: `${apiPath}/audit/list?order=desc&order_by=uid&page=${page}&page_size=${pageSize}`, auth: true },
            ]);

            let newUserList = [];
            for (let i = 0; i < _auditList.list.length; i++) {
                let row = _auditList.list[i];
                newUserList.push({ uid: row.user.uid, userid: row.user.userid, user: <UserCard user={row.user} />, discordid: row.user.discordid, time: <TimeAgo key={`${+new Date()}`} timestamp={row.timestamp * 1000} />, operation: <MarkdownRenderer>{row.operation}</MarkdownRenderer> });
            }

            if (pageRef.current === page) {
                setAuditList(newUserList);
                setTotalItems(_auditList.total_items);
            }

            window.loading -= 1;
        }
        doLoad();
    }, [apiPath, page, pageSize, theme]);

    return <>
        {auditList.length !== 0 &&
            <CustomTable columns={[
                { id: 'uid', label: 'UID' },
                { id: 'userid', label: tr("user_id") },
                { id: 'user', label: tr("user") },
                { id: 'discordid', label: tr("discord_id") },
                { id: 'time', label: tr("time") },
                { id: 'operation', label: tr("operation") },
            ]} data={auditList} totalItems={totalItems} rowsPerPageOptions={[10, 25, 50, 100, 250]} defaultRowsPerPage={pageSize} onPageChange={setPage} onRowsPerPageChange={setPageSize} />
        }
    </>;
};

export default AuditLog;