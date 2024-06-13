import { useEffect, useState, useCallback, useContext, useRef, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { AppContext, CacheContext } from '../context';

import { Card, CardContent, Typography, Grid, SpeedDial, SpeedDialIcon, SpeedDialAction, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, TextField, MenuItem, Snackbar, Alert, Pagination, IconButton, Checkbox, InputAdornment, Box } from '@mui/material';
import { InfoRounded, EventNoteRounded, WarningRounded, ErrorOutlineRounded, CheckCircleOutlineRounded, EditNoteRounded, RefreshRounded, EditRounded, DeleteRounded, PeopleAltRounded, CloseRounded } from '@mui/icons-material';
import { Portal } from '@mui/base';

import UserCard from '../components/usercard';
import MarkdownRenderer from '../components/markdown';
import TimeAgo from '../components/timeago';
import { makeRequests, makeRequestsWithAuth, checkUserPerm, customAxios as axios, checkPerm, getAuthToken } from '../functions';

const AnnouncementCard = ({ announcement, onEdit, onDelete }) => {
    const { t: tr } = useTranslation();
    const { curUID, curUserPerm } = useContext(AppContext);

    const ICONS = { 0: <InfoRounded />, 1: <EventNoteRounded />, 2: <WarningRounded />, 3: <ErrorOutlineRounded />, 4: <CheckCircleOutlineRounded /> };
    const icon = ICONS[announcement.type.id];

    const showControls = (onEdit !== undefined) && (curUID !== null && checkUserPerm(curUserPerm, ["administrator", "manage_announcements"]));

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
        return <></>;
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
                                <IconButton size="small" aria-label={tr("edit")} onClick={handleEdit}><EditRounded /></IconButton >
                                <IconButton size="small" aria-label={tr("delete")} onClick={handleDelete}><DeleteRounded sx={{ "color": "red" }} /></IconButton >
                            </div>}
                        </div>
                        <Typography variant="body2"><MarkdownRenderer>{content}</MarkdownRenderer></Typography>
                    </CardContent>
                    <CardContent>
                        <Typography variant="caption"><UserCard user={announcement.author} inline={true} /> | <TimeAgo key={`${+new Date()}`} timestamp={announcement.timestamp * 1000} /></Typography>
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
                                <IconButton size="small" aria-label={tr("edit")} onClick={handleEdit}><EditRounded /></IconButton >
                                <IconButton size="small" aria-label={tr("delete")} onClick={handleDelete}><DeleteRounded sx={{ "color": "red" }} /></IconButton >
                            </div>}
                        </div>
                        <Typography variant="body2"><MarkdownRenderer>{content}</MarkdownRenderer></Typography>
                    </CardContent>
                    <CardContent>
                        <Typography variant="caption"><UserCard user={announcement.author} inline={true} /> | <TimeAgo key={`${+new Date()}`} timestamp={announcement.timestamp * 1000} /></Typography>
                    </CardContent>
                </Card>
            </Grid>
        );
    } else if (announcement.display === "with-image-left") {
        return (
            <Grid item xs={12} sm={12} md={12} lg={12} key={announcement.announcementid}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={12} md={6} lg={6}>
                        <img src={announcement.image} alt="" style={{ width: '100%', border: 'none' }} />
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
                                        <IconButton size="small" aria-label={tr("edit")} onClick={handleEdit}><EditRounded /></IconButton >
                                        <IconButton size="small" aria-label={tr("delete")} onClick={handleDelete}><DeleteRounded sx={{ "color": "red" }} /></IconButton >
                                    </div>}
                                </div>
                                <Typography variant="body2"><MarkdownRenderer>{content}</MarkdownRenderer></Typography>
                            </CardContent>
                            <CardContent>
                                <Typography variant="caption"><UserCard user={announcement.author} inline={true} /> | <TimeAgo key={`${+new Date()}`} timestamp={announcement.timestamp * 1000} /></Typography>
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
                                        <IconButton size="small" aria-label={tr("edit")} onClick={handleEdit}><EditRounded /></IconButton >
                                        <IconButton size="small" aria-label={tr("delete")} onClick={handleDelete}><DeleteRounded sx={{ "color": "red" }} /></IconButton >
                                    </div>}
                                </div>
                                <Typography variant="body2"><MarkdownRenderer>{content}</MarkdownRenderer></Typography>
                            </CardContent>
                            <CardContent>
                                <Typography variant="caption"><UserCard user={announcement.author} inline={true} /> | <TimeAgo key={`${+new Date()}`} timestamp={announcement.timestamp * 1000} /></Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={12} md={6} lg={6}>
                        <img src={announcement.image} alt="" style={{ width: '100%', border: 'none' }} />
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
    </Grid>;
}, (prevProps, nextProps) => {
    return prevProps.lastUpdate === nextProps.lastUpdate;
});

const AnnouncementManagers = memo(() => {
    const { allPerms, users, memberUIDs } = useContext(AppContext);
    const allMembers = memberUIDs.map((uid) => users[uid]);

    let managers = [];
    for (let i = 0; i < allMembers.length; i++) {
        if (checkPerm(allMembers[i].roles, ["administrator", "manage_announcements"], allPerms)) {
            managers.push(allMembers[i]);
        }
    }

    return <>{
        managers.map((user) => (
            <UserCard user={user} useChip={true} inline={true} />
        ))
    }</>;
});

const Announcement = () => {
    const { t: tr } = useTranslation();
    const { apiPath, curUID, curUser, curUserPerm, announcementTypes, loadAnnouncementTypes } = useContext(AppContext);
    const { cache, setCache } = useContext(CacheContext);

    const [announcements, setAnnouncemnts] = useState(cache.announcement.announcements);
    const [lastUpdate, setLastUpdate] = useState(0);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [page, setPage] = useState(cache.announcement.page);
    const pageRef = useRef(cache.announcement.page);
    const [totalPages, setTotalPages] = useState(cache.announcement.totalPages);
    useEffect(() => {
        pageRef.current = page;
    }, [page]);
    const handlePagination = useCallback((event, value) => {
        setPage(value);
    }, []);

    useEffect(() => {
        return () => {
            setCache({ ...cache, announcement: { announcements, page, totalPages } });
        };
    }, [announcements, page, totalPages]);

    const [snackbarContent, setSnackbarContent] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const handleCloseSnackbar = useCallback(() => {
        setSnackbarContent("");
    }, []);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogTitle, setDialogTitle] = useState(tr("create_announcement"));
    const [dialogButton, setDialogButton] = useState(tr("create"));
    const [dialogDelete, setDialogDelete] = useState(false);
    const [toDelete, setToDelete] = useState(null);
    const [dialogManagers, setDialogManagers] = useState(false);

    const [editId, setEditId] = useState(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [announcementType, setAnnouncementType] = useState(0);
    const [isPrivate, setIsPrivate] = useState(false);
    const [orderId, setOrderId] = useState(0);
    const [isPinned, setIsPinned] = useState(false);

    const clearModal = useCallback(() => {
        setTitle('');
        setContent('');
        setAnnouncementType(0);
        setIsPrivate(false);
        setOrderId(0);
        setIsPinned(false);
    }, []);

    const doLoad = useCallback(async () => {
        window.loading += 1;

        let localAnnouncementTypes = announcementTypes;
        if (announcementTypes === null) {
            localAnnouncementTypes = await loadAnnouncementTypes();
        }

        let [anns] = [null];
        if (curUID !== null) {
            [anns] = await makeRequestsWithAuth([`${apiPath}/announcements/list?page_size=10&page=${page}`]);
        } else {
            [anns] = await makeRequests([`${apiPath}/announcements/list?page_size=10&page=${page}`]);
        }

        if (page === pageRef.current) {
            setAnnouncemnts(anns.list);
            setTotalPages(anns.total_pages);
            setLastUpdate(+new Date());
        }

        window.loading -= 1;
    }, [apiPath, page, announcementTypes]);

    const [importDisabled, setImportDisabled] = useState(false);
    const importTMPNews = useCallback(async () => {
        setImportDisabled(true);

        const match = title.match(/https:\/\/truckersmp\.com\/vtc\/(.*)\/news\/(\d+)/);
        const vtcID = match[1];
        const newsID = match[2];
        const resp = await axios({ url: `https://corsproxy.io/?https://api.truckersmp.com/v2/vtc/${vtcID}/news/${newsID}`, fetchOnly: true });
        if (resp.status !== 200) {
            setImportDisabled(false);
            setSnackbarContent("Invalid TruckersMP news link");
            setSnackbarSeverity("error");
            return;
        }

        const news = resp.data.response;

        setTitle(news.title);
        setContent(news.content);
        setIsPinned(news.pinned);
    }, [title]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        if (editId === null) {
            let resp = await axios({ url: `${apiPath}/announcements`, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` }, data: { "title": title, "content": content, "type": parseInt(announcementType), "is_private": isPrivate, "orderid": parseInt(orderId), "is_pinned": isPinned } });
            if (resp.status === 200) {
                doLoad();
                setSnackbarContent(tr("announcement_posted"));
                setSnackbarSeverity("success");
                clearModal();
                setDialogOpen(false);
            } else {
                setSnackbarContent(resp.data.error);
                setSnackbarSeverity("error");
            }
        } else {
            let resp = await axios({ url: `${apiPath}/announcements/${editId}`, method: "PATCH", headers: { Authorization: `Bearer ${getAuthToken()}` }, data: { "title": title, "content": content, "type": parseInt(announcementType), "is_private": isPrivate, "orderid": parseInt(orderId), "is_pinned": isPinned } });
            if (resp.status === 204) {
                doLoad();
                setSnackbarContent(tr("announcement_updated"));
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
    }, [apiPath, announcementType, title, content, editId, isPinned, isPrivate, orderId]);

    const createAnnouncement = useCallback(() => {
        if (editId !== null) {
            setEditId(null);
            clearModal();
        }
        setDialogTitle(tr("create_announcement"));
        setDialogButton(tr("create"));
        setDialogOpen(true);
    }, [editId, clearModal]);

    const editAnnouncement = useCallback((announcement) => {
        clearModal();

        setTitle(announcement.title);
        setContent(announcement.content);
        setAnnouncementType(announcement.type.id);
        setIsPrivate(announcement.is_private);
        setOrderId(announcement.orderid);
        setIsPinned(announcement.is_pinned);

        setEditId(announcement.announcementid);

        setDialogTitle(tr("edit_announcement"));
        setDialogButton(tr("edit"));
        setDialogOpen(true);
    }, [clearModal]);

    const deleteAnnouncement = useCallback(async (announcement, isShiftPressed) => {
        if (isShiftPressed === true || announcement.confirmed === true) {
            setSubmitLoading(true);
            let resp = await axios({ url: `${apiPath}/announcements/${announcement.announcementid}`, method: "DELETE", headers: { Authorization: `Bearer ${getAuthToken()}` } });
            if (resp.status === 204) {
                doLoad();
                setSnackbarContent(tr("announcement_deleted"));
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
    }, [apiPath]);

    useEffect(() => {
        doLoad();
    }, [apiPath, page, announcementTypes]);

    return (
        <>{announcementTypes !== null && <>
            <AnnouncementGrid announcements={announcements} lastUpdate={lastUpdate} onEdit={editAnnouncement} onDelete={deleteAnnouncement} />
            {announcements.length !== 0 && <Pagination count={totalPages} onChange={handlePagination}
                sx={{ display: "flex", justifyContent: "flex-end", marginTop: "10px", marginRight: "10px" }} />}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <DialogTitle>
                    {dialogTitle}
                    <IconButton style={{ position: 'absolute', right: '10px', top: '10px' }} onClick={() => setDialogOpen(false)}>
                        <CloseRounded />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <form onSubmit={handleSubmit} style={{ marginTop: "5px" }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    label={tr("title")}
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    fullWidth
                                    InputProps={{
                                        endAdornment: (
                                            <>{title.match(/https:\/\/truckersmp\.com\/vtc\/(.*)\/news\/(\d+)/) && <InputAdornment position="end">
                                                <Button variant="contained" onClick={() => { importTMPNews(); }} disabled={importDisabled}>{tr("import")}</Button>
                                            </InputAdornment>}</>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label={tr("content_markdown")}
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
                                        <TextField select label={tr("announcement_type")} value={announcementType} onChange={(e) => setAnnouncementType(e.target.value)} sx={{ marginTop: "6px", height: "30px" }} fullWidth>
                                            {(announcementTypes).map((option) => (
                                                <MenuItem key={option.id} value={option.id}>
                                                    {option.name}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <FormControl component="fieldset">
                                            <FormLabel component="legend">{tr("visibility")}</FormLabel>
                                            <RadioGroup
                                                value={isPrivate} row
                                                onChange={(e) => setIsPrivate(e.target.value)}
                                            >
                                                <FormControlLabel value={false} control={<Radio />} label={tr("public")} />
                                                <FormControlLabel value={true} control={<Radio />} label={tr("private")} />
                                            </RadioGroup>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            label={tr("order_id")}
                                            value={orderId}
                                            onChange={(e) => { let f = e.target.value.startsWith("-"); setOrderId((f ? "-" : "") + e.target.value.replace(/[^0-9]/g, "")); }}
                                            fullWidth
                                        />
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
                            </Grid>
                        </Grid>
                    </form>
                </DialogContent>
                <DialogActions>
                    <Grid container justifyContent="space-between" padding="10px">
                        <Grid item>
                            <Box sx={{ display: 'flex', gap: '10px' }}>
                                <Button variant="contained" onClick={clearModal}>{tr("clear")}</Button>
                            </Box>
                        </Grid>
                        <Grid item>
                            <Box sx={{ display: 'flex', gap: '10px' }}>
                                <Button variant="contained" color="info" onClick={handleSubmit} disabled={submitLoading}>{dialogButton}</Button>
                            </Box>
                        </Grid>
                    </Grid>
                </DialogActions>
            </Dialog>
            <Dialog open={dialogDelete} onClose={() => setDialogDelete(false)}>
                <DialogTitle>
                    {tr("delete_announcement")}
                    <IconButton style={{ position: 'absolute', right: '10px', top: '10px' }} onClick={() => setDialogDelete(false)}>
                        <CloseRounded />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ minWidth: "400px", marginBottom: "20px" }}>{tr("are_you_sure_you_want")}</Typography>
                    <AnnouncementCard announcement={toDelete !== null ? toDelete : {}} />
                </DialogContent>
                <DialogActions>
                    <Grid container justifyContent="space-between" padding="10px">
                        <Grid item>
                            <Box sx={{ display: 'flex', gap: '10px' }}>
                                <Button variant="contained" onClick={() => { setDialogDelete(false); }}>{tr("cancel")}</Button>
                            </Box>
                        </Grid>
                        <Grid item>
                            <Box sx={{ display: 'flex', gap: '10px' }}>
                                <Button variant="contained" color="error" onClick={() => { deleteAnnouncement({ ...toDelete, confirmed: true }); }} disabled={submitLoading}>{tr("delete")}</Button>
                            </Box>
                        </Grid>
                    </Grid>
                </DialogActions>
            </Dialog>
            <Dialog open={dialogManagers} onClose={() => setDialogManagers(false)}>
                <DialogTitle>
                    {tr("announcement_managers")}
                    <IconButton style={{ position: 'absolute', right: '10px', top: '10px' }} onClick={() => setDialogOpen(false)}>
                        <CloseRounded />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <AnnouncementManagers />
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" onClick={() => { setDialogManagers(false); }}>{tr("close")}</Button>
                </DialogActions>
            </Dialog>
            <SpeedDial
                ariaLabel={tr("controls")}
                sx={{ position: 'fixed', bottom: 20, right: 20 }}
                icon={<SpeedDialIcon />}
            >
                {checkUserPerm(curUserPerm, ["administrator", "manage_announcements"]) && <SpeedDialAction
                    key="create"
                    icon={<EditNoteRounded />}
                    tooltipTitle={tr("create")}
                    onClick={() => createAnnouncement()}
                />}
                {!isNaN(curUser.userid) && <SpeedDialAction
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
        </>}</>
    );
};

export default Announcement;