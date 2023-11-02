import React, { useState, useEffect, useCallback, memo } from 'react';
import { Card, Typography, Button, ButtonGroup, Box, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, InputLabel, Tabs, Tab, Collapse, IconButton, MenuItem } from '@mui/material';
import { ExpandMoreRounded } from '@mui/icons-material';
import { Portal } from '@mui/base';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { customSelectStyles } from '../designs';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faServer, faClockRotateLeft, faFingerprint, faDesktop, faPlus, faMinus, faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';

import { getRolePerms, customAxios as axios, makeRequestsAuto, getAuthToken } from '../functions';
import TimeAgo from '../components/timeago';
import { useTheme } from '@emotion/react';

const LANGUAGES = {
    'ar': 'Arabic (العربية)',
    'be': 'Belarusian (беларуская)',
    'bg': 'Bulgarian (български)',
    'cs': 'Czech (čeština)',
    'cy': 'Welsh (Cymraeg)',
    'da': 'Danish (dansk)',
    'de': 'German (Deutsch)',
    'el': 'Greek (Ελληνικά)',
    'en': 'English',
    'eo': 'Esperanto',
    'es': 'Spanish (Español)',
    'et': 'Estonian (eesti keel)',
    'fi': 'Finnish (suomi)',
    'fr': 'French (français)',
    'ga': 'Irish (Gaeilge)',
    'gd': 'Scottish (Gàidhlig)',
    'hu': 'Hungarian (magyar)',
    'hy': 'Armenian (Հայերեն)',
    'id': 'Indonesian (Bahasa Indonesia)',
    'is': 'Icelandic (íslenska)',
    'it': 'Italian (italiano)',
    'ja': 'Japanese (日本語)',
    'ko': 'Korean (한국어)',
    'lt': 'Lithuanian (lietuvių kalba)',
    'lv': 'Latvian (latviešu valoda)',
    'mk/sl': 'Macedonian/Slovenian (македонски/​slovenščina)',
    'mn': 'Mongolian (Монгол)',
    'mo': 'Moldavian (Moldova)',
    'ne': 'Nepali (नेपाली)',
    'nl': 'Dutch (Nederlands)',
    'nn': 'Norwegian (norsk nynorsk)',
    'pl': 'Polish (polski)',
    'pt': 'Portuguese (Português)',
    'ro': 'Romanian (română)',
    'ru': 'Russian (русский)',
    'sk': 'Slovak (slovenčina)',
    'sl': 'Slovenian (slovenščina)',
    'sq': 'Albanian (Shqip)',
    'sr': 'Serbian (српски)',
    'sv': 'Swedish (Svenska)',
    'th': 'Thai (ไทย)',
    'tr': 'Turkish (Türkçe)',
    'uk': 'Ukrainian (українська)',
    'vi': 'Vietnamese (Tiếng Việt)',
    'yi': 'Yiddish (ייִדיש)',
    'zh': 'Chinese (中文)'
};

const CONFIG_SECTIONS = { "general": ["name", "language", "distance_unit", "security_level", "privacy", "logo_url", "hex_color"], "profile": ["sync_discord_email", "must_join_guild", "use_server_nickname", "allow_custom_profile", "use_custom_activity", "avatar_domain_whitelist", "required_connections", "register_methods"], "tracker": ["trackers"], "dlog": ["delivery_rules", "hook_delivery_log", "delivery_webhook_image_urls"], "discord-steam": ["discord_guild_id", "discord_client_id", "discord_client_secret", "discord_bot_token", "steam_api_key"], "role": ["roles", "perms"] };

const CONFIG_SECTIONS_INDEX = { "general": 0, "profile": 1, "tracker": 2, "dlog": 3, "discord-steam": 4, "role": 5 };

const CONNECTION_NAME = { "email": "Email", "discord": "Discord", "steam": "Steam", "truckersmp": "TruckersMP" };

const REALISTIC_SETTINGS = ["bad_weather_factor", "detected", "detours", "fatigue", "fuel_simulation", "hardcore_simulation", "hub_speed_limit", "parking_difficulty", "police", "road_event", "show_game_blockers", "simple_parking_doubles", "traffic_enabled", "trailer_advanced_coupling"];

const ALL_PERMISSIONS = { "admin": "Administrator", "config": "Update Config", "reload_config": "Reload Config", "hrm": "Human Resources Manager", "disable_user_mfa": "Disable User MFA", "update_user_connections": "Update Connections", "delete_user": "Delete Users", "update_application_positions": "Update Application Positions", "delete_application": "Delete Applications", "import_dlog": "Import Delivery Logs", "delete_dlog": "Delete Delivery Logs", "delete_notifications": "Delete Notifications", "hr": "Human Resources", "manage_profile": "Manage User Profile", "get_user_global_note": "Get User Global Note", "update_user_global_note": "Update User Global Note", "get_sensitive_profile": "Get Sensitive Part of Profile", "get_privacy_protected_data": "Get Privacy Protected Data", "add_member": "Accept User as Member", "update_member_roles": "Update Member Roles", "update_member_points": "Update Member Points", "dismiss_member": "Dismiss Member", "get_pending_user_list": "Get External User List", "ban_user": "Ban User", "audit": "Read Audit Log", "economy_manager": "Economy Manager", "balance_manager": "Balance Manager", "truck_manager": "Truck Manager", "garage_manager": "Garage Manager", "merch_manager": "Merch Manager", "announcement": "Announcement Manager", "challenge": "Challenge Manager", "division": "Division Manager", "downloads": "Downloads Manager", "event": "Event Manager", "poll": "Poll Manager", "driver": "Driver" };

var vars = require("../variables");

function tabBtnProps(index, current, theme) {
    return {
        id: `config-tab-${index}`,
        'aria-controls': `config-tabpanel-${index}`,
        style: { color: current === index ? theme.palette.info.main : 'inherit' }
    };
}

function replaceUnderscores(str) {
    return str.split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`config-tabpanel-${index}`}
            aria-labelledby={`config-tab-${index}`}
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

const TrackerForm = ({ theme, tracker, onUpdate }) => {
    return <Grid container spacing={2} rowSpacing={-1} sx={{ mt: "5px", mb: "15px" }}>
        <Grid item xs={6} md={6}>
            <TextField select
                style={{ marginBottom: '16px' }}
                key="type"
                label="Type"
                variant="outlined"
                fullWidth
                value={tracker.type}
                onChange={(e) => { onUpdate({ ...tracker, type: e.target.value }); }}
            >
                <MenuItem key="trucky" value="trucky">
                    Trucky
                </MenuItem>
                <MenuItem key="tracksim" value="tracksim">
                    TrackSim
                </MenuItem>
            </TextField>
        </Grid>
        <Grid item xs={6} md={6}>
            <TextField
                style={{ marginBottom: '16px' }}
                key="company_id"
                label="Company ID"
                variant="outlined"
                fullWidth
                value={tracker.company_id}
                onChange={(e) => { onUpdate({ ...tracker, company_id: e.target.value }); }}
            />
        </Grid>
        <Grid item xs={12} md={6}>
            <TextField
                style={{ marginBottom: '16px' }}
                key="api_token"
                label="API Token"
                variant="outlined"
                fullWidth
                value={tracker.api_token}
                onChange={(e) => { onUpdate({ ...tracker, api_token: e.target.value }); }}
            />
        </Grid>
        <Grid item xs={12} md={6}>
            <TextField
                style={{ marginBottom: '16px' }}
                key="webhook_secret"
                label="Webhook Secret"
                variant="outlined"
                fullWidth
                value={tracker.webhook_secret}
                onChange={(e) => { onUpdate({ ...tracker, webhook_secret: e.target.value }); }}
            />
        </Grid>
        <Grid item xs={12} md={12}>
            <Typography variant="body2">Webhook IP Whitelist</Typography>
            <CreatableSelect
                isMulti
                name="colors"
                className="basic-multi-select"
                classNamePrefix="select"
                styles={customSelectStyles(theme)}
                value={tracker.ip_whitelist.map((ip) => ({ value: ip, label: ip }))}
                onChange={(newItems) => {
                    formConfig.setState({
                        ...tracker,
                        ip_whitelist: newItems.map((item) => (item.value)),
                    });
                }}
                menuPortalTarget={document.body}
            />
        </Grid>
    </Grid>;
};

const RoleForm = ({ theme, role, perms, onUpdate }) => {
    if (role.discord_role_id === undefined) role.discord_role_id = "";
    return <Grid container spacing={2} rowSpacing={-1} sx={{ mt: "5px", mb: "15px" }}>
        <Grid item xs={12} md={3}>
            <TextField size="small"
                style={{ marginBottom: '16px' }}
                key="name"
                label="Name"
                variant="outlined"
                fullWidth
                value={role.name}
                onChange={(e) => { onUpdate({ ...role, name: e.target.value }); }}
            />
        </Grid>
        <Grid item xs={12} md={9} sx={{ mt: "-20px" }}>
            <Typography variant="body2">Permissions</Typography>
            <CreatableSelect
                isMulti
                name="colors"
                className="basic-multi-select"
                classNamePrefix="select"
                styles={customSelectStyles(theme)}
                options={Object.keys(ALL_PERMISSIONS).map((perm) => ({ value: perm, label: ALL_PERMISSIONS[perm] !== undefined ? ALL_PERMISSIONS[perm] : perm }))}
                value={getRolePerms(role.id, perms).map((perm) => ({ value: perm, label: ALL_PERMISSIONS[perm] !== undefined ? ALL_PERMISSIONS[perm] : perm }))}
                onChange={(newItems) => {
                    let rolePerms = newItems.map((item) => (item.value));
                    let allPerms = Object.keys(perms);
                    let newPermsConfig = JSON.parse(JSON.stringify(perms));
                    // remove current role from all permissions
                    for (let i = 0; i < allPerms.length; i++) {
                        if (newPermsConfig[allPerms[i]].includes(role.id)) {
                            newPermsConfig[allPerms[i]].splice(newPermsConfig[allPerms[i]].indexOf(role.id), 1);
                        }
                    }
                    // add current role to relevant permissions
                    for (let i = 0; i < rolePerms.length; i++) {
                        newPermsConfig[rolePerms[i]].push(role.id);
                    }
                    onUpdate({ isPerms: true, newPerms: newPermsConfig });
                }}
                menuPortalTarget={document.body}
            />
        </Grid>
        <Grid item xs={6} md={3}>
            <TextField
                style={{ marginBottom: '16px' }}
                key="id"
                label="ID"
                variant="outlined"
                fullWidth
                value={role.id}
                disabled
            />
        </Grid>
        <Grid item xs={6} md={3}>
            <TextField
                style={{ marginBottom: '16px' }}
                key="order_id"
                label="Order ID"
                variant="outlined"
                fullWidth
                value={role.order_id}
                onChange={(e) => { if (!isNaN(e.target.value) || e.target.value === "-") onUpdate({ ...role, order_id: parseInt(e.target.value) }); }}
            />
        </Grid>
        <Grid item xs={12} md={3}>
            <TextField
                style={{ marginBottom: '16px' }}
                key="color"
                label="Color"
                variant="outlined"
                fullWidth
                value={role.color}
                onChange={(e) => { onUpdate({ ...role, color: e.target.value }); }}
            />
        </Grid>
        <Grid item xs={6} md={3}>
            <TextField
                style={{ marginBottom: '16px' }}
                key="discord_role_id"
                label="Discord Role ID"
                variant="outlined"
                fullWidth
                value={role.discord_role_id}
                onChange={(e) => { if (!isNaN(e.target.value)) onUpdate({ ...role, discord_role_id: e.target.value }); }}
            />
        </Grid>
    </Grid>;
};

const MemoGeneralForm = memo(({ theme, formConfig }) => {
    return <><Grid item xs={12} md={6}>
        <TextField
            style={{ marginBottom: '16px' }}
            key="name"
            label="Company Name"
            variant="outlined"
            fullWidth
            value={formConfig.state.name}
            onChange={(e) => { formConfig.setState({ ...formConfig.state, name: e.target.value }); }}
        />
    </Grid>
        <Grid item xs={6} md={3}>
            <TextField
                style={{ marginBottom: '16px' }}
                key="language"
                label="Language"
                variant="outlined"
                fullWidth
                value={formConfig.state.language}
                onChange={(e) => { formConfig.setState({ ...formConfig.state, language: e.target.value }); }}
                select
            >
                {vars.languages.map((language) => (
                    <MenuItem key={language} value={language}>
                        {LANGUAGES[language]}
                    </MenuItem>
                ))}
            </TextField>
        </Grid>
        <Grid item xs={6} md={3}>
            <TextField
                style={{ marginBottom: '16px' }}
                key="distance_unit"
                label="Distance Unit"
                variant="outlined"
                fullWidth
                value={formConfig.state.distance_unit}
                onChange={(e) => { formConfig.setState({ ...formConfig.state, distance_unit: e.target.value }); }}
                select
            >
                <MenuItem key="metric" value="metric">
                    Metric
                </MenuItem>
                <MenuItem key="imperial" value="imperial">
                    Imperial
                </MenuItem>
            </TextField>
        </Grid>
        <Grid item xs={12} md={6}>
            <TextField
                style={{ marginBottom: '16px' }}
                key="security_level"
                label="Security"
                variant="outlined"
                fullWidth
                value={formConfig.state.security_level}
                onChange={(e) => { formConfig.setState({ ...formConfig.state, security_level: e.target.value }); }}
                select
            >
                <MenuItem key="0" value={0}>
                    Regular - Session token doesn't revoke automatically
                </MenuItem>
                <MenuItem key="1" value={1}>
                    Strict - Session token revokes when IP country changes
                </MenuItem>
                <MenuItem key="2" value={2}>
                    Very Strict - Session token revokes when IP range changes
                </MenuItem>
            </TextField>
        </Grid>
        <Grid item xs={12} md={6}>
            <TextField
                style={{ marginBottom: '16px' }}
                key="privacy"
                label="Privacy"
                variant="outlined"
                fullWidth
                value={formConfig.state.privacy}
                onChange={(e) => { formConfig.setState({ ...formConfig.state, privacy: e.target.value }); }}
                select
            >
                <MenuItem key="false" value={false}>
                    User profile visible to everyone
                </MenuItem>
                <MenuItem key="true" value={true}>
                    User profile visible to only members
                </MenuItem>
            </TextField>
        </Grid>
        <Grid item xs={12} sm={9}>
            <TextField
                style={{ marginBottom: '16px' }}
                key="logo_url"
                label="Logo URL"
                variant="outlined"
                fullWidth
                value={formConfig.state.logo_url}
                onChange={(e) => { formConfig.setState({ ...formConfig.state, logo_url: e.target.value }); }}
            />
        </Grid>
        <Grid item xs={12} sm={3}>
            <TextField
                style={{ marginBottom: '16px' }}
                key="hex_color"
                label="Hex Color"
                variant="outlined"
                fullWidth
                value={formConfig.state.hex_color}
                onChange={(e) => { formConfig.setState({ ...formConfig.state, hex_color: e.target.value }); }}
            />
        </Grid>
    </>;
});

const MemoProfileForm = memo(({ theme, formConfig }) => {
    return <>
        <Grid item xs={6} md={4}>
            <TextField select
                style={{ marginBottom: '16px' }}
                key="sync_discord_email"
                label="Always sync user Discord email?"
                variant="outlined"
                fullWidth
                value={formConfig.state.sync_discord_email}
                onChange={(e) => { formConfig.setState({ ...formConfig.state, sync_discord_email: e.target.value }); }}
            >
                <MenuItem key={true} value={true}>
                    Enabled
                </MenuItem>
                <MenuItem key={false} value={false}>
                    Disabled
                </MenuItem>
            </TextField>
        </Grid>
        <Grid item xs={6} md={4}>
            <TextField select
                style={{ marginBottom: '16px' }}
                key="must_join_guild"
                label="User must join Discord server?"
                variant="outlined"
                fullWidth
                value={formConfig.state.must_join_guild}
                onChange={(e) => { formConfig.setState({ ...formConfig.state, must_join_guild: e.target.value }); }}
            >
                <MenuItem key={true} value={true}>
                    Enabled
                </MenuItem>
                <MenuItem key={false} value={false}>
                    Disabled
                </MenuItem>
            </TextField>
        </Grid>
        <Grid item xs={6} md={4}>
            <TextField select
                style={{ marginBottom: '16px' }}
                key="use_server_nickname"
                label="Use Discord server nickname?"
                variant="outlined"
                fullWidth
                value={formConfig.state.use_server_nickname}
                onChange={(e) => { formConfig.setState({ ...formConfig.state, use_server_nickname: e.target.value }); }}
            >
                <MenuItem key={true} value={true}>
                    Enabled
                </MenuItem>
                <MenuItem key={false} value={false}>
                    Disabled
                </MenuItem>
            </TextField>
        </Grid>
        <Grid item xs={6} md={6}>
            <TextField select
                style={{ marginBottom: '16px' }}
                key="allow_custom_profile"
                label="Enable custom profile?"
                variant="outlined"
                fullWidth
                value={formConfig.state.allow_custom_profile}
                onChange={(e) => { formConfig.setState({ ...formConfig.state, allow_custom_profile: e.target.value }); }}
            >
                <MenuItem key={true} value={true}>
                    Enabled
                </MenuItem>
                <MenuItem key={false} value={false}>
                    Disabled
                </MenuItem>
            </TextField>
        </Grid>
        <Grid item xs={6} md={6}>
            <TextField select
                style={{ marginBottom: '16px' }}
                key="use_custom_activity"
                label="Enable custom activity (*not supported)?"
                variant="outlined"
                fullWidth
                value={formConfig.state.use_custom_activity}
                onChange={(e) => { formConfig.setState({ ...formConfig.state, use_custom_activity: e.target.value }); }}
            >
                <MenuItem key={true} value={true}>
                    Enabled
                </MenuItem>
                <MenuItem key={false} value={false}>
                    Disabled
                </MenuItem>
            </TextField>
        </Grid>
        <Grid item xs={12} md={12} sx={{ pb: "15px" }}>
            <Typography variant="body2">Avatar Domain Whitelist</Typography>
            <CreatableSelect
                isMulti
                name="colors"
                className="basic-multi-select"
                classNamePrefix="select"
                styles={customSelectStyles(theme)}
                value={formConfig.state.avatar_domain_whitelist.map((domain) => ({ value: domain, label: domain }))}
                onChange={(newItems) => {
                    formConfig.setState({
                        ...formConfig.state,
                        avatar_domain_whitelist: newItems.map((item) => (item.value)),
                    });
                }}
                menuPortalTarget={document.body}
            />
        </Grid>
        <Grid item xs={12} md={6} sx={{ pb: "15px" }}>
            <Typography variant="body2">Required connections for new members</Typography>
            <Select
                isMulti
                name="colors"
                className="basic-multi-select"
                classNamePrefix="select"
                styles={customSelectStyles(theme)}
                options={Object.keys(CONNECTION_NAME).map((connection) => ({ value: connection, label: CONNECTION_NAME[connection] }))}
                value={formConfig.state.required_connections.map((connection) => ({ value: connection, label: CONNECTION_NAME[connection] }))}
                onChange={(newItems) => {
                    formConfig.setState({
                        ...formConfig.state,
                        required_connections: newItems.map((item) => (item.value)),
                    });
                }}
                menuPortalTarget={document.body}
            />
        </Grid>
        <Grid item xs={12} md={6} sx={{ pb: "15px" }}>
            <Typography variant="body2">Enabled registration methods</Typography>
            <Select
                isMulti
                name="colors"
                className="basic-multi-select"
                classNamePrefix="select"
                styles={customSelectStyles(theme)}
                options={Object.keys(CONNECTION_NAME).map((connection) => ({ value: connection, label: CONNECTION_NAME[connection] }))}
                value={formConfig.state.register_methods.map((connection) => ({ value: connection, label: CONNECTION_NAME[connection] }))}
                onChange={(newItems) => {
                    formConfig.setState({
                        ...formConfig.state,
                        connection: newItems.map((item) => (item.value)),
                    });
                }}
                menuPortalTarget={document.body}
            />
        </Grid>
    </>;
});

const MemoTrackerForm = memo(({ theme, formConfig }) => {
    return <>{formConfig.state.trackers.map((tracker, index) => (
        <>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" fontWeight="bold" sx={{ mb: "10px", flexGrow: 1 }}>
                    Tracker #{index + 1}
                </Typography>
                <div>
                    <IconButton variant="contained" color="success" onClick={() => {
                        let newTrackers = [...formConfig.state.trackers];
                        newTrackers.splice(index + 1, 0, { type: "trucky", company_id: "", api_token: "", webhook_secret: "", ip_whitelist: [] });
                        formConfig.setState({ ...formConfig.state, trackers: newTrackers });
                    }}><FontAwesomeIcon icon={faPlus} disabled={formConfig.state.trackers.length >= 10} /></IconButton>
                    <IconButton variant="contained" color="error" onClick={() => {
                        let newTrackers = [...formConfig.state.trackers];
                        newTrackers.splice(index, 1);
                        formConfig.setState({ ...formConfig.state, trackers: newTrackers });
                    }}><FontAwesomeIcon icon={faMinus} disabled={formConfig.state.trackers.length <= 1} /></IconButton>
                    <IconButton variant="contained" color="info" onClick={() => {
                        if (index >= 1) {
                            let newTrackers = [...formConfig.state.trackers];
                            newTrackers[index] = newTrackers[index - 1];
                            newTrackers[index - 1] = tracker;
                            formConfig.setState({ ...formConfig.state, trackers: newTrackers });
                        }
                    }}><FontAwesomeIcon icon={faArrowUp} disabled={index === 0} /></IconButton>
                    <IconButton variant="contained" color="warning" onClick={() => {
                        if (index <= formConfig.state.trackers.length - 2) {
                            let newTrackers = [...formConfig.state.trackers];
                            newTrackers[index] = newTrackers[index + 1];
                            newTrackers[index + 1] = tracker;
                            formConfig.setState({ ...formConfig.state, trackers: newTrackers });
                        }
                    }} disabled={index === formConfig.state.trackers.length} ><FontAwesomeIcon icon={faArrowDown} /></IconButton>
                </div>
            </div>
            <TrackerForm theme={theme} tracker={tracker} onUpdate={(newTracker) => {
                let newTrackers = [...formConfig.state.trackers];
                newTrackers[index] = newTracker;
                formConfig.setState({ ...formConfig.state, trackers: newTrackers });
            }} />
        </>
    ))
    }</>;
});

const MemoDlogForm = memo(({ theme, formConfig }) => {
    return <><Grid item xs={6} md={3}>
        <TextField
            style={{ marginBottom: '16px' }}
            key="max_speed"
            label="Max. Speed"
            variant="outlined"
            fullWidth
            value={formConfig.state.delivery_rules.max_speed}
            onChange={(e) => { if (!isNaN(e.target.value)) formConfig.setState({ ...formConfig.state, delivery_rules: { ...formConfig.state.delivery_rules, max_speed: e.target.value } }); }}
        />
    </Grid>
        <Grid item xs={6} md={3}>
            <TextField
                style={{ marginBottom: '16px' }}
                key="max_profit"
                label="Max. Profit"
                variant="outlined"
                fullWidth
                value={formConfig.state.delivery_rules.max_profit}
                onChange={(e) => { if (!isNaN(e.target.value)) formConfig.setState({ ...formConfig.state, delivery_rules: { ...formConfig.state.delivery_rules, max_profit: e.target.value } }); }}
            />
        </Grid>
        <Grid item xs={6} md={3}>
            <TextField
                style={{ marginBottom: '16px' }}
                key="max_xp"
                label="Max. XP"
                variant="outlined"
                fullWidth
                value={formConfig.state.delivery_rules.max_xp}
                onChange={(e) => { if (!isNaN(e.target.value)) formConfig.setState({ ...formConfig.state, delivery_rules: { ...formConfig.state.delivery_rules, max_xp: e.target.value } }); }}
            />
        </Grid>
        <Grid item xs={6} md={3}>
            <TextField
                style={{ marginBottom: '16px' }}
                key="max_warp"
                label="Max. Warp (0 for no-warp)"
                variant="outlined"
                fullWidth
                value={formConfig.state.delivery_rules.max_warp}
                onChange={(e) => { if (!isNaN(e.target.value)) formConfig.setState({ ...formConfig.state, delivery_rules: { ...formConfig.state.delivery_rules, max_warp: e.target.value } }); }}
            />
        </Grid>
        <Grid item xs={6} md={9}>
            <Typography variant="body2">Required Realistic Settings</Typography>
            <CreatableSelect
                isMulti
                name="colors"
                className="basic-multi-select"
                classNamePrefix="select"
                styles={customSelectStyles(theme)}
                options={REALISTIC_SETTINGS.map((attr) => ({ value: attr, label: replaceUnderscores(attr) }))}
                value={formConfig.state.delivery_rules.required_realistic_settings.map((attr) => ({ value: attr, label: replaceUnderscores(attr) }))}
                onChange={(newItems) => {
                    formConfig.setState({ ...formConfig.state, delivery_rules: { ...formConfig.state.delivery_rules, required_realistic_settings: newItems.map((item) => (item.value)) } });
                }}
                menuPortalTarget={document.body}
            />
        </Grid>
        <Grid item xs={6} md={3}>
            <TextField select size="small"
                key="action"
                label="Action"
                variant="outlined"
                fullWidth
                value={formConfig.state.delivery_rules.action}
                onChange={(e) => { formConfig.setState({ ...formConfig.state, delivery_rules: { ...formConfig.state.delivery_rules, action: e.target.value } }); }}
                sx={{ marginTop: "20px", marginBottom: "16px" }}
            >
                <MenuItem key="bypass" value="bypass">
                    Keep Job
                </MenuItem>
                <MenuItem key="drop" value="drop">
                    Drop Data
                </MenuItem>
                <MenuItem key="block" value="block">
                    Block Job
                </MenuItem>
            </TextField>
        </Grid>
        <Grid item xs={12} md={6}>
            <TextField
                style={{ marginBottom: '16px' }}
                key="hook_delivery_log_channel_id"
                label="Discord Channel ID"
                variant="outlined"
                fullWidth
                value={formConfig.state.hook_delivery_log.channel_id}
                onChange={(e) => { if (!isNaN(e.target.value)) formConfig.setState({ ...formConfig.state, hook_delivery_log: { ...formConfig.state.hook_delivery_log, channel_id: e.target.value } }); }}
            />
        </Grid>
        <Grid item xs={12} md={6}>
            <TextField
                style={{ marginBottom: '16px' }}
                key="hook_delivery_log_webhook"
                label="Discord Webhook (Alternative)"
                variant="outlined"
                fullWidth
                value={formConfig.state.hook_delivery_log.webhook}
                onChange={(e) => { formConfig.setState({ ...formConfig.state, hook_delivery_log: { ...formConfig.state.hook_delivery_log, webhook: e.target.value } }); }}
            />
        </Grid>
        <Grid item xs={12} md={12} sx={{ marginBottom: '16px' }}>
            <Typography variant="body2">Random Embed Images</Typography>
            <CreatableSelect
                isMulti
                name="colors"
                className="basic-multi-select"
                classNamePrefix="select"
                styles={customSelectStyles(theme)}
                value={formConfig.state.delivery_webhook_image_urls.map((url) => ({ value: url, label: url }))}
                onChange={(newItems) => {
                    formConfig.setState({
                        ...formConfig.state,
                        delivery_webhook_image_urls: newItems.map((item) => (item.value)),
                    });
                }}
                menuPortalTarget={document.body}
            />
        </Grid>
    </>;
});

const MemoDiscordSteamForm = memo(({ theme, formConfig }) => {
    return <>
        <Grid item xs={12} md={6}>
            <TextField
                style={{ marginBottom: '16px' }}
                key="discord_guild_id"
                label="Discord Server ID"
                variant="outlined"
                fullWidth
                value={formConfig.state.discord_guild_id}
                onChange={(e) => { if (!isNaN(e.target.value)) formConfig.setState({ ...formConfig.state, discord_guild_id: e.target.value }); }}
            />
        </Grid>
        <Grid item xs={12} md={6}>
            <TextField
                style={{ marginBottom: '16px' }}
                key="discord_client_id"
                label="Discord Client ID (Application ID)"
                variant="outlined"
                fullWidth
                value={formConfig.state.discord_client_id}
                onChange={(e) => { if (!isNaN(e.target.value)) formConfig.setState({ ...formConfig.state, discord_client_id: e.target.value }); }}
            />
        </Grid>
        <Grid item xs={12} md={6}>
            <TextField
                style={{ marginBottom: '16px' }}
                key="discord_client_secret"
                label="Discord Client Secret"
                variant="outlined"
                fullWidth
                value={formConfig.state.discord_client_secret}
                onChange={(e) => { if (!isNaN(e.target.value)) formConfig.setState({ ...formConfig.state, discord_client_secret: e.target.value }); }}
            />
        </Grid>
        <Grid item xs={12} md={6}>
            <TextField
                style={{ marginBottom: '16px' }}
                key="discord_bot_token"
                label="Discord Bot Token"
                variant="outlined"
                fullWidth
                value={formConfig.state.discord_bot_token}
                onChange={(e) => { formConfig.setState({ ...formConfig.state, discord_bot_token: e.target.value }); }}
            />
        </Grid>
        <Grid item xs={12} md={12}>
            <TextField
                style={{ marginBottom: '16px' }}
                key="steam_api_key"
                label="Steam API Key"
                variant="outlined"
                fullWidth
                value={formConfig.state.steam_api_key}
                onChange={(e) => { formConfig.setState({ ...formConfig.state, steam_api_key: e.target.value }); }}
            />
        </Grid>
    </>;
});

const MemoRoleForm = memo(({ theme, formConfig }) => {
    return <>{
        formConfig.state.roles.map((role, index) => (
            <>
                <div key={`role-form-div-${index}`} style={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" fontWeight="bold" sx={{ mb: "10px", flexGrow: 1, color: role.color }}>
                        {role.name}
                    </Typography>
                    <div key={`role-control-div-${index}`}>
                        <IconButton variant="contained" color="success" onClick={() => {
                            let newRoles = [...formConfig.state.roles];
                            let nextAvailableId = role.id + 1;
                            let allUsedIds = [];
                            for (let i = 0; i < formConfig.state.roles.length; i++) {
                                if (!isNaN(formConfig.state.roles[i].id)) {
                                    allUsedIds.push(Number(formConfig.state.roles[i].id));
                                }
                            }
                            allUsedIds = allUsedIds.sort((a, b) => a - b);
                            for (let i = 0; i < allUsedIds.length; i++) {
                                if (allUsedIds[i] > role.id) {
                                    if (allUsedIds[i] === nextAvailableId) {
                                        nextAvailableId += 1;
                                    } else {
                                        break;
                                    }
                                }
                            }
                            newRoles.splice(index + 1, 0, { id: nextAvailableId, order_id: role.order_id + 1, name: "", color: "" });
                            formConfig.setState({ ...formConfig.state, roles: newRoles });
                        }}><FontAwesomeIcon icon={faPlus} disabled={formConfig.state.roles.length >= 10} /></IconButton>
                        <IconButton variant="contained" color="error" onClick={() => {
                            let newRoles = [...formConfig.state.roles];
                            newRoles.splice(index, 1);
                            formConfig.setState({ ...formConfig.state, roles: newRoles });
                        }}><FontAwesomeIcon icon={faMinus} disabled={formConfig.state.roles.length <= 1} /></IconButton>
                        <IconButton variant="contained" color="info" onClick={() => {
                            if (index >= 1) {
                                let newRoles = [...formConfig.state.roles];
                                newRoles[index] = newRoles[index - 1];
                                newRoles[index - 1] = role;
                                formConfig.setState({ ...formConfig.state, roles: newRoles });
                            }
                        }}><FontAwesomeIcon icon={faArrowUp} disabled={index === 0} /></IconButton>
                        <IconButton variant="contained" color="warning" onClick={() => {
                            if (index <= formConfig.state.roles.length - 2) {
                                let newRoles = [...formConfig.state.roles];
                                newRoles[index] = newRoles[index + 1];
                                newRoles[index + 1] = role;
                                formConfig.setState({ ...formConfig.state, roles: newRoles });
                            }
                        }} disabled={index === formConfig.state.roles.length} ><FontAwesomeIcon icon={faArrowDown} /></IconButton>
                    </div>
                </div>
                <RoleForm key={`role-input-div-${index}`} theme={theme} role={role} perms={formConfig.state.perms} onUpdate={(item) => {
                    if (item.isPerms) {
                        formConfig.setState({ ...formConfig.state, perms: item.newPerms });
                        return;
                    }
                    let newRoles = [...formConfig.state.roles];
                    newRoles[index] = item;
                    formConfig.setState({ ...formConfig.state, roles: newRoles });
                }} />
            </>
        ))
    }</>;
});

const Configuration = () => {
    const theme = useTheme();
    const [snackbarContent, setSnackbarContent] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const handleCloseSnackbar = useCallback(() => {
        setSnackbarContent("");
    }, []);

    const [tab, setTab] = React.useState(0);
    const handleTabChange = (event, newValue) => {
        setTab(newValue);
    };

    // this could make animations show
    const [formSectionRender, setFormSectionRender] = useState(new Array(Object.keys(CONFIG_SECTIONS).length).fill(false));
    const [formSectionOpen, setFormSectionOpen] = useState(new Array(Object.keys(CONFIG_SECTIONS).length).fill(false));
    const handleFormToggle = (index) => {
        if (!formSectionRender[index]) {
            setFormSectionRender((prevStates) => {
                const newStates = [...prevStates];
                newStates[index] = !newStates[index];
                return newStates;
            });
            setTimeout(function () {
                setFormSectionOpen((prevStates) => {
                    const newStates = [...prevStates];
                    newStates[index] = !newStates[index];
                    return newStates;
                });
            }, 5);
        } else {
            setTimeout(function () {
                setFormSectionRender((prevStates) => {
                    const newStates = [...prevStates];
                    newStates[index] = !newStates[index];
                    return newStates;
                });
            }, 500);
            setFormSectionOpen((prevStates) => {
                const newStates = [...prevStates];
                newStates[index] = !newStates[index];
                return newStates;
            });
        }
    };

    const [mfaOtp, setMfaOtp] = useState("");

    const [webConfig, setWebConfig] = useState(vars.dhconfig);
    const [webConfigDisabled, setWebConfigDisabled] = useState(false);
    const saveWebConfig = useCallback(async () => {
        const loadingStart = new CustomEvent('loadingStart', {});
        window.dispatchEvent(loadingStart);
        setWebConfigDisabled(true);

        let resp = await axios({ url: `${vars.dhpath}/auth/ticket`, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status !== 200) {
            setWebConfigDisabled(false);
            const loadingEnd = new CustomEvent('loadingEnd', {});
            window.dispatchEvent(loadingEnd);
            setSnackbarContent(`Failed to generate auth ticket, try again later...`);
            setSnackbarSeverity("error");
            return;
        }
        let ticket = resp.data.token;

        resp = await axios({ url: `https://config.chub.page/config?domain=${vars.dhconfig.domain}`, data: { config: webConfig }, method: "PATCH", headers: { Authorization: `Ticket ${ticket}` } });
        if (resp.status === 204) {
            setSnackbarContent(`Web config updated!`);
            setSnackbarSeverity("success");
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }

        setWebConfigDisabled(false);
        const loadingEnd = new CustomEvent('loadingEnd', {});
        window.dispatchEvent(loadingEnd);
    }, [webConfig]);

    const [apiConfig, setApiConfig] = useState(null);
    const formConfig = Array.from({ length: Object.keys(CONFIG_SECTIONS).length }, () => {
        const [state, setState] = React.useState(null);
        return { state, setState };
    });
    const [formConfigReady, setFormConfigReady] = useState(false);
    const [apiBackup, setApiBackup] = useState(null);
    const [apiLastModify, setApiLastModify] = useState(0);
    const [apiConfigSelectionStart, setApiConfigSelectionStart] = useState(null);
    const [apiConfigDisabled, setApiConfigDisabled] = useState(false);

    const [reloadModalOpen, setReloadModalOpen] = useState(false);
    function handleCloseReloadModal() {
        setReloadModalOpen(false);
    }

    const saveApiConfig = useCallback(async () => {
        let config = {};
        try {
            config = JSON.parse(apiConfig);
        } catch (error) {
            if (error instanceof SyntaxError) {
                setSnackbarContent(`${error.message}`);
            } else {
                setSnackbarContent(error);
            }
            setSnackbarSeverity("error");
            return;
        }
        const secret_keys = ["discord_client_secret", "discord_bot_token", "steam_api_key", "smtp_port", "smtp_passwd"];
        for (let i = 0; i < secret_keys.length; i++) {
            if (config[secret_keys[i]] === "") delete config[secret_keys[i]];
        }
        let doDeleteTracker = false;
        if (config["trackers"]) {
            for (let i = 0; i < config["trackers"].length; i++) {
                if (config["trackers"][i]["api_token"] === "" || config["trackers"][i]["webhook_secret"] === "") {
                    doDeleteTracker = true;
                }
            }
            if (doDeleteTracker) {
                delete config["trackers"];
            }
        }

        const loadingStart = new CustomEvent('loadingStart', {});
        window.dispatchEvent(loadingStart);
        setApiConfigDisabled(true);

        let resp = await axios({ url: `${vars.dhpath}/config`, method: "PATCH", data: { config: config }, headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            setSnackbarContent(`API config updated! Remember to reload to make changes take effect!`);
            setSnackbarSeverity("success");
            setApiLastModify(+new Date() / 1000);
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }

        setApiConfigDisabled(false);
        const loadingEnd = new CustomEvent('loadingEnd', {});
        window.dispatchEvent(loadingEnd);
    }, [apiConfig]);
    const showReloadApiConfig = useCallback(async () => {
        if (vars.userInfo.mfa === false) {
            setSnackbarContent(`Rejected: You must enable MFA before reloading config!`);
            setSnackbarSeverity("error");
            return;
        }
        setReloadModalOpen(true);
    }, []);
    const reloadApiConfig = useCallback(async () => {
        let otp = mfaOtp.replace(" ", "");
        if (isNaN(otp) || otp.length !== 6) {
            setSnackbarContent(`Invalid MFA OTP!`);
            setSnackbarSeverity("error");
            return;
        }
        setApiConfigDisabled(true);
        let resp = await axios({ url: `${vars.dhpath}/config/reload`, method: "POST", data: { otp: otp }, headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            setSnackbarContent(`Config reloaded!`);
            setSnackbarSeverity("success");
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setApiConfigDisabled(false);
        setReloadModalOpen(false);
    }, [mfaOtp]);
    const enableDiscordRoleConnection = useCallback(async () => {
        setApiConfigDisabled(true);
        let resp = await axios({ url: `${vars.dhpath}/discord/role-connection/enable`, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            setSnackbarContent(`Success!`);
            setSnackbarSeverity("success");
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setApiConfigDisabled(false);
    }, []);
    const disableDiscordRoleConnection = useCallback(async () => {
        setApiConfigDisabled(true);
        let resp = await axios({ url: `${vars.dhpath}/discord/role-connection/disable`, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            setSnackbarContent(`Success!`);
            setSnackbarSeverity("success");
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setApiConfigDisabled(false);
    }, []);

    useEffect(() => {
        async function doLoad() {
            const loadingStart = new CustomEvent('loadingStart', {});
            window.dispatchEvent(loadingStart);

            const [_apiConfig] = await makeRequestsAuto([
                { url: `${vars.dhpath}/config`, auth: true },
            ]);

            if (_apiConfig.config.delivery_rules.required_realistic_settings === undefined) {
                _apiConfig.config.delivery_rules.required_realistic_settings = [];
            }
            setApiConfig(JSON.stringify(_apiConfig.config, null, 4));

            let sections = Object.keys(CONFIG_SECTIONS);
            for (let i = 0; i < sections.length; i++) {
                let partialConfig = {};
                let section_keys = CONFIG_SECTIONS[sections[i]];
                for (let j = 0; j < section_keys.length; j++) {
                    partialConfig[section_keys[j]] = _apiConfig.config[section_keys[j]];
                }
                formConfig[i].setState(partialConfig);
            }
            setFormConfigReady(true);
            setApiBackup(JSON.stringify(_apiConfig.backup, null, 4));
            setApiLastModify(_apiConfig.config_last_modified);

            const loadingEnd = new CustomEvent('loadingEnd', {});
            window.dispatchEvent(loadingEnd);
        }
        doLoad();
    }, []);

    const saveFormConfig = useCallback(async (section) => {
        let config = formConfig[CONFIG_SECTIONS_INDEX[section]].state;
        let configKeys = Object.keys(config);
        for (let i = 0; i < configKeys.length; i++) {
            if (config[configKeys[i]] === "") {
                delete config[configKeys[i]];
            }
        }

        const loadingStart = new CustomEvent('loadingStart', {});
        window.dispatchEvent(loadingStart);
        setApiConfigDisabled(true);

        let resp = await axios({ url: `${vars.dhpath}/config`, method: "PATCH", data: { config: config }, headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            setSnackbarContent(`API config updated! Remember to reload to make changes take effect!`);
            setSnackbarSeverity("success");
            setApiLastModify(+new Date() / 1000);
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }

        setApiConfigDisabled(false);
        const loadingEnd = new CustomEvent('loadingEnd', {});
        window.dispatchEvent(loadingEnd);
    }, [formConfig]);

    return (<>
        <Card>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs value={tab} onChange={handleTabChange} aria-label="map tabs" color="info" TabIndicatorProps={{ style: { backgroundColor: theme.palette.info.main } }}>
                    <Tab label={<><FontAwesomeIcon icon={faServer} />API (Form)</>} {...tabBtnProps(0, tab, theme)} />
                    <Tab label={<><FontAwesomeIcon icon={faServer} />API (JSON)</>} {...tabBtnProps(1, tab, theme)} />
                    <Tab label={<><FontAwesomeIcon icon={faDesktop} />Web</>} {...tabBtnProps(2, tab, theme)} />
                </Tabs>
            </Box>
            <TabPanel value={tab} index={0}>
                <Typography variant="body2" component="div" sx={{ mt: "5px" }}>
                    - This is the simple mode of config editing with Form.
                    <br />
                    - You must reload config after saving to make it take effect.
                    <br />
                    - API Config does not directly affect Web Config which controls company name, color, logo and banner on Drivers Hub.
                    <br />
                    <br />
                    {formConfigReady &&
                        <>
                            <Typography variant="h6" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleFormToggle(0)}>
                                <div style={{ flexGrow: 1 }}>General</div>
                                <IconButton style={{ transition: 'transform 0.2s', transform: formSectionOpen[0] ? 'rotate(180deg)' : 'none' }}>
                                    <ExpandMoreRounded />
                                </IconButton>
                            </Typography>
                            {formSectionRender[0] && <Collapse in={formSectionOpen[0]}>
                                <Grid container spacing={2} rowSpacing={-1} sx={{ mt: "5px" }}>
                                    <MemoGeneralForm theme={theme} formConfig={formConfig[0]} />
                                    <Grid item xs={12}>
                                        <Grid container>
                                            <Grid item xs={0} sm={6} md={8} lg={10}></Grid>
                                            <Grid item xs={12} sm={6} md={4} lg={2}>
                                                <Button variant="contained" color="success" onClick={() => { saveFormConfig("general"); }} fullWidth disabled={apiConfigDisabled}>Save</Button>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Collapse>}

                            <Typography variant="h6" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleFormToggle(1)}>
                                <div style={{ flexGrow: 1 }}>Account & Profile</div>
                                <IconButton style={{ transition: 'transform 0.2s', transform: formSectionOpen[0] ? 'rotate(180deg)' : 'none' }}>
                                    <ExpandMoreRounded />
                                </IconButton>
                            </Typography>
                            {formSectionRender[1] && <Collapse in={formSectionOpen[1]}>
                                <Grid container spacing={2} rowSpacing={-1} sx={{ mt: "5px" }}>
                                    <MemoProfileForm theme={theme} formConfig={formConfig[1]} />
                                    <Grid item xs={12}>
                                        <Grid container>
                                            <Grid item xs={0} sm={6} md={8} lg={10}></Grid>
                                            <Grid item xs={12} sm={6} md={4} lg={2}>
                                                <Button variant="contained" color="success" onClick={() => { saveFormConfig("profile"); }} fullWidth disabled={apiConfigDisabled}>Save</Button>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Collapse>}

                            <Typography variant="h6" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleFormToggle(2)}>
                                <div style={{ flexGrow: 1 }}>Tracker</div>
                                <IconButton style={{ transition: 'transform 0.2s', transform: formSectionOpen[0] ? 'rotate(180deg)' : 'none' }}>
                                    <ExpandMoreRounded />
                                </IconButton>
                            </Typography>
                            {formSectionRender[2] && <Collapse in={formSectionOpen[2]}>
                                <Typography variant="body2" sx={{ mb: "10px" }}>
                                    NOTE: API Token & Webhook Secret attributes are shown empty for security purpose. They should be saved server-end.<br />
                                    If you want to update tracker config, you must fill all the empty fields. Hence, it's recommended to store relevant data elsewhere securely for easier config modification.
                                </Typography>
                                <MemoTrackerForm theme={theme} formConfig={formConfig[2]} />
                                <Grid item xs={12}>
                                    <Grid container>
                                        <Grid item xs={0} sm={6} md={8} lg={10}></Grid>
                                        <Grid item xs={12} sm={6} md={4} lg={2}>
                                            <Button variant="contained" color="success" onClick={() => { saveFormConfig("tracker"); }} fullWidth disabled={apiConfigDisabled}>Save</Button>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Collapse>}

                            <Typography variant="h6" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleFormToggle(3)}>
                                <div style={{ flexGrow: 1 }}>Job Logging</div>
                                <IconButton style={{ transition: 'transform 0.2s', transform: formSectionOpen[0] ? 'rotate(180deg)' : 'none' }}>
                                    <ExpandMoreRounded />
                                </IconButton>
                            </Typography>
                            {formSectionRender[3] && <Collapse in={formSectionOpen[3]}>
                                <Typography variant="body2" sx={{ mb: "15px" }}>
                                    NOTE: Max. Warp and Required Realistic Settings are only available when Trucky is used as tracker. They will be not be considered when the job is not logged by Trucky.
                                </Typography>
                                <Grid container spacing={2} rowSpacing={-1} sx={{ mt: "5px" }}>
                                    <MemoDlogForm theme={theme} formConfig={formConfig[3]} />
                                    <Grid item xs={12}>
                                        <Grid container>
                                            <Grid item xs={0} sm={6} md={8} lg={10}></Grid>
                                            <Grid item xs={12} sm={6} md={4} lg={2}>
                                                <Button variant="contained" color="success" onClick={() => { saveFormConfig("dlog"); }} fullWidth disabled={apiConfigDisabled}>Save</Button>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Collapse>}

                            <Typography variant="h6" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleFormToggle(4)}>
                                <div style={{ flexGrow: 1 }}>Discord & Steam API</div>
                                <IconButton style={{ transition: 'transform 0.2s', transform: formSectionOpen[0] ? 'rotate(180deg)' : 'none' }}>
                                    <ExpandMoreRounded />
                                </IconButton>
                            </Typography>
                            {formSectionRender[4] && <Collapse in={formSectionOpen[4]}>
                                <Typography variant="body2" sx={{ mb: "15px" }}>
                                    NOTE: Discord Client Secret, Discord Bot Token, Steam API Key are shown empty for security purpose. They should be saved server-end.<br />
                                    HINT: Discord Server ID is your VTC's Discord Server's ID, Discord Client ID (Application ID) is the ID for the application you created on Discord Developers Portal, they are NOT your own user ID.
                                </Typography>
                                <Grid container spacing={2} rowSpacing={-1} sx={{ mt: "5px" }}>
                                    <MemoDiscordSteamForm theme={theme} formConfig={formConfig[4]} />
                                    <Grid item xs={12}>
                                        <Grid container>
                                            <Grid item xs={0} sm={6} md={8} lg={10}></Grid>
                                            <Grid item xs={12} sm={6} md={4} lg={2}>
                                                <Button variant="contained" color="success" onClick={() => { saveFormConfig("discord-steam"); }} fullWidth disabled={apiConfigDisabled}>Save</Button>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Collapse>}

                            <Typography variant="h6" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleFormToggle(5)}>
                                <div style={{ flexGrow: 1 }}>Roles</div>
                                <IconButton style={{ transition: 'transform 0.2s', transform: formSectionOpen[0] ? 'rotate(180deg)' : 'none' }}>
                                    <ExpandMoreRounded />
                                </IconButton>
                            </Typography>
                            {formSectionRender[5] && <Collapse in={formSectionOpen[5]}>
                                <Typography variant="body2" sx={{ mb: "15px" }}>
                                    NOTE: ID, Order ID must be integer. Smaller Order ID means higher role. Discord Role ID can be used to sync roles of members in Drivers Hub to Discord.<br />
                                    NOTE: You must use JSON Editor to change role ID. Changing role ID could lead to members with the role lose it before their role is updated.
                                </Typography>
                                <MemoRoleForm theme={theme} formConfig={formConfig[5]} />
                                <Grid item xs={12}>
                                    <Grid container>
                                        <Grid item xs={0} sm={6} md={8} lg={10}></Grid>
                                        <Grid item xs={12} sm={6} md={4} lg={2}>
                                            <Button variant="contained" color="success" onClick={() => { saveFormConfig("role"); }} fullWidth disabled={apiConfigDisabled}>Save</Button>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Collapse>}
                        </>}
                </Typography>
            </TabPanel>
            <TabPanel value={tab} index={1}>
                <Typography variant="body2" component="div" sx={{ mt: "5px" }}>
                    - This is the advanced mode of config editing with JSON.
                    <br />
                    - You must reload config after saving to make it take effect.
                    <br />
                    - API Config does not directly affect Web Config which controls company name, color, logo and banner on Drivers Hub.
                    <br />
                    <br />
                    <FontAwesomeIcon icon={faClockRotateLeft} /> Last Modified: <TimeAgo key={apiLastModify} timestamp={apiLastModify * 1000} />
                </Typography>
                {apiConfig !== null && <div sx={{ position: "relative" }}>
                    <TextField
                        label="JSON Config"
                        value={apiConfig}
                        onChange={(e) => { setApiConfig(e.target.value); setApiConfigSelectionStart(e.target.selectionStart); }}
                        onClick={(e) => { setApiConfigSelectionStart(e.target.selectionStart); }}
                        fullWidth rows={20} maxRows={20} multiline
                        sx={{ mt: "8px" }} placeholder={`{...}`}
                        spellCheck={false}
                    />
                    {apiConfigSelectionStart !== null && !isNaN(apiConfigSelectionStart - apiConfig.lastIndexOf('\n', apiConfigSelectionStart - 1)) && <InputLabel sx={{ color: theme.palette.text.secondary, fontSize: "12px", mb: "8px" }}>
                        Line {apiConfig.substr(0, apiConfigSelectionStart).split('\n').length}, Column {apiConfigSelectionStart - apiConfig.lastIndexOf('\n', apiConfigSelectionStart - 1)}
                    </InputLabel>}
                </div>}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'grid', justifyItems: 'start' }}>
                        <ButtonGroup sx={{ mt: "5px" }} disabled={apiConfigDisabled}>
                            <Button variant="contained" color="success" onClick={() => { enableDiscordRoleConnection(); }}>Enable</Button>
                            <Button variant="contained" color="error" onClick={() => { disableDiscordRoleConnection(); }}>Disable</Button>
                            <Button variant="contained" color="secondary">Discord Role Connection</Button>
                        </ButtonGroup>
                    </Box>
                    <Box sx={{ display: 'grid', justifyItems: 'end' }}>
                        <ButtonGroup sx={{ mt: "5px" }} disabled={apiConfigDisabled}>
                            <Button variant="contained" color="secondary" onClick={() => { setApiConfig(apiBackup); }}>Revert</Button>
                            <Button variant="contained" color="success" onClick={() => { saveApiConfig(); }}>Save</Button>
                            <Button variant="contained" color="error" onClick={() => { showReloadApiConfig(); }}>Reload</Button>
                        </ButtonGroup>
                    </Box>
                </div>
            </TabPanel>
            <TabPanel value={tab} index={2}>
                <Typography variant="body2" component="div" sx={{ mt: "5px" }}>
                    - Web config does not affect company name, color and logo attributes in API Config.
                    <br />
                    <br />
                    - A valid URL must be provided to download logo or banner from if you want to update them.
                    <br />
                    - Logo and banner must be smaller than 2MB in size.
                </Typography>
                <Grid container spacing={2} sx={{ mt: "5px" }}>
                    <Grid item xs={12} sm={12} md={6} lg={6}>
                        <TextField
                            label="Company Name"
                            value={webConfig.name}
                            onChange={(e) => { setWebConfig({ ...webConfig, name: e.target.value }); }}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={12} md={6} lg={6}>
                        <TextField
                            label="Theme Color"
                            value={webConfig.color}
                            onChange={(e) => { setWebConfig({ ...webConfig, color: e.target.value }); }}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={12} md={6} lg={6}>
                        <TextField
                            label="Logo Download URL"
                            value={webConfig.logo_url}
                            onChange={(e) => { setWebConfig({ ...webConfig, logo_url: e.target.value }); }}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={12} md={6} lg={6}>
                        <TextField
                            label="Banner Download URL"
                            value={webConfig.banner_url}
                            onChange={(e) => { setWebConfig({ ...webConfig, banner_url: e.target.value }); }}
                            fullWidth
                        />
                    </Grid>
                </Grid>
                <Box sx={{ display: 'grid', justifyItems: 'end' }}>
                    <ButtonGroup sx={{ mt: "5px" }}>
                        <Button variant="contained" color="success" onClick={() => { saveWebConfig(); }} disabled={webConfigDisabled}>Save</Button>
                    </ButtonGroup>
                </Box>
            </TabPanel>
        </Card >
        <Dialog open={reloadModalOpen} onClose={handleCloseReloadModal}>
            <DialogTitle>
                <Typography variant="h6" sx={{ flexGrow: 1, display: 'flex', alignItems: "center" }}>
                    <FontAwesomeIcon icon={faFingerprint} />&nbsp;&nbsp;Attention Required
                </Typography>
            </DialogTitle>
            <DialogContent>
                <Typography variant="body2">For security purposes, you must prove your identity with Multiple Factor Authentication.</Typography>
                <TextField
                    sx={{ mt: "15px" }}
                    label="MFA OTP"
                    value={mfaOtp}
                    onChange={(e) => setMfaOtp(e.target.value)}
                    fullWidth
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseReloadModal} variant="contained" color="secondary" sx={{ ml: 'auto' }}>
                    Close
                </Button>
                <Button onClick={reloadApiConfig} variant="contained" color="success" sx={{ ml: 'auto' }}>
                    Verify
                </Button>
            </DialogActions>
        </Dialog>
        <Portal>
            <Snackbar
                open={!!snackbarContent}
                autoHideDuration={5000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
                    {snackbarContent}
                </Alert>
            </Snackbar>
        </Portal>
    </>
    );
};

export default Configuration;