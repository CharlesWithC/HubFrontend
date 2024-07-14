import { useRef, useState, useEffect, useCallback, useMemo, useContext, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { AppContext } from '../context';

import { Card, CardContent, Typography, Grid, Snackbar, Alert, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, IconButton, useTheme, Divider, SpeedDial, SpeedDialIcon, SpeedDialAction, Box, MenuItem, FormControlLabel, Checkbox } from '@mui/material';
import { CloseRounded, DeleteRounded, EditNoteRounded, EditRounded, PeopleAltRounded } from '@mui/icons-material';
import { Portal } from '@mui/base';

import CustomTable from '../components/table';
import UserCard from '../components/usercard';
import TimeDelta from '../components/timedelta';
import MarkdownRenderer from '../components/markdown';
import DateTimeField from '../components/datetime';
import UserSelect from '../components/userselect';
import RoleSelect from '../components/roleselect';

import { makeRequestsAuto, customAxios as axios, getAuthToken, removeNUEValues, checkUserPerm, checkPerm } from '../functions';

function userFriendlyDurationToSeconds(duration) {
    const regex = /(\d+)([smhd])/g;
    let totalSeconds = 0;

    let match;
    while ((match = regex.exec(duration)) !== null) {
        const value = parseInt(match[1]);
        const unit = match[2];

        switch (unit) {
            case 's':
                totalSeconds += value;
                break;
            case 'm':
                totalSeconds += value * 60;
                break;
            case 'h':
                totalSeconds += value * 3600;
                break;
            case 'd':
                totalSeconds += value * 86400;
                break;
            default:
                throw new Error(tr("invalid_time_unit_in_duration"));
        }
    }

    return totalSeconds;
}

function secondsToUserFriendlyDuration(seconds) {
    const days = Math.floor(seconds / 86400);
    seconds %= 86400;
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);
    seconds %= 60;

    let result = '';
    if (days > 0) result += `${days}d`;
    if (hours > 0) result += `${hours}h`;
    if (minutes > 0) result += `${minutes}m`;
    if (seconds > 0 || result === '') result += `${seconds}s`;

    return result;
}

const TaskTable = memo(({ showDetail, reload }) => {
    const { t: tr } = useTranslation();
    const { apiPath, userSettings } = useContext(AppContext);

    const columns = [
        { id: 'id', label: 'ID', orderKey: 'taskid', defaultOrder: 'desc' },
        { id: 'title', label: tr("title"), orderKey: "title", defaultOrder: "asc" },
        { id: 'priority', label: tr("priority"), orderKey: 'priority', defaultOrder: 'asc', reversedOrder: true },
        { id: 'due_timestamp', label: tr("due_date"), orderKey: 'due_timestamp', defaultOrder: 'asc' },
        { id: 'status', label: tr("status") }
    ];

    const theme = useTheme();
    const PRIORITY_STRING = [tr("very_high"), tr("high"), tr("normal"), tr("low"), tr("very_low")];
    const PRIORITY_COLOR = [theme.palette.error.main, theme.palette.warning.main, theme.palette.info.main, theme.palette.success.main, theme.palette.success.light];
    const STATUS_CONVERT = [[0, 2], [1, 2]]; // [mark_completed, confirm_completed]
    const STATUS = useMemo(() => { return { 0: <span style={{ color: theme.palette.warning.main }}>{tr("pending")}</span>, 1: <span style={{ color: theme.palette.info.main }}>{tr("submitted")}</span>, 2: <span style={{ color: theme.palette.success.main }}>{tr("completed")}</span> }; }, [theme]);

    const [due, setDue] = useState([]);
    const [tasks, setTasks] = useState(null);

    const inited = useRef(false);
    const [totalItems, setTotalItems] = useState(0);
    const [page, setPage] = useState(1);
    const pageRef = useRef(1);
    const [pageSize, setPageSize] = useState(userSettings.default_row_per_page);
    const [listParam, setListParam] = useState({ order_by: "priority", order: "desc" });


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
                    { url: `${apiPath}/tasks/list?page=1&page_size=2&order_by=due_timestamp&order=asc&mark_completed=false&confirm_completed=false`, auth: true },
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
        {due.length === 0 && <Grid container spacing={2} sx={{ marginBottom: "20px" }}>
            <Grid item xs={12} sm={12} md={12} lg={12}>
                <Card>
                    <CardContent>
                        <Typography variant="body2" gutterBottom>{tr("no_pending_tasks")}</Typography>
                        <Typography variant="h5" component="div">{tr("all_tasks_completed")}</Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>{tr("it_looks_like_a_great_day_to_rest_relax_and")}</Typography>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>}
        {due.length !== 0 && <Grid container spacing={2} sx={{ marginBottom: "20px" }}>
            <Grid item xs={12} sm={12} md={due.length === 2 ? 6 : 12} lg={due.length === 2 ? 6 : 12}>
                <Card>
                    <CardContent>
                        <Typography variant="body2" gutterBottom>{tr("todo_1")}</Typography>
                        <Typography variant="h5" component="div">
                            {due[0].title}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                            <>{tr("due")}</>: <TimeDelta key={`${+new Date()}`} timestamp={due[0].due_timestamp * 1000} />
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
            {due.length === 2 &&
                <Grid item xs={12} sm={12} md={6} lg={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="body2" gutterBottom>{tr("todo_2")}</Typography>
                            <Typography variant="h5" component="div">
                                {due[1].title}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                                <>{tr("due")}</>: <TimeDelta key={`${+new Date()}`} timestamp={due[1].due_timestamp * 1000} />
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            }
        </Grid>}
        {tasks !== null && <CustomTable page={page} columns={columns} order={listParam.order} orderBy={listParam.order_by} onOrderingUpdate={(order_by, order) => { setListParam({ ...listParam, order_by: order_by, order: order }); }} data={tasks} totalItems={totalItems} rowsPerPageOptions={[10, 25, 50, 100]} defaultRowsPerPage={pageSize} onPageChange={setPage} onRowsPerPageChange={setPageSize} onRowClick={handleClick} />}
    </>;
});

const TaskManagers = memo(() => {
    const { allPerms, users, memberUIDs } = useContext(AppContext);
    const allMembers = memberUIDs.map((uid) => users[uid]);

    let managers = [];
    for (let i = 0; i < allMembers.length; i++) {
        if (checkPerm(allMembers[i].roles, ["administrator", "manage_public_tasks"], allPerms)) {
            managers.push(allMembers[i]);
        }
    }

    return <>{
        managers.map((user) => (
            <UserCard user={user} useChip={true} inline={true} />
        ))
    }</>;
});

const Task = () => {
    const { t: tr } = useTranslation();
    const { apiPath, curUser, allRoles, allPerms, memberUIDs, users, curUserPerm } = useContext(AppContext);
    const membersMapping = useMemo(() => (
        memberUIDs.reduce((acc, uid) => {
            acc[users[uid].userid] = users[uid];
            return acc;
        }, {})
    ), [memberUIDs, users]);
    const canManagePublicTasks = checkUserPerm(curUserPerm, ["administrator", "manage_public_tasks"]);

    const TASK_FORM = { title: "", description: "", priority: 2, bonus: 0, due_timestamp: Math.floor(Date.now() / 1000) + 86400, remind_timestamp: Math.floor(Date.now() / 1000) + 86400 - 3600, recurring: 0, recurringText: "", assign_mode: 0, assign_to: [curUser.userid] };

    const [reload, setReload] = useState(0);
    const [editId, setEditId] = useState(null);
    const [taskForm, setTaskForm] = useState(TASK_FORM);
    const [assignToTmp, setAssignToTmp] = useState([]);
    const [detailTask, setDetailTask] = useState(null);
    const [dialogAction, setDialogAction] = useState("");
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const [isTaskAssignee, setIsTaskAssignee] = useState(false);
    const [isTaskManager, setIsTaskManager] = useState(false);

    const [snackbarContent, setSnackbarContent] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const handleCloseSnackbar = useCallback(() => {
        setSnackbarContent("");
    }, []);

    const theme = useTheme();
    const PRIORITY_STRING = [tr("very_high"), tr("high"), tr("normal"), tr("low"), tr("very_low")];
    const PRIORITY_COLOR = [theme.palette.error.main, theme.palette.warning.main, theme.palette.info.main, theme.palette.success.main, theme.palette.success.light];
    const STATUS_CONVERT = [[0, 2], [1, 2]]; // [mark_completed, confirm_completed]
    const STATUS = useMemo(() => { return { 0: <span style={{ color: theme.palette.warning.main }}>{tr("pending")}</span>, 1: <span style={{ color: theme.palette.info.main }}>{tr("submitted")}</span>, 2: <span style={{ color: theme.palette.success.main }}>{tr("completed")}</span> }; }, [theme]);

    const createTask = useCallback(() => {
        if (editId !== null) {
            setEditId(null);
            setTaskForm(TASK_FORM);
            setAssignToTmp([]);
        }
        setDialogAction("create");
    }, [editId]);

    const submitTaskForm = useCallback(async () => {
        window.loading += 1;
        setButtonDisabled(true);

        let method = "POST";
        let url = `${apiPath}/tasks`;
        if (editId !== null) {
            method = "PATCH";
            url = `${apiPath}/tasks/${editId}`;
        }

        let resp = await axios({ url: url, method: method, headers: { Authorization: `Bearer ${getAuthToken()}` }, data: taskForm });
        if (resp.status === 204 || resp.status === 200) {
            setSnackbarContent(tr("success"));
            setSnackbarSeverity("success");
            setDialogAction("");
            setReload(+new Date());
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }

        setButtonDisabled(false);
        window.loading -= 1;
    }, [editId, taskForm, dialogAction]);

    const [bonusControl, setBonusControl] = useState(true);
    const showDetail = useCallback(async (task) => {
        window.loading += 1;
        setButtonDisabled(true);

        let resp = await axios({ url: `${apiPath}/tasks/${task.taskid}`, method: "GET", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 200) {
            setDetailTask(resp.data);
            setDialogAction("detail");

            let task = resp.data;
            setIsTaskAssignee(task.assign_mode === 0 && curUser.userid === task.creator.userid ||
                task.assign_mode === 1 && task.assign_to.includes(curUser.userid) ||
                task.assign_mode === 2 && task.assign_to.some(role => curUser.roles.includes(role)));
            setIsTaskManager(task.creator.userid === curUser.userid || checkPerm(curUser.roles, ["manage_public_tasks"], allPerms));

            if (task.confirm_completed) {
                setBonusControl(true);
            } else if (!task.confirm_completed) {
                if (task.due_timestamp < Math.floor(Date.now() / 1000)) {
                    setBonusControl(true);
                } else {
                    setBonusControl(false);
                }
            }
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }

        setButtonDisabled(false);
        window.loading -= 1;
    }, [apiPath, curUser, allPerms]);

    const deleteTask = useCallback(async (task) => {
        window.loading += 1;
        setButtonDisabled(true);

        let resp = await axios({ url: `${apiPath}/tasks/${task.taskid}`, method: "DELETE", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            setSnackbarContent(tr("success"));
            setSnackbarSeverity("success");
            setDialogAction("");
            setReload(+new Date());
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }

        setButtonDisabled(false);
        window.loading -= 1;
    }, [apiPath]);

    const [markNote, setMarkNote] = useState("");
    const markAsCompleted = useCallback(async (mark) => {
        window.loading += 1;
        setButtonDisabled(true);

        let resp = await axios({ url: `${apiPath}/tasks/${detailTask.taskid}/complete/mark`, method: mark ? "PUT" : "DELETE", headers: { Authorization: `Bearer ${getAuthToken()}` }, data: { note: markNote } });
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
    }, [apiPath, detailTask, markNote]);

    const [confirmNote, setConfirmNote] = useState("");
    const confirmAsCompleted = useCallback(async (confirm) => {
        window.loading += 1;

        let resp = await axios({ url: `${apiPath}/tasks/${detailTask.taskid}/complete/${confirm ? "accept" : "reject"}`, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` }, data: { note: confirmNote, distribute_bonus: bonusControl, remove_bonus: bonusControl } });
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
    }, [apiPath, detailTask, confirmNote, bonusControl]);

    return <>
        <TaskTable showDetail={showDetail} reload={reload}></TaskTable>
        {detailTask !== null && <Dialog open={dialogAction === "detail"} onClose={() => setDialogAction("")} >
            <DialogTitle sx={{ alignItems: "center" }}>
                {detailTask.title}
                {isTaskManager && <>
                    <IconButton size="small" aria-label={tr("edit")} sx={{ marginLeft: "10px", marginTop: "-3px" }} onClick={() => { setEditId(detailTask.taskid); setTaskForm(detailTask); setDialogAction("edit"); setAssignToTmp(detailTask.assign_mode === 1 ? detailTask.assign_to.map(userid => membersMapping[userid]) : (detailTask.assign_mode === 0 ? [curUser.userid] : [])); }}><EditRounded /></IconButton >
                    <IconButton size="small" aria-label={tr("delete")} sx={{ marginTop: "-3px" }}><DeleteRounded sx={{ "color": "red" }} onClick={() => { setDialogAction("delete"); }} /></IconButton >
                </>}
                <IconButton style={{ position: 'absolute', right: '10px', top: '10px' }} onClick={() => setDialogAction("")}>
                    <CloseRounded />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ minWidth: "550px" }}>
                <Typography variant="body2" gutterBottom><MarkdownRenderer>{detailTask.description}</MarkdownRenderer></Typography>
                <br />
                <Typography variant="body2" gutterBottom><b>{tr("priority")}</b>: <span style={{ color: PRIORITY_COLOR[detailTask.priority] }}>{PRIORITY_STRING[detailTask.priority]}</span></Typography>
                <Typography variant="body2" gutterBottom><b>{tr("due")}</b>: <TimeDelta key={`${+new Date()}`} timestamp={detailTask.due_timestamp * 1000} /></Typography>
                <Typography variant="body2" gutterBottom><b>{tr("creator")}</b>: <UserCard user={detailTask.creator} /></Typography>
                <Typography variant="body2" gutterBottom><b>{tr("assigned_to")}</b>:&nbsp;
                    {detailTask.assign_mode === 0 && <UserCard user={detailTask.creator} />}
                    {detailTask.assign_mode === 1 && detailTask.assign_to.map((userid, index) => (<><UserCard key={index} user={membersMapping[userid]} />&nbsp;</>))}
                    {detailTask.assign_mode === 2 && detailTask.assign_to.map((role, index) => (<>{allRoles[role].name}{index !== detailTask.assign_to.length - 1 ? ", " : ""}</>))}
                </Typography>
                <Typography variant="body2" gutterBottom><b>{tr("status")}</b>: {STATUS[STATUS_CONVERT[+detailTask.mark_completed][+detailTask.confirm_completed]]} {detailTask.mark_completed && !detailTask.confirm_completed && detailTask.mark_timestamp && <>(<TimeDelta timestamp={detailTask.mark_timestamp * 1000} lower={true} />)</>} {detailTask.confirm_completed && detailTask.confirm_timestamp && <>({tr("accepted")} <TimeDelta timestamp={detailTask.confirm_timestamp * 1000} lower={true} />)</>}</Typography>
                {detailTask.mark_note !== "" && <Typography variant="body2" gutterBottom><b>{tr("assignee_note")}</b>: {detailTask.mark_note}</Typography>}
                {detailTask.confirm_note !== "" && <Typography variant="body2" gutterBottom><b>{tr("manager_note")}</b>: {detailTask.confirm_note}</Typography>}
                <br />
                {isTaskAssignee && <>
                    <Typography variant="body2" gutterBottom><b>{tr("mark_status")}</b></Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={6} lg={8}>
                            <TextField
                                label={tr("note")}
                                value={markNote}
                                onChange={(e) => setMarkNote(e.target.value)}
                                fullWidth size="small"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={6} lg={4}>
                            {!detailTask.mark_completed && <Button variant="contained" color="info" onClick={() => { markAsCompleted(1); }} disabled={buttonDisabled} fullWidth>{tr("completed")}</Button>}
                            {detailTask.mark_completed && <Button variant="contained" color="warning" onClick={() => { markAsCompleted(0); }} disabled={buttonDisabled} fullWidth>{tr("uncompleted")}</Button>}
                        </Grid>
                    </Grid>
                </>}
                {isTaskAssignee && isTaskManager && <Divider sx={{ margin: "15px 0 10px 0" }} />}
                {isTaskManager && <>
                    <Typography variant="body2" gutterBottom><b>{tr("manager_status")}</b></Typography>
                    <Grid container spacing={2} rowSpacing={-2}>
                        <Grid item xs={12} sm={6} md={6} lg={8}>
                            <TextField
                                label={tr("note")}
                                value={confirmNote}
                                onChange={(e) => setConfirmNote(e.target.value)}
                                fullWidth size="small"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={6} lg={4}>
                            {!detailTask.confirm_completed && <Button variant="contained" color="success" onClick={() => { confirmAsCompleted(1); }} disabled={buttonDisabled} fullWidth>{tr("accept")}</Button>}
                            {detailTask.confirm_completed && <Button variant="contained" color="error" onClick={() => { confirmAsCompleted(0); }} disabled={buttonDisabled} fullWidth>{tr("reject")}</Button>}
                        </Grid>
                        <Grid item xs={0} sm={6} md={6} lg={8}></Grid>
                        <Grid item xs={12} sm={6} md={6} lg={4}>
                            <FormControlLabel size="small"
                                control={<Checkbox checked={bonusControl} onChange={(e) => { setBonusControl(e.target.checked); }} />}
                                label={`${detailTask.confirm_completed ? tr("remove_bonus") : tr("distribute_bonus")}`}
                            />
                        </Grid>
                    </Grid>
                </>}
            </DialogContent>
            <DialogActions>
            </DialogActions>
        </Dialog>}
        <Dialog open={dialogAction === "managers"} onClose={() => setDialogAction("")}>
            <DialogTitle>{tr("public_task_managers")}</DialogTitle>
            <DialogContent>
                <TaskManagers />
            </DialogContent>
            <DialogActions>
                <Button variant="contained" onClick={() => { setDialogAction(""); }}>{tr("close")}</Button>
            </DialogActions>
        </Dialog>
        <Dialog open={dialogAction === "create" || dialogAction == "edit"} onClose={() => setDialogAction("")}>
            <DialogTitle>
                {dialogAction === "create" ? tr("create_task") : tr("edit_task")}
                <IconButton style={{ position: 'absolute', right: '10px', top: '10px' }} onClick={() => setDialogAction("")}>
                    <CloseRounded />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <form onSubmit={submitTaskForm} style={{ marginTop: "5px" }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                label={tr("title")}
                                value={taskForm.title}
                                onChange={(e) => setTaskForm(taskForm => ({ ...taskForm, title: e.target.value }))}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label={tr("description")}
                                multiline
                                value={taskForm.description}
                                onChange={(e) => setTaskForm(taskForm => ({ ...taskForm, description: e.target.value }))}
                                fullWidth
                                minRows={4}
                            />
                        </Grid>
                        <Grid item xs={12} md={canManagePublicTasks ? 6 : 12}>
                            <TextField
                                label={tr("priority")}
                                select
                                value={taskForm.priority}
                                onChange={(e) => setTaskForm(taskForm => ({ ...taskForm, priority: e.target.value }))}
                                fullWidth
                            >
                                {PRIORITY_STRING.map((priority, index) => (
                                    <MenuItem key={index} value={index} sx={{ color: PRIORITY_COLOR[index] }}>{priority}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        {canManagePublicTasks && <Grid item xs={12} md={6}>
                            <TextField
                                label={tr("bonus")}
                                value={taskForm.bonus}
                                onChange={(e) => setTaskForm(taskForm => ({ ...taskForm, bonus: e.target.value }))}
                                fullWidth
                            />
                        </Grid>}
                        <Grid item xs={12} md={6}>
                            <DateTimeField
                                label={tr("due_date")}
                                defaultValue={taskForm.due_timestamp}
                                onChange={(timestamp) => setTaskForm(taskForm => ({ ...taskForm, due_timestamp: timestamp }))}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <DateTimeField
                                label={tr("remind_date")}
                                defaultValue={taskForm.remind_timestamp}
                                onChange={(timestamp) => setTaskForm(taskForm => ({ ...taskForm, remind_timestamp: timestamp }))}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={6} md={6}>
                            <TextField
                                label={tr("recurring_every_eg_1d_4h_10m_30s")}
                                value={taskForm.recurringText}
                                onChange={(e) => setTaskForm(taskForm => ({ ...taskForm, recurring: userFriendlyDurationToSeconds(e.target.value), recurringText: e.target.value }))}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <TextField
                                label={tr("recurring_seconds")}
                                value={taskForm.recurring}
                                onChange={(e) => setTaskForm(taskForm => ({ ...taskForm, recurring: e.target.value, recurringText: secondsToUserFriendlyDuration(e.target.value) }))}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField
                                label={tr("assign_mode")}
                                select
                                value={taskForm.assign_mode}
                                onChange={(e) => setTaskForm(taskForm => ({ ...taskForm, assign_mode: e.target.value, assign_to: e.target.value === 0 ? [curUser.userid] : [] }))}
                                fullWidth
                            >
                                <MenuItem value={0}>{tr("self")}</MenuItem>
                                {canManagePublicTasks && <MenuItem value={1}>{tr("users")}</MenuItem>}
                                {canManagePublicTasks && <MenuItem value={2}>{tr("roles")}</MenuItem>}
                            </TextField>
                        </Grid>
                        {canManagePublicTasks && <Grid item xs={12}>
                            {taskForm.assign_mode === 1 && <UserSelect label={tr("assign_to")} users={assignToTmp} isMulti={true} onUpdate={(users) => { setAssignToTmp(users); setTaskForm(taskForm => ({ ...taskForm, assign_to: users.map(user => user.userid) })); }} style={{ marginTop: "-5px" }} />}
                            {taskForm.assign_mode === 2 && <RoleSelect initialRoles={taskForm.assign_to} onUpdate={(newRoles) => { setTaskForm(taskForm => ({ ...taskForm, assign_to: newRoles.map((role) => (role.id)) })); }} label={tr("assign_to")} showAllRoles={true} style={{ marginTop: "-5px" }} />}
                        </Grid>}
                    </Grid>
                </form>
            </DialogContent>
            <DialogActions>
                <Grid container justifyContent="space-between" padding="10px">
                    <Grid item>
                        <Box sx={{ display: 'flex', gap: '10px' }}>
                            <Button variant="contained" onClick={() => { setTaskForm(TASK_FORM); }}>{tr("clear")}</Button>
                        </Box>
                    </Grid>
                    <Grid item>
                        <Box sx={{ display: 'flex', gap: '10px' }}>
                            <Button variant="contained" color="info" onClick={submitTaskForm} disabled={buttonDisabled}>{dialogAction === "create" ? tr("create") : tr("edit")}</Button>
                        </Box>
                    </Grid>
                </Grid>
            </DialogActions>
        </Dialog>
        {detailTask !== null && <Dialog open={dialogAction === "delete"} onClose={() => setDialogAction("")}>
            <DialogTitle>{tr("delete_task")}</DialogTitle>
            <DialogContent>
                <Typography variant="body2" sx={{ minWidth: "400px", marginBottom: "20px" }}>{tr("are_you_sure_you_want_to_delete_this_task")}</Typography>
                <Typography variant="body2" sx={{ minWidth: "400px" }}><b>{detailTask.title}</b></Typography>
            </DialogContent>
            <DialogActions>
                <Grid container justifyContent="space-between" padding="10px">
                    <Grid item>
                        <Box sx={{ display: 'flex', gap: '10px' }}>
                            <Button variant="contained" onClick={() => { setDialogAction(""); }}>{tr("cancel")}</Button>
                        </Box>
                    </Grid>
                    <Grid item>
                        <Box sx={{ display: 'flex', gap: '10px' }}>
                            <Button variant="contained" color="error" onClick={() => { deleteTask(detailTask); }} disabled={buttonDisabled}>{tr("delete")}</Button>
                        </Box>
                    </Grid>
                </Grid>
            </DialogActions>
        </Dialog>}
        <SpeedDial
            ariaLabel={tr("controls")}
            sx={{ position: 'fixed', bottom: 20, right: 20 }}
            icon={<SpeedDialIcon />}
        >
            {curUser.userid !== -1 && <SpeedDialAction
                key="create"
                icon={<EditNoteRounded />}
                tooltipTitle={tr("create")}
                onClick={() => createTask()}
            />}
            {curUser.userid !== -1 && <SpeedDialAction
                key="managers"
                icon={<PeopleAltRounded />}
                tooltipTitle={tr("managers")}
                onClick={() => setDialogAction("managers")}
            />}
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
        </Portal></>;
};

export default Task;