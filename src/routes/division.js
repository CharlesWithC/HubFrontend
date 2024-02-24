import { useRef, useEffect, useState, useCallback, useContext, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppContext } from '../context';

import { Card, CardContent, Typography, Grid, SpeedDial, SpeedDialIcon, SpeedDialAction, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Snackbar, Alert, useTheme } from '@mui/material';
import { PermContactCalendarRounded, LocalShippingRounded, EuroRounded, AttachMoneyRounded, RouteRounded, LocalGasStationRounded, EmojiEventsRounded, PeopleAltRounded, RefreshRounded, VerifiedOutlined } from '@mui/icons-material';
import { Portal } from '@mui/base';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWarehouse, faClock } from '@fortawesome/free-solid-svg-icons';

import UserCard from '../components/usercard';
import TimeAgo from '../components/timeago';
import CustomTable from '../components/table';

import { ConvertUnit, TSep, makeRequestsWithAuth, checkUserPerm, checkPerm, customAxios as axios, getAuthToken } from '../functions';

var vars = require("../variables");

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

const DivisionsMemo = memo(({ doReload }) => {
    const [divisions, setDivisions] = useState([]);

    useEffect(() => {
        async function doLoad() {
            window.loading += 1;

            let urls = [
                `${vars.dhpath}/divisions`,
            ];
            let [_divisions] = await makeRequestsWithAuth(urls);
            setDivisions(_divisions);

            window.loading -= 1;
        }
        doLoad();
    }, [doReload]);

    return (<Grid container spacing={2}>
        {divisions.map((division, index) => (
            <Grid key={`grid-${index}`} item xs={12} sm={12} md={divisions.length % 2 === 0 ? 6 : index === divisions.length - 1 ? 12 : 6} lg={divisions.length % 2 === 0 ? 6 : index === divisions.length - 1 ? 12 : 6}>
                <DivisionCard division={division} />
            </Grid>
        ))}
    </Grid>);
});

const DivisionsDlog = memo(({ doReload }) => {
    const { t: tr } = useTranslation();
    const { curUserPerm, userSettings } = useContext(AppContext);

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

    const [dlogList, setDlogList] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [page, setPage] = useState(1);
    const pageRef = useRef(1);
    const [pageSize, setPageSize] = useState(userSettings.default_row_per_page);

    const theme = useTheme();

    useEffect(() => {
        pageRef.current = page;
    }, [page]);
    useEffect(() => {
        async function doLoad() {
            window.loading += 1;

            const [dlogL] = await makeRequestsWithAuth([`${vars.dhpath}/dlog/list?page=${page}&page_size=${pageSize}&division=only`]);

            let newDlogList = [];
            for (let i = 0; i < dlogL.list.length; i++) {
                let row = dlogL.list[i];
                newDlogList.push({ logid: row.logid, display_logid: <Typography variant="body2" sx={{ flexGrow: 1, display: 'flex', alignItems: "center" }}><span>{row.logid}</span><VerifiedOutlined sx={{ color: theme.palette.info.main, fontSize: "1.2em" }} /></Typography>, driver: <UserCard user={row.user} inline={true} />, source: `${row.source_company}, ${row.source_city}`, destination: `${row.destination_company}, ${row.destination_city}`, distance: ConvertUnit(userSettings, "km", row.distance), cargo: `${row.cargo} (${ConvertUnit(userSettings.unit, "kg", row.cargo_mass)})`, profit: `${CURRENTY_ICON[row.unit]}${row.profit}`, time: <TimeAgo key={`${+new Date()}`} timestamp={row.timestamp * 1000} /> });
            }

            if (pageRef.current === page) {
                setDlogList(newDlogList);
                setTotalItems(dlogL.total_items);
            }

            window.loading -= 1;
        }
        doLoad();
    }, [page, pageSize, doReload, theme]);

    const navigate = useNavigate();
    function handleClick(data) {
        navigate(`/delivery/${data.logid}`);
    }

    return <>
        {dlogList.length !== 0 && <CustomTable columns={columns} data={dlogList} totalItems={totalItems} rowsPerPageOptions={[10, 25, 50, 100, 250]} defaultRowsPerPage={pageSize} onPageChange={setPage} onRowsPerPageChange={setPageSize} onRowClick={handleClick} style={{ marginTop: "15px" }} pstyle={checkUserPerm(curUserPerm, ["administrator", "manage_divisions"]) ? {} : { marginRight: "60px" }} name={<><FontAwesomeIcon icon={faWarehouse} />&nbsp;&nbsp;{tr("recent_validated_division_deliveries")}</>} />}
    </>;
});

const DivisionsPending = memo(({ doReload }) => {
    const { t: tr } = useTranslation();
    const { userSettings, divisions, loadDivisions } = useContext(AppContext);

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

    const [dlogList, setDlogList] = useState([]);
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

            let localDivisions = divisions;
            if (divisions === null) {
                localDivisions = await loadDivisions();
            }

            const [dlogL] = await makeRequestsWithAuth([`${vars.dhpath}/divisions/list/pending?page_size=${pageSize}&page=${page}`]);

            let newDlogList = [];
            for (let i = 0; i < dlogL.list.length; i++) {
                let row = dlogL.list[i];
                newDlogList.push({ logid: row.logid, display_logid: row.logid, driver: <UserCard user={row.user} inline={true} />, division: localDivisions[row.divisionid]?.name ?? tr("unknown"), contextMenu: <><MenuItem onClick={async (e) => { e.stopPropagation(); await handleDVUpdate(row.logid, row.divisionid, 1); doLoad(); }}>{tr("accept")}</MenuItem><MenuItem onClick={async (e) => { e.stopPropagation(); await handleDVUpdate(row.logid, row.divisionid, 2); doLoad(); }}>{tr("decline")}</MenuItem></> });
            }

            if (pageRef.current === page) {
                setDlogList(newDlogList);
                setTotalItems(dlogL.total_items);
            }

            window.loading -= 1;
        }
        doLoad();
    }, [page, pageSize, doReload]);
    const handleDVUpdate = useCallback(async (logid, divisionid, status) => {
        window.loading += 1;

        let resp = await axios({ url: `${vars.dhpath}/dlog/${logid}/division/${divisionid}`, data: { status: status }, method: "PATCH", headers: { "Authorization": `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            setSnackbarContent(tr("success"));
            setSnackbarSeverity("success");
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }

        window.loading -= 1;
    }, []);

    const navigate = useNavigate();
    function handleClick(data) {
        navigate(`/delivery/${data.logid}`);
    }

    return <>
        {dlogList.length !== 0 && <CustomTable columns={pendingColumns} data={dlogList} totalItems={totalItems} rowsPerPageOptions={[10, 25, 50, 100, 250]} defaultRowsPerPage={pageSize} onPageChange={setPage} onRowsPerPageChange={setPageSize} onRowClick={handleClick} style={{ marginTop: "15px" }} pstyle={{ marginRight: "60px" }} name={<><FontAwesomeIcon icon={faClock} />&nbsp;&nbsp;{tr("pending_division_validation_requests")}</>} />}
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
    const { curUser } = useContext(AppContext);

    const [doReload, setDoReload] = useState(0);
    const [dialogManagers, setDialogManagers] = useState(false);

    return <>
        <DivisionsMemo doReload={doReload} />
        <DivisionsDlog doReload={doReload} />
        <DivisionsPending doReload={doReload} />
        <Dialog open={dialogManagers} onClose={() => setDialogManagers(false)}>
            <DialogTitle>{tr("division_managers")}</DialogTitle>
            <DialogContent>
                <DivisionManagers />
            </DialogContent>
            <DialogActions>
                <Button variant="primary" onClick={() => { setDialogManagers(false); }}>{tr("close")}</Button>
            </DialogActions>
        </Dialog>
        <SpeedDial
            ariaLabel={tr("controls")}
            sx={{ position: 'fixed', bottom: 20, right: 20 }}
            icon={<SpeedDialIcon />}
        >
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