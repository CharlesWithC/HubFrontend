import React, { useEffect, useState, useCallback } from 'react';
import { IconButton, Popover, List, ListItem, ListItemText, Typography, Snackbar, Alert, CircularProgress, Badge } from '@mui/material';
import { NotificationsRounded, DoneAllRounded } from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import SimpleBar from 'simplebar-react';
import { customAxios as axios, getAuthToken } from '../functions';
import { useNavigate } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExpand } from '@fortawesome/free-solid-svg-icons';

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

    const navigate = useNavigate();

    const [snackbarContent, setSnackbarContent] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const handleCloseSnackbar = () => {
        setSnackbarContent("");
    };

    const [unread, setUnread] = useState(0);

    const loadNotifications = useCallback(async () => {
        const bearerToken = getAuthToken();

        if (bearerToken === null) {
            return;
        }

        try {
            const resp = await axios({ url: `${vars.dhpath}/user/notification/list`, params: { page_size: 250 }, method: "GET", headers: { "Authorization": `Bearer ${bearerToken}` } });
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

        try {
            const resp = await axios({ url: `${vars.dhpath}/user/notification/list?status=0`, method: "GET", headers: { "Authorization": `Bearer ${bearerToken}` } });
            if (parseInt(resp.status / 100) === 2) {
                setUnread(resp.data.total_items);
            } else {
                setSnackbarSeverity("error");
                setSnackbarContent(resp.error);
            }
        } catch (error) {
            console.error(error);
            setSnackbarSeverity("error");
            setSnackbarContent("Error occurred! Check F12 for more info.");
        }
    }, []);

    useEffect(() => {
        loadNotifications();
    }, [unread, loadNotifications]);

    useEffect(() => {
        const interval = setInterval(() => {
            loadNotifications();
        }, vars.userSettings.notificationRefresh * 1000);

        return () => { clearInterval(interval); };
    }, [loadNotifications]);

    const handleAllRead = async () => {
        const bearerToken = getAuthToken();

        const loadingStart = new CustomEvent('loadingStart', {});
        window.dispatchEvent(loadingStart);

        try {
            const resp = await axios({ url: `${vars.dhpath}/user/notification/all/status/1`, method: "PATCH", headers: { "Authorization": `Bearer ${bearerToken}` } });
            if (parseInt(resp.status / 100) === 2) {
                setSnackbarSeverity("success");
                setSnackbarContent("All notifications marked as read!");
                setUnread(0);
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
        <>
            <IconButton size="medium" color="inherit" onClick={handleClick}>
                {unread >= 100 && <Badge badgeContent="99+" color="error"><NotificationsRounded /></Badge>}
                {unread > 0 && unread < 100 && <Badge badgeContent={unread} color="error"><NotificationsRounded /></Badge>}
                {unread === 0 && <NotificationsRounded />}
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
                <List sx={{ minWidth: "400px", overflow: "hidden" }}>
                    <ListItem>
                        <ListItemText primary={<Typography fontWeight="bold">Notifications</Typography>} />
                        <IconButton onClick={handleAllRead}>
                            <DoneAllRounded />
                        </IconButton>
                        <IconButton onClick={() => { navigate("/beta/notifications"); }}>
                            <FontAwesomeIcon icon={faExpand} />
                        </IconButton>
                    </ListItem>
                    {notifications !== null &&
                        <SimpleBar style={{ maxHeight: "40vh" }} id="notifications-simplebar">
                            {notifications.map(({ id, message, timestamp, read }) => (
                                <ListItem key={id} sx={{ margin: 0 }}>
                                    <ListItemText primary={<ReactMarkdown>{message}</ReactMarkdown>} secondary={timestamp !== null ? new Date(timestamp * 1000).toLocaleString() : ""}
                                        primaryTypographyProps={{ style: { color: read === true ? "grey" : null } }}
                                        secondaryTypographyProps={{ style: { color: "grey" } }} />
                                </ListItem>
                            ))}
                            <ListItem key="last" sx={{ margin: 0, textAlign: "center" }}>
                                <ListItemText primary="--- Only the latest 250 notifications are shown ---"
                                    primaryTypographyProps={{ style: { color: "grey", fontSize: "15px" } }} />
                            </ListItem>
                        </SimpleBar>
                    }
                    {notifications === null && <div style={{ display: 'flex', justifyContent: 'center', marginBottom: "15px" }}><CircularProgress /></div>}
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
        </>
    );
};

export default NotificationsPopover;