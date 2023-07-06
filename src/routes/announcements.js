import { useEffect, useState, useCallback, memo } from 'react';
import { Card, CardContent, Typography, Grid, SpeedDial, SpeedDialIcon, SpeedDialAction, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, TextField, Select, MenuItem, Snackbar, Alert, Pagination, IconButton } from '@mui/material';
import { InfoRounded, EventNoteRounded, WarningRounded, ErrorOutlineRounded, CheckCircleOutlineRounded, EditNoteRounded, RefreshRounded, EditRounded, DeleteRounded, PeopleAltRounded } from '@mui/icons-material';

import UserCard from '../components/usercard';
import MarkdownRenderer from '../components/markdown';
import TimeAgo from '../components/timeago';
import { makeRequests, makeRequestsWithAuth, checkUserPerm, customAxios as axios, checkPerm, getAuthToken } from '../functions';

var vars = require("../variables");

const STBOOL = (s) => {
    return s === "true";
}

const AnnouncementCard = ({ announcement, onEdit, onDelete }) => {
    const ICONS = { 0: <InfoRounded />, 1: <EventNoteRounded />, 2: <WarningRounded />, 3: <ErrorOutlineRounded />, 4: <CheckCircleOutlineRounded /> }
    const icon = ICONS[announcement.announcement_type.id];

    const showControls = (onEdit !== undefined) && (vars.isLoggedIn && checkUserPerm(["admin", "announcement"]));

    const [isShiftPressed, setIsShiftPressed] = useState(false);

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
        onEdit(announcement);
    }, [announcement, onEdit]);

    const handleDelete = useCallback(() => {
        onDelete(announcement, isShiftPressed);
    }, [announcement, isShiftPressed, onDelete]);

    if (announcement.title === undefined) {
        return <></>
    }

    const loc = announcement.display.replace("with-image-", "");
    let content = announcement.content.replace(`[Image src="${announcement.image}" loc="${loc}"]`, "").trimStart();

    if (announcement.display === "half-width") {
        return (
            <Grid item xs={12} sm={12} md={6} lg={6} key={announcement.announcementid}>
                <Card>
                    <CardContent>
                        <div style={{ marginBottom: "10px", display: 'flex', alignItems: "center" }}>
                            <Typography variant="h5" sx={{ flexGrow: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    {icon}&nbsp;&nbsp;{announcement.title}
                                </div>
                            </Typography>
                            {showControls && <div>
                                <IconButton size="small" aria-label="Edit" onClick={handleEdit}><EditRounded /></IconButton >
                                <IconButton size="small" aria-label="Delete" onClick={handleDelete}><DeleteRounded sx={{ "color": "red" }} /></IconButton >
                            </div>}
                        </div>
                        <Typography variant="body2"><MarkdownRenderer>{content}</MarkdownRenderer></Typography>
                    </CardContent>
                    <CardContent>
                        <Typography variant="caption"><UserCard user={announcement.author} inline={true} /> | <TimeAgo timestamp={announcement.timestamp * 1000} /></Typography>
                    </CardContent>
                </Card>
            </Grid>
        );
    } else if (announcement.display === "full-width") {
        return (
            <Grid item xs={12} sm={12} md={12} lg={12} key={announcement.announcementid}>
                <Card>
                    <CardContent>
                        <div style={{ marginBottom: "10px", display: 'flex', alignItems: "center" }}>
                            <Typography variant="h5" sx={{ flexGrow: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    {icon}&nbsp;&nbsp;{announcement.title}
                                </div>
                            </Typography>
                            {showControls && <div>
                                <IconButton size="small" aria-label="Edit" onClick={handleEdit}><EditRounded /></IconButton >
                                <IconButton size="small" aria-label="Delete" onClick={handleDelete}><DeleteRounded sx={{ "color": "red" }} /></IconButton >
                            </div>}
                        </div>
                        <Typography variant="body2"><MarkdownRenderer>{content}</MarkdownRenderer></Typography>
                    </CardContent>
                    <CardContent>
                        <Typography variant="caption"><UserCard user={announcement.author} inline={true} /> | <TimeAgo timestamp={announcement.timestamp * 1000} /></Typography>
                    </CardContent>
                </Card>
            </Grid>
        );
    } else if (announcement.display === "with-image-left") {
        return (
            <Grid item xs={12} sm={12} md={12} lg={12} key={announcement.announcementid}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={12} md={6} lg={6}>
                        <img src={announcement.image} alt="Banner" style={{ width: '100%', border: 'none' }} />
                    </Grid>
                    <Grid item xs={12} sm={12} md={6} lg={6} style={{ display: 'flex' }}>
                        <Card style={{ display: 'flex', flexDirection: 'column' }}>
                            <CardContent>
                                <div style={{ marginBottom: "10px", display: 'flex', alignItems: "center" }}>
                                    <Typography variant="h5" sx={{ flexGrow: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            {icon}&nbsp;&nbsp;{announcement.title}
                                        </div>
                                    </Typography>
                                    {showControls && <div>
                                        <IconButton size="small" aria-label="Edit" onClick={handleEdit}><EditRounded /></IconButton >
                                        <IconButton size="small" aria-label="Delete" onClick={handleDelete}><DeleteRounded sx={{ "color": "red" }} /></IconButton >
                                    </div>}
                                </div>
                                <Typography variant="body2"><MarkdownRenderer>{content}</MarkdownRenderer></Typography>
                            </CardContent>
                            <CardContent>
                                <Typography variant="caption"><UserCard user={announcement.author} inline={true} /> | <TimeAgo timestamp={announcement.timestamp * 1000} /></Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Grid>
        );
    } else if (announcement.display === "with-image-right") {
        return (
            <Grid item xs={12} sm={12} md={12} lg={12} key={announcement.announcementid}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={12} md={6} lg={6} style={{ display: 'flex' }}>
                        <Card style={{ display: 'flex', flexDirection: 'column' }}>
                            <CardContent>
                                <div style={{ marginBottom: "10px", display: 'flex', alignItems: "center" }}>
                                    <Typography variant="h5" sx={{ flexGrow: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            {icon}&nbsp;&nbsp;{announcement.title}
                                        </div>
                                    </Typography>
                                    {showControls && <div>
                                        <IconButton size="small" aria-label="Edit" onClick={handleEdit}><EditRounded /></IconButton >
                                        <IconButton size="small" aria-label="Delete" onClick={handleDelete}><DeleteRounded sx={{ "color": "red" }} /></IconButton >
                                    </div>}
                                </div>
                                <Typography variant="body2"><MarkdownRenderer>{content}</MarkdownRenderer></Typography>
                            </CardContent>
                            <CardContent>
                                <Typography variant="caption"><UserCard user={announcement.author} inline={true} /> | <TimeAgo timestamp={announcement.timestamp * 1000} /></Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={12} md={6} lg={6}>
                        <img src={announcement.image} alt="Banner" style={{ width: '100%', border: 'none' }} />
                    </Grid>
                </Grid>
            </Grid>
        );
    }
};

const AnnouncementGrid = memo(({ announcements, lastUpdate, onEdit, onDelete }) => {
    let halfCnt = 0;
    return <Grid container spacing={3}>
        {announcements.map((announcement, index) => {
            announcement.display = 'half-width';

            const hasImage = /^\[Image src="(.+)" loc="(.+)"\]/.test(announcement.content);

            if (hasImage) {
                const re = announcement.content.match(/^\[Image src="(.+)" loc="(.+)"\]/);
                const link = re[1];
                const loc = re[2];
                announcement.image = link;
                announcement.display = 'with-image-' + loc;
                halfCnt = 0;
            } else {
                if (index + 1 < announcements.length) {
                    const nextAnnouncement = announcements[index + 1];
                    const nextHasImage = /^\[Image src="(.+)" loc="(.+)"\]/.test(nextAnnouncement.content);

                    if (nextHasImage) {
                        if (halfCnt % 2 === 1) {
                            announcement.display = 'half-width';
                            halfCnt += 1;
                        } else {
                            announcement.display = 'full-width';
                            halfCnt = 0;
                        }
                    } else {
                        announcement.display = 'half-width';
                        halfCnt += 1;
                    }
                }
            }

            return (
                <AnnouncementCard
                    announcement={announcement}
                    key={announcement.announcementid}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            );
        })}
    </Grid>
}, (prevProps, nextProps) => {
    return prevProps.lastUpdate === nextProps.lastUpdate;
});

const AnnouncementManagers = memo(() => {
    let managers = [];
    for (let i = 0; i < vars.members.length; i++) {
        if (checkPerm(vars.members[i].roles, ["admin", "announcement"])) {
            managers.push(vars.members[i]);
        }
    }

    return <>{
        managers.map((user) => (
            <UserCard key={`user-${user.userid}`} user={user} useChip={true} inline={true} />
        ))
    }</>;
})

const Announcement = () => {
    const [announcements, setAnnouncemnts] = useState([]);
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
    const [dialogTitle, setDialogTitle] = useState("Create Announcement");
    const [dialogButton, setDialogButton] = useState("Create");
    const [dialogDelete, setDialogDelete] = useState(false);
    const [toDelete, setToDelete] = useState(null);
    const [dialogManagers, setDialogManagers] = useState(false);

    const [editId, setEditId] = useState(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [announcementType, setAnnouncementType] = useState(0);
    const [isPrivate, setIsPrivate] = useState("false");
    const [orderId, setOrderId] = useState(0);
    const [isPinned, setIsPinned] = useState("false");

    const clearModal = useCallback(() => {
        setTitle('');
        setContent('');
        setAnnouncementType(0);
        setIsPrivate(false);
        setOrderId(0);
        setIsPinned(false);
    }, []);

    const doLoad = useCallback(async () => {
        const loadingStart = new CustomEvent('loadingStart', {});
        window.dispatchEvent(loadingStart);

        let url = `${vars.dhpath}/announcements/list?page_size=10&page=${page}`;

        var newAnns = [];
        if (vars.isLoggedIn) {
            const [anns] = await makeRequestsWithAuth([
                url
            ]);
            newAnns = anns.list;
            setTotalPages(anns.total_pages);
        } else {
            const [anns] = await makeRequests([
                url
            ]);
            newAnns = anns.list;
            setTotalPages(anns.total_pages);
        }

        for (let i = 0; i < newAnns.length; i++) {
            newAnns[i] = { ...newAnns[i] };
        }

        setAnnouncemnts(newAnns);
        setLastUpdate(+new Date());

        const loadingEnd = new CustomEvent('loadingEnd', {});
        window.dispatchEvent(loadingEnd);
    }, [page]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        if (editId === null) {
            let resp = await axios({ url: `${vars.dhpath}/announcements`, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` }, data: { "title": title, "content": content, "announcement_type": parseInt(announcementType), "is_private": STBOOL(isPrivate), "orderid": parseInt(orderId), "is_pinned": STBOOL(isPinned) } });
            if (resp.status === 200) {
                doLoad();
                setSnackbarContent("Announcement posted!");
                setSnackbarSeverity("success");
                clearModal();
                setDialogOpen(false);
            } else {
                setSnackbarContent(resp.data.error);
                setSnackbarSeverity("error");
            }
        } else {
            let resp = await axios({ url: `${vars.dhpath}/announcements/${editId}`, method: "PATCH", headers: { Authorization: `Bearer ${getAuthToken()}` }, data: { "title": title, "content": content, "announcement_type": parseInt(announcementType), "is_private": STBOOL(isPrivate), "orderid": parseInt(orderId), "is_pinned": STBOOL(isPinned) } });
            if (resp.status === 204) {
                doLoad();
                setSnackbarContent("Announcement updated!");
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
    }, [announcementType, title, content, editId, isPinned, isPrivate, orderId, clearModal, doLoad]);

    const createAnnouncement = useCallback(() => {
        if (editId !== null) {
            setEditId(null);
            clearModal();
        }
        setDialogTitle("Create Announcement");
        setDialogButton("Create");
        setDialogOpen(true);
    }, [editId, clearModal]);

    const editAnnouncement = useCallback((announcement) => {
        clearModal();

        setTitle(announcement.title);
        setContent(announcement.content);
        setAnnouncementType(announcement.announcement_type.id);
        setIsPrivate(announcement.is_private);
        setOrderId(announcement.orderid);
        setIsPinned(announcement.is_pinned);

        setEditId(announcement.announcementid);

        setDialogTitle("Edit Announcement");
        setDialogButton("Edit");
        setDialogOpen(true);
    }, [clearModal]);

    const deleteAnnouncement = useCallback(async (announcement, isShiftPressed) => {
        if (isShiftPressed === true || announcement.confirmed === true) {
            setSubmitLoading(true);
            let resp = await axios({ url: `${vars.dhpath}/announcements/${announcement.announcementid}`, method: "DELETE", headers: { Authorization: `Bearer ${getAuthToken()}` } });
            if (resp.status === 204) {
                doLoad();
                setSnackbarContent("Announcement deleted!");
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
            setToDelete(announcement);
        }
    }, [doLoad]);

    useEffect(() => {
        doLoad();
    }, [doLoad]);

    return (
        <>
            <AnnouncementGrid announcements={announcements} lastUpdate={lastUpdate} onEdit={editAnnouncement} onDelete={deleteAnnouncement} />
            {announcements.length !== 0 && <Pagination count={totalPages} onChange={handlePagination}
                sx={{ display: "flex", justifyContent: "flex-end", marginTop: "10px", marginRight: "50px" }} />}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <DialogTitle>{dialogTitle}</DialogTitle>
                <DialogContent>
                    <form onSubmit={handleSubmit} style={{ marginTop: "5px" }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    label="Title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Content (Markdown)"
                                    multiline
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    fullWidth
                                    minRows={4}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <FormControl component="fieldset">
                                            <FormLabel component="legend">Announcement Type</FormLabel>
                                            <Select value={announcementType} onChange={(e) => setAnnouncementType(e.target.value)} sx={{ marginTop: "6px", height: "30px" }}>
                                                {(vars.announcementTypes).map((option) => (
                                                    <MenuItem key={option.id} value={option.id}>
                                                        {option.name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <FormControl component="fieldset">
                                            <FormLabel component="legend">Visibility</FormLabel>
                                            <RadioGroup
                                                value={isPrivate} row
                                                onChange={(e) => setIsPrivate(e.target.value)}
                                            >
                                                <FormControlLabel value="false" control={<Radio />} label="Public" />
                                                <FormControlLabel value="true" control={<Radio />} label="Private" />
                                            </RadioGroup>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <FormControl component="fieldset">
                                            <TextField
                                                label="Order ID"
                                                value={orderId}
                                                onChange={(e) => { let f = e.target.value.startsWith("-"); setOrderId((f ? "-" : "") + e.target.value.replace(/[^0-9]/g, "")) }}
                                                fullWidth
                                            />
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <FormControl component="fieldset">
                                            <FormLabel component="legend">Pin?</FormLabel>
                                            <RadioGroup
                                                value={isPinned} row
                                                onChange={(e) => setIsPinned(e.target.value)}
                                            >
                                                <FormControlLabel value="true" control={<Radio />} label="Yes" />
                                                <FormControlLabel value="false" control={<Radio />} label="No" />
                                            </RadioGroup>
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </form>
                </DialogContent>
                <DialogActions>
                    <Button variant="primary" onClick={() => { setDialogOpen(false); clearModal(); }}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmit} disabled={submitLoading}>{dialogButton}</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={dialogDelete} onClose={() => setDialogDelete(false)}>
                <DialogTitle>Delete Announcement</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ minWidth: "400px", marginBottom: "20px" }}>Are you sure you want to delete this announcement?</Typography>
                    <AnnouncementCard announcement={toDelete !== null ? toDelete : {}} />
                </DialogContent>
                <DialogActions>
                    <Button variant="primary" onClick={() => { setDialogDelete(false) }}>Cancel</Button>
                    <Button variant="contained" onClick={() => { deleteAnnouncement({ ...toDelete, confirmed: true }); }} disabled={submitLoading}>Delete</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={dialogManagers} onClose={() => setDialogManagers(false)}>
                <DialogTitle>Announcement Managers</DialogTitle>
                <DialogContent>
                    <AnnouncementManagers />
                </DialogContent>
                <DialogActions>
                    <Button variant="primary" onClick={() => { setDialogManagers(false) }}>Close</Button>
                </DialogActions>
            </Dialog>
            <SpeedDial
                ariaLabel="Controls"
                sx={{ position: 'fixed', bottom: 20, right: 20 }}
                icon={<SpeedDialIcon />}
            >
                {checkUserPerm(["admin", "announcement"]) && <SpeedDialAction
                    key="create"
                    icon={<EditNoteRounded />}
                    tooltipTitle="Create"
                    onClick={() => createAnnouncement()}
                />}
                {vars.userInfo.userid !== -1 && <SpeedDialAction
                    key="managers"
                    icon={<PeopleAltRounded />}
                    tooltipTitle="Managers"
                    onClick={() => setDialogManagers(true)}
                />}
                <SpeedDialAction
                    key="refresh"
                    icon={<RefreshRounded />}
                    tooltipTitle="Refresh"
                    onClick={() => doLoad()}
                />
            </SpeedDial>
            <Snackbar
                dialogOpen={!!snackbarContent}
                autoHideDuration={5000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
                    {snackbarContent}
                </Alert>
            </Snackbar>
        </>
    );
};

export default Announcement;