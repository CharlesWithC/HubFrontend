import { useRef, useState, useEffect, useCallback, useMemo, useContext, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { AppContext } from '../../context';

import { Card, CardContent, Typography, Grid, Snackbar, Alert, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, MenuItem, Box, IconButton, useTheme } from '@mui/material';
import { CloseRounded } from '@mui/icons-material';
import { Portal } from '@mui/base';

import CustomTable from '../../components/table';
import UserCard from '../../components/usercard';
import TimeAgo from '../../components/timeago';
import MarkdownRenderer from '../../components/markdown';
import SponsorBadge from '../../components/sponsorBadge';
import UserSelect from '../../components/userselect';

import { makeRequestsAuto, customAxios as axios, getAuthToken, getMonthUTC, removeNUEValues } from '../../functions';

const ApplicationTable = memo(({ showDetail, doReload }) => {
    const { t: tr } = useTranslation();
    const { apiPath, vtcLevel, users, curUser, userSettings, applicationTypes, loadApplicationTypes } = useContext(AppContext);

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
                newApplications.push({ id: app.applicationid, type: localApplicationTypes ? (localApplicationTypes[app.type]?.name ?? tr("unknown")) : tr("unknown"), submit: <TimeAgo key={`${+new Date()}`} timestamp={app.submit_timestamp * 1000} />, update: <TimeAgo key={`${+new Date()}`} timestamp={app.respond_timestamp * 1000} />, user: <UserCard key={app.creator.uid} user={app.creator} />, staff: <UserCard key={app.last_respond_staff.uid} user={app.last_respond_staff} />, status: STATUS[app.status], application: app, statusInt: app.status });
            }

            if (pageRef.current === page) {
                setApplications(newApplications);
                setTotalItems(_applications.total_items);
            }

            window.loading -= 1;
        }
        doLoad();
    }, [apiPath, page, pageSize, STATUS, doReload, listParam]); // do not include applicationTypes to prevent rerender loop on network error

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
        {applications.length > 0 && <CustomTable page={page} columns={columns} order={listParam.order} orderBy={listParam.order_by} onOrderingUpdate={(order_by, order) => { setListParam({ ...listParam, order_by: order_by, order: order }); }} data={applications} totalItems={totalItems} rowsPerPageOptions={[10, 25, 50, 100]} defaultRowsPerPage={pageSize} onPageChange={setPage} onRowsPerPageChange={setPageSize} onRowClick={handleClick} />}
    </>;
});

const AllApplication = () => {
    const { t: tr } = useTranslation();
    const { apiPath, vtcLevel, allPerms, users, memberUIDs } = useContext(AppContext);
    const membersMapping = useMemo(() => (
        memberUIDs.reduce((acc, uid) => {
            acc[users[uid].userid] = users[uid];
            return acc;
        }, {})
    ), [memberUIDs, users]);
    const theme = useTheme();

    const [detailApp, setDetailApp] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogDelete, setDialogDelete] = useState(false);
    const [newStatus, setNewStatus] = useState(0);
    const [message, setMessage] = useState("");
    const [submitLoading, setSubmitLoading] = useState(false);
    const [doReload, setDoReload] = useState(0);

    const [assignTo, setAssignTo] = useState({});
    const [advancedStatus, setAdvancedStatus] = useState("");
    const [messageDisabled, setMessageDisabled] = useState(false);

    const [snackbarContent, setSnackbarContent] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const handleCloseSnackbar = useCallback(() => {
        setSnackbarContent("");
    }, []);

    const [tmpData, setTmpData] = useState(null);

    const showDetail = useCallback(async (application) => {
        window.loading += 1;

        setTmpData(null);

        let resp = await axios({ url: `${apiPath}/applications/${application.applicationid}`, method: "GET", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 200) {
            setDetailApp(resp.data);
            setNewStatus(String(resp.data.status));
            setMessage("");
            setDialogOpen(true);

            window.loading -= 1;

            if (!isNaN(resp.data.creator.truckersmpid)) {
                resp = await axios({ url: `https://corsproxy.io/?https://api.truckersmp.com/v2/player/${resp.data.creator.truckersmpid}` });
                if (resp.status === 200) {
                    setTmpData(resp.data.response);
                }
            }
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");

            window.loading -= 1;
        }
    }, [apiPath]);

    const updateStatus = useCallback(async () => {
        if (!messageDisabled && message.startsWith("[")) {
            setSnackbarContent("Message may not start with character '['.");
            setSnackbarSeverity("error");
            return;
        }
        setSubmitLoading(true);
        let resp = await axios({ url: `${apiPath}/applications/${detailApp.applicationid}/status`, method: "PATCH", headers: { Authorization: `Bearer ${getAuthToken()}` }, data: { "status": newStatus !== 3 ? newStatus : 1, "message": message } });
        if (resp.status === 204) {
            setSnackbarContent(tr("status_updated"));
            setSnackbarSeverity("success");
            setDoReload(+new Date());
            showDetail(detailApp);
            if (newStatus === 3) {
                let newRoles = [];
                let newUserID = -1;
                if ((detailApp.creator.userid === null || detailApp.creator.userid === -1)) {
                    let resp = await axios({ url: `${apiPath}/user/${detailApp.creator.uid}/accept`, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
                    if (resp.status === 200) {
                        newUserID = resp.data.userid;
                        newRoles = [allPerms.driver[0]];
                        setSnackbarContent(tr("user_accepted_as_member"));
                        setSnackbarSeverity("success");
                    } else {
                        setSnackbarContent(resp.data.error);
                        setSnackbarSeverity("error");
                        setDialogBtnDisabled(false);
                        return;
                    }
                } else {
                    // already member / add driver role
                    newRoles = detailApp.creator.roles;
                    newRoles.push(allPerms.driver[0]); // backend would auto de-duplicate
                    newUserID = detailApp.creator.userid;
                }

                let resp = await axios({ url: `${apiPath}/member/${newUserID}/roles`, method: "PATCH", data: { roles: newRoles }, headers: { Authorization: `Bearer ${getAuthToken()}` } });
                if (resp.status === 204) {
                    setSnackbarContent(tr("driver_role_assigned"));
                    setSnackbarSeverity("success");
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
    }, [apiPath, detailApp, newStatus, message, allPerms, messageDisabled]);

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
            <DialogTitle>
                {tr("application")}
                <IconButton style={{ position: 'absolute', right: '10px', top: '10px' }} onClick={() => setDialogOpen(false)}>
                    <CloseRounded />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ minWidth: "550px" }}>
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
                    {tmpData !== null && <>
                        {!tmpData.displayBans && <>&nbsp;({tr("punishments_hidden")})</>}
                        {tmpData.displayBans && <>
                            {!tmpData.banned && <>&nbsp;({tr("no_active_bans")})</>}
                            {tmpData.banned && <>
                                &nbsp;({tmpData.bansCount} {tr("active_bans")})</>}
                        </>}<br />
                        {tmpData.vtc.id !== 0 && <>
                            <b>{tr("current_vtc")}</b>: <a href={`https://truckersmp.com/vtc/${tmpData.vtc.id}`} target="_blank" rel="noreferrer">{tmpData.vtc.name}</a>
                        </>}
                        {tmpData.vtc.id === 0 && <>
                            <b>{tr("current_vtc")}</b>{tr("na")}</>}<br />
                        {tmpData.vtcHistory !== null && tmpData.vtcHistory.length !== 0 && <>
                            <b>{tr("vtc_history")} ({tmpData.vtcHistory.length})</b>: <>{tmpData.vtcHistory.map((vtc, index) => <><a href={`https://truckersmp.com/vtc/${vtc.id}`} target="_blank" rel="noreferrer">{vtc.name}</a> ({tr("left")} <TimeAgo timestamp={+new Date(vtc.leftDate)} rough={true}></TimeAgo>)<>{index !== tmpData.vtcHistory.length - 1 && `, `}</></>)}</>
                        </>}
                        {tmpData.vtcHistory !== null && tmpData.vtcHistory.length === 0 && <>
                            <b>{tr("vtc_history_0")}</b>{tr("na")}</>}
                        {tmpData.vtcHistory === null && <>
                            <b>{tr("vtc_history")}</b>: <i>Not available</i></>}
                    </>}
                    {tmpData === null && <><br />
                        <b>{tr("current_vtc")}</b>{tr("na")}<br />
                        <b>{tr("vtc_history_0")}</b>{tr("na")}</>
                    }
                </Typography>
                <br />
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
                <hr />
                <Typography variant="body2" fontWeight="bold" sx={{ mt: "5px", mb: "5px" }}>Advanced Response <SponsorBadge vtclevel={1} /></Typography>
                <Typography variant="body2" sx={{ mb: "5px" }}>
                    - The message will be automatically constructed when using advanced response. You still have to <span style={{ color: theme.palette.info.main }}>click "Respond"</span> to make the update. To <span style={{ color: theme.palette.info.main }}>clear the message</span>, click "Clear" in bottom-left.<br />
                    - To <span style={{ color: theme.palette.info.main }}>clear all status</span>, click "Clear" on the right of "Advanced status". The <span style={{ color: theme.palette.info.main }}>assignee</span>, if exists, otherwise <span style={{ color: theme.palette.info.main }}>N/A</span>, would show in status. To disable advanced status, set it to <span style={{ color: theme.palette.info.main }}>Pending</span>.<br />
                    - The "official status" would be locked to "Pending" when making advanced response.
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="body2">
                            Assign to
                            <UserSelect users={[assignTo]} isMulti={false} onUpdate={(e) => { setAssignTo(e); setMessage(`[AT-${e.uid}] Application assigned to: ${e.name}`); setNewStatus(0); setMessageDisabled(true); }} disabled={vtcLevel < 1} />
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography variant="body2">
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div>Advanced status</div>
                                <div><span style={{ cursor: "pointer" }} onClick={() => { setAdvancedStatus(""); setMessage(`[XAS] Application status updated to: N/A.`); setNewStatus(0); setMessageDisabled(true); }} disabled={vtcLevel < 1}>Clear</span></div>
                            </div>
                            <TextField value={advancedStatus} onChange={(e) => { setAdvancedStatus(e.target.value); setMessage(`[AS] Application status updated to: ${e.target.value}`); setNewStatus(0); setMessageDisabled(true); }} size="small" disabled={vtcLevel < 1} fullWidth
                            />
                        </Typography>
                    </Grid>
                </Grid>
                <hr />
                <Typography variant="body2" fontWeight="bold" sx={{ mb: "5px" }}>{tr("message")}</Typography>
                <TextField
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={messageDisabled}
                    multiline
                    rows="5"
                    fullWidth
                    InputProps={{
                        inputComponent: 'textarea',
                        inputProps: {
                            style: {
                                resize: 'vertical',
                                overflow: 'auto'
                            }
                        }
                    }}
                />
            </DialogContent>
            <DialogActions>
                <Grid container justifyContent="space-between" padding="10px">
                    <Grid item>
                        <Box sx={{ display: 'flex', gap: '10px' }}>
                            <Button variant="contained" color="error" onClick={() => { setDialogDelete(true); }}>{tr("delete")}</Button>
                            <Button variant="contained" color="secondary" onClick={() => { setMessage(""); setMessageDisabled(false); }}>{tr("clear")}</Button>
                        </Box>
                    </Grid>
                    <Grid item>
                        <Box sx={{ display: 'flex', gap: '10px' }}>
                            <TextField select label={tr("status")} value={newStatus} onChange={(e) => setNewStatus(e.target.value)} sx={{ marginLeft: "10px", height: "40px" }} size="small" disabled={messageDisabled}>
                                <MenuItem key={0} value={0}>{tr("pending")}</MenuItem>
                                <MenuItem key={1} value={1}>{tr("accepted")}</MenuItem>
                                <MenuItem key={2} value={2}>{tr("declined")}</MenuItem>
                                <MenuItem key={3} value={3}>{tr("accepted_as_driver")}</MenuItem>
                            </TextField>
                            <Button variant="contained" color="info" onClick={() => { updateStatus(); }} disabled={submitLoading || message.trim() === ""} >{tr("respond")}</Button>
                        </Box>
                    </Grid>
                </Grid>
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