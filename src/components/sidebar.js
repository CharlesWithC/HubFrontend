import { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../context';

import { Box, Divider, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { AnalyticsRounded, NewspaperRounded, MapRounded, BrowserUpdatedRounded, LocalShippingRounded, ChecklistRounded, WarehouseRounded, EventNoteRounded, PeopleAltRounded, LeaderboardRounded, EmojiEventsRounded, SendRounded, MarkAsUnreadRounded, AllInboxRounded, PersonAddAltRounded, VerifiedUserRounded, ConstructionRounded, BallotRounded, MapsHomeWorkRounded, CollectionsRounded, HomeRounded, FactCheckRounded, AssignmentTurnedInRounded } from '@mui/icons-material';

import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCrown } from '@fortawesome/free-solid-svg-icons';

const ALL_STAFF_PERMS = ['administrator', 'update_config', 'reload_config', 'restart_service', 'accept_members', 'dismiss_members', 'update_roles', 'update_points', 'update_connections', 'disable_mfa', 'delete_notifications', 'manage_profiles', 'view_sensitive_profile', 'view_privacy_protected_data', 'view_global_note', 'update_global_note', 'view_external_user_list', 'ban_users', 'delete_users', 'import_dlogs', 'delete_dlogs', 'view_audit_log', 'manage_announcements', 'manage_applications', 'delete_applications', 'manage_challenges', 'manage_divisions', 'manage_downloads', 'manage_economy', 'manage_economy_balance', 'manage_economy_truck', 'manage_economy_garage', 'manage_economy_merch', 'manage_events', 'manage_polls', 'manage_public_tasks'];

const SideBar = (props) => {
    const { t: tr } = useTranslation();
    const { vtcBanner, vtcLevel, webConfig, curUID, curUser, curUserPerm } = useContext(AppContext);

    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);
    const handleDrawerToggle = useCallback(() => {
        setMobileOpen(!mobileOpen);
    }, [mobileOpen]);

    const [selectedIndex, setSelectedIndex] = useState(-1);
    const handleListItemClick = useCallback((event, index) => {
        setSelectedIndex(index);
    }, []);

    const [reload, setReload] = useState(+new Date());
    const [reload404, setReload404] = useState(false);
    useEffect(() => {
        const handleReloadEvent = () => {
            setReload(+new Date());
        };
        window.addEventListener("reloadSideBar", handleReloadEvent);
        return () => {
            window.removeEventListener("reloadSideBar", handleReloadEvent);
        };
    }, []);
    useEffect(() => {
        window.addEventListener("toggleSidebar", handleDrawerToggle);
        return () => {
            window.removeEventListener("toggleSidebar", handleDrawerToggle);
        };
    }, []);

    const plugins = useMemo(() => (webConfig.plugins), []);
    // const allPlugins = ["announcement", "application", "challenge", "division", "downloads", "economy", "event", "poll"];
    const pluginControl = useMemo(() => ({ "announcement": ["announcement"], "application": ["new_application", "my_application", "all_application"], "challenge": ["challenge"], "division": ["division", "division_pending"], "downloads": ["downloads"], "economy": ["economy"], "event": ["event"], "poll": ["poll"], "task": ["task"] }), []);
    const menuName = useMemo(() => ({ "overview": tr("overview"), "statistics": tr("statistics"), "announcement": tr("announcements"), "downloads": tr("downloads"), "poll": tr("polls"), "task": "Tasks", "gallery": tr("gallery"), "live_map": tr("map"), "delivery": tr("deliveries"), "challenge": tr("challenges"), "division": tr("divisions"), "division_pending": tr("divisions") + " (" + tr("pending") + ")", "economy": tr("economy"), "event": tr("events"), "member": tr("members"), "leaderboard": tr("leaderboard"), "ranking": tr("rankings"), "freightmaster": "FreightMaster", "new_application": tr("new_application"), "my_application": tr("my_applications"), "all_application": tr("all_applications"), "member_list": tr("member_list"), "external_user": tr("external_users"), "audit_log": tr("audit_log"), "configuration": tr("configuration") }), [tr]);
    const menuIcon = useMemo(() => ({ "overview": <HomeRounded />, "statistics": <AnalyticsRounded />, "announcement": <NewspaperRounded />, "downloads": <BrowserUpdatedRounded />, "poll": <BallotRounded />, "task": <AssignmentTurnedInRounded />, "gallery": <CollectionsRounded />, "live_map": <MapRounded />, "delivery": <LocalShippingRounded />, "challenge": <ChecklistRounded />, "division": <WarehouseRounded />, "division_pending": <FactCheckRounded />, "economy": <MapsHomeWorkRounded />, "event": <EventNoteRounded />, "member": <PeopleAltRounded />, "leaderboard": <LeaderboardRounded />, "ranking": <EmojiEventsRounded />, "freightmaster": <FontAwesomeIcon icon={faCrown} />, "new_application": <SendRounded />, "my_application": <MarkAsUnreadRounded />, "all_application": <AllInboxRounded />, "member_list": <PeopleAltRounded />, "external_user": <PersonAddAltRounded />, "audit_log": <VerifiedUserRounded />, "configuration": <ConstructionRounded /> }), []);
    const menuRoute = useMemo(() => ({ "overview": "/", "statistics": "/statistics", "announcement": "/announcement", "downloads": "/downloads", "poll": "/poll", "task": "/task", "gallery": "/gallery", "live_map": "/map", "delivery": "/delivery", "challenge": "/challenge", "division": "/division", "division_pending": "/division/pending", "economy": "/economy", "event": "/event", "member": "/member", "leaderboard": "/leaderboard", "ranking": "/ranking", "freightmaster": "/freightmaster", "new_application": "/application/new", "my_application": "/application/my", "all_application": "/application/all", "member_list": "/member-list", "external_user": "/external-user", "audit_log": "/audit-log", "configuration": "/config" }), []);

    const menu = useMemo(() => {
        let menu = [];
        let toRemove = [];

        if (curUID === null) {
            menu = [["overview", "announcement", "gallery"], ["live_map", "delivery", "event"]];
            if (webConfig.gallery.length === 0) {
                toRemove.push("gallery");
            } else {
                toRemove = toRemove.filter(item => item !== "gallery");
            }
        } else {
            menu = [["overview", "statistics", "announcement", "downloads", "poll", "task", "gallery"], ["live_map", "delivery", "challenge", "division", "division_pending", "event", "economy"], ["member", "leaderboard", "ranking"], ["new_application", "my_application", "all_application"], ["member_list", "external_user", "audit_log", "configuration"]];
            if (!curUserPerm.includes("administrator")) {
                if (!curUserPerm.includes("driver") || curUser.userid === -1) {
                    toRemove = ["downloads", "challenge", "division", "division_pending", "economy", "poll", "task", "member", "leaderboard", "ranking", "external_user", "audit_log", "configuration"];
                }
                if (!curUserPerm.includes("update_config") && !curUserPerm.includes("reload_config")) {
                    toRemove.push("configuration");
                } else {
                    toRemove = toRemove.filter(item => item !== "configuration");
                }
                if (!curUserPerm.includes("view_external_user_list") && !curUserPerm.includes("ban_users")) {
                    toRemove.push("external_user");
                } else {
                    toRemove = toRemove.filter(item => item !== "external_user");
                }
                if (!ALL_STAFF_PERMS.some(item => curUserPerm.includes(item))) {
                    toRemove.push("member_list");
                } else {
                    toRemove = toRemove.filter(item => item !== "member_list");
                }
                if (!curUserPerm.includes("manage_divisions")) {
                    toRemove.push("division_pending");
                } else {
                    toRemove = toRemove.filter(item => item !== "division_pending");
                }
                if (!curUserPerm.includes("manage_applications")) {
                    toRemove.push("all_application");
                } else {
                    toRemove = toRemove.filter(item => item !== "all_application");
                }
                if (!curUserPerm.includes("view_audit_log")) {
                    toRemove.push("audit_log");
                } else {
                    toRemove = toRemove.filter(item => item !== "audit_log");
                }
                if (webConfig.gallery.length === 0 && !curUserPerm.includes("manage_gallery")) {
                    toRemove.push("gallery");
                } else {
                    toRemove = toRemove.filter(item => item !== "gallery");
                }
            }
        }

        if (vtcLevel < 1) toRemove.push("gallery");

        for (let key in pluginControl) {
            if (!plugins.includes(key)) {
                toRemove = toRemove.concat(pluginControl[key]);
            }
        }
        menu = menu.map(subMenu => subMenu.filter(item => (!toRemove.includes(item))));
        menu = menu.filter(subMenu => subMenu.length > 0);

        let removedPath = [];
        for (let i = 0; i < toRemove.length; i++) {
            removedPath.push(menuRoute[toRemove[i]]);
        }
        if (removedPath.includes(window.location.pathname)) navigate("/404");

        return menu;
    }, [webConfig, curUID, curUser, curUserPerm, vtcLevel]);

    useEffect(() => {
        let routeIndex = {};
        for (let i = 0; i < menu.length; i++) {
            for (let j = 0; j < menu[i].length; j++) {
                routeIndex[menuRoute[menu[i][j]]] = i * 10 + j;
            }
        }
        let path = window.location.pathname;
        let matchedPath = false;
        if (Object.keys(routeIndex).includes("/" + path.split("/")[1] + "/" + path.split("/")[2])) {
            matchedPath = true;
            if (selectedIndex !== routeIndex["/" + path.split("/")[1] + "/" + path.split("/")[2]]) {
                setSelectedIndex(routeIndex["/" + path.split("/")[1] + "/" + path.split("/")[2]]);
            }
        }
        if (!matchedPath && Object.keys(routeIndex).includes("/" + path.split("/")[1])) {
            matchedPath = true;
            if (selectedIndex !== routeIndex["/" + path.split("/")[1]]) {
                setSelectedIndex(routeIndex["/" + path.split("/")[1]]);
            }
        }
        if (!matchedPath) {
            // off-the-sidebar-paths
            if (!["/settings", "/notifications", "/sponsor", "/supporters", "/badges"].includes(path) || ["/settings", "/settings/general", "/settings/appearance", "/settings/security", "/settings/sessions", "/notifications"].includes(path) && curUID === null) {
                if (!reload404) {
                    if (Object.values(menuRoute).includes(path)) {
                        if (curUID === null) navigate("/auth/login");
                        setReload404(true);
                        setTimeout(function () {
                            window.loading -= 1;
                        }, 500);
                    } else {
                        setTimeout(function () {
                            // check again later, in case sidebar should be hidden
                            if (!["/settings", "/settings/general", "/settings/appearance", "/settings/security", "/settings/sessions", "/notifications", "/sponsor", "/supporters", "/badges"].includes(path) || ["/settings", "/notifications"].includes(path) && curUID === null) {
                                if (!reload404) {
                                    if (Object.values(menuRoute).includes(path)) {
                                        if (curUID === null) navigate("/auth/login");
                                        setReload404(true);
                                        setTimeout(function () {
                                            window.loading -= 1;
                                        }, 500);
                                    }
                                }
                            }
                        }, 500);
                    }
                }
            }
            if (selectedIndex !== -1) {
                setSelectedIndex(-1);
            }
        }
    }, [window.location.pathname]);

    const sidebar = <SimpleBar key='sidebar-simplebar' style={{ maxHeight: `100vh`, height: `100vh`, }}>
        <List key="0" sx={{ paddingTop: 0 }}>
            <ListItem key={`navbtn-banner`} disablePadding>
                <img className="sidebar-banner" src={vtcBanner} alt="" style={{ margin: 0, width: "100%" }} />
            </ListItem>
        </List>
        {menu.map((subMenu, subIndex) => (
            <div key={`navlist-${subMenu}-${subIndex}`}>
                <List sx={{ margin: "0px 10px 0 10px" }}>
                    {subMenu.map((menuID, btnIndex) => (
                        <Link key={`navlink-${menuID}-${btnIndex}`} to={`${menuRoute[menuID]}`}>
                            <ListItem key={`navbtn-${menuID}-${btnIndex}`} disablePadding>
                                <ListItemButton selected={selectedIndex === subIndex * 10 + btnIndex}
                                    onClick={(event) => handleListItemClick(event, subIndex * 10 + btnIndex)}>
                                    <ListItemIcon sx={{ minWidth: "40px" }}>
                                        {menuIcon[menuID]}
                                    </ListItemIcon>
                                    <ListItemText primary={menuName[menuID]} />
                                </ListItemButton>
                            </ListItem>
                        </Link>
                    ))}
                </List>
                {subIndex !== menu.length - 1 && <Divider key={`divider-${subIndex}`} />}
            </div>
        ))}
    </SimpleBar>;

    const container = window !== undefined ? () => window.document.body : undefined;

    return (
        <Box
            component="nav"
            sx={{
                width: { sm: props.width },
                flexShrink: { sm: 0 },
            }}
            aria-label="sidebar"
            do-reload={reload}
        >
            {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
            <Drawer
                container={container}
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{
                    keepMounted: true, // Better open performance on mobile.
                }}
                sx={{
                    display: { xs: 'block', sm: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: props.width },
                }}
            >
                <div style={{ overflow: "hidden" }}>
                    {sidebar}
                </div>
            </Drawer>
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', sm: 'block' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: props.width },
                    overflow: "hidden",
                }}
                open
            >
                <div style={{ overflow: "hidden" }}>
                    {sidebar}
                </div>
            </Drawer>
        </Box>
    );
};

export default SideBar;