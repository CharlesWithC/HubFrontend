import { useRef, useEffect, useState, useCallback, useContext, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppContext, CacheContext } from '../context';

import { Card, CardContent, Typography, Grid, SpeedDial, SpeedDialIcon, SpeedDialAction, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Snackbar, Alert, useTheme, Tooltip } from '@mui/material';
import { PermContactCalendarRounded, LocalShippingRounded, EuroRounded, AttachMoneyRounded, RouteRounded, LocalGasStationRounded, EmojiEventsRounded, PeopleAltRounded, RefreshRounded, VerifiedOutlined } from '@mui/icons-material';
import { Portal } from '@mui/base';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWarehouse, faClock, faGears, faStamp } from '@fortawesome/free-solid-svg-icons';

import UserCard from '../components/usercard';
import TimeAgo from '../components/timeago';
import CustomTable from '../components/table';
import DateTimeField from '../components/datetime';

import { ConvertUnit, TSep, makeRequestsWithAuth, checkUserPerm, checkPerm, customAxios as axios, getAuthToken, removeNUEValues } from '../functions';

const CURRENTY_ICON = { 1: "€", 2: "$" };

const DivisionCard = ({ division }) => {
    const { userSettings } = useContext(AppContext);

    return (<Card>
        <CardContent>
            <div style={{ marginBottom: "10px", display: 'flex', alignItems: "center" }}>
                <Typography variant="h5" sx={{ flexGrow: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        {division.name}
                    </div>
                </Typography>
            </div>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={12} md={6} lg={6}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                        <PermContactCalendarRounded />&nbsp;{TSep(division.drivers)}
                    </Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={6}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocalShippingRounded />&nbsp;{TSep(division.jobs)}
                    </Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={6}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                        <RouteRounded />&nbsp;{ConvertUnit(userSettings.unit, "km", division.distance)}
                    </Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={6}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocalGasStationRounded />&nbsp;{ConvertUnit(userSettings.unit, "l", division.fuel)}
                    </Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={6}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                        <EuroRounded />&nbsp;{TSep(division.profit.euro)}
                    </Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={6}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                        <AttachMoneyRounded />&nbsp;{TSep(division.profit.dollar)}
                    </Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={6}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                        <EmojiEventsRounded />&nbsp;{TSep(division.points)}
                    </Typography>
                </Grid>
            </Grid>
        </CardContent>
    </Card>);
};

const DivisionsMemo = memo(({ doReload, loadComplete, setLoadComplete, listParam }) => {
    const { apiPath } = useContext(AppContext);

    const [divisions, setDivisions] = useState([]);

    useEffect(() => {
        async function doLoad() {
            window.loading += 1;

            let processedParam = removeNUEValues(listParam);

            let urls = [
                `${apiPath}/divisions?${new URLSearchParams(processedParam).toString()}`,
            ];
            let [_divisions] = await makeRequestsWithAuth(urls);
            setDivisions(_divisions);

            setLoadComplete(cnt => cnt + 1);

            window.loading -= 1;
        }
        doLoad();
    }, [apiPath, doReload, listParam]);

    return <>{loadComplete >= 3 && <Grid container spacing={2}>
        {divisions.map((division, index) => (
            <Grid key={`grid-${index}`} item xs={12} sm={12} md={divisions.length % 2 === 0 ? 6 : index === divisions.length - 1 ? 12 : 6} lg={divisions.length % 2 === 0 ? 6 : index === divisions.length - 1 ? 12 : 6}>
                <DivisionCard division={division} />
            </Grid>
        ))}
    </Grid>}</>;
});

const DivisionsDlog = memo(({ doReload, loadComplete, setLoadComplete }) => {
    const { t: tr } = useTranslation();
    const { apiPath, curUserPerm, userSettings } = useContext(AppContext);
    const { cache, setCache } = useContext(CacheContext);
    const theme = useTheme();

    const columns = [
        { id: 'display_logid', label: 'ID' },
        { id: 'driver', label: tr("driver") },
        { id: 'source', label: tr("source") },
        { id: 'destination', label: tr("destination") },
        { id: 'distance', label: tr("distance") },
        { id: 'cargo', label: tr("cargo") },
        { id: 'profit', label: tr("profit") },
        { id: 'time', label: tr("time") },
    ];

    const [dlogList, setDlogList] = useState(cache.division.dlog.dlogList);
    const [page, setPage] = useState(cache.division.dlog.page);
    const pageRef = useRef(cache.division.dlog.page);
    const [pageSize, setPageSize] = useState(cache.division.dlog.pageSize === null ? userSettings.default_row_per_page : cache.division.dlog.pageSize);
    const [totalItems, setTotalItems] = useState(cache.division.dlog.totalItems);
    useEffect(() => {
        pageRef.current = page;
    }, [page]);

    useEffect(() => {
        return () => {
            // Pending may overwrite the data so we need to use the latest data
            setCache(cache => ({ ...cache, division: { ...cache.division, dlog: { dlogList, page, pageSize, totalItems } } }));
        };
    }, [dlogList, page, pageSize, totalItems]);

    useEffect(() => {
        async function doLoad() {
            window.loading += 1;

            const [dlogL] = await makeRequestsWithAuth([`${apiPath}/dlog/list?page=${page}&page_size=${pageSize}&division=only`]);

            let newDlogList = [];
            for (let i = 0; i < dlogL.list.length; i++) {
                let checkmark = <></>;
                if (dlogL.list[i].division !== null && dlogL.list[i].division.status !== 2) {
                    checkmark = <>{checkmark}&nbsp;<Tooltip placement="top" arrow title={dlogL.list[i].division.status === 1 ? tr("validated_division_delivery") : "Pending Division Delivery"}
                        PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, -10] } }] }}>
                        <VerifiedOutlined sx={{ color: dlogL.list[i].division.status === 1 ? theme.palette.info.main : theme.palette.grey[400], fontSize: "1.2em" }} />
                    </Tooltip></>;
                }
                if (dlogL.list[i].challenge.length !== 0) {
                    checkmark = <>{checkmark}&nbsp;<Tooltip placement="top" arrow title={`Challenge Delivery (${dlogL.list[i].challenge.map((challenge) => (`#${challenge.challengeid} ${challenge.name}`)).join(", ")})`}
                        PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, -10] } }] }}>
                        <FontAwesomeIcon icon={faStamp} style={{ color: theme.palette.warning.main, fontSize: "1em" }} />
                    </Tooltip></>;
                }
                let row = dlogL.list[i];
                newDlogList.push({ logid: row.logid, display_logid: <Typography variant="body2" sx={{ flexGrow: 1, display: 'flex', alignItems: "center" }}><span>{row.logid}</span>{checkmark}</Typography>, driver: <UserCard user={row.user} inline={true} />, source: `${row.source_company}, ${row.source_city}`, destination: `${row.destination_company}, ${row.destination_city}`, distance: ConvertUnit(userSettings.unit, "km", row.distance), cargo: `${row.cargo} (${ConvertUnit(userSettings.unit, "kg", row.cargo_mass)})`, profit: `${CURRENTY_ICON[row.unit]}${row.profit}`, time: <TimeAgo key={`${+new Date()}`} timestamp={row.timestamp * 1000} /> });
            }

            if (pageRef.current === page) {
                setDlogList(newDlogList);
                setTotalItems(dlogL.total_items);
            }

            setLoadComplete(cnt => cnt + 1);

            window.loading -= 1;
        }
        doLoad();
    }, [apiPath, page, pageSize, doReload, theme]);

    const navigate = useNavigate();
    function handleClick(data) {
        navigate(`/delivery/${data.logid}`);
    }

    return <>
        {loadComplete >= 3 && <CustomTable page={page} columns={columns} data={dlogList} totalItems={totalItems} rowsPerPageOptions={[10, 25, 50, 100, 250]} defaultRowsPerPage={pageSize} onPageChange={setPage} onRowsPerPageChange={setPageSize} onRowClick={handleClick} style={{ marginTop: "15px" }} pstyle={checkUserPerm(curUserPerm, ["administrator", "manage_divisions"]) ? {} : { marginRight: "60px" }} name={<><FontAwesomeIcon icon={faWarehouse} />&nbsp;&nbsp;{tr("recent_validated_division_deliveries")}</>} sx={{ display: loadComplete >= 3 ? undefined : "hidden" }} />}
    </>;
});

const DivisionsPending = memo(({ doReload, loadComplete, setLoadComplete }) => {
    const { t: tr } = useTranslation();
    const { apiPath, userSettings, divisions, loadDivisions } = useContext(AppContext);
    const { cache, setCache } = useContext(CacheContext);
    const [localDivisions, setLocalDivisions] = useState(divisions);

    const pendingColumns = [
        { id: 'display_logid', label: tr("log_id") },
        { id: 'driver', label: tr("driver") },
        { id: 'division', label: tr("division") },
    ];

    const [snackbarContent, setSnackbarContent] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const handleCloseSnackbar = useCallback(() => {
        setSnackbarContent("");
    }, []);

    const [dlogList, setDlogList] = useState(cache.division.pending.dlogList);
    const [page, setPage] = useState(cache.division.pending.page);
    const pageRef = useRef(cache.division.pending.page);
    const [pageSize, setPageSize] = useState(cache.division.pending.pageSize === null ? userSettings.default_row_per_page : cache.division.pending.pageSize);
    const [totalItems, setTotalItems] = useState(cache.division.pending.totalItems);
    useEffect(() => {
        pageRef.current = page;
    }, [page]);

    useEffect(() => {
        return () => {
            // Dlog may overwrite the data so we need to use the latest data
            setCache(cache => ({ ...cache, division: { ...cache.division, pending: { dlogList, page, pageSize, totalItems } } }));
        };
    }, [dlogList, page, pageSize, totalItems]);

    useEffect(() => {
        async function doLoad() {
            window.loading += 1;

            if (localDivisions === null) {
                setLocalDivisions(await loadDivisions());
                return; // dependency change would trigger reload
            }

            const [dlogL] = await makeRequestsWithAuth([`${apiPath}/divisions/list/pending?page_size=${pageSize}&page=${page}`]);

            if (dlogL.list === undefined) {
                // no access
                return;
            }

            let newDlogList = [];
            for (let i = 0; i < dlogL.list.length; i++) {
                let row = dlogL.list[i];
                newDlogList.push({ logid: row.logid, display_logid: row.logid, driver: <UserCard user={row.user} inline={true} />, division: localDivisions[row.divisionid]?.name ?? tr("unknown"), contextMenu: <><MenuItem onClick={async (e) => { e.stopPropagation(); await handleDVUpdate(row.logid, row.divisionid, 1); doLoad(); }}>{tr("accept")}</MenuItem><MenuItem onClick={async (e) => { e.stopPropagation(); await handleDVUpdate(row.logid, row.divisionid, 2); doLoad(); }}>{tr("decline")}</MenuItem></> });
            }

            if (pageRef.current === page) {
                setDlogList(newDlogList);
                setTotalItems(dlogL.total_items);
            }

            setLoadComplete(cnt => cnt + 1);

            window.loading -= 1;
        }
        doLoad();
    }, [apiPath, page, pageSize, doReload, localDivisions]);
    const handleDVUpdate = useCallback(async (logid, divisionid, status) => {
        window.loading += 1;

        let resp = await axios({ url: `${apiPath}/dlog/${logid}/division/${divisionid}`, data: { status: status }, method: "PATCH", headers: { "Authorization": `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            setSnackbarContent(tr("success"));
            setSnackbarSeverity("success");
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }

        window.loading -= 1;
    }, [apiPath]);

    const navigate = useNavigate();
    function handleClick(data) {
        navigate(`/delivery/${data.logid}`);
    }

    return <>
        {loadComplete >= 3 && <CustomTable page={page} columns={pendingColumns} data={dlogList} totalItems={totalItems} rowsPerPageOptions={[10, 25, 50, 100, 250]} defaultRowsPerPage={pageSize} onPageChange={setPage} onRowsPerPageChange={setPageSize} onRowClick={handleClick} style={{ marginTop: "15px" }} pstyle={{ marginRight: "60px" }} name={<><FontAwesomeIcon icon={faClock} />&nbsp;&nbsp;{tr("pending_division_validation_requests")}</>} sx={{ display: loadComplete >= 3 ? undefined : "hidden" }} />}
        <Portal>
            <Snackbar
                open={!!snackbarContent}
                autoHideDuration={5000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
                    {snackbarContent}
                </Alert>
            </Snackbar>
        </Portal>
    </>;
});

const DivisionManagers = memo(() => {
    const { allPerms, users, memberUIDs } = useContext(AppContext);
    const allMembers = memberUIDs.map((uid) => users[uid]);

    let managers = [];
    for (let i = 0; i < allMembers.length; i++) {
        if (checkPerm(allMembers[i].roles, ["administrator", "manage_divisions"], allPerms)) {
            managers.push(allMembers[i]);
        }
    }

    return <>{
        managers.map((user) => (
            <UserCard user={user} useChip={true} inline={true} />
        ))
    }</>;
});

const Divisions = () => {
    const { t: tr } = useTranslation();
    const { curUser, curUserPerm } = useContext(AppContext);
    const { cache, setCache } = useContext(CacheContext);

    const [doReload, setDoReload] = useState(0);
    const [dialogManagers, setDialogManagers] = useState(false);
    const [dialogOpen, setDialogOpen] = useState("");

    const [tempListParam, setTempListParam] = useState(cache.division.listParam);
    const [listParam, setListParam] = useState(cache.division.listParam);

    useEffect(() => {
        return () => {
            setCache(cache => ({ ...cache, division: { ...cache.division, listParam } }));
        };
    }, [listParam]);

    const [loadComplete, setLoadComplete] = useState(+!checkUserPerm(curUserPerm, ["administrator", "manage_divisions"])); // increment

    return <>
        <DivisionsMemo doReload={doReload} loadComplete={loadComplete} setLoadComplete={setLoadComplete} listParam={listParam} />
        <DivisionsDlog doReload={doReload} loadComplete={loadComplete} setLoadComplete={setLoadComplete} />
        {checkUserPerm(curUserPerm, ["administrator", "manage_divisions"]) && <DivisionsPending doReload={doReload} loadComplete={loadComplete} setLoadComplete={setLoadComplete} />}
        <Dialog open={dialogManagers} onClose={() => setDialogManagers(false)}>
            <DialogTitle>{tr("division_managers")}</DialogTitle>
            <DialogContent>
                <DivisionManagers />
            </DialogContent>
            <DialogActions>
                <Button variant="primary" onClick={() => { setDialogManagers(false); }}>{tr("close")}</Button>
            </DialogActions>
        </Dialog>
        <Dialog open={dialogOpen === "settings"} onClose={() => { setDialogOpen(""); }} fullWidth>
            <DialogTitle><FontAwesomeIcon icon={faGears} />&nbsp;&nbsp;{tr("settings")}</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mt: "5px" }}>
                    <Grid item xs={6}>
                        <DateTimeField
                            label={tr("after")}
                            defaultValue={tempListParam.after}
                            onChange={(timestamp) => { setTempListParam({ ...tempListParam, after: timestamp }); }}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <DateTimeField
                            label={tr("before")}
                            defaultValue={tempListParam.before}
                            onChange={(timestamp) => { setTempListParam({ ...tempListParam, before: timestamp }); }}
                            fullWidth
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" onClick={() => { setListParam(tempListParam); }}>{tr("update")}</Button>
            </DialogActions>
        </Dialog>
        <SpeedDial
            ariaLabel={tr("controls")}
            sx={{ position: 'fixed', bottom: 20, right: 20 }}
            icon={<SpeedDialIcon />}
        >
            <SpeedDialAction
                key="settings"
                tooltipTitle={tr("settings")}
                icon={<FontAwesomeIcon icon={faGears} />}
                onClick={() => { setDialogOpen("settings"); }} />
            {curUser.userid !== -1 && <SpeedDialAction
                key="managers"
                icon={<PeopleAltRounded />}
                tooltipTitle={tr("managers")}
                onClick={() => setDialogManagers(true)}
            />}
            <SpeedDialAction
                key="refresh"
                icon={<RefreshRounded />}
                tooltipTitle={tr("refresh")}
                onClick={() => setDoReload(+new Date())}
            />
        </SpeedDial>
    </>;
};

export default Divisions;