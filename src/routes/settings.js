import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Card, Box, Tabs, Tab, Grid, Typography, Button, ButtonGroup, IconButton, Snackbar, Alert, useTheme } from '@mui/material';
import { Portal } from '@mui/base';

import Select from 'react-select';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRefresh } from '@fortawesome/free-solid-svg-icons';

import { makeRequestsWithAuth, customAxios as axios, getAuthToken } from '../functions';

var vars = require("../variables");

function a11yProps(index) {
    return {
        id: `map-tab-${index}`,
        'aria-controls': `map-tabpanel-${index}`,
    };
}

const customStyles = (theme) => ({
    control: (base) => ({
        ...base,
        backgroundColor: theme.palette.text.primary,
        borderColor: theme.palette.text.secondary
    }),
    option: (base) => ({
        ...base,
        color: theme.palette.background.default
    }),
    menu: (base) => ({
        ...base,
        zIndex: 100005,
    }),
    menuPortal: (base) => ({
        ...base,
        zIndex: 100005
    }),
    multiValue: (base, state) => {
        return state.data.isFixed ? { ...base, backgroundColor: 'gray' } : base;
    },
    multiValueLabel: (base, state) => {
        return state.data.isFixed
            ? { ...base, fontWeight: 'bold', color: 'white', paddingRight: 6 }
            : base;
    },
    multiValueRemove: (base, state) => {
        return state.data.isFixed ? { ...base, display: 'none' } : base;
    },
});

const NOTIFICATION_NAMES = {
    "drivershub": "Drivers Hub",
    "discord": "Discord",
    "login": "Login",
    "dlog": "Delivery Log",
    "member": "Member",
    "bonus": "Bonus",
    "new_announcement": "New Announcement",
    "application": "Application",
    "new_challenge": "New Challenge",
    "challenge": "Challenge",
    "division": "Division",
    "new_downloads": "New Downloads",
    "economy": "Economy",
    "new_event": "New Event",
    "upcoming_event": "Upcoming Event",
    "new_poll": "New Poll",
    "poll_result": "Poll Result"
};
const NOTIFICATION_TYPES = Object.keys(NOTIFICATION_NAMES);

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

    const [snackbarContent, setSnackbarContent] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const handleCloseSnackbar = useCallback((e) => {
        setSnackbarContent("");
    }, []);

    const theme = useTheme();

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

    const [notificationSettings, setNotificationSettings] = useState(null);
    const reloadNotificationSettings = useCallback(async () => {
        const [_notificationSettings] = await makeRequestsWithAuth([`${vars.dhpath}/user/notification/settings`]);
        let newNotificationSettings = [];
        for (let i = 0; i < NOTIFICATION_TYPES.length; i++) {
            if (_notificationSettings[NOTIFICATION_TYPES[i]]) {
                newNotificationSettings.push({ value: NOTIFICATION_TYPES[i], label: NOTIFICATION_NAMES[NOTIFICATION_TYPES[i]] });
            }
        }
        setNotificationSettings(newNotificationSettings);
    }, []);
    const updateNotificationSettings = useCallback(async (newSettings) => {
        const loadingStart = new CustomEvent('loadingStart', {});
        window.dispatchEvent(loadingStart);

        let enabled = [], disabled = [];
        const preMap = new Map(notificationSettings.map(item => [item.value, item.label]));
        for (const newItem of newSettings) {
            const value = newItem.value;
            if (!preMap.has(value)) {
                enabled.push(value);
            }
        }
        for (const preItem of notificationSettings) {
            const value = preItem.value;
            if (!newSettings.some(item => item.value === value)) {
                disabled.push(value);
            }
        }
        setNotificationSettings(newSettings);

        for (let i = 0; i < enabled.length; i++) {
            let resp = await axios({ url: `${vars.dhpath}/user/notification/settings/${enabled[i]}/enable`, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
            if (resp.status === 204) {
                setSnackbarContent(`Enabled ${NOTIFICATION_NAMES[enabled[i]]} Notification`);
                setSnackbarSeverity("success");
            } else {
                setSnackbarContent(`Failed to enable ${NOTIFICATION_NAMES[enabled[i]]} Notification` + resp.data.error);
                setSnackbarSeverity("error");
                reloadNotificationSettings();
            }
        }
        for (let i = 0; i < disabled.length; i++) {
            let resp = await axios({ url: `${vars.dhpath}/user/notification/settings/${disabled[i]}/disable`, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
            if (resp.status === 204) {
                setSnackbarContent(`Disabled ${NOTIFICATION_NAMES[disabled[i]]} Notification`);
                setSnackbarSeverity("success");
            } else {
                setSnackbarContent(`Failed to disable ${NOTIFICATION_NAMES[disabled[i]]} Notification` + resp.data.error);
                setSnackbarSeverity("error");
                reloadNotificationSettings();
            }
        }

        const loadingEnd = new CustomEvent('loadingEnd', {});
        window.dispatchEvent(loadingEnd);
    }, [notificationSettings]);

    useEffect(() => {
        async function doLoad() {
            const [_notificationSettings] = await makeRequestsWithAuth([`${vars.dhpath}/user/notification/settings`]);
            let newNotificationSettings = [];
            for (let i = 0; i < NOTIFICATION_TYPES.length; i++) {
                if (_notificationSettings[NOTIFICATION_TYPES[i]]) {
                    newNotificationSettings.push({ value: NOTIFICATION_TYPES[i], label: NOTIFICATION_NAMES[NOTIFICATION_TYPES[i]] });
                }
            }
            setNotificationSettings(newNotificationSettings);
        }
        doLoad();
    }, []);

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
                <Grid item xs={12} sm={12} md={6} lg={6}>
                    <Typography variant="h7" sx={{ fontWeight: 80 }}>Distance Unit</Typography>
                    <br />
                    <ButtonGroup>
                        <Button variant="contained" color={userSettings.unit === "metric" ? "info" : "secondary"} onClick={() => { updateUnit("metric"); }}>Metric</Button>
                        <Button variant="contained" color={userSettings.unit === "imperial" ? "info" : "secondary"} onClick={() => { updateUnit("imperial"); }}>Imperial</Button>
                    </ButtonGroup>
                </Grid>

                <Grid item xs={12} sm={12} md={6} lg={6}>
                    <Typography variant="h7" sx={{ fontWeight: 80 }}>Theme</Typography>
                    <br />
                    <ButtonGroup>
                        <Button variant="contained" color={userSettings.theme === "auto" ? "info" : "secondary"} onClick={() => { updateTheme("auto"); }}>Auto (Device)</Button>
                        <Button variant="contained" color={userSettings.theme === "dark" ? "info" : "secondary"} onClick={() => { updateTheme("dark"); }}>Dark</Button>
                        <Button variant="contained" color={userSettings.theme === "light" ? "info" : "secondary"} onClick={() => { updateTheme("light"); }}>Light</Button>
                    </ButtonGroup>
                </Grid>

                <Grid item xs={12} sm={12} md={6} lg={6}>
                    <Typography variant="h7" sx={{ fontWeight: 80 }}>Notification Settings <IconButton size="small" aria-label="Edit" onClick={(e) => { reloadNotificationSettings(); }}><FontAwesomeIcon icon={faRefresh} /></IconButton ></Typography>
                    <br />
                    {notificationSettings !== null && <Select
                        defaultValue={notificationSettings}
                        isMulti
                        name="colors"
                        options={Object.keys(NOTIFICATION_NAMES)
                            .map((notification_type) => ({
                                value: notification_type,
                                label: NOTIFICATION_NAMES[notification_type]
                            }))}
                        className="basic-multi-select"
                        classNamePrefix="select"
                        styles={customStyles(theme)}
                        value={notificationSettings}
                        onChange={updateNotificationSettings}
                        menuPortalTarget={document.body}
                    />}
                    {notificationSettings === null && <Typography variant="body2">Loading...</Typography>}
                </Grid>
            </Grid>
        </TabPanel>
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
    </Card>;
};

export default Settings;