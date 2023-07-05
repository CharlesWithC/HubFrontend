import { useEffect, useState, useCallback, memo } from 'react';
import { Card, CardContent, Typography, Grid, SpeedDial, SpeedDialIcon, SpeedDialAction, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, TextField, Snackbar, Alert, Pagination, IconButton } from '@mui/material';
import { DownloadRounded, EditNoteRounded, RefreshRounded, EditRounded, DeleteRounded, PeopleAltRounded } from '@mui/icons-material';

import UserCard from '../components/usercard';
import MarkdownRenderer from '../components/markdown';
import TimeAgo from '../components/timeago';
import { makeRequests, makeRequestsWithAuth, checkUserPerm, customAxios as axios, checkPerm, downloadFile } from '../functions';

var vars = require("../variables");

const STBOOL = (s) => {
    return s === "true";
}

const DownloadableItemCard = ({ downloadableItem, onEdit, onDelete, onDownload }) => {
    const showButtons = onEdit !== undefined;
    const showControls = (onEdit !== undefined) && (vars.isLoggedIn && checkPerm(vars.userInfo.roles, ["admin", "downloads"]));

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
        console.log("downloading");
        setDownloading(true);
        await onDownload(downloadableItem);
        setDownloading(false);
        console.log("done");
    }, [downloadableItem, onDownload]);

    if (downloadableItem.title === undefined) {
        return <></>
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
                                <IconButton size="small" aria-label="Download" onClick={handleDownload} disabled={downloading}><DownloadRounded /></IconButton >
                            </div>}
                            {(showControls && showButtons) && <div>
                                <IconButton size="small" aria-label="Edit" onClick={handleEdit}><EditRounded /></IconButton >
                                <IconButton size="small" aria-label="Delete" onClick={handleDelete}><DeleteRounded sx={{ "color": "red" }} /></IconButton >
                            </div>}
                        </div>
                        <Typography variant="body2"><MarkdownRenderer>{description}</MarkdownRenderer></Typography>
                    </CardContent>
                    <CardContent>
                        <Typography variant="caption">{downloadableItem.timestamp !== 0 && <TimeAgo timestamp={downloadableItem.timestamp * 1000} />}</Typography>
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
                                <IconButton size="small" aria-label="Download" onClick={handleDownload} disabled={downloading}><DownloadRounded /></IconButton >
                            </div>}
                            {(showControls && showButtons) && <div>
                                <IconButton size="small" aria-label="Edit" onClick={handleEdit}><EditRounded /></IconButton >
                                <IconButton size="small" aria-label="Delete" onClick={handleDelete}><DeleteRounded sx={{ "color": "red" }} /></IconButton >
                            </div>}
                        </div>
                        <Typography variant="body2"><MarkdownRenderer>{description}</MarkdownRenderer></Typography>
                    </CardContent>
                    <CardContent>
                        <Typography variant="caption">{downloadableItem.timestamp !== 0 && <TimeAgo timestamp={downloadableItem.timestamp * 1000} />}</Typography>
                    </CardContent>
                </Card>
            </Grid>
        );
    } else if (downloadableItem.display === "with-image-left") {
        return (
            <Grid item xs={12} sm={12} md={12} lg={12} key={downloadableItem.downloadsid}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={12} md={6} lg={6}>
                        <img src={downloadableItem.image} alt="Banner" style={{ width: '100%', border: 'none' }} />
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
                                        <IconButton size="small" aria-label="Download" onClick={handleDownload} disabled={downloading}><DownloadRounded /></IconButton >
                                    </div>}
                                    {(showControls && showButtons) && <div>
                                        <IconButton size="small" aria-label="Edit" onClick={handleEdit}><EditRounded /></IconButton >
                                        <IconButton size="small" aria-label="Delete" onClick={handleDelete}><DeleteRounded sx={{ "color": "red" }} /></IconButton >
                                    </div>}
                                </div>
                                <Typography variant="body2"><MarkdownRenderer>{description}</MarkdownRenderer></Typography>
                            </CardContent>
                            <CardContent>
                                <Typography variant="caption">{downloadableItem.timestamp !== 0 && <TimeAgo timestamp={downloadableItem.timestamp * 1000} />}</Typography>
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
                                        <IconButton size="small" aria-label="Download" onClick={handleDownload} disabled={downloading}><DownloadRounded /></IconButton >
                                    </div>}
                                    {(showControls && showButtons) && <div>
                                        <IconButton size="small" aria-label="Edit" onClick={handleEdit}><EditRounded /></IconButton >
                                        <IconButton size="small" aria-label="Delete" onClick={handleDelete}><DeleteRounded sx={{ "color": "red" }} /></IconButton >
                                    </div>}
                                </div>
                                <Typography variant="body2"><MarkdownRenderer>{description}</MarkdownRenderer></Typography>
                            </CardContent>
                            <CardContent>
                                <Typography variant="caption">{downloadableItem.timestamp !== 0 && <TimeAgo timestamp={downloadableItem.timestamp * 1000} />}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={12} md={6} lg={6}>
                        <img src={downloadableItem.image} alt="Banner" style={{ width: '100%', border: 'none' }} />
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
    </Grid>
}, (prevProps, nextProps) => {
    return prevProps.lastUpdate === nextProps.lastUpdate;
});

const DownloadableItemManagers = memo(() => {
    let managers = [];
    for (let i = 0; i < vars.members.length; i++) {
        if (checkPerm(vars.members[i].roles, ["admin", "downloads"])) {
            managers.push(vars.members[i]);
        }
    }

    return <>{
        managers.map((user) => (
            <UserCard key={`user-${user.userid}`} user={user} useChip={true} inline={true} />
        ))
    }</>;
})

const DownloadableItem = () => {
    const [downloadableItems, setDownloadableItems] = useState([]);
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
    const [dialogTitle, setDialogTitle] = useState("Create Downloadable Item");
    const [dialogButton, setDialogButton] = useState("Create");
    const [dialogDelete, setDialogDelete] = useState(false);
    const [toDelete, setToDelete] = useState(null);
    const [dialogManagers, setDialogManagers] = useState(false);

    const [editId, setEditId] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setContent] = useState('');
    const [link, setLink] = useState('');
    const [orderId, setOrderId] = useState(0);
    const [isPinned, setIsPinned] = useState("false");

    const clearModal = useCallback(() => {
        setTitle('');
        setContent('');
        setLink('');
        setOrderId(0);
        setIsPinned("false");
    }, []);

    const doLoad = useCallback(async () => {
        const loadingStart = new CustomEvent('loadingStart', {});
        window.dispatchEvent(loadingStart);

        let url = `${vars.dhpath}/downloads/list?page_size=10&page=${page}`;

        var newDowns = [];
        if (vars.isLoggedIn) {
            const [anns] = await makeRequestsWithAuth([
                url
            ]);
            newDowns = anns.list;
            setTotalPages(anns.total_pages);
        } else {
            const [anns] = await makeRequests([
                url
            ]);
            newDowns = anns.list;
            setTotalPages(anns.total_pages);
        }

        for (let i = 0; i < newDowns.length; i++) {
            newDowns[i] = { ...newDowns[i] };
        }

        setDownloadableItems(newDowns);
        setLastUpdate(+new Date());

        const loadingEnd = new CustomEvent('loadingEnd', {});
        window.dispatchEvent(loadingEnd);
    }, [page]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        if (editId === null) {
            let resp = await axios({ url: `${vars.dhpath}/downloads`, method: "POST", headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }, data: { "title": title, "description": description, "link": link, "orderid": parseInt(orderId), "is_pinned": STBOOL(isPinned) } });
            if (resp.status === 200) {
                doLoad();
                setSnackbarContent("Downloadable item posted!");
                setSnackbarSeverity("success");
                clearModal();
                setDialogOpen(false);
            } else {
                setSnackbarContent(resp.data.error);
                setSnackbarSeverity("error");
            }
        } else {
            let resp = await axios({ url: `${vars.dhpath}/downloads/${editId}`, method: "PATCH", headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }, data: { "title": title, "description": description, "link": link, "orderid": parseInt(orderId), "is_pinned": STBOOL(isPinned) } });
            if (resp.status === 204) {
                doLoad();
                setSnackbarContent("Downloadable item updated!");
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
    }, [title, description, link, editId, isPinned, orderId, clearModal, doLoad]);

    const doDownload = useCallback(async (downloadableItem) => {
        let resp = await axios({ url: `${vars.dhpath}/downloads/${downloadableItem.downloadsid}`, method: "GET", headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
        if (resp.status === 200) {
            downloadFile(`${vars.dhpath}/downloads/redirect/${resp.data.secret}`);
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
    }, []);

    const createDownloadableItem = useCallback(() => {
        if (editId !== null) {
            setEditId(null);
            clearModal();
        }
        setDialogTitle("Create Downloadable Item");
        setDialogButton("Create");
        setDialogOpen(true);
    }, [editId, clearModal]);

    const editDownloadableItem = useCallback((downloadableItem) => {
        clearModal();

        setTitle(downloadableItem.title);
        setContent(downloadableItem.description);
        setLink(downloadableItem.link);
        setOrderId(downloadableItem.orderid);
        setIsPinned(String(downloadableItem.is_pinned));

        setEditId(downloadableItem.downloadsid);

        setDialogTitle("Edit Downloadable Item");
        setDialogButton("Edit");
        setDialogOpen(true);
    }, [clearModal]);

    const deleteDownloadableItem = useCallback(async (downloadableItem, isShiftPressed) => {
        if (isShiftPressed === true || downloadableItem.confirmed === true) {
            setSubmitLoading(true);
            let resp = await axios({ url: `${vars.dhpath}/downloads/${downloadableItem.downloadsid}`, method: "DELETE", headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
            if (resp.status === 204) {
                doLoad();
                setSnackbarContent("Downloadable item deleted!");
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
    }, [doLoad]);

    useEffect(() => {
        doLoad();
    }, [doLoad]);

    return (
        <>
            <DownloadableItemGrid downloadableItems={downloadableItems} lastUpdate={lastUpdate} onEdit={editDownloadableItem} onDelete={deleteDownloadableItem} onDownload={doDownload} />
            {downloadableItems.length !== 0 && <Pagination count={totalPages} onChange={handlePagination}
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
                                    value={description}
                                    onChange={(e) => setContent(e.target.value)}
                                    fullWidth
                                    minRows={4}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Download Link"
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
                <DialogTitle>Delete Downloadable Item</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ minWidth: "400px", marginBottom: "20px" }}>Are you sure you want to delete this downloadable item?</Typography>
                    <DownloadableItemCard downloadableItem={toDelete !== null ? toDelete : {}} />
                </DialogContent>
                <DialogActions>
                    <Button variant="primary" onClick={() => { setDialogDelete(false) }}>Cancel</Button>
                    <Button variant="contained" onClick={() => { deleteDownloadableItem({ ...toDelete, confirmed: true }); }} disabled={submitLoading}>Delete</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={dialogManagers} onClose={() => setDialogManagers(false)}>
                <DialogTitle>Downloads Managers</DialogTitle>
                <DialogContent>
                    <DownloadableItemManagers />
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
                {checkUserPerm(["admin", "downloads"]) && <SpeedDialAction
                    key="create"
                    icon={<EditNoteRounded />}
                    tooltipTitle="Create"
                    onClick={() => createDownloadableItem()}
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
}

export default DownloadableItem;