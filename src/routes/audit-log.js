import { useRef, useEffect, useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import { AppContext, CacheContext } from "../context";

import { useTheme } from "@mui/material";
import { VerifiedUserRounded } from "@mui/icons-material";

import TimeDelta from "../components/timedelta";
import CustomTable from "../components/table";
import { makeRequestsAuto } from "../functions";
import MarkdownRenderer from "../components/markdown";
import UserCard from "../components/usercard";

const AuditLog = () => {
    const { t: tr } = useTranslation();
    const { apiPath, userSettings } = useContext(AppContext);
    const { cache, setCache } = useContext(CacheContext);
    const theme = useTheme();

    const CATEGORIES = { announcement: tr("announcement"), application: tr("application"), auth: tr("authentication"), challenge: tr("challenge"), division: tr("division"), dlog: tr("deliveries"), downloads: tr("downloads"), economy: tr("economy"), event: tr("event"), member: tr("member"), poll: tr("poll"), system: tr("system"), tracker: tr("tracker"), user: tr("user"), legacy: tr("legacy") };

    const [auditList, setAuditList] = useState(cache.audit_log.auditList);
    const [totalItems, setTotalItems] = useState(cache.audit_log.totalItems);
    const [searchOp, setSearchOp] = useState("");
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

            let uid = -1;
            let localSearchOp = searchOp;
            if (localSearchOp.indexOf("uid:") !== -1) {
                let params = localSearchOp.split(" ");
                for (let i = 0; i < params.length; i++) {
                    if (params[i].indexOf("uid:") !== -1) {
                        uid = params[i].split(":")[1];
                        localSearchOp = localSearchOp.replace(params[i], "").trim();
                        break;
                    }
                }
            }

            const [_auditList] = await makeRequestsAuto([{ url: `${apiPath}/audit/list?order=desc&order_by=uid&page=${page}&page_size=${pageSize}&operation=${localSearchOp}${uid !== -1 ? `&uid=${uid}` : ``}`, auth: true }]);

            let newUserList = [];
            for (let i = 0; i < _auditList.list.length; i++) {
                let row = _auditList.list[i];
                newUserList.push({ user: <UserCard user={row.user} />, time: <TimeDelta key={`${+new Date()}`} timestamp={row.timestamp * 1000} />, category: CATEGORIES[row.category], operation: <MarkdownRenderer>{row.operation}</MarkdownRenderer> });
            }

            if (pageRef.current === page) {
                setAuditList(newUserList);
                setTotalItems(_auditList.total_items);
            }

            window.loading -= 1;
        }
        doLoad();
    }, [apiPath, page, pageSize, searchOp, theme]);

    return (
        <>
            <CustomTable
                name={
                    <>
                        <VerifiedUserRounded />
                        &nbsp;&nbsp;{tr("audit_log")}
                    </>
                }
                onSearch={content => {
                    setPage(1);
                    setSearchOp(content);
                }}
                searchHint={tr("search_by_operation")}
                columns={[
                    { id: "user", label: tr("user") },
                    { id: "category", label: tr("category") },
                    { id: "operation", label: tr("operation") },
                    { id: "time", label: tr("time") },
                ]}
                data={auditList}
                totalItems={totalItems}
                rowsPerPageOptions={[10, 25, 50, 100, 250]}
                page={page}
                defaultRowsPerPage={pageSize}
                onPageChange={setPage}
                onRowsPerPageChange={setPageSize}
            />
        </>
    );
};

export default AuditLog;
