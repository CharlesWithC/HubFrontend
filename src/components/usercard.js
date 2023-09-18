import React, { useState, useCallback } from 'react';
import { Avatar, Chip, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Button, Snackbar, Alert, Grid, TextField, Typography, ListItemIcon } from "@mui/material";
import { Portal } from '@mui/base';
import { Link } from "react-router-dom";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPeopleGroup, faTrophy } from '@fortawesome/free-solid-svg-icons';

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

    const [newPoints, setNewPoints] = useState({ distance: 0, bonus: 0 });
    const updatePoints = useCallback(async () => {
        setDialogBtnDisabled(true);
        let resp = await axios({ url: `${vars.dhpath}/member/${userid}/points`, method: "PATCH", data: { distance: newPoints.distance, bonus: newPoints.bonus }, headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            setSnackbarContent("Points updated!!");
            setSnackbarSeverity("success");
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setDialogBtnDisabled(false);
    }, [userid, newPoints]);

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
            {userid >= 0 && checkPerm(vars.userInfo.roles, ["admin", "hrm", "hr", "update_member_roles"]) && <MenuItem onClick={(e) => { updateCtxAction(e, "update-roles"); }}><ListItemIcon><FontAwesomeIcon icon={faPeopleGroup} /></ListItemIcon> Update Roles</MenuItem>}
            {userid >= 0 && checkPerm(vars.userInfo.roles, ["admin", "hrm", "hr", "update_member_points"]) && <MenuItem onClick={(e) => { updateCtxAction(e, "update-points"); }}><ListItemIcon><FontAwesomeIcon icon={faTrophy} /></ListItemIcon> Update Points</MenuItem>}
        </Menu>}
        <div style={{ display: "inline-block" }} onClick={(e) => { e.stopPropagation(); }}>
            {ctxAction === "update-roles" && userid >= 0 &&
                <Dialog open={true} onClose={() => { setCtxAction(""); }} fullWidth >
                    <DialogTitle>Update Roles | {name} ({userid})</DialogTitle>
                    <DialogContent>
                        <RoleSelect initialRoles={roles} onUpdate={setNewRoles} />
                    </DialogContent>
                    <DialogActions>
                        <Button variant="primary" onClick={() => { setCtxAction(""); }}>Close</Button>
                        <Button variant="contained" onClick={() => { updateRoles(); }} disabled={dialogBtnDisabled}>Save</Button>
                    </DialogActions>
                </Dialog>
            }
            {ctxAction === "update-points" && userid >= 0 &&
                <Dialog open={true} onClose={() => { setCtxAction(""); }} fullWidth  >
                    <DialogTitle>Update Points | {name} ({userid})</DialogTitle>
                    <DialogContent>
                        <Typography variant="body2">- Distance should be given when the tracker fails to submit jobs automatically</Typography>
                        <Typography variant="body2">- Bonus points could be given as extra reward (e.g. special events / contribution)</Typography>
                        <Typography variant="body2">- Use negative number to remove points</Typography>
                        <Grid container spacing={2} sx={{ mt: "5px" }}>
                            <Grid item xs={12}>
                                <TextField
                                    label="Distance (km)"
                                    value={newPoints.distance}
                                    onChange={(e) => setNewPoints({ ...newPoints, distance: e.target.value })}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Bonus Points"
                                    value={newPoints.bonus}
                                    onChange={(e) => setNewPoints({ ...newPoints, bonus: e.target.value })}
                                    fullWidth
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="primary" onClick={() => { setCtxAction(""); }}>Close</Button>
                        <Button variant="contained" onClick={() => { updatePoints(); }} disabled={dialogBtnDisabled}>Update</Button>
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