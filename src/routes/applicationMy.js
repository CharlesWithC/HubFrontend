import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';

import { Card, CardContent, Typography, Grid, Snackbar, Alert, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, useTheme } from '@mui/material';
import { Portal } from '@mui/base';

import CustomTable from '../components/table';
import UserCard from '../components/usercard';
import TimeAgo from '../components/timeago';

import { makeRequestsAuto, customAxios as axios, getAuthToken, removeNUEValues } from '../functions';

var vars = require("../variables");

const columns = [
    { id: 'id', label: 'ID', orderKey: 'applicationid', defaultOrder: 'desc' },
    { id: 'type', label: 'Type', orderKey: 'type', defaultOrder: 'asc' },
    { id: 'submit', label: 'Submit Time', orderKey: 'submit_timestamp', defaultOrder: 'desc' },
    { id: 'update', label: 'Update Time', orderKey: 'respond_timestamp', defaultOrder: 'desc' },
    { id: 'staff', label: 'Staff (Order by User ID)', orderKey: 'respond_staff_userid', defaultOrder: 'desc' },
    { id: 'status', label: 'Status', orderKey: 'status', defaultOrder: 'asc' }
];

const ApplicationTable = memo(({ showDetail }) => {
    const [recent, setRecent] = useState([]);
    const [applications, setApplications] = useState(null);

    const [totalItems, setTotalItems] = useState(0);
    const [page, setPage] = useState(-1);
    const [pageSize, setPageSize] = useState(10);
    const [listParam, setListParam] = useState({ order_by: "applicationid", order: "desc" });

    const theme = useTheme();
    const STATUS = useMemo(() => { return { 0: <span style={{ color: theme.palette.info.main }}>Pending</span>, 1: <span style={{ color: theme.palette.success.main }}>Accepted</span>, 2: <span style={{ color: theme.palette.error.main }}>Declined</span> }; }, [theme]);

    useEffect(() => {
        async function doLoad() {
            const loadingStart = new CustomEvent('loadingStart', {});
            window.dispatchEvent(loadingStart);

            let processedParam = removeNUEValues(listParam);

            let [_recent, _applications] = [{}, {}];

            let myPage = page;
            if (myPage === -1) {
                myPage = 1;
            } else {
                myPage += 1;
            }

            if (page === -1) {
                [_recent, _applications] = await makeRequestsAuto([
                    { url: `${vars.dhpath}/applications/list?page=1&page_size=2&order_by=submit_timestamp&order=desc`, auth: true },
                    { url: `${vars.dhpath}/applications/list?page=${myPage}&page_size=${pageSize}&${new URLSearchParams(processedParam).toString()}`, auth: true },
                ]);
                setRecent(_recent.list);
            } else {
                [_applications] = await makeRequestsAuto([
                    { url: `${vars.dhpath}/applications/list?page=${myPage}&page_size=${pageSize}&${new URLSearchParams(processedParam).toString()}`, auth: true },
                ]);
            }
            let newApplications = [];
            for (let i = 0; i < _applications.list.length; i++) {
                let app = _applications.list[i];
                newApplications.push({ id: app.applicationid, type: vars.applicationTypes[app.type]?.name ?? "Unknown", submit: <TimeAgo key={`${+new Date()}`} timestamp={app.submit_timestamp * 1000} />, update: <TimeAgo key={`${+new Date()}`} timestamp={app.respond_timestamp * 1000} />, staff: <UserCard user={app.last_respond_staff} />, status: STATUS[app.status], application: app });
            }

            setApplications(newApplications);
            setTotalItems(_applications.total_items);

            const loadingEnd = new CustomEvent('loadingEnd', {});
            window.dispatchEvent(loadingEnd);
        }
        doLoad();
    }, [page, pageSize, STATUS, listParam]);

    function handleClick(data) {
        showDetail(data.application);
    }

    return <>
        {recent.length !== 0 && <Grid container spacing={2} style={{ marginBottom: "20px" }}>
            <Grid item xs={12} sm={12} md={recent.length === 2 ? 6 : 12} lg={recent.length === 2 ? 6 : 12}>
                <Card>
                    <CardContent>
                        <Typography variant="subtitle2" gutterBottom>
                            Recent {vars.applicationTypes[recent[0].type].name} Application
                        </Typography>
                        <Typography variant="h5" component="div">
                            {STATUS[recent[0].status]}
                        </Typography>
                        <Typography variant="subtitle2" sx={{ mt: 1 }}>
                            Last Responded: <TimeAgo key={`${+new Date()}`} timestamp={recent[0].respond_timestamp * 1000} />
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
            {recent.length === 2 &&
                <Grid item xs={12} sm={12} md={6} lg={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="subtitle2" gutterBottom>
                                Recent {vars.applicationTypes[recent[1].type].name} Application
                            </Typography>
                            <Typography variant="h5" component="div">
                                {STATUS[recent[1].status]}
                            </Typography>
                            <Typography variant="subtitle2" sx={{ mt: 1 }}>
                                Last Responded: <TimeAgo key={`${+new Date()}`} timestamp={recent[1].respond_timestamp * 1000} />
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            }
        </Grid>}
        {applications !== null && <CustomTable columns={columns} order={listParam.order} orderBy={listParam.order_by} onOrderingUpdate={(order_by, order) => { setListParam({ ...listParam, order_by: order_by, order: order }); }} data={applications} totalItems={totalItems} rowsPerPageOptions={[10, 25, 50, 100]} defaultRowsPerPage={pageSize} onPageChange={setPage} onRowsPerPageChange={setPageSize} onRowClick={handleClick} />}
    </>;
});

const MyApplication = () => {
    const [detailApp, setDetailApp] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [submitLoading, setSubmitLoading] = useState(false);

    const [snackbarContent, setSnackbarContent] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const handleCloseSnackbar = useCallback(() => {
        setSnackbarContent("");
    }, []);

    const showDetail = useCallback(async (application) => {
        const loadingStart = new CustomEvent('loadingStart', {});
        window.dispatchEvent(loadingStart);

        setMessage("");

        let resp = await axios({ url: `${vars.dhpath}/applications/${application.applicationid}`, method: "GET", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 200) {
            setDetailApp(resp.data);
            setDialogOpen(true);
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }

        const loadingEnd = new CustomEvent('loadingEnd', {});
        window.dispatchEvent(loadingEnd);
    }, []);

    const addMessage = useCallback(async () => {
        setSubmitLoading(true);
        let resp = await axios({ url: `${vars.dhpath}/applications/${detailApp.applicationid}/message`, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` }, data: { "message": message } });
        if (resp.status === 204) {
            setSnackbarContent("Message added!");
            setSnackbarSeverity("success");
            showDetail(detailApp);
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setSubmitLoading(false);
    }, [detailApp, message, showDetail]);

    return <>
        <ApplicationTable showDetail={showDetail}></ApplicationTable>
        {detailApp !== null && <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} >
            <DialogTitle>Application</DialogTitle>
            <DialogContent sx={{ minWidth: "400px" }}>
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
                <div style={{ display: detailApp.status !== 0 ? "none" : "block" }}>
                    <hr />
                    <TextField
                        label="Add Message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        multiline
                        rows="5"
                        fullWidth
                    />
                </div>
            </DialogContent>
            <DialogActions>
                <Button variant="primary" onClick={() => { setDialogOpen(false); }}>Close</Button>
                <Button variant="contained" color="info" onClick={() => { addMessage(); }} disabled={submitLoading || message.trim() === ""} sx={{ display: detailApp.status !== 0 ? "none" : "block" }}>Respond</Button>
            </DialogActions>
        </Dialog>}
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

export default MyApplication;