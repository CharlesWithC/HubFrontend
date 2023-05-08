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
import { useState, useEffect } from 'react';

var vars = require('../variables');

function SideBar(props) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const [selectedIndex, setSelectedIndex] = useState(0);
    const handleListItemClick = (event, index) => {
        setSelectedIndex(index);
    };

    const [bannerHeight, setLogoHeight] = useState(0);
    useEffect(() => {
        const banner = document.getElementsByClassName("sidebar-banner")[0];
        if (banner) {
            setLogoHeight(banner.offsetHeight);
        }
    }, []);
    const simpleBarStyle = {
        maxHeight: `calc(100vh - ${(bannerHeight + 40)}px)`,
        height: `calc(100vh - ${(bannerHeight + 40)}px)`,
    };

    const plugins = vars.dhconfig.plugins;
    const allPlugins = ["announcement", "application", "challenge", "division", "downloads", "economy", "event"];
    const menuName = { "overview": "Overview", "announcement": "Announcements", "downloads": "Downloads", "live_map": "Live Map", "delivery": "Deliveries", "challenge": "Challenges", "division": "Divisions", "economy": "Economy", "event": "Events", "member": "Members", "leaderboard": "Leaderboard", "ranking": "Rankings", "new_application": "New Application", "my_application": "My Applications", "all_application": "All Applications", "pending_user": "Pending Users", "audit_log": "Audit Log", "configuration": "Configuration" };
    const menuIcon = { "overview": <AnalyticsRounded />, "announcement": <NewspaperRounded />, "downloads": <BrowserUpdatedRounded />, "live_map": <MapRounded />, "delivery": <LocalShippingRounded />, "challenge": <ChecklistRounded />, "division": <WarehouseRounded />, "economy": <AccountBalanceRounded />, "event": <EventNoteRounded />, "member": <PeopleAltRounded />, "leaderboard": <LeaderboardRounded />, "ranking": <EmojiEventsRounded />, "new_application": <SendRounded />, "my_application": <MarkAsUnreadRounded />, "all_application": <AllInboxRounded />, "pending_user": <PersonAddAltRounded />, "audit_log": <VerifiedUserRounded />, "configuration": <ConstructionRounded /> };

    let menu = [];

    if (!vars.isLoggedIn) {
        menu = [["overview", "announcement"], ["live_map", "delivery", "event"]];
    } else {
        menu = [["overview", "announcement", "downloads"], ["live_map", "delivery", "challenge", "division", "economy", "event"], ["member", "leaderboard", "ranking"], ["new_application", "my_application", "all_application"], ["pending_user", "audit_log", "configuration"]];
    }
    menu = menu.map(subMenu => subMenu.filter(item => (!allPlugins.includes(item)) || (plugins.includes(item) && allPlugins.includes(item))));

    const sidebar = (
        <div>
            {menu.map((subMenu, subIndex) => (
                <div key={`navlist-${subIndex}`}>
                    <List sx={{ margin: "0px 10px 0 10px" }}>
                        {subMenu.map((menuID, btnIndex) => (
                            <ListItem key={`navbtn-${menuID}-${btnIndex}`} disablePadding>
                                <ListItemButton selected={selectedIndex === subIndex * 10 + btnIndex}
                                    onClick={(event) => handleListItemClick(event, subIndex * 10 + btnIndex)}>
                                    <ListItemIcon sx={{ minWidth: "40px" }}>
                                        {menuIcon[menuID]}
                                    </ListItemIcon>
                                    <ListItemText primary={menuName[menuID]} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                    {subIndex !== menu.length - 1 && <Divider key={`divider-${subIndex}`} />}
                </div>
            ))}
        </div>
    );

    const container = window !== undefined ? () => window.document.body : undefined;

    return (
        <Box
            component="nav"
            sx={{
                width: { sm: props.width },
                flexShrink: { sm: 0 },
            }}
            aria-label="sidebar"
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
                        <ListItem key={`navbtn-banner`} disablePadding>
                            <img className="sidebar-banner" src={`https://cdn.chub.page/assets/${vars.dhconfig.abbr}/banner.png`} alt="banner" />
                        </ListItem>
                    </List>
                    <SimpleBar style={simpleBarStyle}>
                        {sidebar}
                    </SimpleBar>
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
                        <ListItem key={`navbtn-banner`} disablePadding>
                            <img className="sidebar-banner" src={`https://cdn.chub.page/assets/${vars.dhconfig.abbr}/banner.png`} alt="banner" />
                        </ListItem>
                    </List>
                    <SimpleBar style={simpleBarStyle}>
                        {sidebar}
                    </SimpleBar>
                </div>
            </Drawer>
        </Box>
    );
}

SideBar.propTypes = {
    width: PropTypes.number,
};

export default SideBar;