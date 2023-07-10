import { useEffect, useState, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Typography, Grid, SpeedDial, SpeedDialIcon, SpeedDialAction, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, TextField, Select, MenuItem, Snackbar, Alert, Pagination, IconButton } from '@mui/material';
import { PermContactCalendarRounded, LocalShippingRounded, EuroRounded, AttachMoneyRounded, RouteRounded, LocalGasStationRounded, EmojiEventsRounded, PeopleAltRounded, RefreshRounded } from '@mui/icons-material';
import { Portal } from '@mui/base';

import UserCard from '../components/usercard';
import TimeAgo from '../components/timeago';
import CustomTable from '../components/table';
import { ConvertUnit, TSep, makeRequestsWithAuth, checkUserPerm, customAxios as axios, checkPerm, getAuthToken } from '../functions';

var vars = require("../variables");

const columns = [
    { id: 'logid', label: 'ID' },
    { id: 'driver', label: 'Driver' },
    { id: 'source', label: 'Source' },
    { id: 'destination', label: 'Destination' },
    { id: 'distance', label: 'Distance' },
    { id: 'cargo', label: 'Cargo' },
    { id: 'profit', label: 'Profit' },
    { id: 'time', label: 'Time' },
];
const pendingColumns = [
    { id: 'logid', label: 'Log ID' },
    { id: 'driver', label: 'Driver' },
    { id: 'division', label: 'Division' },
];

const PROFIT_UNIT = { 1: "€", 2: "$" };

const DivisionCard = ({ division }) => {
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
                        <RouteRounded />&nbsp;{ConvertUnit("km", division.distance)}
                    </Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={6}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocalGasStationRounded />&nbsp;{ConvertUnit("l", division.fuel)}
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
            const loadingStart = new CustomEvent('loadingStart', {});
            window.dispatchEvent(loadingStart);

            let urls = [
                `${vars.dhpath}/divisions`,
            ];
            let [_divisions] = await makeRequestsWithAuth(urls);
            setDivisions(_divisions);

            const loadingEnd = new CustomEvent('loadingEnd', {});
            window.dispatchEvent(loadingEnd);
        }
        doLoad();
    }, [doReload]);

    return (<Grid container spacing={2}>
        {divisions.map((division, index) => (
            <Grid item xs={12} sm={12} md={divisions.length % 2 === 0 ? 6 : index === divisions.length - 1 ? 12 : 6} lg={divisions.length % 2 === 0 ? 6 : index === divisions.length - 1 ? 12 : 6}>
                <DivisionCard division={division} />
            </Grid>
        ))}
    </Grid>);
});

const DivisionsDlog = memo(({ doReload }) => {
    const [dlogList, setDlogList] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [page, setPage] = useState(-1);
    const [pageSize, setPageSize] = useState(10);

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

            const [dlogL] = await makeRequestsWithAuth([`${vars.dhpath}/dlog/list?page=${myPage}&page_size=${pageSize}&division=only`]);

            let newDlogList = [];
            for (let i = 0; i < dlogL.list.length; i++) {
                newDlogList.push({ logid: dlogL.list[i].logid, driver: <UserCard user={dlogL.list[i].user} inline={true} />, source: `${dlogL.list[i].source_company}, ${dlogL.list[i].source_city}`, destination: `${dlogL.list[i].destination_company}, ${dlogL.list[i].destination_city}`, distance: ConvertUnit("km", dlogL.list[i].distance), cargo: `${dlogL.list[i].cargo} (${ConvertUnit("kg", dlogL.list[i].cargo_mass)})`, profit: `${dlogL.list[i].profit}${PROFIT_UNIT[dlogL.list[i].unit]}`, time: <TimeAgo timestamp={dlogL.list[i].timestamp * 1000} /> });
            }

            setDlogList(newDlogList);
            setTotalItems(dlogL.total_items);

            const loadingEnd = new CustomEvent('loadingEnd', {});
            window.dispatchEvent(loadingEnd);
        }
        doLoad();
    }, [page, pageSize, doReload]);

    const navigate = useNavigate();
    function handleClick(data) {
        navigate(`/delivery/${data.logid}`);
    }

    return <>
        {dlogList.length !== 0 && <CustomTable columns={columns} data={dlogList} totalItems={totalItems} rowsPerPageOptions={[10, 25, 50, 100, 250]} defaultRowsPerPage={pageSize} onPageChange={setPage} onRowsPerPageChange={setPageSize} onRowClick={handleClick} style={{ marginTop: "15px" }} pstyle={checkUserPerm(["admin", "division"]) ? {} : { marginRight: "60px" }} name={"Recent Validated Division Deliveries"} />}
    </>;
});

const DivisionsPending = memo(({ doReload }) => {
    const [dlogList, setDlogList] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [page, setPage] = useState(-1);
    const [pageSize, setPageSize] = useState(10);

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

            const [dlogL] = await makeRequestsWithAuth([`${vars.dhpath}/divisions/list/pending?page_size=${pageSize}&page=${myPage}`]);

            let newDlogList = [];
            for (let i = 0; i < dlogL.list.length; i++) {
                newDlogList.push({ logid: dlogL.list[i].logid, driver: <UserCard user={dlogL.list[i].user} inline={true} />, division: vars.divisions[dlogL.list[i].divisionid].name });
            }

            setDlogList(newDlogList);
            setTotalItems(dlogL.total_items);

            const loadingEnd = new CustomEvent('loadingEnd', {});
            window.dispatchEvent(loadingEnd);
        }
        doLoad();
    }, [page, pageSize, doReload]);

    const navigate = useNavigate();
    function handleClick(data) {
        navigate(`/delivery/${data.logid}`);
    }

    return <>
        {dlogList.length !== 0 && <CustomTable columns={pendingColumns} data={dlogList} totalItems={totalItems} rowsPerPageOptions={[10, 25, 50, 100, 250]} defaultRowsPerPage={pageSize} onPageChange={setPage} onRowsPerPageChange={setPageSize} onRowClick={handleClick} style={{ marginTop: "15px" }} pstyle={{ marginRight: "60px" }} name={"Pending Division Validation Requests"} />}
    </>;
});

const DivisionManagers = memo(() => {
    let managers = [];
    for (let i = 0; i < vars.members.length; i++) {
        if (checkPerm(vars.members[i].roles, ["admin", "division"])) {
            managers.push(vars.members[i]);
        }
    }

    return <>{
        managers.map((user) => (
            <UserCard key={`user-${user.userid}`} user={user} useChip={true} inline={true} />
        ))
    }</>;
});

const Divisions = () => {
    const [doReload, setDoReload] = useState(0);
    const [snackbarContent, setSnackbarContent] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const handleCloseSnackbar = useCallback(() => {
        setSnackbarContent("");
    }, []);
    const [dialogManagers, setDialogManagers] = useState(false);

    return <>
        <DivisionsMemo doReload={doReload} />
        <DivisionsDlog doReload={doReload} />
        <DivisionsPending doReload={doReload} />
        <Dialog open={dialogManagers} onClose={() => setDialogManagers(false)}>
            <DialogTitle>Division Managers</DialogTitle>
            <DialogContent>
                <DivisionManagers />
            </DialogContent>
            <DialogActions>
                <Button variant="primary" onClick={() => { setDialogManagers(false); }}>Close</Button>
            </DialogActions>
        </Dialog>
        <SpeedDial
            ariaLabel="Controls"
            sx={{ position: 'fixed', bottom: 20, right: 20 }}
            icon={<SpeedDialIcon />}
        >
            {vars.userInfo.userid !== -1 && <SpeedDialAction
                key="managers"
                icon={<PeopleAltRounded />}
                tooltipTitle="Managers"
                onClick={() => setDialogManagers(true)}
            />}
            <SpeedDialAction
                key="refresh"
                icon={<RefreshRounded />}
                tooltipTitle="Refresh"
                onClick={() => setDoReload(+new Date())}
            />
        </SpeedDial>
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
};

export default Divisions;