import React from 'react';
import { useEffect, useState, useCallback } from 'react';
import { Typography, Grid, Tooltip, SpeedDial, SpeedDialAction, SpeedDialIcon, Dialog, DialogActions, DialogTitle, DialogContent, TextField, Button, Snackbar, Alert, Divider, FormControl, FormControlLabel, Checkbox, useTheme } from '@mui/material';
import { LocalShippingRounded, WidgetsRounded, VerifiedOutlined } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Portal } from '@mui/base';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExport, faTowerObservation, faTruckFront } from '@fortawesome/free-solid-svg-icons';

import Podium from "../components/podium";
import CustomTable from "../components/table";
import UserCard from '../components/usercard';
import TimeAgo from '../components/timeago';
import { makeRequestsAuto, getMonthUTC, ConvertUnit, customAxios as axios, getAuthToken, downloadLocal, checkUserPerm } from '../functions';

var vars = require("../variables");

const columns = [
    { id: 'display_logid', label: 'ID' },
    { id: 'driver', label: 'Driver' },
    { id: 'source', label: 'Source' },
    { id: 'destination', label: 'Destination' },
    { id: 'distance', label: 'Distance' },
    { id: 'cargo', label: 'Cargo' },
    { id: 'profit', label: 'Profit' },
    { id: 'time', label: 'Time' },
];

const CURRENTY_ICON = { 1: "€", 2: "$" };

const Deliveries = () => {
    const [detailStats, setDetailStats] = useState("loading");
    const [dlogList, setDlogList] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [page, setPage] = useState(-1);
    const [pageSize, setPageSize] = useState(10);

    const [snackbarContent, setSnackbarContent] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const handleCloseSnackbar = useCallback(() => {
        setSnackbarContent("");
    }, []);

    const theme = useTheme();

    const [dialogOpen, setDialogOpen] = useState("");
    const [dialogButtonDisabled, setDialogButtonDisabled] = useState(false);

    const [exportRange, setExportRange] = useState({ start_time: + new Date() / 1000 - 86400 * 28, end_time: +new Date() / 1000 });
    const exportDlog = useCallback(async () => {
        if (exportRange.end_time - exportRange.start_time > 86400 * 90) {
            setSnackbarContent("The date range must be smaller than 90 days.");
            setSnackbarSeverity("error");
            return;
        }
        setDialogButtonDisabled(true);
        let resp = await axios({ url: `${vars.dhpath}/dlog/export?after=${parseInt(exportRange.start_time)}&before=${parseInt(exportRange.end_time)}`, method: "GET", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 200) {
            downloadLocal("export.csv", resp.data);
            setSnackbarContent("Success");
            setSnackbarSeverity("success");
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setDialogButtonDisabled(false);
    }, [exportRange]);

    const [bypassTrackerCheck, setBypassTrackerCheck] = useState(false);
    const [truckyJobID, setTruckyJobID] = useState();
    const importFromTruckySingle = useCallback(async () => {
        if (isNaN(truckyJobID) || truckyJobID.replaceAll(" ", "") === "") {
            setSnackbarContent("Invalid Job ID");
            setSnackbarSeverity("error");
            return;
        }
        setDialogButtonDisabled(true);
        let resp = await axios({ url: `${vars.dhpath}/trucky/import/${truckyJobID}?bypass_tracker_check=${bypassTrackerCheck}`, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            setSnackbarContent("Job Imported");
            setSnackbarSeverity("error");
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setDialogButtonDisabled(false);
    }, [truckyJobID, bypassTrackerCheck]);
    const [truckyImportLog, setTruckyImportLog] = useState("");
    const [truckyCompanyID, setTruckyCompanyID] = useState("");
    const [truckyImportRange, setTruckyImportRange] = useState({ start_time: + new Date() / 1000 - 86400 * 28, end_time: +new Date() / 1000 });
    const [truckyBatchImportTotal, setTruckyBatchImportTotal] = useState(0);
    const [truckyBatchImportCurrent, setTruckyBatchImportCurrent] = useState(0);
    const [truckyBatchImportSuccess, setTruckyBatchImportSuccess] = useState(0);
    const sleep = ms => new Promise(
        resolve => setTimeout(resolve, ms)
    );
    const importFromTruckyMultiple = useCallback(async () => {
        if (isNaN(truckyCompanyID) || truckyCompanyID.replaceAll(" ", "") === "") {
            setTruckyImportLog("Invalid Company ID");
            setSnackbarSeverity("error");
            return;
        }
        setDialogButtonDisabled(true);
        let resp = await axios({ url: `https://e.truckyapp.com/api/v1/company/${truckyCompanyID}/jobs?dateFrom=${new Date(truckyImportRange.start_time * 1000).toISOString()}&dateTo=${new Date(truckyImportRange.end_time * 1000).toISOString()}` });
        if (resp.data.error === true) {
            setTruckyImportLog(`Trucky Error: ${resp.data.error}`);
            setSnackbarSeverity("error");
            setDialogButtonDisabled(false);
            return;
        }
        if (resp.data.total === 0) {
            setTruckyImportLog(`No job detected! Try another company or change the time range.`);
            setSnackbarSeverity("error");
            setDialogButtonDisabled(false);
            return;
        }
        setTruckyImportLog(`Detected ${resp.data.total} jobs. Importing...`);
        setSnackbarSeverity("info");
        let totalPages = Math.ceil(resp.data.total / resp.data.per_page);
        setTruckyBatchImportTotal(resp.data.total);
        setTruckyBatchImportSuccess(0);

        let successCnt = 0;

        for (let i = 0; i < resp.data.data.length; i++) {
            setTruckyBatchImportCurrent(i + 1);
            let st = +new Date();
            let jobID = resp.data.data[i].id;
            let dhresp = await axios({ url: `${vars.dhpath}/trucky/import/${jobID}?bypass_tracker_check=${bypassTrackerCheck}`, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
            if (dhresp.status === 204) {
                setTruckyImportLog(`Imported Trucky job #${jobID}`);
                setSnackbarSeverity("success");
                successCnt += 1;
                setTruckyBatchImportSuccess(successCnt);
            } else {
                if (dhresp.data.retry_after !== undefined) {
                    setTruckyImportLog(`We are being rate limited by Drivers Hub API. We will continue after ${dhresp.data.retry_after} seconds...`);
                    setSnackbarSeverity("warning");
                    await sleep((dhresp.data.retry_after + 1) * 1000);
                    i -= 1;
                } else {
                    setTruckyImportLog(`Failed to import Trucky job #${jobID}: ${dhresp.data.error}`);
                    setSnackbarSeverity("error");
                }
            }
            let ed = +new Date();
            if (ed - st < 1000) await sleep(1000 - (ed - st));
        }

        if (totalPages > 1) {
            for (let page = 2; page <= totalPages; page++) {
                resp = await axios({ url: `https://e.truckyapp.com/api/v1/company/${truckyCompanyID}/jobs?dateFrom=${new Date(truckyImportRange.start_time * 1000).toISOString()}&dateTo=${new Date(truckyImportRange.end_time * 1000).toISOString()}&page=${page}` });
                if (resp.data.error === true) {
                    setTruckyImportLog(`Trucky Error: ${resp.data.error}`);
                    setSnackbarSeverity("error");
                    setDialogButtonDisabled(false);
                    return;
                }
                for (let i = 0; i < resp.data.data.length; i++) {
                    setTruckyBatchImportCurrent((page - 1) * resp.data.per_page + i + 1);
                    let st = +new Date();
                    let jobID = resp.data.data[i].id;
                    let dhresp = await axios({ url: `${vars.dhpath}/trucky/import/${jobID}?bypass_tracker_check=${bypassTrackerCheck}`, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
                    if (dhresp.status === 204) {
                        setTruckyImportLog(`Imported Trucky job #${jobID}`);
                        setSnackbarSeverity("success");
                        successCnt += 1;
                        setTruckyBatchImportSuccess(successCnt);
                    } else {
                        if (dhresp.data.retry_after !== undefined) {
                            setTruckyImportLog(`We are being rate limited by Drivers Hub API. We will continue after ${dhresp.data.retry_after} seconds...`);
                            setSnackbarSeverity("warning");
                            await sleep((dhresp.data.retry_after + 1) * 1000);
                            i -= 1;
                        } else {
                            setTruckyImportLog(`Failed to import Trucky job #${jobID}: ${dhresp.data.error}`);
                            setSnackbarSeverity("error");
                        }
                    }
                    let ed = +new Date();
                    if (ed - st < 1000) await sleep(1000 - (ed - st));
                }
            }
        };

        setDialogButtonDisabled(false);
    }, [truckyCompanyID, truckyImportRange, bypassTrackerCheck]);

    useEffect(() => {
        async function doLoad() {
            const loadingStart = new CustomEvent('loadingStart', {});
            window.dispatchEvent(loadingStart);

            let [detailS, dlogL] = [{}, {}];

            let myPage = page;
            if (myPage === -1) {
                myPage = 1;
            } else {
                myPage += 1;
            }

            if (page === -1) {
                [detailS, dlogL] = await makeRequestsAuto([
                    { url: `${vars.dhpath}/dlog/statistics/details?after=` + getMonthUTC() / 1000, auth: true },
                    { url: `${vars.dhpath}/dlog/list?page=${myPage}&page_size=${pageSize}`, auth: "prefer" },
                ]);

                setDetailStats(detailS);
            } else {
                [dlogL] = await makeRequestsAuto([
                    { url: `${vars.dhpath}/dlog/list?page=${myPage}&page_size=${pageSize}`, auth: "prefer" },
                ]);
            }

            let newDlogList = [];
            for (let i = 0; i < dlogL.list.length; i++) {
                let divisionCheckmark = <></>;
                if (dlogL.list[i].division.divisionid !== undefined) {
                    divisionCheckmark = <Tooltip placement="top" arrow title="Validated Division Delivery"
                        PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, -10] } }] }}>
                        <VerifiedOutlined sx={{ color: theme.palette.info.main, fontSize: "18px" }} />
                    </Tooltip>;
                }
                newDlogList.push({ logid: dlogL.list[i].logid, display_logid: <Typography variant="body2" sx={{ flexGrow: 1, display: 'flex', alignItems: "center" }}><span>{dlogL.list[i].logid}</span>{divisionCheckmark}</Typography>, driver: <UserCard user={dlogL.list[i].user} inline={true} />, source: `${dlogL.list[i].source_company}, ${dlogL.list[i].source_city}`, destination: `${dlogL.list[i].destination_company}, ${dlogL.list[i].destination_city}`, distance: ConvertUnit("km", dlogL.list[i].distance), cargo: `${dlogL.list[i].cargo} (${ConvertUnit("kg", dlogL.list[i].cargo_mass)})`, profit: `${CURRENTY_ICON[dlogL.list[i].unit]}${dlogL.list[i].profit}`, time: <TimeAgo key={`${+new Date()}`} timestamp={dlogL.list[i].timestamp * 1000} /> });
            }

            setDlogList(newDlogList);
            setTotalItems(dlogL.total_items);

            const loadingEnd = new CustomEvent('loadingEnd', {});
            window.dispatchEvent(loadingEnd);
        }
        doLoad();
    }, [page, pageSize, theme]);

    const navigate = useNavigate();
    function handleClick(data) {
        navigate(`/beta/delivery/${data.logid}`);
    }

    function replaceUnderscores(str) {
        return str.split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    return <>
        {detailStats.truck !== undefined && detailStats !== "loading" && <>
            <Grid container spacing={2} sx={{ marginBottom: "15px" }}>
                <Grid item xs={12} sm={12} md={6} lg={4}>
                    <Podium title={
                        <Typography variant="h5" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: "center" }}>
                            <LocalShippingRounded />&nbsp;&nbsp;Top Trucks
                        </Typography>
                    }
                        first={{ name: detailStats.truck[0].name, stat: detailStats.truck[0].count }} second={{ name: detailStats.truck[1].name, stat: detailStats.truck[1].count }} third={{ name: detailStats.truck[2].name, stat: detailStats.truck[2].count }} fixWidth={true} />
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={4}>
                    <Podium title={
                        <Typography variant="h5" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: "center" }}>
                            <WidgetsRounded />&nbsp;&nbsp;Top Cargos
                        </Typography>
                    } first={{ name: detailStats.cargo[0].name, stat: detailStats.cargo[0].count }} second={{ name: detailStats.cargo[1].name, stat: detailStats.cargo[1].count }} third={{ name: detailStats.cargo[2].name, stat: detailStats.cargo[2].count }} fixWidth={true} />
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={4}>
                    <Podium title={
                        <Typography variant="h5" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: "center" }}>
                            <FontAwesomeIcon icon={faTowerObservation} />&nbsp;&nbsp;Top Offence
                        </Typography>
                    } first={{ name: replaceUnderscores(detailStats.fine[0].unique_id), stat: detailStats.fine[0].count }} second={{ name: replaceUnderscores(detailStats.fine[1].unique_id), stat: detailStats.fine[1].count }} third={{ name: replaceUnderscores(detailStats.fine[2].unique_id), stat: detailStats.fine[2].count }} fixWidth={true} />
                </Grid>
            </Grid>
            <CustomTable columns={columns} data={dlogList} totalItems={totalItems} rowsPerPageOptions={[10, 25, 50, 100, 250]} defaultRowsPerPage={pageSize} onPageChange={setPage} onRowsPerPageChange={setPageSize} onRowClick={handleClick} />
        </>
        }
        {detailStats.truck === undefined && detailStats !== "loading" &&
            <CustomTable columns={columns} data={dlogList} totalItems={totalItems} rowsPerPageOptions={[10, 25, 50, 100, 250]} defaultRowsPerPage={pageSize} onPageChange={setPage} onRowsPerPageChange={setPageSize} onRowClick={handleClick} />}
        <Dialog open={dialogOpen === "export"} onClose={() => setDialogOpen("")}>
            <DialogTitle>Export Delivery Logs</DialogTitle>
            <DialogContent>
                <Typography variant="body2">- You may export delivery logs of a range of up to 90 days each time.</Typography>
                <Grid container spacing={2} style={{ marginTop: "3px" }}>
                    <Grid item xs={6}>
                        <TextField
                            label="Start Time"
                            type="datetime-local"
                            value={new Date(new Date(exportRange.start_time * 1000).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                            onChange={(e) => { if (!isNaN(parseInt((+new Date(e.target.value)) / 1000))) setExportRange({ ...exportRange, start_time: parseInt((+new Date(e.target.value)) / 1000) }); }}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            label="End Time"
                            type="datetime-local"
                            value={new Date(new Date(exportRange.end_time * 1000).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                            onChange={(e) => { if (!isNaN(parseInt((+new Date(e.target.value)) / 1000))) setExportRange({ ...exportRange, end_time: parseInt((+new Date(e.target.value)) / 1000) }); }}
                            fullWidth
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button variant="primary" onClick={() => { setDialogOpen(""); }}>Cancel</Button>
                <Button variant="contained" color="info" onClick={() => { exportDlog(); }} disabled={dialogButtonDisabled}>Export</Button>
            </DialogActions>
        </Dialog>
        <Dialog open={dialogOpen === "import-trucky"} onClose={() => { if (!dialogButtonDisabled) setDialogOpen(""); }}>
            <DialogTitle>Import Trucky Jobs</DialogTitle>
            <DialogContent>
                <Typography variant="body2" >- You may either import a single job or multiple jobs from a Trucky VTC automatically.</Typography>
                <Typography variant="body2">- If you get an error like "User Not Found", then the user who submitted the job on Trucky is not a member of the Drivers Hub.</Typography>
                <Typography variant="body2">- If you get an error like "User chose to use another tracker", you may enable "Bypass tracker check" to ignore that. But keep in mind that this may lead to duplicate jobs.</Typography>
                <Typography variant="body2">- When importing multiple jobs, do not close the tab, or the process will stop.</Typography>

                <FormControl component="fieldset" sx={{ mb: "10px" }}>
                    <FormControlLabel
                        key="bypass-tracker-check"
                        control={
                            <Checkbox
                                name="Bypass tracker check?"
                                checked={bypassTrackerCheck}
                                onChange={() => setBypassTrackerCheck(!bypassTrackerCheck)}
                            />
                        }
                        label="Bypass tracker check?"
                    />
                </FormControl>

                <Typography variant="body2" sx={{ fontWeight: 800, mb: "10px" }}>Single Job</Typography>
                <Grid container spacing={2} sx={{ mb: "3px" }}>
                    <Grid item xs={12}>
                        <TextField
                            label="Trucky Job ID"
                            value={truckyJobID}
                            onChange={(e) => { setTruckyJobID(e.target.value); }}
                            fullWidth sx={{ mb: "5px" }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Button variant="contained" color="info" onClick={() => { importFromTruckySingle(); }} disabled={dialogButtonDisabled} fullWidth>Import</Button>
                    </Grid>
                </Grid>
                <Divider sx={{ mt: "10px", mb: "10px" }} />
                <Typography variant="body2" sx={{ fontWeight: 800, mb: "10px" }}>Multiple Jobs {truckyBatchImportTotal !== 0 ? `(${truckyBatchImportCurrent} / ${truckyBatchImportTotal} | Success: ${truckyBatchImportSuccess})` : ""}</Typography>

                <Grid container spacing={2} sx={{ mb: "3px" }}>
                    <Grid item xs={12}>
                        <TextField
                            label="Trucky Company ID"
                            value={truckyCompanyID}
                            onChange={(e) => { setTruckyCompanyID(e.target.value); }}
                            fullWidth sx={{ mb: "5px" }}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            label="Start Time"
                            type="datetime-local"
                            value={new Date(new Date(truckyImportRange.start_time * 1000).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                            onChange={(e) => { if (!isNaN(parseInt((+new Date(e.target.value)) / 1000))) setTruckyImportRange({ ...truckyImportRange, start_time: parseInt((+new Date(e.target.value)) / 1000) }); }}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            label="End Time"
                            type="datetime-local"
                            value={new Date(new Date(truckyImportRange.end_time * 1000).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                            onChange={(e) => { if (!isNaN(parseInt((+new Date(e.target.value)) / 1000))) setTruckyImportRange({ ...truckyImportRange, end_time: parseInt((+new Date(e.target.value)) / 1000) }); }}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="body2" sx={{ color: theme.palette[snackbarSeverity].main }} gutterBottom>{truckyImportLog}</Typography>
                        <Button variant="contained" color="info" onClick={() => { importFromTruckyMultiple(); }} disabled={dialogButtonDisabled} fullWidth>Import</Button>
                    </Grid>
                </Grid>
            </DialogContent>
        </Dialog>
        <SpeedDial
            ariaLabel="Controls"
            sx={{ position: 'fixed', bottom: 20, right: 20 }}
            icon={<SpeedDialIcon />}
        >
            <SpeedDialAction
                key="export"
                tooltipTitle="Export"
                icon={<FontAwesomeIcon icon={faFileExport} />}
                onClick={() => { setDialogOpen("export"); }} />
            {checkUserPerm(["admin", "hrm", "hr", "import_dlog"]) && <SpeedDialAction
                key="import"
                tooltipTitle="Import Trucky Jobs"
                icon={<FontAwesomeIcon icon={faTruckFront} />}
                onClick={() => { setDialogOpen("import-trucky"); }} />}
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

export default Deliveries;