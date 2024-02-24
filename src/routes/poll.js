import { useEffect, useState, useCallback, useContext, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { AppContext } from '../context';

import { Card, CardContent, Typography, Grid, SpeedDial, SpeedDialIcon, SpeedDialAction, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, TextField, Snackbar, Alert, Pagination, IconButton, Tooltip, Box, Checkbox, ButtonGroup, useTheme } from '@mui/material';
import { EditNoteRounded, RefreshRounded, EditRounded, DeleteRounded, PeopleAltRounded } from '@mui/icons-material';
import { Portal } from '@mui/base';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle as faCircleSolid, fa1, faN, faUsers, faUsersSlash, faPenToSquare, faPlus, faMinus, faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { faCircle, faCircleCheck } from '@fortawesome/free-regular-svg-icons';

import DateTimeField from '../components/datetime';
import UserCard from '../components/usercard';
import MarkdownRenderer from '../components/markdown';
import TimeAgo from '../components/timeago';

import { makeRequestsWithAuth, checkUserPerm, customAxios as axios, checkPerm, getAuthToken } from '../functions';

var vars = require("../variables");

const PollCard = ({ poll: inputPoll, onEdit, onDelete, onPollVoters }) => {
    const { t: tr } = useTranslation();
    const { apiPath, curUID, curUserPerm } = useContext(AppContext);

    const [poll, setPoll] = useState(inputPoll);
    useEffect(() => {
        setPoll(inputPoll);
    }, [inputPoll]);

    const showButtons = onEdit !== undefined;
    const showControls = (onEdit !== undefined) && (curUID !== null && checkUserPerm(curUserPerm, ["administrator", "manage_polls"]));
    let initialChoices = [];
    for (let i = 0; i < poll.choices.length; i++) {
        if (poll.choices[i].voted) {
            initialChoices.push(poll.choices[i].choiceid);
        }
    }

    const [snackbarContent, setSnackbarContent] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const handleCloseSnackbar = useCallback((e) => {
        setSnackbarContent("");
    }, []);


    const [isShiftPressed, setIsShiftPressed] = useState(false);

    const theme = useTheme();

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.keyCode === 16) {
                setIsShiftPressed(true);
            }
        };

        const handleKeyUp = (event) => {
            if (event.keyCode === 16) {
                setIsShiftPressed(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    const handleEdit = useCallback(() => {
        onEdit(poll);
    }, [poll, onEdit]);

    const handleDelete = useCallback(() => {
        onDelete(poll, isShiftPressed);
    }, [poll, isShiftPressed, onDelete]);

    const [selectedChoices, setSelectedChoices] = useState(initialChoices);
    const [voteDisabled, setVoteDisabled] = useState(false);
    const handleVote = useCallback(async () => {
        setVoteDisabled(true);
        let resp = await axios({ url: `${apiPath}/polls/${poll.pollid}/vote`, method: "PUT", data: { choiceids: selectedChoices }, headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            setSnackbarContent(tr("vote_submitted"));
            setSnackbarSeverity("success");
            let votedChoices = [];
            for (let i = 0; i < poll.choices.length; i++) {
                votedChoices.push({ ...poll.choices[i], voted: selectedChoices.includes(poll.choices[i].choiceid), votes: Number(poll.choices[i].votes + selectedChoices.includes(poll.choices[i].choiceid)) });
            }
            setPoll({ ...poll, choices: votedChoices, voted: true });
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setVoteDisabled(false);
    }, [apiPath, poll, selectedChoices]);
    const handleModifyVote = useCallback(async () => {
        setVoteDisabled(true);
        let resp = await axios({ url: `${apiPath}/polls/${poll.pollid}/vote`, method: "PATCH", data: { choiceids: selectedChoices }, headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            setSnackbarContent(tr("vote_updated"));
            setSnackbarSeverity("success");
            let votedChoices = [];
            for (let i = 0; i < poll.choices.length; i++) {
                votedChoices.push({ ...poll.choices[i], voted: selectedChoices.includes(poll.choices[i].choiceid), votes: poll.choices[i].votes - (!isNaN(Number(poll.choices[i].voted)) ? Number(poll.choices[i].voted) : 0) + Number(selectedChoices.includes(poll.choices[i].choiceid)) });
            }
            setPoll({ ...poll, choices: votedChoices, voted: selectedChoices.length !== 0 });
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setVoteDisabled(false);
    }, [apiPath, poll, selectedChoices]);

    if (poll.title === undefined) {
        return <></>;
    }

    const loc = poll.display.replace("with-image-", "");
    let description = poll.description.replace(`[Image src="${poll.image}" loc="${loc}"]`, "").trimStart();

    const totalVotes = poll.choices.reduce((acc, choice) => acc + choice.votes, 0);
    let pollChoices = (
        <>
            {poll.choices.map((choice, index) => {
                const percentage = totalVotes === 0 ? 0 : (choice.votes / totalVotes) * 100;
                const displayPercentage = isNaN(percentage) ? 0 : Math.round(percentage * 100) / 100;

                return (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                        <div
                            style={{
                                marginRight: '16px',
                                flex: 1,
                                cursor: poll.voted && !poll.config.allow_modify_vote ? 'default' : 'pointer',
                                opacity: poll.voted && !poll.config.allow_modify_vote ? 0.7 : 1,
                                position: 'relative', // Make the container relative for absolute positioning of the background div
                            }}
                            onClick={() => {
                                if (!showButtons) return;
                                if (!selectedChoices.includes(choice.choiceid)) {
                                    if (selectedChoices.length < poll.config.max_choice) {
                                        setSelectedChoices([...selectedChoices, choice.choiceid]);
                                    } else {
                                        if (poll.config.max_choice === 1) {
                                            setSelectedChoices([choice.choiceid]);
                                        }
                                    }
                                } else {
                                    setSelectedChoices(selectedChoices.filter(item => item !== choice.choiceid));
                                }
                            }}
                        >
                            <div
                                style={{
                                    width: `100%`,
                                    height: '30px',
                                    borderRadius: '4px',
                                    backgroundColor: theme.palette.info.main + "22",
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    bottom: 0,
                                    zIndex: 8
                                }}
                            />
                            <div
                                style={{
                                    width: `${displayPercentage}%`,
                                    height: '30px',
                                    borderRadius: '4px',
                                    backgroundColor: theme.palette.info.main + "aa",
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    bottom: 0,
                                    zIndex: 9
                                }}
                            />
                            <Typography variant="body2" sx={{ position: "relative", padding: "5px", zIndex: 10 }}>
                                {choice.voted && !poll.config.allow_modify_vote && (poll.end_time !== null || poll.end_time * 1000 <= +new Date()) ? <FontAwesomeIcon icon={faCircleCheck} /> : <>{selectedChoices.includes(choice.choiceid) ? <FontAwesomeIcon icon={faCircleSolid} /> : <FontAwesomeIcon icon={faCircle} />}</>}
                                &nbsp;&nbsp;{choice.content} ({displayPercentage}%)</Typography>
                        </div>
                    </div>
                );
            })}
            {showButtons && <Box sx={{ display: 'grid', justifyItems: 'end' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {!poll.voted && <Button onClick={handleVote} variant="contained" color="info" disabled={voteDisabled}>{tr("vote")}</Button>}
                    {poll.voted && poll.config.allow_modify_vote && (poll.end_time !== null || poll.end_time * 1000 <= +new Date()) && <Button onClick={handleModifyVote} variant="contained" color="info" disabled={voteDisabled}>{tr("modify_vote")}</Button>}
                </div>
            </Box>}
            <Portal>
                <Snackbar
                    open={!!snackbarContent}
                    autoHideDuration={5000}
                    onClose={handleCloseSnackbar}
                    onClick={(e) => { e.stopPropagation(); }}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
                        {snackbarContent}
                    </Alert>
                </Snackbar>
            </Portal>
        </>
    );

    let caption = <><UserCard user={poll.creator} inline={true} />
        | <TimeAgo key={`${+new Date()}`} timestamp={poll.timestamp * 1000} />
        | {poll.config.max_choice === 1 ?
            <Tooltip key={`single-choice`} placement="top" arrow title={tr("single_choice")}
                PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, -10] } }] }}>
                <FontAwesomeIcon icon={fa1} />
            </Tooltip> : <Tooltip key={`multiple-choice`} placement="top" arrow title={`Up to ${poll.config.max_choice} choices`}
                PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, -10] } }] }}>
                <FontAwesomeIcon icon={faN} />
            </Tooltip>}
        &nbsp;&nbsp;{poll.config.show_voter ?
            <Tooltip key={`identifiable-voting`} placement="top" arrow title={`Identifiable voting`}
                PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, -10] } }] }}>
                <FontAwesomeIcon icon={faUsers} />
            </Tooltip> : <Tooltip key={`anomymous-voting`} placement="top" arrow title={`Anonymous voting`}
                PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, -10] } }] }}>
                <FontAwesomeIcon icon={faUsersSlash} />
            </Tooltip>}
        &nbsp;&nbsp;{poll.config.allow_modify_vote ?
            <Tooltip key={`allow-modify`} placement="top" arrow title={`Poll modification allowed`}
                PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, -10] } }] }}>
                <FontAwesomeIcon icon={faPenToSquare} style={{ color: theme.palette.success.main }} />
            </Tooltip> : <Tooltip key={`disallow-modify`} placement="top" arrow title={`Poll modification prohibited`}
                PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, -10] } }] }}>
                <FontAwesomeIcon icon={faPenToSquare} style={{ color: theme.palette.error.main }} />
            </Tooltip>}</>;

    if (poll.display === "half-width") {
        return (
            <Grid item xs={12} sm={12} md={6} lg={6} key={poll.pollid}>
                <Card>
                    <CardContent>
                        <div style={{ marginBottom: "10px", display: 'flex', alignItems: "center" }}>
                            <Typography variant="h5" sx={{ flexGrow: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    {poll.title}
                                </div>
                            </Typography>
                            {(showButtons) && <div>
                                {(checkUserPerm(curUserPerm, ["administrator", "manage_polls"]) || poll.config.show_voter && (poll.config.show_stats && poll.voted || poll.config.show_stats_before_vote || poll.config.show_stats_when_ended && poll.end_time * 1000 < +new Date())) && <IconButton size="small" aria-label={tr("edit")} onClick={() => { onPollVoters(poll); }}><FontAwesomeIcon icon={faUsers} /></IconButton >}
                            </div>}
                            {(showControls && showButtons) && <div>
                                <IconButton size="small" aria-label={tr("edit")} onClick={handleEdit}><EditRounded /></IconButton >
                                <IconButton size="small" aria-label={tr("delete")} onClick={handleDelete}><DeleteRounded sx={{ "color": "red" }} /></IconButton >
                            </div>}
                        </div>
                        <Typography variant="body2" sx={{ mb: "20px" }}><MarkdownRenderer>{description}</MarkdownRenderer></Typography>
                        {pollChoices}
                    </CardContent>
                    <CardContent sx={{ pt: 0 }}>
                        <Typography variant="caption">{caption}</Typography>
                    </CardContent>
                </Card>
            </Grid>
        );
    } else if (poll.display === "full-width") {
        return (
            <Grid item xs={12} sm={12} md={12} lg={12} key={poll.pollid}>
                <Card>
                    <CardContent>
                        <div style={{ marginBottom: "10px", display: 'flex', alignItems: "center" }}>
                            <Typography variant="h5" sx={{ flexGrow: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    {poll.title}
                                </div>
                            </Typography>
                            {(showButtons) && <div>

                            </div>}
                            {(showControls && showButtons) && <div>
                                <IconButton size="small" aria-label={tr("edit")} onClick={handleEdit}><EditRounded /></IconButton >
                                <IconButton size="small" aria-label={tr("delete")} onClick={handleDelete}><DeleteRounded sx={{ "color": "red" }} /></IconButton >
                            </div>}
                        </div>
                        <Typography variant="body2" sx={{ mb: "20px" }}><MarkdownRenderer>{description}</MarkdownRenderer></Typography>
                        {pollChoices}
                    </CardContent>
                    <CardContent sx={{ pt: 0 }}>
                        <Typography variant="caption">{caption}</Typography>
                    </CardContent>
                </Card>
            </Grid>
        );
    } else if (poll.display === "with-image-left") {
        return (
            <Grid item xs={12} sm={12} md={12} lg={12} key={poll.pollid}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={12} md={6} lg={6}>
                        <img src={poll.image} alt="" style={{ width: '100%', border: 'none' }} />
                    </Grid>
                    <Grid item xs={12} sm={12} md={6} lg={6} style={{ display: 'flex' }}>
                        <Card style={{ display: 'flex', flexDirection: 'column' }}>
                            <CardContent>
                                <div style={{ marginBottom: "10px", display: 'flex', alignItems: "center" }}>
                                    <Typography variant="h5" sx={{ flexGrow: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            {poll.title}
                                        </div>
                                    </Typography>
                                    {(showButtons) && <div>

                                    </div>}
                                    {(showControls && showButtons) && <div>
                                        <IconButton size="small" aria-label={tr("edit")} onClick={handleEdit}><EditRounded /></IconButton >
                                        <IconButton size="small" aria-label={tr("delete")} onClick={handleDelete}><DeleteRounded sx={{ "color": "red" }} /></IconButton >
                                    </div>}
                                </div>
                                <Typography variant="body2" sx={{ mb: "20px" }}><MarkdownRenderer>{description}</MarkdownRenderer></Typography>
                                {pollChoices}
                            </CardContent>
                            <CardContent sx={{ pt: 0 }}>
                                <Typography variant="caption">{caption}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Grid>
        );
    } else if (poll.display === "with-image-right") {
        return (
            <Grid item xs={12} sm={12} md={12} lg={12} key={poll.pollid}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={12} md={6} lg={6} style={{ display: 'flex' }}>
                        <Card style={{ display: 'flex', flexDirection: 'column' }}>
                            <CardContent>
                                <div style={{ marginBottom: "10px", display: 'flex', alignItems: "center" }}>
                                    <Typography variant="h5" sx={{ flexGrow: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            {poll.title}
                                        </div>
                                    </Typography>
                                    {(showButtons) && <div>

                                    </div>}
                                    {(showControls && showButtons) && <div>
                                        <IconButton size="small" aria-label={tr("edit")} onClick={handleEdit}><EditRounded /></IconButton >
                                        <IconButton size="small" aria-label={tr("delete")} onClick={handleDelete}><DeleteRounded sx={{ "color": "red" }} /></IconButton >
                                    </div>}
                                </div>
                                <Typography variant="body2" sx={{ mb: "20px" }}><MarkdownRenderer>{description}</MarkdownRenderer></Typography>
                                {pollChoices}
                            </CardContent>
                            <CardContent sx={{ pt: 0 }}>
                                <Typography variant="caption">{caption}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={12} md={6} lg={6}>
                        <img src={poll.image} alt="" style={{ width: '100%', border: 'none' }} />
                    </Grid>
                </Grid>
            </Grid>
        );
    }
};

const PollGrid = memo(({ polls, lastUpdate, onEdit, onDelete, onPollVoters }) => {
    let halfCnt = 0;
    return <Grid container spacing={3}>
        {polls.map((poll, index) => {
            poll.display = 'half-width';

            const hasImage = /^\[Image src="(.+)" loc="(.+)"\]/.test(poll.description);

            if (hasImage) {
                const re = poll.description.match(/^\[Image src="(.+)" loc="(.+)"\]/);
                const link = re[1];
                const loc = re[2];
                poll.image = link;
                poll.display = 'with-image-' + loc;
                halfCnt = 0;
            } else {
                if (index + 1 < polls.length) {
                    const nextPoll = polls[index + 1];
                    const nextHasImage = /^\[Image src="(.+)" loc="(.+)"\]/.test(nextPoll.description);

                    if (nextHasImage) {
                        if (halfCnt % 2 === 1) {
                            poll.display = 'half-width';
                            halfCnt += 1;
                        } else {
                            poll.display = 'full-width';
                            halfCnt = 0;
                        }
                    } else {
                        poll.display = 'half-width';
                        halfCnt += 1;
                    }
                }
            }

            return (
                <PollCard
                    poll={poll}
                    key={index}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onPollVoters={onPollVoters}
                />
            );
        })}
    </Grid>;
}, (prevProps, nextProps) => {
    return prevProps.lastUpdate === nextProps.lastUpdate;
});

const PollManagers = memo(() => {
    const { allPerms, users, memberUIDs } = useContext(AppContext);
    const allMembers = memberUIDs.map((uid) => users[uid]);

    let managers = [];
    for (let i = 0; i < allMembers.length; i++) {
        if (checkPerm(allMembers[i].roles, ["administrator", "manage_polls"], allPerms)) {
            managers.push(allMembers[i]);
        }
    }

    return <>{
        managers.map((user) => (
            <UserCard user={user} useChip={true} inline={true} />
        ))
    }</>;
});

const Poll = () => {
    const { t: tr } = useTranslation();
    const { apiPath, curUser, curUserPerm } = useContext(AppContext);

    const [polls, setPolls] = useState([]);
    const [lastUpdate, setLastUpdate] = useState(0);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const handlePagination = useCallback((event, value) => {
        setPage(value);
    }, []);

    const [snackbarContent, setSnackbarContent] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const handleCloseSnackbar = useCallback(() => {
        setSnackbarContent("");
    }, []);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogTitle, setDialogTitle] = useState(tr("create_poll"));
    const [dialogButton, setDialogButton] = useState(tr("create"));
    const [dialogDelete, setDialogDelete] = useState(false);
    const [toDelete, setToDelete] = useState(null);
    const [dialogManagers, setDialogManagers] = useState(false);

    const [dialogVoters, setDialogVoters] = useState(false);
    const [pollDetails, setPollDetails] = useState({});

    const [editId, setEditId] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setContent] = useState('');
    const [choices, setChoices] = useState([{ content: "" }, { content: "" }, { content: "" }, { content: "" }]);
    const [config, setConfig] = useState({ max_choice: 1, allow_modify_vote: false, show_stats: true, show_stats_before_vote: false, show_voter: false, show_stats_when_ended: false });
    const [endTime, setEndTime] = useState(undefined);
    const [noEndTime, setNoEndTime] = useState(false);
    const [orderId, setOrderId] = useState(0);
    const [isPinned, setIsPinned] = useState(false);

    const clearModal = useCallback(() => {
        setTitle('');
        setContent('');
        setChoices([{ content: "" }, { content: "" }, { content: "" }, { content: "" }]);
        setConfig({ max_choice: 1, allow_modify_vote: false, show_stats: true, show_stats_before_vote: false, show_voter: false, show_stats_when_ended: true });
        setEndTime(undefined);
        setNoEndTime(false);
        setOrderId(0);
        setIsPinned(false);
    }, []);

    const doLoad = useCallback(async () => {
        window.loading += 1;

        const [polls] = await makeRequestsWithAuth([`${apiPath}/polls/list?page_size=10&page=${page}`]);
        setPolls(polls.list);
        setTotalPages(polls.total_pages);
        setLastUpdate(+new Date());

        window.loading -= 1;
    }, [apiPath, page]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        if (editId === null) {
            let formattedChoices = [];
            for (let i = 0; i < choices.length; i++) {
                formattedChoices.push(choices[i].content);
            }
            let resp = await axios({ url: `${apiPath}/polls`, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` }, data: { "title": title, "description": description, choices: formattedChoices, "end_time": noEndTime ? null : endTime, "config": config, "orderid": parseInt(orderId), "is_pinned": isPinned } });
            if (resp.status === 200) {
                doLoad();
                setSnackbarContent(tr("poll_created"));
                setSnackbarSeverity("success");
                clearModal();
                setDialogOpen(false);
            } else {
                setSnackbarContent(resp.data.error);
                setSnackbarSeverity("error");
            }
        } else {
            let formattedChoices = [];
            for (let i = 0; i < choices.length; i++) {
                formattedChoices.push({ choiceid: choices[i].choiceid, orderid: i + 1 });
            }
            let resp = await axios({ url: `${apiPath}/polls/${editId}`, method: "PATCH", headers: { Authorization: `Bearer ${getAuthToken()}` }, data: { "title": title, "description": description, choices: formattedChoices, "end_time": noEndTime ? null : endTime, "config": config, "orderid": parseInt(orderId), "is_pinned": isPinned } });
            if (resp.status === 204) {
                doLoad();
                setSnackbarContent(tr("poll_updated"));
                setSnackbarSeverity("success");
                clearModal();
                setDialogOpen(false);
                setEditId(null);
            } else {
                setSnackbarContent(resp.data.error);
                setSnackbarSeverity("error");
            }
        }
        setSubmitLoading(false);
    }, [apiPath, title, description, choices, endTime, noEndTime, config, editId, isPinned, orderId]);

    const createPoll = useCallback(() => {
        if (editId !== null) {
            setEditId(null);
            clearModal();
        }
        setDialogTitle(tr("create_poll"));
        setDialogButton(tr("create"));
        setDialogOpen(true);
    }, [editId]);

    const editPoll = useCallback((poll) => {
        clearModal();

        setTitle(poll.title);
        setContent(poll.description);
        setChoices(poll.choices);
        if (poll.end_time === null) {
            setEndTime(undefined);
            setNoEndTime(true);
        } else {
            setEndTime(poll.end_time);
            setNoEndTime(false);
        }
        setConfig(poll.config);
        setOrderId(poll.orderid);
        setIsPinned(String(poll.is_pinned));

        setEditId(poll.pollid);

        setDialogTitle(tr("edit_poll"));
        setDialogButton(tr("edit"));
        setDialogOpen(true);
    }, []);

    const deletePoll = useCallback(async (poll, isShiftPressed) => {
        if (isShiftPressed === true || poll.confirmed === true) {
            setSubmitLoading(true);
            let resp = await axios({ url: `${apiPath}/polls/${poll.pollid}`, method: "DELETE", headers: { Authorization: `Bearer ${getAuthToken()}` } });
            if (resp.status === 204) {
                doLoad();
                setSnackbarContent(tr("poll_deleted"));
                setSnackbarSeverity("success");
                setDialogDelete(false);
                setToDelete(null);
            } else {
                setSnackbarContent(resp.data.error);
                setSnackbarSeverity("error");
            }
            setSubmitLoading(false);
        } else {
            setDialogDelete(true);
            setToDelete(poll);
        }
    }, [apiPath]);

    const handlePollVoters = useCallback(async (poll) => {
        window.loading += 1;

        let resp = await axios({ url: `${apiPath}/polls/${poll.pollid}`, method: "GET", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 200) {
            setPollDetails(resp.data);
            setDialogVoters(true);
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }

        window.loading -= 1;
    }, [apiPath]);

    useEffect(() => {
        doLoad();
    }, []);

    return (
        <>
            <PollGrid polls={polls} lastUpdate={lastUpdate} onEdit={editPoll} onDelete={deletePoll} onPollVoters={handlePollVoters} />
            {polls.length !== 0 && <Pagination count={totalPages} onChange={handlePagination}
                sx={{ display: "flex", justifyContent: "flex-end", marginTop: "10px", marginRight: "10px" }} />}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <DialogTitle>{dialogTitle}</DialogTitle>
                <DialogContent>
                    <form onSubmit={handleSubmit} style={{ marginTop: "5px" }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    label={tr("title")}
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label={tr("content_markdown")}
                                    multiline
                                    value={description}
                                    onChange={(e) => setContent(e.target.value)}
                                    fullWidth
                                    minRows={4}
                                />
                            </Grid>
                            <Grid item xs={12} sx={{ mb: 0 }}>
                                <Typography variant="body2" sx={{ fontWeight: 800 }}>{tr("choices")}</Typography>
                            </Grid>
                            {choices.map((_, index) => {
                                return <Grid item xs={12} key={index}>
                                    <ButtonGroup>
                                        <TextField
                                            label={`${tr("choice")} #${index + 1}`}
                                            value={choices[index].content}
                                            onChange={(e) => setChoices(prevChoices => [...prevChoices.slice(0, index), { content: e.target.value }, ...prevChoices.slice(index + 1)])}
                                            size="small"
                                            sx={editId === null ? { width: "calc(100% - 150px)" } : { width: "calc(100% - 75px)" }}
                                        />
                                        {editId === null && <IconButton variant="contained" color="success" onClick={() => {
                                            if (choices.length < 10) setChoices(prevChoices => [...prevChoices.slice(0, index + 1), { content: "" }, ...prevChoices.slice(index + 1)]);
                                        }}><FontAwesomeIcon icon={faPlus} disabled={choices.length >= 10} /></IconButton>}
                                        {editId === null && <IconButton variant="contained" color="error" onClick={() => {
                                            if (choices.length > 1) setChoices(prevChoices => [...prevChoices.slice(0, index), ...prevChoices.slice(index + 1)]);
                                        }}><FontAwesomeIcon icon={faMinus} disabled={choices.length <= 1} /></IconButton>}
                                        <IconButton variant="contained" color="info" onClick={() => {
                                            if (index >= 1) setChoices(prevChoices => [...prevChoices.slice(0, index - 1), prevChoices[index], prevChoices[index - 1], ...prevChoices.slice(index + 1)]);
                                        }}><FontAwesomeIcon icon={faArrowUp} disabled={index === 0} /></IconButton>
                                        <IconButton variant="contained" color="warning" onClick={() => {
                                            if (index <= choices.length - 2) setChoices(prevChoices => [...prevChoices.slice(0, index), prevChoices[index + 1], prevChoices[index], ...prevChoices.slice(index + 2)]);
                                        }} disabled={index === choices.length} ><FontAwesomeIcon icon={faArrowDown} /></IconButton>
                                    </ButtonGroup>
                                </Grid>;
                            })}
                            <Grid item xs={12} sx={{ mb: 0 }}>
                                <Typography variant="body2" sx={{ fontWeight: 800 }}>{tr("config")}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <FormControl component="fieldset">
                                    <DateTimeField
                                        label={tr("end_time")}
                                        defaultValue={endTime}
                                        onChange={(timestamp) => { setEndTime(timestamp); }}
                                        fullWidth
                                        disabled={noEndTime === true}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item xs={6}>
                                <FormControl component="fieldset" sx={{ mb: "10px" }}>
                                    <FormControlLabel
                                        key="always-active"
                                        control={
                                            <Checkbox
                                                name={tr("always_active")}
                                                checked={noEndTime}
                                                onChange={() => setNoEndTime(!noEndTime)}
                                            />
                                        }
                                        label={tr("always_active")}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item xs={6}>
                                <FormControl component="fieldset">
                                    <TextField
                                        label={tr("max_choice")}
                                        value={config.max_choice}
                                        onChange={(e) => { setConfig({ ...config, max_choice: e.target.value.replace(/[^0-9]/g, "") }); }}
                                        fullWidth
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item xs={6}>
                                <FormControl component="fieldset" sx={{ mb: "10px" }}>
                                    <FormControlLabel
                                        key="allow-modify-vote"
                                        control={
                                            <Checkbox
                                                name={tr("allow_poll_modification")}
                                                checked={config.allow_modify_vote}
                                                onChange={() => setConfig({ ...config, allow_modify_vote: !config.allow_modify_vote })}
                                            />
                                        }
                                        label={tr("allow_poll_modification")}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item xs={6}>
                                <FormControl component="fieldset" sx={{ mb: "10px" }}>
                                    <FormControlLabel
                                        key="anonymous-voting"
                                        control={
                                            <Checkbox
                                                name={tr("anonymous_voting")}
                                                checked={!config.show_voter}
                                                onChange={() => setConfig({ ...config, show_voter: !config.show_voter })}
                                            />
                                        }
                                        label={tr("anonymous_voting")}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item xs={6}>
                                <FormControl component="fieldset" sx={{ mb: "10px" }}>
                                    <FormControlLabel
                                        key="always-show-results"
                                        control={
                                            <Checkbox
                                                name={tr("show_results")}
                                                checked={config.show_stats}
                                                onChange={() => { setConfig({ ...config, show_stats: !config.show_stats }); }}
                                            />
                                        }
                                        label={tr("show_results")}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item xs={6}>
                                <FormControl component="fieldset" sx={{ mb: "10px" }}>
                                    <FormControlLabel
                                        key="show-stats-before-vote"
                                        control={
                                            <Checkbox
                                                name={tr("show_results_before_voting")}
                                                checked={config.show_stats_before_vote}
                                                onChange={() => { setConfig({ ...config, show_stats_before_vote: !config.show_stats_before_vote }); }}
                                            />
                                        }
                                        label={tr("show_results_before_voting")}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item xs={6}>
                                <FormControl component="fieldset" sx={{ mb: "10px" }}>
                                    <FormControlLabel
                                        key="show-stats-after-end"
                                        control={
                                            <Checkbox
                                                name={tr("show_results_after_ending")}
                                                checked={config.show_stats_when_ended}
                                                onChange={() => { setConfig({ ...config, show_stats_when_ended: !config.show_stats_when_ended }); }}
                                            />
                                        }
                                        label={tr("show_results_after_ending")}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item xs={6}>
                                <FormControl component="fieldset">
                                    <TextField
                                        label={tr("order_id")}
                                        value={orderId}
                                        onChange={(e) => { let f = e.target.value.startsWith("-"); setOrderId((f ? "-" : "") + e.target.value.replace(/[^0-9]/g, "")); }}
                                        fullWidth
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item xs={6}>
                                <FormControl component="fieldset" sx={{ mb: "10px" }}>
                                    <FormControlLabel
                                        key="pin"
                                        control={
                                            <Checkbox
                                                name={tr("pin")}
                                                checked={isPinned}
                                                onChange={() => setIsPinned(!isPinned)}
                                            />
                                        }
                                        label={tr("pin")}
                                    />
                                </FormControl>
                            </Grid>
                        </Grid>
                    </form>
                </DialogContent>
                <DialogActions>
                    <Button variant="primary" onClick={() => { setDialogOpen(false); clearModal(); }}>{tr("cancel")}</Button>
                    <Button variant="contained" onClick={handleSubmit} disabled={submitLoading}>{dialogButton}</Button>
                </DialogActions>
            </Dialog >
            <Dialog open={dialogDelete} onClose={() => setDialogDelete(false)}>
                <DialogTitle>{tr("delete_poll")}</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ minWidth: "400px", marginBottom: "20px" }}>{tr("delete_poll_confirm")}</Typography>
                    {toDelete !== null && toDelete.choices !== undefined && <PollCard poll={toDelete !== null ? toDelete : {}} />}
                </DialogContent>
                <DialogActions>
                    <Button variant="primary" onClick={() => { setDialogDelete(false); }}>{tr("cancel")}</Button>
                    <Button variant="contained" color="error" onClick={() => { deletePoll({ ...toDelete, confirmed: true }); }} disabled={submitLoading}>{tr("delete")}</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={dialogManagers} onClose={() => setDialogManagers(false)}>
                <DialogTitle>{tr("poll_managers")}</DialogTitle>
                <DialogContent>
                    <PollManagers />
                </DialogContent>
                <DialogActions>
                    <Button variant="primary" onClick={() => { setDialogManagers(false); }}>{tr("close")}</Button>
                </DialogActions>
            </Dialog>
            {pollDetails.choices !== undefined && <Dialog open={dialogVoters} onClose={() => setDialogVoters(false)} fullWidth>
                <DialogTitle>{tr("poll_voters")}</DialogTitle>
                <DialogContent>
                    {pollDetails.choices.map((choice) => (
                        <>
                            <Typography variant="body2" sx={{ fontWeight: 800 }}>
                                {choice.content}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: "10px" }}>
                                {choice.voters.map((user) => (
                                    <UserCard user={user} />
                                ))}
                                {choice.voters.length === 0 && <i>{tr("no_votes")}</i>}
                            </Typography>
                        </>
                    ))}
                </DialogContent>
                <DialogActions>
                    <Button variant="primary" onClick={() => { setDialogVoters(false); }}>{tr("close")}</Button>
                </DialogActions>
            </Dialog>}
            <SpeedDial
                ariaLabel={tr("controls")}
                sx={{ position: 'fixed', bottom: 20, right: 20 }}
                icon={<SpeedDialIcon />}
            >
                {checkUserPerm(curUserPerm, ["administrator", "manage_polls"]) && <SpeedDialAction
                    key="create"
                    icon={<EditNoteRounded />}
                    tooltipTitle={tr("create")}
                    onClick={() => createPoll()}
                />}
                {curUser.userid !== -1 && <SpeedDialAction
                    key="managers"
                    icon={<PeopleAltRounded />}
                    tooltipTitle={tr("managers")}
                    onClick={() => setDialogManagers(true)}
                />}
                <SpeedDialAction
                    key="refresh"
                    icon={<RefreshRounded />}
                    tooltipTitle={tr("refresh")}
                    onClick={() => doLoad()}
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
        </>
    );
};

export default Poll;