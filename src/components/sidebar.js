import { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../context';

import { Box, Divider, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { AnalyticsRounded, NewspaperRounded, MapRounded, BrowserUpdatedRounded, LocalShippingRounded, ChecklistRounded, WarehouseRounded, EventNoteRounded, PeopleAltRounded, LeaderboardRounded, EmojiEventsRounded, SendRounded, MarkAsUnreadRounded, AllInboxRounded, PersonAddAltRounded, VerifiedUserRounded, ConstructionRounded, BallotRounded, MapsHomeWorkRounded, CollectionsRounded } from '@mui/icons-material';

import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';

var vars = require('../variables');

const SideBar = (props) => {
    const { t: tr } = useTranslation();
    const { curUID, curUser, curUserPerm } = useContext(AppContext);

    window.loading = 0; // clear loading state on page change

    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);
    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const [selectedIndex, setSelectedIndex] = useState(-1);
    const handleListItemClick = (event, index) => {
        setSelectedIndex(index);
    };

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

    const plugins = vars.dhconfig.plugins;
    // const allPlugins = ["announcement", "application", "challenge", "division", "downloads", "economy", "event", "poll"];
    const pluginControl = { "announcement": ["announcement"], "application": ["new_application", "my_application", "all_application"], "challenge": ["challenge"], "division": ["division"], "downloads": ["downloads"], "economy": ["economy"], "event": ["event"], "poll": ["poll"] };
    const menuName = { "overview": tr("overview"), "gallery": tr("gallery"), "announcement": tr("announcements"), "downloads": tr("downloads"), "poll": tr("polls"), "live_map": tr("map"), "delivery": tr("deliveries"), "challenge": tr("challenges"), "division": tr("divisions"), "economy": tr("economy"), "event": tr("events"), "member": tr("members"), "leaderboard": tr("leaderboard"), "ranking": tr("rankings"), "new_application": tr("new_application"), "my_application": tr("my_applications"), "all_application": tr("all_applications"), "member_list": tr("member_list"), "external_user": tr("external_users"), "audit_log": tr("audit_log"), "configuration": tr("configuration") };
    const menuIcon = { "overview": <AnalyticsRounded />, "gallery": <CollectionsRounded />, "announcement": <NewspaperRounded />, "downloads": <BrowserUpdatedRounded />, "poll": <BallotRounded />, "live_map": <MapRounded />, "delivery": <LocalShippingRounded />, "challenge": <ChecklistRounded />, "division": <WarehouseRounded />, "economy": <MapsHomeWorkRounded />, "event": <EventNoteRounded />, "member": <PeopleAltRounded />, "leaderboard": <LeaderboardRounded />, "ranking": <EmojiEventsRounded />, "new_application": <SendRounded />, "my_application": <MarkAsUnreadRounded />, "all_application": <AllInboxRounded />, "member_list": <PeopleAltRounded />, "external_user": <PersonAddAltRounded />, "audit_log": <VerifiedUserRounded />, "configuration": <ConstructionRounded /> };
    const menuRoute = { "overview": "/", "gallery": "/gallery", "announcement": "/announcement", "downloads": "/downloads", "poll": "/poll", "live_map": "/map", "delivery": "/delivery", "challenge": "/challenge", "division": "/division", "economy": "/economy", "event": "/event", "member": "/member", "leaderboard": "/leaderboard", "ranking": "/ranking", "new_application": "/application/new", "my_application": "/application/my", "all_application": "/application/all", "member_list": "/member-list", "external_user": "/external-user", "audit_log": "/audit-log", "configuration": "/config" };

    let menu = [];
    let toRemove = [];

    if (curUID === null) {
        menu = [["overview", "announcement", "gallery"], ["live_map", "delivery", "event"]];
        if (vars.dhconfig.gallery.length === 0) {
            toRemove.push("gallery");
        } else {
            toRemove = toRemove.filter(item => item !== "gallery");
        }
    } else {
        menu = [["overview", "announcement", "gallery", "downloads", "poll"], ["live_map", "delivery", "challenge", "division", "event", "economy"], ["member", "leaderboard", "ranking"], ["new_application", "my_application", "all_application"], ["member_list", "external_user", "audit_log", "configuration"]];
        if (!curUserPerm.includes("administrator")) {
            if (!curUserPerm.includes("driver") || curUser.userid === -1) {
                toRemove = ["downloads", "challenge", "division", "economy", "member", "leaderboard", "ranking", "external_user", "audit_log", "configuration"];
            }
            if (!curUserPerm.includes("update_config") && !curUserPerm.includes("reload_config")) {
                toRemove.push("configuration");
            } else {
                toRemove = toRemove.filter(item => item !== "configuration");
            }
            if (!curUserPerm.includes("manage_profiles") && !curUserPerm.includes("view_external_user_list") && !curUserPerm.includes("ban_users") && !curUserPerm.includes("disable_mfa") && !curUserPerm.includes("update_connections") && !curUserPerm.includes("delete_connections") && !curUserPerm.includes("delete_users")) {
                toRemove.push("external_user");
                toRemove.push("member_list");
            } else {
                toRemove = toRemove.filter(item => item !== "external_user");
                toRemove = toRemove.filter(item => item !== "member_list");
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
            if (vars.dhconfig.gallery.length === 0 && !curUserPerm.includes("manage_gallery")) {
                toRemove.push("gallery");
            } else {
                toRemove = toRemove.filter(item => item !== "gallery");
            }
        }
    }

    if (vars.vtcLevel < 1) toRemove.push("gallery");

    for (let key in pluginControl) {
        if (!plugins.includes(key)) {
            toRemove = toRemove.concat(pluginControl[key]);
        }
    }
    menu = menu.map(subMenu => subMenu.filter(item => (!toRemove.includes(item))));
    menu = menu.filter(subMenu => subMenu.length > 0);

    useEffect(() => {
        let routeIndex = {};
        for (let i = 0; i < menu.length; i++) {
            for (let j = 0; j < menu[i].length; j++) {
                routeIndex[menuRoute[menu[i][j]]] = i * 10 + j;
            }
        }
        let path = window.location.pathname;
        let matchedPath = false;
        if (Object.keys(routeIndex).includes("/" + path.split("/")[1])) {
            matchedPath = true;
            if (selectedIndex !== routeIndex["/" + path.split("/")[1]]) {
                setSelectedIndex(routeIndex["/" + path.split("/")[1]]);
            }
        }
        if (Object.keys(routeIndex).includes("/" + path.split("/")[1] + "/" + path.split("/")[2])) {
            matchedPath = true;
            if (selectedIndex !== routeIndex["/" + path.split("/")[1] + "/" + path.split("/")[2]]) {
                setSelectedIndex(routeIndex["/" + path.split("/")[1] + "/" + path.split("/")[2]]);
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
                <img className="sidebar-banner" src={vars.dhbanner} alt="" style={{ margin: 0, width: "100%" }} />
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
        <div style={{ marginLeft: "10px", marginBottom: "10px" }}>
            <Typography variant="body2">Version: v3.4.0-beta.05 [BETA]</Typography>
            <Typography variant="body2">Report bugs in CHub Discord (#issues)</Typography>
            <Typography variant="body2"><a href="https://discord.gg/KRFsymnVKm" target="_blank" rel="noreferrer">https://discord.gg/KRFsymnVKm</a></Typography>
        </div>
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