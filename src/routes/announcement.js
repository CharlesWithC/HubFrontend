import { useEffect, useState, memo } from 'react';
import { Grid, SpeedDial, SpeedDialIcon, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, TextField, Select, MenuItem, Snackbar, Alert } from '@mui/material';
import AnnouncementCard from '../components/announcement';
import { makeRequests, makeRequestsWithAuth } from '../functions';

import axios from 'axios';
const axiosRetry = require('axios-retry');
axiosRetry(axios, {
    retries: 3,
    retryDelay: (retryCount) => {
        console.log(`retry attempt: ${retryCount}`);
        return retryCount * 1000;
    },
    retryCondition: (error) => {
        return error.response === undefined || error.response.status in [429, 503];
    },
});

// NOTE This will be editable in API v2.7.4
const announcementTypes = [
    { value: 0, name: 'Information' },
    { value: 1, name: 'Event' },
    { value: 2, name: 'Warning' },
    { value: 3, name: 'Critical' },
    { value: 4, name: 'Resolved' },
];

var vars = require("../variables");

/*

Cases
i) Two ann without image -> 2-column grid
ii) One ann without image + one with image -> 2-row half/full column grid

TODO
1. Edit Announcement / Create ... API
2. Scroll to bottom to load new announcements

*/

const AnnouncementGrid = memo(({ announcements, lastUpdate }) => (
    <Grid container spacing={3}>
        {announcements.map((announcement) => (
            <AnnouncementCard announcement={announcement} key={announcement.announcementid} />
        ))}
    </Grid>
), (prevProps, nextProps) => {
    return prevProps.lastUpdate === nextProps.lastUpdate;
});

function Announcement() {
    const [announcements, setAnnouncemnts] = useState([]);
    const [lastUpdate, setLastUpdate] = useState(0);
    const [submitLoading, setSubmitLoading] = useState(false);

    const [snackbarContent, setSnackbarContent] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const handleCloseSnackbar = () => {
        setSnackbarContent("");
    };

    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [announcementType, setAnnouncementType] = useState(0);
    const [isPrivate, setIsPrivate] = useState("false");
    const [orderId, setOrderId] = useState(0);
    const [isPinned, setIsPinned] = useState("false");

    const clearModal = () => {
        setTitle('');
        setContent('');
        setAnnouncementType(0);
        setIsPrivate(false);
        setOrderId(0);
        setIsPinned(false);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        let resp = await axios({ url: `${vars.dhpath}/announcements`, method: "POST", headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }, data: { "title": title, "content": content, "announcement_type": parseInt(announcementType), "is_private": Boolean(isPrivate), "orderid": parseInt(orderId), "is_pinned": Boolean(isPinned) } });
        if (resp.status === 204) {
            setSnackbarContent("Announcement posted!");
            setSnackbarSeverity("success");
            clearModal();
            setOpen(false);
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setSubmitLoading(false);
    };

    useEffect(() => {
        async function doLoad() {
            const loadingStart = new CustomEvent('loadingStart', {});
            window.dispatchEvent(loadingStart);

            let url = `${vars.dhpath}/announcements/list?page_size=250`;
            if (announcements.length !== 0) {
                url = `${vars.dhpath}/announcements/list?page_size=250&after_announcementid=${announcements[announcements.length - 1].announcementid}`;
            }

            var newAnns = [];
            if (vars.isLoggedIn) {
                const [anns] = await makeRequestsWithAuth([
                    url
                ]);
                newAnns = anns.list;
            } else {
                const [anns] = await makeRequests([
                    url
                ]);
                newAnns = anns.list;
            }

            for (let i = 0; i < newAnns.length; i++) {
                newAnns[i] = { ...newAnns[i], "display": "half-width" };
            }

            setAnnouncemnts(newAnns);
            setLastUpdate(+new Date());

            const loadingEnd = new CustomEvent('loadingEnd', {});
            window.dispatchEvent(loadingEnd);
        }
        if (announcements.length === 0) {
            doLoad();
        }
    }, [announcements]);

    return (
        <>
            <AnnouncementGrid announcements={announcements} lastUpdate={lastUpdate} />
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Create Announcement</DialogTitle>
                <DialogContent>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={2} sx={{ marginTop: "5px" }}>
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
                                                {announcementTypes.map((option) => (
                                                    <MenuItem key={option.value} value={option.value}>
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
                                            <FormLabel component="legend">Order ID</FormLabel>
                                            <TextField
                                                type="number"
                                                value={orderId}
                                                onChange={(e) => setOrderId(e.target.value)}
                                                inputProps={{ style: { padding: "4px 4px 4px 10px" } }}
                                                sx={{ marginTop: "6px" }}
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
                    <Button variant="primary" onClick={() => { setOpen(false); clearModal(); }}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmit} disabled={submitLoading}>Create</Button>
                </DialogActions>
            </Dialog>
            <SpeedDial
                ariaLabel="New Announcement"
                sx={{ position: 'fixed', bottom: 20, right: 20 }}
                icon={<SpeedDialIcon />}
                onClick={() => setOpen(true)}
            >
            </SpeedDial>
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
        </>
    );
}

export default Announcement;