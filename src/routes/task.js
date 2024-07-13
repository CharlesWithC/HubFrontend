import { useRef, useState, useEffect, useCallback, useMemo, useContext, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { AppContext } from '../context';

import { Card, CardContent, Typography, Grid, Snackbar, Alert, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, IconButton, ButtonGroup, useTheme } from '@mui/material';
import { CloseRounded } from '@mui/icons-material';
import { Portal } from '@mui/base';

import CustomTable from '../components/table';
import UserCard from '../components/usercard';
import TimeDelta from '../components/timedelta';
import MarkdownRenderer from '../components/markdown';

import { makeRequestsAuto, customAxios as axios, getAuthToken, removeNUEValues } from '../functions';
import { checkPerm } from '../functions';

const TaskTable = memo(({ showDetail, reload }) => {
    const { t: tr } = useTranslation();
    const { apiPath, userSettings } = useContext(AppContext);

    const columns = [
        { id: 'id', label: 'ID', orderKey: 'taskid', defaultOrder: 'desc' },
        { id: 'title', label: tr("title"), orderKey: "title", defaultOrder: "asc" },
        { id: 'priority', label: "Priority", orderKey: 'priority', defaultOrder: 'asc' },
        { id: 'due_timestamp', label: "Due Date", orderKey: 'due_timestamp', defaultOrder: 'asc' },
        { id: 'status', label: tr("status") }
    ];

    const theme = useTheme();
    const PRIORITY_STRING = ["Very High", "High", "Normal", "Low", "Very Low"];
    const PRIORITY_COLOR = [theme.palette.error.main, theme.palette.warning.main, theme.palette.info.main, theme.palette.success.main, theme.palette.success.light];
    const STATUS_CONVERT = [[0, 2], [1, 2]]; // [mark_completed, confirm_completed]
    const STATUS = useMemo(() => { return { 0: <span style={{ color: theme.palette.warning.main }}>Pending</span>, 1: <span style={{ color: theme.palette.info.main }}>Submitted</span>, 2: <span style={{ color: theme.palette.success.main }}>Completed</span> }; }, [theme]);

    const [due, setDue] = useState([]);
    const [tasks, setTasks] = useState(null);

    const inited = useRef(false);
    const [totalItems, setTotalItems] = useState(0);
    const [page, setPage] = useState(1);
    const pageRef = useRef(1);
    const [pageSize, setPageSize] = useState(userSettings.default_row_per_page);
    const [listParam, setListParam] = useState({ order_by: "priority", order: "asc" });


    useEffect(() => {
        pageRef.current = page;
    }, [page]);
    useEffect(() => {
        async function doLoad() {
            window.loading += 1;

            let processedParam = removeNUEValues(listParam);

            let [_due, _tasks] = [{}, {}];

            if (!inited.current) {
                [_due, _tasks] = await makeRequestsAuto([
                    { url: `${apiPath}/tasks/list?page=1&page_size=2&order_by=due_timestamp&order=asc`, auth: true },
                    { url: `${apiPath}/tasks/list?page=${page}&page_size=${pageSize}&${new URLSearchParams(processedParam).toString()}`, auth: true },
                ]);
                setDue(_due.list);
                inited.current = true;
            } else {
                [_tasks] = await makeRequestsAuto([
                    { url: `${apiPath}/tasks/list?page=${page}&page_size=${pageSize}&${new URLSearchParams(processedParam).toString()}`, auth: true },
                ]);
            }
            let newTasks = [];
            for (let i = 0; i < _tasks.list.length; i++) {
                let task = _tasks.list[i];
                newTasks.push({ id: task.taskid, title: task.title, priority: <span style={{ color: PRIORITY_COLOR[task.priority] }}>{PRIORITY_STRING[task.priority]}</span>, due_timestamp: <TimeDelta key={`${+new Date()}`} timestamp={task.due_timestamp * 1000} />, status: STATUS[STATUS_CONVERT[+task.mark_completed][+task.confirm_completed]], task: task });
            }

            if (pageRef.current === page) {
                setTasks(newTasks);
                setTotalItems(_tasks.total_items);
            }

            window.loading -= 1;
        }
        doLoad();
    }, [reload, apiPath, page, pageSize, listParam]); // do not include taskTypes to prevent rerender loop on network error

    function handleClick(data) {
        showDetail(data.task);
    }

    return <>
        {due.length !== 0 && <Grid container spacing={2} style={{ marginBottom: "20px" }}>
            <Grid item xs={12} sm={12} md={due.length === 2 ? 6 : 12} lg={due.length === 2 ? 6 : 12}>
                <Card>
                    <CardContent>
                        <Typography variant="body2" gutterBottom>Todo #1</Typography>
                        <Typography variant="h5" component="div">
                            {due[0].title}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                            <>Due</>: <TimeDelta key={`${+new Date()}`} timestamp={due[0].due_timestamp * 1000} />
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
            {due.length === 2 &&
                <Grid item xs={12} sm={12} md={6} lg={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="body2" gutterBottom>Todo #2</Typography>
                            <Typography variant="h5" component="div">
                                {due[1].title}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                                <>Due</>: <TimeDelta key={`${+new Date()}`} timestamp={due[1].due_timestamp * 1000} />
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            }
        </Grid>}
        {tasks !== null && <CustomTable page={page} columns={columns} order={listParam.order} orderBy={listParam.order_by} onOrderingUpdate={(order_by, order) => { setListParam({ ...listParam, order_by: order_by, order: order }); }} data={tasks} totalItems={totalItems} rowsPerPageOptions={[10, 25, 50, 100]} defaultRowsPerPage={pageSize} onPageChange={setPage} onRowsPerPageChange={setPageSize} onRowClick={handleClick} />}
    </>;
});

const Task = () => {
    const { t: tr } = useTranslation();
    const { apiPath, curUser, allRoles, allPerms } = useContext(AppContext);

    const [reload, setReload] = useState(0);
    const [detailTask, setDetailTask] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const [isTaskAssignee, setIsTaskAssignee] = useState(false);
    const [isTaskManager, setIsTaskManager] = useState(false);

    const [snackbarContent, setSnackbarContent] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const handleCloseSnackbar = useCallback(() => {
        setSnackbarContent("");
    }, []);

    const theme = useTheme();
    const PRIORITY_STRING = ["Very High", "High", "Normal", "Low", "Very Low"];
    const PRIORITY_COLOR = [theme.palette.error.main, theme.palette.warning.main, theme.palette.info.main, theme.palette.success.main, theme.palette.success.light];

    const showDetail = useCallback(async (task) => {
        window.loading += 1;
        setButtonDisabled(true);

        let resp = await axios({ url: `${apiPath}/tasks/${task.taskid}`, method: "GET", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 200) {
            setDetailTask(resp.data);
            setDialogOpen(true);

            let task = resp.data;
            setIsTaskAssignee(task.assign_mode === 0 && curUser.userid === task.creator.userid ||
                task.assign_mode === 1 && task.assign_to.includes(curUser.userid) ||
                task.assign_mode === 2 && task.assign_to.some(role => curUser.roles.includes(role)));
            setIsTaskManager(task.creator.userid === curUser.userid || checkPerm(curUser.roles, ["manage_public_tasks"], allPerms));
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }

        setButtonDisabled(false);
        window.loading -= 1;
    }, [apiPath, curUser, allPerms]);

    const markAsCompleted = useCallback(async (mark) => {
        window.loading += 1;
        setButtonDisabled(true);

        let resp = await axios({ url: `${apiPath}/tasks/${detailTask.taskid}/complete/mark`, method: mark ? "PUT" : "DELETE", headers: { Authorization: `Bearer ${getAuthToken()}` }, data: { note: "" } });
        if (resp.status === 204) {
            setSnackbarContent(tr("success"));
            setSnackbarSeverity("success");
            showDetail(detailTask);
            setReload(+new Date());
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }

        setButtonDisabled(false);
        window.loading -= 1;
    }, [apiPath, detailTask]);

    const confirmAsCompleted = useCallback(async (confirm) => {
        window.loading += 1;

        let resp = await axios({ url: `${apiPath}/tasks/${detailTask.taskid}/complete/${confirm ? "accept" : "reject"}`, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` }, data: { note: "" } });
        if (resp.status === 204) {
            setSnackbarContent(tr("success"));
            setSnackbarSeverity("success");
            showDetail(detailTask);
            setReload(+new Date());
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }

        window.loading -= 1;
    }, [apiPath, detailTask]);

    return <>
        <TaskTable showDetail={showDetail} reload={reload}></TaskTable>
        {detailTask !== null && <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} >
            <DialogTitle>
                {detailTask.title}
                <IconButton style={{ position: 'absolute', right: '10px', top: '10px' }} onClick={() => setDialogOpen(false)}>
                    <CloseRounded />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ minWidth: "550px" }}>
                <Typography variant="body2" gutterBottom><MarkdownRenderer>{detailTask.description}</MarkdownRenderer></Typography>
                <br />
                <Typography variant="body2" gutterBottom>Priority: <span style={{ color: PRIORITY_COLOR[detailTask.priority] }}>{PRIORITY_STRING[detailTask.priority]}</span></Typography>
                <Typography variant="body2" gutterBottom>Due: <TimeDelta key={`${+new Date()}`} timestamp={detailTask.due_timestamp * 1000} /></Typography>
                <Typography variant="body2" gutterBottom>Creator: <UserCard user={detailTask.creator} /></Typography>
                <Typography variant="body2" gutterBottom>Assigned to:&nbsp;
                    {detailTask.assign_mode === 0 && <UserCard user={detailTask.creator} />}
                    {detailTask.assign_mode === 1 && detailTask.assign_to.map((user, index) => (<UserCard key={index} user={user} />))}
                    {detailTask.assign_mode === 2 && detailTask.assign_to.map((role, index) => (<>{allRoles[role].name}{index !== detailTask.assign_to.length - 1 ? " ," : ""}</>))}
                </Typography>
                <Typography variant="body2" gutterBottom>Mark completed: {detailTask.mark_completed ? "Yes" : "No"} {detailTask.mark_timestamp && <>(<TimeDelta timestamp={detailTask.mark_timestamp * 1000} />)</>}</Typography>
                <Typography variant="body2" gutterBottom>Confirm completed: {detailTask.confirm_completed ? "Yes" : "No"} {detailTask.confirm_timestamp && <>(<TimeDelta timestamp={detailTask.confirm_timestamp * 1000} />)</>}</Typography>
            </DialogContent>
            <DialogActions>
                <ButtonGroup sx={{ padding: "10px" }}>
                    {isTaskAssignee && !detailTask.mark_completed && <Button variant="contained" color="info" onClick={() => { markAsCompleted(1); }} disabled={buttonDisabled}>Mark completed</Button>}
                    {isTaskAssignee && detailTask.mark_completed && <Button variant="contained" color="warning" onClick={() => { markAsCompleted(0); }} disabled={buttonDisabled}>Unmark completed</Button>}
                    {isTaskManager && !detailTask.confirm_completed && <Button variant="contained" color="info" onClick={() => { confirmAsCompleted(1); }} disabled={buttonDisabled}>Confirm completed</Button>}
                    {isTaskManager && detailTask.confirm_completed && <Button variant="contained" color="warning" onClick={() => { confirmAsCompleted(0); }} disabled={buttonDisabled}>Unconfirm completed</Button>}
                </ButtonGroup>
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

export default Task;