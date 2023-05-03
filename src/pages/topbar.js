import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { NotificationsRounded, SettingsRounded } from '@mui/icons-material';
import PropTypes from 'prop-types';

var vars = require('../variables');

function TopBar(props) {
    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static"
                sx={{
                    width: { sm: `calc(100% - ${props.sidebarWidth}px)` },
                    ml: { sm: `${props.sidebarWidth}px` },
                }}>
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        {vars.dhconfig.slogan}
                    </Typography>
                    <div>
                        <IconButton size="large" color="inherit">
                            <NotificationsRounded />
                        </IconButton>
                        <IconButton size="large" color="inherit">
                            <SettingsRounded />
                        </IconButton>
                    </div>
                </Toolbar>
            </AppBar>
        </Box>
    );
}

TopBar.propTypes = {
    sidebarWidth: PropTypes.number,
};

export default TopBar;