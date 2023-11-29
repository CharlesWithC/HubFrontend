import React, { useState, useEffect, useCallback, memo } from 'react';
import { Card, Typography, Button, ButtonGroup, Box, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, InputLabel, Tabs, Tab, Collapse, IconButton, MenuItem, Checkbox, FormControlLabel, Slider, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';
import { ExpandMoreRounded } from '@mui/icons-material';
import { Portal } from '@mui/base';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { customSelectStyles } from '../designs';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faServer, faClockRotateLeft, faFingerprint, faDesktop, faPlus, faMinus, faArrowUp, faArrowDown, faWrench, faFileImport, faFileExport } from '@fortawesome/free-solid-svg-icons';

import { getRolePerms, customAxios as axios, makeRequestsAuto, getAuthToken } from '../functions';
import TimeAgo from '../components/timeago';
import ColorInput from '../components/colorInput';
import SponsorBadge from '../components/sponsorBadge';
import RoleSelect from '../components/roleselect';
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

const CONFIG_SECTIONS = {
    "general": ["name", "language", "distance_unit", "security_level", "privacy", "logo_url", "hex_color", "hook_audit_log"], "profile": ["sync_discord_email", "must_join_guild", "use_server_nickname", "allow_custom_profile", "use_custom_activity", "avatar_domain_whitelist", "required_connections", "register_methods"], "tracker": ["trackers"], "dlog": ["delivery_rules", "hook_delivery_log", "delivery_webhook_image_urls"], "discord-steam": ["discord_guild_id", "discord_client_id", "discord_client_secret", "discord_bot_token", "steam_api_key"], "role": ["roles", "perms"], "smtp": ["smtp_host", "smtp_port", "smtp_email", "smtp_password", "email_template"], "rank": ["rank_types"], "announcement": ["announcement_types"], "application": ["application_types"], "division": ["divisions"], "discord-member": ["member_accept", "member_leave", "driver_role_add", "driver_role_remove", "rank_up"], "discord-other": ["announcement_forwarding", "challenge_forwarding", "challenge_completed_forwarding", "downloads_forwarding", "event_forwarding", "event_upcoming_forwarding", "poll_forwarding"], "economy": ["economy"]
};

const CONFIG_SECTIONS_INDEX = { "general": 0, "profile": 1, "tracker": 2, "dlog": 3, "discord-steam": 4, "role": 5, "rank": 7, "smtp": 6, "announcement": 8, "division": 9, "application": 10, "discord-member": 11, "discord-other": 12, "economy": 13 };

const CONNECTION_NAME = { "email": "Email", "discord": "Discord", "steam": "Steam", "truckersmp": "TruckersMP" };

const REALISTIC_SETTINGS = ["bad_weather_factor", "detected", "detours", "fatigue", "fuel_simulation", "hardcore_simulation", "hub_speed_limit", "parking_difficulty", "police", "road_event", "show_game_blockers", "simple_parking_doubles", "traffic_enabled", "trailer_advanced_coupling"];

var vars = require("../variables");

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

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
        <Grid item xs={12} md={6}>
            <TextField
                style={{ marginBottom: '16px' }}
                key="hook_audit_log_channel_id"
                label="Audit Log Discord Channel ID"
                variant="outlined"
                fullWidth
                value={formConfig.state.hook_audit_log.channel_id}
                onChange={(e) => { if (!isNaN(e.target.value)) formConfig.setState({ ...formConfig.state, hook_audit_log: { ...formConfig.state.hook_audit_log, channel_id: e.target.value } }); }}
            />
        </Grid>
        <Grid item xs={12} md={6}>
            <TextField
                style={{ marginBottom: '16px' }}
                key="hook_audit_log_webhook"
                label="Audit Log Discord Webhook (Alternative)"
                variant="outlined"
                fullWidth
                value={formConfig.state.hook_audit_log.webhook_url}
                onChange={(e) => { formConfig.setState({ ...formConfig.state, hook_audit_log: { ...formConfig.state.hook_audit_log, webhook_url: e.target.value } }); }}
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

const MemoTrackerForm = memo(({ theme, formConfig }) => {
    return <>{formConfig.state.trackers.length === 0 &&
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" fontWeight="bold" sx={{ mb: "10px", flexGrow: 1 }}>
                No Tracker - Create + to create one
            </Typography>
            <IconButton variant="contained" color="success" onClick={() => {
                let newTrackers = [{ type: "trucky", company_id: "", api_token: "", webhook_secret: "", ip_whitelist: [] }];
                formConfig.setState({ ...formConfig.state, trackers: newTrackers });
            }}><FontAwesomeIcon icon={faPlus} /></IconButton>
        </div>}
        {formConfig.state.trackers.map((tracker, index) => (<>
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
                value={formConfig.state.hook_delivery_log.webhook_url}
                onChange={(e) => { formConfig.setState({ ...formConfig.state, hook_delivery_log: { ...formConfig.state.hook_delivery_log, webhook_url: e.target.value } }); }}
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
                options={Object.keys(vars.perms).map((perm) => ({ value: perm, label: replaceUnderscores(perm) }))}
                value={getRolePerms(role.id, perms).map((perm) => ({ value: perm, label: replaceUnderscores(perm) }))}
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
                        if (newPermsConfig[rolePerms[i]] === undefined) {
                            newPermsConfig[rolePerms[i]] = [];
                        }
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

const MemoRoleForm = memo(({ theme, formConfig }) => {
    const [openIndex, setOpenIndex] = useState(-1);

    if (formConfig.state.roles.length === 0) {
        return <div style={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" fontWeight="bold" sx={{ mb: "10px", flexGrow: 1 }}>
                No Roles - Create + to create one
            </Typography>
            <IconButton variant="contained" color="success" onClick={() => {
                let newRoles = [{ id: 1, order_id: 1, name: "New Role", color: "" }];
                formConfig.setState({ ...formConfig.state, roles: newRoles });
            }}><FontAwesomeIcon icon={faPlus} /></IconButton>
        </div>;
    };
    const RoleItem = memo(({ role, index }) => {
        return <>
            <div key={`role-form-div-${index}`} style={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', mb: "10px", flexGrow: 1, color: role.color }} onClick={() => openIndex === index ? setOpenIndex(-1) : setOpenIndex(index)}>
                    {role.name}
                </Typography>
                <div key={`role-control-div-${index}`}>
                    <IconButton style={{ transition: 'transform 0.2s', transform: openIndex === index ? 'rotate(180deg)' : 'none' }} onClick={() => setOpenIndex(index)}>
                        <ExpandMoreRounded />
                    </IconButton>
                    <IconButton variant="contained" color="success" onClick={() => {
                        let newRoles = [...formConfig.state.roles];
                        let nextId = role.id + 1;
                        let allUsedIds = [];
                        for (let i = 0; i < formConfig.state.roles.length; i++) {
                            if (!isNaN(formConfig.state.roles[i].id)) {
                                allUsedIds.push(Number(formConfig.state.roles[i].id));
                            }
                        }
                        allUsedIds = allUsedIds.sort((a, b) => a - b);
                        for (let i = 0; i < allUsedIds.length; i++) {
                            if (allUsedIds[i] > role.id) {
                                if (allUsedIds[i] === nextId) {
                                    nextId += 1;
                                } else {
                                    break;
                                }
                            }
                        }
                        setOpenIndex(index + 1);
                        newRoles.splice(index + 1, 0, { id: nextId, order_id: role.order_id + 1, name: "New Role", color: "" });
                        formConfig.setState({ ...formConfig.state, roles: newRoles });
                    }}><FontAwesomeIcon icon={faPlus} disabled={formConfig.state.roles.length} /></IconButton>
                    <IconButton variant="contained" color="error" onClick={() => {
                        let newRoles = [...formConfig.state.roles];
                        newRoles.splice(index, 1);
                        formConfig.setState({ ...formConfig.state, roles: newRoles });
                        setOpenIndex(-1);
                    }}><FontAwesomeIcon icon={faMinus} disabled={formConfig.state.roles.length <= 1} /></IconButton>
                    <IconButton variant="contained" color="info" onClick={() => {
                        if (index >= 1) {
                            let newRoles = [...formConfig.state.roles];
                            newRoles[index] = newRoles[index - 1];
                            newRoles[index - 1] = role;
                            formConfig.setState({ ...formConfig.state, roles: newRoles });
                            if (openIndex === index) setOpenIndex(index - 1);
                        }
                    }}><FontAwesomeIcon icon={faArrowUp} disabled={index === 0} /></IconButton>
                    <IconButton variant="contained" color="warning" onClick={() => {
                        if (index <= formConfig.state.roles.length - 2) {
                            let newRoles = [...formConfig.state.roles];
                            newRoles[index] = newRoles[index + 1];
                            newRoles[index + 1] = role;
                            formConfig.setState({ ...formConfig.state, roles: newRoles });
                            if (openIndex === index) setOpenIndex(index + 1);
                        }
                    }} disabled={index === formConfig.state.roles.length} ><FontAwesomeIcon icon={faArrowDown} /></IconButton>
                </div>
            </div>
        </>;
    });
    const BeforeOpen = memo(({ openIndex }) =>
        (<>{formConfig.state.roles.map((role, index) => ((index < openIndex || openIndex === -1) && <RoleItem role={role} index={index} />))}</>)
    );
    const AfterOpen = memo(({ openIndex }) =>
        (<>{formConfig.state.roles.map((role, index) => ((index > openIndex && openIndex !== -1) && <RoleItem role={role} index={index} />))}</>)
    );
    let role = formConfig.state.roles[openIndex];
    let index = openIndex;
    return <>
        {(openIndex > 0 || openIndex === -1) && <BeforeOpen openIndex={openIndex} />}
        {openIndex !== -1 && <>
            <div key={`role-form-div-${index}`} style={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', mb: "10px", flexGrow: 1, color: role.color }} onClick={() => openIndex === index ? setOpenIndex(-1) : setOpenIndex(index)}>
                    {role.name}
                </Typography>
                <div key={`role-control-div-${index}`}>
                    <IconButton style={{ transition: 'transform 0.2s', transform: openIndex === index ? 'rotate(180deg)' : 'none' }} onClick={() => setOpenIndex(index)}>
                        <ExpandMoreRounded />
                    </IconButton>
                    <IconButton variant="contained" color="success" onClick={(e) => {
                        let newRoles = [...formConfig.state.roles];
                        let nextId = role.id + 1;
                        let allUsedIds = [];
                        for (let i = 0; i < formConfig.state.roles.length; i++) {
                            if (!isNaN(formConfig.state.roles[i].id)) {
                                allUsedIds.push(Number(formConfig.state.roles[i].id));
                            }
                        }
                        allUsedIds = allUsedIds.sort((a, b) => a - b);
                        for (let i = 0; i < allUsedIds.length; i++) {
                            if (allUsedIds[i] > role.id) {
                                if (allUsedIds[i] === nextId) {
                                    nextId += 1;
                                } else {
                                    break;
                                }
                            }
                        }
                        setOpenIndex(index + 1);
                        newRoles.splice(index + 1, 0, { id: nextId, order_id: role.order_id + 1, name: "", color: "" });
                        formConfig.setState({ ...formConfig.state, roles: newRoles });
                    }}><FontAwesomeIcon icon={faPlus} disabled={formConfig.state.roles.length} /></IconButton>
                    <IconButton variant="contained" color="error" onClick={() => {
                        let newRoles = [...formConfig.state.roles];
                        newRoles.splice(index, 1);
                        formConfig.setState({ ...formConfig.state, roles: newRoles });
                        setOpenIndex(-1);
                    }}><FontAwesomeIcon icon={faMinus} disabled={formConfig.state.roles.length <= 1} /></IconButton>
                    <IconButton variant="contained" color="info" onClick={() => {
                        if (index >= 1) {
                            let newRoles = [...formConfig.state.roles];
                            newRoles[index] = newRoles[index - 1];
                            newRoles[index - 1] = role;
                            formConfig.setState({ ...formConfig.state, roles: newRoles });
                            if (openIndex !== -1) setOpenIndex(index - 1);
                        }
                    }}><FontAwesomeIcon icon={faArrowUp} disabled={index === 0} /></IconButton>
                    <IconButton variant="contained" color="warning" onClick={() => {
                        if (index <= formConfig.state.roles.length - 2) {
                            let newRoles = [...formConfig.state.roles];
                            newRoles[index] = newRoles[index + 1];
                            newRoles[index + 1] = role;
                            formConfig.setState({ ...formConfig.state, roles: newRoles });
                            if (openIndex !== -1) setOpenIndex(index + 1);
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
        </>}
        {openIndex !== -1 && openIndex < formConfig.state.roles.length - 1 && <AfterOpen openIndex={openIndex} />}
    </>;
});

const EmailTemplateForm = ({ theme, template, onUpdate }) => {
    return <Grid container spacing={2} rowSpacing={-1} sx={{ mt: "5px", mb: "15px" }}>
        <Grid item xs={6} md={6}>
            <TextField
                style={{ marginBottom: '16px' }}
                key="subject"
                label="Subject"
                variant="outlined"
                fullWidth
                value={template.subject}
                onChange={(e) => { onUpdate({ ...template, subject: e.target.value }); }}
            />
        </Grid>
        <Grid item xs={12} md={6}>
            <TextField
                style={{ marginBottom: '16px' }}
                key="from_email"
                label="From (Name <Email>)"
                variant="outlined"
                fullWidth
                value={template.from_email}
                onChange={(e) => { onUpdate({ ...template, from_email: e.target.value }); }}
            />
        </Grid>
        <Grid item xs={12} md={6}>
            <TextField
                style={{ marginBottom: '16px' }}
                key="html"
                label="HTML Content"
                variant="outlined"
                fullWidth
                value={template.html}
                onChange={(e) => { onUpdate({ ...template, html: e.target.value }); }}
                multiline rows={5}
            />
        </Grid>
        <Grid item xs={12} md={6}>
            <TextField
                style={{ marginBottom: '16px' }}
                key="plain"
                label="Plain Text Content"
                variant="outlined"
                fullWidth
                value={template.plain}
                onChange={(e) => { onUpdate({ ...template, plain: e.target.value }); }}
                multiline rows={5}
            />
        </Grid>
    </Grid>;
};

const MemoSmtpForm = memo(({ theme, formConfig }) => {
    return <>
        <Grid item xs={9}>
            <TextField
                style={{ marginBottom: '16px' }}
                key="smtp_host"
                label="SMTP Host"
                variant="outlined"
                fullWidth
                value={formConfig.state.smtp_host}
                onChange={(e) => { formConfig.setState({ ...formConfig.state, smtp_host: e.target.value }); }}
            />
        </Grid>
        <Grid item xs={3}>
            <TextField
                style={{ marginBottom: '16px' }}
                key="smtp_port"
                label="SMTP Port"
                variant="outlined"
                fullWidth
                value={formConfig.state.smtp_port}
                onChange={(e) => { if (!isNaN(e.target.value)) formConfig.setState({ ...formConfig.state, smtp_port: parseInt(e.target.value) }); }}
            />
        </Grid>
        <Grid item xs={12} sm={6}>
            <TextField
                style={{ marginBottom: '16px' }}
                key="smtp_email"
                label="SMTP Email"
                variant="outlined"
                fullWidth
                value={formConfig.state.smtp_email}
                onChange={(e) => { formConfig.setState({ ...formConfig.state, smtp_email: e.target.value }); }}
            />
        </Grid>
        <Grid item xs={12} sm={6}>
            <TextField
                style={{ marginBottom: '16px' }}
                key="smtp_password"
                label="SMTP Password"
                variant="outlined"
                type="password"
                fullWidth
                value={formConfig.state.smtp_password}
                onChange={(e) => { formConfig.setState({ ...formConfig.state, smtp_password: e.target.value }); }}
            />
        </Grid>
        <Grid item xs={12}>
            <Typography variant="body2" fontWeight="bold" sx={{ mb: "10px", flexGrow: 1 }}>
                Template for Register Account
            </Typography>
            <EmailTemplateForm theme={theme} template={formConfig.state.email_template.register} onUpdate={(newTemplate) => {
                formConfig.setState({ ...formConfig.state, email_template: { ...formConfig.state.email_template, register: newTemplate } });
            }} />
        </Grid>
        <Grid item xs={12}>
            <Typography variant="body2" fontWeight="bold" sx={{ mb: "10px", flexGrow: 1 }}>
                Template for Update Email
            </Typography>
            <EmailTemplateForm theme={theme} template={formConfig.state.email_template.update_email} onUpdate={(newTemplate) => {
                formConfig.setState({ ...formConfig.state, email_template: { ...formConfig.state.email_template, update_email: newTemplate } });
            }} />
        </Grid>
        <Grid item xs={12}>
            <Typography variant="body2" fontWeight="bold" sx={{ mb: "10px", flexGrow: 1 }}>
                Template for Reset Password
            </Typography>
            <EmailTemplateForm theme={theme} template={formConfig.state.email_template.reset_password} onUpdate={(newTemplate) => {
                formConfig.setState({ ...formConfig.state, email_template: { ...formConfig.state.email_template, reset_password: newTemplate } });
            }} />
        </Grid>
    </>;
});

const RankForm = ({ theme, rank, onUpdate }) => {
    if (rank.discord_role_id === undefined) rank.discord_role_id = "";
    return <Grid container spacing={2} sx={{ mt: "5px", mb: "15px" }}>
        <Grid item xs={12} md={3}>
            <TextField size="small"
                key="name"
                label="Name"
                variant="outlined"
                fullWidth
                value={rank.name}
                onChange={(e) => { onUpdate({ ...rank, name: e.target.value }); }}
            />
        </Grid>
        <Grid item xs={12} md={3}>
            <TextField size="small"
                key="points"
                label="Points"
                variant="outlined"
                fullWidth
                value={rank.points}
                onChange={(e) => { if (!isNaN(e.target.value)) onUpdate({ ...rank, points: e.target.value }); }}
            />
        </Grid>
        <Grid item xs={12} md={3}>
            <TextField size="small"
                key="color"
                label="Color"
                variant="outlined"
                fullWidth
                value={rank.color}
                onChange={(e) => { onUpdate({ ...rank, color: e.target.value }); }}
            />
        </Grid>
        <Grid item xs={6} md={3}>
            <TextField size="small"
                key="discord_role_id"
                label="Discord Role ID"
                variant="outlined"
                fullWidth
                value={rank.discord_role_id}
                onChange={(e) => { if (!isNaN(e.target.value)) onUpdate({ ...rank, discord_role_id: e.target.value }); }}
            />
        </Grid>
        <Grid item xs={12}>
            <Typography variant="body2" fontWeight="bold">
                Daily Bonus
            </Typography>
        </Grid>
        {rank.daily_bonus === null && <>
            <Grid item xs={6} md={6}>
                <TextField select size="small"
                    label="Type"
                    variant="outlined"
                    fullWidth
                    value="disabled"
                    onChange={(e) => { if (e.target.value !== "disabled") onUpdate({ ...rank, daily_bonus: { type: e.target.value, base: 0, streak_type: "algo", streak_value: 1.01, algo_offset: 15 } }); }}
                >
                    <MenuItem value="streak">Streak</MenuItem>
                    <MenuItem value="fixed">Fixed</MenuItem>
                    <MenuItem value="disabled">Disabled</MenuItem>
                </TextField>
            </Grid>
        </>}
        {rank.daily_bonus !== null && <>
            <Grid item xs={6} md={6}>
                <TextField select size="small"
                    label="Type"
                    variant="outlined"
                    fullWidth
                    value={rank.daily_bonus.type}
                    onChange={(e) => { if (e.target.value === "disabled") { onUpdate({ ...rank, daily_bonus: null }); return; } onUpdate({ ...rank, daily_bonus: { ...rank.daily_bonus, type: e.target.value } }); }}
                >
                    <MenuItem value="streak">Streak</MenuItem>
                    <MenuItem value="fixed">Fixed</MenuItem>
                    <MenuItem value="disabled">Disabled</MenuItem>
                </TextField>
            </Grid>
            <Grid item xs={6} md={6}>
                <TextField size="small"
                    label="Base Reward"
                    variant="outlined"
                    fullWidth
                    value={rank.daily_bonus.base}
                    onChange={(e) => { if (!isNaN(e.target.value)) onUpdate({ ...rank, daily_bonus: { ...rank.daily_bonus, base: e.target.value } }); }}
                />
            </Grid>
            {rank.daily_bonus.type === "streak" && <>
                <Grid item xs={rank.daily_bonus.streak_type === "algo" ? 4 : 6}>
                    <TextField select size="small"
                        label="Streak Mode"
                        variant="outlined"
                        fullWidth
                        value={rank.daily_bonus.streak_type}
                        onChange={(e) => { onUpdate({ ...rank, daily_bonus: { ...rank.daily_bonus, streak_type: e.target.value } }); }}
                    >
                        <MenuItem value="algo">Algo</MenuItem>
                        <MenuItem value="fixed">Fixed</MenuItem>
                    </TextField>
                </Grid>
                <Grid item xs={rank.daily_bonus.streak_type === "algo" ? 4 : 6}>
                    <TextField size="small"
                        label={rank.daily_bonus.streak_type === "algo" ? "Rate" : "Value"}
                        variant="outlined"
                        fullWidth
                        value={rank.daily_bonus.streak_value}
                        onChange={(e) => { if (!isNaN(e.target.value)) onUpdate({ ...rank, daily_bonus: { ...rank.daily_bonus, streak_value: e.target.value } }); }}
                    />
                </Grid>
                <Grid item xs={rank.daily_bonus.streak_type === "algo" ? 4 : 0}>
                    <TextField size="small"
                        label="Offset"
                        variant="outlined"
                        fullWidth
                        value={rank.daily_bonus.algo_offset}
                        onChange={(e) => { if (!isNaN(e.target.value)) onUpdate({ ...rank, daily_bonus: { ...rank.daily_bonus, algo_offset: e.target.value } }); }}
                    />
                </Grid>
            </>}
        </>}
        <Grid item xs={12}>
            <Typography variant="body2" fontWeight="bold">
                Distance Bonus
            </Typography>
        </Grid>
        {rank.distance_bonus === null && <>
            <Grid item xs={6} md={6}>
                <TextField select size="small"
                    label="Type"
                    variant="outlined"
                    fullWidth
                    value="disabled"
                    onChange={(e) => { if (e.target.value !== "disabled") onUpdate({ ...rank, distance_bonus: { type: e.target.value, probability: 1, min_distance: 0, max_distance: -1, value: e.target.value.endsWith("value") ? 100 : 0.1, min: e.target.value.endsWith("value") ? 0 : 0, max: e.target.value.endsWith("value") ? 100 : 1 } }); }}
                >
                    <MenuItem value="fixed_value">Fixed Value</MenuItem>
                    <MenuItem value="fixed_percentage">Fixed Percent of Distance</MenuItem>
                    <MenuItem value="random_value">Random Value</MenuItem>
                    <MenuItem value="random_percentage">Random Percent of Distance</MenuItem>
                    <MenuItem value="disabled">Disabled</MenuItem>
                </TextField>
            </Grid>
        </>}
        {rank.distance_bonus !== null && <>
            <Grid item xs={4}>
                <TextField size="small"
                    label="Probability"
                    variant="outlined"
                    fullWidth
                    value={rank.distance_bonus.probability}
                    onChange={(e) => { if (!isNaN(e.target.value)) onUpdate({ ...rank, distance_bonus: { ...rank.distance_bonus, probability: e.target.value } }); }}
                />
            </Grid>
            <Grid item xs={4}>
                <TextField size="small"
                    label="Minimum Distance"
                    variant="outlined"
                    fullWidth
                    value={rank.distance_bonus.min_distance}
                    onChange={(e) => { if (!isNaN(e.target.value)) onUpdate({ ...rank, distance_bonus: { ...rank.distance_bonus, min_distance: e.target.value } }); }}
                />
            </Grid>
            <Grid item xs={4}>
                <TextField size="small"
                    label="Maximum Distance"
                    variant="outlined"
                    fullWidth
                    value={rank.distance_bonus.max_distance}
                    onChange={(e) => { if (!isNaN(e.target.value)) onUpdate({ ...rank, distance_bonus: { ...rank.distance_bonus, max_distance: e.target.value } }); }}
                />
            </Grid>
            <Grid item xs={4}>
                <TextField select size="small"
                    label="Type"
                    variant="outlined"
                    fullWidth
                    value={rank.distance_bonus.type}
                    onChange={(e) => { if (e.target.value === "disabled") { onUpdate({ ...rank, distance_bonus: null }); return; } onUpdate({ ...rank, distance_bonus: { ...rank.distance_bonus, type: e.target.value } }); }}
                >
                    <MenuItem value="fixed_value">Fixed Value</MenuItem>
                    <MenuItem value="fixed_percentage">Fixed Percent of Distance</MenuItem>
                    <MenuItem value="random_value">Random Value</MenuItem>
                    <MenuItem value="random_percentage">Random Percent of Distance</MenuItem>
                    <MenuItem value="disabled">Disabled</MenuItem>
                </TextField>
            </Grid>
            {rank.distance_bonus.type.startsWith("fixed") && <>
                <Grid item xs={4}>
                    <TextField size="small"
                        label="Value / Percent"
                        variant="outlined"
                        fullWidth
                        value={rank.distance_bonus.value}
                        onChange={(e) => { if (!isNaN(e.target.value)) onUpdate({ ...rank, distance_bonus: { ...rank.distance_bonus, value: e.target.value } }); }}
                    />
                </Grid>
            </>}
            {rank.distance_bonus.type.startsWith("random") && <>
                <Grid item xs={4}>
                    <TextField size="small"
                        label="Minimum Value / Percent"
                        variant="outlined"
                        fullWidth
                        value={rank.distance_bonus.min}
                        onChange={(e) => { if (!isNaN(e.target.value)) onUpdate({ ...rank, distance_bonus: { ...rank.distance_bonus, min: e.target.value } }); }}
                    />
                </Grid>
                <Grid item xs={4}>
                    <TextField size="small"
                        label="Maximum Value / Percent"
                        variant="outlined"
                        fullWidth
                        value={rank.distance_bonus.max}
                        onChange={(e) => { if (!isNaN(e.target.value)) onUpdate({ ...rank, distance_bonus: { ...rank.distance_bonus, max: e.target.value } }); }}
                    />
                </Grid>
            </>}
        </>}
    </Grid>;
};

const MemoRankForm = memo(({ theme, formConfig }) => {
    const [openIndex, setOpenIndex] = useState(-1);

    if (formConfig.state.ranks.length === 0) {
        return <div style={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" fontWeight="bold" sx={{ mb: "10px", flexGrow: 1 }}>
                No Ranks - Create + to create one
            </Typography>
            <IconButton variant="contained" color="success" onClick={() => {
                let newRanks = [{ id: 1, points: 0, name: "New Rank", color: "", discord_role_id: "", daily_bonus: null, distance_bonus: null }];
                formConfig.setState({ ...formConfig.state, ranks: newRanks });
            }}><FontAwesomeIcon icon={faPlus} /></IconButton>
        </div>;
    };
    const RankItem = memo(({ rank, index }) => {
        return <>
            <div key={`rank-form-div-${index}`} style={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flexGrow: 1, color: rank.color }} onClick={() => openIndex === index ? setOpenIndex(-1) : setOpenIndex(index)}>
                    {rank.name}
                </Typography>
                <div key={`rank-control-div-${index}`}>
                    <IconButton style={{ transition: 'transform 0.2s', transform: openIndex === index ? 'rotate(180deg)' : 'none' }} onClick={() => setOpenIndex(index)}>
                        <ExpandMoreRounded />
                    </IconButton>
                    <IconButton variant="contained" color="success" onClick={() => {
                        let newRanks = [...formConfig.state.ranks];
                        let nextId = rank.id + 1;
                        let allUsedIds = [];
                        for (let i = 0; i < formConfig.state.ranks.length; i++) {
                            if (!isNaN(formConfig.state.ranks[i].id)) {
                                allUsedIds.push(Number(formConfig.state.ranks[i].id));
                            }
                        }
                        allUsedIds = allUsedIds.sort((a, b) => a - b);
                        for (let i = 0; i < allUsedIds.length; i++) {
                            if (allUsedIds[i] > rank.id) {
                                if (allUsedIds[i] === nextId) {
                                    nextId += 1;
                                } else {
                                    break;
                                }
                            }
                        }
                        setOpenIndex(index + 1);
                        newRanks.splice(index + 1, 0, { id: nextId, points: 0, name: "New Rank", color: "", discord_role_id: "", daily_bonus: null, distance_bonus: null });
                        formConfig.setState({ ...formConfig.state, ranks: newRanks });
                    }}><FontAwesomeIcon icon={faPlus} disabled={formConfig.state.ranks.length} /></IconButton>
                    <IconButton variant="contained" color="error" onClick={() => {
                        let newRanks = [...formConfig.state.ranks];
                        newRanks.splice(index, 1);
                        formConfig.setState({ ...formConfig.state, ranks: newRanks });
                        setOpenIndex(-1);
                    }}><FontAwesomeIcon icon={faMinus} disabled={formConfig.state.ranks.length <= 1} /></IconButton>
                    <IconButton variant="contained" color="info" onClick={() => {
                        if (index >= 1) {
                            let newRanks = [...formConfig.state.ranks];
                            newRanks[index] = newRanks[index - 1];
                            newRanks[index - 1] = rank;
                            formConfig.setState({ ...formConfig.state, ranks: newRanks });
                            if (openIndex === index) setOpenIndex(index - 1);
                        }
                    }}><FontAwesomeIcon icon={faArrowUp} disabled={index === 0} /></IconButton>
                    <IconButton variant="contained" color="warning" onClick={() => {
                        if (index <= formConfig.state.ranks.length - 2) {
                            let newRanks = [...formConfig.state.ranks];
                            newRanks[index] = newRanks[index + 1];
                            newRanks[index + 1] = rank;
                            formConfig.setState({ ...formConfig.state, ranks: newRanks });
                            if (openIndex === index) setOpenIndex(index + 1);
                        }
                    }} disabled={index === formConfig.state.ranks.length} ><FontAwesomeIcon icon={faArrowDown} /></IconButton>
                </div>
            </div>
        </>;
    });
    const BeforeOpen = memo(({ openIndex }) =>
        (<>{formConfig.state.ranks.map((rank, index) => ((index < openIndex || openIndex === -1) && <RankItem rank={rank} index={index} />))}</>)
    );
    const AfterOpen = memo(({ openIndex }) =>
        (<>{formConfig.state.ranks.map((rank, index) => ((index > openIndex && openIndex !== -1) && <RankItem rank={rank} index={index} />))}</>)
    );
    let rank = formConfig.state.ranks[openIndex];
    let index = openIndex;
    return <>
        {(openIndex > 0 || openIndex === -1) && <BeforeOpen openIndex={openIndex} />}
        {openIndex !== -1 && <>
            <div key={`rank-form-div-${index}`} style={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', mb: "10px", flexGrow: 1, color: rank.color }} onClick={() => openIndex === index ? setOpenIndex(-1) : setOpenIndex(index)}>
                    {rank.name}
                </Typography>
                <div key={`rank-control-div-${index}`}>
                    <IconButton style={{ transition: 'transform 0.2s', transform: openIndex === index ? 'rotate(180deg)' : 'none' }} onClick={() => setOpenIndex(index)}>
                        <ExpandMoreRounded />
                    </IconButton>
                    <IconButton variant="contained" color="success" onClick={(e) => {
                        let newRanks = [...formConfig.state.ranks];
                        let nextId = rank.id + 1;
                        let allUsedIds = [];
                        for (let i = 0; i < formConfig.state.ranks.length; i++) {
                            if (!isNaN(formConfig.state.ranks[i].id)) {
                                allUsedIds.push(Number(formConfig.state.ranks[i].id));
                            }
                        }
                        allUsedIds = allUsedIds.sort((a, b) => a - b);
                        for (let i = 0; i < allUsedIds.length; i++) {
                            if (allUsedIds[i] > rank.id) {
                                if (allUsedIds[i] === nextId) {
                                    nextId += 1;
                                } else {
                                    break;
                                }
                            }
                        }
                        setOpenIndex(index + 1);
                        newRanks.splice(index + 1, 0, { id: nextId, order_id: rank.order_id + 1, name: "", color: "" });
                        formConfig.setState({ ...formConfig.state, ranks: newRanks });
                    }}><FontAwesomeIcon icon={faPlus} disabled={formConfig.state.ranks.length} /></IconButton>
                    <IconButton variant="contained" color="error" onClick={() => {
                        let newRanks = [...formConfig.state.ranks];
                        newRanks.splice(index, 1);
                        formConfig.setState({ ...formConfig.state, ranks: newRanks });
                        setOpenIndex(-1);
                    }}><FontAwesomeIcon icon={faMinus} disabled={formConfig.state.ranks.length <= 1} /></IconButton>
                    <IconButton variant="contained" color="info" onClick={() => {
                        if (index >= 1) {
                            let newRanks = [...formConfig.state.ranks];
                            newRanks[index] = newRanks[index - 1];
                            newRanks[index - 1] = rank;
                            formConfig.setState({ ...formConfig.state, ranks: newRanks });
                            if (openIndex !== -1) setOpenIndex(index - 1);
                        }
                    }}><FontAwesomeIcon icon={faArrowUp} disabled={index === 0} /></IconButton>
                    <IconButton variant="contained" color="warning" onClick={() => {
                        if (index <= formConfig.state.ranks.length - 2) {
                            let newRanks = [...formConfig.state.ranks];
                            newRanks[index] = newRanks[index + 1];
                            newRanks[index + 1] = rank;
                            formConfig.setState({ ...formConfig.state, ranks: newRanks });
                            if (openIndex !== -1) setOpenIndex(index + 1);
                        }
                    }} disabled={index === formConfig.state.ranks.length} ><FontAwesomeIcon icon={faArrowDown} /></IconButton>
                </div>
            </div>
            <RankForm key={`rank-input-div-${index}`} theme={theme} rank={rank} onUpdate={(item) => {
                let newRanks = [...formConfig.state.ranks];
                newRanks[index] = item;
                formConfig.setState({ ...formConfig.state, ranks: newRanks });
            }} />
        </>}
        {openIndex !== -1 && openIndex < formConfig.state.ranks.length - 1 && <AfterOpen openIndex={openIndex} />}
    </>;
});

const DiscordEmbedForm = ({ embed, onUpdate }) => {
    if (embed.author === undefined) embed.author = { name: "", icon_url: "" };
    if (embed.footer === undefined) embed.footer = { text: "", icon_url: "" };
    if (embed.thumbnail === undefined) embed.thumbnail = { url: "" };
    if (embed.image === undefined) embed.image = { url: "" };
    if (embed.video === undefined) embed.video = { url: "" };
    if (embed.fields === undefined) embed.fields = [];

    const handleFieldChange = (index, field) => {
        const newFields = [...embed.fields];
        newFields[index] = field;
        onUpdate({ ...embed, fields: newFields });
    };

    return (
        <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
                <TextField size="small"
                    label="Title"
                    variant="outlined"
                    fullWidth
                    value={embed.title}
                    onChange={(e) => onUpdate({ ...embed, title: e.target.value })}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField size="small"
                    label="URL"
                    variant="outlined"
                    fullWidth
                    value={embed.url}
                    onChange={(e) => onUpdate({ ...embed, url: e.target.value })}
                />
            </Grid>
            <Grid item xs={12}>
                <TextField size="small"
                    label="Description"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={5}
                    value={embed.description}
                    onChange={(e) => onUpdate({ ...embed, description: e.target.value })}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField size="small"
                    label="Author Name"
                    variant="outlined"
                    fullWidth
                    value={embed.author.name}
                    onChange={(e) => onUpdate({ ...embed, author: { ...embed.author, name: e.target.value } })}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField size="small"
                    label="Author Icon URL"
                    variant="outlined"
                    fullWidth
                    value={embed.author.icon_url}
                    onChange={(e) => onUpdate({ ...embed, author: { ...embed.author, icon_url: e.target.value } })}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField size="small"
                    label="Footer Text"
                    variant="outlined"
                    fullWidth
                    value={embed.footer.text}
                    onChange={(e) => onUpdate({ ...embed, footer: { ...embed.footer, text: e.target.value } })}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField size="small"
                    label="Footer Icon URL"
                    variant="outlined"
                    fullWidth
                    value={embed.footer.icon_url}
                    onChange={(e) => onUpdate({ ...embed, footer: { ...embed.footer, icon_url: e.target.value } })}
                />
            </Grid>
            <Grid item xs={12} sm={4}>
                <TextField size="small"
                    label="Thumbnail URL"
                    variant="outlined"
                    fullWidth
                    value={embed.thumbnail.url}
                    onChange={(e) => onUpdate({ ...embed, thumbnail: { ...embed.thumbnail, url: e.target.value } })}
                />
            </Grid>
            <Grid item xs={12} sm={4}>
                <TextField size="small"
                    label="Image URL"
                    variant="outlined"
                    fullWidth
                    value={embed.image.url}
                    onChange={(e) => onUpdate({ ...embed, image: { ...embed.image, url: e.target.value } })}
                />
            </Grid>
            <Grid item xs={12} sm={4}>
                <TextField size="small"
                    label="Video URL"
                    variant="outlined"
                    fullWidth
                    value={embed.video.url}
                    onChange={(e) => onUpdate({ ...embed, image: { ...embed.video, url: e.target.value } })}
                />
            </Grid>
            <Grid item xs={12}>
                <TextField size="small"
                    label="Color"
                    variant="outlined"
                    fullWidth
                    defaultValue={!isNaN(parseInt(embed.color, 16)) ? "#" + parseInt(embed.color, 16) : ""}
                    onChange={(e) => onUpdate({ ...embed, color: parseInt("0x" + e.target.value.replaceAll("#", "")) })}
                />
            </Grid>
            <Grid item xs={12}>
                <FormControlLabel size="small"
                    control={<Checkbox checked={embed.timestamp} onChange={(e) => onUpdate({ ...embed, timestamp: e.target.checked })} />}
                    label="Include Timestamp"
                />
            </Grid>
            {embed.fields.map((field, index) => (
                <Grid item xs={12} key={index}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" fontWeight="bold" sx={{ mb: "10px", flexGrow: 1 }}>
                            Field #{index + 1}
                        </Typography>
                        <div>
                            <IconButton variant="contained" color="success" onClick={() => {
                                let newFields = [...embed.fields];
                                newFields.splice(index + 1, 0, { "name": "New Field", "value": "", "inline": true });
                                onUpdate({ ...embed, fields: newFields });
                            }}><FontAwesomeIcon icon={faPlus} disabled={embed.fields.length >= 9} /></IconButton>
                            <IconButton variant="contained" color="error" onClick={() => {
                                let newFields = [...embed.fields];
                                newFields.splice(index, 1);
                                onUpdate({ ...embed, fields: newFields });
                            }}><FontAwesomeIcon icon={faMinus} disabled={embed.fields.length <= 1} /></IconButton>
                            <IconButton variant="contained" color="info" onClick={() => {
                                if (index >= 1) {
                                    let newFields = [...embed.fields];
                                    newFields[index] = newFields[index - 1];
                                    newFields[index - 1] = tracker;
                                    onUpdate({ ...embed, fields: newFields });
                                }
                            }}><FontAwesomeIcon icon={faArrowUp} disabled={index === 0} /></IconButton>
                            <IconButton variant="contained" color="warning" onClick={() => {
                                if (index <= embed.fields.length - 2) {
                                    let newFields = [...embed.fields];
                                    newFields[index] = newFields[index + 1];
                                    newFields[index + 1] = tracker;
                                    onUpdate({ ...embed, fields: newFields });
                                }
                            }} ><FontAwesomeIcon icon={faArrowDown} /></IconButton>
                        </div>
                    </div>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <TextField size="small"
                                label={`Name`}
                                variant="outlined"
                                fullWidth
                                value={field.name}
                                onChange={(e) => handleFieldChange(index, { ...field, name: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField select size="small"
                                label={`Inline?`}
                                variant="outlined"
                                fullWidth
                                value={field.inline}
                                onChange={(e) => handleFieldChange(index, { ...field, inline: e.target.value })}
                            >
                                <MenuItem key="true" value={true}>
                                    True
                                </MenuItem>
                                <MenuItem key="false" value={false}>
                                    False
                                </MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField size="small"
                                label="Value"
                                variant="outlined"
                                fullWidth
                                value={field.value}
                                onChange={(e) => handleFieldChange(index, { ...field, value: e.target.value })}
                            />
                        </Grid>
                    </Grid>
                </Grid>
            ))}
        </Grid>
    );
};

const DiscordMessageForm = memo(({ theme, item, onUpdate, roleChange = false, isPrivate = false, secondsAhead = false }) => {
    return <>
        <Grid item xs={6} md={4}>
            <TextField size="small"
                label="Discord Message"
                variant="outlined"
                fullWidth
                value={item.message}
                onChange={(e) => { onUpdate({ ...item, message: e.target.value }); }}
            />
        </Grid>
        <Grid item xs={6} md={4}>
            <TextField size="small"
                label="Discord Channel ID"
                variant="outlined"
                fullWidth
                value={item.channel_id}
                onChange={(e) => { if (!isNaN(e.target.value)) onUpdate({ ...item, channel_id: e.target.value }); }}
            />
        </Grid>
        <Grid item xs={6} md={4}>
            <TextField size="small"
                label="Discord Webhook (Alternative)"
                variant="outlined"
                fullWidth
                value={item.webhook_url}
                onChange={(e) => { onUpdate({ ...item, webhook_url: e.target.value }); }}
            />
        </Grid>
        {roleChange && <Grid item xs={12} md={12}>
            <Typography variant="body2">Discord Role Changes (+ID / -ID)</Typography>
            <CreatableSelect
                defaultValue={item.role_change.map((role) => ({ value: role, label: role }))}
                isMulti
                name="roles"
                className="basic-multi-select"
                classNamePrefix="select"
                styles={customSelectStyles(theme)}
                value={item.role_change.map((role) => ({ value: role, label: role }))}
                onChange={(newRoles) => {
                    onUpdate({
                        ...item,
                        role_change: newRoles.map((item) => item.value),
                    });
                }}
                menuPortalTarget={document.body}
            />
        </Grid>}
        {isPrivate && <Grid item xs={12}>
            <TextField select size="small"
                label="Content Control"
                variant="outlined"
                fullWidth
                value={item.is_private}
                onChange={(e) => { onUpdate({ ...item, is_private: e.target.value }); }}
            >
                <MenuItem value={null}>All Content</MenuItem>
                <MenuItem value={true}>Only Private Content</MenuItem>
                <MenuItem value={false}>Only Public Content</MenuItem>
            </TextField>
        </Grid>}
        {secondsAhead && <Grid item xs={12}>
            <TextField size="small"
                label="Send the message X seconds before the convoy departs"
                variant="outlined"
                fullWidth
                value={item.seconds_ahead}
                onChange={(e) => { if (!isNaN(e.target.value)) onUpdate({ ...item, seconds_ahead: e.target.value }); }}
            />
        </Grid>}
        <Grid item xs={12}>
            {(item.embeds === undefined || item.embeds.length === 0) && <>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" fontWeight="bold" sx={{ mb: "10px", flexGrow: 1 }}>
                        No embed - Create + to create one
                    </Typography>
                    <IconButton variant="contained" color="success" onClick={() => {
                        onUpdate({ ...item, embeds: { title: "New Embed", url: "", description: "", color: 0, timestamp: false, fields: [], author: { name: "", icon_url: "" }, footer: { text: "", icon_url: "" }, thumbnail: { url: "" }, image: { url: "" }, video: { url: "" } } });
                    }}><FontAwesomeIcon icon={faPlus} /></IconButton>
                </div>
            </>}
            {item.embeds !== undefined && item.embeds.length >= 1 && <div style={{ marginBottom: "10px", backgroundColor: `${theme.palette.text.secondary.substring(0, 7)}11`, border: `1px solid ${theme.palette.text.secondary + "88"}`, borderRadius: "5px", padding: "10px" }}>
                {item.embeds.map((embed, index) => (<>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" fontWeight="bold" sx={{ mb: "5px", flexGrow: 1 }}>
                            Embed #{index + 1}
                        </Typography>
                        <div>
                            <IconButton variant="contained" color="success" onClick={() => {
                                let newEmbeds = [...item.embeds];
                                newEmbeds.splice(index + 1, 0, { title: "New Embed", url: "", description: "", color: 0, timestamp: false, fields: [], author: { name: "", icon_url: "" }, footer: { text: "", icon_url: "" }, thumbnail: { url: "" }, image: { url: "" }, video: { url: "" } });
                                onUpdate({ ...item, embeds: newEmbeds });
                            }}><FontAwesomeIcon icon={faPlus} /></IconButton>
                            <IconButton variant="contained" color="error" onClick={() => {
                                let newEmbeds = [...item.embeds];
                                newEmbeds.splice(index, 1);
                                onUpdate({ ...item, embeds: newEmbeds });
                            }}><FontAwesomeIcon icon={faMinus} disabled={item.embeds.length <= 1} /></IconButton>
                            <IconButton variant="contained" color="info" onClick={() => {
                                if (index >= 1) {
                                    let newEmbeds = [...item.embeds];
                                    newEmbeds[index] = newEmbeds[index - 1];
                                    newEmbeds[index - 1] = embed;
                                    onUpdate({ ...item, embeds: newEmbeds });
                                }
                            }}><FontAwesomeIcon icon={faArrowUp} disabled={index === 0} /></IconButton>
                            <IconButton variant="contained" color="warning" onClick={() => {
                                if (index <= item.embeds.length - 2) {
                                    let newEmbeds = [...item.embeds];
                                    newEmbeds[index] = newEmbeds[index + 1];
                                    newEmbeds[index + 1] = embed;
                                    onUpdate({ ...item, embeds: newEmbeds });
                                }
                            }} disabled={index === item.embeds.length} ><FontAwesomeIcon icon={faArrowDown} /></IconButton>
                        </div>
                    </div>
                    <DiscordEmbedForm embed={embed} onUpdate={(newEmbed) => {
                        let newEmbeds = [...item.embeds];
                        if (newEmbed.author.name === "" && newEmbed.author.icon_url === "") delete newEmbed.author;
                        if (newEmbed.footer.text === "" && newEmbed.footer.icon_url === "") delete newEmbed.footer;
                        if (newEmbed.thumbnail.url === "") delete newEmbed.thumbnail;
                        if (newEmbed.image.url === "") delete newEmbed.image;
                        if (newEmbed.video.url === "") delete newEmbed.video;
                        newEmbeds = newEmbeds.map((item, i) => {
                            if (i === index) {
                                return newEmbed;
                            }
                            return item;
                        }
                        );
                        onUpdate({ ...item, embeds: newEmbeds });
                    }
                    } />
                    {item.embeds.length !== index - 1 && <Divider />}
                </>))}
            </div>}
        </Grid>
    </>;
});

const MemoDiscordSingleForm = memo(({ theme, vars, formConfig, form_key, roleChange = false, isPrivate = false, secondsAhead = false }) => {
    return <>
        <Typography variant="body2" sx={{ mb: "5px" }}>
            The following variables are available:<br />
            {vars}
        </Typography>
        {formConfig.state[form_key].length === 0 && <>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" fontWeight="bold" sx={{ mb: "10px", flexGrow: 1 }}>
                    No Message - Create + to create one
                </Typography>
                <IconButton variant="contained" color="success" onClick={() => {
                    let newItems = [{ id: 1, message: "", channel_id: "", webhook_url: "", role_change: [], embed: { title: "", url: "", description: "", color: 0, timestamp: false, fields: [], author: { name: "", icon_url: "" }, footer: { text: "", icon_url: "" }, thumbnail: { url: "" }, image: { url: "" }, video: { url: "" } } }];
                    formConfig.setState({ ...formConfig.state, [form_key]: newItems });
                }}><FontAwesomeIcon icon={faPlus} /></IconButton>
            </div>
        </>}
        {formConfig.state[form_key].length >= 1 && <>
            {formConfig.state[form_key].map((item, index) => (<div style={{ marginBottom: "10px", border: `1px solid ${theme.palette.text.secondary + "88"}`, borderRadius: "5px", padding: "10px" }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" fontWeight="bold" sx={{ mb: "5px", flexGrow: 1 }}>
                        Message #{index + 1}
                    </Typography>
                    <div>
                        <IconButton variant="contained" color="success" onClick={() => {
                            let newItems = [...formConfig.state[form_key]];
                            let nextId = item.id + 1;
                            let allUsedIds = [];
                            for (let i = 0; i < formConfig.state[form_key].length; i++) {
                                if (!isNaN(formConfig.state[form_key][i].id)) {
                                    allUsedIds.push(Number(formConfig.state[form_key][i].id));
                                }
                            }
                            allUsedIds = allUsedIds.sort((a, b) => a - b);
                            for (let i = 0; i < allUsedIds.length; i++) {
                                if (allUsedIds[i] > item.id) {
                                    if (allUsedIds[i] === nextId) {
                                        nextId += 1;
                                    } else {
                                        break;
                                    }
                                }
                            }
                            newItems.splice(index + 1, 0, { id: nextId, message: "", channel_id: "", webhook_url: "", role_change: [], embed: { title: "", url: "", description: "", color: 0, timestamp: false, fields: [], author: { name: "", icon_url: "" }, footer: { text: "", icon_url: "" }, thumbnail: { url: "" }, image: { url: "" }, video: { url: "" } } });
                            formConfig.setState({ ...formConfig.state, [form_key]: newItems });
                        }}><FontAwesomeIcon icon={faPlus} /></IconButton>
                        <IconButton variant="contained" color="error" onClick={() => {
                            let newItems = [...formConfig.state[form_key]];
                            newItems.splice(index, 1);
                            formConfig.setState({ ...formConfig.state, [form_key]: newItems });
                        }}><FontAwesomeIcon icon={faMinus} disabled={formConfig.state[form_key].length <= 1} /></IconButton>
                        <IconButton variant="contained" color="info" onClick={() => {
                            if (index >= 1) {
                                let newItems = [...formConfig.state[form_key]];
                                newItems[index] = newItems[index - 1];
                                newItems[index - 1] = item;
                                formConfig.setState({ ...formConfig.state, [form_key]: newItems });
                            }
                        }}><FontAwesomeIcon icon={faArrowUp} disabled={index === 0} /></IconButton>
                        <IconButton variant="contained" color="warning" onClick={() => {
                            if (index <= formConfig.state[form_key].length - 2) {
                                let newItems = [...formConfig.state[form_key]];
                                newItems[index] = newItems[index + 1];
                                newItems[index + 1] = item;
                                formConfig.setState({ ...formConfig.state, [form_key]: newItems });
                            }
                        }} disabled={index === formConfig.state[form_key].length} ><FontAwesomeIcon icon={faArrowDown} /></IconButton>
                    </div>
                </div>
                <Grid container spacing={2}>
                    <DiscordMessageForm theme={theme} item={item} roleChange={roleChange} isPrivate={isPrivate} secondsAhead={secondsAhead} onUpdate={(newItem) => {
                        let newItems = [...formConfig.state[form_key]];
                        newItems[index] = newItem;
                        formConfig.setState({ ...formConfig.state, [form_key]: newItems });
                    }
                    } />
                </Grid>
            </div>
            ))
            }</>
        }
    </>;
});

const MemoDiscordMemberForm = memo(({ theme, formConfig }) => {
    const [openIndex, setOpenIndex] = useState(-1);
    const ITEMS = { "member_accept": "Member Accept", "member_leave": "Member Leave", "driver_role_add": "Driver Role Added", "driver_role_remove": "Driver Role Removed", "rank_up": "Driver Ranked Up" };
    const ROLE_CHANGE = [true, true, true, true, false];
    const VARS = ["{mention}, {name}, {userid}, {uid}, {avatar}, {staff_mention}, {staff_name}, {staff_userid}, {staff_uid}, {staff_avatar}", "{mention}, {name}, {userid}, {uid}, {avatar}, {staff_mention}, {staff_name}, {staff_userid}, {staff_uid}, {staff_avatar}", "{mention}, {name}, {userid}, {uid}, {avatar}, {staff_mention}, {staff_name}, {staff_userid}, {staff_uid}, {staff_avatar}", "{mention}, {name}, {userid}, {uid}, {avatar}, {staff_mention}, {staff_name}, {staff_userid}, {staff_uid}, {staff_avatar}", "{mention}, {name}, {userid}, {rank}, {uid}, {avatar}"];
    return <>
        {Object.keys(ITEMS).map((key, index) => {
            return <Grid item xs={12} key={index}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', mb: "10px", flexGrow: 1 }} onClick={() => openIndex === index ? setOpenIndex(-1) : setOpenIndex(index)}>
                        {ITEMS[key]}
                    </Typography>
                    <div>
                        <IconButton style={{ transition: 'transform 0.2s', transform: openIndex === key ? 'rotate(180deg)' : 'none' }} onClick={() => setOpenIndex(key)}>
                            <ExpandMoreRounded />
                        </IconButton>
                    </div>
                </div>
                {openIndex === index && <MemoDiscordSingleForm theme={theme} vars={VARS[index]} formConfig={formConfig} form_key={key} roleChange={ROLE_CHANGE[index]} />}
            </Grid>;
        })}
    </>;
});

const MemoDiscordOtherForm = memo(({ theme, formConfig }) => {
    const [openIndex, setOpenIndex] = useState(-1);
    const ITEMS = { "announcement_forwarding": "New Announcement", "challenge_forwarding": "New Challenge", "challenge_completed_forwarding": "Completed Challenge", "downloads_forwarding": "New Downloadable Item", "event_forwarding": "New Event", "event_upcoming_forwarding": "Upcoming Event", "poll_forwarding": "Poll Forwarding" };
    const VARS = ["{mention}, {name}, {userid}, {uid}, {avatar}, {id}, {title}, {content}, {type}", "{mention}, {name}, {userid}, {uid}, {avatar}, {id}, {title}, {description}, {start_timestamp}, {end_timestamp}, {delivery_count}, {required_roles}, {required_distance}, {reward_points}", "{mention}, {name}, {userid}, {uid}, {avatar}, {id}, {title}, {earned_points}", "{mention}, {name}, {userid}, {uid}, {avatar}, {id}, {title}, {description}, {link}", "{mention}, {name}, {userid}, {uid}, {avatar}, {id}, {title}, {description}, {link}, {departure}, {destination}, {distance}, {meetup_timestamp}, {departure_timestamp}", "{mention}, {name}, {userid}, {uid}, {avatar}, {id}, {title}, {description}, {link}, {departure}, {destination}, {distance}, {meetup_timestamp}, {departure_timestamp}", "{mention}, {name}, {userid}, {uid}, {avatar}, {id}, {title}, {description}"];
    return <>
        {Object.keys(ITEMS).map((key, index) => {
            if (!vars.dhconfig.plugins.includes(key.split("_")[0])) return <></>;
            return <Grid item xs={12} key={index}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', mb: "10px", flexGrow: 1 }} onClick={() => openIndex === index ? setOpenIndex(-1) : setOpenIndex(index)}>
                        {ITEMS[key]}
                    </Typography>
                    <div>
                        <IconButton style={{ transition: 'transform 0.2s', transform: openIndex === key ? 'rotate(180deg)' : 'none' }} onClick={() => setOpenIndex(key)}>
                            <ExpandMoreRounded />
                        </IconButton>
                    </div>
                </div>
                {openIndex === index && <MemoDiscordSingleForm theme={theme} vars={VARS[index]} formConfig={formConfig} form_key={key} isPrivate={["announcement_forwarding", "event_forwarding", "event_upcoming_forwarding"].includes(key)} secondsAhead={["event_upcoming_forwarding"].includes(key)} />}
            </Grid>;
        })}
    </>;
});

const AnnouncementTypeForm = ({ theme, announcement_type, onUpdate }) => {
    return <Grid container spacing={2} rowSpacing={-1} sx={{ mt: "5px", mb: "15px" }}>
        <Grid item xs={6} md={3}>
            <TextField
                style={{ marginBottom: '16px' }}
                label="ID"
                variant="outlined"
                fullWidth
                value={announcement_type.id}
                onChange={(e) => { if (!isNaN(e.target.value)) onUpdate({ ...announcement_type, id: e.target.value }); }}
            />
        </Grid>
        <Grid item xs={6} md={3}>
            <TextField
                style={{ marginBottom: '16px' }}
                label="Name"
                variant="outlined"
                fullWidth
                value={announcement_type.name}
                onChange={(e) => { onUpdate({ ...announcement_type, name: e.target.value }); }}
            />
        </Grid>
        <Grid item xs={12} md={6}>
            <RoleSelect initialRoles={announcement_type.staff_role_ids} onUpdate={(newRoles) => onUpdate({ ...announcement_type, staff_role_ids: newRoles.map((role) => (role.id)) })} label="Staff Roles" style={{ marginBottom: '16px' }} />
        </Grid>
    </Grid>;
};

const MemoAnnouncementTypeForm = memo(({ theme, formConfig }) => {
    return <>{formConfig.state.announcement_types.length === 0 &&
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" fontWeight="bold" sx={{ mb: "10px", flexGrow: 1 }}>
                No Announcement Types - Create + to create one
            </Typography>
            <IconButton variant="contained" color="success" onClick={() => {
                let newAnnouncementTypes = [{ id: 1, name: "New Announcement Type", staff_role_ids: [] }];
                formConfig.setState({ ...formConfig.state, announcement_types: newAnnouncementTypes });
            }}><FontAwesomeIcon icon={faPlus} /></IconButton>
        </div>}
        {formConfig.state.announcement_types.map((announcement_type, index) => (<>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" fontWeight="bold" sx={{ mb: "10px", flexGrow: 1 }}>
                    {announcement_type.name}
                </Typography>
                <div>
                    <IconButton variant="contained" color="success" onClick={() => {
                        let newAnnouncementTypes = [...formConfig.state.announcement_types];
                        let occupiedIds = [];
                        for (let i = 0; i < formConfig.state.announcement_types.length; i++) {
                            occupiedIds.push(Number(formConfig.state.announcement_types[i].id));
                        }
                        let nextId = announcement_type.id + 1;
                        while (occupiedIds.includes(nextId)) {
                            nextId += 1;
                        }
                        newAnnouncementTypes.splice(index + 1, 0, { id: nextId, name: "New Announcement Type", staff_role_ids: [] });
                        formConfig.setState({ ...formConfig.state, announcement_types: newAnnouncementTypes });
                    }}><FontAwesomeIcon icon={faPlus} /></IconButton>
                    <IconButton variant="contained" color="error" onClick={() => {
                        let newAnnouncementTypes = [...formConfig.state.announcement_types];
                        newAnnouncementTypes.splice(index, 1);
                        formConfig.setState({ ...formConfig.state, announcement_types: newAnnouncementTypes });
                    }}><FontAwesomeIcon icon={faMinus} disabled={formConfig.state.announcement_types.length <= 1} /></IconButton>
                    <IconButton variant="contained" color="info" onClick={() => {
                        if (index >= 1) {
                            let newAnnouncementTypes = [...formConfig.state.announcement_types];
                            newAnnouncementTypes[index] = newAnnouncementTypes[index - 1];
                            newAnnouncementTypes[index - 1] = announcement_type;
                            formConfig.setState({ ...formConfig.state, announcement_types: newAnnouncementTypes });
                        }
                    }}><FontAwesomeIcon icon={faArrowUp} disabled={index === 0} /></IconButton>
                    <IconButton variant="contained" color="warning" onClick={() => {
                        if (index <= formConfig.state.announcement_types.length - 2) {
                            let newAnnouncementTypes = [...formConfig.state.announcement_types];
                            newAnnouncementTypes[index] = newAnnouncementTypes[index + 1];
                            newAnnouncementTypes[index + 1] = announcement_type;
                            formConfig.setState({ ...formConfig.state, announcement_types: newAnnouncementTypes });
                        }
                    }} disabled={index === formConfig.state.announcement_types.length} ><FontAwesomeIcon icon={faArrowDown} /></IconButton>
                </div>
            </div>
            <AnnouncementTypeForm theme={theme} announcement_type={announcement_type} onUpdate={(newAnnouncementType) => {
                let newAnnouncementTypes = [...formConfig.state.announcement_types];
                newAnnouncementTypes[index] = newAnnouncementType;
                formConfig.setState({ ...formConfig.state, announcement_types: newAnnouncementTypes });
            }} />
        </>
        ))
        }</>;
});

const ApplicationFormForm = ({ theme, form_item, allLabels, onUpdate }) => {
    if (form_item.type === "info") {
        if (form_item.text === undefined) form_item.text = "";
    } else {
        if (form_item.label === undefined) form_item.label = "";
        if (form_item.type === "text" || form_item.type === "textarea") {
            if (form_item.min_length === undefined) form_item.min_length = 0;
            if (form_item.placeholder === undefined) form_item.placeholder = "";
            if (form_item.type === "textarea") {
                if (form_item.rows === undefined) form_item.min_length = 3;
            }
        }
        else if (form_item.type === "dropdown" || form_item.type === "radio" || form_item.type === "checkbox") {
            if (form_item.choices === undefined) form_item.choices = [];
        }
    }
    return <Grid container spacing={2} rowSpacing={-1} sx={{ mt: "5px", mb: "15px" }}>
        <Grid item xs={12} md={4}>
            <TextField select size="small"
                style={{ marginBottom: '16px' }}
                label="Type"
                variant="outlined"
                fullWidth
                value={form_item.type}
                onChange={(e) => { onUpdate({ ...form_item, type: e.target.value }); }}
            >
                <MenuItem value="info">Information</MenuItem>
                <MenuItem value="text">Short answer</MenuItem>
                <MenuItem value="textarea">Paragraph</MenuItem>
                <MenuItem value="number">Number</MenuItem>
                <MenuItem value="datetime">Date time</MenuItem>
                <MenuItem value="date">Date</MenuItem>
                <MenuItem value="dropdown">Dropdown</MenuItem>
                <MenuItem value="radio">Multiple choice</MenuItem>
                <MenuItem value="checkbox">Checkboxes</MenuItem>
            </TextField>
        </Grid>
        {form_item.type === "info" && <>
            <Grid item xs={12} md={12}>
                <TextField size="small"
                    style={{ marginBottom: '16px' }}
                    label="Text"
                    variant="outlined"
                    fullWidth
                    value={form_item.text}
                    rows={3}
                    onChange={(e) => { onUpdate({ ...form_item, text: e.target.value }); }}
                />
            </Grid>
        </>}
        {form_item.type === "text" && <>
            <Grid item xs={12} md={4}>
                <TextField size="small"
                    style={{ marginBottom: '16px' }}
                    label="Minimum Characters"
                    variant="outlined"
                    fullWidth
                    value={form_item.min_length}
                    onChange={(e) => { if (!isNaN(e.target.value)) onUpdate({ ...form_item, min_length: e.target.value }); }}
                />
            </Grid>
            <Grid item xs={12} md={12}>
                <TextField size="small"
                    style={{ marginBottom: '16px' }}
                    label="Question"
                    variant="outlined"
                    fullWidth
                    value={form_item.label}
                    onChange={(e) => { onUpdate({ ...form_item, label: e.target.value }); }}
                />
            </Grid>
            <Grid item xs={12} md={12}>
                <TextField size="small"
                    style={{ marginBottom: '16px' }}
                    label="Placeholder"
                    variant="outlined"
                    fullWidth
                    value={form_item.placeholder}
                    onChange={(e) => { onUpdate({ ...form_item, placeholder: e.target.value }); }}
                />
            </Grid>
        </>}
        {form_item.type === "textarea" && <>
            <Grid item xs={6} md={4}>
                <TextField size="small"
                    style={{ marginBottom: '16px' }}
                    label="Answer Rows"
                    variant="outlined"
                    fullWidth
                    value={form_item.rows}
                    onChange={(e) => { if (!isNaN(e.target.value)) onUpdate({ ...form_item, rows: e.target.value }); }}
                />
            </Grid>
            <Grid item xs={6} md={4}>
                <TextField size="small"
                    style={{ marginBottom: '16px' }}
                    label="Minimum Characters"
                    variant="outlined"
                    fullWidth
                    value={form_item.min_length}
                    onChange={(e) => { if (!isNaN(e.target.value)) onUpdate({ ...form_item, min_length: e.target.value }); }}
                />
            </Grid>
            <Grid item xs={12} md={12}>
                <TextField size="small"
                    style={{ marginBottom: '16px' }}
                    label="Question"
                    variant="outlined"
                    fullWidth
                    value={form_item.label}
                    onChange={(e) => { onUpdate({ ...form_item, label: e.target.value }); }}
                />
            </Grid>
            <Grid item xs={12} md={12}>
                <TextField size="small"
                    style={{ marginBottom: '16px' }}
                    label="Placeholder"
                    variant="outlined"
                    fullWidth
                    value={form_item.placeholder}
                    onChange={(e) => { onUpdate({ ...form_item, placeholder: e.target.value }); }}
                />
            </Grid>
        </>}

        {form_item.type === "number" && <>
            <Grid item xs={12} md={4}>
                <TextField size="small"
                    style={{ marginBottom: '16px' }}
                    label="Min Value"
                    variant="outlined"
                    fullWidth
                    value={form_item.min_value}
                    onChange={(e) => { if (!isNaN(e.target.value)) onUpdate({ ...form_item, min_value: e.target.value }); }}
                />
            </Grid>
            <Grid item xs={12} md={4}>
                <TextField size="small"
                    style={{ marginBottom: '16px' }}
                    label="Max Value"
                    variant="outlined"
                    fullWidth
                    value={form_item.max_value}
                    onChange={(e) => { if (!isNaN(e.target.value)) onUpdate({ ...form_item, max_value: e.target.value }); }}
                />
            </Grid>
            <Grid item xs={12} md={12}>
                <TextField size="small"
                    style={{ marginBottom: '16px' }}
                    label="Question"
                    variant="outlined"
                    fullWidth
                    value={form_item.label}
                    onChange={(e) => { onUpdate({ ...form_item, label: e.target.value }); }}
                />
            </Grid>
        </>}
        {(form_item.type === "date" || form_item.type === "datetime" || form_item.type === "dropdown" || form_item.type === "radio" || form_item.type === "checkbox") && <>
            <Grid item xs={12} md={12}>
                <TextField size="small"
                    style={{ marginBottom: '16px' }}
                    label="Question"
                    variant="outlined"
                    fullWidth
                    value={form_item.label}
                    onChange={(e) => { onUpdate({ ...form_item, label: e.target.value }); }}
                />
            </Grid>
        </>}
        {(form_item.type === "dropdown" || form_item.type === "radio" || form_item.type === "checkbox") && <>
            <Grid item xs={12} md={12} sx={{ marginBottom: "8px" }}>
                <Typography xs={12} variant="body2">
                    Choices
                </Typography>
                <CreatableSelect
                    isMulti
                    name="colors"
                    className="basic-multi-select"
                    classNamePrefix="select"
                    styles={customSelectStyles(theme)}
                    value={form_item.choices.map((choice) => ({ value: choice, label: choice }))}
                    onChange={(newChoices) => {
                        onUpdate({
                            ...form_item,
                            choices: newChoices.map((item) => item.value),
                        });
                    }}
                    menuPortalTarget={document.body}
                />
            </Grid>
        </>}
        <Grid item xs={12}>
            <FormControlLabel
                control={<Checkbox checked={form_item.x_must_be !== undefined} onChange={() => {
                    if (form_item.x_must_be === undefined) { onUpdate({ ...form_item, x_must_be: { label: "", value: "" } }); }
                    else { onUpdate({ ...form_item, x_must_be: undefined }); }
                }} />}
                label="Display condition (Based on answer to specific question)"
                size="small"
                style={{ marginTop: '-8px' }}
            />
        </Grid>
        {form_item.x_must_be !== undefined && <>
            <Grid item xs={12} md={6}>
                <TextField select size="small"
                    style={{ marginBottom: '16px' }}
                    label="Question"
                    variant="outlined"
                    fullWidth
                    value={form_item.x_must_be.label}
                    onChange={(e) => { onUpdate({ ...form_item, x_must_be: { ...form_item.x_must_be, label: e.target.value } }); }}
                >
                    {allLabels.map((label) => (<MenuItem value={label}>{label}</MenuItem>))}
                </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
                <TextField size="small"
                    style={{ marginBottom: '16px' }}
                    label="Answer"
                    variant="outlined"
                    fullWidth
                    value={form_item.x_must_be.value}
                    onChange={(e) => { onUpdate({ ...form_item, x_must_be: { ...form_item.x_must_be, value: e.target.value } }); }}
                />
            </Grid>
        </>}
    </Grid>;
};

const MemoApplicationFormForm = memo(({ theme, form, updateForm }) => {
    const [openIndex, setOpenIndex] = useState(-1);

    const TYPE_NAME = { "info": "Information", "text": "Short answer", "textarea": "Paragraph", "number": "Number", "datetime": "Date time", "date": "Date", "dropdown": "Dropdown", "radio": "Multiple choice", "checkbox": "Checkboxes" };
    if (form.length === 0) {
        return <div style={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" fontWeight="bold" sx={{ mb: "10px", flexGrow: 1 }}>
                No Form Question - Create + to create one
            </Typography>
            <IconButton variant="contained" color="success" onClick={() => {
                updateForm([{ "type": "info", "text": "Welcome to application form" }]);
            }}><FontAwesomeIcon icon={faPlus} /></IconButton>
        </div>;
    };
    const ApplicationFormItem = memo(({ form_item, index }) => {
        return <>
            <div key={`applicatio-form-div-${index}`} style={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', mb: "10px", flexGrow: 1, color: form_item.color }} onClick={() => openIndex === index ? setOpenIndex(-1) : setOpenIndex(index)}>
                    {TYPE_NAME[form_item.type]}
                </Typography>
                <div key={`form_item-control-div-${index}`}>
                    <IconButton style={{ transition: 'transform 0.2s', transform: openIndex === index ? 'rotate(180deg)' : 'none' }} onClick={() => setOpenIndex(index)}>
                        <ExpandMoreRounded />
                    </IconButton>
                    <IconButton variant="contained" color="success" onClick={() => {
                        let newForm = [...form];
                        setOpenIndex(index + 1);
                        newForm.splice(index + 1, 0, {
                            type: "text",
                            text: "New Question"
                        });
                        updateForm(newForm);
                    }}><FontAwesomeIcon icon={faPlus} disabled={form.length} /></IconButton>
                    <IconButton variant="contained" color="error" onClick={() => {
                        let newForm = [...form];
                        newForm.splice(index, 1);
                        updateFOrm(newForm);
                        setOpenIndex(-1);
                    }}><FontAwesomeIcon icon={faMinus} disabled={form.length <= 1} /></IconButton>
                    <IconButton variant="contained" color="info" onClick={() => {
                        if (index >= 1) {
                            let newForm = [...form];
                            newForm[index] = newForm[index - 1];
                            newForm[index - 1] = form_item;
                            updateForm(newForm);
                            if (openIndex === index) setOpenIndex(index - 1);
                        }
                    }}><FontAwesomeIcon icon={faArrowUp} disabled={index === 0} /></IconButton>
                    <IconButton variant="contained" color="warning" onClick={() => {
                        if (index <= form.length - 2) {
                            let newForm = [...form];
                            newForm[index] = newForm[index + 1];
                            newForm[index + 1] = form_item;
                            updateForm(newForm);
                            if (openIndex === index) setOpenIndex(index + 1);
                        }
                    }} disabled={index === form.length} ><FontAwesomeIcon icon={faArrowDown} /></IconButton>
                </div>
            </div>
        </>;
    });
    const BeforeOpen = memo(({ openIndex }) =>
        (<>{form.map((form_item, index) => ((index < openIndex || openIndex === -1) && <ApplicationFormItem form_item={form_item} index={index} />))}</>)
    );
    const AfterOpen = memo(({ openIndex }) =>
        (<>{form.map((form_item, index) => ((index > openIndex && openIndex !== -1) && <ApplicationFormItem form_item={form_item} index={index} />))}</>)
    );
    let form_item = form[openIndex];
    let index = openIndex;
    return <>
        {(openIndex > 0 || openIndex === -1) && <BeforeOpen openIndex={openIndex} />}
        {openIndex !== -1 && <>
            <div key={`form_item-form-div-${index}`} style={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', mb: "10px", flexGrow: 1, color: form_item.color }} onClick={() => openIndex === index ? setOpenIndex(-1) : setOpenIndex(index)}>
                    {TYPE_NAME[form_item.type]}
                </Typography>
                <div key={`form_item-control-div-${index}`}>
                    <IconButton style={{ transition: 'transform 0.2s', transform: openIndex === index ? 'rotate(180deg)' : 'none' }} onClick={() => setOpenIndex(index)}>
                        <ExpandMoreRounded />
                    </IconButton>
                    <IconButton variant="contained" color="success" onClick={(e) => {
                        let newForm = [...form];
                        setOpenIndex(index + 1);
                        newForm.splice(index + 1, 0, {
                            type: "text",
                            text: "New Question"
                        });
                        updateForm(newForm);
                    }}><FontAwesomeIcon icon={faPlus} disabled={form.length} /></IconButton>
                    <IconButton variant="contained" color="error" onClick={() => {
                        let newForm = [...form];
                        newForm.splice(index, 1);
                        updateFOrm(newForm);
                        setOpenIndex(-1);
                    }}><FontAwesomeIcon icon={faMinus} disabled={form.length <= 1} /></IconButton>
                    <IconButton variant="contained" color="info" onClick={() => {
                        if (index >= 1) {
                            let newForm = [...form];
                            newForm[index] = newForm[index - 1];
                            newForm[index - 1] = form_item;
                            updateForm(newForm);
                            if (openIndex === index) setOpenIndex(index - 1);
                        }
                    }}><FontAwesomeIcon icon={faArrowUp} disabled={index === 0} /></IconButton>
                    <IconButton variant="contained" color="warning" onClick={() => {
                        if (index <= form.length - 2) {
                            let newForm = [...form];
                            newForm[index] = newForm[index + 1];
                            newForm[index + 1] = form_item;
                            updateForm(newForm);
                            if (openIndex === index) setOpenIndex(index + 1);
                        }
                    }} disabled={index === form.length} ><FontAwesomeIcon icon={faArrowDown} /></IconButton>
                </div>
            </div>
            <ApplicationFormForm key={`application-form-input-div-${index}`} theme={theme} form_item={form_item} allLabels={form.filter((form_item) => form_item.label !== undefined).map((form_item) => form_item.label)} onUpdate={(item) => {
                let newForm = [...form];
                newForm[index] = item;
                updateForm(newForm);
            }} />
        </>}
        {openIndex !== -1 && openIndex < form.length - 1 && <AfterOpen openIndex={openIndex} />}
    </>;
});

const ApplicationTypeForm = ({ theme, application_type, onUpdate }) => {
    const [formModalOpen, setFormModalOpen] = useState(false);
    const [form, setForm] = useState(application_type.form !== undefined ? application_type.form : []);
    const [openIndex, setOpenIndex] = useState(-1);
    return <Grid container spacing={2} rowSpacing={-1} sx={{ mt: "5px", mb: "15px" }}>
        <Grid item xs={6} md={3}>
            <TextField
                style={{ marginBottom: '16px' }}
                label="ID"
                variant="outlined"
                fullWidth
                value={application_type.id}
                onChange={(e) => { if (!isNaN(e.target.value)) onUpdate({ ...application_type, id: e.target.value }); }}
            />
        </Grid>
        <Grid item xs={6} md={3}>
            <TextField
                style={{ marginBottom: '16px' }}
                label="Name"
                variant="outlined"
                fullWidth
                value={application_type.name}
                onChange={(e) => { onUpdate({ ...application_type, name: e.target.value }); }}
            />
        </Grid>
        <Grid item xs={12} md={6}>
            <RoleSelect initialRoles={application_type.staff_role_ids} onUpdate={(newRoles) => onUpdate({ ...application_type, staff_role_ids: newRoles.map((role) => (role.id)) })} label="Staff Roles" style={{ marginBottom: '16px' }} />
        </Grid>
        <Grid item xs={12} md={6}>
            <Typography variant="body2">Required Connections</Typography>
            <Select
                defaultValue={application_type.required_connections.map((connection) => ({ value: connection, label: connection === 'truckersmp' ? 'TruckersMP' : connection.charAt(0).toUpperCase() + connection.slice(1) }))}
                isMulti
                name="connections"
                options={[
                    { value: 'email', label: 'Email' },
                    { value: 'discord', label: 'Discord' },
                    { value: 'steam', label: 'Steam' },
                    { value: 'truckersmp', label: 'TruckersMP' }
                ]}
                className="basic-multi-select"
                classNamePrefix="select"
                styles={customSelectStyles(theme)}
                value={application_type.required_connections.map((connection) => ({ value: connection, label: connection === 'truckersmp' ? 'TruckersMP' : connection.charAt(0).toUpperCase() + connection.slice(1) }))}
                onChange={(newConnections) => {
                    onUpdate({
                        ...application_type,
                        required_connections: newConnections.map((item) => item.value),
                    });
                }}
                menuPortalTarget={document.body}
            />
        </Grid>
        <Grid item xs={4} md={6}>
            <TextField select
                style={{ marginBottom: '16px' }}
                label="Required Member State"
                variant="outlined"
                fullWidth
                value={application_type.required_member_state}
                onChange={(e) => { onUpdate({ ...application_type, required_member_state: e.target.value }); }}
            >
                <MenuItem value={-1}>No Requirement</MenuItem>
                <MenuItem value={0}>Not Member</MenuItem>
                <MenuItem value={1}>Is Member</MenuItem>
            </TextField>
        </Grid>
        <Grid item xs={4} md={3}>
            <TextField
                style={{ marginBottom: '16px' }}
                label="Cooldown Hours"
                variant="outlined"
                fullWidth
                value={application_type.cooldown_hours}
                onChange={(e) => { onUpdate({ ...application_type, cooldown_hours: e.target.value }); }}
            />
        </Grid>
        <Grid item xs={4} md={3}>
            <TextField select
                style={{ marginBottom: '16px' }}
                label="Multiple Pending Applications"
                variant="outlined"
                fullWidth
                value={application_type.allow_multiple}
                onChange={(e) => { onUpdate({ ...application_type, allow_multiple: e.target.value }); }}
            >
                <MenuItem value={true}>Allowed</MenuItem>
                <MenuItem value={false}>Prohibited</MenuItem>
            </TextField>
        </Grid>
        <Grid item xs={12} md={6}>
            <Typography variant="body2">Discord Role Changes (+ID / -ID)</Typography>
            <CreatableSelect
                defaultValue={application_type.role_change.map((role) => ({ value: role, label: role }))}
                isMulti
                name="roles"
                className="basic-multi-select"
                classNamePrefix="select"
                styles={customSelectStyles(theme)}
                value={application_type.role_change.map((role) => ({ value: role, label: role }))}
                onChange={(newRoles) => {
                    onUpdate({
                        ...application_type,
                        role_change: newRoles.map((item) => item.value),
                    });
                }}
                menuPortalTarget={document.body}
            />
        </Grid>
        <Grid item xs={12} md={6}>
            <RoleSelect initialRoles={application_type.required_either_user_role_ids} onUpdate={(newRoles) => onUpdate({ ...application_type, required_either_user_role_ids: newRoles.map((role) => (role.id)) })} label="Required User Roles (Any)" style={{ marginBottom: '16px' }} />
        </Grid>
        <Grid item xs={12} md={6}>
            <RoleSelect initialRoles={application_type.required_all_user_role_ids} onUpdate={(newRoles) => onUpdate({ ...application_type, required_all_user_role_ids: newRoles.map((role) => (role.id)) })} label="Required User Roles (All)" style={{ marginBottom: '16px' }} />
        </Grid>
        <Grid item xs={12} md={6}>
            <RoleSelect initialRoles={application_type.prohibited_either_user_role_ids} onUpdate={(newRoles) => onUpdate({ ...application_type, prohibited_either_user_role_ids: newRoles.map((role) => (role.id)) })} label="Prohibited User Roles (Any)" style={{ marginBottom: '16px' }} />
        </Grid>
        <Grid item xs={12} md={6}>
            <RoleSelect initialRoles={application_type.prohibited_all_user_role_ids} onUpdate={(newRoles) => onUpdate({ ...application_type, prohibited_all_user_role_ids: newRoles.map((role) => (role.id)) })} label="Prohibited User Roles (All)" style={{ marginBottom: '16px' }} />
        </Grid>
        <Grid item xs={6} md={4}>
            <TextField
                style={{ marginBottom: '16px' }}
                label="Discord Message"
                variant="outlined"
                fullWidth
                value={application_type.message}
                onChange={(e) => { onUpdate({ ...application_type, message: e.target.value }); }}
            />
        </Grid>
        <Grid item xs={6} md={4}>
            <TextField
                style={{ marginBottom: '16px' }}
                label="Discord Channel ID"
                variant="outlined"
                fullWidth
                value={application_type.channel_id}
                onChange={(e) => { if (!isNaN(e.target.value)) onUpdate({ ...application_type, channel_id: e.target.value }); }}
            />
        </Grid>
        <Grid item xs={6} md={4}>
            <TextField
                style={{ marginBottom: '16px' }}
                label="Discord Webhook (Alternative)"
                variant="outlined"
                fullWidth
                value={application_type.webhook_url}
                onChange={(e) => { onUpdate({ ...application_type, webhook_url: e.target.value }); }}
            />
        </Grid>
        <Grid item xs={12}>
            <Grid item xs={12}>
                <Grid container>
                    <Grid item xs={0} sm={6} md={8} lg={10}></Grid>
                    <Grid item xs={12} sm={6} md={4} lg={2}>
                        <Button variant="contained" color="primary" onClick={(e) => { e.preventDefault(); setFormModalOpen(true); }} startIcon={<FontAwesomeIcon icon={faWrench} />} fullWidth>Open Form Builder</Button>
                    </Grid>
                </Grid>
            </Grid>
            <Dialog open={formModalOpen} onClose={() => { setFormModalOpen(false); }} fullWidth>
                <DialogTitle>
                    <Typography variant="h6" sx={{ flexGrow: 1, display: 'flex', alignItems: "center" }}>
                        <FontAwesomeIcon icon={faWrench} />&nbsp;&nbsp;Form Builder
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <MemoApplicationFormForm theme={theme} form={form} updateForm={setForm}></MemoApplicationFormForm>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setFormModalOpen(false); }} variant="contained" color="secondary" sx={{ ml: 'auto' }}>
                        Close
                    </Button>
                    <Button onClick={() => { onUpdate({ ...application_type, form: form }); setFormModalOpen(false); }} variant="contained" color="success" sx={{ ml: 'auto' }}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Grid>
    </Grid>;
};

const MemoApplicationTypeForm = memo(({ theme, formConfig }) => {
    const [openIndex, setOpenIndex] = useState(-1);

    if (formConfig.state.application_types.length === 0) {
        return <div style={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" fontWeight="bold" sx={{ mb: "10px", flexGrow: 1 }}>
                No Application Types - Create + to create one
            </Typography>
            <IconButton variant="contained" color="success" onClick={() => {
                let newApplicationTypes = [{
                    id: 1,
                    name: "New Application Type",
                    staff_application_type_ids: [],
                    required_connections: [],
                    required_member_state: -1,
                    cooldown_hours: 0,
                    allow_multiple: false,
                    application_type_change: [],
                    required_either_user_application_type_ids: [],
                    required_all_user_application_type_ids: [],
                    prohibited_either_user_application_type_ids: [],
                    prohibited_all_user_application_type_ids: [],
                    message: "",
                    channel_id: "",
                    webhook_url: ""
                }];
                formConfig.setState({ ...formConfig.state, application_types: newApplicationTypes });
            }}><FontAwesomeIcon icon={faPlus} /></IconButton>
        </div>;
    };
    const ApplicationTypeItem = memo(({ application_type, index }) => {
        return <>
            <div key={`application-type-form-div-${index}`} style={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', mb: "10px", flexGrow: 1, color: application_type.color }} onClick={() => openIndex === index ? setOpenIndex(-1) : setOpenIndex(index)}>
                    {application_type.name}
                </Typography>
                <div key={`application-type-control-div-${index}`}>
                    <IconButton style={{ transition: 'transform 0.2s', transform: openIndex === index ? 'rotate(180deg)' : 'none' }} onClick={() => setOpenIndex(index)}>
                        <ExpandMoreRounded />
                    </IconButton>
                    <IconButton variant="contained" color="success" onClick={() => {
                        let newApplicationTypes = [...formConfig.state.application_types];
                        let nextId = application_type.id + 1;
                        let allUsedIds = [];
                        for (let i = 0; i < formConfig.state.application_types.length; i++) {
                            if (!isNaN(formConfig.state.application_types[i].id)) {
                                allUsedIds.push(Number(formConfig.state.application_types[i].id));
                            }
                        }
                        allUsedIds = allUsedIds.sort((a, b) => a - b);
                        for (let i = 0; i < allUsedIds.length; i++) {
                            if (allUsedIds[i] > application_type.id) {
                                if (allUsedIds[i] === nextId) {
                                    nextId += 1;
                                } else {
                                    break;
                                }
                            }
                        }
                        setOpenIndex(index + 1);
                        newApplicationTypes.splice(index + 1, 0, {
                            ...application_type,
                            id: nextId,
                            name: "New Application Type",
                        });
                        formConfig.setState({ ...formConfig.state, application_types: newApplicationTypes });
                    }}><FontAwesomeIcon icon={faPlus} disabled={formConfig.state.application_types.length} /></IconButton>
                    <IconButton variant="contained" color="error" onClick={() => {
                        let newApplicationTypes = [...formConfig.state.application_types];
                        newApplicationTypes.splice(index, 1);
                        formConfig.setState({ ...formConfig.state, application_types: newApplicationTypes });
                        setOpenIndex(-1);
                    }}><FontAwesomeIcon icon={faMinus} disabled={formConfig.state.application_types.length <= 1} /></IconButton>
                    <IconButton variant="contained" color="info" onClick={() => {
                        if (index >= 1) {
                            let newApplicationTypes = [...formConfig.state.application_types];
                            newApplicationTypes[index] = newApplicationTypes[index - 1];
                            newApplicationTypes[index - 1] = application_type;
                            formConfig.setState({ ...formConfig.state, application_types: newApplicationTypes });
                            if (openIndex === index) setOpenIndex(index - 1);
                        }
                    }}><FontAwesomeIcon icon={faArrowUp} disabled={index === 0} /></IconButton>
                    <IconButton variant="contained" color="warning" onClick={() => {
                        if (index <= formConfig.state.application_types.length - 2) {
                            let newApplicationTypes = [...formConfig.state.application_types];
                            newApplicationTypes[index] = newApplicationTypes[index + 1];
                            newApplicationTypes[index + 1] = application_type;
                            formConfig.setState({ ...formConfig.state, application_types: newApplicationTypes });
                            if (openIndex === index) setOpenIndex(index + 1);
                        }
                    }} disabled={index === formConfig.state.application_types.length} ><FontAwesomeIcon icon={faArrowDown} /></IconButton>
                </div>
            </div>
        </>;
    });
    const BeforeOpen = memo(({ openIndex }) =>
        (<>{formConfig.state.application_types.map((application_type, index) => ((index < openIndex || openIndex === -1) && <ApplicationTypeItem application_type={application_type} index={index} />))}</>)
    );
    const AfterOpen = memo(({ openIndex }) =>
        (<>{formConfig.state.application_types.map((application_type, index) => ((index > openIndex && openIndex !== -1) && <ApplicationTypeItem application_type={application_type} index={index} />))}</>)
    );
    let application_type = formConfig.state.application_types[openIndex];
    let index = openIndex;
    return <>
        {(openIndex > 0 || openIndex === -1) && <BeforeOpen openIndex={openIndex} />}
        {openIndex !== -1 && <>
            <div key={`application-type-form-div-${index}`} style={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', mb: "10px", flexGrow: 1, color: application_type.color }} onClick={() => openIndex === index ? setOpenIndex(-1) : setOpenIndex(index)}>
                    {application_type.name}
                </Typography>
                <div key={`application-type-control-div-${index}`}>
                    <IconButton style={{ transition: 'transform 0.2s', transform: openIndex === index ? 'rotate(180deg)' : 'none' }} onClick={() => setOpenIndex(index)}>
                        <ExpandMoreRounded />
                    </IconButton>
                    <IconButton variant="contained" color="success" onClick={(e) => {
                        let newApplicationTypes = [...formConfig.state.application_types];
                        let nextId = application_type.id + 1;
                        let allUsedIds = [];
                        for (let i = 0; i < formConfig.state.application_types.length; i++) {
                            if (!isNaN(formConfig.state.application_types[i].id)) {
                                allUsedIds.push(Number(formConfig.state.application_types[i].id));
                            }
                        }
                        allUsedIds = allUsedIds.sort((a, b) => a - b);
                        for (let i = 0; i < allUsedIds.length; i++) {
                            if (allUsedIds[i] > application_type.id) {
                                if (allUsedIds[i] === nextId) {
                                    nextId += 1;
                                } else {
                                    break;
                                }
                            }
                        }
                        setOpenIndex(index + 1);
                        newApplicationTypes.splice(index + 1, 0, { id: nextId, order_id: application_type.order_id + 1, name: "", color: "" });
                        formConfig.setState({ ...formConfig.state, application_types: newApplicationTypes });
                    }}><FontAwesomeIcon icon={faPlus} disabled={formConfig.state.application_types.length} /></IconButton>
                    <IconButton variant="contained" color="error" onClick={() => {
                        let newApplicationTypes = [...formConfig.state.application_types];
                        newApplicationTypes.splice(index, 1);
                        formConfig.setState({ ...formConfig.state, application_types: newApplicationTypes });
                        setOpenIndex(-1);
                    }}><FontAwesomeIcon icon={faMinus} disabled={formConfig.state.application_types.length <= 1} /></IconButton>
                    <IconButton variant="contained" color="info" onClick={() => {
                        if (index >= 1) {
                            let newApplicationTypes = [...formConfig.state.application_types];
                            newApplicationTypes[index] = newApplicationTypes[index - 1];
                            newApplicationTypes[index - 1] = application_type;
                            formConfig.setState({ ...formConfig.state, application_types: newApplicationTypes });
                            if (openIndex !== -1) setOpenIndex(index - 1);
                        }
                    }}><FontAwesomeIcon icon={faArrowUp} disabled={index === 0} /></IconButton>
                    <IconButton variant="contained" color="warning" onClick={() => {
                        if (index <= formConfig.state.application_types.length - 2) {
                            let newApplicationTypes = [...formConfig.state.application_types];
                            newApplicationTypes[index] = newApplicationTypes[index + 1];
                            newApplicationTypes[index + 1] = application_type;
                            formConfig.setState({ ...formConfig.state, application_types: newApplicationTypes });
                            if (openIndex !== -1) setOpenIndex(index + 1);
                        }
                    }} disabled={index === formConfig.state.application_types.length} ><FontAwesomeIcon icon={faArrowDown} /></IconButton>
                </div>
            </div>
            <ApplicationTypeForm key={`application-type-input-div-${index}`} theme={theme} application_type={application_type} onUpdate={(item) => {
                let newApplicationTypes = [...formConfig.state.application_types];
                newApplicationTypes[index] = item;
                formConfig.setState({ ...formConfig.state, application_types: newApplicationTypes });
            }} />
        </>}
        {openIndex !== -1 && openIndex < formConfig.state.application_types.length - 1 && <AfterOpen openIndex={openIndex} />}
    </>;
});

const DivisionForm = ({ theme, division, onUpdate }) => {
    return <Grid container spacing={2} rowSpacing={-1} sx={{ mt: "5px", mb: "15px" }}>
        <Grid item xs={6} md={3}>
            <TextField
                style={{ marginBottom: '16px' }}
                label="ID"
                variant="outlined"
                fullWidth
                value={division.id}
                onChange={(e) => { if (!isNaN(e.target.value)) onUpdate({ ...division, id: e.target.value }); }}
            />
        </Grid>
        <Grid item xs={6} md={3}>
            <TextField
                style={{ marginBottom: '16px' }}
                label="Name"
                variant="outlined"
                fullWidth
                value={division.name}
                onChange={(e) => { onUpdate({ ...division, name: e.target.value }); }}
            />
        </Grid>
        <Grid item xs={12} md={6}>
            <RoleSelect isMulti={false} initialRoles={[division.role_id]} onUpdate={(newRole) => onUpdate({ ...division, role_id: newRole })} label="Driver Role" style={{ marginBottom: '16px' }} />
        </Grid>
        <Grid item xs={6} md={3}>
            <TextField select
                style={{ marginBottom: '16px' }}
                label="Reward Type"
                variant="outlined"
                fullWidth
                value={division.points.mode}
                onChange={(e) => { onUpdate({ ...division, points: { ...division.points, mode: e.target.value } }); }}
            >
                <MenuItem value="static">Static</MenuItem>
                <MenuItem value="ratio">Percent of Distance</MenuItem>
            </TextField>
        </Grid>
        <Grid item xs={6} md={3}>
            <TextField
                style={{ marginBottom: '16px' }}
                label="Point / Percent"
                variant="outlined"
                fullWidth
                value={division.points.value}
                onChange={(e) => { if (!isNaN(e.target.value)) onUpdate({ ...division, points: { ...division.points, value: e.target.value } }); }}
            />
        </Grid>
        <Grid item xs={12} md={6}>
            <RoleSelect initialRoles={division.staff_role_ids} onUpdate={(newRoles) => onUpdate({ ...division, staff_role_ids: newRoles.map((role) => (role.id)) })} label="Staff Roles" style={{ marginBottom: '16px' }} />
        </Grid>
        <Grid item xs={12} md={4}>
            <TextField
                style={{ marginBottom: '16px' }}
                label="Discord Message"
                variant="outlined"
                fullWidth
                value={division.message}
                onChange={(e) => { onUpdate({ ...division, message: e.target.value }); }}
            />
        </Grid>
        <Grid item xs={6} md={4}>
            <TextField
                style={{ marginBottom: '16px' }}
                label="Discord Channel ID"
                variant="outlined"
                fullWidth
                value={division.channel_id}
                onChange={(e) => { if (!isNaN(e.target.value)) onUpdate({ ...division, channel_id: e.target.value }); }}
            />
        </Grid>
        <Grid item xs={6} md={4}>
            <TextField
                style={{ marginBottom: '16px' }}
                label="Discord Webhook (Alternative)"
                variant="outlined"
                fullWidth
                value={division.webhook_url}
                onChange={(e) => { onUpdate({ ...division, webhook_url: e.target.value }); }}
            />
        </Grid>
    </Grid>;
};

const MemoDivisionForm = memo(({ theme, formConfig }) => {
    return <>{formConfig.state.divisions.length === 0 &&
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" fontWeight="bold" sx={{ mb: "10px", flexGrow: 1 }}>
                No Divisions - Create + to create one
            </Typography>
            <IconButton variant="contained" color="success" onClick={() => {
                let newDivisions = [{ id: 1, name: "New Division", points: { mode: "static", value: 500 }, role_id: vars.perms.driver[0], staff_role_ids: [], message: "", channel_id: "", webhook_url: "" }];
                formConfig.setState({ ...formConfig.state, divisions: newDivisions });
            }}><FontAwesomeIcon icon={faPlus} /></IconButton>
        </div>}
        {formConfig.state.divisions.map((division, index) => (
            <>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" fontWeight="bold" sx={{ mb: "10px", flexGrow: 1 }}>
                        {division.name}
                    </Typography>
                    <div>
                        <IconButton variant="contained" color="success" onClick={() => {
                            let newDivisions = [...formConfig.state.divisions];
                            let occupiedIds = [];
                            for (let i = 0; i < formConfig.state.divisions.length; i++) {
                                occupiedIds.push(Number(formConfig.state.divisions[i].id));
                            }
                            let nextId = division.id + 1;
                            while (occupiedIds.includes(nextId)) {
                                nextId += 1;
                            }
                            newDivisions.splice(index + 1, 0, { id: nextId, name: "New Division", points: { mode: division.points.mode, value: division.points.value }, role_id: division.role_id, staff_role_ids: [], message: division.message, channel_id: division.channel_id, webhook_url: division.webhook_url });
                            formConfig.setState({ ...formConfig.state, divisions: newDivisions });
                        }}><FontAwesomeIcon icon={faPlus} /></IconButton>
                        <IconButton variant="contained" color="error" onClick={() => {
                            let newDivisions = [...formConfig.state.divisions];
                            newDivisions.splice(index, 1);
                            formConfig.setState({ ...formConfig.state, divisions: newDivisions });
                        }}><FontAwesomeIcon icon={faMinus} disabled={formConfig.state.divisions.length <= 1} /></IconButton>
                        <IconButton variant="contained" color="info" onClick={() => {
                            if (index >= 1) {
                                let newDivisions = [...formConfig.state.divisions];
                                newDivisions[index] = newDivisions[index - 1];
                                newDivisions[index - 1] = division;
                                formConfig.setState({ ...formConfig.state, divisions: newDivisions });
                            }
                        }}><FontAwesomeIcon icon={faArrowUp} disabled={index === 0} /></IconButton>
                        <IconButton variant="contained" color="warning" onClick={() => {
                            if (index <= formConfig.state.divisions.length - 2) {
                                let newDivisions = [...formConfig.state.divisions];
                                newDivisions[index] = newDivisions[index + 1];
                                newDivisions[index + 1] = division;
                                formConfig.setState({ ...formConfig.state, divisions: newDivisions });
                            }
                        }} disabled={index === formConfig.state.divisions.length} ><FontAwesomeIcon icon={faArrowDown} /></IconButton>
                    </div>
                </div>
                <DivisionForm theme={theme} division={division} onUpdate={(newDivision) => {
                    let newDivisions = [...formConfig.state.divisions];
                    newDivisions[index] = newDivision;
                    formConfig.setState({ ...formConfig.state, divisions: newDivisions });
                }} />
            </>
        ))
        }</>;
});

function exportCsv(columns, data, filename) {
    const csv = Papa.unparse({
        fields: columns,
        data: data
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    saveAs(blob, filename);
}

async function importCsv(columns, event) {
    return new Promise((resolve, reject) => {
        Papa.parse(event.target.files[0], {
            header: true,
            complete: function (results) {
                const data = results.data.map(row => {
                    let obj = {};
                    for (let key in row) {
                        obj[key] = isNaN(row[key]) ? row[key] : parseInt(row[key]);
                    }
                    return obj;
                });
                resolve(data);
            },
            error: function (err) {
                reject(err);
            }
        });
    });
}

const MemoEconomyForm = memo(({ theme, formConfig }) => {
    const defaultConfig = {
        "truck_refund": 0.3,
        "scrap_refund": 0.1,
        "garage_refund": 0.5,
        "slot_refund": 0.5,
        "usd_to_coin": 0.5,
        "eur_to_coin": 0.6,
        "wear_ratio": 1,
        "revenue_share_to_company": 0.4,
        "truck_rental_cost": 0.4,
        "max_wear_before_service": 0.1,
        "max_distance_before_scrap": 500000,
        "unit_service_price": 1200,
        "allow_purchase_truck": true,
        "allow_purchase_garage": true,
        "allow_purchase_slot": true,
        "allow_purchase_merch": true,
        "enable_balance_leaderboard": true,
        "currency_name": "coin",
    };

    const configName = {
        "truck_refund": "Truck Refund",
        "scrap_refund": "Scrap Refund",
        "garage_refund": "Garage Refund",
        "slot_refund": "Slot Refund",
        "usd_to_coin": "USD to Coin",
        "eur_to_coin": "EUR to Coin",
        "wear_ratio": "Wear Ratio",
        "revenue_share_to_company": "Revenue Share to Company",
        "truck_rental_cost": "Truck Rental Cost",
        "max_wear_before_service": "Max Wear Before Service",
        "max_distance_before_scrap": "Max Distance Before Scrap",
        "unit_service_price": "Unit Service Price",
        "allow_purchase_truck": "Allow Purchase Truck",
        "allow_purchase_garage": "Allow Purchase Garage",
        "allow_purchase_slot": "Allow Purchase Slot",
        "allow_purchase_merch": "Allow Purchase Merch",
        "enable_balance_leaderboard": "Enable Balance Leaderboard",
        "currency_name": "Currency Name",
    };


    return (
        <>
            <Typography variant="body2">
                You will have to import/export the csv file for trucks, garages and merch. You should first do export, make modifications on the exported file, and import it back, so you will be formatting the file correctly.
            </Typography>
            <ButtonGroup sx={{ margin: "5px", mb: "10px" }}>
                <Button component="label" variant="contained" color="success" startIcon={<FontAwesomeIcon icon={faFileImport} />}>
                    Import Trucks
                    <VisuallyHiddenInput type="file" property={{ accept: 'text/csv' }} onChange={async (e) => { formConfig.setState({ ...formConfig.state, economy: { ...formConfig.state.economy, trucks: await importCsv(["id", "game", "brand", "model", "price"], e) } }); }} /></Button>
                <Button variant="contained" color="info" startIcon={<FontAwesomeIcon icon={faFileExport} />} onClick={() => { exportCsv(["id", "game", "brand", "model", "price"], formConfig.state.economy.trucks, 'trucks.csv'); }}>Export Trucks</Button>
            </ButtonGroup>
            <ButtonGroup sx={{ margin: "5px", mb: "10px" }}>
                <Button component="label" variant="contained" color="success" startIcon={<FontAwesomeIcon icon={faFileImport} />}>
                    Import Garages
                    <VisuallyHiddenInput type="file" property={{ accept: 'text/csv' }} onChange={async (e) => { formConfig.setState({ ...formConfig.state, economy: { ...formConfig.state.economy, garages: await importCsv(["id", "name", "game", "x", "z", "price", "base_slots", "slot_price"], e) } }); }} /></Button>
                <Button variant="contained" color="info" startIcon={<FontAwesomeIcon icon={faFileExport} />} onClick={() => { exportCsv(["id", "name", "game", "x", "z", "price", "base_slots", "slot_price"], formConfig.state.economy.garages, 'garages.csv'); }}>Export Garages</Button>
            </ButtonGroup>
            <ButtonGroup sx={{ margin: "5px", mb: "10px" }}>
                <Button component="label" variant="contained" color="success" startIcon={<FontAwesomeIcon icon={faFileImport} />}>
                    Import Merch
                    <VisuallyHiddenInput type="file" property={{ accept: 'text/csv' }} onChange={async (e) => { formConfig.setState({ ...formConfig.state, economy: { ...formConfig.state.economy, merch: await importCsv(["id", "name", "buy_price", "sell_price"], e) } }); }} /></Button>
                <Button variant="contained" color="info" startIcon={<FontAwesomeIcon icon={faFileExport} />} onClick={() => { exportCsv(["id", "name", "buy_price", "sell_price"], formConfig.state.economy.merch, 'merch.csv'); }}>Export Merch</Button>
            </ButtonGroup>
            <Grid container spacing={2} rowSpacing={-1} sx={{ mt: "5px", mb: "15px" }}>
                {Object.entries(defaultConfig).map(([key, value]) => {
                    switch (typeof value) {
                        case 'boolean':
                            return (
                                <Grid item xs={6} md={3} key={key}>
                                    <TextField size="small" select
                                        label={configName[key]}
                                        variant="outlined"
                                        fullWidth
                                        style={{ marginBottom: '16px' }}
                                        value={formConfig.state.economy[key]}
                                        onChange={(e) => { formConfig.setState({ ...formConfig.state, economy: { ...formConfig.state.economy, [key]: e.target.value } }); }}
                                    >
                                        <MenuItem value={true}>Yes</MenuItem>
                                        <MenuItem value={false}>No</MenuItem>
                                    </TextField>
                                </Grid>
                            );
                        case 'string':
                            return (
                                <Grid item xs={6} md={3} key={key}>
                                    <TextField size="small"
                                        label={configName[key]}
                                        variant="outlined"
                                        fullWidth
                                        style={{ marginBottom: '16px' }}
                                        value={formConfig.state.economy[key]}
                                        onChange={(e) => { formConfig.setState({ ...formConfig.state, economy: { ...formConfig.state.economy, [key]: e.target.value } }); }}
                                    />
                                </Grid>
                            );
                        default:
                            return (
                                <Grid item xs={6} md={3} key={key}>
                                    <TextField size="small"
                                        label={configName[key]}
                                        variant="outlined"
                                        fullWidth
                                        style={{ marginBottom: '16px' }}
                                        value={formConfig.state.economy[key]}
                                        onChange={(e) => { formConfig.setState({ ...formConfig.state, economy: { ...formConfig.state.economy, [key]: isNaN(e.target.value) ? value : Number(e.target.value) } }); }}
                                    />
                                </Grid>
                            );
                    }
                })}
            </Grid>
        </>
    );
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

    const [webConfig, setWebConfig] = useState({ ...vars.dhconfig, name_color: vars.dhconfig.name_color !== null ? vars.dhconfig.name_color : "/", theme_main_color: vars.dhconfig.theme_main_color !== null ? vars.dhconfig.theme_main_color : "/", theme_background_color: vars.dhconfig.theme_background_color !== null ? vars.dhconfig.theme_background_color : "/" });
    const [webConfigDisabled, setWebConfigDisabled] = useState(false);
    const saveWebConfig = useCallback(async () => {
        const loadingStart = new CustomEvent('loadingStart', {});
        window.dispatchEvent(loadingStart);
        setWebConfigDisabled(true);

        function parse_color(s) {
            if (s.startsWith("#")) {
                return parseInt(s.substring(1), 16);
            } else {
                return -1;
            }
        }

        let newWebConfig = { ...webConfig, name_color: parse_color(webConfig.name_color), theme_main_color: parse_color(webConfig.theme_main_color), theme_background_color: parse_color(webConfig.theme_background_color) };

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

        resp = await axios({ url: `https://config.chub.page/config?domain=${vars.dhconfig.domain}`, data: { config: newWebConfig }, method: "PATCH", headers: { Authorization: `Ticket ${ticket}` } });
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
    const [formConfigOrg, setFormConfigOrg] = useState({});
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
        const secret_keys = ["discord_client_secret", "discord_bot_token", "steam_api_key", "smtp_port", "smtp_password"];
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
            setFormConfigOrg(_apiConfig.config);
            setApiConfig(JSON.stringify(_apiConfig.config, null, 4));
            setApiBackup(JSON.stringify(_apiConfig.backup, null, 4));
            setApiLastModify(_apiConfig.config_last_modified);

            if (_apiConfig.config.trackers.length === 0) _apiConfig.config.trackers = [{ "type": "trucky", "company_id": "", "api_token": "", "webhook_secret": "", ip_whitelist: [] }];
            let sections = Object.keys(CONFIG_SECTIONS);
            for (let i = 0; i < sections.length; i++) {
                let partialConfig = {};
                let section_keys = CONFIG_SECTIONS[sections[i]];
                for (let j = 0; j < section_keys.length; j++) {
                    partialConfig[section_keys[j]] = _apiConfig.config[section_keys[j]];
                }
                if (sections[i] === "rank") {
                    partialConfig = { ranks: partialConfig.rank_types && partialConfig.rank_types.length > 0 ? partialConfig.rank_types[0].details : [] };
                }
                formConfig[CONFIG_SECTIONS_INDEX[sections[i]]].setState(partialConfig);
            }
            setFormConfigReady(true);

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

        if (section === "rank") {
            let rankTypes = [...formConfigOrg.rank_types];
            if (rankTypes.length > 0) {
                rankTypes[0].details = config.ranks;
            }
            config = { rank_types: rankTypes };
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
    }, [formConfig, formConfigOrg]);

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
                    - This is the simple mode of config editing with form.
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
                                                <ButtonGroup fullWidth>
                                                    <Button variant="contained" color="error" onClick={() => { showReloadApiConfig(); }}>Reload</Button>
                                                    <Button variant="contained" color="success" onClick={() => { saveFormConfig("general"); }} disabled={apiConfigDisabled}>Save</Button>
                                                </ButtonGroup>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Collapse>}

                            <Typography variant="h6" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleFormToggle(1)}>
                                <div style={{ flexGrow: 1 }}>Account & Profile</div>
                                <IconButton style={{ transition: 'transform 0.2s', transform: formSectionOpen[1] ? 'rotate(180deg)' : 'none' }}>
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
                                                <ButtonGroup fullWidth>
                                                    <Button variant="contained" color="error" onClick={() => { showReloadApiConfig(); }}>Reload</Button>
                                                    <Button variant="contained" color="success" onClick={() => { saveFormConfig("profile"); }} disabled={apiConfigDisabled}>Save</Button>
                                                </ButtonGroup>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Collapse>}

                            <Typography variant="h6" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleFormToggle(2)}>
                                <div style={{ flexGrow: 1 }}>Tracker</div>
                                <IconButton style={{ transition: 'transform 0.2s', transform: formSectionOpen[2] ? 'rotate(180deg)' : 'none' }}>
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
                                            <ButtonGroup fullWidth>
                                                <Button variant="contained" color="error" onClick={() => { showReloadApiConfig(); }}>Reload</Button>
                                                <Button variant="contained" color="success" onClick={() => { saveFormConfig("tracker"); }} disabled={apiConfigDisabled}>Save</Button>
                                            </ButtonGroup>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Collapse>}

                            <Typography variant="h6" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleFormToggle(3)}>
                                <div style={{ flexGrow: 1 }}>Job Logging</div>
                                <IconButton style={{ transition: 'transform 0.2s', transform: formSectionOpen[3] ? 'rotate(180deg)' : 'none' }}>
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
                                                <ButtonGroup fullWidth>
                                                    <Button variant="contained" color="error" onClick={() => { showReloadApiConfig(); }}>Reload</Button>
                                                    <Button variant="contained" color="success" onClick={() => { saveFormConfig("dlog"); }} disabled={apiConfigDisabled}>Save</Button>
                                                </ButtonGroup>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Collapse>}

                            <Typography variant="h6" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleFormToggle(4)}>
                                <div style={{ flexGrow: 1 }}>Discord & Steam API</div>
                                <IconButton style={{ transition: 'transform 0.2s', transform: formSectionOpen[4] ? 'rotate(180deg)' : 'none' }}>
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
                                                <ButtonGroup fullWidth>
                                                    <Button variant="contained" color="error" onClick={() => { showReloadApiConfig(); }}>Reload</Button>
                                                    <Button variant="contained" color="success" onClick={() => { saveFormConfig("discord-steam"); }} disabled={apiConfigDisabled}>Save</Button>
                                                </ButtonGroup>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Collapse>}

                            <Typography variant="h6" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleFormToggle(6)}>
                                <div style={{ flexGrow: 1 }}>SMTP & Email</div>
                                <IconButton style={{ transition: 'transform 0.2s', transform: formSectionOpen[6] ? 'rotate(180deg)' : 'none' }}>
                                    <ExpandMoreRounded />
                                </IconButton>
                            </Typography>
                            {formSectionRender[6] && <Collapse in={formSectionOpen[6]}>
                                <Typography variant="body2" sx={{ mb: "15px" }}>
                                    NOTE: Password is shown empty for security purpose. It should be saved server-end.<br />
                                    HINT: When SMTP is correctly configured, email register and password reset will be unlocked.
                                </Typography>
                                <Grid container spacing={2} rowSpacing={-1} sx={{ mt: "5px" }}>
                                    <MemoSmtpForm theme={theme} formConfig={formConfig[6]} />
                                    <Grid item xs={12}>
                                        <Grid container>
                                            <Grid item xs={0} sm={6} md={8} lg={10}></Grid>
                                            <Grid item xs={12} sm={6} md={4} lg={2}>
                                                <ButtonGroup fullWidth>
                                                    <Button variant="contained" color="error" onClick={() => { showReloadApiConfig(); }}>Reload</Button>
                                                    <Button variant="contained" color="success" onClick={() => { saveFormConfig("smtp"); }} disabled={apiConfigDisabled}>Save</Button>
                                                </ButtonGroup>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Collapse>}

                            <Typography variant="h6" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleFormToggle(11)}>
                                <div style={{ flexGrow: 1 }}>Member Events</div>
                                <IconButton style={{ transition: 'transform 0.2s', transform: formSectionOpen[11] ? 'rotate(180deg)' : 'none' }}>
                                    <ExpandMoreRounded />
                                </IconButton>
                            </Typography>
                            {formSectionRender[11] && <Collapse in={formSectionOpen[11]}>
                                <Typography variant="body2" sx={{ mb: "15px" }}>
                                    You could edit the Discord message sent upon the following events.
                                </Typography>
                                <Grid container spacing={2} rowSpacing={-1} sx={{ mt: "5px" }}>
                                    <MemoDiscordMemberForm theme={theme} formConfig={formConfig[11]} />
                                    <Grid item xs={12}>
                                        <Grid container>
                                            <Grid item xs={0} sm={6} md={8} lg={10}></Grid>
                                            <Grid item xs={12} sm={6} md={4} lg={2}>
                                                <ButtonGroup fullWidth>
                                                    <Button variant="contained" color="error" onClick={() => { showReloadApiConfig(); }}>Reload</Button>
                                                    <Button variant="contained" color="success" onClick={() => { saveFormConfig("discord-member"); }} disabled={apiConfigDisabled}>Save</Button>
                                                </ButtonGroup>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Collapse>}

                            <Typography variant="h6" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleFormToggle(5)}>
                                <div style={{ flexGrow: 1 }}>Roles</div>
                                <IconButton style={{ transition: 'transform 0.2s', transform: formSectionOpen[5] ? 'rotate(180deg)' : 'none' }}>
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
                                            <ButtonGroup fullWidth>
                                                <Button variant="contained" color="error" onClick={() => { showReloadApiConfig(); }}>Reload</Button>
                                                <Button variant="contained" color="success" onClick={() => { saveFormConfig("role"); }} disabled={apiConfigDisabled}>Save</Button>
                                            </ButtonGroup>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Collapse>}

                            <Typography variant="h6" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleFormToggle(7)}>
                                <div style={{ flexGrow: 1 }}>Ranks</div>
                                <IconButton style={{ transition: 'transform 0.2s', transform: formSectionOpen[7] ? 'rotate(180deg)' : 'none' }}>
                                    <ExpandMoreRounded />
                                </IconButton>
                            </Typography>
                            {formSectionRender[7] && <Collapse in={formSectionOpen[7]}>
                                <Typography variant="body2" sx={{ mb: "15px" }}>
                                    NOTE: The form config editor only supports editing one type of rank. If you are willing to configure multiple types of ranks, like distance ranking and event ranking, you will have to use JSON config editor.
                                </Typography>
                                <MemoRankForm theme={theme} formConfig={formConfig[7]} />
                                <Grid item xs={12}>
                                    <Grid container>
                                        <Grid item xs={0} sm={6} md={8} lg={10}></Grid>
                                        <Grid item xs={12} sm={6} md={4} lg={2}>
                                            <ButtonGroup fullWidth>
                                                <Button variant="contained" color="error" onClick={() => { showReloadApiConfig(); }}>Reload</Button>
                                                <Button variant="contained" color="success" onClick={() => { saveFormConfig("rank"); }} disabled={apiConfigDisabled}>Save</Button>
                                            </ButtonGroup>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Collapse>}

                            {vars.dhconfig.plugins.includes("announcement") && <><Typography variant="h6" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleFormToggle(8)}>
                                <div style={{ flexGrow: 1 }}>Announcement</div>
                                <IconButton style={{ transition: 'transform 0.2s', transform: formSectionOpen[8] ? 'rotate(180deg)' : 'none' }}>
                                    <ExpandMoreRounded />
                                </IconButton>
                            </Typography>
                                {formSectionRender[8] && <Collapse in={formSectionOpen[8]}>
                                    <MemoAnnouncementTypeForm theme={theme} formConfig={formConfig[8]} />
                                    <Grid item xs={12}>
                                        <Grid container>
                                            <Grid item xs={0} sm={6} md={8} lg={10}></Grid>
                                            <Grid item xs={12} sm={6} md={4} lg={2}>
                                                <ButtonGroup fullWidth>
                                                    <Button variant="contained" color="error" onClick={() => { showReloadApiConfig(); }}>Reload</Button>
                                                    <Button variant="contained" color="success" onClick={() => { saveFormConfig("announcement"); }} disabled={apiConfigDisabled}>Save</Button>
                                                </ButtonGroup>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Collapse>}
                            </>}

                            {vars.dhconfig.plugins.includes("application") && <><Typography variant="h6" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleFormToggle(10)}>
                                <div style={{ flexGrow: 1 }}>Application</div>
                                <IconButton style={{ transition: 'transform 0.2s', transform: formSectionOpen[10] ? 'rotate(180deg)' : 'none' }}>
                                    <ExpandMoreRounded />
                                </IconButton>
                            </Typography>
                                {formSectionRender[10] && <Collapse in={formSectionOpen[10]}>
                                    <MemoApplicationTypeForm theme={theme} formConfig={formConfig[10]} />
                                    <Grid item xs={12}>
                                        <Grid container>
                                            <Grid item xs={0} sm={6} md={8} lg={10}></Grid>
                                            <Grid item xs={12} sm={6} md={4} lg={2}>
                                                <ButtonGroup fullWidth>
                                                    <Button variant="contained" color="error" onClick={() => { showReloadApiConfig(); }}>Reload</Button>
                                                    <Button variant="contained" color="success" onClick={() => { saveFormConfig("application"); }} disabled={apiConfigDisabled}>Save</Button>
                                                </ButtonGroup>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Collapse>}
                            </>}

                            {vars.dhconfig.plugins.includes("division") && <><Typography variant="h6" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleFormToggle(9)}>
                                <div style={{ flexGrow: 1 }}>Division</div>
                                <IconButton style={{ transition: 'transform 0.2s', transform: formSectionOpen[9] ? 'rotate(180deg)' : 'none' }}>
                                    <ExpandMoreRounded />
                                </IconButton>
                            </Typography>
                                {formSectionRender[9] && <Collapse in={formSectionOpen[9]}>
                                    <MemoDivisionForm theme={theme} formConfig={formConfig[9]} />
                                    <Grid item xs={12}>
                                        <Grid container>
                                            <Grid item xs={0} sm={6} md={8} lg={10}></Grid>
                                            <Grid item xs={12} sm={6} md={4} lg={2}>
                                                <ButtonGroup fullWidth>
                                                    <Button variant="contained" color="error" onClick={() => { showReloadApiConfig(); }}>Reload</Button>
                                                    <Button variant="contained" color="success" onClick={() => { saveFormConfig("division"); }} disabled={apiConfigDisabled}>Save</Button>
                                                </ButtonGroup>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Collapse>}
                            </>}

                            {vars.dhconfig.plugins.includes("economy") && <><Typography variant="h6" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleFormToggle(13)}>
                                <div style={{ flexGrow: 1 }}>Economy</div>
                                <IconButton style={{ transition: 'transform 0.2s', transform: formSectionOpen[13] ? 'rotate(180deg)' : 'none' }}>
                                    <ExpandMoreRounded />
                                </IconButton>
                            </Typography>
                                {formSectionRender[13] && <Collapse in={formSectionOpen[13]}>
                                    <MemoEconomyForm theme={theme} formConfig={formConfig[13]} />
                                    <Grid item xs={12}>
                                        <Grid container>
                                            <Grid item xs={0} sm={6} md={8} lg={10}></Grid>
                                            <Grid item xs={12} sm={6} md={4} lg={2}>
                                                <ButtonGroup fullWidth>
                                                    <Button variant="contained" color="error" onClick={() => { showReloadApiConfig(); }}>Reload</Button>
                                                    <Button variant="contained" color="success" onClick={() => { saveFormConfig("economy"); }} disabled={apiConfigDisabled}>Save</Button>
                                                </ButtonGroup>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Collapse>}
                            </>}

                            <Typography variant="h6" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleFormToggle(12)}>
                                <div style={{ flexGrow: 1 }}>Other Events</div>
                                <IconButton style={{ transition: 'transform 0.2s', transform: formSectionOpen[12] ? 'rotate(180deg)' : 'none' }}>
                                    <ExpandMoreRounded />
                                </IconButton>
                            </Typography>
                            {formSectionRender[12] && <Collapse in={formSectionOpen[12]}>
                                <Typography variant="body2" sx={{ mb: "15px" }}>
                                    You could edit the Discord message sent upon the following events.
                                </Typography>
                                <Grid container spacing={2} rowSpacing={-1} sx={{ mt: "5px" }}>
                                    <MemoDiscordOtherForm theme={theme} formConfig={formConfig[12]} />
                                    <Grid item xs={12}>
                                        <Grid container>
                                            <Grid item xs={0} sm={6} md={8} lg={10}></Grid>
                                            <Grid item xs={12} sm={6} md={4} lg={2}>
                                                <ButtonGroup fullWidth>
                                                    <Button variant="contained" color="error" onClick={() => { showReloadApiConfig(); }}>Reload</Button>
                                                    <Button variant="contained" color="success" onClick={() => { saveFormConfig("discord-other"); }} disabled={apiConfigDisabled}>Save</Button>
                                                </ButtonGroup>
                                            </Grid>
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
                    {apiConfigSelectionStart !== null && !isNaN(apiConfigSelectionStart - apiConfig.lastIndexOf('\n', apiConfigSelectionStart - 1)) && <InputLabel sx={{ color: theme.palette.text.secondary, fontSize: "0.8em", mb: "8px" }}>
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
                    - Logo, banner and background image must be smaller than 2MB in size.
                    <br />
                    - The "URL" refers to a valid URL to download the image from, default empty for no changes.
                    <br />
                    <br />
                    - Name color, theme color and background image are only avaialble for Premium Plan.
                    <br />
                    - User may choose to enable VTC name color and theme.
                </Typography>
                <Grid container spacing={2} sx={{ mt: "5px" }}>
                    <Grid item xs={12} sm={12} md={4} lg={4}>
                        <TextField
                            label="Company Name"
                            value={webConfig.name}
                            onChange={(e) => { setWebConfig({ ...webConfig, name: e.target.value }); }}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={12} md={4} lg={4}>
                        <TextField
                            label="Theme Color"
                            value={webConfig.color}
                            onChange={(e) => { setWebConfig({ ...webConfig, color: e.target.value }); }}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={12} md={4} lg={4}>
                        <TextField select
                            label={<>Name Color&nbsp;&nbsp;<SponsorBadge vtclevel={3} /></>}
                            value={webConfig.use_highest_role_color}
                            onChange={(e) => { setWebConfig({ ...webConfig, use_highest_role_color: e.target.value }); }}
                            fullWidth
                        >
                            <MenuItem value={false}>Default</MenuItem>
                            <MenuItem value={true}>Highest role color when not customized</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={12} md={4} lg={4}>
                        <TextField
                            label="Logo URL"
                            value={webConfig.logo_url}
                            onChange={(e) => { setWebConfig({ ...webConfig, logo_url: e.target.value }); }}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={12} md={4} lg={4}>
                        <TextField
                            label="Banner URL"
                            value={webConfig.banner_url}
                            onChange={(e) => { setWebConfig({ ...webConfig, banner_url: e.target.value }); }}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={12} md={4} lg={4}>
                        <TextField
                            label={<>Background URL&nbsp;&nbsp;<SponsorBadge vtclevel={1} /></>}
                            value={webConfig.bgimage_url}
                            onChange={(e) => { setWebConfig({ ...webConfig, bgimage_url: e.target.value }); }}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={12} md={6} lg={6}>
                        <Typography variant="h7" sx={{ fontWeight: 800 }}>Name Color&nbsp;&nbsp;<SponsorBadge vtclevel={1} /></Typography>
                        <br />
                        <ColorInput color={webConfig.name_color} onChange={(to) => { setWebConfig({ ...webConfig, name_color: to }); }} />
                    </Grid>
                    <Grid item xs={12} sm={12} md={6} lg={6}>
                        <Typography variant="h7" sx={{ fontWeight: 800 }}>Theme Opacity&nbsp;&nbsp;<SponsorBadge vtclevel={1} /></Typography>
                        <br />
                        <Slider value={webConfig.theme_darken_ratio * 100} onChange={(e, val) => { setWebConfig({ ...webConfig, theme_darken_ratio: val / 100 }); }} aria-labelledby="continuous-slider" sx={{ color: theme.palette.info.main, height: "20px" }} />
                    </Grid>
                    <Grid item xs={12} sm={12} md={6} lg={6}>
                        <Typography variant="h7" sx={{ fontWeight: 800 }}>Theme Main Color&nbsp;&nbsp;<SponsorBadge vtclevel={1} /></Typography>
                        <br />
                        <ColorInput color={webConfig.theme_main_color} onChange={(to) => { setWebConfig({ ...webConfig, theme_main_color: to }); }} />
                    </Grid>
                    <Grid item xs={12} sm={12} md={6} lg={6}>
                        <Typography variant="h7" sx={{ fontWeight: 800 }}>Theme Background Color&nbsp;&nbsp;<SponsorBadge vtclevel={1} /></Typography>
                        <br />
                        <ColorInput color={webConfig.theme_background_color} onChange={(to) => { setWebConfig({ ...webConfig, theme_background_color: to }); }} />
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

export default Configuration;;