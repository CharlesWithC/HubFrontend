// UserCard component for displaying the user avatar and name,
// and allowing right-click/long-press for context menu

// New users passed into this component will be cached in Context API.
// The cached user will ALWAYS be reused when the user with same uid is passed in.
// Thus, make sure all API calls to update the user also updates the cached user.
// AND, when the API call fails, make sure to revert the changes.

// Originally, user's attributes are extracted to separate variables.
// HOWEVER, this is leading to issues with syncing user data across components.
// Thus, we are reworking this component to use the cached user data directly.

// To ensure that user data is latest, when making a local update that pushes changes to API,
// first update the local user object, and after successful API call, update it again.
// If API call fails, revert the changes ONLY IF the current data is the same as before update
// (there's a possibility that someone else updated the data and we received an update from API with new user data)

// I currently decide to sync user data only when context menu is opened 
// and user data is out-dated (last update is >=30 seconds ago)
// Syncing data after data update seems not really useful and is less traffic-efficient

// NOTE
// "profile" refers to the profile popover AND user's name and avatar

import { useEffect, useState, useCallback, useRef, useContext, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppContext } from '../context';

import { Avatar, Chip, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Button, Snackbar, Alert, Grid, TextField, Typography, ListItemIcon, Box, ButtonGroup, Divider, FormControl, FormLabel, Popover, Card, CardContent, CardMedia, IconButton, Tooltip, Tabs, Tab, useTheme } from "@mui/material";
import { RouteRounded, LocalGasStationRounded, EuroRounded, AttachMoneyRounded, VerifiedOutlined } from "@mui/icons-material";
import { Portal } from '@mui/base';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAddressCard, faPeopleGroup, faTrophy, faLink, faUnlockKeyhole, faUserSlash, faTrashCan, faBan, faCircleCheck, faUserCheck, faTruck, faBarsStaggered, faHashtag, faComment, faNoteSticky, faPencil, faScrewdriverWrench, faCrown, faClover, faAt, faFingerprint, faEarthAmericas, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { faDiscord, faSteam } from '@fortawesome/free-brands-svg-icons';

import SimpleBar from 'simplebar-react';

import DateTimeField from './datetime';
import useLongPress from './useLongPress';
import RoleSelect from './roleselect';
import TimeAgo from './timeago';
import MarkdownRenderer from './markdown';
import StatCard from './statcard';
import CustomTable from './table';
import { darkenColor } from '../designs';

import { customAxios as axios, getAuthToken, checkUserPerm, removeNUEValues, getFormattedDate, getTodayUTC, makeRequestsAuto, ConvertUnit, TSep } from '../functions';

var vars = require("../variables");

const PROFILE_COLOR = {
    light: {
        default: '#fafafa',
        paper: '#f0f0f0',
    },
    dark: {
        default: '#2F3136',
        paper: '#212529',
    }
};

const CURRENTY_ICON = { 1: "€", 2: "$" };

const GetActivity = (tr, activity) => {
    if (activity.status === "offline") {
        if (activity.last_seen !== -1)
            return <>{tr("offline_last_seen")} <TimeAgo key={`${+new Date()}`} timestamp={activity.last_seen * 1000} lower={true} /></>;
        else
            return <>{tr("offline")}</>;
    } else if (activity.status === "online") {
        return <>{tr("online")}</>;
    } else {
        let name = activity.status;
        if (name.startsWith("dlog_")) {
            const deliveryId = name.split("_")[1];
            return <Link to={`/delivery/${deliveryId}`}>{tr("viewing_delivery", { deliveryId: deliveryId })}</Link>;
        } else if (name === "dlog") {
            return <Link to="/delivery">{tr("viewing_deliveries")}</Link>;
        } else if (name === "index") {
            return <Link to="/">{tr("viewing_overview")}</Link>;
        } else if (name === "leaderboard") {
            return <Link to="/leaderboard">{tr("viewing_leaderboard")}</Link>;
        } else if (name === "member") {
            return <Link to="/member">{tr("viewing_members")}</Link>;
        } else if (name === "announcement") {
            return <Link to="/announcement">{tr("viewing_announcements")}</Link>;
        } else if (name === "application") {
            return <Link to="/application/my">{tr("viewing_applications")}</Link>;
        } else if (name === "challenge") {
            return <Link to="/challenge">{tr("viewing_challenges")}</Link>;
        } else if (name === "manage_divisions") {
            return <Link to="/division">{tr("viewing_divisions")}</Link>;
        } else if (name === "downloads") {
            return <Link to="/downloads">{tr("viewing_downloads")}</Link>;
        } else if (name === "event") {
            return <Link to="/event">{tr("viewing_events")}</Link>;
        } else {
            return <></>;
        }
    }
};

const tabBtnProps = (index, current, theme) => {
    return {
        id: `user-popover-tab-${index}`,
        'aria-controls': `user-popover-${index}`,
        style: { color: current === index ? theme.palette.info.main : 'inherit' }
    };
};
const TabPanel = (props) => {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`user-popover-${index}`}
            aria-labelledby={`user-popover-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box>
                    {children}
                </Box>
            )}
        </div>
    );
};

const UserCard = (props) => {
    if (props.user.uid === undefined) return <></>;

    const { t: tr } = useTranslation();
    const theme = useTheme();
    const navigate = useNavigate();
    const { apiConfig, users, setUsers, userProfiles, setUserProfiles, setMemberUIDs, curUser, curUserPerm, userSettings } = useContext(AppContext);

    const bannerRef = useRef(null); // this is a real component reference
    const availableTrackers = useMemo(() => {
        const result = [];
        if (apiConfig !== null) {
            for (let i = 0; i < apiConfig.trackers.length; i++) {
                if (!result.includes(apiConfig.trackers[i].type)) {
                    result.push(apiConfig.trackers[i].type);
                }
            }
        }
        return result;
    }, [apiConfig.trackers]);
    const trackerMapping = { "unknown": "Unknown", "tracksim": "TrackSim", "trucky": "Trucky" };

    if (users[props.user.uid] === undefined) {
        // if user is not yet cached, cache the user
        // fill undefined attributes
        let { uid, userid, name, bio, note, global_note, avatar, email, discordid, steamid, truckersmpid, roles, tracker, ban, role_history, ban_history, mfa } = { uid: -1, userid: -1, name: "", bio: "", note: "", global_note: "", avatar: "", email: "", discordid: null, steamid: null, truckersmpid: null, roles: [], tracker: availableTrackers.length !== 0 ? availableTrackers[0] : "unknown", ban: null, role_history: null, ban_history: null, mfa: null, ...props.user, ...props };
        roles.sort((a, b) => vars.orderedRoles.indexOf(a) - vars.orderedRoles.indexOf(b));

        setUsers(users => ({ ...users, [uid]: { ...{ uid, userid, discordid, name, bio, note, global_note, avatar, email, steamid, truckersmpid, roles, tracker, ban, role_history, ban_history, mfa }, ...props.user, last_sync: +new Date() } }));
    }
    // use the user in store | check if exist (could be non-existent when uid is NaN)
    const user = users[props.user.uid] !== undefined ? users[props.user.uid] : { ...props.user, ...props };

    const userPerm = useMemo(() => {
        const allPerms = Object.keys(vars.perms);
        let result = [];
        for (let i = 0; i < user.roles.length; i++) {
            for (let j = 0; j < allPerms.length; j++) {
                if (vars.perms[allPerms[j]].includes(user.roles[i]) && !result.includes(allPerms[j])) {
                    result.push(allPerms[j]);
                }
            }
        }
        if (result.includes("administrator")) result = ["administrator"];
        return result;
    }, [user.roles, vars.perms]);

    // user card settings
    let { size, useChip, onDelete, textOnly, style, showProfileModal, onProfileModalClose } = { size: "20", useChip: false, onDelete: null, textOnly: false, style: {}, showProfileModal: undefined, onProfileModalClose: undefined, ...props };

    // snackbar
    const [snackbarContent, setSnackbarContent] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const handleCloseSnackbar = useCallback((e) => { setSnackbarContent(""); }, []);

    // profile tabs
    const [tab, setTab] = useState(0);
    const handleTabChange = (_, newValue) => { setTab(newValue); };

    // force sync user info
    const updateUserInfo = useCallback(async () => {
        let resp = await axios({ url: `${vars.dhpath}/user/profile?uid=${user.uid}`, method: "GET", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 200) {
            resp.data.roles.sort((a, b) => vars.orderedRoles.indexOf(a) - vars.orderedRoles.indexOf(b));

            setUsers(users => ({ ...users, [uid]: resp.data }));
            // updating info for current user will be automatically handled in setUsers

            setNewProfile({ name: resp.data.name, avatar: resp.data.avatar });
            setNewAboutMe(resp.data.bio);
            setNewNote(resp.data.note);
            setNewGlobalNote(resp.data.global_note);
            setNewRoles(resp.data.roles);
            setNewConnections({ email: resp.data.email, discordid: resp.data.discordid, steamid: resp.data.steamid, truckersmpid: resp.data.truckersmpid });
            setTrackerInUse(resp.data.tracker);
        }
    }, []);

    // update user info across components
    useEffect(() => {
        setNewProfile({ name: user.name, avatar: user.avatar });
        setNewAboutMe(user.bio);
        setNewNote(user.note);
        setNewGlobalNote(user.global_note);
        setNewRoles(user.roles);
        setNewConnections({ email: user.email, discordid: user.discordid, steamid: user.steamid, truckersmpid: user.truckersmpid });
        setTrackerInUse(user.tracker);
    }, [user.name, user.avatar, user.bio, user.note, user.global_note, user.roles, user.email, user.discordid, user.steamid, user.truckersmpid, user.tracker]);

    // context menu
    const [showContextMenu, setShowContextMenu] = useState(false);
    const [showPopover, setShowPopover] = useState(false);
    const [anchorPosition, setAnchorPosition] = useState({ top: 0, left: 0 });
    // right click
    const handleContextMenu = useCallback((e) => {
        if (+new Date() - user.last_sync >= 30000) updateUserInfo(); // sync user data in background
        e.preventDefault();
        if (e.stopPropagation !== undefined) e.stopPropagation();
        setAnchorPosition({ top: e.clientY !== undefined ? e.clientY : e.center.y, left: e.clientX !== undefined ? e.clientX : e.center.x });
        setShowContextMenu(!showContextMenu);
    }, [showContextMenu]);
    // long press
    const userCardRef = useRef(null);
    useLongPress(userCardRef, handleContextMenu, 500);
    // context menu button action
    const [ctxAction, setCtxAction] = useState("");
    const updateCtxAction = useCallback((e, action) => {
        e.preventDefault();
        e.stopPropagation();
        setCtxAction(action);
        setShowContextMenu(false);
        setDialogBtnDisabled(false);
    }, []);
    const [dialogBtnDisabled, setDialogBtnDisabled] = useState(false);

    // brief user profile popover (left click / single press)
    const handleClick = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setAnchorPosition({ top: e.clientY, left: e.clientX });
        setShowPopover(!showPopover);
    }, [showPopover]);

    // user profile data
    function convertDlogList(_dlogList) {
        if (!_dlogList || !_dlogList.list) return null;
        let newDlogList = [];
        for (let i = 0; i < _dlogList.list.length; i++) {
            let divisionCheckmark = <></>;
            if (_dlogList.list[i].division.divisionid !== undefined) {
                divisionCheckmark = <Tooltip placement="top" arrow title={tr("validated_division_delivery")}
                    PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, -10] } }] }}>
                    <VerifiedOutlined sx={{ color: theme.palette.info.main, fontSize: "1.2em" }} />
                </Tooltip>;
            }
            newDlogList.push({
                logid: _dlogList.list[i].logid,
                display_logid: <Typography variant="body2" sx={{ flexGrow: 1, display: 'flex', alignItems: "center" }}><span>{_dlogList.list[i].logid}</span>{divisionCheckmark}</Typography>,
                source: `${_dlogList.list[i].source_company}, ${_dlogList.list[i].source_city}`,
                destination: `${_dlogList.list[i].destination_company}, ${_dlogList.list[i].destination_city}`,
                distance: ConvertUnit(userSettings.unit, "km", _dlogList.list[i].distance),
                cargo: `${_dlogList.list[i].cargo} (${ConvertUnit(userSettings.unit, "kg", _dlogList.list[i].cargo_mass)})`,
                profit: `${CURRENTY_ICON[_dlogList.list[i].unit]}${_dlogList.list[i].profit}`,
                time: <TimeAgo key={`${+new Date()}`} timestamp={_dlogList.list[i].timestamp * 1000} />
            });
        }
        return newDlogList;
    }
    const cachedUserProfile = userProfiles[user.uid];
    const [tmpLastOnline, setTmpLastOnline] = useState(cachedUserProfile ? cachedUserProfile.tmpLastOnline : null);
    const [chartStats, setChartStats] = useState(cachedUserProfile ? cachedUserProfile.chartStats : null);
    const [overallStats, setOverallStats] = useState(cachedUserProfile ? cachedUserProfile.overallStats : null);
    const [detailStats, setDetailStats] = useState(cachedUserProfile ? cachedUserProfile.detailStats : null);
    const [pointStats, setPointStats] = useState(cachedUserProfile ? cachedUserProfile.pointStats : null);
    const [dlogList, setDlogList] = useState(cachedUserProfile ? convertDlogList(cachedUserProfile.dlogList) : null);
    const [dlogTotalItems, setDlogTotalItems] = useState(cachedUserProfile ? cachedUserProfile.dlogTotalItems : 0);
    const [dlogPage, setDlogPage] = useState(cachedUserProfile ? cachedUserProfile.dlogPage : 1);
    const dlogPageRef = useRef(cachedUserProfile ? cachedUserProfile.dlogPage : 1);
    useEffect(() => { dlogPageRef.current = dlogPage; }, [dlogPage]); // maintain correct dlog page when user switch page fast
    const [dlogPageSize, setDlogPageSize] = useState(cachedUserProfile ? cachedUserProfile.dlogPageSize : userSettings.default_row_per_page);
    useEffect(() => {
        async function loadProfile() {
            window.loading += 1;

            const [_tmp, _chart, _overall, _details, _point, _dlogList] = await makeRequestsAuto([
                { url: `https://config.chub.page/truckersmp?mpid=${user.truckersmpid}`, auth: false },
                { url: `${vars.dhpath}/dlog/statistics/chart?userid=${user.userid}&ranges=7&interval=86400&sum_up=false&before=` + getTodayUTC() / 1000, auth: true },
                { url: `${vars.dhpath}/dlog/statistics/summary?userid=${user.userid}`, auth: true },
                { url: `${vars.dhpath}/dlog/statistics/details?userid=${user.userid}`, auth: true },
                { url: `${vars.dhpath}/dlog/leaderboard?userids=${user.userid}`, auth: true },
                { url: `${vars.dhpath}/dlog/list?userid=${user.userid}&page=${dlogPage}&page_size=${dlogPageSize}`, auth: "prefer" },
            ]);

            let userProfile = {};

            if (_tmp.error === undefined && _tmp.last_online !== undefined) {
                setTmpLastOnline(_tmp.last_online);
                userProfile.tmpLastOnline = _tmp.last_online;
            }

            let newCharts = { distance: [], fuel: [], profit_euro: [], profit_dollar: [] };
            for (let i = 0; i < _chart.length; i++) {
                newCharts.distance.push(_chart[i].distance.sum);
                newCharts.fuel.push(_chart[i].fuel.sum);
                newCharts.profit_euro.push(_chart[i].profit.euro);
                newCharts.profit_dollar.push(_chart[i].profit.dollar);
            }
            setChartStats(newCharts);
            userProfile.chartStats = newCharts;

            setOverallStats(_overall);
            userProfile.overallStats = _overall;

            if (_details.truck !== undefined) {
                setDetailStats(_details);
                userProfile.detailStats = _details;
            }
            if (_point.list.length !== 0) {
                setPointStats(_point.list[0].points);
                userProfile.pointStats = _point.list[0].points;
            }

            setUserProfiles(userProfiles => ({ ...userProfiles, [user.uid]: userProfile }));

            window.loading -= 1;
        }

        if ((cachedUserProfile === undefined || cachedUserProfile.expiry < +new Date()) && (ctxAction === "show-profile" || showProfileModal === 2))
            loadProfile();
    }, [cachedUserProfile, ctxAction, showProfileModal]);
    useEffect(() => {
        async function loadDlogList() {
            window.loading += 1;

            const [_dlogList] = await makeRequestsAuto([
                { url: `${vars.dhpath}/dlog/list?userid=${user.userid}&page=${dlogPage}&page_size=${dlogPageSize}`, auth: "prefer" },
            ]);
            if (dlogPageRef.current === dlogPage) {
                setDlogList(convertDlogList(_dlogList));
                setDlogTotalItems(_dlogList.total_items);

                setUserProfiles(userProfiles => ({ ...userProfiles, [user.uid]: { ...userProfiles[user.uid], dlogList: _dlogList, dlogTotalItems: _dlogList.total_items } }));
            }

            window.loading -= 1;
        }

        if (ctxAction === "show-profile" || showProfileModal === 2)
            loadDlogList();
    }, [dlogPage, dlogPageSize, ctxAction, showProfileModal]);

    // local pending updates
    const [newRoles, setNewRoles] = useState(user.roles);
    const [newPoints, setNewPoints] = useState({ distance: 0, bonus: 0 });
    const [newProfile, setNewProfile] = useState({ name: user.name, avatar: user.avatar });
    const [newAboutMe, setNewAboutMe] = useState(user.bio);
    const [newConnections, setNewConnections] = useState({ email: user.email, discordid: user.discordid, steamid: user.steamid, truckersmpid: user.truckersmpid });
    const [newBan, setNewBan] = useState({ expire: +new Date() / 1000 + 86400 * 7, reason: "" });
    const [trackerInUse, setTrackerInUse] = useState(user.tracker === "unknown" && availableTrackers.length > 0 ? availableTrackers[0] : user.tracker);
    const [newNote, setNewNote] = useState(user.note);
    const [newGlobalNote, setNewGlobalNote] = useState(user.global_note);

    // chub team / sponsor perks
    const [specialColor, setSpecialColor] = useState(null);
    const [badges, setBadges] = useState([]);
    const [profileBackground, setProfilebackground] = useState([darkenColor(PROFILE_COLOR[theme.mode].paper, 0.5), darkenColor(PROFILE_COLOR[theme.mode].paper, 0.5)]);
    const [profileBannerURL, setProfileBannerURL] = useState(`${vars.dhpath}/member/banner?userid=${user.userid}`);
    useEffect(() => {
        if (user.discordid === undefined) return;
        let newSpecialColor = null;
        let newBadges = [];
        let badgeNames = [];
        let inCHubTeam = false;
        if (Object.keys(vars.specialRolesMap).includes(user.discordid)) {
            // special color disabled as we are now fully using user-customized settings
            // specialColor = vars.specialRolesMap[user.discordid][0].color;
            for (let i = 0; i < vars.specialRolesMap[user.discordid].length; i++) {
                let sr = vars.specialRolesMap[user.discordid][i];
                let badge = null;
                let badgeName = null;
                if (['lead_developer', 'project_manager', 'community_manager', 'development_team', 'support_leader', 'marketing_leader', 'graphic_leader', 'support_team', 'marketing_team', 'graphic_team'].includes(sr.role)) {
                    badge = <Tooltip key={`badge-${user.uid}-chub}`} placement="top" arrow title={tr("chub_team")}
                        PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, -10] } }] }} >
                        <FontAwesomeIcon icon={faScrewdriverWrench} style={{ color: "#2fc1f7" }} />
                    </Tooltip>;
                    badgeName = "chub";
                    inCHubTeam = true;
                }
                if (['community_legend'].includes(sr.role)) {
                    badge = <Tooltip key={`badge-${user.uid}-legend`} placement="top" arrow title={tr("community_legend")}
                        PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, -10] } }] }}>
                        <FontAwesomeIcon icon={faCrown} style={{ color: "#b2db80" }} />
                    </Tooltip>;
                    badgeName = "legend";
                }
                if (['network_partner'].includes(sr.role)) {
                    badge = <Tooltip key={`badge-${user.uid}-network-partner`} placement="top" arrow title={tr("network_partner")}
                        PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, -10] } }] }}>
                        <FontAwesomeIcon icon={faEarthAmericas} style={{ color: "#5ae9e1" }} />
                    </Tooltip>;
                    badgeName = "legend";
                }
                if (['server_booster', 'translation_team'].includes(sr.role)) {
                    badge = <Tooltip key={`badge-${user.uid}-supporter`} placement="top" arrow title={tr("supporter")}
                        PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, -10] } }] }}>
                        <FontAwesomeIcon icon={faClover} style={{ color: "#f47fff" }} />
                    </Tooltip>;
                    badgeName = "supporter";
                }
                if (badge !== null && !badgeNames.includes(badgeName)) {
                    newBadges.push(badge);
                    badgeNames.push(badgeName);
                }
            }
        }

        let userLevel = 0;
        let tiers = ["platinum", "gold", "silver", "bronze"];
        for (let i = 0; i < tiers.length; i++) {
            if (userLevel !== 0) break;
            for (let j = 0; j < vars.patrons[tiers[i]].length; j++) {
                let patron = vars.patrons[tiers[i]][j];
                if (patron.abbr === vars.dhconfig.abbr && patron.uid === user.uid) {
                    userLevel = 4 - i;

                    let badge = <Tooltip key={`badge-${user.uid}-supporter`} placement="top" arrow title={tr("supporter")}
                        PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, -10] } }] }}>
                        <FontAwesomeIcon icon={faClover} style={{ color: "#f47fff" }} />
                    </Tooltip>;
                    let badgeName = "supporter";
                    if (badge !== null && !badgeNames.includes(badgeName)) {
                        newBadges.push(badge);
                        badgeNames.push(badgeName);
                    }

                    break;
                }
            }
        }
        setBadges(newBadges);
        userLevel = vars.defaultUserLevel; // TODO: Remove after open beta
        if (inCHubTeam) userLevel = 4;

        if (vars.userConfig[user.uid] !== undefined) {
            let uc = vars.userConfig[user.uid];
            if (uc.name_color !== null) {
                newSpecialColor = uc.name_color;
                if (!(vars.vtcLevel >= 1 && vars.dhconfig.name_color !== null && vars.dhconfig.name_color === newSpecialColor)) {
                    // not using vtc name color
                    if (userLevel < 2 || userLevel === 2 && newSpecialColor !== "#c0c0c0" || userLevel === 3 && !["#c0c0c0", "#ffd700"].includes(newSpecialColor)) {
                        newSpecialColor = null;
                    }
                }
            }
            if (userLevel >= 3 && uc.profile_upper_color !== null && uc.profile_lower_color !== null) {
                setProfilebackground([uc.profile_upper_color, uc.profile_lower_color]);
            }
            try {
                new URL(uc.profile_banner_url);
                if (userLevel >= 3) {
                    setProfileBannerURL(uc.profile_banner_url);
                }
            } catch { }
        }
        setSpecialColor(newSpecialColor);
    }, [user.discordid]);
    useEffect(() => {
        if (vars.vtcLevel >= 3 && vars.dhconfig.use_highest_role_color && user.roles !== undefined) {
            for (let i = 0; i < user.roles.length; i++) {
                if (vars.roles[user.roles[i]] !== undefined && vars.roles[user.roles[i]].color !== undefined) {
                    setSpecialColor(vars.roles[user.roles[i]].color);
                    break;
                }
            }
        }
    }, [user.roles]);

    // context menu button operations
    const updateProfile = useCallback(async (sync_to = undefined) => {
        setDialogBtnDisabled(true);
        sync_to === undefined ? sync_to = "" : sync_to = `&sync_to_${sync_to}=true`;
        let resp = await axios({ url: `${vars.dhpath}/user/profile?uid=${user.uid}${sync_to}`, method: "PATCH", data: newProfile, headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            await updateUserInfo(); // this is required as we don't know the user's "synced-to" data
            setSnackbarContent(tr("profile_updated"));
            setSnackbarSeverity("success");
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setDialogBtnDisabled(false);
    }, [newProfile]);

    const updateAboutMe = useCallback(async () => {
        setDialogBtnDisabled(true);
        let resp = await axios({ url: `${vars.dhpath}/user/bio`, method: "PATCH", data: { "bio": newAboutMe }, headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            setUsers(users => ({ ...users, [user.uid]: { ...user, bio: newAboutMe } }));
            setSnackbarContent(tr("about_me_updated"));
            setSnackbarSeverity("success");
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setDialogBtnDisabled(false);
    }, [newAboutMe]);

    const updateNote = useCallback(async () => {
        // this is handled specially as updating it doesn't disable "submit" button
        if (user.note === newNote) { return; }
        let oldNote = user.note;
        setUsers(users => ({ ...users, [user.uid]: { ...user, note: newNote } })); // pre-update locally
        let resp = await axios({ url: `${vars.dhpath}/user/${user.uid}/note`, method: "PATCH", data: { "note": newNote }, headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status !== 204) {
            setUsers(users => ({ ...users, [user.uid]: { ...user, note: oldNote } })); // revert changes
        }
    }, [newNote]);

    const updateGlobalNote = useCallback(async () => {
        setDialogBtnDisabled(true);
        let resp = await axios({ url: `${vars.dhpath}/user/${user.uid}/note/global`, method: "PATCH", data: { note: newGlobalNote }, headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            setUsers(users => ({ ...users, [user.uid]: { ...user, global_note: newGlobalNote } }));
            setSnackbarContent(tr("global_note_updated"));
            setSnackbarSeverity("success");
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setDialogBtnDisabled(false);
    }, [newGlobalNote]);

    const updateRoles = useCallback(async () => {
        setDialogBtnDisabled(true);
        let resp = await axios({ url: `${vars.dhpath}/member/${user.userid}/roles`, method: "PATCH", data: { roles: newRoles.map((role) => (role.id)) }, headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            setUsers(users => ({ ...users, [user.uid]: { ...user, roles: newRoles.map((role) => (role.id)) } }));
            setSnackbarContent(tr("roles_updated"));
            setSnackbarSeverity("success");
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setDialogBtnDisabled(false);
    }, [user.userid, newRoles]);

    const updatePoints = useCallback(async () => {
        // no need to update user info since points are not included in user info
        setDialogBtnDisabled(true);
        let resp = await axios({ url: `${vars.dhpath}/member/${user.userid}/points`, method: "PATCH", data: { distance: newPoints.distance, bonus: newPoints.bonus }, headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            setSnackbarContent(tr("points_updated"));
            setSnackbarSeverity("success");
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setDialogBtnDisabled(false);
    }, [user.userid, newPoints]);

    const switchTracker = useCallback(async () => {
        setDialogBtnDisabled(true);
        let resp = await axios({ url: `${vars.dhpath}/user/tracker/switch?uid=${user.uid}`, data: { tracker: trackerInUse }, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            setUsers(users => ({ ...users, [user.uid]: { ...user, tracker: trackerInUse } }));
            setSnackbarContent(tr("tracker_updated"));
            setSnackbarSeverity("success");
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setDialogBtnDisabled(false);
    }, [trackerInUse]);

    const acceptUser = useCallback(async () => {
        setDialogBtnDisabled(true);
        let resp = await axios({ url: `${vars.dhpath}/user/${user.uid}/accept`, data: { tracker: trackerInUse }, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 200) {
            setUsers(users => ({ ...users, [user.uid]: { ...user, userid: resp.data.userid, roles: [] } }));
            setMemberUIDs(memberUIDs => [...memberUIDs, user.uid]);

            setSnackbarContent(tr("user_accepted_as_member"));
            setSnackbarSeverity("success");
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
            setDialogBtnDisabled(false); // we only enable button if api call failed
        }
    }, [trackerInUse]);

    const updateConnections = useCallback(async (action = "update", connection = "") => {
        setDialogBtnDisabled(true);
        let resp = undefined;
        if (action === "update") {
            let processedNC = removeNUEValues(newConnections);
            resp = await axios({ url: `${vars.dhpath}/user/${user.uid}/connections`, method: "PATCH", data: processedNC, headers: { Authorization: `Bearer ${getAuthToken()}` } });
        } else if (action === "delete") {
            resp = await axios({ url: `${vars.dhpath}/user/${user.uid}/connections/${connection}`, method: "DELETE", headers: { Authorization: `Bearer ${getAuthToken()}` } });
            setNewConnections(newConnections => ({ ...newConnections, [connection]: "" }));
        }
        if (resp.status === 204) {
            if (action === "update") {
                setSnackbarContent(tr("connections_updated"));
                let processedNC = removeNUEValues(newConnections);
                setUsers(users => ({ ...users, [user.uid]: { ...user, ...processedNC } }));
            } else if (action === "delete") {
                setSnackbarContent(tr("connection_deleted"));
                setUsers(users => ({ ...users, [user.uid]: { ...user, [connection]: null } }));
            }
            setSnackbarSeverity("success");
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setDialogBtnDisabled(false);
    }, [newConnections]);

    const [otp, setOtp] = useState("");
    const disableMFA = useCallback(async () => {
        setDialogBtnDisabled(true);
        let resp = await axios({ url: `${vars.dhpath}/user/mfa/disable?uid=${user.uid}`, data: { otp: otp }, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            setUsers(users => ({ ...users, [user.uid]: { ...user, mfa: false } }));
            setSnackbarContent(tr("mfa_disabled"));
            setSnackbarSeverity("success");
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
            setDialogBtnDisabled(false); // we only enable button if api call failed
        }
    }, [otp]);

    const dismissMember = useCallback(async () => {
        setDialogBtnDisabled(true);
        let resp = await axios({ url: `${vars.dhpath}/member/${user.userid}/dismiss`, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            setUsers(users => ({ ...users, [user.uid]: { ...user, userid: null, roles: [] } }));
            setMemberUIDs(memberUIDs => memberUIDs.filter(uid => uid !== user.uid));

            setSnackbarContent(tr("user_dismissed"));
            setSnackbarSeverity("success");
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
            setDialogBtnDisabled(false); // we only enable button if api call failed
        }
    }, [user.userid]);

    const deleteUser = useCallback(async () => {
        setDialogBtnDisabled(true);
        let resp = await axios({ url: `${vars.dhpath}/user/${user.uid}`, method: "DELETE", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            setSnackbarContent(tr("user_deleted"));
            setSnackbarSeverity("success");
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
            setDialogBtnDisabled(false); // we only enable button if api call failed
        }
    }, []);

    const putBan = useCallback(async () => {
        setDialogBtnDisabled(true);
        let meta = { ...removeNUEValues({ uid: user.uid, email: user.email, discordid: user.discordid, steamid: user.steamid, truckersmpid: user.truckersmpid, expire: newBan.expire }), reason: newBan.reason };
        let resp = await axios({ url: `${vars.dhpath}/user/ban`, method: "PUT", data: meta, headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            setUsers(users => ({ ...users, [user.uid]: { ...user, ban: { expire: newBan.expire, reason: newBan.reason } } }));
            updateUserInfo(); // we need to update data to know the ban history (historyid)
            setSnackbarContent(tr("user_banned"));
            setSnackbarSeverity("success");
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
            setDialogBtnDisabled(false);
        }
    }, [user.email, user.discordid, user.steamid, user.truckersmpid, newBan]);

    const deleteBan = useCallback(async () => {
        setDialogBtnDisabled(true);
        let meta = removeNUEValues({ uid: user.uid, email: user.email, discordid: user.discordid, steamid: user.steamid, truckersmpid: user.truckersmpid });
        let resp = await axios({ url: `${vars.dhpath}/user/ban`, method: "DELETE", data: meta, headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            setUsers(users => ({ ...users, [user.uid]: { ...user, ban: null } }));
            updateUserInfo();
            setSnackbarContent(tr("user_unbanned"));
            setSnackbarSeverity("success");
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
            setDialogBtnDisabled(false);
        }
    }, [user.email, user.discordid, user.steamid, user.truckersmpid]);

    const customizeProfileAck = !(localStorage.getItem("ack") === null || !JSON.parse(localStorage.getItem("ack")).includes("customize-profile"));
    const ackCustomizeProfile = useCallback(() => {
        if (curUser.uid === user.uid && (localStorage.getItem("ack") === null || !JSON.parse(localStorage.getItem("ack")).includes("customize-profile"))) {
            if (localStorage.getItem("ack") === null) {
                localStorage.setItem("ack", JSON.stringify(["customize-profile"]));
            } else {
                let ack = JSON.parse(localStorage.getItem("ack"));
                ack.push("customize-profile");
                localStorage.setItem("ack", JSON.stringify(ack));
            }
        }
    }, []);

    useEffect(() => {
        if (window.isElectron) {
            if (showProfileModal === 2 || ctxAction == "show-profile") {
                window.electron.ipcRenderer.send("presence-update", {
                    details: `Viewing Profile`,
                    state: `${user.name}`,
                    largeImageKey: `https://cdn.chub.page/assets/${vars.dhconfig.abbr}/logo.png?${vars.dhconfig.logo_key !== undefined ? vars.dhconfig.logo_key : ""}`,
                    largeImageText: vars.dhconfig.name,
                    smallImageKey: user.avatar,
                    smallImageText: user.name,
                    startTimestamp: new Date(),
                    instance: false,
                    buttons: [
                        { label: 'Visit Drivers Hub', url: `https://${vars.host}${window.location.pathname}` },
                        { label: 'Powered by CHub', url: "https://drivershub.charlws.com/" }
                    ]
                });
            } else {
                window.electron.ipcRenderer.send("presence-revert");
            }
        }
    }, [showProfileModal, ctxAction]);

    let profileModal = <Dialog open={true} onClose={() => {
        ackCustomizeProfile(); setCtxAction(""); updateNote(); if (onProfileModalClose !== undefined) onProfileModalClose(); setTimeout(function () { if (window.history.length == 0) window.history.pushState("", "", "/"); }, 250);
    }} fullWidth >
        <Card sx={{ padding: "5px", backgroundImage: `linear-gradient(${profileBackground[0]}, ${profileBackground[1]})` }}>
            {!userSettings.data_saver && <CardMedia
                ref={bannerRef}
                component="img"
                image={profileBannerURL}
                onError={(event) => {
                    event.target.src = `${vars.dhpath}/member/banner?userid=${user.userid}`;
                }}
                alt=""
                sx={{ borderRadius: "5px 5px 0 0" }}
            />}
            <CardContent sx={{ padding: "10px", backgroundImage: `linear-gradient(${PROFILE_COLOR[theme.mode].paper}A0, ${PROFILE_COLOR[theme.mode].paper}E0)`, borderRadius: "0 0 5px 5px" }}>
                <CardContent sx={{ padding: "10px", backgroundImage: `linear-gradient(${PROFILE_COLOR[theme.mode].paper}E0, ${PROFILE_COLOR[theme.mode].paper}E0)`, borderRadius: "5px" }}>
                    <div>
                        <div style={{ display: "flex", flexDirection: "row" }}>
                            <Typography variant="h6" sx={{ fontWeight: 800, flexGrow: 1, display: 'flex', alignItems: "center" }}>
                                {user.name}
                            </Typography>
                            <Typography variant="h7" sx={{ flexGrow: 1, display: 'flex', alignItems: "center", maxWidth: "fit-content" }}>
                                {badges.map((badge, index) => { return <a key={index} onClick={() => { setCtxAction(""); updateNote(); if (onProfileModalClose !== undefined) onProfileModalClose(); navigate("/badges"); }} style={{ cursor: "pointer" }}>{badge}&nbsp;</a>; })}
                                {user.userid !== null && user.userid !== undefined && user.userid >= 0 && <Tooltip placement="top" arrow title={tr("user_id")}
                                    PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, -10] } }] }}><Typography variant="body2"><FontAwesomeIcon icon={faHashtag} />{user.userid}</Typography></Tooltip>}
                                {showProfileModal !== 2 && ((user.uid === curUser.uid || (user.uid !== -1 && checkUserPerm(curUserPerm, ["administrator", "manage_profiles"])))) && <>&nbsp;<IconButton size="small" aria-label={tr("edit")} onClick={(e) => { updateCtxAction(e, "update-profile"); }}><FontAwesomeIcon icon={faPencil} /></IconButton ></>}
                            </Typography>
                        </div>
                        {user.uid === curUser.uid && !customizeProfileAck && vars.userConfig[curUser.uid] === undefined && <Typography variant="body2" sx={{ color: theme.palette.info.main }}><a style={{ cursor: "pointer" }} onClick={() => { navigate("/settings/appearance"); }}>{tr("customize_your_profile_in_settings")}</a></Typography>}
                        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: "10px" }}>
                            <Tabs value={tab} onChange={handleTabChange} aria-label="profile tabs" TabIndicatorProps={{ style: { backgroundColor: theme.palette.info.main } }}>
                                <Tab label={tr("user_info")} {...tabBtnProps(0, tab, theme)} />
                                <Tab label={tr("statistics")} {...tabBtnProps(1, tab, theme)} />
                                <Tab label={tr("deliveries")} {...tabBtnProps(2, tab, theme)} />
                            </Tabs>
                        </Box>
                    </div>
                    <SimpleBar style={{ height: `calc(100vh - 310px - ${(bannerRef.current !== null && bannerRef.current.height !== 0 ? bannerRef.current.height : 104.117)}px)` }}>
                        <TabPanel value={tab} index={0}>
                            {user.bio !== "" && <>
                                <Typography variant="body2" sx={{ fontWeight: 800 }}>
                                    {tr("about_me").toUpperCase()}
                                </Typography>
                                <Typography variant="body2">
                                    <MarkdownRenderer>{user.bio}</MarkdownRenderer>
                                </Typography>
                            </>}
                            <Grid container sx={{ mt: "10px" }}>
                                <Grid item xs={6}>
                                    <Typography variant="body2" sx={{ fontWeight: 800 }}>
                                        {user.userid !== null && user.userid !== -1 ? `MEMBER` : `USER`} {tr("since").toUpperCase()}
                                    </Typography>
                                    {users[user.uid] !== undefined && <Typography variant="body2" sx={{ display: "inline-block" }}>
                                        {getFormattedDate(userSettings.display_timezone, new Date(users[user.uid].join_timestamp * 1000)).split(" at ")[0]}
                                    </Typography>}
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" sx={{ fontWeight: 800 }}>
                                        {tr("tracker").toUpperCase()}
                                    </Typography>
                                    <Typography variant="body2">
                                        {trackerMapping[trackerInUse]}
                                    </Typography>
                                </Grid>
                            </Grid>
                            {user.roles !== null && user.roles !== undefined && user.roles.length !== 0 && <Box sx={{ mt: "10px" }}>
                                <Typography variant="body2" sx={{ fontWeight: 800 }}>
                                    {user.roles.length > 1 ? `ROLES` : `ROLE`}
                                    <Tooltip placement="top" arrow title={`${tr("permissions")}: ${userPerm.map((perm) => perm.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')).join(", ")}`}
                                        PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, -10] } }] }}><FontAwesomeIcon icon={faInfoCircle} style={{ marginLeft: "3px" }} />
                                    </Tooltip>
                                </Typography>
                                {user.roles.map((role) => (
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
                                    {tr("note").toUpperCase()}
                                </Typography>
                                <TextField
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                    fullWidth multiline
                                    size="small"
                                />
                            </Box>
                            <Divider />
                            <Box sx={{ mt: "10px" }}>
                                <Grid container spacing={2}>
                                    {user.email !== undefined && user.email !== null && <Grid item xs={12} sm={12} md={6} lg={6}>
                                        <a href={`mailto:${user.email}`} target="_blank" rel="noreferrer"><Chip
                                            avatar={<Tooltip placement="top" arrow title={tr("email")}
                                                PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, -10] } }] }}><FontAwesomeIcon icon={faAt} /></Tooltip>}
                                            label={user.email}
                                            sx={{
                                                borderRadius: "5px",
                                                margin: "3px",
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'flex-start',
                                                border: '1px solid ' + theme.palette.grey[500],
                                                backgroundColor: 'transparent',
                                                width: "auto",
                                                padding: "10px",
                                                height: "105%",
                                                cursor: "pointer"
                                            }}
                                        /></a>
                                    </Grid>}
                                    {user.discordid !== undefined && user.discordid !== null && <Grid item xs={12} sm={12} md={6} lg={6}>
                                        <a href={`https://discord.com/users/${user.discordid}`} target="_blank" rel="noreferrer"><Chip
                                            avatar={<Tooltip placement="top" arrow title="Discord"
                                                PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, -10] } }] }}><FontAwesomeIcon icon={faDiscord} /></Tooltip>}
                                            label={user.discordid}
                                            sx={{
                                                borderRadius: "5px",
                                                margin: "3px",
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'flex-start',
                                                border: '1px solid ' + theme.palette.grey[500],
                                                backgroundColor: 'transparent',
                                                width: "auto",
                                                padding: "10px",
                                                height: "105%",
                                                cursor: "pointer"
                                            }}
                                        /></a>
                                    </Grid>}
                                    {user.steamid !== undefined && user.steamid !== null && <Grid item xs={12} sm={12} md={6} lg={6}>
                                        <a href={`https://steamcommunity.com/profiles/${user.steamid}`} target="_blank" rel="noreferrer"><Chip
                                            avatar={<Tooltip placement="top" arrow title="Steam"
                                                PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, -10] } }] }}><FontAwesomeIcon icon={faSteam} /></Tooltip>}
                                            label={user.steamid}
                                            sx={{
                                                borderRadius: "5px",
                                                margin: "3px",
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'flex-start',
                                                border: '1px solid ' + theme.palette.grey[500],
                                                backgroundColor: 'transparent',
                                                width: "auto",
                                                padding: "10px",
                                                height: "105%",
                                                cursor: "pointer"
                                            }}
                                        /></a>
                                    </Grid>}
                                    {user.truckersmpid !== undefined && user.truckersmpid !== null && <Grid item xs={12} sm={12} md={6} lg={6}>
                                        <a href={`https://truckersmp.com/user/${user.truckersmpid}`} target="_blank" rel="noreferrer"><Chip
                                            avatar={<Tooltip placement="top" arrow title="TruckersMP"
                                                PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, -10] } }] }}><img src="data:image/webp;base64,UklGRugCAABXRUJQVlA4TNwCAAAvH8AHEK/CMADQJIDd/f9XXtG6zQJ5g5UkSaZ6Fs/m6d7x36+tGYdtJClSbx/zPeWf1WfB/wvSDTittm1Znt8VJzvJvXliABpTMAwD0J1GdEkOAxDdXQMAAPAnIpDCn38xAEACwCh8rewUqmCXX+/KrgNAVHGDOh52b6q6J/lxDborLlOBZtX1+z1kxpg08Iizm8v5YzFaikk8QF66zAFYmO/vZJFdsDfeyX/AvWn5yaH+2c4miHpe5LXzl12uB9gV/Nohq8BKgnkj7BehcDAdP/mNEFYwCXF9EVU3o4sv6Nrzd6hun8Y9cezrq0yXPRL1sd8NAtPaUKCMwh6haeqh05pir6+RYlqsacjlL7raXJ7MCd82m1h1IXJZIU2np+t86LQpT/GehuOVFPux24tA6Pimzoz9PQAIsm2nbb6sMJNSxjDJDGFmpv2vxRQ5O4joPwO3bRtJ3bfvfJ+AZyVPrpCnqnNb9rlRJPP1/8TIn/kpN6jseRR5KTRFWaTUYw28lEVJoJTyvLeaKYi0nG+IlPcCgdBbQym/hJJVyRMEAp986zMC4MJD/ZYbL1nIumHW4KfcSAEh3nlp8W/2IcQTJAuxilIIAIFHDSsDP3LzFbIAj5qH+QiGU1WlErb7YCCScr9350rAykClSeVCPPP69VMs/FV4h2CNspGUnQFJEqnQrDZbVFSq738idQCRc3fzpyiKLEuU8qIkOj64LLmaWA8bBaH09/v7V7EH1HG7lFIXe854L9yHuqYZ84+aQpnCspP7bWNky2n3kiJKDCGdW6icNjmZTlQOb0rNOkNIjDDS09vuoLu+aQjPF3OGgQHCanrcux1ug8kBYcQ0pmPUvfRuOtJu3YOBMMfSAm/Hqy7CyNhN1ggzDRtYjfd3hoV+6KdU9hT2vVF0OjparGbj8NDosAQSDEGkt7pNjrteFAJ+lz6XhAAQuA6Hs1HvCsTrb0rAt1/uHYFlSgA=" /></Tooltip>}
                                            label={<>{tmpLastOnline === null ? user.truckersmpid : <Tooltip placement="top" arrow
                                                title={<><>{tr("last_seen")}</>: <TimeAgo key={`${+new Date()}`} timestamp={tmpLastOnline * 1000} /></>}
                                                PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, -10] } }] }}>
                                                {user.truckersmpid}
                                            </Tooltip>}</>}
                                            sx={{
                                                borderRadius: "5px",
                                                margin: "3px",
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'flex-start',
                                                border: '1px solid ' + theme.palette.grey[500],
                                                backgroundColor: 'transparent',
                                                width: "auto",
                                                padding: "10px",
                                                height: "105%",
                                                cursor: "pointer"
                                            }}
                                        /></a>
                                    </Grid>}
                                </Grid>
                            </Box>
                        </TabPanel>
                        <TabPanel value={tab} index={1}>
                            {chartStats !== null && <Grid container spacing={2}>
                                <Grid item xs={12} sm={12} md={6} lg={6}>
                                    <StatCard icon={<RouteRounded />} title={tr("distance")} inputs={chartStats.distance} size="small" height="75px" />
                                </Grid>
                                <Grid item xs={12} sm={12} md={6} lg={6}>
                                    <StatCard icon={<LocalGasStationRounded />} title={tr("fuel")} inputs={chartStats.fuel} size="small" height="75px" />
                                </Grid>
                                <Grid item xs={12} sm={12} md={6} lg={6}>
                                    <StatCard icon={<EuroRounded />} title={tr("profit_ets2")} inputs={chartStats.profit_euro} size="small" height="75px" />
                                </Grid>
                                <Grid item xs={12} sm={12} md={6} lg={6}>
                                    <StatCard icon={<AttachMoneyRounded />} title={tr("profit_ats")} inputs={chartStats.profit_dollar} size="small" height="75px" />
                                </Grid>
                            </Grid>}
                            {overallStats !== null && <Grid container spacing={2} sx={{ mt: "5px" }}>
                                <Grid item xs={4} sm={4} md={4} lg={4}>
                                    <Typography variant="body2" sx={{ fontWeight: 800 }}>{tr("total_jobs_submitted")}</Typography>
                                    <Typography variant="body2">{TSep(overallStats.job.all.sum.tot)}</Typography>
                                </Grid>
                                <Grid item xs={4} sm={4} md={4} lg={4}>
                                    <Typography variant="body2" sx={{ fontWeight: 800 }}>{tr("ets2")}</Typography>
                                    <Typography variant="body2">{TSep(overallStats.job.all.ets2.tot)}</Typography>
                                </Grid>
                                <Grid item xs={4} sm={4} md={4} lg={4}>
                                    <Typography variant="body2" sx={{ fontWeight: 800 }}>{tr("ats")}</Typography>
                                    <Typography variant="body2">{TSep(overallStats.job.all.ats.tot)}</Typography>
                                </Grid>
                                <Grid item xs={4} sm={4} md={4} lg={4}></Grid>
                                <Grid item xs={4} sm={4} md={4} lg={4}>
                                    <Typography variant="body2" sx={{ fontWeight: 800 }}>{tr("delivered")}</Typography>
                                    <Typography variant="body2">{TSep(overallStats.job.delivered.sum.tot)}</Typography>
                                </Grid>
                                <Grid item xs={4} sm={4} md={4} lg={4}>
                                    <Typography variant="body2" sx={{ fontWeight: 800 }}>{tr("cancelled")}</Typography>
                                    <Typography variant="body2">{TSep(overallStats.job.cancelled.sum.tot)}</Typography>
                                </Grid>
                                <Grid item xs={4} sm={4} md={4} lg={4}>
                                    <Typography variant="body2" sx={{ fontWeight: 800 }}>{tr("total_distance_driven")}</Typography>
                                    <Typography variant="body2">{ConvertUnit(userSettings.unit, "km", overallStats.distance.all.sum.tot)}</Typography>
                                </Grid>
                                <Grid item xs={4} sm={4} md={4} lg={4}>
                                    <Typography variant="body2" sx={{ fontWeight: 800 }}>{tr("ets2")}</Typography>
                                    <Typography variant="body2">{ConvertUnit(userSettings.unit, "km", overallStats.distance.all.ets2.tot)}</Typography>
                                </Grid>
                                <Grid item xs={4} sm={4} md={4} lg={4}>
                                    <Typography variant="body2" sx={{ fontWeight: 800 }}>{tr("ats")}</Typography>
                                    <Typography variant="body2">{ConvertUnit(userSettings.unit, "km", overallStats.distance.all.ats.tot)}</Typography>
                                </Grid>
                                <Grid item xs={4} sm={4} md={4} lg={4}>
                                    <Typography variant="body2" sx={{ fontWeight: 800 }}>{tr("total_fuel_consumed")}</Typography>
                                    <Typography variant="body2">{ConvertUnit(userSettings.unit, "l", overallStats.fuel.all.sum.tot)}</Typography>
                                </Grid>
                                <Grid item xs={4} sm={4} md={4} lg={4}>
                                    <Typography variant="body2" sx={{ fontWeight: 800 }}>{tr("ets2")}</Typography>
                                    <Typography variant="body2">{ConvertUnit(userSettings.unit, "l", overallStats.fuel.all.ets2.tot)}</Typography>
                                </Grid>
                                <Grid item xs={4} sm={4} md={4} lg={4}>
                                    <Typography variant="body2" sx={{ fontWeight: 800 }}>{tr("ats")}</Typography>
                                    <Typography variant="body2">{ConvertUnit(userSettings.unit, "l", overallStats.distance.all.ats.tot)}</Typography>
                                </Grid>
                                <Grid item xs={6} sm={6} md={6} lg={6}>
                                    <Typography variant="body2" sx={{ fontWeight: 800 }}>{tr("ets2_profit")}</Typography>
                                    <Typography variant="body2">{"€" + TSep(overallStats.profit.all.tot.euro)}</Typography>
                                </Grid>
                                <Grid item xs={6} sm={6} md={6} lg={6}>
                                    <Typography variant="body2" sx={{ fontWeight: 800 }}>{tr("ats_profit")}</Typography>
                                    <Typography variant="body2">{"$" + TSep(overallStats.profit.all.tot.dollar)}</Typography>
                                </Grid>
                                {detailStats !== null && detailStats.truck.length >= 1 && detailStats.cargo.length >= 1 && <>
                                    <Grid item xs={6} sm={6} md={6} lg={6}>
                                        <Typography variant="body2" sx={{ fontWeight: 800 }}>{tr("most_driven_truck")}</Typography>
                                        <Typography variant="body2">{detailStats.truck[0].name} ({detailStats.truck[0].count} <>{tr("times")}</>)</Typography>
                                    </Grid>
                                    <Grid item xs={6} sm={6} md={6} lg={6}>
                                        <Typography variant="body2" sx={{ fontWeight: 800 }}>{tr("most_delivered_cargo")}</Typography>
                                        <Typography variant="body2">{detailStats.cargo[0].name} ({detailStats.cargo[0].count} <>{tr("times")}</>)</Typography>
                                    </Grid>
                                </>}
                            </Grid>}
                            {pointStats !== null && <Divider sx={{ mt: "12px", mb: "12px" }} />}
                            {pointStats !== null && <Grid container spacing={2}>
                                <Grid item xs={4} sm={4} md={4} lg={4}>
                                    <Typography variant="body2" sx={{ fontWeight: 800 }}>{tr("total_points")}</Typography>
                                    <Typography variant="body2">{TSep(pointStats.total)}</Typography>
                                </Grid>
                                <Grid item xs={4} sm={4} md={4} lg={4}>
                                    <Typography variant="body2" sx={{ fontWeight: 800 }}>{tr("distance")}</Typography>
                                    <Typography variant="body2">{TSep(pointStats.distance)}</Typography>
                                </Grid>
                                <Grid item xs={4} sm={4} md={4} lg={4}>
                                    <Typography variant="body2" sx={{ fontWeight: 800 }}>{tr("challenge")}</Typography>
                                    <Typography variant="body2">{TSep(pointStats.challenge)}</Typography>
                                </Grid>
                                <Grid item xs={4} sm={4} md={4} lg={4}>
                                    <Typography variant="body2" sx={{ fontWeight: 800 }}>{tr("bonus")}</Typography>
                                    <Typography variant="body2">{TSep(pointStats.bonus)}</Typography>
                                </Grid>
                                <Grid item xs={4} sm={4} md={4} lg={4}>
                                    <Typography variant="body2" sx={{ fontWeight: 800 }}>{tr("event")}</Typography>
                                    <Typography variant="body2">{TSep(pointStats.event)}</Typography>
                                </Grid>
                                <Grid item xs={4} sm={4} md={4} lg={4}>
                                    <Typography variant="body2" sx={{ fontWeight: 800 }}>{tr("division")}</Typography>
                                    <Typography variant="body2">{TSep(pointStats.division)}</Typography>
                                </Grid>
                            </Grid>}
                        </TabPanel>
                        <TabPanel value={tab} index={2}>
                            {dlogList !== null &&
                                <CustomTable columns={[
                                    { id: 'display_logid', label: 'ID' },
                                    { id: 'cargo', label: tr("cargo") },
                                    { id: 'distance', label: tr("distance") },
                                    { id: 'profit', label: tr("profit") },
                                ]} data={dlogList} totalItems={dlogTotalItems} rowsPerPageOptions={[10, 25, 50, 100, 250]} defaultRowsPerPage={dlogPageSize} onPageChange={setDlogPage} onRowsPerPageChange={setDlogPageSize} onRowClick={(data) => { navigate(`/delivery/${data.logid}`); }} />}
                        </TabPanel>
                    </SimpleBar>
                </CardContent>
            </CardContent>
        </Card>
    </Dialog>;

    if (showProfileModal === 2) return <>{profileModal}</>;
    else if (showProfileModal === 1) return <></>;

    if (user.uid === null) return <><Avatar src={!userSettings.data_saver ? user.avatar : ""}
        style={{
            width: `${size}px`,
            height: `${size}px`,
            verticalAlign: "middle",
            display: "inline-flex"
        }}
    /><span key={`user-${Math.random()}`} style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</span></>;

    let content = <>
        {!useChip && <>
            {!textOnly && <><Avatar src={!userSettings.data_saver ? user.avatar : ""}
                style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    verticalAlign: "middle",
                    display: "inline-flex"
                }}
                onClick={handleClick}
                onContextMenu={handleContextMenu}
                ref={userCardRef}
            />
                &nbsp;</>}
            {user.uid !== null && <>
                {specialColor === null && <span key={`user-${user.uid}-${Math.random()}`} className="hover-underline" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", cursor: "pointer" }} onClick={handleClick} onContextMenu={handleContextMenu} ref={userCardRef}>{user.name}</span>}
                {specialColor !== null && <span key={`user-${user.uid}-${Math.random()}`} className="hover-underline" style={{ color: specialColor, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", cursor: "pointer" }} onClick={handleClick} onContextMenu={handleContextMenu} ref={userCardRef}>{user.name}</span>}
            </>}
        </>}
        {useChip && <>
            <Chip
                key={`user-${user.uid}-${Math.random()}`}
                avatar={textOnly ? undefined : <Avatar alt="" src={!userSettings.data_saver ? user.avatar : ""} />}
                label={user.name}
                variant="outlined"
                sx={{ margin: "3px", cursor: "pointer", ...specialColor !== null ? { color: specialColor } : {}, ...style }}
                onDelete={onDelete} onClick={handleClick} onContextMenu={handleContextMenu} ref={userCardRef}
            />
        </>}
        {showContextMenu && <Menu
            anchorReference="anchorPosition"
            anchorPosition={anchorPosition}
            open={showContextMenu}
            onClose={(e) => { e.preventDefault(); e.stopPropagation(); setShowContextMenu(false); }}
        >
            {user.userid !== null && user.userid >= 0 && <MenuItem onClick={(e) => { updateCtxAction(e, "show-profile"); }}><ListItemIcon><FontAwesomeIcon icon={faAddressCard} /></ListItemIcon>{tr("profile")}</MenuItem>}
            {(user.userid === null || user.userid < 0) && <MenuItem onClick={(e) => { updateCtxAction(e, "update-profile"); }}><ListItemIcon><FontAwesomeIcon icon={faAddressCard} /></ListItemIcon>{tr("update_profile")}</MenuItem>}
            {(user.uid === curUser.uid || (user.uid !== -1 && checkUserPerm(curUserPerm, ["administrator", "manage_profiles"]))) && <Divider />}
            {user.uid === curUser.uid && <MenuItem onClick={(e) => { updateCtxAction(e, "update-about-me"); }}><ListItemIcon><FontAwesomeIcon icon={faComment} /></ListItemIcon>{tr("update_about_me")}</MenuItem>}
            {(user.uid === curUser.uid || (user.uid !== -1 && checkUserPerm(curUserPerm, ["administrator", "manage_profiles"]))) && <MenuItem onClick={(e) => { updateCtxAction(e, "switch-tracker"); }}><ListItemIcon><FontAwesomeIcon icon={faTruck} /></ListItemIcon>{tr("switch_tracker")}</MenuItem>}
            <Divider />
            {checkUserPerm(curUserPerm, ["administrator", "update_global_note"]) && <MenuItem onClick={(e) => { updateCtxAction(e, "update-global-note"); }}><ListItemIcon><FontAwesomeIcon icon={faNoteSticky} /></ListItemIcon>{tr("update_global_note")}</MenuItem>}
            {user.userid !== null && user.userid >= 0 && checkUserPerm(curUserPerm, ["administrator", "manage_divisions", "update_roles"]) && <MenuItem onClick={(e) => { updateCtxAction(e, "update-roles"); }}><ListItemIcon><FontAwesomeIcon icon={faPeopleGroup} /></ListItemIcon>{tr("update_roles")}</MenuItem>}
            {user.userid !== null && user.userid >= 0 && checkUserPerm(curUserPerm, ["administrator", "update_points"]) && <MenuItem onClick={(e) => { updateCtxAction(e, "update-points"); }}><ListItemIcon><FontAwesomeIcon icon={faTrophy} /></ListItemIcon>{tr("update_points")}</MenuItem>}
            <MenuItem onClick={(e) => { updateUserInfo(); updateCtxAction(e, "role-ban-history"); }}><ListItemIcon><FontAwesomeIcon icon={faBarsStaggered} /></ListItemIcon>{tr("roleban_history")}</MenuItem>
            {((user.userid === null || user.userid < 0) && user.ban === null && checkUserPerm(curUserPerm, ["administrator", "accept_members"]) || checkUserPerm(curUserPerm, ["administrator", "update_connections"]) || checkUserPerm(curUserPerm, ["administrator", "disable_mfa"])) && <Divider />}
            {(user.userid === null || user.userid < 0) && user.ban === null && checkUserPerm(curUserPerm, ["administrator", "accept_members"]) && <MenuItem sx={{ color: theme.palette.success.main }} onClick={(e) => { updateCtxAction(e, "accept-user"); }}><ListItemIcon><FontAwesomeIcon icon={faUserCheck} /></ListItemIcon>{tr("accept_as_member")}</MenuItem>}
            {checkUserPerm(curUserPerm, ["administrator", "update_connections"]) && <MenuItem sx={{ color: theme.palette.warning.main }} onClick={(e) => { updateCtxAction(e, "update-connections"); }}><ListItemIcon><FontAwesomeIcon icon={faLink} /></ListItemIcon>{tr("update_connections")}</MenuItem>}
            {checkUserPerm(curUserPerm, ["administrator", "disable_mfa"]) && <MenuItem sx={{ color: theme.palette.warning.main }} onClick={(e) => { updateCtxAction(e, "disable-mfa"); }}><ListItemIcon><FontAwesomeIcon icon={faUnlockKeyhole} /></ListItemIcon>{tr("disable_mfa")}</MenuItem>}
            {((user.userid === null || user.userid < 0) && user.ban === null && checkUserPerm(curUserPerm, ["administrator", "ban_users"]) || user.userid !== null && user.userid >= 0 && checkUserPerm(curUserPerm, ["administrator", "dismiss_members"]) || checkUserPerm(curUserPerm, ["administrator", "delete_users"])) && <Divider />}
            {(user.userid === null || user.userid < 0) && user.ban === null && checkUserPerm(curUserPerm, ["administrator", "ban_users"]) && <MenuItem sx={{ color: theme.palette.error.main }} onClick={(e) => { updateCtxAction(e, "ban-user"); }}><ListItemIcon><FontAwesomeIcon icon={faBan} /></ListItemIcon>{tr("ban")}</MenuItem>}
            {(user.userid === null || user.userid < 0) && user.ban !== null && checkUserPerm(curUserPerm, ["administrator", "ban_users"]) && <MenuItem sx={{ color: theme.palette.error.main }} onClick={(e) => { updateCtxAction(e, "unban-user"); }}><ListItemIcon><FontAwesomeIcon icon={faCircleCheck} /></ListItemIcon>{tr("unban")}</MenuItem>}
            {user.userid !== null && user.userid >= 0 && checkUserPerm(curUserPerm, ["administrator", "dismiss_members"]) && <MenuItem sx={{ color: theme.palette.error.main }} onClick={(e) => { updateCtxAction(e, "dismiss-member"); }}><ListItemIcon><FontAwesomeIcon icon={faUserSlash} /></ListItemIcon>{tr("dismiss_member")}</MenuItem>}
            {checkUserPerm(curUserPerm, ["administrator", "delete_users"]) && <MenuItem sx={{ color: theme.palette.error.main }} onClick={(e) => { updateCtxAction(e, "delete-user"); }}><ListItemIcon><FontAwesomeIcon icon={faTrashCan} /></ListItemIcon>{tr("delete_user")}</MenuItem>}
        </Menu>}
        <div style={{ display: "inline-block" }} onClick={(e) => { e.stopPropagation(); }}>
            {ctxAction === "update-profile" &&
                <Dialog open={true} onClose={() => { setCtxAction(""); }} fullWidth  >
                    <DialogTitle>{tr("update_profile")}<>|</>{user.name} ({user.userid !== null ? tr("user_id") + ": " + user.userid + " / " : ""}<>UID</>: {user.uid})</DialogTitle>
                    <DialogContent>
                        <Typography variant="body2">{tr("custom_profile_may_be_set")}</Typography>
                        <Typography variant="body2">{tr("alternatively_sync_to_discord_steam")}</Typography>
                        <Grid container spacing={2} sx={{ mt: "5px" }}>
                            <Grid item xs={12}>
                                <TextField
                                    label={tr("name")}
                                    value={newProfile.name}
                                    onChange={(e) => setNewProfile({ ...newProfile, name: e.target.value })}
                                    fullWidth disabled={dialogBtnDisabled}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label={tr("avatar_url")}
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
                                <Button variant="contained" color="secondary">{tr("sync_to")}</Button>
                                <Button variant="contained" color="success" onClick={() => { updateProfile("discord"); }} disabled={dialogBtnDisabled}>Discord</Button>
                                <Button variant="contained" color="warning" onClick={() => { updateProfile("steam"); }} disabled={dialogBtnDisabled}>Steam</Button>
                                <Button variant="contained" color="error" onClick={() => { updateProfile("truckersmp"); }} disabled={dialogBtnDisabled}>TruckersMP</Button>
                            </ButtonGroup>
                        </Box>
                        <Box sx={{ display: 'grid', justifyItems: 'end' }}>
                            <ButtonGroup>
                                <Button variant="primary" onClick={() => { setCtxAction(""); }}>{tr("close")}</Button>
                                <Button variant="contained" onClick={() => { updateProfile(); }} disabled={dialogBtnDisabled}>{tr("save")}</Button>
                            </ButtonGroup>
                        </Box>
                    </DialogActions>
                </Dialog>
            }
            {ctxAction === "update-about-me" &&
                <Dialog open={true} onClose={() => { setCtxAction(""); }} fullWidth  >
                    <DialogTitle>{tr("update_about_me")}<>|</>{user.name} ({user.userid !== null ? tr("user_id") + ": " + user.userid + " / " : ""}<>UID</>: {user.uid})</DialogTitle>
                    <DialogContent>
                        <TextField
                            label={tr("about_me")}
                            value={newAboutMe}
                            onChange={(e) => setNewAboutMe(e.target.value)}
                            fullWidth disabled={dialogBtnDisabled}
                            sx={{ mt: "5px" }}
                        />
                    </DialogContent>
                    <DialogActions >
                        <ButtonGroup>
                            <Button variant="primary" onClick={() => { setCtxAction(""); }}>{tr("close")}</Button>
                            <Button variant="contained" onClick={() => { updateAboutMe(); }} disabled={dialogBtnDisabled}>{tr("save")}</Button>
                        </ButtonGroup>
                    </DialogActions>
                </Dialog>
            }
            {ctxAction === "update-roles" &&
                <Dialog open={true} onClose={() => { setCtxAction(""); }} fullWidth >
                    <DialogTitle>{tr("update_roles")}<>|</>{user.name} (<>{tr("user_id")}</>: {user.userid})</DialogTitle>
                    <DialogContent>
                        <RoleSelect initialRoles={user.roles} onUpdate={setNewRoles} />
                    </DialogContent>
                    <DialogActions>
                        <Button variant="primary" onClick={() => { setCtxAction(""); }}>{tr("close")}</Button>
                        <Button variant="contained" onClick={() => { updateRoles(); }} disabled={dialogBtnDisabled}>{tr("save")}</Button>
                    </DialogActions>
                </Dialog>
            }
            {ctxAction === "update-global-note" &&
                <Dialog open={true} onClose={() => { setCtxAction(""); }} fullWidth >
                    <DialogTitle>{tr("update_global_note")}<>|</>{user.name} (<>{tr("user_id")}</>: {user.userid})</DialogTitle>
                    <DialogContent>
                        <Typography variant="body2">{tr("global_note_works_like_your")}</Typography>
                        <TextField
                            label={tr("global_note")}
                            value={newGlobalNote}
                            onChange={(e) => setNewGlobalNote(e.target.value)}
                            fullWidth
                            sx={{ mt: "15px" }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button variant="primary" onClick={() => { setCtxAction(""); }}>{tr("close")}</Button>
                        <Button variant="contained" onClick={() => { updateGlobalNote(); }} disabled={dialogBtnDisabled}>{tr("save")}</Button>
                    </DialogActions>
                </Dialog>
            }
            {ctxAction === "update-points" &&
                <Dialog open={true} onClose={() => { setCtxAction(""); }} fullWidth  >
                    <DialogTitle>{tr("update_points")}<>|</>{user.name} (<>{tr("user_id")}</>: {user.userid})</DialogTitle>
                    <DialogContent>
                        <Typography variant="body2">{tr("distance_should_be_given_when")}</Typography>
                        <Typography variant="body2">{tr("bonus_points_could_be_given")}</Typography>
                        <Typography variant="body2">{tr("use_negative_number_to_remove")}</Typography>
                        <Grid container spacing={2} sx={{ mt: "5px" }}>
                            <Grid item xs={12}>
                                <TextField
                                    label={tr("distance_km")}
                                    value={newPoints.distance}
                                    onChange={(e) => setNewPoints({ ...newPoints, distance: e.target.value })}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label={tr("bonus_points")}
                                    value={newPoints.bonus}
                                    onChange={(e) => setNewPoints({ ...newPoints, bonus: e.target.value })}
                                    fullWidth
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="primary" onClick={() => { setCtxAction(""); }}>{tr("close")}</Button>
                        <Button variant="contained" onClick={() => { updatePoints(); }} disabled={dialogBtnDisabled}>{tr("update")}</Button>
                    </DialogActions>
                </Dialog>
            }
            {ctxAction === "switch-tracker" &&
                <Dialog open={true} onClose={() => { setCtxAction(""); }} fullWidth >
                    <DialogTitle>{tr("switch_tracker")}<>|</>{user.name} ({user.userid !== null ? tr("user_id") + ": " + user.userid + " / " : ""}<>UID</>: {user.uid})</DialogTitle>
                    <DialogContent>
                        <Typography variant="body2">{tr("this_will_change_the_tracker")}</Typography>
                        <FormControl component="fieldset" sx={{ mt: "5px" }}>
                            <FormLabel component="legend">{tr("tracker")}</FormLabel>
                            <TextField select size="small" value={trackerInUse} onChange={(e) => setTrackerInUse(e.target.value)} sx={{ marginTop: "6px", height: "30px" }}>
                                {availableTrackers.map((tracker) => (
                                    <MenuItem key={tracker} value={tracker}>
                                        {trackerMapping[tracker]}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="primary" onClick={() => { setCtxAction(""); }}>{tr("close")}</Button>
                        <Button variant="contained" color="success" onClick={() => { switchTracker(); }} disabled={dialogBtnDisabled}>{tr("update")}</Button>
                    </DialogActions>
                </Dialog>
            }
            {ctxAction === "accept-user" &&
                <Dialog open={true} onClose={() => { setCtxAction(""); }} fullWidth >
                    <DialogTitle>{tr("accept_as_member")}<>|</>{user.name} ({user.userid !== null ? tr("user_id") + ": " + user.userid + " / " : ""}<>UID</>: {user.uid})</DialogTitle>
                    <DialogContent>
                        <Typography variant="body2">{tr("the_user_will_be_accepted")}</Typography>
                        <Typography variant="body2">{tr("this_will_not_affect_the")}</Typography>
                        <FormControl component="fieldset" sx={{ mt: "5px" }}>
                            <FormLabel component="legend">{tr("select_the_tracker_the_user")}</FormLabel>
                            <TextField select size="small" value={trackerInUse} onChange={(e) => setTrackerInUse(e.target.value)} sx={{ marginTop: "6px", height: "30px" }}>
                                {availableTrackers.map((tracker) => (
                                    <MenuItem key={tracker} value={tracker}>
                                        {trackerMapping[tracker]}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="primary" onClick={() => { setCtxAction(""); }}>{tr("close")}</Button>
                        <Button variant="contained" color="success" onClick={() => { acceptUser(); }} disabled={dialogBtnDisabled}>{tr("accept")}</Button>
                    </DialogActions>
                </Dialog>
            }
            {ctxAction === "role-ban-history" &&
                <Dialog open={true} onClose={() => { setCtxAction(""); }} fullWidth >
                    <DialogTitle>{user.name} ({user.userid !== null ? tr("user_id") + ": " + user.userid + " / " : ""}<>UID</>: {user.uid})</DialogTitle>
                    <DialogContent>
                        <Box display="flex" alignItems="center">
                            <Typography variant="h7" sx={{ fontWeight: 800 }}>{tr("role_history")}</Typography>
                            <Typography variant="body2" style={{ fontSize: "0.8em", marginLeft: '8px', color: user.role_history === null ? theme.palette.error.main : (user.role_history !== undefined ? theme.palette.success.main : theme.palette.info.main) }}>{user.role_history === null ? `Invisible` : (user.role_history !== undefined ? tr("visible") : tr("loading"))}</Typography>
                        </Box>
                        {user.role_history !== undefined && user.role_history !== null && user.role_history.map((history, idx) => (<>
                            {idx !== 0 && <Divider sx={{ mt: "5px" }} />}
                            {history.added_roles.map((role) => (<Typography key={`history-${idx}`} variant="body2" sx={{ color: theme.palette.info.main }}>+ {vars.roles[role] !== undefined ? vars.roles[role].name : `Unknown Role (${role})`}</Typography>))}
                            {history.removed_roles.map((role) => (<Typography key={`history-${idx}`} variant="body2" sx={{ color: theme.palette.warning.main }}>- {vars.roles[role] !== undefined ? vars.roles[role].name : `Unknown Role (${role})`}</Typography>))}
                            <Typography key={`history-${idx}-time`} variant="body2" sx={{ color: theme.palette.text.secondary }}><TimeAgo key={`${+new Date()}`} timestamp={history.timestamp * 1000} /></Typography>
                        </>
                        ))}
                        {user.role_history !== undefined && user.role_history !== null && user.role_history.length === 0 && <Typography variant="body2" >{tr("no_data")}</Typography>}

                        <Box display="flex" alignItems="center" sx={{ mt: "10px" }}>
                            <Typography variant="h7" sx={{ fontWeight: 800 }}>{tr("ban_history")}</Typography>
                            <Typography variant="body2" style={{ fontSize: "0.8em", marginLeft: '8px', color: user.ban_history === null ? theme.palette.error.main : (user.ban_history !== undefined ? theme.palette.success.main : theme.palette.info.main) }}>{user.ban_history === null ? `Invisible` : (user.ban_history !== undefined ? tr("visible") : tr("loading"))}</Typography>
                        </Box>
                        {user.ban_history !== undefined && user.ban_history !== null && user.ban_history.map((history, idx) => (<>
                            {idx !== 0 && <Divider sx={{ mt: "5px" }} />}
                            <Typography key={`history-${idx}`} variant="body2">{history.reason}</Typography>
                            <Typography key={`history-${idx}-time`} variant="body2" sx={{ color: theme.palette.text.secondary }}><>{tr("expiry")}</>: {getFormattedDate(userSettings.display_timezone, new Date(history.expire_timestamp * 1000))}</Typography>
                        </>
                        ))}
                        {user.ban_history !== undefined && user.ban_history !== null && user.ban_history.length === 0 && <Typography variant="body2" >{tr("no_data")}</Typography>}
                    </DialogContent>
                    <DialogActions>
                        <Button variant="primary" onClick={() => { setCtxAction(""); }}>{tr("close")}</Button>
                    </DialogActions>
                </Dialog>
            }
            {ctxAction === "update-connections" &&
                <Dialog open={true} onClose={() => { setCtxAction(""); }} fullWidth  >
                    <DialogTitle>{tr("update_connections")}<>|</>{user.name} ({user.userid !== null ? tr("user_id") + ": " + user.userid + " / " : ""}<>UID</>: {user.uid})</DialogTitle>
                    <DialogContent>
                        <Typography variant="body2">{tr("connections_should_not_be_modified")}</Typography>
                        <Typography variant="body2">{tr("remember_that_all_users_have")}</Typography>
                        <Typography variant="body2">{tr("deleting_connections_will_only_delete")}</Typography>
                        <Grid container spacing={2} sx={{ mt: "5px" }}>
                            <Grid item xs={6}>
                                <TextField
                                    label={tr("email")}
                                    value={newConnections.email}
                                    onChange={(e) => setNewConnections({ ...newConnections, email: e.target.value })}
                                    fullWidth disabled={dialogBtnDisabled}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label={tr("discord_id")}
                                    value={newConnections.discordid}
                                    onChange={(e) => setNewConnections({ ...newConnections, discordid: e.target.value })}
                                    fullWidth disabled={dialogBtnDisabled}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label={tr("steam_id")}
                                    value={newConnections.steamid}
                                    onChange={(e) => setNewConnections({ ...newConnections, steamid: e.target.value })}
                                    fullWidth disabled={dialogBtnDisabled}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label={tr("truckersmp_id")}
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
                                <Button variant="contained" color="primary">{tr("disconnect")}</Button>
                                <Button variant="contained" color="error" onClick={() => { updateConnections("delete", "email"); }} disabled={dialogBtnDisabled}>{tr("email")}</Button>
                                <Button variant="contained" color="warning" onClick={() => { updateConnections("delete", "discordid"); }} disabled={dialogBtnDisabled}>Discord</Button>
                                <Button variant="contained" color="success" onClick={() => { updateConnections("delete", "steamid"); }} disabled={dialogBtnDisabled}>Steam</Button>
                                <Button variant="contained" color="info" onClick={() => { updateConnections("delete", "truckersmpid"); }} disabled={dialogBtnDisabled}>TruckersMP</Button>
                            </ButtonGroup>
                        </Box>
                        <Box sx={{ display: 'grid', justifyItems: 'end' }}>
                            <ButtonGroup>
                                <Button variant="primary" onClick={() => { setCtxAction(""); }}>{tr("close")}</Button>
                                <Button variant="contained" onClick={() => { updateConnections(); }} disabled={dialogBtnDisabled}>{tr("save")}</Button>
                            </ButtonGroup>
                        </Box>
                    </DialogActions>
                </Dialog>
            }
            {ctxAction === "disable-mfa" &&
                <Dialog open={true} onClose={() => { setCtxAction(""); }} fullWidth >
                    <DialogTitle>{tr("disable_mfa")}<>|</>{user.name} ({user.userid !== null ? tr("user_id") + ": " + user.userid + " / " : ""}<>UID</>: {user.uid})</DialogTitle>
                    <DialogContent>
                        <Typography variant="body2">{tr("multiple_factor_authentication_will_be")}</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.warning.main }}>{tr("this_may_put_the_users")}</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="primary" onClick={() => { setCtxAction(""); }}>{tr("close")}</Button>
                        {curUser.mfa && <Button variant="contained" color="error" onClick={() => { setCtxAction("disable-mfa-require-otp"); }} disabled={dialogBtnDisabled}>{tr("disable")}</Button>}
                        {!curUser.mfa && <Button variant="contained" color="error" disabled={true}>{tr("enable_mfa_for_yourself_first")}</Button>}
                    </DialogActions>
                </Dialog>
            }
            {ctxAction === "disable-mfa-require-otp" &&
                <Dialog open={true} onClose={(e) => { setCtxAction(""); }}>
                    <DialogTitle>
                        <Typography variant="h6" sx={{ flexGrow: 1, display: 'flex', alignItems: "center" }}>
                            <FontAwesomeIcon icon={faFingerprint} />&nbsp;&nbsp;{tr("attention_required")}</Typography>
                    </DialogTitle>
                    <DialogContent>
                        <Typography variant="body2">{tr("for_security_purposes_you_must")}</Typography>
                        <TextField
                            sx={{ mt: "15px" }}
                            label={tr("mfa_otp")}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            fullWidth
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={(e) => { setCtxAction(""); }} variant="contained" color="secondary" sx={{ ml: 'auto' }}>{tr("close")}</Button>
                        <Button onClick={() => { disableMFA(); }} variant="contained" color="success" sx={{ ml: 'auto' }} disabled={dialogBtnDisabled}>{tr("verify")}</Button>
                    </DialogActions>
                </Dialog>}
            {ctxAction === "ban-user" &&
                <Dialog open={true} onClose={() => { setCtxAction(""); }} fullWidth  >
                    <DialogTitle>{tr("ban_user")}<>|</>{user.name} ({user.userid !== null ? tr("user_id") + ": " + user.userid + " / " : ""}<>UID</>: {user.uid})</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2} sx={{ mt: "5px" }}>
                            <Grid item xs={6}>
                                <DateTimeField
                                    label={tr("expire_datetime")}
                                    defaultValue={newBan.expire}
                                    onChange={(timestamp) => { setNewBan({ ...newBan, expire: timestamp }); }}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label={tr("reason")}
                                    value={newBan.reason}
                                    onChange={(e) => setNewBan({ ...newBan, reason: e.target.value })}
                                    fullWidth
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="primary" onClick={() => { setCtxAction(""); }}>{tr("close")}</Button>
                        <Button variant="contained" color="error" onClick={() => { putBan(); }} disabled={dialogBtnDisabled}>{tr("ban")}</Button>
                    </DialogActions>
                </Dialog>
            }
            {ctxAction === "unban-user" &&
                <Dialog open={true} onClose={() => { setCtxAction(""); }} fullWidth  >
                    <DialogTitle>{tr("unban_user")}<>|</>{user.name} ({user.userid !== null ? tr("user_id") + ": " + user.userid + " / " : ""}<>UID</>: {user.uid})</DialogTitle>
                    <DialogContent>
                        <Typography variant="body2">{tr("the_user_will_be_able")}</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="primary" onClick={() => { setCtxAction(""); }}>{tr("close")}</Button>
                        <Button variant="contained" color="success" onClick={() => { deleteBan(); }} disabled={dialogBtnDisabled}>{tr("unban")}</Button>
                    </DialogActions>
                </Dialog>
            }
            {ctxAction === "dismiss-member" &&
                <Dialog open={true} onClose={() => { setCtxAction(""); }} fullWidth >
                    <DialogTitle>{tr("dismiss_member")}<>|</>{user.name} ({user.userid !== null ? tr("user_id") + ": " + user.userid + " / " : ""}<>UID</>: {user.uid})</DialogTitle>
                    <DialogContent>
                        <Typography variant="body2">{tr("the_user_will_be_dismissed")}</Typography>
                        <Typography variant="body2">{tr("most_data_generated_by_the")}</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="primary" onClick={() => { setCtxAction(""); }}>{tr("close")}</Button>
                        <Button variant="contained" color="error" onClick={() => { dismissMember(); }} disabled={dialogBtnDisabled}>{tr("dismiss")}</Button>
                    </DialogActions>
                </Dialog>
            }
            {ctxAction === "delete-user" &&
                <Dialog open={true} onClose={() => { setCtxAction(""); }} fullWidth >
                    <DialogTitle>{tr("delete_user")}<>|</>{user.name} ({user.userid !== null ? tr("user_id") + ": " + user.userid + " / " : ""}<>UID</>: {user.uid})</DialogTitle>
                    <DialogContent>
                        <Typography variant="body2">{tr("the_user_will_be_deleted")}</Typography>
                        <Typography variant="body2">{tr("user_ban_will_not_be")}</Typography>
                        <Typography variant="body2">{tr("most_data_generated_by_the")}</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="primary" onClick={() => { setCtxAction(""); }}>{tr("close")}</Button>
                        <Button variant="contained" color="error" onClick={() => { deleteUser(); }} disabled={dialogBtnDisabled}>{tr("delete")}</Button>
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
            onClose={(e) => { ackCustomizeProfile(); updateNote(); e.preventDefault(); e.stopPropagation(); setShowPopover(false); }}
        >
            <Card sx={{ maxWidth: 340, minWidth: 340, padding: "5px", backgroundImage: `linear-gradient(${profileBackground[0]}, ${profileBackground[1]})` }}>
                {!userSettings.data_saver && <CardMedia
                    component="img"
                    image={profileBannerURL}
                    onError={(event) => {
                        event.target.src = `${vars.dhpath}/member/banner?userid=${user.userid}`;
                    }}
                    alt=""
                    sx={{ borderRadius: "5px 5px 0 0" }}
                />}
                <CardContent sx={{ padding: "10px", backgroundImage: `linear-gradient(${PROFILE_COLOR[theme.mode].paper}A0, ${PROFILE_COLOR[theme.mode].paper}E0)`, borderRadius: "0 0 5px 5px" }}>
                    <CardContent sx={{ padding: "10px", backgroundImage: `linear-gradient(${PROFILE_COLOR[theme.mode].paper}E0, ${PROFILE_COLOR[theme.mode].paper}E0)`, borderRadius: "5px" }}>
                        <div style={{ display: "flex", flexDirection: "row" }}>
                            <Typography variant="h6" sx={{ fontWeight: 800, flexGrow: 1, display: 'flex', alignItems: "center" }}>
                                {user.name}
                            </Typography>
                            <Typography variant="h7" sx={{ flexGrow: 1, display: 'flex', alignItems: "center", maxWidth: "fit-content" }}>
                                {badges.map((badge, index) => { return <a key={index} onClick={() => { navigate("/badges"); }} style={{ cursor: "pointer" }}>{badge}&nbsp;</a>; })}
                                {user.userid !== null && user.userid !== undefined && user.userid >= 0 && <Tooltip placement="top" arrow title={tr("user_id")}
                                    PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, -10] } }] }}><Typography variant="body2"><FontAwesomeIcon icon={faHashtag} />{user.userid}</Typography></Tooltip>}
                            </Typography>
                        </div>
                        {users[user.uid] !== undefined && users[user.uid].activity !== null && users[user.uid].activity !== undefined && <Typography variant="body2">{GetActivity(tr, users[user.uid].activity)}</Typography>}
                        {user.uid === curUser.uid && !customizeProfileAck && vars.userConfig[curUser.uid] === undefined && <Typography variant="body2" sx={{ color: theme.palette.info.main }}><a style={{ cursor: "pointer" }} onClick={() => { navigate("/settings/appearance"); }}>{tr("customize_your_profile_in_settings")}</a></Typography>}
                        <Divider sx={{ mt: "8px", mb: "8px" }} />
                        {user.bio !== "" && <>
                            <Typography variant="body2" sx={{ fontWeight: 800 }}>
                                {tr("about_me").toUpperCase()}
                            </Typography>
                            <Typography variant="body2">
                                <MarkdownRenderer>{user.bio}</MarkdownRenderer>
                            </Typography>
                        </>}
                        <Grid container sx={{ mt: "10px" }}>
                            <Grid item xs={6}>
                                <Typography variant="body2" sx={{ fontWeight: 800 }}>
                                    {user.userid !== null && user.userid !== -1 ? `MEMBER` : `USER`} {tr("since").toUpperCase()}
                                </Typography>
                                {users[user.uid] !== undefined && <Typography variant="body2" sx={{ display: "inline-block" }}>
                                    {getFormattedDate(userSettings.display_timezone, new Date(users[user.uid].join_timestamp * 1000)).split(" at ")[0]}
                                </Typography>}
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" sx={{ fontWeight: 800 }}>
                                    {tr("tracker").toUpperCase()}
                                </Typography>
                                <Typography variant="body2">
                                    {trackerMapping[trackerInUse]}
                                </Typography>
                            </Grid>
                        </Grid>
                        {user.roles !== null && user.roles !== undefined && user.roles.length !== 0 && <Box sx={{ mt: "10px" }}>
                            <Typography variant="body2" sx={{ fontWeight: 800 }}>
                                {user.roles.length > 1 ? `ROLES` : `ROLE`}
                            </Typography>
                            {user.roles.map((role) => (
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
                                {tr("note").toUpperCase()}
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