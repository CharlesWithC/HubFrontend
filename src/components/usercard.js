import React, { useState, useCallback, useRef } from 'react';
import { Avatar, Chip, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Button, Snackbar, Alert, Grid, TextField, Typography, ListItemIcon, Box, ButtonGroup } from "@mui/material";
import { Portal } from '@mui/base';
import { Link } from "react-router-dom";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAddressCard, faPeopleGroup, faTrophy } from '@fortawesome/free-solid-svg-icons';

import RoleSelect from './roleselect';

import { customAxios as axios, getAuthToken, checkPerm } from '../functions';

var vars = require("../variables");

const UserCard = (props) => {
    let { uid, userid, discordid, name, avatar, roles, size, inline, useChip, onDelete, noLink, textOnly, key, style } = { uid: 0, userid: 0, discordid: 0, name: "", avatar: "", roles: [], size: "20", inline: false, useChip: false, onDelete: null, noLink: false, textOnly: false, key: null, style: {} };
    if (props.user !== undefined) {
        ({ uid, userid, discordid, name, avatar, roles } = props.user);
        ({ size, inline, useChip, onDelete, noLink, textOnly, key, style } = props);
    } else {
        ({ uid, userid, discordid, name, avatar, roles, size, inline, useChip, onDelete, noLink, textOnly, key, style } = props);
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
    const [newPoints, setNewPoints] = useState({ distance: 0, bonus: 0 });
    const [newProfile, setNewProfile] = useState({ name: name, avatar: avatar });
    const uidRef = useRef(uid);
    const useridRef = useRef(userid);
    const discordidRef = useRef(discordid);
    const nameRef = useRef(name);
    const avatarRef = useRef(avatar);
    const rolesRef = useRef(roles);
    const updateUserInfo = useCallback(async () => {
        let resp = await axios({ url: `${vars.dhpath}/user/profile?uid=${uid}`, method: "GET", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 200) {
            for (let i = 0; i < vars.members.length; i++) {
                if (vars.members[i].uid === uid) {
                    vars.members[i] = resp.data;
                    uidRef.current = resp.data.uid;
                    useridRef.current = resp.data.userid;
                    discordidRef.current = resp.data.discordid;
                    nameRef.current = resp.data.name;
                    avatarRef.current = resp.data.avatar;
                    rolesRef.current = resp.data.roles;
                    setNewProfile({ name: resp.data.name, avatar: resp.data.avatar });
                }
            }
        }
    }, [uid, uidRef, useridRef, discordidRef, nameRef, avatarRef, rolesRef, setNewProfile]);

    const updateRoles = useCallback(async () => {
        setDialogBtnDisabled(true);
        let resp = await axios({ url: `${vars.dhpath}/member/${userid}/roles`, method: "PATCH", data: { roles: newRoles.map((role) => (role.id)) }, headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            updateUserInfo();
            setSnackbarContent("Roles updated");
            setSnackbarSeverity("success");
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setDialogBtnDisabled(false);
    }, [userid, newRoles, updateUserInfo]);

    const updatePoints = useCallback(async () => {
        setDialogBtnDisabled(true);
        let resp = await axios({ url: `${vars.dhpath}/member/${userid}/points`, method: "PATCH", data: { distance: newPoints.distance, bonus: newPoints.bonus }, headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            updateUserInfo();
            setSnackbarContent("Points updated");
            setSnackbarSeverity("success");
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setDialogBtnDisabled(false);
    }, [userid, newPoints, updateUserInfo]);

    const updateProfile = useCallback(async (sync_to = undefined) => {
        setDialogBtnDisabled(true);
        sync_to === undefined ? sync_to = "" : sync_to = `&sync_to_${sync_to}=true`;
        let resp = await axios({ url: `${vars.dhpath}/user/profile?uid=${uid}${sync_to}`, method: "PATCH", data: { name: newProfile.name, avatar: newProfile.avatar }, headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            updateUserInfo();
            setSnackbarContent("Profile updated");
            setSnackbarSeverity("success");
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setDialogBtnDisabled(false);
    }, [uid, newProfile, updateUserInfo]);

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
            {checkPerm(vars.userInfo.roles, ["admin", "hrm", "hr", "manage_profile"]) && <MenuItem onClick={(e) => { updateCtxAction(e, "update-profile"); }}><ListItemIcon><FontAwesomeIcon icon={faAddressCard} /></ListItemIcon> Update Profile</MenuItem>}
            {userid !== null && userid >= 0 && checkPerm(vars.userInfo.roles, ["admin", "hrm", "hr", "update_member_roles"]) && <MenuItem onClick={(e) => { updateCtxAction(e, "update-roles"); }}><ListItemIcon><FontAwesomeIcon icon={faPeopleGroup} /></ListItemIcon> Update Roles</MenuItem>}
            {userid !== null && userid >= 0 && checkPerm(vars.userInfo.roles, ["admin", "hrm", "hr", "update_member_points"]) && <MenuItem onClick={(e) => { updateCtxAction(e, "update-points"); }}><ListItemIcon><FontAwesomeIcon icon={faTrophy} /></ListItemIcon> Update Points</MenuItem>}
        </Menu>}
        <div style={{ display: "inline-block" }} onClick={(e) => { e.stopPropagation(); }}>
            {ctxAction === "update-roles" && userid >= 0 &&
                <Dialog open={true} onClose={() => { setCtxAction(""); }} fullWidth >
                    <DialogTitle>Update Roles | {name} (User ID: {userid})</DialogTitle>
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
                    <DialogTitle>Update Points | {name} (User ID: {userid})</DialogTitle>
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
            {ctxAction === "update-profile" && userid >= 0 &&
                <Dialog open={true} onClose={() => { setCtxAction(""); }} fullWidth  >
                    <DialogTitle>Update Profile | {name} ({userid !== null ? `User ID: ${userid} / ` : ""}UID: {uid})</DialogTitle>
                    <DialogContent>
                        <Typography variant="body2">- Custom profile may be set by providing name and avatar url</Typography>
                        <Typography variant="body2">- Alternatively, sync to Discord / Steam / TruckersMP profile</Typography>
                        <Grid container spacing={2} sx={{ mt: "5px" }}>
                            <Grid item xs={12}>
                                <TextField
                                    label="Name"
                                    value={newProfile.name}
                                    onChange={(e) => setNewProfile({ ...newProfile, name: e.target.value })}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Avatar URL"
                                    value={newProfile.avatar}
                                    onChange={(e) => setNewProfile({ ...newProfile, avatar: e.target.value })}
                                    fullWidth
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'grid', justifyItems: 'start' }}>
                            <ButtonGroup>
                                <Button variant="contained" color="secondary">Sync To</Button>
                                <Button variant="contained" color="success" onClick={() => { updateProfile("discord"); }} disabled={dialogBtnDisabled}>Discord</Button>
                                <Button variant="contained" color="warning" onClick={() => { updateProfile("steam"); }} disabled={dialogBtnDisabled}>Steam</Button>
                                <Button variant="contained" color="error" onClick={() => { updateProfile("truckersmp"); }} disabled={dialogBtnDisabled}>TruckersMP</Button>
                            </ButtonGroup>
                        </Box>
                        <Box sx={{ display: 'grid', justifyItems: 'end' }}>
                            <ButtonGroup>
                                <Button variant="primary" onClick={() => { setCtxAction(""); }}>Close</Button>
                                <Button variant="contained" onClick={() => { updateProfile(); }} disabled={dialogBtnDisabled}>Save</Button>
                            </ButtonGroup>
                        </Box>
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