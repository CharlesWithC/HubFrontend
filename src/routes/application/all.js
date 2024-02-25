import { useRef, useState, useEffect, useCallback, useMemo, useContext, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { AppContext } from '../../context';

import { Card, CardContent, Typography, Grid, Snackbar, Alert, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, MenuItem, useTheme } from '@mui/material';
import { Portal } from '@mui/base';

import CustomTable from '../../components/table';
import UserCard from '../../components/usercard';
import TimeAgo from '../../components/timeago';

import { makeRequestsAuto, customAxios as axios, getAuthToken, getMonthUTC, removeNUEValues } from '../../functions';

const ApplicationTable = memo(({ showDetail, doReload }) => {
    const { t: tr } = useTranslation();
    const { apiPath, curUser, userSettings, applicationTypes, loadApplicationTypes } = useContext(AppContext);

    const columns = useMemo(() => ([
        { id: 'id', label: 'ID', orderKey: 'applicationid', defaultOrder: 'desc' },
        { id: 'type', label: tr("type") },
        { id: 'submit', label: tr("submit_time"), orderKey: 'submit_timestamp', defaultOrder: 'desc' },
        { id: 'update', label: tr("update_time"), orderKey: 'respond_timestamp', defaultOrder: 'desc' },
        { id: 'user', label: tr("user_order_by_uid"), orderKey: 'applicant_uid', defaultOrder: 'desc' },
        { id: 'staff', label: tr("staff_order_by_user_id"), orderKey: 'respond_staff_userid', defaultOrder: 'desc' },
        { id: 'status', label: tr("status") }
    ]), []);

    const [stats, setStats] = useState([]);
    const [applications, setApplications] = useState([]);

    const inited = useRef(false);
    const [totalItems, setTotalItems] = useState(0);
    const [page, setPage] = useState(1);
    const pageRef = useRef(1);
    const [pageSize, setPageSize] = useState(userSettings.default_row_per_page);
    const [listParam, setListParam] = useState({ order_by: "applicationid", order: "desc" });

    const theme = useTheme();
    const STATUS = useMemo(() => { return { 0: <span style={{ color: theme.palette.info.main }}>{tr("pending")}</span>, 1: <span style={{ color: theme.palette.success.main }}>{tr("accepted")}</span>, 2: <span style={{ color: theme.palette.error.main }}>{tr("declined")}</span> }; }, [theme]);

    useEffect(() => {
        pageRef.current = page;
    }, [page]);
    useEffect(() => {
        async function doLoad() {
            window.loading += 1;

            let localApplicationTypes = applicationTypes;
            if (applicationTypes === null) {
                localApplicationTypes = await loadApplicationTypes();
            }

            let processedParam = removeNUEValues(listParam);

            let [_pending, _accepted, _declined, _respondedM, _respondedAT, _applications] = [{}, {}];

            if (!inited.current || +new Date() - doReload <= 1000) {
                [_pending, _accepted, _declined, _respondedM, _respondedAT, _applications] = await makeRequestsAuto([
                    { url: `${apiPath}/applications/list?all_user=true&page=1&page_size=1&status=0`, auth: true },
                    { url: `${apiPath}/applications/list?all_user=true&page=1&page_size=1&status=1`, auth: true },
                    { url: `${apiPath}/applications/list?all_user=true&page=1&page_size=1&status=2`, auth: true },
                    { url: `${apiPath}/applications/list?all_user=true&page=1&page_size=1&responded_by=${curUser.userid}&responded_after=${getMonthUTC() / 1000}`, auth: true },
                    { url: `${apiPath}/applications/list?all_user=true&page=1&page_size=1&responded_by=${curUser.userid}`, auth: true },
                    { url: `${apiPath}/applications/list?all_user=true&page=${page}&page_size=${pageSize}&${new URLSearchParams(processedParam).toString()}`, auth: true },
                ]);
                setStats([_pending.total_items, _accepted.total_items, _declined.total_items, _respondedM.total_items, _respondedAT.total_items]);
                inited.current = true;
            } else {
                [_applications] = await makeRequestsAuto([
                    { url: `${apiPath}/applications/list?all_user=true&page=${page}&page_size=${pageSize}&${new URLSearchParams(processedParam).toString()}`, auth: true },
                ]);
            }
            let newApplications = [];
            for (let i = 0; i < _applications.list.length; i++) {
                let app = _applications.list[i];
                newApplications.push({ id: app.applicationid, type: localApplicationTypes ? (localApplicationTypes[app.type]?.name ?? tr("unknown")) : tr("unknown"), submit: <TimeAgo key={`${+new Date()}`} timestamp={app.submit_timestamp * 1000} />, update: <TimeAgo key={`${+new Date()}`} timestamp={app.respond_timestamp * 1000} />, user: <UserCard key={app.creator.uid} user={app.creator} />, staff: <UserCard key={app.last_respond_staff.uid} user={app.last_respond_staff} />, status: STATUS[app.status], application: app });
            }

            if (pageRef.current === page) {
                setApplications(newApplications);
                setTotalItems(_applications.total_items);
            }

            window.loading -= 1;
        }
        doLoad();
    }, [apiPath, page, pageSize, STATUS, doReload, listParam]); // do not include applicationTypes to prevent rerender loop on network error

    function handleClick(data) {
        showDetail(data.application);
    }

    return <>
        {stats.length !== 0 && <Grid container spacing={2} style={{ marginBottom: "20px" }}>
            <Grid item xs={12} sm={12} md={6} lg={6}>
                <Card>
                    <CardContent>
                        <Typography variant="subtitle2" align="center" gutterBottom>{tr("all_applications")}</Typography>
                        <Typography variant="h5" align="center" component="div">
                            <span style={{ color: theme.palette.info.main }}>{stats[0]}</span> / <span style={{ color: theme.palette.success.main }}>{stats[1]}</span> / <span style={{ color: theme.palette.error.main }}>{stats[2]}</span>
                        </Typography>
                        <Typography variant="subtitle2" align="center" sx={{ mt: 1 }}>
                            {STATUS[0]} / {STATUS[1]} / {STATUS[2]}
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={6}>
                <Card>
                    <CardContent>
                        <Typography variant="subtitle2" align="center" gutterBottom>{tr("handled_by_me")}</Typography>
                        <Typography variant="h5" align="center" component="div">
                            {stats[3]} / {stats[4]}
                        </Typography>
                        <Typography variant="subtitle2" align="center" sx={{ mt: 1 }}>{tr("this_month_all_time")}</Typography>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>}
        {applications.length > 0 && <CustomTable columns={columns} order={listParam.order} orderBy={listParam.order_by} onOrderingUpdate={(order_by, order) => { setListParam({ ...listParam, order_by: order_by, order: order }); }} data={applications} totalItems={totalItems} rowsPerPageOptions={[10, 25, 50, 100]} defaultRowsPerPage={pageSize} onPageChange={setPage} onRowsPerPageChange={setPageSize} onRowClick={handleClick} />}
    </>;
});

const AllApplication = () => {
    const { t: tr } = useTranslation();
    const { apiPath, allPerms } = useContext(AppContext);

    const [detailApp, setDetailApp] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogDelete, setDialogDelete] = useState(false);
    const [newStatus, setNewStatus] = useState(0);
    const [message, setMessage] = useState("");
    const [submitLoading, setSubmitLoading] = useState(false);
    const [doReload, setDoReload] = useState(0);

    const [snackbarContent, setSnackbarContent] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const handleCloseSnackbar = useCallback(() => {
        setSnackbarContent("");
    }, []);

    const showDetail = useCallback(async (application) => {
        window.loading += 1;

        let resp = await axios({ url: `${apiPath}/applications/${application.applicationid}`, method: "GET", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 200) {
            setDetailApp(resp.data);
            setNewStatus(String(resp.data.status));
            setMessage("");
            setDialogOpen(true);
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }

        window.loading -= 1;
    }, [apiPath]);

    const updateStatus = useCallback(async () => {
        setSubmitLoading(true);
        let resp = await axios({ url: `${apiPath}/applications/${detailApp.applicationid}/status`, method: "PATCH", headers: { Authorization: `Bearer ${getAuthToken()}` }, data: { "status": newStatus !== "3" ? newStatus : "1", "message": message } });
        if (resp.status === 204) {
            setSnackbarContent(tr("status_updated"));
            setSnackbarSeverity("success");
            setDoReload(+new Date());
            showDetail(detailApp);
            if (newStatus === "3" && (detailApp.creator.userid === null || detailApp.creator.userid === -1)) {
                let resp = await axios({ url: `${apiPath}/user/${detailApp.creator.uid}/accept`, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
                if (resp.status === 200) {
                    let newUserID = resp.data.userid;
                    setSnackbarContent(tr("user_accepted_as_member"));
                    setSnackbarSeverity("success");

                    let resp = await axios({ url: `${apiPath}/member/${newUserID}/roles`, method: "PATCH", data: { roles: [allPerms.driver[0]] }, headers: { Authorization: `Bearer ${getAuthToken()}` } });
                    if (resp.status === 204) {
                        setSnackbarContent(tr("driver_role_assigned"));
                        setSnackbarSeverity("success");
                    } else {
                        setSnackbarContent(resp.data.error);
                        setSnackbarSeverity("error");
                        setDialogBtnDisabled(false);
                    }
                } else {
                    setSnackbarContent(resp.data.error);
                    setSnackbarSeverity("error");
                    setDialogBtnDisabled(false);
                }
            }
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setSubmitLoading(false);
    }, [apiPath, detailApp, newStatus, message, allPerms]);

    const deleteApp = useCallback(async () => {
        setSubmitLoading(true);
        let resp = await axios({ url: `${apiPath}/applications/${detailApp.applicationid}`, method: "DELETE", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            setSnackbarContent(tr("application_deleted"));
            setSnackbarSeverity("success");
            setDoReload(+new Date());
            setDialogOpen(false);
            setDialogDelete(false);
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setSubmitLoading(false);
    }, [apiPath, detailApp]);

    return <>
        <ApplicationTable showDetail={showDetail} doReload={doReload}></ApplicationTable>
        {detailApp !== null && <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} >
            <DialogTitle>{tr("application")}</DialogTitle>
            <DialogContent sx={{ minWidth: "400px" }}>
                <Typography variant="body2" sx={{ marginBottom: "5px" }}>
                    <b><>{tr("applicant")}</>: </b><UserCard user={detailApp.creator} /> (<>UID</>: {detailApp.creator.uid} | <>{tr("user_id")}</>: {detailApp.creator.userid})
                </Typography>
                <Typography variant="body2" sx={{ marginBottom: "5px" }}>
                    <b><>{tr("email")}</>: </b><a href={`mailto:${detailApp.creator.email}`} target="_blank" rel="noreferrer">{detailApp.creator.email}</a>
                </Typography>
                <Typography variant="body2" sx={{ marginBottom: "5px" }}>
                    <b><>Discord</>: </b><a href={`https://discord.com/users/${detailApp.creator.discordid}`} target="_blank" rel="noreferrer">{detailApp.creator.discordid}</a>
                </Typography>
                <Typography variant="body2" sx={{ marginBottom: "5px" }}>
                    <b><>Steam</>: </b><a href={`https://steamcommunity.com/profiles/${detailApp.creator.steamid}`} target="_blank" rel="noreferrer">{detailApp.creator.steamid}</a>
                </Typography>
                <Typography variant="body2" sx={{ marginBottom: "5px" }}>
                    <b><>TruckersMP</>: </b><a href={`https://truckersmp.com/user/${detailApp.creator.truckersmpid}`} target="_blank" rel="noreferrer">{detailApp.creator.truckersmpid}</a>
                </Typography>
                <br />
                {Object.entries(detailApp.application).map(([question, answer]) => (
                    <>
                        <Typography variant="body" sx={{ marginBottom: "5px" }}>
                            <b>{question}</b>
                        </Typography>
                        <Typography variant="body2" sx={{ marginBottom: "15px", wordWrap: "break-word" }}>
                            {answer}
                        </Typography>
                    </>
                ))}
                <hr />
                <TextField
                    label={tr("message")}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    multiline
                    rows="5"
                    fullWidth
                />
            </DialogContent>
            <DialogActions>
                <Button variant="primary" onClick={() => { setDialogOpen(false); }}>{tr("close")}</Button>
                <Button variant="contained" color="error" onClick={() => { setDialogDelete(true); }}>{tr("delete")}</Button>
                <TextField select label={tr("status")} value={newStatus} onChange={(e) => setNewStatus(e.target.value)} sx={{ marginLeft: "10px", height: "40px" }} size="small">
                    <MenuItem key="0" value="0">{tr("pending")}</MenuItem>
                    <MenuItem key="1" value="1">{tr("accepted")}</MenuItem>
                    <MenuItem key="2" value="2">{tr("declined")}</MenuItem>
                    <MenuItem key="3" value="3">{tr("accepted_as_driver")}</MenuItem>
                </TextField>
                <Button variant="contained" color="info" onClick={() => { updateStatus(); }} disabled={submitLoading || message.trim() === ""} >{tr("respond")}</Button>
            </DialogActions>
        </Dialog>}
        <Dialog open={dialogDelete} onClose={() => setDialogDelete(false)}>
            <DialogTitle>{tr("delete_application")}</DialogTitle>
            <DialogContent>
                <Typography variant="body2" sx={{ minWidth: "400px", marginBottom: "20px" }}>{tr("confirm_delete_application")}</Typography>
            </DialogContent>
            <DialogActions>
                <Button variant="primary" onClick={() => { setDialogDelete(false); }}>{tr("cancel")}</Button>
                <Button variant="contained" color="error" onClick={() => { deleteApp(); }} disabled={submitLoading}>{tr("delete")}</Button>
            </DialogActions>
        </Dialog>
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
        </Portal></>;
};

export default AllApplication;