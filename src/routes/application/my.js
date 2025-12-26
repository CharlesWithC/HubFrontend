import { useRef, useState, useEffect, useCallback, useMemo, useContext, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { AppContext } from '../../context';

import { Card, CardContent, Typography, Grid, Snackbar, Alert, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, IconButton, Box, useTheme } from '@mui/material';
import { CloseRounded } from '@mui/icons-material';
import Portal from '@mui/material/Portal';

import CustomTable from '../../components/table';
import UserCard from '../../components/usercard';
import TimeDelta from '../../components/timedelta';
import MarkdownRenderer from '../../components/markdown';

import { makeRequestsAuto, customAxios as axios, getAuthToken, removeNUEValues } from '../../functions';

const ApplicationTable = memo(({ showDetail }) => {
    const { t: tr } = useTranslation();
    const { apiPath, vtcLevel, users, userSettings, applicationTypes, loadApplicationTypes } = useContext(AppContext);

    const columns = [
        { id: 'id', label: 'ID', orderKey: 'applicationid', defaultOrder: 'desc' },
        { id: 'type', label: tr("type") },
        { id: 'submit', label: tr("submit_time"), orderKey: 'submit_timestamp', defaultOrder: 'desc' },
        { id: 'update', label: tr("update_time"), orderKey: 'respond_timestamp', defaultOrder: 'desc' },
        { id: 'staff', label: tr("staff_order_by_user_id"), orderKey: 'respond_staff_userid', defaultOrder: 'desc' },
        { id: 'status', label: tr("status") }
    ];

    const [recent, setRecent] = useState([]);
    const [applications, setApplications] = useState(null);

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

            let [_recent, _applications] = [{}, {}];

            if (!inited.current) {
                [_recent, _applications] = await makeRequestsAuto([
                    { url: `${apiPath}/applications/list?page=1&page_size=2&order_by=submit_timestamp&order=desc`, auth: true },
                    { url: `${apiPath}/applications/list?page=${page}&page_size=${pageSize}&${new URLSearchParams(processedParam).toString()}`, auth: true },
                ]);
                setRecent(_recent.list);
                inited.current = true;
            } else {
                [_applications] = await makeRequestsAuto([
                    { url: `${apiPath}/applications/list?page=${page}&page_size=${pageSize}&${new URLSearchParams(processedParam).toString()}`, auth: true },
                ]);
            }
            let newApplications = [];
            for (let i = 0; i < _applications.list.length; i++) {
                let app = _applications.list[i];
                newApplications.push({ id: app.applicationid, type: localApplicationTypes ? (localApplicationTypes[app.type]?.name ?? tr("unknown")) : tr("unknown"), submit: <TimeDelta key={`${+new Date()}`} timestamp={app.submit_timestamp * 1000} />, update: <TimeDelta key={`${+new Date()}`} timestamp={app.respond_timestamp * 1000} />, staff: <UserCard user={app.last_respond_staff} />, status: STATUS[app.status], application: app, statusInt: app.status });
            }

            if (pageRef.current === page) {
                setApplications(newApplications);
                setTotalItems(_applications.total_items);
            }

            window.loading -= 1;
        }
        doLoad();
    }, [apiPath, page, pageSize, STATUS, listParam]); // do not include applicationTypes to prevent rerender loop on network error

    useEffect(() => {
        async function loadAdvancedStatus() {
            for (let i = 0; i < applications.length; i++) {
                if (applications[i].statusInt === 0) {
                    let resp = await axios({ url: `${apiPath}/applications/${applications[i].id}`, method: "GET", headers: { Authorization: `Bearer ${getAuthToken()}` } });
                    if (resp.status === 200) {
                        let advancedStatus = false, assignee = false;
                        Object.entries(resp.data.application).map(([_, answer]) => {
                            const matcha1 = answer.match(/\[AT-(\d+)\] .*: (.*)/);
                            if (matcha1) {
                                assignee = <>Assigned to {users[matcha1[1]] !== undefined && <UserCard user={users[matcha1[1]]} />}{users[matcha1[1]] === undefined && <>{matcha1[2]}</>}</>;
                            } else {
                                const matcha2 = answer.match(/\[AS\] .*: (.*)/);
                                if (matcha2) {
                                    advancedStatus = <>{matcha2[1]}</>;
                                } else {
                                    const matcha3 = answer.match(/\[XAS\] .*: (.*)/);
                                    if (matcha3) {
                                        advancedStatus = undefined;
                                    }
                                }
                            }
                        });
                        let status = <>{STATUS[applications[i].statusInt]}</>;
                        if (advancedStatus && assignee) {
                            status = <span style={{ color: theme.palette.info.main }}>{advancedStatus} ({assignee})</span>;
                        } else if (advancedStatus && !assignee) {
                            status = <span style={{ color: theme.palette.info.main }}>{advancedStatus}</span>;
                        } else if (!advancedStatus && assignee) {
                            if (advancedStatus === undefined) status = <span style={{ color: theme.palette.info.main }}>{assignee}</span>;
                            else status = <span style={{ color: theme.palette.info.main }}>{status} ({assignee})</span>;
                        } else {
                            if (advancedStatus === undefined) status = <span style={{ color: theme.palette.info.main }}>N/A</span>;
                            // else just status
                        }
                        setApplications((prev) => {
                            let newApps = [...prev];
                            newApps[i].status = status;
                            newApps[i].statusInt = -1;
                            return newApps;
                        });
                        return;
                        // we'll return here and this function would be run again since applications changed
                        // if we don't return there'll be duplicate requests
                    } else {
                        setApplications((prev) => {
                            let newApps = [...prev];
                            newApps[i].statusInt = -1; // mark as -1 to not try again
                            return newApps;
                        });
                        return;
                    }
                }
            }
        }
        if (applications !== null && vtcLevel >= 1) {
            loadAdvancedStatus();
        }
    }, [applications]);

    function handleClick(data) {
        showDetail(data.application);
    }

    return (
        <>
            {recent.length !== 0 && <Grid container spacing={2} style={{ marginBottom: "20px" }}>
                <Grid
                    size={{
                        xs: 12,
                        sm: 12,
                        md: recent.length === 2 ? 6 : 12,
                        lg: recent.length === 2 ? 6 : 12
                    }}>
                    <Card>
                        <CardContent>
                            <Typography variant="subtitle2" gutterBottom>{tr("recent")} {applicationTypes !== null && applicationTypes[recent[0].type] ? applicationTypes[recent[0].type].name : tr("unknown")} {tr("application")}</Typography>
                            <Typography variant="h5" component="div">
                                {STATUS[recent[0].status]}
                            </Typography>
                            <Typography variant="subtitle2" sx={{ mt: 1 }}>
                                <>{tr("last_responded")}</>: <TimeDelta key={`${+new Date()}`} timestamp={recent[0].respond_timestamp * 1000} />
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                {recent.length === 2 &&
                    <Grid
                        size={{
                            xs: 12,
                            sm: 12,
                            md: 6,
                            lg: 6
                        }}>
                        <Card>
                            <CardContent>
                                <Typography variant="subtitle2" gutterBottom>{tr("recent")} {applicationTypes !== null && applicationTypes[recent[1].type] ? applicationTypes[recent[1].type].name : tr("unknown")} {tr("application")}</Typography>
                                <Typography variant="h5" component="div">
                                    {STATUS[recent[1].status]}
                                </Typography>
                                <Typography variant="subtitle2" sx={{ mt: 1 }}>
                                    <>{tr("last_responded")}</>: <TimeDelta key={`${+new Date()}`} timestamp={recent[1].respond_timestamp * 1000} />
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                }
            </Grid>}
            {applications !== null && <CustomTable page={page} columns={columns} order={listParam.order} orderBy={listParam.order_by} onOrderingUpdate={(order_by, order) => { setListParam({ ...listParam, order_by: order_by, order: order }); }} data={applications} totalItems={totalItems} rowsPerPageOptions={[10, 25, 50, 100]} defaultRowsPerPage={pageSize} onPageChange={setPage} onRowsPerPageChange={setPageSize} onRowClick={handleClick} />}
        </>
    );
});

const MyApplication = () => {
    const { t: tr } = useTranslation();
    const { apiPath, vtcLevel, users, memberUIDs } = useContext(AppContext);
    const membersMapping = useMemo(() => (
        memberUIDs.reduce((acc, uid) => {
            acc[users[uid].userid] = users[uid];
            return acc;
        }, {})
    ), [memberUIDs, users]);

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
        window.loading += 1;

        setMessage("");

        let resp = await axios({ url: `${apiPath}/applications/${application.applicationid}`, method: "GET", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 200) {
            setDetailApp(resp.data);
            setDialogOpen(true);
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }

        window.loading -= 1;
    }, [apiPath]);

    const addMessage = useCallback(async () => {
        if (message.startsWith("[")) {
            setSnackbarContent("Message may not start with character '['.");
            setSnackbarSeverity("error");
            return;
        }
        setSubmitLoading(true);
        let resp = await axios({ url: `${apiPath}/applications/${detailApp.applicationid}/message`, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` }, data: { "message": message } });
        if (resp.status === 204) {
            setSnackbarContent(tr("message_added"));
            setSnackbarSeverity("success");
            showDetail(detailApp);
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setSubmitLoading(false);
    }, [apiPath, detailApp, message]);

    return (
        <>
            <ApplicationTable showDetail={showDetail}></ApplicationTable>
            {detailApp !== null && <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} >
                <DialogTitle>
                    {tr("application")}
                    <IconButton style={{ position: 'absolute', right: '10px', top: '10px' }} onClick={() => setDialogOpen(false)}>
                        <CloseRounded />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ minWidth: "550px" }}>
                    {Object.entries(detailApp.application).map(([question, answer]) => {
                        const matchq = question.match(/\[Message\] (.*) \((\d+)\) #(\d+)/);
                        if (matchq) {
                            question = <>Message from {membersMapping[matchq[2]] !== undefined && <UserCard user={membersMapping[matchq[2]]} />}{membersMapping[matchq[2]] === undefined && <>{matchq[1]}</>}</>;
                        }
                        if (vtcLevel >= 1) {
                            const matcha1 = answer.match(/\[AT-(\d+)\] .*: (.*)/);
                            if (matcha1) {
                                answer = <>Application assigned to {users[matcha1[1]] !== undefined && <UserCard user={users[matcha1[1]]} />}{users[matcha1[1]] === undefined && <>{matcha1[2]}</>}</>;
                            } else {
                                const matcha2 = answer.match(/\[AS\] .*: (.*)/);
                                if (matcha2) {
                                    answer = <>Application status updated to: {matcha2[1]}</>;
                                } else {
                                    const matcha3 = answer.match(/\[XAS\] .*: (.*)/);
                                    if (matcha3) {
                                        answer = <>Application status cleared.</>;
                                    } else {
                                        answer = <MarkdownRenderer>{answer}</MarkdownRenderer>;
                                    }
                                }
                            }
                        } else {
                            answer = <MarkdownRenderer>{answer}</MarkdownRenderer>;
                        }
                        return <>
                            <Typography variant="body" sx={{ marginBottom: "5px" }}>
                                <b>{question}</b>
                            </Typography>
                            <Typography variant="body2" sx={{ marginBottom: "15px", wordWrap: "break-word" }}>
                                {answer}
                            </Typography>
                        </>;
                    })}
                    <div style={{ display: detailApp.status !== 0 ? "none" : "block" }}>
                        <hr />
                        <Typography variant="body2" fontWeight="bold" sx={{ mb: "5px" }}>{tr("message")}</Typography>
                        <TextField
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            multiline
                            rows="5"
                            fullWidth
                        />
                    </div>
                </DialogContent>
                <DialogActions>
                    <Box sx={{ padding: "10px" }}>
                        <Button variant="contained" color="info" onClick={() => { addMessage(); }} disabled={submitLoading || message.trim() === ""} sx={{ display: detailApp.status !== 0 ? "none" : "block" }}>{tr("respond")}</Button>
                    </Box>
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
            </Portal></>
    );
};

export default MyApplication;