import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';

import { Card, CardContent, Typography, Grid, Snackbar, Alert, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, FormControl, MenuItem, useTheme } from '@mui/material';
import { Portal } from '@mui/base';

import CustomTable from '../components/table';
import UserCard from '../components/usercard';
import TimeAgo from '../components/timeago';

import { makeRequestsAuto, customAxios as axios, getAuthToken, getMonthUTC } from '../functions';

var vars = require("../variables");

const columns = [
    { id: 'id', label: 'ID' },
    { id: 'type', label: 'Type' },
    { id: 'submit', label: 'Submit' },
    { id: 'update', label: 'Update' },
    { id: 'user', label: 'User' },
    { id: 'staff', label: 'Staff' },
    { id: 'status', label: 'Status' }
];

const ApplicationTable = memo(({ showDetail, doReload }) => {
    const [stats, setStats] = useState([]);
    const [applications, setApplications] = useState([]);

    const [totalItems, setTotalItems] = useState(0);
    const [page, setPage] = useState(-1);
    const [pageSize, setPageSize] = useState(10);

    const theme = useTheme();
    const STATUS = useMemo(() => { return { 0: <span style={{ color: theme.palette.info.main }}>Pending</span>, 1: <span style={{ color: theme.palette.success.main }}>Accepted</span>, 2: <span style={{ color: theme.palette.error.main }}>Declined</span> }; }, [theme]);

    useEffect(() => {
        async function doLoad() {
            const loadingStart = new CustomEvent('loadingStart', {});
            window.dispatchEvent(loadingStart);

            let [_pending, _accepted, _declined, _respondedM, _respondedAT, _applications] = [{}, {}];

            let myPage = page;
            if (myPage === -1) {
                myPage = 1;
            } else {
                myPage += 1;
            }

            if (page === -1 || +new Date() - doReload <= 1000) {
                [_pending, _accepted, _declined, _respondedM, _respondedAT, _applications] = await makeRequestsAuto([
                    { url: `${vars.dhpath}/applications/list?all_user=true&page=1&page_size=1&status=0`, auth: true },
                    { url: `${vars.dhpath}/applications/list?all_user=true&page=1&page_size=1&status=1`, auth: true },
                    { url: `${vars.dhpath}/applications/list?all_user=true&page=1&page_size=1&status=2`, auth: true },
                    { url: `${vars.dhpath}/applications/list?all_user=true&page=1&page_size=1&responded_by=${vars.userInfo.userid}&responded_after=${getMonthUTC() / 1000}`, auth: true },
                    { url: `${vars.dhpath}/applications/list?all_user=true&page=1&page_size=1&responded_by=${vars.userInfo.userid}`, auth: true },
                    { url: `${vars.dhpath}/applications/list?all_user=true&page=${myPage}&page_size=${pageSize}&order_by=submit_timestamp&order=desc`, auth: true },
                ]);
                setStats([_pending.total_items, _accepted.total_items, _declined.total_items, _respondedM.total_items, _respondedAT.total_items]);
            } else {
                [_applications] = await makeRequestsAuto([
                    { url: `${vars.dhpath}/applications/list?all_user=true&page=${myPage}&page_size=${pageSize}&order_by=submit_timestamp&order=desc`, auth: true },
                ]);
            }
            let newApplications = [];
            for (let i = 0; i < _applications.list.length; i++) {
                let app = _applications.list[i];
                newApplications.push({ id: app.applicationid, type: vars.applicationTypes[app.type]?.name ?? "Unknown", submit: <TimeAgo key={`${+new Date()}`} timestamp={app.submit_timestamp * 1000} />, update: <TimeAgo key={`${+new Date()}`} timestamp={app.respond_timestamp * 1000} />, user: <UserCard key={app.creator.uid} user={app.creator} />, staff: <UserCard key={app.last_respond_staff.uid} user={app.last_respond_staff} />, status: STATUS[app.status], application: app });
            }

            setApplications(newApplications);
            setTotalItems(_applications.total_items);

            const loadingEnd = new CustomEvent('loadingEnd', {});
            window.dispatchEvent(loadingEnd);
        }
        doLoad();
    }, [page, pageSize, STATUS, doReload]);

    function handleClick(data) {
        showDetail(data.application);
    }

    return <>
        {stats.length !== 0 && <Grid container spacing={2} style={{ marginBottom: "20px" }}>
            <Grid item xs={12} sm={12} md={6} lg={6}>
                <Card>
                    <CardContent>
                        <Typography variant="subtitle2" align="center" gutterBottom>
                            All Applications
                        </Typography>
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
                        <Typography variant="subtitle2" align="center" gutterBottom>
                            Handled by me
                        </Typography>
                        <Typography variant="h5" align="center" component="div">
                            {stats[3]} / {stats[4]}
                        </Typography>
                        <Typography variant="subtitle2" align="center" sx={{ mt: 1 }}>
                            This Month / All Time
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>}
        {applications.length > 0 && <CustomTable columns={columns} data={applications} totalItems={totalItems} rowsPerPageOptions={[10, 25, 50, 100]} defaultRowsPerPage={pageSize} onPageChange={setPage} onRowsPerPageChange={setPageSize} onRowClick={handleClick} />}
    </>;
});

const AllApplication = () => {
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
        const loadingStart = new CustomEvent('loadingStart', {});
        window.dispatchEvent(loadingStart);

        let resp = await axios({ url: `${vars.dhpath}/applications/${application.applicationid}`, method: "GET", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 200) {
            setDetailApp(resp.data);
            setNewStatus(String(resp.data.status));
            setMessage("");
            setDialogOpen(true);
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }

        const loadingEnd = new CustomEvent('loadingEnd', {});
        window.dispatchEvent(loadingEnd);
    }, []);

    const updateStatus = useCallback(async () => {
        setSubmitLoading(true);
        let resp = await axios({ url: `${vars.dhpath}/applications/${detailApp.applicationid}/status`, method: "PATCH", headers: { Authorization: `Bearer ${getAuthToken()}` }, data: { "status": newStatus, "message": message } });
        if (resp.status === 204) {
            setSnackbarContent("Status updated!");
            setSnackbarSeverity("success");
            setDoReload(+new Date());
            showDetail(detailApp);
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setSubmitLoading(false);
    }, [detailApp, newStatus, message, showDetail]);

    const deleteApp = useCallback(async () => {
        setSubmitLoading(true);
        let resp = await axios({ url: `${vars.dhpath}/applications/${detailApp.applicationid}`, method: "DELETE", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            setSnackbarContent("Application deleted!");
            setSnackbarSeverity("success");
            setDoReload(+new Date());
            setDialogOpen(false);
            setDialogDelete(false);
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setSubmitLoading(false);
    }, [detailApp]);

    return <>
        <ApplicationTable showDetail={showDetail} doReload={doReload}></ApplicationTable>
        {detailApp !== null && <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} >
            <DialogTitle>Application</DialogTitle>
            <DialogContent sx={{ minWidth: "400px" }}>
                <Typography variant="body2" sx={{ marginBottom: "5px" }}>
                    <b>Applicant: </b><UserCard user={detailApp.creator} /> (UID: {detailApp.creator.uid} | User ID: {detailApp.creator.userid})
                </Typography>
                <Typography variant="body2" sx={{ marginBottom: "5px" }}>
                    <b>Email: </b><a href={`mailto:${detailApp.creator.email}`} target="_blank" rel="noreferrer">{detailApp.creator.email}</a>
                </Typography>
                <Typography variant="body2" sx={{ marginBottom: "5px" }}>
                    <b>Discord: </b><a href={`https://discord.com/users/${detailApp.creator.discordid}`} target="_blank" rel="noreferrer">{detailApp.creator.discordid}</a>
                </Typography>
                <Typography variant="body2" sx={{ marginBottom: "5px" }}>
                    <b>Steam: </b><a href={`https://steamcommunity.com/profiles/${detailApp.creator.steamid}`} target="_blank" rel="noreferrer">{detailApp.creator.steamid}</a>
                </Typography>
                <Typography variant="body2" sx={{ marginBottom: "5px" }}>
                    <b>TruckersMP: </b><a href={`https://truckersmp.com/user/${detailApp.creator.truckersmpid}`} target="_blank" rel="noreferrer">{detailApp.creator.truckersmpid}</a>
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
                    label="Message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    multiline
                    rows="5"
                    fullWidth
                />
            </DialogContent>
            <DialogActions>
                <Button variant="primary" onClick={() => { setDialogOpen(false); }}>Close</Button>
                <Button variant="contained" color="error" onClick={() => { setDialogDelete(true); }}>Delete</Button>
                <TextField select label="Status" value={newStatus} onChange={(e) => setNewStatus(e.target.value)} sx={{ marginLeft: "10px", height: "40px" }} size="small">
                    <MenuItem key="0" value="0">
                        Pending
                    </MenuItem>
                    <MenuItem key="1" value="1">
                        Accepted
                    </MenuItem>
                    <MenuItem key="2" value="2">
                        Declined
                    </MenuItem>
                </TextField>
                <Button variant="contained" color="info" onClick={() => { updateStatus(); }} disabled={submitLoading || message.trim() === ""} >Respond</Button>
            </DialogActions>
        </Dialog>}
        <Dialog open={dialogDelete} onClose={() => setDialogDelete(false)}>
            <DialogTitle>Delete Application</DialogTitle>
            <DialogContent>
                <Typography variant="body2" sx={{ minWidth: "400px", marginBottom: "20px" }}>Are you sure you want to delete this application?</Typography>
            </DialogContent>
            <DialogActions>
                <Button variant="primary" onClick={() => { setDialogDelete(false); }}>Cancel</Button>
                <Button variant="contained" color="error" onClick={() => { deleteApp(); }} disabled={submitLoading}>Delete</Button>
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