import { useEffect, useState, useCallback, useContext, useRef, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { AppContext, CacheContext } from '../context';

import { Card, CardContent, Typography, Grid, SpeedDial, SpeedDialIcon, SpeedDialAction, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, TextField, Snackbar, Alert, Pagination, IconButton, Checkbox, Box } from '@mui/material';
import { DownloadRounded, EditNoteRounded, RefreshRounded, EditRounded, DeleteRounded, PeopleAltRounded, CloseRounded } from '@mui/icons-material';
import { Portal } from '@mui/base';

import UserCard from '../components/usercard';
import MarkdownRenderer from '../components/markdown';
import TimeDelta from '../components/timedelta';

import { makeRequests, makeRequestsWithAuth, checkUserPerm, customAxios as axios, checkPerm, downloadFile, getAuthToken } from '../functions';

const DownloadableItemCard = ({ downloadableItem, onEdit, onDelete, onDownload }) => {
    const { t: tr } = useTranslation();
    const { curUID, curUserPerm } = useContext(AppContext);

    const showButtons = onEdit !== undefined;
    const showControls = (onEdit !== undefined) && (curUID !== null && checkUserPerm(curUserPerm, ["administrator", "manage_downloads"]));

    const [isShiftPressed, setIsShiftPressed] = useState(false);
    const [downloading, setDownloading] = useState(false);

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
        onEdit(downloadableItem);
    }, [downloadableItem, onEdit]);

    const handleDelete = useCallback(() => {
        onDelete(downloadableItem, isShiftPressed);
    }, [downloadableItem, isShiftPressed, onDelete]);

    const handleDownload = useCallback(async () => {
        setDownloading(true);
        await onDownload(downloadableItem);
        setDownloading(false);
    }, [downloadableItem, onDownload]);

    if (downloadableItem.title === undefined) {
        return <></>;
    }

    const loc = downloadableItem.display.replace("with-image-", "");
    let description = downloadableItem.description.replace(`[Image src="${downloadableItem.image}" loc="${loc}"]`, "").trimStart();

    if (downloadableItem.display === "half-width") {
        return (
            <Grid item xs={12} sm={12} md={6} lg={6} key={downloadableItem.downloadsid}>
                <Card>
                    <CardContent>
                        <div style={{ marginBottom: "10px", display: 'flex', alignItems: "center" }}>
                            <Typography variant="h5" sx={{ flexGrow: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    {downloadableItem.title}
                                </div>
                            </Typography>
                            {(showButtons) && <div>
                                <IconButton size="small" aria-label={tr("download")} onClick={handleDownload} disabled={downloading}><DownloadRounded /></IconButton >
                            </div>}
                            {(showControls && showButtons) && <div>
                                <IconButton size="small" aria-label={tr("edit")} onClick={handleEdit}><EditRounded /></IconButton >
                                <IconButton size="small" aria-label={tr("delete")} onClick={handleDelete}><DeleteRounded sx={{ "color": "red" }} /></IconButton >
                            </div>}
                        </div>
                        <Typography variant="body2"><MarkdownRenderer>{description}</MarkdownRenderer></Typography>
                    </CardContent>
                    <CardContent>
                        <Typography variant="caption"><UserCard user={downloadableItem.creator} inline={true} />{downloadableItem.timestamp !== 0 && <> | <TimeDelta key={`${+new Date()}`} timestamp={downloadableItem.timestamp * 1000} /></>}</Typography>
                    </CardContent>
                </Card>
            </Grid>
        );
    } else if (downloadableItem.display === "full-width") {
        return (
            <Grid item xs={12} sm={12} md={12} lg={12} key={downloadableItem.downloadsid}>
                <Card>
                    <CardContent>
                        <div style={{ marginBottom: "10px", display: 'flex', alignItems: "center" }}>
                            <Typography variant="h5" sx={{ flexGrow: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    {downloadableItem.title}
                                </div>
                            </Typography>
                            {(showButtons) && <div>
                                <IconButton size="small" aria-label={tr("download")} onClick={handleDownload} disabled={downloading}><DownloadRounded /></IconButton >
                            </div>}
                            {(showControls && showButtons) && <div>
                                <IconButton size="small" aria-label={tr("edit")} onClick={handleEdit}><EditRounded /></IconButton >
                                <IconButton size="small" aria-label={tr("delete")} onClick={handleDelete}><DeleteRounded sx={{ "color": "red" }} /></IconButton >
                            </div>}
                        </div>
                        <Typography variant="body2"><MarkdownRenderer>{description}</MarkdownRenderer></Typography>
                    </CardContent>
                    <CardContent>
                        <Typography variant="caption"><UserCard user={downloadableItem.creator} inline={true} />{downloadableItem.timestamp !== 0 && <> | <TimeDelta key={`${+new Date()}`} timestamp={downloadableItem.timestamp * 1000} /></>}</Typography>
                    </CardContent>
                </Card>
            </Grid>
        );
    } else if (downloadableItem.display === "with-image-left") {
        return (
            <Grid item xs={12} sm={12} md={12} lg={12} key={downloadableItem.downloadsid}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={12} md={6} lg={6}>
                        <img src={downloadableItem.image} alt="" style={{ width: '100%', border: 'none' }} />
                    </Grid>
                    <Grid item xs={12} sm={12} md={6} lg={6} style={{ display: 'flex' }}>
                        <Card style={{ display: 'flex', flexDirection: 'column' }}>
                            <CardContent>
                                <div style={{ marginBottom: "10px", display: 'flex', alignItems: "center" }}>
                                    <Typography variant="h5" sx={{ flexGrow: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            {downloadableItem.title}
                                        </div>
                                    </Typography>
                                    {(showButtons) && <div>
                                        <IconButton size="small" aria-label={tr("download")} onClick={handleDownload} disabled={downloading}><DownloadRounded /></IconButton >
                                    </div>}
                                    {(showControls && showButtons) && <div>
                                        <IconButton size="small" aria-label={tr("edit")} onClick={handleEdit}><EditRounded /></IconButton >
                                        <IconButton size="small" aria-label={tr("delete")} onClick={handleDelete}><DeleteRounded sx={{ "color": "red" }} /></IconButton >
                                    </div>}
                                </div>
                                <Typography variant="body2"><MarkdownRenderer>{description}</MarkdownRenderer></Typography>
                            </CardContent>
                            <CardContent>
                                <Typography variant="caption"><UserCard user={downloadableItem.creator} inline={true} />{downloadableItem.timestamp !== 0 && <> | <TimeDelta key={`${+new Date()}`} timestamp={downloadableItem.timestamp * 1000} /></>}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Grid>
        );
    } else if (downloadableItem.display === "with-image-right") {
        return (
            <Grid item xs={12} sm={12} md={12} lg={12} key={downloadableItem.downloadsid}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={12} md={6} lg={6} style={{ display: 'flex' }}>
                        <Card style={{ display: 'flex', flexDirection: 'column' }}>
                            <CardContent>
                                <div style={{ marginBottom: "10px", display: 'flex', alignItems: "center" }}>
                                    <Typography variant="h5" sx={{ flexGrow: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            {downloadableItem.title}
                                        </div>
                                    </Typography>
                                    {(showButtons) && <div>
                                        <IconButton size="small" aria-label={tr("download")} onClick={handleDownload} disabled={downloading}><DownloadRounded /></IconButton >
                                    </div>}
                                    {(showControls && showButtons) && <div>
                                        <IconButton size="small" aria-label={tr("edit")} onClick={handleEdit}><EditRounded /></IconButton >
                                        <IconButton size="small" aria-label={tr("delete")} onClick={handleDelete}><DeleteRounded sx={{ "color": "red" }} /></IconButton >
                                    </div>}
                                </div>
                                <Typography variant="body2"><MarkdownRenderer>{description}</MarkdownRenderer></Typography>
                            </CardContent>
                            <CardContent>
                                <Typography variant="caption"><UserCard user={downloadableItem.creator} inline={true} />{downloadableItem.timestamp !== 0 && <> | <TimeDelta key={`${+new Date()}`} timestamp={downloadableItem.timestamp * 1000} /></>}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={12} md={6} lg={6}>
                        <img src={downloadableItem.image} alt="" style={{ width: '100%', border: 'none' }} />
                    </Grid>
                </Grid>
            </Grid>
        );
    }
};

const DownloadableItemGrid = memo(({ downloadableItems, lastUpdate, onEdit, onDelete, onDownload }) => {
    let halfCnt = 0;
    return <Grid container spacing={3}>
        {downloadableItems.map((downloadableItem, index) => {
            downloadableItem.display = 'half-width';

            const hasImage = /^\[Image src="(.+)" loc="(.+)"\]/.test(downloadableItem.description);

            if (hasImage) {
                const re = downloadableItem.description.match(/^\[Image src="(.+)" loc="(.+)"\]/);
                const link = re[1];
                const loc = re[2];
                downloadableItem.image = link;
                downloadableItem.display = 'with-image-' + loc;
                halfCnt = 0;
            } else {
                if (index + 1 < downloadableItems.length) {
                    const nextDownloadableItem = downloadableItems[index + 1];
                    const nextHasImage = /^\[Image src="(.+)" loc="(.+)"\]/.test(nextDownloadableItem.description);

                    if (nextHasImage) {
                        if (halfCnt % 2 === 1) {
                            downloadableItem.display = 'half-width';
                            halfCnt += 1;
                        } else {
                            downloadableItem.display = 'full-width';
                            halfCnt = 0;
                        }
                    } else {
                        downloadableItem.display = 'half-width';
                        halfCnt += 1;
                    }
                }
            }

            return (
                <DownloadableItemCard
                    downloadableItem={downloadableItem}
                    key={downloadableItem.downloadsid}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onDownload={onDownload}
                />
            );
        })}
    </Grid>;
}, (prevProps, nextProps) => {
    return prevProps.lastUpdate === nextProps.lastUpdate;
});

const DownloadableItemManagers = memo(() => {
    const { allPerms, users, memberUIDs } = useContext(AppContext);
    const allMembers = memberUIDs.map((uid) => users[uid]);

    let managers = [];
    for (let i = 0; i < allMembers.length; i++) {
        if (checkPerm(allMembers[i].roles, ["administrator", "manage_downloads"], allPerms)) {
            managers.push(allMembers[i]);
        }
    }

    return <>{
        managers.map((user) => (
            <UserCard user={user} useChip={true} inline={true} />
        ))
    }</>;
});

const DownloadableItem = () => {
    const { t: tr } = useTranslation();
    const { apiPath, curUID, curUser, curUserPerm } = useContext(AppContext);
    const { cache, setCache } = useContext(CacheContext);

    const [downloadableItems, setDownloadableItems] = useState(cache.downloads.downloadableItems);
    const [lastUpdate, setLastUpdate] = useState(0);
    const [submitLoading, setSubmitLoading] = useState(false);

    const [page, setPage] = useState(cache.downloads.page);
    const pageRef = useRef(cache.downloads.page);
    const [totalPages, setTotalPages] = useState(cache.downloads.totalPages);
    const handlePagination = useCallback((event, value) => {
        setPage(value);
    }, []);
    useEffect(() => {
        pageRef.current = page;
    }, [page]);

    useEffect(() => {
        return () => {
            setCache(cache => ({ ...cache, downloads: { downloadableItems, page, totalPages } }));
        };
    }, [downloadableItems, page, totalPages]);

    const [snackbarContent, setSnackbarContent] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const handleCloseSnackbar = useCallback(() => {
        setSnackbarContent("");
    }, []);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogTitle, setDialogTitle] = useState(tr("create_downloadable_item"));
    const [dialogButton, setDialogButton] = useState(tr("create"));
    const [dialogDelete, setDialogDelete] = useState(false);
    const [toDelete, setToDelete] = useState(null);
    const [dialogManagers, setDialogManagers] = useState(false);

    const [editId, setEditId] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setContent] = useState('');
    const [link, setLink] = useState('');
    const [orderId, setOrderId] = useState(0);
    const [isPinned, setIsPinned] = useState(false);

    const clearModal = useCallback(() => {
        setTitle('');
        setContent('');
        setLink('');
        setOrderId(0);
        setIsPinned(false);
    }, []);

    const doLoad = useCallback(async () => {
        window.loading += 1;

        let url = `${apiPath}/downloads/list?page_size=10&page=${page}`;

        let [newDowns] = [null];
        if (curUID !== null) {
            [newDowns] = await makeRequestsWithAuth([
                url
            ]);
        } else {
            [newDowns] = await makeRequests([
                url
            ]);
        }

        if (pageRef.current === page) {
            setDownloadableItems(newDowns.list);
            setTotalPages(newDowns.total_pages);
            setLastUpdate(+new Date());
        }

        window.loading -= 1;
    }, [apiPath, page]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        if (editId === null) {
            let resp = await axios({ url: `${apiPath}/downloads`, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` }, data: { "title": title, "description": description, "link": link, "orderid": parseInt(orderId), "is_pinned": isPinned } });
            if (resp.status === 200) {
                doLoad();
                setSnackbarContent(tr("downloadable_item_posted"));
                setSnackbarSeverity("success");
                clearModal();
                setDialogOpen(false);
            } else {
                setSnackbarContent(resp.data.error);
                setSnackbarSeverity("error");
            }
        } else {
            let resp = await axios({ url: `${apiPath}/downloads/${editId}`, method: "PATCH", headers: { Authorization: `Bearer ${getAuthToken()}` }, data: { "title": title, "description": description, "link": link, "orderid": parseInt(orderId), "is_pinned": isPinned } });
            if (resp.status === 204) {
                doLoad();
                setSnackbarContent(tr("downloadable_item_updated"));
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
    }, [apiPath, title, description, link, editId, isPinned, orderId]);

    const doDownload = useCallback(async (downloadableItem) => {
        let resp = await axios({ url: `${apiPath}/downloads/${downloadableItem.downloadsid}`, method: "GET", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 200) {
            downloadFile(`${apiPath}/downloads/redirect/${resp.data.secret}`);
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
    }, [apiPath]);

    const createDownloadableItem = useCallback(() => {
        if (editId !== null) {
            setEditId(null);
            clearModal();
        }
        setDialogTitle(tr("create_downloadable_item"));
        setDialogButton(tr("create"));
        setDialogOpen(true);
    }, [editId]);

    const editDownloadableItem = useCallback((downloadableItem) => {
        clearModal();

        setTitle(downloadableItem.title);
        setContent(downloadableItem.description);
        setLink(downloadableItem.link);
        setOrderId(downloadableItem.orderid);
        setIsPinned(String(downloadableItem.is_pinned));

        setEditId(downloadableItem.downloadsid);

        setDialogTitle(tr("edit_downloadable_item"));
        setDialogButton(tr("edit"));
        setDialogOpen(true);
    }, []);

    const deleteDownloadableItem = useCallback(async (downloadableItem, isShiftPressed) => {
        if (isShiftPressed === true || downloadableItem.confirmed === true) {
            setSubmitLoading(true);
            let resp = await axios({ url: `${apiPath}/downloads/${downloadableItem.downloadsid}`, method: "DELETE", headers: { Authorization: `Bearer ${getAuthToken()}` } });
            if (resp.status === 204) {
                doLoad();
                setSnackbarContent(tr("downloadable_item_deleted"));
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
            setToDelete(downloadableItem);
        }
    }, [apiPath]);

    useEffect(() => {
        doLoad();
    }, [apiPath, page]);

    return (
        <>
            <DownloadableItemGrid downloadableItems={downloadableItems} lastUpdate={lastUpdate} onEdit={editDownloadableItem} onDelete={deleteDownloadableItem} onDownload={doDownload} />
            {downloadableItems.length !== 0 && <Pagination count={totalPages} onChange={handlePagination}
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
                            <Grid item xs={12}>
                                <TextField
                                    label={tr("download_link")}
                                    value={link}
                                    onChange={(e) => setLink(e.target.value)}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Grid container spacing={2}>
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
                    Delete Downloadable Item
                    <IconButton style={{ position: 'absolute', right: '10px', top: '10px' }} onClick={() => setDialogDelete(false)}>
                        <CloseRounded />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ minWidth: "400px", marginBottom: "20px" }}>{tr("delete_downloads_confirm")}</Typography>
                    <DownloadableItemCard downloadableItem={toDelete !== null ? toDelete : {}} />
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
                                <Button variant="contained" color="error" onClick={() => { deleteDownloadableItem({ ...toDelete, confirmed: true }); }} disabled={submitLoading}>{tr("delete")}</Button>
                            </Box>
                        </Grid>
                    </Grid>
                </DialogActions>
            </Dialog>
            <Dialog open={dialogManagers} onClose={() => setDialogManagers(false)}>
                <DialogTitle>{tr("downloads_managers")}
                    <IconButton style={{ position: 'absolute', right: '10px', top: '10px' }} onClick={() => setDialogOpen(false)}>
                        <CloseRounded />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <DownloadableItemManagers />
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
                {checkUserPerm(curUserPerm, ["administrator", "manage_downloads"]) && <SpeedDialAction
                    key="create"
                    icon={<EditNoteRounded />}
                    tooltipTitle={tr("create")}
                    onClick={() => createDownloadableItem()}
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

export default DownloadableItem;