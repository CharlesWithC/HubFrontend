import { AnalyticsRounded, NewspaperRounded, MapRounded, BrowserUpdatedRounded, LocalShippingRounded, ChecklistRounded, WarehouseRounded, AccountBalanceRounded, EventNoteRounded, PeopleAltRounded, LeaderboardRounded, EmojiEventsRounded, SendRounded, MarkAsUnreadRounded, AllInboxRounded, PersonAddAltRounded, VerifiedUserRounded, ConstructionRounded } from '@mui/icons-material';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import PropTypes from 'prop-types';
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

var vars = require('../variables');

const SideBar = (props) => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const [selectedIndex, setSelectedIndex] = useState(0);
    const handleListItemClick = (event, index) => {
        setSelectedIndex(index);
    };

    const bannerRef = useRef(null);
    const [simpleBarStyle, setSimpleBarStyle] = useState({
        maxHeight: `calc(100vh - 30px)`,
        height: `calc(100vh - 30px)`,
    });
    useEffect(() => {
        const handleImageLoad = () => {
            const sidebarBanners = document.querySelectorAll('.sidebar-banner');
            const visibleSidebarBanner = Array.from(sidebarBanners).find(
                (banner) => banner.offsetParent !== null
            );
            if (visibleSidebarBanner) {
                setTimeout(() => {
                    const updatedVisibleBanner = document.querySelector('.sidebar-banner:not([style*="display: none"])');
                    if (updatedVisibleBanner) {
                        setSimpleBarStyle({
                            maxHeight: `calc(100vh - ${(updatedVisibleBanner.offsetHeight + 30)}px)`,
                            height: `calc(100vh - ${(updatedVisibleBanner.offsetHeight + 30)}px)`,
                        });
                    }
                }, 100);
            }
        };

        let currentBannerRef = bannerRef.current;

        if (currentBannerRef) {
            if (currentBannerRef.complete) {
                handleImageLoad();
            } else {
                currentBannerRef.addEventListener('load', handleImageLoad);
            }
        }

        return () => {
            if (currentBannerRef) {
                currentBannerRef.removeEventListener('load', handleImageLoad);
            }
        };
    }, [bannerRef]);

    const [reload, setReload] = useState(+new Date());
    useEffect(() => {
        const handleReloadEvent = () => {
            setReload(+new Date());
        };
        window.addEventListener("reloadSideBar", handleReloadEvent);
        return () => {
            window.removeEventListener("reloadSideBar", handleReloadEvent);
        };
    }, []);

    const plugins = vars.dhconfig.plugins;
    const allPlugins = ["announcement", "application", "challenge", "division", "downloads", "economy", "event"];
    const menuName = { "overview": "Overview", "announcement": "Announcements", "downloads": "Downloads", "live_map": "Map", "delivery": "Deliveries", "challenge": "Challenges", "division": "Divisions", "economy": "Economy", "event": "Events", "member": "Members", "leaderboard": "Leaderboard", "ranking": "Rankings", "new_application": "New Application", "my_application": "My Applications", "all_application": "All Applications", "pending_user": "Pending Users", "audit_log": "Audit Log", "configuration": "Configuration" };
    const menuIcon = { "overview": <AnalyticsRounded />, "announcement": <NewspaperRounded />, "downloads": <BrowserUpdatedRounded />, "live_map": <MapRounded />, "delivery": <LocalShippingRounded />, "challenge": <ChecklistRounded />, "division": <WarehouseRounded />, "economy": <AccountBalanceRounded />, "event": <EventNoteRounded />, "member": <PeopleAltRounded />, "leaderboard": <LeaderboardRounded />, "ranking": <EmojiEventsRounded />, "new_application": <SendRounded />, "my_application": <MarkAsUnreadRounded />, "all_application": <AllInboxRounded />, "pending_user": <PersonAddAltRounded />, "audit_log": <VerifiedUserRounded />, "configuration": <ConstructionRounded /> };
    const menuRoute = { "overview": "/", "announcement": "/announcement", "downloads": "/downloads", "live_map": "/map", "delivery": "/delivery", "challenge": "/challenge", "division": "/division", "economy": "/economy", "event": "/event", "member": "/member", "leaderboard": "/leaderboard", "ranking": "/ranking", "new_application": "/application/new", "my_application": "/application/my", "all_application": "/application/all", "pending_user": "/pending-user", "audit_log": "/audit-log", "configuration": "/config" };

    let menu = [];
    let toRemove = [];

    if (!vars.isLoggedIn) {
        menu = [["overview", "announcement"], ["live_map", "delivery", "event"]];
    } else {
        menu = [["overview", "announcement", "downloads"], ["live_map", "delivery", "challenge", "division", "event"], ["member", "leaderboard", "ranking"], ["new_application", "my_application", "all_application"], ["pending_user", "audit_log", "configuration"]];
        if (!vars.userPerm.includes("admin")) {
            if (!vars.userPerm.includes("driver") || vars.userInfo.userid === -1) {
                toRemove = ["downloads", "challenge", "division", "economy", "member", "leaderboard", "ranking", "pending_user", "audit_log", "configuration"];
            }
            if (!vars.userPerm.includes("config") && !vars.userPerm.includes("reload_config") && !vars.userPerm.includes("restart")) {
                toRemove.push("configuration");
            } else {
                toRemove = toRemove.filter(item => item !== "configuration");
            }
            if (!vars.userPerm.includes("hrm") && !vars.userPerm.includes("hr") && !vars.userPerm.includes("manage_profile") && !vars.userPerm.includes("get_pending_user_list") && !vars.userPerm.includes("ban_user") && !vars.userPerm.includes("disable_user_mfa") && !vars.userPerm.includes("update_connections") && !vars.userPerm.includes("delete_connections") && !vars.userPerm.includes("delete_user")) {
                toRemove.push("pending_user");
            } else {
                toRemove = toRemove.filter(item => item !== "pending_user");
            }
            if (!vars.userPerm.includes("audit")) {
                toRemove.push("audit_log");
            } else {
                toRemove = toRemove.filter(item => item !== "audit_log");
            }
        }
    }

    // not yet completed
    toRemove.push("pending_user");
    toRemove.push("audit_log");
    toRemove.push("configuration");
    // remove above after completed

    menu = menu.map(subMenu => subMenu.filter(item => (!allPlugins.includes(item)) || (plugins.includes(item) && allPlugins.includes(item))));
    menu = menu.map(subMenu => subMenu.filter(item => (!toRemove.includes(item))));
    menu = menu.filter(subMenu => subMenu.length > 0);

    let routeIndex = {};
    for (let i = 0; i < menu.length; i++) {
        for (let j = 0; j < menu[i].length; j++) {
            routeIndex[menuRoute[menu[i][j]]] = i * 10 + j;
        }
    }
    if (Object.keys(routeIndex).includes("/" + window.location.pathname.split("/")[1])) {
        if (selectedIndex !== routeIndex["/" + window.location.pathname.split("/")[1]]) {
            setSelectedIndex(routeIndex["/" + window.location.pathname.split("/")[1]]);
        }
    }
    if (Object.keys(routeIndex).includes("/" + window.location.pathname.split("/")[1] + "/" + window.location.pathname.split("/")[2])) {
        if (selectedIndex !== routeIndex["/" + window.location.pathname.split("/")[1] + "/" + window.location.pathname.split("/")[2]]) {
            setSelectedIndex(routeIndex["/" + window.location.pathname.split("/")[1] + "/" + window.location.pathname.split("/")[2]]);
        }
    }

    const sidebar = <SimpleBar key='sidebar-simplebar' style={simpleBarStyle}>
        {menu.map((subMenu, subIndex) => (
            <div key={`navlist-${subMenu}-${subIndex}`}>
                <List sx={{ margin: "0px 10px 0 10px" }}>
                    {subMenu.map((menuID, btnIndex) => (
                        <Link key={`navlink-${menuID}-${btnIndex}`} to={`/beta${menuRoute[menuID]}`}>
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
                    bgcolor: "#222222",
                    color: "#ffffff",
                    display: { xs: 'block', sm: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: props.width },
                }}
            >
                <div style={{ overflow: "hidden" }}>
                    <List key="0">
                        <Link to="/beta/"><ListItem key={`navbtn-banner`} disablePadding>
                            <img className="sidebar-banner" src={`https://cdn.chub.page/assets/${vars.dhconfig.abbr}/banner.png`} alt="banner" ref={bannerRef} />
                        </ListItem></Link>
                    </List>
                    {sidebar}
                </div>
            </Drawer>
            <Drawer
                variant="permanent"
                sx={{
                    bgcolor: "#222222",
                    color: "#ffffff",
                    display: { xs: 'none', sm: 'block' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: props.width },
                    overflow: "hidden",
                }}
                open
            >
                <div style={{ overflow: "hidden" }}>
                    <List key="0">
                        <Link to="/beta/"><ListItem key={`navbtn-banner`} disablePadding>
                            <img className="sidebar-banner" src={`https://cdn.chub.page/assets/${vars.dhconfig.abbr}/banner.png`} alt="banner" ref={bannerRef} />
                        </ListItem></Link>
                    </List>
                    {sidebar}
                </div>
            </Drawer>
        </Box>
    );
};

SideBar.propTypes = {
    width: PropTypes.number,
};

export default SideBar;