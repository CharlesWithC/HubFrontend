import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Card, Box, Tabs, Tab, Grid, Typography, Button, ButtonGroup, Divider } from '@mui/material';

var vars = require("../variables");

function a11yProps(index) {
    return {
        id: `map-tab-${index}`,
        'aria-controls': `map-tabpanel-${index}`,
    };
}

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`map-tabpanel-${index}`}
            aria-labelledby={`map-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

const Settings = () => {
    const [tab, setTab] = useState(0);

    const handleChange = (event, newValue) => {
        setTab(newValue);
    };

    const [userSettings, setUserSettings] = useState(vars.userSettings);

    const updateUnit = useCallback((to) => {
        vars.userSettings.unit = to;
        localStorage.setItem("client-settings", JSON.stringify(vars.userSettings));
        setUserSettings({ ...userSettings, unit: to });
    }, [setUserSettings]);

    const updateTheme = useCallback((to) => {
        vars.userSettings.theme = to;
        localStorage.setItem("client-settings", JSON.stringify(vars.userSettings));
        setUserSettings({ ...userSettings, theme: to });

        const themeUpdated = new CustomEvent('themeUpdated', {});
        window.dispatchEvent(themeUpdated);
    }, [setUserSettings]);

    return <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tab} onChange={handleChange} aria-label="map tabs" textColor="info">
                <Tab label="General" {...a11yProps(0)} />
                <Tab label="Security" {...a11yProps(1)} />
                <Tab label="Sessions" {...a11yProps(2)} />
            </Tabs>
        </Box>
        <TabPanel value={tab} index={0}>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={12} md={6} lg={6} doLoad={userSettings.unit}>
                    <Typography variant="h7" sx={{ fontWeight: 80 }}>Distance Unit</Typography>
                    <br />
                    <ButtonGroup>
                        <Button variant="contained" color={userSettings.unit === "metric" ? "info" : "secondary"} onClick={() => { updateUnit("metric"); }}>Metric</Button>
                        <Button variant="contained" color={userSettings.unit === "imperial" ? "info" : "secondary"} onClick={() => { updateUnit("imperial"); }}>Imperial</Button>
                    </ButtonGroup>
                </Grid>

                <Grid item xs={12} sm={12} md={6} lg={6} doLoad={userSettings.theme}>
                    <Typography variant="h7" sx={{ fontWeight: 80 }}>Theme</Typography>
                    <br />
                    <ButtonGroup>
                        <Button variant="contained" color={userSettings.theme === "auto" ? "info" : "secondary"} onClick={() => { updateTheme("auto"); }}>Auto (Device)</Button>
                        <Button variant="contained" color={userSettings.theme === "dark" ? "info" : "secondary"} onClick={() => { updateTheme("dark"); }}>Dark</Button>
                        <Button variant="contained" color={userSettings.theme === "light" ? "info" : "secondary"} onClick={() => { updateTheme("light"); }}>Light</Button>
                    </ButtonGroup>
                </Grid>
            </Grid>
        </TabPanel>
    </Card>;
};

export default Settings;