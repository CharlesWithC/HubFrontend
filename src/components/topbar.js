import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import { NotificationsRounded, AccountBoxRounded, SettingsRounded, FlareRounded, LogoutRounded } from '@mui/icons-material';
import PropTypes from 'prop-types';

function TopBar(props) {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const isMenuOpen = Boolean(anchorEl);
    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const dropdownButtons = (<Menu
        anchorEl={anchorEl}
        anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
        }}
        id='topbar-dropdown-menu'
        keepMounted
        transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
        }}
        open={isMenuOpen}
        onClose={handleMenuClose}
        sx={{ top: "50px" }}
    >
        <MenuItem><ListItemIcon><AccountBoxRounded fontSize="small" /></ListItemIcon>Profile</MenuItem>
        <MenuItem><ListItemIcon><NotificationsRounded fontSize="small" /></ListItemIcon>Notifications</MenuItem>
        <MenuItem><ListItemIcon><SettingsRounded fontSize="small" /></ListItemIcon>Settings</MenuItem>
        <Divider />
        <MenuItem sx={{color: '#FFC400'}}><ListItemIcon><FlareRounded fontSize="small" /></ListItemIcon>Upgrade</MenuItem>
        <Divider />
        <MenuItem><ListItemIcon><LogoutRounded fontSize="small" /></ListItemIcon>Logout</MenuItem>
    </Menu>);
    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static"
                sx={{
                    width: { sm: `calc(100% - ${props.sidebarWidth}px)` },
                    ml: { sm: `${props.sidebarWidth}px` },
                }}>
                <Toolbar>
                    <Typography component="div" sx={{ flexGrow: 1 }}>
                        <IconButton size="medium" color="inherit">
                            <NotificationsRounded />
                        </IconButton>
                    </Typography>
                    <div className="user-profile" onClick={handleProfileMenuOpen}>
                        <div className="user-info">
                            <div className="user-name">CharlesWithC</div>
                            <div className="user-role">Dragon</div>
                        </div>
                        <div className="user-avatar">
                            <img src="https://charlws.com/me.gif" alt="User Avatar" />
                        </div>
                    </div>
                    {dropdownButtons}
                </Toolbar>
            </AppBar>
        </Box>
    );
}

TopBar.propTypes = {
    sidebarWidth: PropTypes.number,
};

export default TopBar;