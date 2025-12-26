import { useEffect, useState, useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context";

import { IconButton, Popover, List, ListItem, ListItemText, Typography, Snackbar, Alert, CircularProgress, Badge, useTheme } from "@mui/material";
import { NotificationsRounded, DoneAllRounded } from "@mui/icons-material";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExpand } from "@fortawesome/free-solid-svg-icons";

import ReactMarkdown from "react-markdown";
import SimpleBar from "simplebar-react";

import { customAxios as axios, getAuthToken } from "../functions";

const NotificationsPopover = () => {
  const { t: tr } = useTranslation();
  const { apiPath, userSettings } = useContext(AppContext);
  const navigate = useNavigate();

  const theme = useTheme();
  const [notifications, setNotifications] = useState(null);
  const [anchorPosition, setAnchorPosition] = useState(null);
  const handleClick = useCallback(e => {
    setAnchorPosition({ top: e.clientY, left: e.clientX });
  }, []);
  const handleClose = useCallback(() => {
    setAnchorPosition(null);
  }, []);

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
      const resp = await axios({ url: `${apiPath}/user/notification/list`, params: { page_size: 250, order_by: "notificationid", order: "desc" }, method: "GET", headers: { Authorization: `Bearer ${bearerToken}` } });
      if (resp.status === 200) {
        let list = [];
        for (let i = 0; i < resp.data.list.length; i++) {
          let noti = resp.data.list[i];
          list.push({ id: noti.notificationid, message: noti.content, timestamp: noti.timestamp, read: noti.read });
        }
        setNotifications(list);

        if (window.isElectron) {
          for (let i = list.length - 1; i >= 0; i--) {
            if (list[i].read) continue;
            window.electron.ipcRenderer.send("notification", list[i]);
          }
          window.electron.ipcRenderer.send("notification", { id: -1 });
        }
      } else {
        setSnackbarSeverity("error");
        setSnackbarContent(resp.error);
      }
    } catch (error) {
      console.error(error);
      setSnackbarSeverity("error");
      setSnackbarContent(tr("error_occurred"));
    }

    try {
      const resp = await axios({ url: `${apiPath}/user/notification/list?status=0`, method: "GET", headers: { Authorization: `Bearer ${bearerToken}` } });
      if (parseInt(resp.status / 100) === 2) {
        setUnread(resp.data.total_items);
      } else {
        setSnackbarSeverity("error");
        setSnackbarContent(resp.error);
      }
    } catch (error) {
      console.error(error);
      setSnackbarSeverity("error");
      setSnackbarContent(tr("error_occurred"));
    }
  }, [apiPath]);

  useEffect(() => {
    loadNotifications();
  }, [unread, loadNotifications]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadNotifications();
    }, userSettings.notification_refresh_interval * 1000);

    return () => {
      clearInterval(interval);
    };
  }, [userSettings.notification_refresh_interval, loadNotifications]);

  const handleAllRead = useCallback(async () => {
    const bearerToken = getAuthToken();

    window.loading += 1;

    try {
      const resp = await axios({ url: `${apiPath}/user/notification/all/status/1`, method: "PATCH", headers: { Authorization: `Bearer ${bearerToken}` } });
      if (parseInt(resp.status / 100) === 2) {
        setSnackbarSeverity("success");
        setSnackbarContent(tr("all_notifications_marked_as_read"));
        setUnread(0);
      } else {
        setSnackbarSeverity("error");
        setSnackbarContent(resp.error);
      }
    } catch (error) {
      console.error(error);
      setSnackbarSeverity("error");
      setSnackbarContent(tr("error_occurred"));
    }
    window.loading -= 1;
  }, [apiPath]);

  const open = Boolean(anchorPosition);

  return (
    <>
      <IconButton size="medium" color="inherit" onClick={handleClick}>
        {unread >= 100 && (
          <Badge badgeContent="99+" color="error">
            <NotificationsRounded />
          </Badge>
        )}
        {unread > 0 && unread < 100 && (
          <Badge badgeContent={unread} color="error">
            <NotificationsRounded />
          </Badge>
        )}
        {unread === 0 && <NotificationsRounded />}
      </IconButton>
      <Popover
        open={open}
        anchorReference="anchorPosition"
        anchorPosition={anchorPosition}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}>
        <List sx={{ minWidth: "400px", overflow: "hidden", backgroundColor: theme.palette.background.paper.substring(0, 7) }}>
          <ListItem>
            <ListItemText primary={<Typography fontWeight="bold">{tr("notifications")}</Typography>} />
            <IconButton onClick={handleAllRead}>
              <DoneAllRounded />
            </IconButton>
            <IconButton
              onClick={() => {
                navigate("/notifications");
              }}>
              <FontAwesomeIcon icon={faExpand} />
            </IconButton>
          </ListItem>
          {notifications !== null && (
            <SimpleBar style={{ maxHeight: "40vh" }} id="notifications-simplebar">
              {notifications.map(({ id, message, timestamp, read }) => (
                <ListItem key={id} sx={{ margin: 0 }}>
                  <ListItemText primary={<ReactMarkdown>{message}</ReactMarkdown>} secondary={timestamp !== null ? new Date(timestamp * 1000).toLocaleString() : ""} primaryTypographyProps={{ style: { color: read === true ? "grey" : null } }} secondaryTypographyProps={{ style: { color: "grey" } }} />
                </ListItem>
              ))}
              <ListItem key="last" sx={{ margin: 0, textAlign: "center" }}>
                <ListItemText primary={tr("last_250_notifications_shown")} primaryTypographyProps={{ style: { color: "grey", fontSize: "0.8em" } }} />
              </ListItem>
            </SimpleBar>
          )}
          {notifications === null && (
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "15px" }}>
              <CircularProgress />
            </div>
          )}
        </List>
      </Popover>
      <Snackbar open={!!snackbarContent} autoHideDuration={5000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
          {snackbarContent}
        </Alert>
      </Snackbar>
    </>
  );
};

export default NotificationsPopover;
