import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Avatar, Chip, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Button, Snackbar, Alert, Grid, TextField, Typography, ListItemIcon, Box, ButtonGroup, Divider, FormControl, FormLabel, Select, Popover, Card, CardContent, CardMedia, IconButton, Tooltip, useTheme } from "@mui/material";
import { Portal } from '@mui/base';
import { Link } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAddressCard, faPeopleGroup, faTrophy, faLink, faUnlockKeyhole, faUserSlash, faTrashCan, faBan, faCircleCheck, faUserCheck, faTruck, faBarsStaggered, faHashtag, faComment, faNoteSticky, faPencil, faScrewdriverWrench, faCrown, faClover } from '@fortawesome/free-solid-svg-icons';

import RoleSelect from './roleselect';
import TimeAgo from './timeago';
import MarkdownRenderer from './markdown';

import { customAxios as axios, getAuthToken, checkPerm, removeNullValues, getFormattedDate } from '../functions';

var vars = require("../variables");

function GetActivity(activity) {
    if (activity.status === "offline") {
        if (activity.last_seen !== -1)
            return <>Offline - Last seen <TimeAgo timestamp={activity.last_seen * 1000} lower={true} /></>;
        else
            return <>Offline</>;
    } else if (activity.status === "online") {
        return <>Online</>;
    } else {
        let name = activity.status;
        if (name.startsWith("dlog_")) {
            const deliveryId = name.split("_")[1];
            return <Link to={`/beta/delivery/${deliveryId}`}>Viewing Delivery #{deliveryId}</Link>;
        } else if (name === "dlog") {
            return <Link to="/beta/delivery">Viewing Deliveries</Link>;
        } else if (name === "index") {
            return <Link to="/beta/">Viewing Overview</Link>;
        } else if (name === "leaderboard") {
            return <Link to="/beta/leaderboard">Viewing Leaderboard</Link>;
        } else if (name === "member") {
            return <Link to="/beta/member">Viewing Members</Link>;
        } else if (name === "announcement") {
            return <Link to="/beta/announcement">Viewing Announcements</Link>;
        } else if (name === "application") {
            return <Link to="/beta/application/my">Viewing Applications</Link>;
        } else if (name === "challenge") {
            return <Link to="/beta/challenge">Viewing Challenges</Link>;
        } else if (name === "division") {
            return <Link to="/beta/division">Viewing Divisions</Link>;
        } else if (name === "downloads") {
            return <Link to="/beta/downloads">Viewing Downloads</Link>;
        } else if (name === "event") {
            return <Link to="/beta/event">Viewing Events</Link>;
        } else {
            return <></>;
        }
    }
}

const UserCard = (props) => {
    let { uid, userid, discordid, name, bio, note, global_note, avatar, email, steamid, truckersmpid, roles, ban, size, useChip, onDelete, textOnly, style, showProfileModal, onProfileModalClose } = { uid: -1, userid: -1, discordid: 0, name: "", bio: "", note: "", global_note: "", avatar: "", email: "", steamid: 0, truckersmpid: 0, roles: [], ban: null, roleHistory: null, banHistory: null, size: "20", useChip: false, onDelete: null, textOnly: false, style: {}, showProfileModal: undefined, onProfileModalClose: undefined };
    if (props.user !== undefined && props.user !== null) {
        ({ uid, userid, discordid, bio, name, bio, note, global_note, avatar, email, steamid, truckersmpid, roles, ban } = props.user);
        if (vars.users[uid] === undefined) vars.users[uid] = props.user;
        ({ size, useChip, onDelete, textOnly, style, showProfileModal, onProfileModalClose } = props);
    } else {
        ({ uid, userid, discordid, name, bio, note, global_note, avatar, email, steamid, truckersmpid, roles, ban, size, useChip, onDelete, textOnly, style, showProfileModal, onProfileModalClose } = props);
    }

    if (size === undefined) {
        size = "20";
    }

    let specialColor = null;
    let badges = [];
    if (Object.keys(vars.specialRoles).includes(discordid)) {
        specialColor = vars.specialRoles[discordid][0].color;
        for (let i = 0; i < vars.specialRoles[discordid].length; i++) {
            let sr = vars.specialRoles[discordid][i];
            let badge = null;
            if (['project_team', 'community_manager', 'development_team', 'support_manager', 'marketing_manager', 'support_team', 'marketing_team', 'graphic_team', 'translation_team'].includes(sr.name)) {
                badge = <Tooltip key={`badge-${uid}-chub}`} placement="top" arrow title="CHub Staff"
                    PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, -10] } }] }}>
                    <FontAwesomeIcon icon={faScrewdriverWrench} style={{ color: "#2fc1f7" }} />
                </Tooltip>;
            } else if (['community_legend'].includes(sr.name)) {
                badge = <Tooltip key={`badge-${uid}-legend`} placement="top" arrow title="CHub Community Legend"
                    PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, -10] } }] }}>
                    <FontAwesomeIcon icon={faCrown} style={{ color: "#b2db80" }} />
                </Tooltip>;
            } else if (['patron', 'server_booster', 'fv3ea'].includes(sr.name)) {
                badge = <Tooltip key={`badge-${uid}-supporter`} placement="top" arrow title="CHub Supporter"
                    PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, -10] } }] }}>
                    <FontAwesomeIcon icon={faClover} style={{ color: "#f47fff" }} />
                </Tooltip>;
            }
            if (badge !== null && !badges.includes(badge)) {
                badges.push(badge);
            }
        }
    }

    const [snackbarContent, setSnackbarContent] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const handleCloseSnackbar = useCallback((e) => {
        setSnackbarContent("");
    }, []);

    const theme = useTheme();

    const [showContextMenu, setShowContextMenu] = useState(false);
    const [showPopover, setShowPopover] = useState(false);
    const [anchorPosition, setAnchorPosition] = useState({ top: 0, left: 0 });
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
    const handleClick = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (showPopover) {
            setShowPopover(false);
            return;
        }
        setAnchorPosition({ top: e.clientY, left: e.clientX });
        setShowPopover(true);
    }, [showPopover]);
    const [ctxAction, setCtxAction] = useState("");
    const updateCtxAction = useCallback((e, action) => {
        e.preventDefault();
        e.stopPropagation();
        setCtxAction(action);
        setShowContextMenu(false);
        setDialogBtnDisabled(false);
    }, []);
    const [dialogBtnDisabled, setDialogBtnDisabled] = useState(false);

    let trackers = [];
    for (let i = 0; i < vars.apiconfig.tracker.length; i++) {
        if (!trackers.includes(vars.apiconfig.tracker[i].type)) {
            trackers.push(vars.apiconfig.tracker[i].type);
        }
    }
    const trackerMapping = { "tracksim": "TrackSim", "trucky": "Trucky" };

    const [newRoles, setNewRoles] = useState(roles);
    const [newPoints, setNewPoints] = useState({ distance: 0, bonus: 0 });
    const [newProfile, setNewProfile] = useState({ name: name, avatar: avatar });
    const [newAboutMe, setNewAboutMe] = useState(bio);
    const [newConnections, setNewConnections] = useState({ email: email, discordid: discordid, steamid: steamid, truckersmpid: truckersmpid });
    const [newBan, setNewBan] = useState({ expire: +new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000) / 1000, reason: "" });
    const [trackerInUse, setTrackerInUse] = useState(vars.userInfo.tracker !== "unknown" ? vars.userInfo.tracker : trackers[0]);
    const [roleHistory, setRoleHistory] = useState(undefined);
    const [banHistory, setBanHistory] = useState(undefined);
    const [newNote, setNewNote] = useState(note);
    const [newGlobalNote, setNewGlobalNote] = useState(global_note);

    useEffect(() => {
        let ok = false;
        for (let i = 0; i < vars.members.length; i++) {
            if (vars.members[i].uid === uid) {
                ok = true;
                if (vars.members[i].role_history !== undefined) setRoleHistory(vars.members[i].role_history);
                if (vars.members[i].ban_history !== undefined) setBanHistory(vars.members[i].ban_history);
                break;
            }
        }
        if (!ok) {
            let uids = Object.keys(vars.users);
            for (let i = 0; i < uids.length; i++) {
                if (uids[i] === uid) {
                    ok = true;
                    if (vars.users[uids[i]].role_history !== undefined) setRoleHistory(vars.users[uids[i]].role_history);
                    if (vars.users[uids[i]].ban_history !== undefined) setBanHistory(vars.users[uids[i]].ban_history);
                    break;
                }
            }
        }
    }, [uid, setRoleHistory, setBanHistory]);

    const uidRef = useRef(uid);
    const useridRef = useRef(userid);
    const bioRef = useRef(bio);
    const noteRef = useRef(note);
    const globalNoteRef = useRef(global_note);
    const discordidRef = useRef(discordid);
    const emailRef = useRef(email);
    const steamidRef = useRef(steamid);
    const truckersmpidRef = useRef(truckersmpid);
    const nameRef = useRef(name);
    const avatarRef = useRef(avatar);
    const rolesRef = useRef(roles);
    const banRef = useRef(ban);
    useEffect(() => {
        if (uidRef.current === undefined) {
            uidRef.current = uid;
        }
        if (useridRef.current === undefined) {
            useridRef.current = userid;
        }
        if (bioRef.current === undefined) {
            bioRef.current = bio;
        }
        if (noteRef.current === undefined) {
            noteRef.current = note;
        }
        if (globalNoteRef.current === undefined) {
            globalNoteRef.current = global_note;
        }
        if (discordidRef.current === undefined) {
            discordidRef.current = discordid;
        }
        if (emailRef.current === undefined) {
            emailRef.current = email;
        }
        if (steamidRef.current === undefined) {
            steamidRef.current = steamid;
        }
        if (truckersmpidRef.current === undefined) {
            truckersmpidRef.current = truckersmpid;
        }
        if (nameRef.current === undefined) {
            nameRef.current = name;
        }
        if (avatarRef.current === undefined) {
            avatarRef.current = avatar;
        }
        if (rolesRef.current === undefined) {
            rolesRef.current = roles;
        }
        if (banRef.current === undefined) {
            banRef.current = ban;
        }
    }, [uid, userid, bio, note, global_note, discordid, email, steamid, truckersmpid, name, avatar, roles, ban,]);

    const updateUserInfo = useCallback(async () => {
        const updateExternalUserTable = new CustomEvent('updateExternalUserTable', {});
        window.dispatchEvent(updateExternalUserTable);

        let resp = await axios({ url: `${vars.dhpath}/user/profile?uid=${uid}`, method: "GET", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 200) {
            uidRef.current = resp.data.uid;
            useridRef.current = resp.data.userid;
            discordidRef.current = resp.data.discordid;
            emailRef.current = resp.data.email;
            steamidRef.current = resp.data.steamid;
            truckersmpidRef.current = resp.data.truckersmpid;
            nameRef.current = resp.data.name;
            bioRef.current = resp.data.bio;
            noteRef.current = resp.data.note;
            globalNoteRef.current = resp.data.global_note;
            avatarRef.current = resp.data.avatar;
            rolesRef.current = resp.data.roles;
            banRef.current = resp.data.ban;
            setNewProfile({ name: resp.data.name, avatar: resp.data.avatar });
            setNewAboutMe(resp.data.bio);
            setNewNote(resp.data.note);
            setNewGlobalNote(resp.data.global_note);
            setNewRoles(resp.data.roles);
            setNewConnections({ email: resp.data.email, discordid: resp.data.discordid, steamid: resp.data.steamid, truckersmpid: resp.data.truckersmpid });
            setTrackerInUse(resp.data.tracker);
            setRoleHistory(resp.data.role_history);
            setBanHistory(resp.data.ban_history);
            for (let i = 0; i < vars.members.length; i++) {
                if (vars.members[i].uid === uid) {
                    vars.members[i] = resp.data;
                    break;
                }
            }
            vars.users[uid] = resp.data;

            const userUpdated = new CustomEvent('userUpdated', {});
            window.dispatchEvent(userUpdated);
        }
    }, [uid]);

    useEffect(() => {
        const userUpdated = () => {
            if (vars.users[uid] !== undefined) {
                uidRef.current = vars.users[uid].uid;
                useridRef.current = vars.users[uid].userid;
                discordidRef.current = vars.users[uid].discordid;
                emailRef.current = vars.users[uid].email;
                steamidRef.current = vars.users[uid].steamid;
                truckersmpidRef.current = vars.users[uid].truckersmpid;
                nameRef.current = vars.users[uid].name;
                bioRef.current = vars.users[uid].bio;
                noteRef.current = vars.users[uid].note;
                globalNoteRef.current = vars.users[uid].global_note;
                avatarRef.current = vars.users[uid].avatar;
                rolesRef.current = vars.users[uid].roles;
                banRef.current = vars.users[uid].ban;
                setNewProfile({ name: vars.users[uid].name, avatar: vars.users[uid].avatar });
                setNewAboutMe(vars.users[uid].bio);
                setNewNote(vars.users[uid].note);
                setNewGlobalNote(vars.users[uid].global_note);
                setNewRoles(vars.users[uid].roles);
                setNewConnections({ email: vars.users[uid].email, discordid: vars.users[uid].discordid, steamid: vars.users[uid].steamid, truckersmpid: vars.users[uid].truckersmpid });
                setTrackerInUse(vars.users[uid].tracker);
                setRoleHistory(vars.users[uid].role_history);
                setBanHistory(vars.users[uid].ban_history);
            }
        };
        window.addEventListener("userUpdated", userUpdated);
        return () => {
            window.removeEventListener("userUpdated", userUpdated);
        };
    }, [uid]);

    const updateProfile = useCallback(async (sync_to = undefined) => {
        setDialogBtnDisabled(true);
        sync_to === undefined ? sync_to = "" : sync_to = `&sync_to_${sync_to}=true`;
        let resp = await axios({ url: `${vars.dhpath}/user/profile?uid=${uid}${sync_to}`, method: "PATCH", data: newProfile, headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            await updateUserInfo();
            setSnackbarContent("Profile updated");
            setSnackbarSeverity("success");
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setDialogBtnDisabled(false);
    }, [uid, newProfile, updateUserInfo]);

    const updateAboutMe = useCallback(async () => {
        setDialogBtnDisabled(true);
        let resp = await axios({ url: `${vars.dhpath}/user/bio`, method: "PATCH", data: { "bio": newAboutMe }, headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            await updateUserInfo();
            setSnackbarContent("About me updated");
            setSnackbarSeverity("success");
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setDialogBtnDisabled(false);
    }, [newAboutMe, updateUserInfo]);

    const updateNote = useCallback(async () => {
        if (noteRef.current === newNote) { return; }
        vars.users[uid].note = newNote;
        for (let i = 0; i < vars.members.length; i++) {
            if (vars.members[i].uid === uid) {
                vars.members[i].note = newNote;
                break;
            }
        }
        const userUpdated = new CustomEvent('userUpdated', {});
        window.dispatchEvent(userUpdated);

        await axios({ url: `${vars.dhpath}/user/${uid}/note`, method: "PATCH", data: { "note": newNote }, headers: { Authorization: `Bearer ${getAuthToken()}` } });
        updateUserInfo();
    }, [uid, newNote, updateUserInfo]);

    const updateGlobalNote = useCallback(async () => {
        setDialogBtnDisabled(true);
        let resp = await axios({ url: `${vars.dhpath}/user/${uid}/note/global`, method: "PATCH", data: { note: newGlobalNote }, headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            await updateUserInfo();
            setSnackbarContent("Global note updated");
            setSnackbarSeverity("success");
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setDialogBtnDisabled(false);
    }, [uid, newGlobalNote, updateUserInfo]);

    const updateRoles = useCallback(async () => {
        setDialogBtnDisabled(true);
        let resp = await axios({ url: `${vars.dhpath}/member/${useridRef.current}/roles`, method: "PATCH", data: { roles: newRoles.map((role) => (role.id)) }, headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            await updateUserInfo();
            setSnackbarContent("Roles updated");
            setSnackbarSeverity("success");
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setDialogBtnDisabled(false);
    }, [newRoles, updateUserInfo]);

    const updatePoints = useCallback(async () => {
        setDialogBtnDisabled(true);
        let resp = await axios({ url: `${vars.dhpath}/member/${useridRef.current}/points`, method: "PATCH", data: { distance: newPoints.distance, bonus: newPoints.bonus }, headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            updateUserInfo();
            setSnackbarContent("Points updated");
            setSnackbarSeverity("success");
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setDialogBtnDisabled(false);
    }, [newPoints, updateUserInfo]);

    const switchTracker = useCallback(async () => {
        setDialogBtnDisabled(true);
        let resp = await axios({ url: `${vars.dhpath}/user/tracker/switch?uid=${uid}`, data: { tracker: trackerInUse }, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            setSnackbarContent("Tracker updated");
            setSnackbarSeverity("success");
            updateUserInfo();
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setDialogBtnDisabled(false);
    }, [uid, trackerInUse, updateUserInfo]);

    const acceptUser = useCallback(async () => {
        setDialogBtnDisabled(true);
        let resp = await axios({ url: `${vars.dhpath}/user/${uid}/accept`, data: { tracker: trackerInUse }, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            setSnackbarContent("User accepted as member");
            setSnackbarSeverity("success");
            updateUserInfo();
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
            setDialogBtnDisabled(false);
        }
    }, [uid, trackerInUse, updateUserInfo]);

    const updateConnections = useCallback(async (action = "update") => {
        setDialogBtnDisabled(true);
        let resp = undefined;
        if (action === "update") {
            resp = await axios({ url: `${vars.dhpath}/user/${uid}/connections`, method: "PATCH", data: newConnections, headers: { Authorization: `Bearer ${getAuthToken()}` } });
        } else if (action === "delete") {
            resp = await axios({ url: `${vars.dhpath}/user/${uid}/connections`, method: "DELETE", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        }
        if (resp.status === 204) {
            await updateUserInfo();
            setSnackbarContent(`Connections ${action}d`);
            setSnackbarSeverity("success");
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setDialogBtnDisabled(false);
    }, [uid, newConnections, updateUserInfo]);

    const disableMFA = useCallback(async () => {
        setDialogBtnDisabled(true);
        let resp = await axios({ url: `${vars.dhpath}/user/mfa/disable?uid=${uid}`, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            updateUserInfo();
            setSnackbarContent("MFA disabled");
            setSnackbarSeverity("success");
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
            setDialogBtnDisabled(false);
        }
    }, [uid, updateUserInfo]);

    const dismissMember = useCallback(async () => {
        setDialogBtnDisabled(true);
        let resp = await axios({ url: `${vars.dhpath}/member/${useridRef.current}/dismiss`, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            updateUserInfo();
            let newMembers = [];
            for (let i = 0; i < vars.members.list; i++) {
                if (vars.members[i].userid !== userid) {
                    newMembers.push(vars.members[i]);
                }
            }
            vars.members = newMembers;
            setSnackbarContent("User dismissed!");
            setSnackbarSeverity("success");
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
            setDialogBtnDisabled(false);
        }
    }, [userid, updateUserInfo]);

    const deleteUser = useCallback(async () => {
        setDialogBtnDisabled(true);
        let resp = await axios({ url: `${vars.dhpath}/user/${uid}`, method: "DELETE", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            setSnackbarContent("User deleted");
            setSnackbarSeverity("success");

            const updateExternalUserTable = new CustomEvent('updateExternalUserTable', {});
            window.dispatchEvent(updateExternalUserTable);
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
            setDialogBtnDisabled(false);
        }
    }, [uid]);

    const putBan = useCallback(async () => {
        setDialogBtnDisabled(true);
        let meta = removeNullValues({ uid: uid, email: email, discordid: discordid, steamid: steamid, truckersmpid: truckersmpid, expire: newBan.expire, reason: newBan.reason });
        let resp = await axios({ url: `${vars.dhpath}/user/ban`, method: "PUT", data: meta, headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            setSnackbarContent("User banned");
            setSnackbarSeverity("success");
            updateUserInfo();
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
            setDialogBtnDisabled(false);
        }
    }, [uid, discordid, email, steamid, truckersmpid, newBan, updateUserInfo]);

    const deleteBan = useCallback(async () => {
        setDialogBtnDisabled(true);
        let meta = removeNullValues({ uid: uid, email: email, discordid: discordid, steamid: steamid, truckersmpid: truckersmpid });
        let resp = await axios({ url: `${vars.dhpath}/user/ban`, method: "DELETE", data: meta, headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            setSnackbarContent("User unbanned");
            setSnackbarSeverity("success");
            updateUserInfo();
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
            setDialogBtnDisabled(false);
        }
    }, [uid, discordid, email, steamid, truckersmpid, updateUserInfo]);

    let profileModal = <Dialog open={true} onClose={() => { setCtxAction(""); updateNote(); if (onProfileModalClose !== undefined) onProfileModalClose(); }} fullWidth >
        <Card sx={{ padding: "5px", backgroundImage: `linear-gradient(#484d5f, #dbdbe4)` }}>
            <CardMedia
                component="img"
                image={`${vars.dhpath}/member/banner?userid=${userid}`}
                alt=""
                sx={{ borderRadius: "5px 5px 0 0" }}
            />
            <CardContent sx={{ padding: "10px", backgroundImage: `linear-gradient(${theme.palette.background.paper}A0, ${theme.palette.background.paper}E0)`, borderRadius: "0 0 5px 5px" }}>
                <CardContent sx={{ padding: "10px", backgroundImage: `linear-gradient(${theme.palette.background.paper}E0, ${theme.palette.background.paper}E0)`, borderRadius: "5px" }}>
                    <div style={{ display: "flex", flexDirection: "row" }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, flexGrow: 1, display: 'flex', alignItems: "center" }}>
                            {nameRef.current}
                        </Typography>
                        <Typography variant="h7" sx={{ flexGrow: 1, display: 'flex', alignItems: "center", maxWidth: "fit-content" }}>
                            {badges.map((badge) => { return badge; })}&nbsp;&nbsp;
                            {useridRef.current !== null && useridRef.current !== undefined && useridRef.current >= 0 && <><FontAwesomeIcon icon={faHashtag} />{useridRef.current}</>}
                            {showProfileModal !== 2 && ((uid === vars.userInfo.uid || (uid !== -1 && checkPerm(vars.userInfo.roles, ["admin", "hrm", "hr", "manage_profile"])))) && <>&nbsp;&nbsp;<IconButton size="small" aria-label="Edit" onClick={(e) => { updateCtxAction(e, "update-profile"); }}><FontAwesomeIcon icon={faPencil} /></IconButton ></>}
                        </Typography>
                    </div>
                    {vars.users[uid] !== undefined && vars.users[uid].activity !== null && vars.users[uid].activity !== undefined && <Typography variant="body2">{GetActivity(vars.users[uid].activity)}</Typography>}
                    <Divider sx={{ mt: "8px", mb: "8px" }} />
                    {bioRef.current !== "" && <>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>
                            ABOUT ME
                        </Typography>
                        <Typography variant="body2">
                            <MarkdownRenderer>{bioRef.current}</MarkdownRenderer>
                        </Typography>
                    </>}
                    <Grid container sx={{ mt: "10px" }}>
                        <Grid item xs={6}>
                            <Typography variant="body2" sx={{ fontWeight: 800 }}>
                                MEMBER SINCE
                            </Typography>
                            {vars.users[uid] !== undefined && <Typography variant="body2" sx={{ display: "inline-block" }}>
                                {getFormattedDate(new Date(vars.users[uid].join_timestamp * 1000)).split(" at ")[0]}
                            </Typography>}
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body2" sx={{ fontWeight: 800 }}>
                                TRACKER
                            </Typography>
                            <Typography variant="body2">
                                {trackerMapping[trackerInUse]}
                            </Typography>
                        </Grid>
                    </Grid>
                    {roles !== null && roles !== undefined && <Box sx={{ mt: "10px" }}>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>
                            {roles.length > 1 ? `ROLES` : `ROLE`}
                        </Typography>
                        {roles.map((role) => (
                            <Chip
                                key={`role-${role}`}
                                avatar={<div style={{ marginLeft: "5px", width: "12px", height: "12px", backgroundColor: vars.roles[role] !== undefined && vars.roles[role].color !== undefined ? vars.roles[role].color : "#777777", borderRadius: "100%" }} />}
                                label={vars.roles[role] !== undefined ? vars.roles[role].name : `Unknown Role (${role})`}
                                variant="outlined"
                                size="small"
                                sx={{ borderRadius: "5px", margin: "3px" }}
                            />
                        ))}
                    </Box>}
                    <Box sx={{ mt: "10px" }}>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>
                            NOTE
                        </Typography>
                        <TextField
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            fullWidth multiline
                            size="small"
                        />
                    </Box>
                </CardContent>
            </CardContent>
        </Card>
    </Dialog>;

    if (showProfileModal === 2) return <>{profileModal}</>;
    else if (showProfileModal === 1) return <></>;

    let content = <>
        {!useChip && <>
            {!textOnly && <><Avatar src={avatarRef.current}
                style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    verticalAlign: "middle",
                    display: "inline-flex"
                }}
                onClick={handleClick}
                onContextMenu={handleContextMenu}
            />
                &nbsp;</>}
            {specialColor === null && <span key={`user-${uid}-${Math.random()}`} className="hover-underline" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", cursor: "pointer" }} onClick={handleClick} onContextMenu={handleContextMenu}>{nameRef.current}</span>}
            {specialColor !== null && <span key={`user-${uid}-${Math.random()}`} className="hover-underline" style={{ color: specialColor, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", cursor: "pointer" }} onClick={handleClick} onContextMenu={handleContextMenu}>{nameRef.current}</span>}
        </>}
        {useChip && <>
            <Chip
                key={`user-${uid}-${Math.random()}`}
                avatar={textOnly ? undefined : <Avatar alt="" src={avatarRef.current} />}
                label={nameRef.current}
                variant="outlined"
                sx={{ margin: "3px", cursor: "pointer", ...specialColor !== null ? { color: specialColor } : {}, ...style }}
                onDelete={onDelete} onClick={handleClick} onContextMenu={handleContextMenu}
            />
        </>}
        {showContextMenu && <Menu
            anchorReference="anchorPosition"
            anchorPosition={anchorPosition}
            open={showContextMenu}
            onClose={(e) => { e.preventDefault(); e.stopPropagation(); setShowContextMenu(false); }}
        >
            <MenuItem onClick={(e) => { updateCtxAction(e, "show-profile"); }}><ListItemIcon><FontAwesomeIcon icon={faAddressCard} /></ListItemIcon> Profile</MenuItem>
            {(uid === vars.userInfo.uid || (uid !== -1 && checkPerm(vars.userInfo.roles, ["admin", "hrm", "hr", "manage_profile"]))) && <Divider />}
            {uid === vars.userInfo.uid && <MenuItem onClick={(e) => { updateCtxAction(e, "update-about-me"); }}><ListItemIcon><FontAwesomeIcon icon={faComment} /></ListItemIcon> Update About Me</MenuItem>}
            {(uid === vars.userInfo.uid || (uid !== -1 && checkPerm(vars.userInfo.roles, ["admin", "hrm", "hr", "manage_profile"]))) && <MenuItem onClick={(e) => { updateCtxAction(e, "switch-tracker"); }}><ListItemIcon><FontAwesomeIcon icon={faTruck} /></ListItemIcon> Switch Tracker</MenuItem>}
            <Divider />
            {checkPerm(vars.userInfo.roles, ["admin", "hrm", "hr", "update_user_global_note"]) && <MenuItem onClick={(e) => { updateCtxAction(e, "update-global-note"); }}><ListItemIcon><FontAwesomeIcon icon={faNoteSticky} /></ListItemIcon> Update Global Note</MenuItem>}
            {userid !== null && userid >= 0 && checkPerm(vars.userInfo.roles, ["admin", "hrm", "hr", "division", "update_member_roles"]) && <MenuItem onClick={(e) => { updateCtxAction(e, "update-roles"); }}><ListItemIcon><FontAwesomeIcon icon={faPeopleGroup} /></ListItemIcon> Update Roles</MenuItem>}
            {userid !== null && userid >= 0 && checkPerm(vars.userInfo.roles, ["admin", "hrm", "hr", "update_member_points"]) && <MenuItem onClick={(e) => { updateCtxAction(e, "update-points"); }}><ListItemIcon><FontAwesomeIcon icon={faTrophy} /></ListItemIcon> Update Points</MenuItem>}
            <MenuItem onClick={(e) => { updateUserInfo(); updateCtxAction(e, "role-ban-history"); }}><ListItemIcon><FontAwesomeIcon icon={faBarsStaggered} /></ListItemIcon> Role/Ban History</MenuItem>
            {((userid === null || userid < 0) && ban === null && checkPerm(vars.userInfo.roles, ["admin", "hrm", "add_member"]) || checkPerm(vars.userInfo.roles, ["admin", "hrm", "update_user_connections"]) || checkPerm(vars.userInfo.roles, ["admin", "hrm", "disable_user_mfa"])) && <Divider />}
            {(userid === null || userid < 0) && ban === null && checkPerm(vars.userInfo.roles, ["admin", "hrm", "add_member"]) && <MenuItem sx={{ color: theme.palette.success.main }} onClick={(e) => { updateCtxAction(e, "accept-user"); }}><ListItemIcon><FontAwesomeIcon icon={faUserCheck} /></ListItemIcon> Accept as Member</MenuItem>}
            {checkPerm(vars.userInfo.roles, ["admin", "hrm", "update_user_connections"]) && <MenuItem sx={{ color: theme.palette.warning.main }} onClick={(e) => { updateCtxAction(e, "update-connections"); }}><ListItemIcon><FontAwesomeIcon icon={faLink} /></ListItemIcon> Update Connections</MenuItem>}
            {checkPerm(vars.userInfo.roles, ["admin", "hrm", "disable_user_mfa"]) && <MenuItem sx={{ color: theme.palette.warning.main }} onClick={(e) => { updateCtxAction(e, "disable-mfa"); }}><ListItemIcon><FontAwesomeIcon icon={faUnlockKeyhole} /></ListItemIcon> Disable MFA</MenuItem>}
            {((userid === null || userid < 0) && ban === null && checkPerm(vars.userInfo.roles, ["admin", "hrm", "ban_user"]) || userid !== null && userid >= 0 && checkPerm(vars.userInfo.roles, ["admin", "hrm", "dismiss_member"]) || checkPerm(vars.userInfo.roles, ["admin", "hrm", "delete_user"])) && <Divider />}
            {(userid === null || userid < 0) && ban === null && checkPerm(vars.userInfo.roles, ["admin", "hrm", "ban_user"]) && <MenuItem sx={{ color: theme.palette.error.main }} onClick={(e) => { updateCtxAction(e, "ban-user"); }}><ListItemIcon><FontAwesomeIcon icon={faBan} /></ListItemIcon> Ban</MenuItem>}
            {(userid === null || userid < 0) && ban !== null && checkPerm(vars.userInfo.roles, ["admin", "hrm", "ban_user"]) && <MenuItem sx={{ color: theme.palette.error.main }} onClick={(e) => { updateCtxAction(e, "unban-user"); }}><ListItemIcon><FontAwesomeIcon icon={faCircleCheck} /></ListItemIcon> Unban</MenuItem>}
            {userid !== null && userid >= 0 && checkPerm(vars.userInfo.roles, ["admin", "hrm", "dismiss_member"]) && <MenuItem sx={{ color: theme.palette.error.main }} onClick={(e) => { updateCtxAction(e, "dismiss-member"); }}><ListItemIcon><FontAwesomeIcon icon={faUserSlash} /></ListItemIcon> Dismiss Member</MenuItem>}
            {checkPerm(vars.userInfo.roles, ["admin", "hrm", "delete_user"]) && <MenuItem sx={{ color: theme.palette.error.main }} onClick={(e) => { updateCtxAction(e, "delete-user"); }}><ListItemIcon><FontAwesomeIcon icon={faTrashCan} /></ListItemIcon> Delete User</MenuItem>}
        </Menu>}
        <div style={{ display: "inline-block" }} onClick={(e) => { e.stopPropagation(); }}>
            {ctxAction === "update-profile" &&
                <Dialog open={true} onClose={() => { setCtxAction(""); }} fullWidth  >
                    <DialogTitle>Update Profile | {nameRef.current} ({userid !== null ? `User ID: ${useridRef.current} / ` : ""}UID: {uid})</DialogTitle>
                    <DialogContent>
                        <Typography variant="body2">- Custom profile may be set by providing name and avatar url</Typography>
                        <Typography variant="body2">- Alternatively, sync to Discord / Steam / TruckersMP profile</Typography>
                        <Grid container spacing={2} sx={{ mt: "5px" }}>
                            <Grid item xs={12}>
                                <TextField
                                    label="Name"
                                    value={newProfile.name}
                                    onChange={(e) => setNewProfile({ ...newProfile, name: e.target.value })}
                                    fullWidth disabled={dialogBtnDisabled}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Avatar URL"
                                    value={newProfile.avatar}
                                    onChange={(e) => setNewProfile({ ...newProfile, avatar: e.target.value })}
                                    fullWidth disabled={dialogBtnDisabled}
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
            {ctxAction === "update-about-me" &&
                <Dialog open={true} onClose={() => { setCtxAction(""); }} fullWidth  >
                    <DialogTitle>Update About Me | {nameRef.current} ({userid !== null ? `User ID: ${useridRef.current} / ` : ""}UID: {uid})</DialogTitle>
                    <DialogContent>
                        <TextField
                            label="About Me"
                            value={newAboutMe}
                            onChange={(e) => setNewAboutMe(e.target.value)}
                            fullWidth disabled={dialogBtnDisabled}
                            sx={{ mt: "5px" }}
                        />
                    </DialogContent>
                    <DialogActions >
                        <ButtonGroup>
                            <Button variant="primary" onClick={() => { setCtxAction(""); }}>Close</Button>
                            <Button variant="contained" onClick={() => { updateAboutMe(); }} disabled={dialogBtnDisabled}>Save</Button>
                        </ButtonGroup>
                    </DialogActions>
                </Dialog>
            }
            {ctxAction === "update-roles" &&
                <Dialog open={true} onClose={() => { setCtxAction(""); }} fullWidth >
                    <DialogTitle>Update Roles | {nameRef.current} (User ID: {useridRef.current})</DialogTitle>
                    <DialogContent>
                        <RoleSelect initialRoles={rolesRef.current} onUpdate={setNewRoles} />
                    </DialogContent>
                    <DialogActions>
                        <Button variant="primary" onClick={() => { setCtxAction(""); }}>Close</Button>
                        <Button variant="contained" onClick={() => { updateRoles(); }} disabled={dialogBtnDisabled}>Save</Button>
                    </DialogActions>
                </Dialog>
            }
            {ctxAction === "update-global-note" &&
                <Dialog open={true} onClose={() => { setCtxAction(""); }} fullWidth >
                    <DialogTitle>Update Global Note | {nameRef.current} (User ID: {useridRef.current})</DialogTitle>
                    <DialogContent>
                        <Typography variant="body2">- Global note works like your private note, but it is shared between staff.</Typography>
                        <TextField
                            label="Global Note"
                            value={newGlobalNote}
                            onChange={(e) => setNewGlobalNote(e.target.value)}
                            fullWidth
                            sx={{ mt: "15px" }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button variant="primary" onClick={() => { setCtxAction(""); }}>Close</Button>
                        <Button variant="contained" onClick={() => { updateGlobalNote(); }} disabled={dialogBtnDisabled}>Save</Button>
                    </DialogActions>
                </Dialog>
            }
            {ctxAction === "update-points" &&
                <Dialog open={true} onClose={() => { setCtxAction(""); }} fullWidth  >
                    <DialogTitle>Update Points | {nameRef.current} (User ID: {useridRef.current})</DialogTitle>
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
            {ctxAction === "switch-tracker" &&
                <Dialog open={true} onClose={() => { setCtxAction(""); }} fullWidth >
                    <DialogTitle>Switch Tracker | {nameRef.current} ({userid !== null ? `User ID: ${useridRef.current} / ` : ""}UID: {uid})</DialogTitle>
                    <DialogContent>
                        <Typography variant="body2">- This will change the tracker we listen data from for the user.</Typography>
                        <FormControl component="fieldset" sx={{ mt: "5px" }}>
                            <FormLabel component="legend">Tracker:</FormLabel>
                            <Select value={trackerInUse} onChange={(e) => setTrackerInUse(e.target.value)} sx={{ marginTop: "6px", height: "30px" }}>
                                {trackers.map((tracker) => (
                                    <MenuItem key={tracker} value={tracker}>
                                        {trackerMapping[tracker]}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="primary" onClick={() => { setCtxAction(""); }}>Close</Button>
                        <Button variant="contained" color="success" onClick={() => { switchTracker(); }} disabled={dialogBtnDisabled}>Update</Button>
                    </DialogActions>
                </Dialog>
            }
            {ctxAction === "accept-user" &&
                <Dialog open={true} onClose={() => { setCtxAction(""); }} fullWidth >
                    <DialogTitle>Accept as Member | {nameRef.current} ({userid !== null ? `User ID: ${useridRef.current} / ` : ""}UID: {uid})</DialogTitle>
                    <DialogContent>
                        <Typography variant="body2">- The user will be accepted as member and given an unique User ID.</Typography>
                        <Typography variant="body2">- This will not affect the user's initial roles or application status. They must be updated manually at this point. (We may support partial automations in the future.)</Typography>
                        <FormControl component="fieldset" sx={{ mt: "5px" }}>
                            <FormLabel component="legend">Select the tracker the user will use (This may be changed later):</FormLabel>
                            <Select value={trackerInUse} onChange={(e) => setTrackerInUse(e.target.value)} sx={{ marginTop: "6px", height: "30px" }}>
                                {trackers.map((tracker) => (
                                    <MenuItem key={tracker} value={tracker}>
                                        {trackerMapping[tracker]}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="primary" onClick={() => { setCtxAction(""); }}>Close</Button>
                        <Button variant="contained" color="success" onClick={() => { acceptUser(); }} disabled={dialogBtnDisabled}>Accept</Button>
                    </DialogActions>
                </Dialog>
            }
            {ctxAction === "role-ban-history" &&
                <Dialog open={true} onClose={() => { setCtxAction(""); }} fullWidth >
                    <DialogTitle>{nameRef.current} ({userid !== null ? `User ID: ${useridRef.current} / ` : ""}UID: {uid})</DialogTitle>
                    <DialogContent>
                        <Box display="flex" alignItems="center">
                            <Typography variant="h7" sx={{ fontWeight: 800 }}>Role History</Typography>
                            <Typography variant="body2" style={{ fontSize: '0.75rem', marginLeft: '8px', color: roleHistory === null ? theme.palette.error.main : (roleHistory !== undefined ? theme.palette.success.main : theme.palette.info.main) }}>{roleHistory === null ? `Invisible` : (roleHistory !== undefined ? `Visible` : `Loading`)}</Typography>
                        </Box>
                        {roleHistory !== undefined && roleHistory !== null && roleHistory.map((history, idx) => (<>
                            {idx !== 0 && <Divider sx={{ mt: "5px" }} />}
                            {history.added_roles.map((role) => (<Typography key={`history-${idx}`} variant="body2" sx={{ color: theme.palette.info.main }}>+ {vars.roles[role].name}</Typography>))}
                            {history.removed_roles.map((role) => (<Typography key={`history-${idx}`} variant="body2" sx={{ color: theme.palette.warning.main }}>- {vars.roles[role].name}</Typography>))}
                            <Typography key={`history-${idx}-time`} variant="body2" sx={{ color: theme.palette.text.secondary }}><TimeAgo timestamp={history.timestamp * 1000} /></Typography>
                        </>
                        ))}
                        {roleHistory !== undefined && roleHistory !== null && roleHistory.length === 0 && <Typography variant="body2" >No Data</Typography>}

                        <Box display="flex" alignItems="center" sx={{ mt: "10px" }}>
                            <Typography variant="h7" sx={{ fontWeight: 800 }}>Ban History</Typography>
                            <Typography variant="body2" style={{ fontSize: '0.75rem', marginLeft: '8px', color: banHistory === null ? theme.palette.error.main : (banHistory !== undefined ? theme.palette.success.main : theme.palette.info.main) }}>{banHistory === null ? `Invisible` : (banHistory !== undefined ? `Visible` : `Loading`)}</Typography>
                        </Box>
                        {banHistory !== undefined && banHistory !== null && banHistory.map((history, idx) => (<>
                            {idx !== 0 && <Divider sx={{ mt: "5px" }} />}
                            <Typography key={`history-${idx}`} variant="body2">{history.reason}</Typography>
                            <Typography key={`history-${idx}-time`} variant="body2" sx={{ color: theme.palette.text.secondary }}>Expiry: {getFormattedDate(new Date(history.expire_timestamp * 1000))}</Typography>
                        </>
                        ))}
                        {banHistory !== undefined && banHistory !== null && banHistory.length === 0 && <Typography variant="body2" >No Data</Typography>}
                    </DialogContent>
                    <DialogActions>
                        <Button variant="primary" onClick={() => { setCtxAction(""); }}>Close</Button>
                    </DialogActions>
                </Dialog>
            }
            {ctxAction === "update-connections" &&
                <Dialog open={true} onClose={() => { setCtxAction(""); }} fullWidth  >
                    <DialogTitle>Update Connections | {nameRef.current} ({userid !== null ? `User ID: ${useridRef.current} / ` : ""}UID: {uid})</DialogTitle>
                    <DialogContent>
                        <Typography variant="body2">- Connections should not be modified or deleted unless requested by the user.</Typography>
                        <Typography variant="body2">- Remember that all users have access to updating connections themselves. Staff should only be involved when the user needs to delete the connections or the user is unable to update connections on their own (e.g. lost access to account).</Typography>
                        <Typography variant="body2">- Deleting connections will only delete Steam and TruckersMP connections.</Typography>
                        <Grid container spacing={2} sx={{ mt: "5px" }}>
                            <Grid item xs={6}>
                                <TextField
                                    label="Email"
                                    value={newConnections.email}
                                    onChange={(e) => setNewConnections({ ...newConnections, email: e.target.value })}
                                    fullWidth disabled={dialogBtnDisabled}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label="Discord ID"
                                    value={newConnections.discordid}
                                    onChange={(e) => setNewConnections({ ...newConnections, discordid: e.target.value })}
                                    fullWidth disabled={dialogBtnDisabled}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label="Steam ID"
                                    value={newConnections.steamid}
                                    onChange={(e) => setNewConnections({ ...newConnections, steamid: e.target.value })}
                                    fullWidth disabled={dialogBtnDisabled}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label="TruckersMP ID"
                                    value={newConnections.truckersmpid}
                                    onChange={(e) => setNewConnections({ ...newConnections, truckersmpid: e.target.value })}
                                    fullWidth disabled={dialogBtnDisabled}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'grid', justifyItems: 'start' }}>
                            <ButtonGroup>
                                <Button variant="contained" color="error" onClick={() => { updateConnections("delete"); }} disabled={dialogBtnDisabled}>Delete Connections</Button>
                            </ButtonGroup>
                        </Box>
                        <Box sx={{ display: 'grid', justifyItems: 'end' }}>
                            <ButtonGroup>
                                <Button variant="primary" onClick={() => { setCtxAction(""); }}>Close</Button>
                                <Button variant="contained" onClick={() => { updateConnections(); }} disabled={dialogBtnDisabled}>Save</Button>
                            </ButtonGroup>
                        </Box>
                    </DialogActions>
                </Dialog>
            }
            {ctxAction === "disable-mfa" &&
                <Dialog open={true} onClose={() => { setCtxAction(""); }} fullWidth >
                    <DialogTitle>Disable MFA | {nameRef.current} ({userid !== null ? `User ID: ${useridRef.current} / ` : ""}UID: {uid})</DialogTitle>
                    <DialogContent>
                        <Typography variant="body2">- Multiple Factor Authentication will be disabled for the user.</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.warning.main }}>- This may put the user's account at risk! Only proceed when user's identity is confirmed.</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="primary" onClick={() => { setCtxAction(""); }}>Close</Button>
                        <Button variant="contained" color="error" onClick={() => { disableMFA(); }} disabled={dialogBtnDisabled}>Disable</Button>
                    </DialogActions>
                </Dialog>
            }
            {ctxAction === "ban-user" &&
                <Dialog open={true} onClose={() => { setCtxAction(""); }} fullWidth  >
                    <DialogTitle>Ban User | {nameRef.current} ({userid !== null ? `User ID: ${useridRef.current} / ` : ""}UID: {uid})</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2} sx={{ mt: "5px" }}>
                            <Grid item xs={6}>
                                <TextField
                                    label="Expire Datetime"
                                    type="datetime-local"
                                    value={new Date(new Date(newBan.expire * 1000).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                                    onChange={(e) => { if (!isNaN(parseInt((+new Date(e.target.value)) / 1000))) setNewBan({ ...newBan, expire: parseInt((+new Date(e.target.value)) / 1000) }); }}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Reason"
                                    value={newBan.reason}
                                    onChange={(e) => setNewBan({ ...newBan, reason: e.target.value })}
                                    fullWidth
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="primary" onClick={() => { setCtxAction(""); }}>Close</Button>
                        <Button variant="contained" color="error" onClick={() => { putBan(); }} disabled={dialogBtnDisabled}>Ban</Button>
                    </DialogActions>
                </Dialog>
            }
            {ctxAction === "unban-user" &&
                <Dialog open={true} onClose={() => { setCtxAction(""); }} fullWidth  >
                    <DialogTitle>Unban User | {nameRef.current} ({userid !== null ? `User ID: ${useridRef.current} / ` : ""}UID: {uid})</DialogTitle>
                    <DialogContent>
                        <Typography variant="body2">- The user will be able to login when you unban it</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="primary" onClick={() => { setCtxAction(""); }}>Close</Button>
                        <Button variant="contained" color="success" onClick={() => { deleteBan(); }} disabled={dialogBtnDisabled}>Unban</Button>
                    </DialogActions>
                </Dialog>
            }
            {ctxAction === "dismiss-member" &&
                <Dialog open={true} onClose={() => { setCtxAction(""); }} fullWidth >
                    <DialogTitle>Dismiss Member | {nameRef.current} ({userid !== null ? `User ID: ${useridRef.current} / ` : ""}UID: {uid})</DialogTitle>
                    <DialogContent>
                        <Typography variant="body2">- The user will be dismissed. This process cannot be undone.</Typography>
                        <Typography variant="body2">- Most data generated by the user (including jobs) will not be deleted, but "Unknown" will be shown as driver.</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="primary" onClick={() => { setCtxAction(""); }}>Close</Button>
                        <Button variant="contained" color="error" onClick={() => { dismissMember(); }} disabled={dialogBtnDisabled}>Dismiss</Button>
                    </DialogActions>
                </Dialog>
            }
            {ctxAction === "delete-user" &&
                <Dialog open={true} onClose={() => { setCtxAction(""); }} fullWidth >
                    <DialogTitle>Delete User | {nameRef.current} ({userid !== null ? `User ID: ${useridRef.current} / ` : ""}UID: {uid})</DialogTitle>
                    <DialogContent>
                        <Typography variant="body2">- The user will be deleted immediately (no 14-day cooldown). This process cannot be undone.</Typography>
                        <Typography variant="body2">- User ban will not be affected. To unban the user, use the "Banned Users" table.</Typography>
                        <Typography variant="body2">- Most data generated by the user (including jobs) will not be deleted, but "Unknown" will be shown as driver.</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="primary" onClick={() => { setCtxAction(""); }}>Close</Button>
                        <Button variant="contained" color="error" onClick={() => { deleteUser(); }} disabled={dialogBtnDisabled}>Delete</Button>
                    </DialogActions>
                </Dialog>
            }
            {ctxAction === "show-profile" && <>{profileModal}</>}
        </div>
        <Popover
            open={showPopover}
            anchorReference="anchorPosition"
            anchorPosition={anchorPosition}
            onContextMenu={(e) => { e.stopPropagation(); }}
            onClose={(e) => { updateNote(); e.preventDefault(); e.stopPropagation(); setShowPopover(false); }}
        >
            <Card sx={{ maxWidth: 340, minWidth: 340, padding: "5px", backgroundImage: `linear-gradient(#484d5f, #dbdbe4)` }}>
                <CardMedia
                    component="img"
                    image={`${vars.dhpath}/member/banner?userid=${userid}`}
                    alt=""
                    sx={{ borderRadius: "5px 5px 0 0" }}
                />
                <CardContent sx={{ padding: "10px", backgroundImage: `linear-gradient(${theme.palette.background.paper}A0, ${theme.palette.background.paper}E0)`, borderRadius: "0 0 5px 5px" }}>
                    <CardContent sx={{ padding: "10px", backgroundImage: `linear-gradient(${theme.palette.background.paper}E0, ${theme.palette.background.paper}E0)`, borderRadius: "5px" }}>
                        <div style={{ display: "flex", flexDirection: "row" }}>
                            <Typography variant="h6" sx={{ fontWeight: 800, flexGrow: 1, display: 'flex', alignItems: "center" }}>
                                {nameRef.current}
                            </Typography>
                            <Typography variant="h7" sx={{ flexGrow: 1, display: 'flex', alignItems: "center", maxWidth: "fit-content" }}>
                                {badges.map((badge) => { return badge; })}&nbsp;&nbsp;
                                {useridRef.current !== null && useridRef.current !== undefined && useridRef.current >= 0 && <><FontAwesomeIcon icon={faHashtag} />{useridRef.current}</>}
                            </Typography>
                        </div>
                        {vars.users[uid] !== undefined && vars.users[uid].activity !== null && vars.users[uid].activity !== undefined && <Typography variant="body2">{GetActivity(vars.users[uid].activity)}</Typography>}
                        <Divider sx={{ mt: "8px", mb: "8px" }} />
                        {bioRef.current !== "" && <>
                            <Typography variant="body2" sx={{ fontWeight: 800 }}>
                                ABOUT ME
                            </Typography>
                            <Typography variant="body2">
                                <MarkdownRenderer>{bioRef.current}</MarkdownRenderer>
                            </Typography>
                        </>}
                        <Grid container sx={{ mt: "10px" }}>
                            <Grid item xs={6}>
                                <Typography variant="body2" sx={{ fontWeight: 800 }}>
                                    MEMBER SINCE
                                </Typography>
                                {vars.users[uid] !== undefined && <Typography variant="body2" sx={{ display: "inline-block" }}>
                                    {getFormattedDate(new Date(vars.users[uid].join_timestamp * 1000)).split(" at ")[0]}
                                </Typography>}
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" sx={{ fontWeight: 800 }}>
                                    TRACKER
                                </Typography>
                                <Typography variant="body2">
                                    {trackerMapping[trackerInUse]}
                                </Typography>
                            </Grid>
                        </Grid>
                        {roles !== null && roles !== undefined && <Box sx={{ mt: "10px" }}>
                            <Typography variant="body2" sx={{ fontWeight: 800 }}>
                                {roles.length > 1 ? `ROLES` : `ROLE`}
                            </Typography>
                            {roles.map((role) => (
                                <Chip
                                    key={`role-${role}`}
                                    avatar={<div style={{ marginLeft: "5px", width: "12px", height: "12px", backgroundColor: vars.roles[role] !== undefined && vars.roles[role].color !== undefined ? vars.roles[role].color : "#777777", borderRadius: "100%" }} />}
                                    label={vars.roles[role] !== undefined ? vars.roles[role].name : `Unknown Role (${role})`}
                                    variant="outlined"
                                    size="small"
                                    sx={{ borderRadius: "5px", margin: "3px" }}
                                />
                            ))}
                        </Box>}
                        <Box sx={{ mt: "10px" }}>
                            <Typography variant="body2" sx={{ fontWeight: 800 }}>
                                NOTE
                            </Typography>
                            <TextField
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                fullWidth multiline
                                size="small"
                            />
                        </Box>
                    </CardContent>
                </CardContent>
            </Card>
        </Popover>
        <Portal>
            <Snackbar
                open={!!snackbarContent}
                autoHideDuration={5000}
                onClose={handleCloseSnackbar}
                onClick={(e) => { e.stopPropagation(); }}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
                    {snackbarContent}
                </Alert>
            </Snackbar>
        </Portal>
    </>;

    return <>{content}</>;
};

export default UserCard;