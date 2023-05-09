import React, { useEffect, useState } from 'react';
import { IconButton, Popover, List, ListItem, ListItemText, Typography, Snackbar, Alert, CircularProgress } from '@mui/material';
import { NotificationsRounded, DoneAllRounded } from '@mui/icons-material';
import SimpleBar from 'simplebar-react';
import axios from 'axios';

var vars = require("../variables");

const NotificationsPopover = () => {
    const [notifications, setNotifications] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const [snackbarContent, setSnackbarContent] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const handleCloseSnackbar = () => {
        setSnackbarContent("");
    };

    useEffect(() => {
        async function loadNotifications() {
            const bearerToken = localStorage.getItem("token");

            try {
                const resp = await axios({ url: `${vars.dhpath}/user/notification/list`, method: "GET", headers: { "Authorization": `Bearer ${bearerToken}` } });
                if (parseInt(resp.status / 100) === 2) {
                    var list = [];
                    for (let i = 0; i < resp.data.list.length; i++) {
                        let noti = resp.data.list[i];
                        list.push({ id: noti.notificationid, message: noti.content, timestamp: noti.timestamp, read: noti.read });
                    }
                    setNotifications(list);
                } else {
                    setSnackbarSeverity("error");
                    setSnackbarContent(resp.error);
                }
            } catch (error) {
                console.error(error);
                setSnackbarSeverity("error");
                setSnackbarContent("Error occurred! Check F12 for more info.");
            }
        }
        loadNotifications();
    }, [])

    const handleAllRead = async () => {
        const bearerToken = localStorage.getItem("token");

        const loadingStart = new CustomEvent('loadingStart', {});
        window.dispatchEvent(loadingStart);

        try {
            const resp = await axios({ url: `${vars.dhpath}/user/notification/all/status/1`, method: "PATCH", headers: { "Authorization": `Bearer ${bearerToken}` } });
            if (parseInt(resp / 100) === 2) {
                setSnackbarSeverity("success");
                setSnackbarContent("All notifications marked as read!");
            } else {
                setSnackbarSeverity("error");
                setSnackbarContent(resp.error);
            }
        } catch (error) {
            console.error(error);
            setSnackbarSeverity("error");
            setSnackbarContent("Error occurred! Check F12 for more info.");
        }
        const loadingEnd = new CustomEvent('loadingEnd', {});
        window.dispatchEvent(loadingEnd);
    };

    const open = Boolean(anchorEl);

    return (
        <div>
            <IconButton size="medium" color="inherit" onClick={handleClick}>
                <NotificationsRounded />
            </IconButton>
            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
            >
                <List sx={{minWidth: "400px"}}>
                    <ListItem>
                        <ListItemText primary={<Typography fontWeight="bold">Notifications</Typography>} />
                        <IconButton onClick={handleAllRead}>
                            <DoneAllRounded />
                        </IconButton>
                    </ListItem>
                    {notifications !== null &&
                        <SimpleBar style={{maxHeight: "40vh"}}>
                            {notifications.map(({ id, message, timestamp, read }) => (
                                <ListItem key={id}>
                                    <ListItemText primary={message} secondary={new Date(timestamp * 1000).toLocaleString()}
                                        primaryTypographyProps={{ style: { color: read === true ? "grey" : null } }}
                                        secondaryTypographyProps={{ style: { color: "grey" } }} />
                                </ListItem>
                            ))}
                        </SimpleBar>
                    }
                    {notifications === null && <CircularProgress />}
                </List>
            </Popover>
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
        </div>
    );
};

export default NotificationsPopover;