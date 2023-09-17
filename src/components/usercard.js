import React, { useState, useCallback } from 'react';
import { Avatar, Chip, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Button, Snackbar, Alert } from "@mui/material";
import { Portal } from '@mui/base';
import { Link } from "react-router-dom";

import RoleSelect from './roleselect';

import { customAxios as axios, getAuthToken, checkPerm } from '../functions';

var vars = require("../variables");

const UserCard = (props) => {
    let { userid, discordid, name, avatar, roles, size, inline, useChip, onDelete, noLink, textOnly, key, style } = { userid: 0, discordid: 0, name: "", avatar: "", roles: [], size: "20", inline: false, useChip: false, onDelete: null, noLink: false, textOnly: false, key: null, style: {} };
    if (props.user !== undefined) {
        ({ userid, discordid, name, avatar, roles } = props.user);
        ({ size, inline, useChip, onDelete, noLink, textOnly, key, style } = props);
    } else {
        ({ userid, discordid, name, avatar, roles, size, inline, useChip, onDelete, noLink, textOnly, key, style } = props);
    }

    if (size === undefined) {
        size = "20";
    }

    let specialColor = null;
    if (Object.keys(vars.specialRoles).includes(discordid)) {
        specialColor = vars.specialRoles[discordid];
    }

    const [snackbarContent, setSnackbarContent] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const handleCloseSnackbar = useCallback(() => {
        setSnackbarContent("");
    }, []);

    const [showContextMenu, setShowContextMenu] = useState(false);
    const [anchorPosition, setAnchorPosition] = useState({});
    const handleContextMenu = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (showContextMenu) {
            setShowContextMenu(false);
            return;
        }
        setAnchorPosition({ top: e.clientY, left: e.clientX });
        setShowContextMenu(true);
    }, [showContextMenu]);
    const [ctxAction, setCtxAction] = useState("");
    const updateCtxAction = useCallback((e, action) => {
        e.preventDefault();
        e.stopPropagation();
        setCtxAction(action);
        setShowContextMenu(false);
    }, []);
    const [dialogBtnDisabled, setDialogBtnDisabled] = useState(false);

    const [newRoles, setNewRoles] = useState(roles);
    const updateRoles = useCallback(async () => {
        setDialogBtnDisabled(true);
        let resp = await axios({ url: `${vars.dhpath}/member/${userid}/roles`, method: "PATCH", data: { roles: newRoles.map((role) => (role.id)) }, headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            setSnackbarContent("Roles updated!!");
            setSnackbarSeverity("success");
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setDialogBtnDisabled(false);
    }, [userid, newRoles]);

    let content = <div style={{ display: "inline-block" }} onContextMenu={handleContextMenu}>
        {!useChip && <>
            {!textOnly && <><Avatar src={avatar}
                style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    verticalAlign: "middle",
                    display: "inline-flex"
                }} />
                &nbsp;</>}
            {specialColor === null && <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} >{name}</span>}
            {specialColor !== null && <span style={{ whiteSpace: "nowrap", color: specialColor, overflow: "hidden", textOverflow: "ellipsis" }} >{name}</span>}
        </>}
        {useChip && <>
            <Chip
                key={key}
                avatar={textOnly ? undefined : <Avatar alt={name} src={avatar} />}
                label={name}
                variant="outlined"
                sx={{ margin: "3px", cursor: "pointer", ...specialColor !== null ? { color: specialColor } : {}, ...style }}
                onDelete={onDelete}
            />
        </>}
        {showContextMenu && <Menu
            anchorReference="anchorPosition"
            anchorPosition={anchorPosition}
            open={showContextMenu}
            onClose={(e) => { e.preventDefault(); e.stopPropagation(); setShowContextMenu(false); }}
        >
            {checkPerm(vars.userInfo.roles, ["admin", "hrm", "hr", "update_member_roles"]) && <MenuItem onClick={(e) => { updateCtxAction(e, "update-roles"); }}>Update Roles</MenuItem>}
        </Menu>}
        <div style={{ display: "inline-block" }} onClick={(e) => { e.stopPropagation(); }}>
            {ctxAction === "update-roles" &&
                <Dialog open={true} onClose={() => { setCtxAction(""); }} >
                    <DialogTitle>Update Roles</DialogTitle>
                    <DialogContent>
                        <RoleSelect label={`${name} (${userid})`} initialRoles={roles} onUpdate={setNewRoles} />
                    </DialogContent>
                    <DialogActions>
                        <Button variant="primary" onClick={() => { setCtxAction(""); }}>Close</Button>
                        <Button variant="contained" onClick={() => { updateRoles(); }} disabled={dialogBtnDisabled}>Save</Button>
                    </DialogActions>
                </Dialog>
            }
        </div>
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
    </div>;

    if (noLink) return <div style={{ flexGrow: 1, whiteSpace: inline ? null : 'nowrap', alignItems: "center" }}>{content}</div>;

    return (
        <Link to={`/beta/member/${userid}`} style={{ flexGrow: 1, whiteSpace: inline ? null : 'nowrap', alignItems: "center" }}>
            {content}
        </Link>
    );
};

export default UserCard;