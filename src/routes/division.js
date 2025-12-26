import { useRef, useEffect, useState, useCallback, useContext, memo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppContext, CacheContext } from '../context';
import { debounce } from 'lodash';

import { Card, CardContent, Typography, Grid, SpeedDial, SpeedDialIcon, SpeedDialAction, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Snackbar, Alert, useTheme, Tooltip, IconButton, TextField } from '@mui/material';
import { PermContactCalendarRounded, LocalShippingRounded, EuroRounded, AttachMoneyRounded, RouteRounded, LocalGasStationRounded, EmojiEventsRounded, PeopleAltRounded, RefreshRounded, VerifiedOutlined, AspectRatioRounded } from '@mui/icons-material';
import Portal from '@mui/material/Portal';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWarehouse, faClock, faGears, faStamp } from '@fortawesome/free-solid-svg-icons';

import UserCard from '../components/usercard';
import TimeDelta from '../components/timedelta';
import CustomTable from '../components/table';
import DateTimeField from '../components/datetime';

import { ConvertUnit, TSep, makeRequestsWithAuth, checkUserPerm, checkPerm, customAxios as axios, getAuthToken, removeNUEValues } from '../functions';

const CURRENTY_ICON = { 1: "€", 2: "$" };

const DivisionCard = ({ division }) => {
    const { apiPath, userSettings } = useContext(AppContext);
    const { t: tr } = useTranslation();

    const [showDetails, setShowDetails] = useState(false);
    const getFirstDayOfMonth = () => {
        const now = new Date();
        const timezone = userSettings.display_timezone;

        const options = { timeZone: timezone, year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
        const formatter = new Intl.DateTimeFormat([], options);
        const parts = formatter.formatToParts(now);
        const dateTimeInTimeZone = new Date(
            parts.find(part => part.type === 'year').value,
            parts.find(part => part.type === 'month').value - 1,
            parts.find(part => part.type === 'day').value,
            parts.find(part => part.type === 'hour').value,
            parts.find(part => part.type === 'minute').value,
            parts.find(part => part.type === 'second').value
        );

        const offset = dateTimeInTimeZone.getTime() - now.getTime();

        const firstDay = new Date(dateTimeInTimeZone.getFullYear(), dateTimeInTimeZone.getMonth(), 1, 0, 0, 0, 0);
        const firstDayUtc = new Date(firstDay.getTime() - offset);

        return Math.floor(firstDayUtc.getTime() / 1000);
    };
    const [listParam, setListParam] = useState({ after: getFirstDayOfMonth(), order: 'desc', order_by: 'jobs' });

    const [page, setPage] = useState(1);
    const pageRef = useRef(1);
    const [pageSize, setPageSize] = useState(5);
    const [totalItems, setTotalItems] = useState(0);
    useEffect(() => {
        pageRef.current = page;
    }, [page]);

    const columns = [
        { id: 'user', label: tr("driver") },
        { id: 'jobs', label: tr("jobs"), orderKey: 'jobs', defaultOrder: 'desc' },
        { id: 'distance', label: tr("distance"), orderKey: 'distance', defaultOrder: 'desc' },
        { id: 'fuel', label: tr("fuel"), orderKey: 'fuel', defaultOrder: 'desc' },
        { id: 'profit.euro', label: tr("profit_ets2"), orderKey: 'profit_euro', defaultOrder: 'desc' },
        { id: 'profit.dollar', label: tr("profit_ats"), orderKey: 'profit_dollar', defaultOrder: 'desc' },
        { id: 'points', label: tr("points"), orderKey: 'points', defaultOrder: 'desc' },
    ];
    const [userList, setUserList] = useState([]);

    useEffect(() => {
        const debouncedDoLoad = debounce(async function doLoad() {
            window.loading += 1;

            let processedParam = removeNUEValues(listParam);

            let urls = [
                `${apiPath}/divisions/${division.divisionid}/activity?page=${page}&page_size=${pageSize}&${new URLSearchParams(processedParam).toString()}`,
            ];
            let [_userList] = await makeRequestsWithAuth(urls);
            let newUserList = [];
            for (let i = 0; i < _userList.list.length; i++) {
                let row = _userList.list[i];
                newUserList.push({ user: <UserCard user={row.user} inline={true} />, jobs: row.jobs, distance: ConvertUnit(userSettings.unit, "km", row.distance), fuel: ConvertUnit(userSettings.unit, "l", row.fuel), "profit.euro": `${CURRENTY_ICON[1]}${TSep(row.profit.euro)}`, "profit.dollar": `${CURRENTY_ICON[2]}${TSep(row.profit.dollar)}`, points: TSep(row.points) });
            }
            setUserList(newUserList);
            setTotalItems(_userList.total_items);

            window.loading -= 1;
        }, 300);

        if (showDetails) debouncedDoLoad();
    }, [showDetails, apiPath, division, listParam, page, pageSize]);

    return (
        <>
            <Card>
                <CardContent>
                    <div style={{ marginBottom: "10px", display: 'flex', alignItems: "center" }}>
                        <Typography variant="h5" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                {division.name}
                            </div>
                            <IconButton sx={{ marginLeft: 'auto' }} onClick={() => setShowDetails(true)}>
                                <AspectRatioRounded />
                            </IconButton>
                        </Typography>
                    </div>
                    <Grid container spacing={2}>
                        <Grid
                            size={{
                                xs: 6,
                                sm: 6,
                                md: 6,
                                lg: 6
                            }}>
                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                                <PermContactCalendarRounded />&nbsp;{TSep(division.drivers)}
                            </Typography>
                        </Grid>
                        <Grid
                            size={{
                                xs: 6,
                                sm: 6,
                                md: 6,
                                lg: 6
                            }}>
                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                                <LocalShippingRounded />&nbsp;{TSep(division.jobs)}
                            </Typography>
                        </Grid>
                        <Grid
                            size={{
                                xs: 6,
                                sm: 6,
                                md: 6,
                                lg: 6
                            }}>
                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                                <RouteRounded />&nbsp;{ConvertUnit(userSettings.unit, "km", division.distance)}
                            </Typography>
                        </Grid>
                        <Grid
                            size={{
                                xs: 6,
                                sm: 6,
                                md: 6,
                                lg: 6
                            }}>
                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                                <LocalGasStationRounded />&nbsp;{ConvertUnit(userSettings.unit, "l", division.fuel)}
                            </Typography>
                        </Grid>
                        <Grid
                            size={{
                                xs: 6,
                                sm: 6,
                                md: 6,
                                lg: 6
                            }}>
                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                                <EuroRounded />&nbsp;{TSep(division.profit.euro)}
                            </Typography>
                        </Grid>
                        <Grid
                            size={{
                                xs: 6,
                                sm: 6,
                                md: 6,
                                lg: 6
                            }}>
                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                                <AttachMoneyRounded />&nbsp;{TSep(division.profit.dollar)}
                            </Typography>
                        </Grid>
                        <Grid
                            size={{
                                xs: 6,
                                sm: 6,
                                md: 6,
                                lg: 6
                            }}>
                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                                <EmojiEventsRounded />&nbsp;{TSep(division.points)}
                            </Typography>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
            <Dialog open={showDetails} onClose={() => setShowDetails(false)}
                PaperProps={{
                    sx: {
                        minWidth: "min(1000px, 100vw)"
                    }
                }}>
                <DialogTitle>{tr("division_activity")}{division.name}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ paddingTop: "5px" }}>
                        <Grid size={6}>
                            <DateTimeField
                                label={tr("after")}
                                defaultValue={listParam.after}
                                onChange={(timestamp) => { setListParam({ ...listParam, after: timestamp }); }}
                                fullWidth
                            />
                        </Grid>
                        <Grid size={6}>
                            <DateTimeField
                                label={tr("before")}
                                defaultValue={listParam.before}
                                onChange={(timestamp) => { setListParam({ ...listParam, before: timestamp }); }}
                                fullWidth
                            />
                        </Grid>
                        <Grid size={6}>
                            <TextField select
                                label={tr("include_previous_drivers")}
                                value={listParam.include_previous_drivers}
                                onChange={(e) => { setListParam({ ...listParam, include_previous_drivers: e.target.value }); }}
                                fullWidth
                            >
                                <MenuItem value={true}>{tr("yes")}</MenuItem>
                                <MenuItem value={false}>{tr("no")}</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid size={6}>
                            <TextField select
                                label={tr("include_pending_validations")}
                                value={listParam.include_pending}
                                onChange={(e) => { setListParam({ ...listParam, include_pending: e.target.value }); }}
                                fullWidth
                            >
                                <MenuItem value={true}>{tr("yes")}</MenuItem>
                                <MenuItem value={false}>{tr("no")}</MenuItem>
                            </TextField>
                        </Grid>
                    </Grid>
                    <CustomTable page={page} columns={columns} order={listParam.order} orderBy={listParam.order_by} onOrderingUpdate={(order_by, order) => { setListParam({ ...listParam, order_by: order_by, order: order }); }} data={userList} totalItems={totalItems} rowsPerPageOptions={[5, 10, 25, 50, 100, 250]} defaultRowsPerPage={pageSize} onPageChange={setPage} onRowsPerPageChange={setPageSize} style={{ marginTop: "15px" }} />
                </DialogContent>
                <DialogActions>
                    <Button variant="primary" onClick={() => setShowDetails(false)}>{tr("close")}</Button>
                </DialogActions>
            </Dialog >
        </>
    );
};

const DivisionsMemo = memo(({ doReload, loadComplete, setLoadComplete, listParam }) => {
    const { apiPath } = useContext(AppContext);

    const [divisions, setDivisions] = useState([]);

    useEffect(() => {
        async function doLoad() {
            window.loading += 1;

            let processedParam = removeNUEValues(listParam);

            let urls = [
                `${apiPath}/divisions/statistics?${new URLSearchParams(processedParam).toString()}`,
            ];
            let [_divisions] = await makeRequestsWithAuth(urls);
            setDivisions(_divisions);

            setLoadComplete(cnt => cnt + 1);

            window.loading -= 1;
        }
        doLoad();
    }, [apiPath, doReload, listParam]);

    return (
        <>{loadComplete >= 2 && <Grid container spacing={2}>
            {divisions.map((division, index) => (
                <Grid
                    key={`grid-${index}`}
                    size={{
                        xs: 12,
                        sm: 12,
                        md: 6,
                        lg: 4
                    }}>
                    <DivisionCard division={division} />
                </Grid>
            ))}
        </Grid>}</>
    );
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
                    checkmark = <>{checkmark}&nbsp;<Tooltip placement="top" arrow title={dlogL.list[i].division.status === 1 ? tr("validated_division_delivery") : tr("pending_division_delivery")}
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
                newDlogList.push({ logid: row.logid, display_logid: <Typography variant="body2" sx={{ flexGrow: 1, display: 'flex', alignItems: "center" }}><span>{row.logid}</span>{checkmark}</Typography>, driver: <UserCard user={row.user} inline={true} />, source: `${row.source_company}, ${row.source_city}`, destination: `${row.destination_company}, ${row.destination_city}`, distance: ConvertUnit(userSettings.unit, "km", row.distance), cargo: `${row.cargo} (${ConvertUnit(userSettings.unit, "kg", row.cargo_mass)})`, profit: `${CURRENTY_ICON[row.unit]}${row.profit}`, time: <TimeDelta key={`${+new Date()}`} timestamp={row.timestamp * 1000} /> });
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
        {loadComplete >= 2 && <CustomTable page={page} columns={columns} data={dlogList} totalItems={totalItems} rowsPerPageOptions={[10, 25, 50, 100, 250]} defaultRowsPerPage={pageSize} onPageChange={setPage} onRowsPerPageChange={setPageSize} onRowClick={handleClick} style={{ marginTop: "15px" }} pstyle={checkUserPerm(curUserPerm, ["administrator", "manage_divisions"]) ? {} : { marginRight: "60px" }} name={<><FontAwesomeIcon icon={faWarehouse} />&nbsp;&nbsp;{tr("recent_validated_division_deliveries")}</>} sx={{ display: loadComplete >= 2 ? undefined : "hidden" }} />}
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
        {loadComplete >= 1 && <CustomTable page={page} columns={pendingColumns} data={dlogList} totalItems={totalItems} rowsPerPageOptions={[10, 25, 50, 100, 250]} defaultRowsPerPage={pageSize} onPageChange={setPage} onRowsPerPageChange={setPageSize} onRowClick={handleClick} style={{ marginTop: "15px" }} pstyle={{ marginRight: "60px" }} name={<><FontAwesomeIcon icon={faClock} />&nbsp;&nbsp;{tr("pending_division_validation_requests")}</>} sx={{ display: loadComplete >= 1 ? undefined : "hidden" }} />}
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
    const location = useLocation();

    const [doReload, setDoReload] = useState(0);
    const [dialogManagers, setDialogManagers] = useState(false);
    const [dialogOpen, setDialogOpen] = useState("");

    const [listParam, setListParam] = useState(cache.division.listParam);
    const [tempListParam, setTempListParam] = useState(cache.division.listParam);

    useEffect(() => {
        return () => {
            setCache(cache => ({ ...cache, division: { ...cache.division, listParam } }));
        };
    }, [listParam]);

    const [loadComplete, setLoadComplete] = useState(0);

    return (
        <>
            {location.pathname === "/division" && <DivisionsMemo doReload={doReload} loadComplete={loadComplete} setLoadComplete={setLoadComplete} listParam={listParam} />}
            {location.pathname === "/division" && <DivisionsDlog doReload={doReload} loadComplete={loadComplete} setLoadComplete={setLoadComplete} />}
            {location.pathname === "/division/pending" && checkUserPerm(curUserPerm, ["administrator", "manage_divisions"]) && <DivisionsPending doReload={doReload} loadComplete={loadComplete} setLoadComplete={setLoadComplete} />}
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
                        <Grid size={6}>
                            <DateTimeField
                                label={tr("after")}
                                defaultValue={tempListParam.after}
                                onChange={(timestamp) => { setTempListParam({ ...tempListParam, after: timestamp }); }}
                                fullWidth
                            />
                        </Grid>
                        <Grid size={6}>
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
                    <Button variant="contained" onClick={() => { setTempListParam(tempListParam); }}>{tr("update")}</Button>
                </DialogActions>
            </Dialog>
            {location.pathname === "/division" && <SpeedDial
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
            </SpeedDial>}
        </>
    );
};

export default Divisions;