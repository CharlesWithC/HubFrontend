import { useRef, useEffect, useState, useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { AppContext, CacheContext } from '../context';

import { Typography, Grid, Tooltip, SpeedDial, SpeedDialAction, SpeedDialIcon, Dialog, DialogActions, DialogTitle, DialogContent, TextField, Button, Snackbar, Alert, Divider, FormControl, FormControlLabel, Checkbox, MenuItem, Box, useTheme } from '@mui/material';
import { LocalShippingRounded, WidgetsRounded, VerifiedOutlined } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Portal from '@mui/material/Portal';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExport, faGears, faStamp, faTowerObservation, faTruckFront } from '@fortawesome/free-solid-svg-icons';

import DateTimeField from '../components/datetime';
import Podium from "../components/podium";
import CustomTable from "../components/table";
import UserCard from '../components/usercard';
import UserSelect from '../components/userselect';
import TimeDelta from '../components/timedelta';
import SponsorBadge from '../components/sponsorBadge';
import { makeRequestsAuto, getMonthUTC, ConvertUnit, customAxios as axios, getAuthToken, downloadLocal, checkUserPerm, removeNUEValues } from '../functions';

const CURRENTY_ICON = { 1: "€", 2: "$" };

const Deliveries = () => {
    const { t: tr } = useTranslation();
    const { apiPath, userLevel, curUserPerm, userSettings, users, memberUIDs } = useContext(AppContext);
    const { cache, setCache } = useContext(CacheContext);
    const theme = useTheme();

    const columns = [
        { id: 'display_logid', label: 'ID', orderKey: 'logid', defaultOrder: 'desc' },
        { id: 'driver', label: tr("driver") },
        { id: 'source', label: tr("source") },
        { id: 'destination', label: tr("destination") },
        { id: 'distance', label: tr("distance"), orderKey: 'distance', defaultOrder: 'desc' },
        { id: 'cargo', label: tr("cargo") },
        { id: 'profit', label: tr("profit") },
        { id: 'time', label: tr("time") },
    ];

    const inited = useRef(false);

    const [detailStats, setDetailStats] = useState(cache.delivery_list.detailStats);
    const [dlogList, setDlogList] = useState(cache.delivery_list.dlogList);

    const [page, setPage] = useState(cache.delivery_list.page);
    const pageRef = useRef(cache.delivery_list.page);
    const [pageSize, setPageSize] = useState(cache.delivery_list.pageSize === null ? userSettings.default_row_per_page : cache.delivery_list.pageSize);
    const [totalItems, setTotalItems] = useState(cache.delivery_list.totalItems);
    const [tempListParam, setTempListParam] = useState(cache.delivery_list.listParam);
    const [listParam, setListParam] = useState(cache.delivery_list.listParam);

    useEffect(() => {
        return () => {
            setCache(cache => ({ ...cache, delivery_list: { ...cache.delivery_list, detailStats, dlogList, page, pageSize, totalItems, listParam } }));
        };
    }, [detailStats, dlogList, page, pageSize, totalItems, listParam]);

    const [snackbarContent, setSnackbarContent] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const handleCloseSnackbar = useCallback(() => {
        setSnackbarContent("");
    }, []);

    const [dialogOpen, setDialogOpen] = useState("");
    const [dialogButtonDisabled, setDialogButtonDisabled] = useState(false);

    const [exportRange, setExportRange] = useState({ start_time: undefined, end_time: undefined });
    const exportDlog = useCallback(async () => {
        setDialogButtonDisabled(true);
        let params = { after: exportRange.start_time, before: exportRange.end_time };
        params = removeNUEValues(params);
        let resp = await axios({ url: `${apiPath}/dlog/export`, method: "GET", headers: { Authorization: `Bearer ${getAuthToken()}` }, params: params });
        if (resp.status === 200) {
            downloadLocal("export.csv", resp.data);
            setSnackbarContent(tr("success"));
            setSnackbarSeverity("success");
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setDialogButtonDisabled(false);
    }, [apiPath, exportRange]);

    const [bypassTrackerCheck, setBypassTrackerCheck] = useState(false);
    const [truckyJobID, setTruckyJobID] = useState();
    const importFromTruckySingle = useCallback(async () => {
        if (isNaN(truckyJobID) || truckyJobID.replaceAll(" ", "") === "") {
            setSnackbarContent(tr("invalid_job_id"));
            setSnackbarSeverity("error");
            return;
        }
        setDialogButtonDisabled(true);
        let resp = await axios({ url: `${apiPath}/trucky/import/${truckyJobID}?bypass_tracker_check=${bypassTrackerCheck}`, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            setSnackbarContent(tr("job_imported"));
            setSnackbarSeverity("error");
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setDialogButtonDisabled(false);
    }, [apiPath, truckyJobID, bypassTrackerCheck]);
    const [truckyImportLog, setTruckyImportLog] = useState("");
    const [truckyCompanyID, setTruckyCompanyID] = useState("");
    const [truckyImportRange, setTruckyImportRange] = useState({ start_time: undefined, end_time: undefined });
    const [truckyBatchImportTotal, setTruckyBatchImportTotal] = useState(0);
    const [truckyBatchImportCurrent, setTruckyBatchImportCurrent] = useState(0);
    const [truckyBatchImportSuccess, setTruckyBatchImportSuccess] = useState(0);
    const sleep = ms => new Promise(
        resolve => setTimeout(resolve, ms)
    );
    const importFromTruckyMultiple = useCallback(async () => {
        if (userLevel < 4) {
            setSnackbarContent(tr("auto_import_multiple_trucky_jobs_platinum_perk"));
            setSnackbarSeverity("warning");
            return;
        }
        if (isNaN(truckyImportRange.end_time - truckyImportRange.start_time)) {
            setSnackbarContent(tr("invalid_date_range"));
            setSnackbarSeverity("error");
            return;
        }
        if (isNaN(truckyCompanyID) || truckyCompanyID.replaceAll(" ", "") === "") {
            setTruckyImportLog(tr("invalid_company_id"));
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
            let dhresp = await axios({ url: `${apiPath}/trucky/import/${jobID}?bypass_tracker_check=${bypassTrackerCheck}`, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
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
                    let dhresp = await axios({ url: `${apiPath}/trucky/import/${jobID}?bypass_tracker_check=${bypassTrackerCheck}`, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
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
    }, [apiPath, truckyCompanyID, truckyImportRange, bypassTrackerCheck]);

    useEffect(() => {
        pageRef.current = page;
    }, [page]);
    useEffect(() => {
        async function doLoad() {
            window.loading += 1;

            let [detailS, dlogL] = [{}, {}];

            let processedParam = removeNUEValues(listParam);

            if (!inited.current) {
                inited.current = true;
                setDetailStats({ truck: [{ name: "No.1 truck?", count: 200 }, { name: "Runner-up?", count: 100 }, { name: "3rd place?", count: 50 }], cargo: [{ name: "No.1 cargo?", count: 200 }, { name: "Runner-up?", count: 100 }, { name: "3rd place?", count: 50 }], fine: [{ unique_id: "No.1 fine?", count: 200 }, { unique_id: "Runner-up?", count: 100 }, { unique_id: "3rd place?", count: 50 }] });
                setTimeout(async function () {
                    [detailS] = await makeRequestsAuto([
                        { url: `${apiPath}/dlog/statistics/details?after=` + getMonthUTC() / 1000, auth: true },
                    ]);

                    setDetailStats({ truck: detailS.truck, cargo: detailS.cargo, fine: detailS.fine });
                }, 0);
            }

            [dlogL] = await makeRequestsAuto([
                { url: `${apiPath}/dlog/list?page=${page}&page_size=${pageSize}&${new URLSearchParams(processedParam).toString()}`, auth: "prefer" },
            ]);

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
                newDlogList.push({ logid: dlogL.list[i].logid, display_logid: <Typography variant="body2" sx={{ flexGrow: 1, display: 'flex', alignItems: "center" }}><span>{dlogL.list[i].logid}</span>{checkmark}</Typography>, driver: <UserCard user={dlogL.list[i].user} inline={true} />, source: `${dlogL.list[i].source_company}, ${dlogL.list[i].source_city}`, destination: `${dlogL.list[i].destination_company}, ${dlogL.list[i].destination_city}`, distance: ConvertUnit(userSettings.unit, "km", dlogL.list[i].distance), cargo: `${dlogL.list[i].cargo} (${ConvertUnit(userSettings.unit, "kg", dlogL.list[i].cargo_mass)})`, profit: `${CURRENTY_ICON[dlogL.list[i].unit]}${dlogL.list[i].profit}`, time: <TimeDelta key={`${+new Date()}`} timestamp={dlogL.list[i].timestamp * 1000} /> });
            }

            if (pageRef.current === page) {
                setDlogList(newDlogList);
                setTotalItems(dlogL.total_items);
            }

            window.loading -= 1;
        };
        doLoad();
    }, [apiPath, page, pageSize, listParam, theme]);

    const navigate = useNavigate();
    function handleClick(data) {
        navigate(`/delivery/${data.logid}`);
    }

    function replaceUnderscores(str) {
        return str.split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    return (
        <>
            {detailStats.truck !== undefined && detailStats !== "loading" && <>
                <Grid container spacing={2} sx={{ marginBottom: "15px" }}>
                    {detailStats.truck !== undefined && detailStats.truck.length >= 3 && <Grid
                        size={{
                            xs: 12,
                            sm: 12,
                            md: 6,
                            lg: 4
                        }}>
                        <Podium title={
                            <Typography variant="h5" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: "center" }}>
                                <LocalShippingRounded />&nbsp;&nbsp;{tr("top_trucks")}</Typography>
                        }
                            first={{ name: detailStats.truck[0].name, stat: detailStats.truck[0].count }} second={{ name: detailStats.truck[1].name, stat: detailStats.truck[1].count }} third={{ name: detailStats.truck[2].name, stat: detailStats.truck[2].count }} fixWidth={true} />
                    </Grid>}
                    {detailStats.cargo !== undefined && detailStats.cargo.length >= 3 && <Grid
                        size={{
                            xs: 12,
                            sm: 12,
                            md: 6,
                            lg: 4
                        }}>
                        <Podium title={
                            <Typography variant="h5" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: "center" }}>
                                <WidgetsRounded />&nbsp;&nbsp;{tr("top_cargos")}</Typography>
                        } first={{ name: detailStats.cargo[0].name, stat: detailStats.cargo[0].count }} second={{ name: detailStats.cargo[1].name, stat: detailStats.cargo[1].count }} third={{ name: detailStats.cargo[2].name, stat: detailStats.cargo[2].count }} fixWidth={true} />
                    </Grid>}
                    {detailStats.fine !== undefined && detailStats.fine.length >= 3 && <Grid
                        size={{
                            xs: 12,
                            sm: 12,
                            md: 6,
                            lg: 4
                        }}>
                        <Podium title={
                            <Typography variant="h5" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: "center" }}>
                                <FontAwesomeIcon icon={faTowerObservation} />&nbsp;&nbsp;{tr("top_offences")}</Typography>
                        } first={{ name: replaceUnderscores(detailStats.fine[0].unique_id), stat: detailStats.fine[0].count }} second={{ name: replaceUnderscores(detailStats.fine[1].unique_id), stat: detailStats.fine[1].count }} third={{ name: replaceUnderscores(detailStats.fine[2].unique_id), stat: detailStats.fine[2].count }} fixWidth={true} />
                    </Grid>}
                </Grid>
                <CustomTable page={page} columns={columns} order={listParam.order} orderBy={listParam.order_by} onOrderingUpdate={(order_by, order) => { setListParam({ ...listParam, order_by: order_by, order: order }); setTempListParam({ ...tempListParam, order_by: order_by, order: order }); }} data={dlogList} totalItems={totalItems} rowsPerPageOptions={[10, 25, 50, 100, 250]} defaultRowsPerPage={pageSize} onPageChange={setPage} onRowsPerPageChange={setPageSize} onRowClick={handleClick} />
            </>
            }
            {detailStats.truck === undefined && detailStats !== "loading" &&
                <CustomTable page={page} columns={columns} order={listParam.order} orderBy={listParam.order_by} onOrderingUpdate={(order_by, order) => { setListParam({ ...listParam, order_by: order_by, order: order }); setTempListParam({ ...tempListParam, order_by: order_by, order: order }); }} data={dlogList} totalItems={totalItems} rowsPerPageOptions={[10, 25, 50, 100, 250]} defaultRowsPerPage={pageSize} onPageChange={setPage} onRowsPerPageChange={setPageSize} onRowClick={handleClick} />}
            <Dialog open={dialogOpen === "export"} onClose={() => setDialogOpen("")}>
                <DialogTitle><FontAwesomeIcon icon={faFileExport} />&nbsp;&nbsp;{tr("export_delivery_logs")}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} style={{ marginTop: "3px" }}>
                        <Grid size={6}>
                            <DateTimeField
                                label={tr("start_time")}
                                defaultValue={exportRange.start_time}
                                onChange={(timestamp) => { setExportRange({ ...exportRange, start_time: timestamp }); }}
                                fullWidth
                            />
                        </Grid>
                        <Grid size={6}>
                            <DateTimeField
                                label={tr("end_time")}
                                defaultValue={exportRange.end_time}
                                onChange={(timestamp) => { setExportRange({ ...exportRange, end_time: timestamp }); }}
                                fullWidth
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button variant="primary" onClick={() => { setDialogOpen(""); }}>{tr("cancel")}</Button>
                    <Button variant="contained" color="info" onClick={() => { exportDlog(); }} disabled={dialogButtonDisabled}>{tr("export")}</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={dialogOpen === "import-trucky"} onClose={() => { if (!dialogButtonDisabled) setDialogOpen(""); }}>
                <DialogTitle><FontAwesomeIcon icon={faTruckFront} />&nbsp;&nbsp;{tr("import_trucky_jobs")}</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" >{tr("import_trucky_jobs_note")}</Typography>
                    <Typography variant="body2">{tr("import_trucky_jobs_note_2")}</Typography>
                    <Typography variant="body2">{tr("import_trucky_jobs_note_3")}</Typography>
                    <Typography variant="body2">{tr("import_trucky_jobs_note_4")}</Typography>

                    <FormControl component="fieldset" sx={{ mb: "10px" }}>
                        <FormControlLabel
                            key="bypass-tracker-check"
                            control={
                                <Checkbox
                                    name={tr("bypass_tracker_check")}
                                    checked={bypassTrackerCheck}
                                    onChange={() => setBypassTrackerCheck(!bypassTrackerCheck)}
                                />
                            }
                            label={tr("bypass_tracker_check")}
                        />
                    </FormControl>

                    <Typography variant="body2" sx={{ fontWeight: 800, mb: "10px" }}>{tr("single_job")}</Typography>
                    <Grid container spacing={2} sx={{ mb: "3px" }}>
                        <Grid size={12}>
                            <TextField
                                label={tr("trucky_job_id")}
                                value={truckyJobID}
                                onChange={(e) => { setTruckyJobID(e.target.value); }}
                                fullWidth sx={{ mb: "5px" }}
                            />
                        </Grid>
                        <Grid size={12}>
                            <Button variant="contained" color="info" onClick={() => { importFromTruckySingle(); }} disabled={dialogButtonDisabled} fullWidth>{tr("import")}</Button>
                        </Grid>
                    </Grid>
                    <Divider sx={{ mt: "10px", mb: "10px" }} />
                    <Typography variant="body2" sx={{ fontWeight: 800, mb: "10px" }}>{tr("multiple_jobs")}{truckyBatchImportTotal !== 0 ? `(${truckyBatchImportCurrent} / ${truckyBatchImportTotal} | ${tr("success")}: ${truckyBatchImportSuccess})` : ""}&nbsp;&nbsp;<SponsorBadge level={4} /></Typography>

                    <Grid container spacing={2} sx={{ mb: "3px" }}>
                        <Grid size={12}>
                            <TextField
                                label={tr("trucky_company_id")}
                                value={truckyCompanyID}
                                onChange={(e) => { setTruckyCompanyID(e.target.value); }}
                                fullWidth sx={{ mb: "5px" }}
                            />
                        </Grid>
                        <Grid size={6}>
                            <DateTimeField
                                label={tr("start_time")}
                                defaultValue={truckyImportRange.start_time}
                                onChange={(timestamp) => { setTruckyImportRange({ ...truckyImportRange, start_time: timestamp }); }}
                                fullWidth
                            />
                        </Grid>
                        <Grid size={6}>
                            <DateTimeField
                                label={tr("end_time")}
                                defaultValue={truckyImportRange.end_time}
                                onChange={(timestamp) => { setTruckyImportRange({ ...truckyImportRange, end_time: timestamp }); }}
                                fullWidth
                            />
                        </Grid>
                        <Grid size={12}>
                            <Typography variant="body2" sx={{ color: theme.palette[snackbarSeverity].main }} gutterBottom>{truckyImportLog}</Typography>
                            <Button variant="contained" color="info" onClick={() => { importFromTruckyMultiple(); }} disabled={dialogButtonDisabled} fullWidth>{tr("import")}</Button>
                        </Grid>
                    </Grid>
                </DialogContent>
            </Dialog>
            <Dialog open={dialogOpen === "settings"} onClose={() => { if (!dialogButtonDisabled) setDialogOpen(""); }} fullWidth>
                <DialogTitle><FontAwesomeIcon icon={faGears} />&nbsp;&nbsp;{tr("settings")}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: "5px" }}>
                        <Grid size={6}>
                            <UserSelect label={tr("user")} users={[{ ...Object.values(users).find(user => user.userid === tempListParam?.userid) }]} onUpdate={(user) => {
                                setTempListParam({ ...tempListParam, userid: user?.userid !== undefined ? user?.userid : null });
                            }} isMulti={false} allowDeselect={true} />
                        </Grid>
                        <Grid size={6}>
                            <TextField
                                label={tr("speed_limit_kmh")}
                                value={tempListParam.speed_limit}
                                onChange={(e) => { if (!isNaN(e.target.value)) setTempListParam({ ...tempListParam, speed_limit: e.target.value }); }}
                                fullWidth
                            />
                        </Grid>
                        <Grid size={6}>
                            <TextField select
                                label={tr("order_by")}
                                value={tempListParam.order_by}
                                onChange={(e) => { setTempListParam({ ...tempListParam, order_by: e.target.value }); }}
                                fullWidth
                            >
                                <MenuItem value="logid">{tr("log_id")}</MenuItem>
                                <MenuItem value="distance">{tr("distance")}</MenuItem>
                                <MenuItem value="fuel">{tr("fuel")}</MenuItem>
                                <MenuItem value="views">{tr("views")}</MenuItem>
                                <MenuItem value="max_speed">{tr("max_speed")}</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid size={6}>
                            <TextField select
                                label={tr("order")}
                                value={tempListParam.order}
                                onChange={(e) => { setTempListParam({ ...tempListParam, order: e.target.value }); }}
                                fullWidth
                            >
                                <MenuItem value="asc">{tr("ascending")}</MenuItem>
                                <MenuItem value="desc">{tr("descending")}</MenuItem>
                            </TextField>
                        </Grid>
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
                        <Grid size={6}>
                            <TextField select
                                label={tr("game")}
                                value={tempListParam.game}
                                onChange={(e) => { setTempListParam({ ...tempListParam, game: e.target.value }); }}
                                fullWidth
                            >
                                <MenuItem value="0">{tr("both")}</MenuItem>
                                <MenuItem value="1">{tr("ets2")}</MenuItem>
                                <MenuItem value="2">{tr("ats")}</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid size={6}>
                            <TextField select
                                label={tr("status")}
                                value={tempListParam.status}
                                onChange={(e) => { setTempListParam({ ...tempListParam, status: e.target.value }); }}
                                fullWidth
                            >
                                <MenuItem value="0">{tr("all")}</MenuItem>
                                <MenuItem value="1">{tr("delivered")}</MenuItem>
                                <MenuItem value="2">{tr("cancelled")}</MenuItem>
                            </TextField>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Box sx={{ width: "100%", padding: "16px", paddingTop: "0", display: "flex", justifyContent: "space-between" }}>
                        <Button variant="contained" onClick={() => { setDialogOpen(""); }}>{tr("cancel")}</Button>
                        <Button variant="contained" color="info" onClick={() => { setListParam(tempListParam); }}>{tr("update")}</Button>
                    </Box>
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
                <SpeedDialAction
                    key="export"
                    tooltipTitle={tr("export")}
                    icon={<FontAwesomeIcon icon={faFileExport} />}
                    onClick={() => { setDialogOpen("export"); }} />
                {checkUserPerm(curUserPerm, ["administrator", "import_dlogs"]) && <SpeedDialAction
                    key="import"
                    tooltipTitle={tr("import_trucky_jobs")}
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
        </>
    );
};

export default Deliveries;