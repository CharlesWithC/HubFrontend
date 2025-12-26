import { useState, useEffect, useCallback, memo, useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { AppContext } from "../context";

import { Card, Typography, Button, ButtonGroup, Box, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, InputLabel, Tabs, Tab, Collapse, IconButton, MenuItem, Checkbox, FormControlLabel, Slider, Divider, useTheme, Tooltip } from "@mui/material";
import { ExpandMoreRounded } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import Portal from "@mui/material/Portal";
import { customSelectStyles } from "../designs";

import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import Papa from "papaparse";
import { saveAs } from "file-saver";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faServer, faClockRotateLeft, faFingerprint, faDesktop, faPlus, faMinus, faArrowUp, faArrowDown, faWrench, faFileImport, faFileExport, faLock, faCircleInfo, faLockOpen, faCircleQuestion, faCogs, faInfoCircle } from "@fortawesome/free-solid-svg-icons";

import TimeDelta from "../components/timedelta";
import ColorInput from "../components/colorInput";
import SponsorBadge from "../components/sponsorBadge";
import RoleSelect from "../components/roleselect";

import { getRolePerms, customAxios as axios, makeRequestsAuto, getAuthToken, DEFAULT_ROLES, DEFAULT_PERMS, DEFAULT_RANKS, DEFAULT_APPLICATIONS } from "../functions";

const LANGUAGES = { "ar": "Arabic (العربية)", "be": "Belarusian (беларуская)", "bg": "Bulgarian (български)", "cs": "Czech (čeština)", "cy": "Welsh (Cymraeg)", "da": "Danish (dansk)", "de": "German (Deutsch)", "el": "Greek (Ελληνικά)", "en": "English", "eo": "Esperanto", "es": "Spanish (Español)", "et": "Estonian (eesti keel)", "fi": "Finnish (suomi)", "fr": "French (français)", "ga": "Irish (Gaeilge)", "gd": "Scottish (Gàidhlig)", "hu": "Hungarian (magyar)", "hy": "Armenian (Հայերեն)", "id": "Indonesian (Bahasa Indonesia)", "is": "Icelandic (íslenska)", "it": "Italian (italiano)", "ja": "Japanese (日本語)", "ko": "Korean (한국어)", "lt": "Lithuanian (lietuvių kalba)", "lv": "Latvian (latviešu valoda)", "mk/sl": "Macedonian/Slovenian (македонски/​slovenščina)", "mn": "Mongolian (Монгол)", "mo": "Moldavian (Moldova)", "ne": "Nepali (नेपाली)", "nl": "Dutch (Nederlands)", "nn": "Norwegian (norsk nynorsk)", "pl": "Polish (polski)", "pt": "Portuguese (Português)", "ro": "Romanian (română)", "ru": "Russian (русский)", "sk": "Slovak (slovenčina)", "sl": "Slovenian (slovenščina)", "sq": "Albanian (Shqip)", "sr": "Serbian (српски)", "sv": "Swedish (Svenska)", "th": "Thai (ไทย)", "tr": "Turkish (Türkçe)", "uk": "Ukrainian (українська)", "vi": "Vietnamese (Tiếng Việt)", "yi": "Yiddish (ייִדיש)", "zh": "Chinese (中文)" };

const CONFIG_SECTIONS = {
    "general": ["name", "language", "distance_unit", "security_level", "privacy", "logo_url", "hex_color", "hook_audit_log", "banner_background_url", "banner_info_first_row", "banner_background_opacity"],
    "profile": ["sync_discord_email", "must_join_guild", "use_server_nickname", "allow_custom_profile", "use_custom_activity", "avatar_domain_whitelist", "required_connections", "register_methods"],
    "tracker": ["trackers"],
    "dlog": ["delivery_rules", "hook_delivery_log", "delivery_webhook_image_urls"],
    "discord-steam": ["discord_guild_id", "discord_client_id", "discord_client_secret", "discord_bot_token", "steam_api_key"],
    "role": ["roles", "perms"],
    "smtp": ["smtp_host", "smtp_port", "smtp_email", "smtp_password", "email_template"],
    "rank": ["rank_types"],
    "announcement": ["announcement_types"],
    "application": ["application_types"],
    "division": ["divisions"],
    "discord-member": ["member_accept", "member_leave", "driver_role_add", "driver_role_remove", "rank_up"],
    "discord-other": ["announcement_forwarding", "challenge_forwarding", "challenge_completed_forwarding", "downloads_forwarding", "event_forwarding", "event_upcoming_forwarding", "poll_forwarding"],
    "economy": ["economy"],
};

const CONFIG_SECTIONS_INDEX = { "general": 0, "profile": 1, "tracker": 2, "dlog": 3, "discord-steam": 4, "role": 5, "rank": 7, "smtp": 6, "announcement": 8, "division": 9, "application": 10, "discord-member": 11, "discord-other": 12, "economy": 13 };

const VisuallyHiddenInput = styled("input")({
    clip: "rect(0 0 0 0)",
    clipPath: "inset(50%)",
    height: 1,
    overflow: "hidden",
    position: "absolute",
    bottom: 0,
    left: 0,
    whiteSpace: "nowrap",
    width: 1,
});

function tabBtnProps(index, current, theme) {
    return {
        "id": `config-tab-${index}`,
        "aria-controls": `config-tabpanel-${index}`,
        "style": { color: current === index ? theme.palette.info.main : "inherit" },
    };
}

function replaceUnderscores(str) {
    return str
        .split("_")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div role="tabpanel" hidden={value !== index} id={`config-tabpanel-${index}`} aria-labelledby={`config-tab-${index}`} {...other}>
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

const MemoGeneralForm = memo(({ theme, formConfig }) => {
    const { t: tr } = useTranslation();
    const { languages } = useContext(AppContext);

    if (5 - formConfig.state.hook_audit_log.length > 0) {
        for (let i = 0; i < 5 - formConfig.state.hook_audit_log.length; i++) {
            formConfig.state.hook_audit_log.push({ category: "*", channel_id: "", webhook_url: "" });
        }
        formConfig.setState({ ...formConfig.state, hook_audit_log: formConfig.state.hook_audit_log });
    }

    return (
        <>
            <Grid
                size={{
                    xs: 12,
                    md: 6,
                }}>
                <TextField
                    style={{ marginBottom: "16px" }}
                    key="name"
                    label={tr("company_name")}
                    variant="outlined"
                    fullWidth
                    value={formConfig.state.name}
                    onChange={e => {
                        formConfig.setState({ ...formConfig.state, name: e.target.value });
                    }}
                />
            </Grid>
            <Grid
                size={{
                    xs: 6,
                    md: 3,
                }}>
                <TextField
                    style={{ marginBottom: "16px" }}
                    key="language"
                    label={tr("language")}
                    variant="outlined"
                    fullWidth
                    value={formConfig.state.language}
                    onChange={e => {
                        formConfig.setState({ ...formConfig.state, language: e.target.value });
                    }}
                    select>
                    {languages.map(language => (
                        <MenuItem key={language} value={language}>
                            {LANGUAGES[language]}
                        </MenuItem>
                    ))}
                </TextField>
            </Grid>
            <Grid
                size={{
                    xs: 6,
                    md: 3,
                }}>
                <TextField
                    style={{ marginBottom: "16px" }}
                    key="distance_unit"
                    label={tr("distance_unit")}
                    variant="outlined"
                    fullWidth
                    value={formConfig.state.distance_unit}
                    onChange={e => {
                        formConfig.setState({ ...formConfig.state, distance_unit: e.target.value });
                    }}
                    select>
                    <MenuItem key="metric" value="metric">
                        {tr("metric")}
                    </MenuItem>
                    <MenuItem key="imperial" value="imperial">
                        {tr("imperial")}
                    </MenuItem>
                </TextField>
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    md: 6,
                }}>
                <TextField
                    style={{ marginBottom: "16px" }}
                    key="security_level"
                    label={tr("security")}
                    variant="outlined"
                    fullWidth
                    value={formConfig.state.security_level}
                    onChange={e => {
                        formConfig.setState({ ...formConfig.state, security_level: e.target.value });
                    }}
                    select>
                    <MenuItem key="0" value={0}>
                        {tr("session_token_regular")}
                    </MenuItem>
                    <MenuItem key="1" value={1}>
                        {tr("session_token_strict")}
                    </MenuItem>
                    <MenuItem key="2" value={2}>
                        {tr("session_token_very_strict")}
                    </MenuItem>
                </TextField>
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    md: 6,
                }}>
                <TextField
                    style={{ marginBottom: "16px" }}
                    key="privacy"
                    label={tr("privacy")}
                    variant="outlined"
                    fullWidth
                    value={formConfig.state.privacy}
                    onChange={e => {
                        formConfig.setState({ ...formConfig.state, privacy: e.target.value });
                    }}
                    select>
                    <MenuItem key="false" value={false}>
                        {tr("user_profile_visible_to_everyone")}
                    </MenuItem>
                    <MenuItem key="true" value={true}>
                        {tr("user_profile_visible_to_only_members")}
                    </MenuItem>
                </TextField>
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    sm: 9,
                }}>
                <TextField
                    style={{ marginBottom: "16px" }}
                    key="logo_url"
                    label={tr("logo_url")}
                    variant="outlined"
                    fullWidth
                    value={formConfig.state.logo_url}
                    onChange={e => {
                        formConfig.setState({ ...formConfig.state, logo_url: e.target.value });
                    }}
                />
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    sm: 3,
                }}>
                <TextField
                    style={{ marginBottom: "16px" }}
                    key="hex_color"
                    label={tr("hex_color")}
                    variant="outlined"
                    fullWidth
                    value={formConfig.state.hex_color}
                    onChange={e => {
                        formConfig.setState({ ...formConfig.state, hex_color: e.target.value });
                    }}
                />
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    sm: 6,
                }}>
                <TextField
                    style={{ marginBottom: "16px" }}
                    key="banner_background_url"
                    label="Banner Background URL"
                    variant="outlined"
                    fullWidth
                    value={formConfig.state.banner_background_url}
                    onChange={e => {
                        formConfig.setState({ ...formConfig.state, banner_background_url: e.target.value });
                    }}
                />
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    sm: 3,
                }}>
                <TextField
                    select
                    style={{ marginBottom: "16px" }}
                    key="banner_info_first_row"
                    label="Banner Info First Row"
                    variant="outlined"
                    fullWidth
                    value={formConfig.state.banner_info_first_row}
                    onChange={e => {
                        formConfig.setState({ ...formConfig.state, banner_info_first_row: e.target.value });
                    }}>
                    <MenuItem key="rank" value="rank">
                        Always Rank
                    </MenuItem>
                    <MenuItem key="division" value="division">
                        Always Division
                    </MenuItem>
                    <MenuItem key="division_first" value="division_first">
                        Prioritize Division
                    </MenuItem>
                </TextField>
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    sm: 3,
                }}>
                <TextField
                    style={{ marginBottom: "16px" }}
                    key="banner_background_opacity"
                    label="Banner Background Opacity"
                    variant="outlined"
                    fullWidth
                    value={formConfig.state.banner_background_opacity}
                    onChange={e => {
                        formConfig.setState({ ...formConfig.state, banner_background_opacity: e.target.value });
                    }}
                />
            </Grid>
            {formConfig.state.hook_audit_log.map((hook, index) => (
                <>
                    <Grid
                        size={{
                            xs: 12,
                            md: 4,
                        }}>
                        <TextField
                            style={{ marginBottom: "16px" }}
                            key={`hook_audit_log_category_${index}`}
                            label={"Audit Log Category" + " #" + (index + 1)}
                            variant="outlined"
                            fullWidth
                            value={hook.category}
                            onChange={e => {
                                if (!isNaN(e.target.value)) {
                                    const newHooks = [...formConfig.state.hook_audit_log];
                                    newHooks[index] = { ...hook, category: e.target.value };
                                    formConfig.setState({ ...formConfig.state, hook_audit_log: newHooks });
                                }
                            }}
                        />
                    </Grid>
                    <Grid
                        size={{
                            xs: 12,
                            md: 4,
                        }}>
                        <TextField
                            style={{ marginBottom: "16px" }}
                            key={`hook_audit_log_channel_id_${index}`}
                            label={tr("audit_log_discord_channel_id") + " #" + (index + 1)}
                            variant="outlined"
                            fullWidth
                            value={hook.channel_id}
                            onChange={e => {
                                if (!isNaN(e.target.value)) {
                                    const newHooks = [...formConfig.state.hook_audit_log];
                                    newHooks[index] = { ...hook, channel_id: e.target.value };
                                    formConfig.setState({ ...formConfig.state, hook_audit_log: newHooks });
                                }
                            }}
                        />
                    </Grid>
                    <Grid
                        size={{
                            xs: 12,
                            md: 4,
                        }}>
                        <TextField
                            style={{ marginBottom: "16px" }}
                            key={`hook_audit_log_webhook_${index}`}
                            label={tr("audit_log_discord_webhook_alternative") + " #" + (index + 1)}
                            variant="outlined"
                            fullWidth
                            value={hook.webhook_url}
                            onChange={e => {
                                const newHooks = [...formConfig.state.hook_audit_log];
                                newHooks[index] = { ...hook, webhook_url: e.target.value };
                                formConfig.setState({ ...formConfig.state, hook_audit_log: newHooks });
                            }}
                        />
                    </Grid>
                </>
            ))}
        </>
    );
});

const MemoProfileForm = memo(({ theme, formConfig }) => {
    const { t: tr } = useTranslation();
    const CONNECTION_NAME = { email: tr("email"), discord: "Discord", steam: "Steam", truckersmp: "TruckersMP" };
    return (
        <>
            <Grid
                size={{
                    xs: 6,
                    md: 4,
                }}>
                <TextField
                    select
                    style={{ marginBottom: "16px" }}
                    key="sync_discord_email"
                    label={tr("always_sync_user_discord_email")}
                    variant="outlined"
                    fullWidth
                    value={formConfig.state.sync_discord_email}
                    onChange={e => {
                        formConfig.setState({ ...formConfig.state, sync_discord_email: e.target.value });
                    }}>
                    <MenuItem key={true} value={true}>
                        {tr("enabled")}
                    </MenuItem>
                    <MenuItem key={false} value={false}>
                        {tr("disabled")}
                    </MenuItem>
                </TextField>
            </Grid>
            <Grid
                size={{
                    xs: 6,
                    md: 4,
                }}>
                <TextField
                    select
                    style={{ marginBottom: "16px" }}
                    key="must_join_guild"
                    label={tr("user_must_join_discord_server")}
                    variant="outlined"
                    fullWidth
                    value={formConfig.state.must_join_guild}
                    onChange={e => {
                        formConfig.setState({ ...formConfig.state, must_join_guild: e.target.value });
                    }}>
                    <MenuItem key={true} value={true}>
                        {tr("enabled")}
                    </MenuItem>
                    <MenuItem key={false} value={false}>
                        {tr("disabled")}
                    </MenuItem>
                </TextField>
            </Grid>
            <Grid
                size={{
                    xs: 6,
                    md: 4,
                }}>
                <TextField
                    select
                    style={{ marginBottom: "16px" }}
                    key="use_server_nickname"
                    label={tr("use_discord_server_nickname")}
                    variant="outlined"
                    fullWidth
                    value={formConfig.state.use_server_nickname}
                    onChange={e => {
                        formConfig.setState({ ...formConfig.state, use_server_nickname: e.target.value });
                    }}>
                    <MenuItem key={true} value={true}>
                        {tr("enabled")}
                    </MenuItem>
                    <MenuItem key={false} value={false}>
                        {tr("disabled")}
                    </MenuItem>
                </TextField>
            </Grid>
            <Grid
                size={{
                    xs: 6,
                    md: 6,
                }}>
                <TextField
                    select
                    style={{ marginBottom: "16px" }}
                    key="allow_custom_profile"
                    label={tr("enable_custom_profile")}
                    variant="outlined"
                    fullWidth
                    value={formConfig.state.allow_custom_profile}
                    onChange={e => {
                        formConfig.setState({ ...formConfig.state, allow_custom_profile: e.target.value });
                    }}>
                    <MenuItem key={true} value={true}>
                        {tr("enabled")}
                    </MenuItem>
                    <MenuItem key={false} value={false}>
                        {tr("disabled")}
                    </MenuItem>
                </TextField>
            </Grid>
            <Grid
                size={{
                    xs: 6,
                    md: 6,
                }}>
                <TextField
                    select
                    style={{ marginBottom: "16px" }}
                    key="use_custom_activity"
                    label={tr("enable_custom_activity_not_supported")}
                    variant="outlined"
                    fullWidth
                    value={formConfig.state.use_custom_activity}
                    onChange={e => {
                        formConfig.setState({ ...formConfig.state, use_custom_activity: e.target.value });
                    }}>
                    <MenuItem key={true} value={true}>
                        {tr("enabled")}
                    </MenuItem>
                    <MenuItem key={false} value={false}>
                        {tr("disabled")}
                    </MenuItem>
                </TextField>
            </Grid>
            <Grid
                sx={{ pb: "15px" }}
                size={{
                    xs: 12,
                    md: 12,
                }}>
                <Typography variant="body2">{tr("avatar_domain_whitelist")}</Typography>
                <CreatableSelect
                    isMulti
                    name="colors"
                    className="basic-multi-select"
                    classNamePrefix="select"
                    styles={customSelectStyles(theme)}
                    value={formConfig.state.avatar_domain_whitelist.map(domain => ({ value: domain, label: domain }))}
                    onChange={newItems => {
                        formConfig.setState({
                            ...formConfig.state,
                            avatar_domain_whitelist: newItems.map(item => item.value),
                        });
                    }}
                    menuPortalTarget={document.body}
                />
            </Grid>
            <Grid
                sx={{ pb: "15px" }}
                size={{
                    xs: 12,
                    md: 6,
                }}>
                <Typography variant="body2">{tr("required_connections_for_new_members")}</Typography>
                <Select
                    isMulti
                    name="colors"
                    className="basic-multi-select"
                    classNamePrefix="select"
                    styles={customSelectStyles(theme)}
                    options={Object.keys(CONNECTION_NAME).map(connection => ({ value: connection, label: CONNECTION_NAME[connection] }))}
                    value={formConfig.state.required_connections.map(connection => ({ value: connection, label: CONNECTION_NAME[connection] }))}
                    onChange={newItems => {
                        formConfig.setState({
                            ...formConfig.state,
                            required_connections: newItems.map(item => item.value),
                        });
                    }}
                    menuPortalTarget={document.body}
                />
            </Grid>
            <Grid
                sx={{ pb: "15px" }}
                size={{
                    xs: 12,
                    md: 6,
                }}>
                <Typography variant="body2">{tr("enabled_registration_methods")}</Typography>
                <Select
                    isMulti
                    name="colors"
                    className="basic-multi-select"
                    classNamePrefix="select"
                    styles={customSelectStyles(theme)}
                    options={Object.keys(CONNECTION_NAME).map(connection => ({ value: connection, label: CONNECTION_NAME[connection] }))}
                    value={formConfig.state.register_methods.map(connection => ({ value: connection, label: CONNECTION_NAME[connection] }))}
                    onChange={newItems => {
                        formConfig.setState({
                            ...formConfig.state,
                            connection: newItems.map(item => item.value),
                        });
                    }}
                    menuPortalTarget={document.body}
                />
            </Grid>
        </>
    );
});

const TrackerForm = ({ theme, tracker, onUpdate }) => {
    const { t: tr } = useTranslation();
    return (
        <Grid container spacing={2} rowSpacing={-1} sx={{ mt: "5px", mb: "15px" }}>
            <Grid
                size={{
                    xs: 6,
                    md: 6,
                }}>
                <TextField
                    select
                    style={{ marginBottom: "16px" }}
                    key="type"
                    label={tr("type")}
                    variant="outlined"
                    fullWidth
                    value={tracker.type}
                    onChange={e => {
                        onUpdate({ ...tracker, type: e.target.value });
                    }}>
                    <MenuItem key="trucky" value="trucky">
                        Trucky
                    </MenuItem>
                    <MenuItem key="tracksim" value="tracksim">
                        TrackSim
                    </MenuItem>
                    <MenuItem key="custom" value="custom">
                        Custom
                    </MenuItem>
                </TextField>
            </Grid>
            <Grid
                size={{
                    xs: 6,
                    md: 6,
                }}>
                <TextField
                    style={{ marginBottom: "16px" }}
                    key="company_id"
                    label={tr("company_id")}
                    variant="outlined"
                    fullWidth
                    value={tracker.company_id}
                    onChange={e => {
                        onUpdate({ ...tracker, company_id: e.target.value });
                    }}
                />
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    md: 6,
                }}>
                <TextField
                    style={{ marginBottom: "16px" }}
                    key="api_token"
                    label={tr("api_token")}
                    variant="outlined"
                    fullWidth
                    value={tracker.api_token}
                    onChange={e => {
                        onUpdate({ ...tracker, api_token: e.target.value });
                    }}
                />
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    md: 6,
                }}>
                <TextField
                    style={{ marginBottom: "16px" }}
                    key="webhook_secret"
                    label={tr("webhook_secret")}
                    variant="outlined"
                    fullWidth
                    value={tracker.webhook_secret}
                    onChange={e => {
                        onUpdate({ ...tracker, webhook_secret: e.target.value });
                    }}
                />
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    md: 12,
                }}>
                <Typography variant="body2">{tr("webhook_ip_whitelist")}</Typography>
                <CreatableSelect
                    isMulti
                    name="colors"
                    className="basic-multi-select"
                    classNamePrefix="select"
                    styles={customSelectStyles(theme)}
                    value={tracker.ip_whitelist.map(ip => ({ value: ip, label: ip }))}
                    onChange={newItems => {
                        formConfig.setState({
                            ...tracker,
                            ip_whitelist: newItems.map(item => item.value),
                        });
                    }}
                    menuPortalTarget={document.body}
                />
            </Grid>
        </Grid>
    );
};

const MemoTrackerForm = memo(({ theme, formConfig }) => {
    const { t: tr } = useTranslation();
    return (
        <>
            {formConfig.state.trackers.length === 0 && (
                <div style={{ display: "flex", alignItems: "center" }}>
                    <Typography variant="body2" fontWeight="bold" sx={{ mb: "10px", flexGrow: 1 }}>
                        {tr("no_tracker_create_one")}
                    </Typography>
                    <IconButton
                        variant="contained"
                        color="success"
                        onClick={() => {
                            let newTrackers = [{ type: "trucky", company_id: "", api_token: "", webhook_secret: "", ip_whitelist: [] }];
                            formConfig.setState({ ...formConfig.state, trackers: newTrackers });
                        }}>
                        <FontAwesomeIcon icon={faPlus} />
                    </IconButton>
                </div>
            )}
            {formConfig.state.trackers.map((tracker, index) => (
                <>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <Typography variant="body2" fontWeight="bold" sx={{ mb: "10px", flexGrow: 1 }}>
                            <>{tr("tracker")}</> #{index + 1}
                        </Typography>
                        <div>
                            <IconButton
                                variant="contained"
                                color="success"
                                disabled={formConfig.state.trackers.length >= 10}
                                onClick={() => {
                                    let newTrackers = [...formConfig.state.trackers];
                                    newTrackers.splice(index + 1, 0, { type: "trucky", company_id: "", api_token: "", webhook_secret: "", ip_whitelist: [] });
                                    formConfig.setState({ ...formConfig.state, trackers: newTrackers });
                                }}>
                                <FontAwesomeIcon icon={faPlus} />
                            </IconButton>
                            <IconButton
                                variant="contained"
                                color="error"
                                onClick={() => {
                                    let newTrackers = [...formConfig.state.trackers];
                                    newTrackers.splice(index, 1);
                                    formConfig.setState({ ...formConfig.state, trackers: newTrackers });
                                }}>
                                <FontAwesomeIcon icon={faMinus} />
                            </IconButton>
                            <IconButton
                                variant="contained"
                                color="info"
                                disabled={index === 0}
                                onClick={() => {
                                    if (index >= 1) {
                                        let newTrackers = [...formConfig.state.trackers];
                                        newTrackers[index] = newTrackers[index - 1];
                                        newTrackers[index - 1] = tracker;
                                        formConfig.setState({ ...formConfig.state, trackers: newTrackers });
                                    }
                                }}>
                                <FontAwesomeIcon icon={faArrowUp} />
                            </IconButton>
                            <IconButton
                                variant="contained"
                                color="warning"
                                onClick={() => {
                                    if (index <= formConfig.state.trackers.length - 2) {
                                        let newTrackers = [...formConfig.state.trackers];
                                        newTrackers[index] = newTrackers[index + 1];
                                        newTrackers[index + 1] = tracker;
                                        formConfig.setState({ ...formConfig.state, trackers: newTrackers });
                                    }
                                }}
                                disabled={index === formConfig.state.trackers.length - 1}>
                                <FontAwesomeIcon icon={faArrowDown} />
                            </IconButton>
                        </div>
                    </div>
                    <TrackerForm
                        theme={theme}
                        tracker={tracker}
                        onUpdate={newTracker => {
                            let newTrackers = [...formConfig.state.trackers];
                            newTrackers[index] = newTracker;
                            formConfig.setState({ ...formConfig.state, trackers: newTrackers });
                        }}
                    />
                </>
            ))}
        </>
    );
});

const MemoDlogForm = memo(({ theme, formConfig }) => {
    const { t: tr } = useTranslation();

    const REALISTIC_SETTINGS = ["bad_weather_factor", "detected", "detours", "fatigue", "fuel_simulation", "hardcore_simulation", "hub_speed_limit", "parking_difficulty", "police", "road_event", "show_game_blockers", "simple_parking_doubles", "traffic_enabled", "trailer_advanced_coupling"];

    return (
        <>
            <Grid
                size={{
                    xs: 6,
                    md: 3,
                }}>
                <TextField
                    style={{ marginBottom: "16px" }}
                    key="max_speed"
                    label={tr("max_speed")}
                    variant="outlined"
                    fullWidth
                    value={formConfig.state.delivery_rules.max_speed}
                    onChange={e => {
                        if (!isNaN(e.target.value)) formConfig.setState({ ...formConfig.state, delivery_rules: { ...formConfig.state.delivery_rules, max_speed: isNaN(parseInt(e.target.value)) ? e.target.value : parseInt(e.target.value) } });
                    }}
                />
            </Grid>
            <Grid
                size={{
                    xs: 6,
                    md: 3,
                }}>
                <TextField
                    style={{ marginBottom: "16px" }}
                    key="max_profit"
                    label={tr("max_profit")}
                    variant="outlined"
                    fullWidth
                    value={formConfig.state.delivery_rules.max_profit}
                    onChange={e => {
                        if (!isNaN(e.target.value)) formConfig.setState({ ...formConfig.state, delivery_rules: { ...formConfig.state.delivery_rules, max_profit: isNaN(parseInt(e.target.value)) ? e.target.value : parseInt(e.target.value) } });
                    }}
                />
            </Grid>
            <Grid
                size={{
                    xs: 6,
                    md: 3,
                }}>
                <TextField
                    style={{ marginBottom: "16px" }}
                    key="max_xp"
                    label={tr("max_xp")}
                    variant="outlined"
                    fullWidth
                    value={formConfig.state.delivery_rules.max_xp}
                    onChange={e => {
                        if (!isNaN(e.target.value)) formConfig.setState({ ...formConfig.state, delivery_rules: { ...formConfig.state.delivery_rules, max_xp: isNaN(parseInt(e.target.value)) ? e.target.value : parseInt(e.target.value) } });
                    }}
                />
            </Grid>
            <Grid
                size={{
                    xs: 6,
                    md: 3,
                }}>
                <TextField
                    style={{ marginBottom: "16px" }}
                    key="max_warp"
                    label={tr("max_warp_0_for_nowarp")}
                    variant="outlined"
                    fullWidth
                    value={formConfig.state.delivery_rules.max_warp}
                    onChange={e => {
                        if (!isNaN(e.target.value)) formConfig.setState({ ...formConfig.state, delivery_rules: { ...formConfig.state.delivery_rules, max_warp: isNaN(parseInt(e.target.value)) ? e.target.value : parseInt(e.target.value) } });
                    }}
                />
            </Grid>
            <Grid
                size={{
                    xs: 6,
                    md: 9,
                }}>
                <Typography variant="body2">{tr("required_realistic_settings")}</Typography>
                <CreatableSelect
                    isMulti
                    name="colors"
                    className="basic-multi-select"
                    classNamePrefix="select"
                    styles={customSelectStyles(theme)}
                    options={REALISTIC_SETTINGS.map(attr => ({ value: attr, label: replaceUnderscores(attr) }))}
                    value={formConfig.state.delivery_rules.required_realistic_settings.map(attr => ({ value: attr, label: replaceUnderscores(attr) }))}
                    onChange={newItems => {
                        formConfig.setState({ ...formConfig.state, delivery_rules: { ...formConfig.state.delivery_rules, required_realistic_settings: newItems.map(item => item.value) } });
                    }}
                    menuPortalTarget={document.body}
                />
            </Grid>
            <Grid
                size={{
                    xs: 6,
                    md: 3,
                }}>
                <TextField
                    select
                    size="small"
                    key="action"
                    label={tr("action")}
                    variant="outlined"
                    fullWidth
                    value={formConfig.state.delivery_rules.action}
                    onChange={e => {
                        formConfig.setState({ ...formConfig.state, delivery_rules: { ...formConfig.state.delivery_rules, action: e.target.value } });
                    }}
                    sx={{ marginTop: "20px", marginBottom: "16px" }}>
                    <MenuItem key="bypass" value="bypass">
                        {tr("keep_job")}
                    </MenuItem>
                    <MenuItem key="drop" value="drop">
                        {tr("drop_data")}
                    </MenuItem>
                    <MenuItem key="block" value="block">
                        {tr("block_job")}
                    </MenuItem>
                </TextField>
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    md: 6,
                }}>
                <TextField
                    style={{ marginBottom: "16px" }}
                    key="hook_delivery_log_channel_id"
                    label={tr("discord_channel_id")}
                    variant="outlined"
                    fullWidth
                    value={formConfig.state.hook_delivery_log.channel_id}
                    onChange={e => {
                        if (!isNaN(e.target.value)) formConfig.setState({ ...formConfig.state, hook_delivery_log: { ...formConfig.state.hook_delivery_log, channel_id: e.target.value } });
                    }}
                />
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    md: 6,
                }}>
                <TextField
                    style={{ marginBottom: "16px" }}
                    key="hook_delivery_log_webhook"
                    label={tr("discord_webhook_alternative")}
                    variant="outlined"
                    fullWidth
                    value={formConfig.state.hook_delivery_log.webhook_url}
                    onChange={e => {
                        formConfig.setState({ ...formConfig.state, hook_delivery_log: { ...formConfig.state.hook_delivery_log, webhook_url: e.target.value } });
                    }}
                />
            </Grid>
            <Grid
                sx={{ marginBottom: "16px" }}
                size={{
                    xs: 12,
                    md: 12,
                }}>
                <Typography variant="body2">{tr("random_embed_images")}</Typography>
                <CreatableSelect
                    isMulti
                    name="colors"
                    className="basic-multi-select"
                    classNamePrefix="select"
                    styles={customSelectStyles(theme)}
                    value={formConfig.state.delivery_webhook_image_urls.map(url => ({ value: url, label: url }))}
                    onChange={newItems => {
                        formConfig.setState({
                            ...formConfig.state,
                            delivery_webhook_image_urls: newItems.map(item => item.value),
                        });
                    }}
                    menuPortalTarget={document.body}
                />
            </Grid>
        </>
    );
});

const MemoDiscordSteamForm = memo(({ theme, formConfig }) => {
    const { t: tr } = useTranslation();
    return (
        <>
            <Grid
                size={{
                    xs: 12,
                    md: 6,
                }}>
                <TextField
                    style={{ marginBottom: "16px" }}
                    key="discord_guild_id"
                    label={tr("discord_server_id")}
                    variant="outlined"
                    fullWidth
                    value={formConfig.state.discord_guild_id}
                    onChange={e => {
                        if (!isNaN(e.target.value)) formConfig.setState({ ...formConfig.state, discord_guild_id: e.target.value });
                    }}
                />
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    md: 6,
                }}>
                <TextField
                    style={{ marginBottom: "16px" }}
                    key="discord_client_id"
                    label={tr("discord_client_id_application_id")}
                    variant="outlined"
                    fullWidth
                    value={formConfig.state.discord_client_id}
                    onChange={e => {
                        if (!isNaN(e.target.value)) formConfig.setState({ ...formConfig.state, discord_client_id: e.target.value });
                    }}
                />
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    md: 6,
                }}>
                <TextField
                    style={{ marginBottom: "16px" }}
                    key="discord_client_secret"
                    label={tr("discord_client_secret")}
                    variant="outlined"
                    fullWidth
                    value={formConfig.state.discord_client_secret}
                    onChange={e => {
                        formConfig.setState({ ...formConfig.state, discord_client_secret: e.target.value });
                    }}
                />
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    md: 6,
                }}>
                <TextField
                    style={{ marginBottom: "16px" }}
                    key="discord_bot_token"
                    label={tr("discord_bot_token")}
                    variant="outlined"
                    fullWidth
                    value={formConfig.state.discord_bot_token}
                    onChange={e => {
                        formConfig.setState({ ...formConfig.state, discord_bot_token: e.target.value });
                    }}
                />
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    md: 12,
                }}>
                <TextField
                    style={{ marginBottom: "16px" }}
                    key="steam_api_key"
                    label={tr("steam_api_key")}
                    variant="outlined"
                    fullWidth
                    value={formConfig.state.steam_api_key}
                    onChange={e => {
                        formConfig.setState({ ...formConfig.state, steam_api_key: e.target.value });
                    }}
                />
            </Grid>
        </>
    );
});

const RoleForm = ({ theme, role, perms, onUpdate }) => {
    const { t: tr } = useTranslation();
    const { allPerms } = useContext(AppContext);
    if (role.discord_role_id === undefined) role.discord_role_id = "";
    return (
        <Grid container spacing={2} rowSpacing={-1} sx={{ mt: "5px", mb: "15px" }}>
            <Grid
                size={{
                    xs: 6,
                    md: 3,
                }}>
                <TextField
                    size="small"
                    style={{ marginBottom: "16px" }}
                    key="name"
                    label={tr("name")}
                    variant="outlined"
                    fullWidth
                    value={role.name}
                    onChange={e => {
                        onUpdate({ ...role, name: e.target.value });
                    }}
                />
            </Grid>
            <Grid
                size={{
                    xs: 6,
                    md: 3,
                }}>
                <TextField size="small" style={{ marginBottom: "16px" }} key="id" label="ID" variant="outlined" fullWidth value={role.id} disabled />
            </Grid>
            <Grid
                sx={{ mt: "-20px" }}
                size={{
                    xs: 12,
                    md: 6,
                }}>
                <Typography variant="body2">{tr("permissions")}</Typography>
                <CreatableSelect
                    isMulti
                    name="colors"
                    className="basic-multi-select"
                    classNamePrefix="select"
                    styles={customSelectStyles(theme)}
                    options={Object.keys(allPerms)
                        .filter(perm => perm !== "driver" || (perm === "driver" && perms.driver.length === 0))
                        .map(perm => ({ value: perm, label: replaceUnderscores(perm) }))}
                    value={getRolePerms(role.id, perms).map(perm => ({ value: perm, label: replaceUnderscores(perm) }))}
                    onChange={newItems => {
                        let rolePerms = newItems.map(item => item.value);
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
            <Grid
                size={{
                    xs: 6,
                    md: 3,
                }}>
                <TextField
                    style={{ marginBottom: "16px" }}
                    key="order_id"
                    label={tr("order_id")}
                    variant="outlined"
                    fullWidth
                    value={role.order_id}
                    onChange={e => {
                        if (!isNaN(e.target.value) || e.target.value === "-") onUpdate({ ...role, order_id: e.target.value });
                    }}
                />
            </Grid>
            <Grid
                size={{
                    xs: 6,
                    md: 3,
                }}>
                <TextField
                    style={{ marginBottom: "16px" }}
                    key="display_order_id"
                    label={tr("display_order_id")}
                    variant="outlined"
                    fullWidth
                    value={role.display_order_id}
                    onChange={e => {
                        if (!isNaN(e.target.value) || e.target.value === "-") onUpdate({ ...role, display_order_id: e.target.value });
                    }}
                />
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    md: 3,
                }}>
                <TextField
                    style={{ marginBottom: "16px" }}
                    key="color"
                    label={tr("color")}
                    variant="outlined"
                    fullWidth
                    value={role.color}
                    onChange={e => {
                        onUpdate({ ...role, color: e.target.value });
                    }}
                />
            </Grid>
            <Grid
                size={{
                    xs: 6,
                    md: 3,
                }}>
                <TextField
                    style={{ marginBottom: "16px" }}
                    key="discord_role_id"
                    label={tr("discord_role_id")}
                    variant="outlined"
                    fullWidth
                    value={role.discord_role_id}
                    onChange={e => {
                        if (!isNaN(e.target.value)) onUpdate({ ...role, discord_role_id: e.target.value });
                    }}
                />
            </Grid>
        </Grid>
    );
};

const MemoRoleForm = memo(({ theme, formConfig }) => {
    const { t: tr } = useTranslation();
    const [openIndex, setOpenIndex] = useState(-1);

    if (formConfig.state.roles.length === 0) {
        return (
            <div style={{ display: "flex", alignItems: "center" }}>
                <Typography variant="body2" fontWeight="bold" sx={{ mb: "10px", flexGrow: 1 }}>
                    {tr("no_roles_create")}
                </Typography>
                <IconButton
                    variant="contained"
                    color="success"
                    onClick={() => {
                        let newRoles = [{ id: 1, order_id: 1, name: tr("new_role"), color: "" }];
                        formConfig.setState({ ...formConfig.state, roles: newRoles });
                    }}>
                    <FontAwesomeIcon icon={faPlus} />
                </IconButton>
            </div>
        );
    }
    const RoleItem = memo(({ role, index }) => {
        return (
            <>
                <div key={`role-form-div-${index}`} style={{ display: "flex", alignItems: "center" }}>
                    <Typography variant="body2" fontWeight="bold" sx={{ display: "flex", alignItems: "center", cursor: "pointer", mb: "10px", flexGrow: 1, color: role.color }} onClick={() => (openIndex === index ? setOpenIndex(-1) : setOpenIndex(index))}>
                        {role.name}
                    </Typography>
                    <div key={`role-control-div-${index}`}>
                        <IconButton style={{ transition: "transform 0.2s", transform: openIndex === index ? "rotate(180deg)" : "none" }} onClick={() => setOpenIndex(index)}>
                            <ExpandMoreRounded />
                        </IconButton>
                        <IconButton
                            variant="contained"
                            color="success"
                            onClick={() => {
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
                                newRoles.splice(index + 1, 0, { id: nextId, order_id: role.order_id + 1, name: tr("new_role"), color: "" });
                                formConfig.setState({ ...formConfig.state, roles: newRoles });
                                setOpenIndex(index + 1);
                            }}>
                            <FontAwesomeIcon icon={faPlus} />
                        </IconButton>
                        <IconButton
                            variant="contained"
                            color="error"
                            disabled={formConfig.state.roles.length <= 1 || role.id === 0}
                            onClick={() => {
                                let newRoles = [...formConfig.state.roles];
                                newRoles.splice(index, 1);
                                formConfig.setState({ ...formConfig.state, roles: newRoles });
                                setOpenIndex(-1);
                            }}>
                            <FontAwesomeIcon icon={faMinus} />
                        </IconButton>
                        <IconButton
                            variant="contained"
                            color="info"
                            disabled={index === 0}
                            onClick={() => {
                                if (index >= 1) {
                                    let newRoles = [...formConfig.state.roles];
                                    newRoles[index] = newRoles[index - 1];
                                    newRoles[index - 1] = role;
                                    formConfig.setState({ ...formConfig.state, roles: newRoles });
                                    if (openIndex === index) setOpenIndex(index - 1);
                                }
                            }}>
                            <FontAwesomeIcon icon={faArrowUp} />
                        </IconButton>
                        <IconButton
                            variant="contained"
                            color="warning"
                            onClick={() => {
                                if (index <= formConfig.state.roles.length - 2) {
                                    let newRoles = [...formConfig.state.roles];
                                    newRoles[index] = newRoles[index + 1];
                                    newRoles[index + 1] = role;
                                    formConfig.setState({ ...formConfig.state, roles: newRoles });
                                    if (openIndex === index) setOpenIndex(index + 1);
                                }
                            }}
                            disabled={index === formConfig.state.roles.length - 1}>
                            <FontAwesomeIcon icon={faArrowDown} />
                        </IconButton>
                    </div>
                </div>
            </>
        );
    });
    const BeforeOpen = memo(({ openIndex }) => <>{formConfig.state.roles.map((role, index) => (index < openIndex || openIndex === -1) && <RoleItem role={role} index={index} />)}</>);
    const AfterOpen = memo(({ openIndex }) => <>{formConfig.state.roles.map((role, index) => index > openIndex && openIndex !== -1 && <RoleItem role={role} index={index} />)}</>);
    let role = formConfig.state.roles[openIndex];
    let index = openIndex;
    return (
        <>
            {(openIndex > 0 || openIndex === -1) && <BeforeOpen openIndex={openIndex} />}
            {openIndex !== -1 && (
                <>
                    <div key={`role-form-div-${index}`} style={{ display: "flex", alignItems: "center" }}>
                        <Typography variant="body2" fontWeight="bold" sx={{ display: "flex", alignItems: "center", cursor: "pointer", mb: "10px", flexGrow: 1, color: role.color }} onClick={() => (openIndex === index ? setOpenIndex(-1) : setOpenIndex(index))}>
                            {role.name}
                        </Typography>
                        <div key={`role-control-div-${index}`}>
                            <IconButton style={{ transition: "transform 0.2s", transform: openIndex === index ? "rotate(180deg)" : "none" }} onClick={() => setOpenIndex(index)}>
                                <ExpandMoreRounded />
                            </IconButton>
                            <IconButton
                                variant="contained"
                                color="success"
                                onClick={e => {
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
                                    newRoles.splice(index + 1, 0, { id: nextId, order_id: role.order_id + 1, name: tr("new_role"), color: "" });
                                    formConfig.setState({ ...formConfig.state, roles: newRoles });
                                }}>
                                <FontAwesomeIcon icon={faPlus} />
                            </IconButton>
                            <IconButton
                                variant="contained"
                                color="error"
                                disabled={formConfig.state.roles.length <= 1 || role.id === 0}
                                onClick={() => {
                                    let newRoles = [...formConfig.state.roles];
                                    newRoles.splice(index, 1);
                                    formConfig.setState({ ...formConfig.state, roles: newRoles });
                                    setOpenIndex(-1);
                                }}>
                                <FontAwesomeIcon icon={faMinus} />
                            </IconButton>
                            <IconButton
                                variant="contained"
                                color="info"
                                disabled={index === 0}
                                onClick={() => {
                                    if (index >= 1) {
                                        let newRoles = [...formConfig.state.roles];
                                        newRoles[index] = newRoles[index - 1];
                                        newRoles[index - 1] = role;
                                        formConfig.setState({ ...formConfig.state, roles: newRoles });
                                        if (openIndex !== -1) setOpenIndex(index - 1);
                                    }
                                }}>
                                <FontAwesomeIcon icon={faArrowUp} />
                            </IconButton>
                            <IconButton
                                variant="contained"
                                color="warning"
                                disabled={index === formConfig.state.roles.length - 1}
                                onClick={() => {
                                    if (index <= formConfig.state.roles.length - 2) {
                                        let newRoles = [...formConfig.state.roles];
                                        newRoles[index] = newRoles[index + 1];
                                        newRoles[index + 1] = role;
                                        formConfig.setState({ ...formConfig.state, roles: newRoles });
                                        if (openIndex !== -1) setOpenIndex(index + 1);
                                    }
                                }}>
                                <FontAwesomeIcon icon={faArrowDown} />
                            </IconButton>
                        </div>
                    </div>
                    <RoleForm
                        key={`role-input-div-${index}`}
                        theme={theme}
                        role={role}
                        perms={formConfig.state.perms}
                        onUpdate={item => {
                            if (item.isPerms) {
                                formConfig.setState({ ...formConfig.state, perms: item.newPerms });
                                return;
                            }
                            let newRoles = [...formConfig.state.roles];
                            newRoles[index] = item;
                            formConfig.setState({ ...formConfig.state, roles: newRoles });
                        }}
                    />
                </>
            )}
            {openIndex !== -1 && openIndex < formConfig.state.roles.length - 1 && <AfterOpen openIndex={openIndex} />}
        </>
    );
});

const EmailTemplateForm = ({ theme, template, onUpdate }) => {
    const { t: tr } = useTranslation();
    return (
        <Grid container spacing={2} rowSpacing={-1} sx={{ mt: "5px", mb: "15px" }}>
            <Grid
                size={{
                    xs: 6,
                    md: 6,
                }}>
                <TextField
                    style={{ marginBottom: "16px" }}
                    key="subject"
                    label={tr("subject")}
                    variant="outlined"
                    fullWidth
                    value={template.subject}
                    onChange={e => {
                        onUpdate({ ...template, subject: e.target.value });
                    }}
                />
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    md: 6,
                }}>
                <TextField
                    style={{ marginBottom: "16px" }}
                    key="from_email"
                    label={tr("from_name_email")}
                    variant="outlined"
                    fullWidth
                    value={template.from_email}
                    onChange={e => {
                        onUpdate({ ...template, from_email: e.target.value });
                    }}
                />
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    md: 6,
                }}>
                <TextField
                    style={{ marginBottom: "16px" }}
                    key="html"
                    label={tr("html_content")}
                    variant="outlined"
                    fullWidth
                    value={template.html}
                    onChange={e => {
                        onUpdate({ ...template, html: e.target.value });
                    }}
                    multiline
                    rows={5}
                />
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    md: 6,
                }}>
                <TextField
                    style={{ marginBottom: "16px" }}
                    key="plain"
                    label={tr("plain_text_content")}
                    variant="outlined"
                    fullWidth
                    value={template.plain}
                    onChange={e => {
                        onUpdate({ ...template, plain: e.target.value });
                    }}
                    multiline
                    rows={5}
                />
            </Grid>
        </Grid>
    );
};

const MemoSmtpForm = memo(({ theme, formConfig }) => {
    const { t: tr } = useTranslation();
    return (
        <>
            <Grid size={9}>
                <TextField
                    style={{ marginBottom: "16px" }}
                    key="smtp_host"
                    label={tr("smtp_host")}
                    variant="outlined"
                    fullWidth
                    value={formConfig.state.smtp_host}
                    onChange={e => {
                        formConfig.setState({ ...formConfig.state, smtp_host: e.target.value });
                    }}
                />
            </Grid>
            <Grid size={3}>
                <TextField
                    style={{ marginBottom: "16px" }}
                    key="smtp_port"
                    label={tr("smtp_port")}
                    variant="outlined"
                    fullWidth
                    value={formConfig.state.smtp_port}
                    onChange={e => {
                        if (!isNaN(e.target.value)) formConfig.setState({ ...formConfig.state, smtp_port: isNaN(parseInt(e.target.value)) ? e.target.value : parseInt(e.target.value) });
                    }}
                />
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    sm: 6,
                }}>
                <TextField
                    style={{ marginBottom: "16px" }}
                    key="smtp_email"
                    label={tr("smtp_email")}
                    variant="outlined"
                    fullWidth
                    value={formConfig.state.smtp_email}
                    onChange={e => {
                        formConfig.setState({ ...formConfig.state, smtp_email: e.target.value });
                    }}
                />
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    sm: 6,
                }}>
                <TextField
                    style={{ marginBottom: "16px" }}
                    key="smtp_password"
                    label={tr("smtp_password")}
                    variant="outlined"
                    type="password"
                    fullWidth
                    value={formConfig.state.smtp_password}
                    onChange={e => {
                        formConfig.setState({ ...formConfig.state, smtp_password: e.target.value });
                    }}
                />
            </Grid>
            <Grid size={12}>
                <Typography variant="body2" fontWeight="bold" sx={{ mb: "10px", flexGrow: 1 }}>
                    {tr("template_for_register_account")}
                </Typography>
                <EmailTemplateForm
                    theme={theme}
                    template={formConfig.state.email_template.register}
                    onUpdate={newTemplate => {
                        formConfig.setState({ ...formConfig.state, email_template: { ...formConfig.state.email_template, register: newTemplate } });
                    }}
                />
            </Grid>
            <Grid size={12}>
                <Typography variant="body2" fontWeight="bold" sx={{ mb: "10px", flexGrow: 1 }}>
                    {tr("template_for_update_email")}
                </Typography>
                <EmailTemplateForm
                    theme={theme}
                    template={formConfig.state.email_template.update_email}
                    onUpdate={newTemplate => {
                        formConfig.setState({ ...formConfig.state, email_template: { ...formConfig.state.email_template, update_email: newTemplate } });
                    }}
                />
            </Grid>
            <Grid size={12}>
                <Typography variant="body2" fontWeight="bold" sx={{ mb: "10px", flexGrow: 1 }}>
                    {tr("template_for_reset_password")}
                </Typography>
                <EmailTemplateForm
                    theme={theme}
                    template={formConfig.state.email_template.reset_password}
                    onUpdate={newTemplate => {
                        formConfig.setState({ ...formConfig.state, email_template: { ...formConfig.state.email_template, reset_password: newTemplate } });
                    }}
                />
            </Grid>
        </>
    );
});

const RankForm = ({ theme, rank, onUpdate }) => {
    const { t: tr } = useTranslation();
    if (rank.discord_role_id === undefined) rank.discord_role_id = "";
    return (
        <Grid container spacing={2} sx={{ mb: "15px" }}>
            <Grid
                size={{
                    xs: 12,
                    md: 3,
                }}>
                <TextField
                    size="small"
                    key="name"
                    label={tr("name")}
                    variant="outlined"
                    fullWidth
                    value={rank.name}
                    onChange={e => {
                        onUpdate({ ...rank, name: e.target.value });
                    }}
                />
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    md: 3,
                }}>
                <TextField
                    size="small"
                    key="points"
                    label={tr("points")}
                    variant="outlined"
                    fullWidth
                    value={rank.points}
                    onChange={e => {
                        if (!isNaN(e.target.value)) onUpdate({ ...rank, points: isNaN(parseInt(e.target.value)) ? e.target.value : parseInt(e.target.value) });
                    }}
                />
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    md: 3,
                }}>
                <TextField
                    size="small"
                    key="color"
                    label={tr("color")}
                    variant="outlined"
                    fullWidth
                    value={rank.color}
                    onChange={e => {
                        onUpdate({ ...rank, color: e.target.value });
                    }}
                />
            </Grid>
            <Grid
                size={{
                    xs: 6,
                    md: 3,
                }}>
                <TextField
                    size="small"
                    key="discord_role_id"
                    label={tr("discord_role_id")}
                    variant="outlined"
                    fullWidth
                    value={rank.discord_role_id}
                    onChange={e => {
                        if (!isNaN(e.target.value)) onUpdate({ ...rank, discord_role_id: e.target.value });
                    }}
                />
            </Grid>
            <Grid size={12}>
                <Typography variant="body2" fontWeight="bold">
                    {tr("daily_bonus")}
                </Typography>
            </Grid>
            {rank.daily_bonus === null && (
                <>
                    <Grid
                        size={{
                            xs: 6,
                            md: 6,
                        }}>
                        <TextField
                            select
                            size="small"
                            label={tr("type")}
                            variant="outlined"
                            fullWidth
                            value="disabled"
                            onChange={e => {
                                if (e.target.value !== "disabled") onUpdate({ ...rank, daily_bonus: { type: e.target.value, base: 0, streak_type: "algo", streak_value: 1.01, algo_offset: 15 } });
                            }}>
                            <MenuItem value="streak">{tr("streak")}</MenuItem>
                            <MenuItem value="fixed">{tr("fixed")}</MenuItem>
                            <MenuItem value="disabled">{tr("disabled")}</MenuItem>
                        </TextField>
                    </Grid>
                </>
            )}
            {rank.daily_bonus !== null && (
                <>
                    <Grid
                        size={{
                            xs: 6,
                            md: 6,
                        }}>
                        <TextField
                            select
                            size="small"
                            label={tr("type")}
                            variant="outlined"
                            fullWidth
                            value={rank.daily_bonus.type}
                            onChange={e => {
                                if (e.target.value === "disabled") {
                                    onUpdate({ ...rank, daily_bonus: null });
                                    return;
                                }
                                onUpdate({ ...rank, daily_bonus: { ...rank.daily_bonus, type: e.target.value } });
                            }}>
                            <MenuItem value="streak">{tr("streak")}</MenuItem>
                            <MenuItem value="fixed">{tr("fixed")}</MenuItem>
                            <MenuItem value="disabled">{tr("disabled")}</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid
                        size={{
                            xs: 6,
                            md: 6,
                        }}>
                        <TextField
                            size="small"
                            label={tr("base_reward")}
                            variant="outlined"
                            fullWidth
                            value={rank.daily_bonus.base}
                            onChange={e => {
                                if (!isNaN(e.target.value)) onUpdate({ ...rank, daily_bonus: { ...rank.daily_bonus, base: isNaN(parseInt(e.target.value)) ? e.target.value : parseInt(e.target.value) } });
                            }}
                        />
                    </Grid>
                    {rank.daily_bonus.type === "streak" && (
                        <>
                            <Grid size={rank.daily_bonus.streak_type === "algo" ? 4 : 6}>
                                <TextField
                                    select
                                    size="small"
                                    label={tr("streak_mode")}
                                    variant="outlined"
                                    fullWidth
                                    value={rank.daily_bonus.streak_type}
                                    onChange={e => {
                                        onUpdate({ ...rank, daily_bonus: { ...rank.daily_bonus, streak_type: e.target.value } });
                                    }}>
                                    <MenuItem value="algo">{tr("algo")}</MenuItem>
                                    <MenuItem value="fixed">{tr("fixed")}</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid size={rank.daily_bonus.streak_type === "algo" ? 4 : 6}>
                                <TextField
                                    size="small"
                                    label={rank.daily_bonus.streak_type === "algo" ? tr("rate") : tr("value")}
                                    variant="outlined"
                                    fullWidth
                                    value={rank.daily_bonus.streak_value}
                                    onChange={e => {
                                        if (!isNaN(e.target.value)) onUpdate({ ...rank, daily_bonus: { ...rank.daily_bonus, streak_value: isNaN(parseInt(e.target.value)) ? e.target.value : parseInt(e.target.value) } });
                                    }}
                                />
                            </Grid>
                            {rank.daily_bonus.streak_type === "algo" && (
                                <Grid size={4}>
                                    <TextField
                                        size="small"
                                        label={tr("offset")}
                                        variant="outlined"
                                        fullWidth
                                        value={rank.daily_bonus.algo_offset}
                                        onChange={e => {
                                            if (!isNaN(e.target.value)) onUpdate({ ...rank, daily_bonus: { ...rank.daily_bonus, algo_offset: isNaN(parseInt(e.target.value)) ? e.target.value : parseInt(e.target.value) } });
                                        }}
                                    />
                                </Grid>
                            )}
                        </>
                    )}
                </>
            )}
            <Grid size={12}>
                <Typography variant="body2" fontWeight="bold">
                    {tr("distance_bonus")}
                </Typography>
            </Grid>
            {rank.distance_bonus === null && (
                <>
                    <Grid
                        size={{
                            xs: 6,
                            md: 6,
                        }}>
                        <TextField
                            select
                            size="small"
                            label={tr("type")}
                            variant="outlined"
                            fullWidth
                            value="disabled"
                            onChange={e => {
                                if (e.target.value !== "disabled") onUpdate({ ...rank, distance_bonus: { type: e.target.value, probability: 1, min_distance: 0, max_distance: -1, value: e.target.value.endsWith("value") ? 100 : 0.1, min: e.target.value.endsWith("value") ? 0 : 0, max: e.target.value.endsWith("value") ? 100 : 1 } });
                            }}>
                            <MenuItem value="fixed_value">{tr("fixed_value")}</MenuItem>
                            <MenuItem value="fixed_percentage">{tr("fixed_percent_of_distance")}</MenuItem>
                            <MenuItem value="random_value">{tr("random_value")}</MenuItem>
                            <MenuItem value="random_percentage">{tr("random_percent_of_distance")}</MenuItem>
                            <MenuItem value="disabled">{tr("disabled")}</MenuItem>
                        </TextField>
                    </Grid>
                </>
            )}
            {rank.distance_bonus !== null && (
                <>
                    <Grid size={4}>
                        <TextField
                            size="small"
                            label={tr("probability")}
                            variant="outlined"
                            fullWidth
                            value={rank.distance_bonus.probability}
                            onChange={e => {
                                if (!isNaN(e.target.value)) onUpdate({ ...rank, distance_bonus: { ...rank.distance_bonus, probability: parseFloat(e.target.value) } });
                            }}
                        />
                    </Grid>
                    <Grid size={4}>
                        <TextField
                            size="small"
                            label={tr("minimum_distance")}
                            variant="outlined"
                            fullWidth
                            value={rank.distance_bonus.min_distance}
                            onChange={e => {
                                if (!isNaN(e.target.value)) onUpdate({ ...rank, distance_bonus: { ...rank.distance_bonus, min_distance: isNaN(parseInt(e.target.value)) ? e.target.value : parseInt(e.target.value) } });
                            }}
                        />
                    </Grid>
                    <Grid size={4}>
                        <TextField
                            size="small"
                            label={tr("maximum_distance")}
                            variant="outlined"
                            fullWidth
                            value={rank.distance_bonus.max_distance}
                            onChange={e => {
                                if (!isNaN(e.target.value)) onUpdate({ ...rank, distance_bonus: { ...rank.distance_bonus, max_distance: isNaN(parseInt(e.target.value)) ? e.target.value : parseInt(e.target.value) } });
                            }}
                        />
                    </Grid>
                    <Grid size={4}>
                        <TextField
                            select
                            size="small"
                            label={tr("type")}
                            variant="outlined"
                            fullWidth
                            value={rank.distance_bonus.type}
                            onChange={e => {
                                if (e.target.value === "disabled") {
                                    onUpdate({ ...rank, distance_bonus: null });
                                    return;
                                }
                                onUpdate({ ...rank, distance_bonus: { ...rank.distance_bonus, type: e.target.value } });
                            }}>
                            <MenuItem value="fixed_value">{tr("fixed_value")}</MenuItem>
                            <MenuItem value="fixed_percentage">{tr("fixed_percent_of_distance")}</MenuItem>
                            <MenuItem value="random_value">{tr("random_value")}</MenuItem>
                            <MenuItem value="random_percentage">{tr("random_percent_of_distance")}</MenuItem>
                            <MenuItem value="disabled">{tr("disabled")}</MenuItem>
                        </TextField>
                    </Grid>
                    {rank.distance_bonus.type.startsWith("fixed") && (
                        <>
                            <Grid size={4}>
                                <TextField
                                    size="small"
                                    label={tr("value_percent")}
                                    variant="outlined"
                                    fullWidth
                                    value={rank.distance_bonus.value}
                                    onChange={e => {
                                        if (!isNaN(e.target.value)) onUpdate({ ...rank, distance_bonus: { ...rank.distance_bonus, value: parseFloat(e.target.value) } });
                                    }}
                                />
                            </Grid>
                        </>
                    )}
                    {rank.distance_bonus.type.startsWith("random") && (
                        <>
                            <Grid size={4}>
                                <TextField
                                    size="small"
                                    label={tr("minimum_value_percent")}
                                    variant="outlined"
                                    fullWidth
                                    value={rank.distance_bonus.min}
                                    onChange={e => {
                                        if (!isNaN(e.target.value)) onUpdate({ ...rank, distance_bonus: { ...rank.distance_bonus, min: parseFloat(e.target.value) } });
                                    }}
                                />
                            </Grid>
                            <Grid size={4}>
                                <TextField
                                    size="small"
                                    label={tr("maximum_value_percent")}
                                    variant="outlined"
                                    fullWidth
                                    value={rank.distance_bonus.max}
                                    onChange={e => {
                                        if (!isNaN(e.target.value)) onUpdate({ ...rank, distance_bonus: { ...rank.distance_bonus, max: parseFloat(e.target.value) } });
                                    }}
                                />
                            </Grid>
                        </>
                    )}
                </>
            )}
        </Grid>
    );
};

const MemoRankForm = memo(({ theme, formConfig }) => {
    const { t: tr } = useTranslation();
    const [openIndex, setOpenIndex] = useState(-1);

    if (formConfig.state.ranks.length === 0) {
        return (
            <div style={{ display: "flex", alignItems: "center" }}>
                <Typography variant="body2" fontWeight="bold" sx={{ mb: "10px", flexGrow: 1 }}>
                    {tr("no_ranks_create")}
                </Typography>
                <IconButton
                    variant="contained"
                    color="success"
                    onClick={() => {
                        let newRanks = [{ id: 1, points: 0, name: tr("new_rank"), color: "", discord_role_id: "", daily_bonus: null, distance_bonus: null }];
                        formConfig.setState({ ...formConfig.state, ranks: newRanks });
                    }}>
                    <FontAwesomeIcon icon={faPlus} />
                </IconButton>
            </div>
        );
    }
    const RankItem = memo(({ rank, index }) => {
        return (
            <>
                <div key={`rank-form-div-${index}`} style={{ display: "flex", alignItems: "center" }}>
                    <Typography variant="body2" fontWeight="bold" sx={{ display: "flex", alignItems: "center", cursor: "pointer", flexGrow: 1, color: rank.color }} onClick={() => (openIndex === index ? setOpenIndex(-1) : setOpenIndex(index))}>
                        {rank.name}
                    </Typography>
                    <div key={`rank-control-div-${index}`}>
                        <IconButton style={{ transition: "transform 0.2s", transform: openIndex === index ? "rotate(180deg)" : "none" }} onClick={() => setOpenIndex(index)}>
                            <ExpandMoreRounded />
                        </IconButton>
                        <IconButton
                            variant="contained"
                            color="success"
                            onClick={() => {
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
                                newRanks.splice(index + 1, 0, { id: nextId, points: 0, name: tr("new_rank"), color: "", discord_role_id: "", daily_bonus: null, distance_bonus: null });
                                formConfig.setState({ ...formConfig.state, ranks: newRanks });
                                setOpenIndex(index + 1);
                            }}>
                            <FontAwesomeIcon icon={faPlus} />
                        </IconButton>
                        <IconButton
                            variant="contained"
                            color="error"
                            onClick={() => {
                                let newRanks = [...formConfig.state.ranks];
                                newRanks.splice(index, 1);
                                formConfig.setState({ ...formConfig.state, ranks: newRanks });
                                setOpenIndex(-1);
                            }}>
                            <FontAwesomeIcon icon={faMinus} />
                        </IconButton>
                        <IconButton
                            variant="contained"
                            color="info"
                            disabled={index === 0}
                            onClick={() => {
                                if (index >= 1) {
                                    let newRanks = [...formConfig.state.ranks];
                                    newRanks[index] = newRanks[index - 1];
                                    newRanks[index - 1] = rank;
                                    formConfig.setState({ ...formConfig.state, ranks: newRanks });
                                    if (openIndex === index) setOpenIndex(index - 1);
                                }
                            }}>
                            <FontAwesomeIcon icon={faArrowUp} />
                        </IconButton>
                        <IconButton
                            variant="contained"
                            color="warning"
                            onClick={() => {
                                if (index <= formConfig.state.ranks.length - 2) {
                                    let newRanks = [...formConfig.state.ranks];
                                    newRanks[index] = newRanks[index + 1];
                                    newRanks[index + 1] = rank;
                                    formConfig.setState({ ...formConfig.state, ranks: newRanks });
                                    if (openIndex === index) setOpenIndex(index + 1);
                                }
                            }}
                            disabled={index === formConfig.state.ranks.length - 1}>
                            <FontAwesomeIcon icon={faArrowDown} />
                        </IconButton>
                    </div>
                </div>
            </>
        );
    });
    const BeforeOpen = memo(({ openIndex }) => <>{formConfig.state.ranks.map((rank, index) => (index < openIndex || openIndex === -1) && <RankItem rank={rank} index={index} />)}</>);
    const AfterOpen = memo(({ openIndex }) => <>{formConfig.state.ranks.map((rank, index) => index > openIndex && openIndex !== -1 && <RankItem rank={rank} index={index} />)}</>);
    let rank = formConfig.state.ranks[openIndex];
    let index = openIndex;
    return (
        <>
            {(openIndex > 0 || openIndex === -1) && <BeforeOpen openIndex={openIndex} />}
            {openIndex !== -1 && (
                <>
                    <div key={`rank-form-div-${index}`} style={{ display: "flex", alignItems: "center" }}>
                        <Typography variant="body2" fontWeight="bold" sx={{ display: "flex", alignItems: "center", cursor: "pointer", mb: "10px", flexGrow: 1, color: rank.color }} onClick={() => (openIndex === index ? setOpenIndex(-1) : setOpenIndex(index))}>
                            {rank.name}
                        </Typography>
                        <div key={`rank-control-div-${index}`}>
                            <IconButton style={{ transition: "transform 0.2s", transform: openIndex === index ? "rotate(180deg)" : "none" }} onClick={() => setOpenIndex(index)}>
                                <ExpandMoreRounded />
                            </IconButton>
                            <IconButton
                                variant="contained"
                                color="success"
                                onClick={e => {
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
                                    newRanks.splice(index + 1, 0, { id: nextId, points: 0, name: tr("new_rank"), color: "", discord_role_id: "", daily_bonus: null, distance_bonus: null });
                                    formConfig.setState({ ...formConfig.state, ranks: newRanks });
                                }}>
                                <FontAwesomeIcon icon={faPlus} />
                            </IconButton>
                            <IconButton
                                variant="contained"
                                color="error"
                                onClick={() => {
                                    let newRanks = [...formConfig.state.ranks];
                                    newRanks.splice(index, 1);
                                    formConfig.setState({ ...formConfig.state, ranks: newRanks });
                                    setOpenIndex(-1);
                                }}>
                                <FontAwesomeIcon icon={faMinus} />
                            </IconButton>
                            <IconButton
                                variant="contained"
                                color="info"
                                disabled={index === 0}
                                onClick={() => {
                                    if (index >= 1) {
                                        let newRanks = [...formConfig.state.ranks];
                                        newRanks[index] = newRanks[index - 1];
                                        newRanks[index - 1] = rank;
                                        formConfig.setState({ ...formConfig.state, ranks: newRanks });
                                        if (openIndex !== -1) setOpenIndex(index - 1);
                                    }
                                }}>
                                <FontAwesomeIcon icon={faArrowUp} />
                            </IconButton>
                            <IconButton
                                variant="contained"
                                color="warning"
                                onClick={() => {
                                    if (index <= formConfig.state.ranks.length - 2) {
                                        let newRanks = [...formConfig.state.ranks];
                                        newRanks[index] = newRanks[index + 1];
                                        newRanks[index + 1] = rank;
                                        formConfig.setState({ ...formConfig.state, ranks: newRanks });
                                        if (openIndex !== -1) setOpenIndex(index + 1);
                                    }
                                }}
                                disabled={index === formConfig.state.ranks.length - 1}>
                                <FontAwesomeIcon icon={faArrowDown} />
                            </IconButton>
                        </div>
                    </div>
                    <RankForm
                        key={`rank-input-div-${index}`}
                        theme={theme}
                        rank={rank}
                        onUpdate={item => {
                            let newRanks = [...formConfig.state.ranks];
                            newRanks[index] = item;
                            formConfig.setState({ ...formConfig.state, ranks: newRanks });
                        }}
                    />
                </>
            )}
            {openIndex !== -1 && openIndex < formConfig.state.ranks.length - 1 && <AfterOpen openIndex={openIndex} />}
        </>
    );
});

const DiscordEmbedForm = ({ embed, onUpdate }) => {
    const { t: tr } = useTranslation();
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
            <Grid
                size={{
                    xs: 12,
                    sm: 6,
                }}>
                <TextField size="small" label={tr("title")} variant="outlined" fullWidth value={embed.title} onChange={e => onUpdate({ ...embed, title: e.target.value })} />
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    sm: 6,
                }}>
                <TextField size="small" label={tr("url")} variant="outlined" fullWidth value={embed.url} onChange={e => onUpdate({ ...embed, url: e.target.value })} />
            </Grid>
            <Grid size={12}>
                <TextField size="small" label={tr("description")} variant="outlined" fullWidth multiline rows={5} value={embed.description} onChange={e => onUpdate({ ...embed, description: e.target.value })} />
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    sm: 6,
                }}>
                <TextField size="small" label={tr("author_name")} variant="outlined" fullWidth value={embed.author.name} onChange={e => onUpdate({ ...embed, author: { ...embed.author, name: e.target.value } })} />
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    sm: 6,
                }}>
                <TextField size="small" label={tr("author_icon_url")} variant="outlined" fullWidth value={embed.author.icon_url} onChange={e => onUpdate({ ...embed, author: { ...embed.author, icon_url: e.target.value } })} />
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    sm: 6,
                }}>
                <TextField size="small" label={tr("footer_text")} variant="outlined" fullWidth value={embed.footer.text} onChange={e => onUpdate({ ...embed, footer: { ...embed.footer, text: e.target.value } })} />
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    sm: 6,
                }}>
                <TextField size="small" label={tr("footer_icon_url")} variant="outlined" fullWidth value={embed.footer.icon_url} onChange={e => onUpdate({ ...embed, footer: { ...embed.footer, icon_url: e.target.value } })} />
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    sm: 4,
                }}>
                <TextField size="small" label={tr("thumbnail_url")} variant="outlined" fullWidth value={embed.thumbnail.url} onChange={e => onUpdate({ ...embed, thumbnail: { ...embed.thumbnail, url: e.target.value } })} />
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    sm: 4,
                }}>
                <TextField size="small" label={tr("image_url")} variant="outlined" fullWidth value={embed.image.url} onChange={e => onUpdate({ ...embed, image: { ...embed.image, url: e.target.value } })} />
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    sm: 4,
                }}>
                <TextField size="small" label={tr("video_url")} variant="outlined" fullWidth value={embed.video.url} onChange={e => onUpdate({ ...embed, image: { ...embed.video, url: e.target.value } })} />
            </Grid>
            <Grid size={12}>
                <TextField size="small" label={tr("color")} variant="outlined" fullWidth defaultValue={!isNaN(parseInt(embed.color, 16)) ? "#" + parseInt(embed.color, 16) : ""} onChange={e => onUpdate({ ...embed, color: parseInt("0x" + e.target.value.replaceAll("#", "")) })} />
            </Grid>
            <Grid size={12}>
                <FormControlLabel size="small" control={<Checkbox checked={embed.timestamp} onChange={e => onUpdate({ ...embed, timestamp: e.target.checked })} />} label={tr("include_timestamp")} />
            </Grid>
            {embed.fields.map((field, index) => (
                <Grid key={index} size={12}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <Typography variant="body2" fontWeight="bold" sx={{ mb: "10px", flexGrow: 1 }}>
                            <>{tr("field")}</> #{index + 1}
                        </Typography>
                        <div>
                            <IconButton
                                variant="contained"
                                color="success"
                                disabled={embed.fields.length >= 9}
                                onClick={() => {
                                    let newFields = [...embed.fields];
                                    newFields.splice(index + 1, 0, { name: tr("new_field"), value: "", inline: true });
                                    onUpdate({ ...embed, fields: newFields });
                                }}>
                                <FontAwesomeIcon icon={faPlus} />
                            </IconButton>
                            <IconButton
                                variant="contained"
                                color="error"
                                onClick={() => {
                                    let newFields = [...embed.fields];
                                    newFields.splice(index, 1);
                                    onUpdate({ ...embed, fields: newFields });
                                }}>
                                <FontAwesomeIcon icon={faMinus} />
                            </IconButton>
                            <IconButton
                                variant="contained"
                                color="info"
                                disabled={index === 0}
                                onClick={() => {
                                    if (index >= 1) {
                                        let newFields = [...embed.fields];
                                        newFields[index] = newFields[index - 1];
                                        newFields[index - 1] = tracker;
                                        onUpdate({ ...embed, fields: newFields });
                                    }
                                }}>
                                <FontAwesomeIcon icon={faArrowUp} />
                            </IconButton>
                            <IconButton
                                variant="contained"
                                color="warning"
                                onClick={() => {
                                    if (index <= embed.fields.length - 2) {
                                        let newFields = [...embed.fields];
                                        newFields[index] = newFields[index + 1];
                                        newFields[index + 1] = tracker;
                                        onUpdate({ ...embed, fields: newFields });
                                    }
                                }}
                                disabled={index === embed.fields.length - 1}>
                                <FontAwesomeIcon icon={faArrowDown} />
                            </IconButton>
                        </div>
                    </div>
                    <Grid container spacing={2}>
                        <Grid size={6}>
                            <TextField size="small" label={`Name`} variant="outlined" fullWidth value={field.name} onChange={e => handleFieldChange(index, { ...field, name: e.target.value })} />
                        </Grid>
                        <Grid size={6}>
                            <TextField select size="small" label={`Inline?`} variant="outlined" fullWidth value={field.inline} onChange={e => handleFieldChange(index, { ...field, inline: e.target.value })}>
                                <MenuItem key="true" value={true}>
                                    {tr("true")}
                                </MenuItem>
                                <MenuItem key="false" value={false}>
                                    {tr("false")}
                                </MenuItem>
                            </TextField>
                        </Grid>
                        <Grid size={12}>
                            <TextField size="small" label={tr("value")} variant="outlined" fullWidth value={field.value} onChange={e => handleFieldChange(index, { ...field, value: e.target.value })} />
                        </Grid>
                    </Grid>
                </Grid>
            ))}
        </Grid>
    );
};

const DiscordMessageForm = memo(({ theme, item, onUpdate, roleChange = false, isPrivate = false, secondsAhead = false }) => {
    const { t: tr } = useTranslation();
    return (
        <>
            <Grid
                size={{
                    xs: 6,
                    md: 4,
                }}>
                <TextField
                    size="small"
                    label={tr("discord_message")}
                    variant="outlined"
                    fullWidth
                    value={item.content}
                    onChange={e => {
                        onUpdate({ ...item, content: e.target.value });
                    }}
                />
            </Grid>
            <Grid
                size={{
                    xs: 6,
                    md: 4,
                }}>
                <TextField
                    size="small"
                    label={tr("discord_channel_id")}
                    variant="outlined"
                    fullWidth
                    value={item.channel_id}
                    onChange={e => {
                        if (!isNaN(e.target.value)) onUpdate({ ...item, channel_id: e.target.value });
                    }}
                />
            </Grid>
            <Grid
                size={{
                    xs: 6,
                    md: 4,
                }}>
                <TextField
                    size="small"
                    label={tr("discord_webhook_alternative")}
                    variant="outlined"
                    fullWidth
                    value={item.webhook_url}
                    onChange={e => {
                        onUpdate({ ...item, webhook_url: e.target.value });
                    }}
                />
            </Grid>
            {roleChange && (
                <Grid
                    size={{
                        xs: 12,
                        md: 12,
                    }}>
                    <Typography variant="body2">{tr("discord_role_changes")}</Typography>
                    <CreatableSelect
                        defaultValue={item.role_change.map(role => ({ value: role, label: role }))}
                        isMulti
                        name="roles"
                        className="basic-multi-select"
                        classNamePrefix="select"
                        styles={customSelectStyles(theme)}
                        value={item.role_change.map(role => ({ value: role, label: role }))}
                        onChange={newRoles => {
                            onUpdate({
                                ...item,
                                role_change: newRoles.map(item => item.value),
                            });
                        }}
                        menuPortalTarget={document.body}
                    />
                </Grid>
            )}
            {isPrivate && (
                <Grid size={12}>
                    <TextField
                        select
                        size="small"
                        label={tr("content_control")}
                        variant="outlined"
                        fullWidth
                        value={item.is_private}
                        onChange={e => {
                            onUpdate({ ...item, is_private: e.target.value });
                        }}>
                        <MenuItem value={null}>{tr("all_content")}</MenuItem>
                        <MenuItem value={true}>{tr("only_private_content")}</MenuItem>
                        <MenuItem value={false}>{tr("only_public_content")}</MenuItem>
                    </TextField>
                </Grid>
            )}
            {secondsAhead && (
                <Grid size={12}>
                    <TextField
                        size="small"
                        label={tr("send_the_message_x_seconds_before_the_convoy_departs")}
                        variant="outlined"
                        fullWidth
                        value={item.seconds_ahead}
                        onChange={e => {
                            if (!isNaN(e.target.value)) onUpdate({ ...item, seconds_ahead: isNaN(parseInt(e.target.value)) ? e.target.value : parseInt(e.target.value) });
                        }}
                    />
                </Grid>
            )}
            <Grid size={12}>
                {(item.embeds === undefined || item.embeds.length === 0) && (
                    <>
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <Typography variant="body2" fontWeight="bold" sx={{ mb: "10px", flexGrow: 1 }}>
                                {tr("no_embed_create")}
                            </Typography>
                            <IconButton
                                variant="contained"
                                color="success"
                                onClick={() => {
                                    onUpdate({ ...item, embeds: [{ title: tr("new_embed"), url: "", description: "", color: 0, timestamp: false, fields: [], author: { name: "", icon_url: "" }, footer: { text: "", icon_url: "" }, thumbnail: { url: "" }, image: { url: "" }, video: { url: "" } }] });
                                }}>
                                <FontAwesomeIcon icon={faPlus} />
                            </IconButton>
                        </div>
                    </>
                )}
                {item.embeds !== undefined && item.embeds.length >= 1 && (
                    <div style={{ marginBottom: "10px", backgroundColor: `${theme.palette.text.secondary.substring(0, 7)}11`, border: `1px solid ${theme.palette.text.secondary + "88"}`, borderRadius: "5px", padding: "10px" }}>
                        {item.embeds.map((embed, index) => (
                            <>
                                <div style={{ display: "flex", alignItems: "center" }}>
                                    <Typography variant="body2" fontWeight="bold" sx={{ mb: "5px", flexGrow: 1 }}>
                                        <>{tr("embed")}</> #{index + 1}
                                    </Typography>
                                    <div>
                                        <IconButton
                                            variant="contained"
                                            color="success"
                                            onClick={() => {
                                                let newEmbeds = [...item.embeds];
                                                newEmbeds.splice(index + 1, 0, { title: tr("new_embed"), url: "", description: "", color: 0, timestamp: false, fields: [], author: { name: "", icon_url: "" }, footer: { text: "", icon_url: "" }, thumbnail: { url: "" }, image: { url: "" }, video: { url: "" } });
                                                onUpdate({ ...item, embeds: newEmbeds });
                                            }}>
                                            <FontAwesomeIcon icon={faPlus} />
                                        </IconButton>
                                        <IconButton
                                            variant="contained"
                                            color="error"
                                            onClick={() => {
                                                let newEmbeds = [...item.embeds];
                                                newEmbeds.splice(index, 1);
                                                onUpdate({ ...item, embeds: newEmbeds });
                                            }}>
                                            <FontAwesomeIcon icon={faMinus} />
                                        </IconButton>
                                        <IconButton
                                            variant="contained"
                                            color="info"
                                            disabled={index === 0}
                                            onClick={() => {
                                                if (index >= 1) {
                                                    let newEmbeds = [...item.embeds];
                                                    newEmbeds[index] = newEmbeds[index - 1];
                                                    newEmbeds[index - 1] = embed;
                                                    onUpdate({ ...item, embeds: newEmbeds });
                                                }
                                            }}>
                                            <FontAwesomeIcon icon={faArrowUp} />
                                        </IconButton>
                                        <IconButton
                                            variant="contained"
                                            color="warning"
                                            disabled={index === item.embeds.length - 1}
                                            onClick={() => {
                                                if (index <= item.embeds.length - 2) {
                                                    let newEmbeds = [...item.embeds];
                                                    newEmbeds[index] = newEmbeds[index + 1];
                                                    newEmbeds[index + 1] = embed;
                                                    onUpdate({ ...item, embeds: newEmbeds });
                                                }
                                            }}>
                                            <FontAwesomeIcon icon={faArrowDown} />
                                        </IconButton>
                                    </div>
                                </div>
                                <DiscordEmbedForm
                                    embed={embed}
                                    onUpdate={newEmbed => {
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
                                        });
                                        onUpdate({ ...item, embeds: newEmbeds });
                                    }}
                                />
                                {item.embeds.length !== index - 1 && <Divider />}
                            </>
                        ))}
                    </div>
                )}
            </Grid>
        </>
    );
});

const MemoDiscordSingleForm = memo(({ theme, vars, formConfig, form_key, roleChange = false, isPrivate = false, secondsAhead = false }) => {
    const { t: tr } = useTranslation();
    return (
        <>
            <Typography variant="body2" sx={{ mb: "5px" }}>
                {tr("the_following_variables_are_available")}
                <br />
                {vars}
            </Typography>
            {formConfig.state[form_key].length === 0 && (
                <>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <Typography variant="body2" fontWeight="bold" sx={{ mb: "10px", flexGrow: 1 }}>
                            {tr("no_message_create")}
                        </Typography>
                        <IconButton
                            variant="contained"
                            color="success"
                            onClick={() => {
                                let newItems = [{ id: 1, content: "", channel_id: "", webhook_url: "", role_change: [], embed: { title: "", url: "", description: "", color: 0, timestamp: false, fields: [], author: { name: "", icon_url: "" }, footer: { text: "", icon_url: "" }, thumbnail: { url: "" }, image: { url: "" }, video: { url: "" } } }];
                                formConfig.setState({ ...formConfig.state, [form_key]: newItems });
                            }}>
                            <FontAwesomeIcon icon={faPlus} />
                        </IconButton>
                    </div>
                </>
            )}
            {formConfig.state[form_key].length >= 1 && (
                <>
                    {formConfig.state[form_key].map((item, index) => (
                        <div style={{ marginBottom: "10px", border: `1px solid ${theme.palette.text.secondary + "88"}`, borderRadius: "5px", padding: "10px" }}>
                            <div style={{ display: "flex", alignItems: "center" }}>
                                <Typography variant="body2" fontWeight="bold" sx={{ mb: "5px", flexGrow: 1 }}>
                                    <>{tr("message")}</> #{index + 1}
                                </Typography>
                                <div>
                                    <IconButton
                                        variant="contained"
                                        color="success"
                                        onClick={() => {
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
                                            newItems.splice(index + 1, 0, { id: nextId, content: "", channel_id: "", webhook_url: "", role_change: [], embed: { title: "", url: "", description: "", color: 0, timestamp: false, fields: [], author: { name: "", icon_url: "" }, footer: { text: "", icon_url: "" }, thumbnail: { url: "" }, image: { url: "" }, video: { url: "" } } });
                                            formConfig.setState({ ...formConfig.state, [form_key]: newItems });
                                        }}>
                                        <FontAwesomeIcon icon={faPlus} />
                                    </IconButton>
                                    <IconButton
                                        variant="contained"
                                        color="error"
                                        onClick={() => {
                                            let newItems = [...formConfig.state[form_key]];
                                            newItems.splice(index, 1);
                                            formConfig.setState({ ...formConfig.state, [form_key]: newItems });
                                        }}>
                                        <FontAwesomeIcon icon={faMinus} />
                                    </IconButton>
                                    <IconButton
                                        variant="contained"
                                        color="info"
                                        disabled={index === 0}
                                        onClick={() => {
                                            if (index >= 1) {
                                                let newItems = [...formConfig.state[form_key]];
                                                newItems[index] = newItems[index - 1];
                                                newItems[index - 1] = item;
                                                formConfig.setState({ ...formConfig.state, [form_key]: newItems });
                                            }
                                        }}>
                                        <FontAwesomeIcon icon={faArrowUp} />
                                    </IconButton>
                                    <IconButton
                                        variant="contained"
                                        color="warning"
                                        onClick={() => {
                                            if (index <= formConfig.state[form_key].length - 2) {
                                                let newItems = [...formConfig.state[form_key]];
                                                newItems[index] = newItems[index + 1];
                                                newItems[index + 1] = item;
                                                formConfig.setState({ ...formConfig.state, [form_key]: newItems });
                                            }
                                        }}
                                        disabled={index === formConfig.state[form_key].length - 1}>
                                        <FontAwesomeIcon icon={faArrowDown} />
                                    </IconButton>
                                </div>
                            </div>
                            <Grid container spacing={2}>
                                <DiscordMessageForm
                                    theme={theme}
                                    item={item}
                                    roleChange={roleChange}
                                    isPrivate={isPrivate}
                                    secondsAhead={secondsAhead}
                                    onUpdate={newItem => {
                                        let newItems = [...formConfig.state[form_key]];
                                        newItems[index] = newItem;
                                        formConfig.setState({ ...formConfig.state, [form_key]: newItems });
                                    }}
                                />
                            </Grid>
                        </div>
                    ))}
                </>
            )}
        </>
    );
});

const MemoDiscordMemberForm = memo(({ theme, formConfig }) => {
    const { t: tr } = useTranslation();
    const [openIndex, setOpenIndex] = useState(-1);
    const ITEMS = { member_accept: tr("member_accept"), member_leave: tr("member_leave"), driver_role_add: tr("driver_role_added"), driver_role_remove: tr("driver_role_removed"), rank_up: tr("driver_ranked_up") };
    const ROLE_CHANGE = [true, true, true, true, false];
    const VARS = ["{mention}, {name}, {userid}, {uid}, {avatar}, {staff_mention}, {staff_name}, {staff_userid}, {staff_uid}, {staff_avatar}", "{mention}, {name}, {userid}, {uid}, {avatar}, {staff_mention}, {staff_name}, {staff_userid}, {staff_uid}, {staff_avatar}", "{mention}, {name}, {userid}, {uid}, {avatar}, {staff_mention}, {staff_name}, {staff_userid}, {staff_uid}, {staff_avatar}", "{mention}, {name}, {userid}, {uid}, {avatar}, {staff_mention}, {staff_name}, {staff_userid}, {staff_uid}, {staff_avatar}", "{mention}, {name}, {userid}, {rank}, {uid}, {avatar}"];
    return (
        <>
            {Object.keys(ITEMS).map((key, index) => {
                return (
                    <Grid key={index} size={12}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <Typography variant="body2" fontWeight="bold" sx={{ display: "flex", alignItems: "center", cursor: "pointer", mb: "10px", flexGrow: 1 }} onClick={() => (openIndex === index ? setOpenIndex(-1) : setOpenIndex(index))}>
                                {ITEMS[key]}
                            </Typography>
                            <div>
                                <IconButton style={{ transition: "transform 0.2s", transform: openIndex === key ? "rotate(180deg)" : "none" }} onClick={() => setOpenIndex(key)}>
                                    <ExpandMoreRounded />
                                </IconButton>
                            </div>
                        </div>
                        {openIndex === index && <MemoDiscordSingleForm theme={theme} vars={VARS[index]} formConfig={formConfig} form_key={key} roleChange={ROLE_CHANGE[index]} />}
                    </Grid>
                );
            })}
        </>
    );
});

const MemoDiscordOtherForm = memo(({ theme, formConfig }) => {
    const { t: tr } = useTranslation();
    const { webConfig } = useContext(AppContext);

    const [openIndex, setOpenIndex] = useState(-1);
    const ITEMS = useMemo(() => ({ announcement_forwarding: tr("new_announcement"), challenge_forwarding: tr("new_challenge"), challenge_completed_forwarding: tr("completed_challenge"), downloads_forwarding: tr("new_downloadable_item"), event_forwarding: tr("new_event"), event_upcoming_forwarding: tr("upcoming_event"), poll_forwarding: tr("poll_forwarding") }), []);
    const VARS = useMemo(() => ["{mention}, {name}, {userid}, {uid}, {avatar}, {id}, {title}, {content}, {type}", "{mention}, {name}, {userid}, {uid}, {avatar}, {id}, {title}, {description}, {start_timestamp}, {end_timestamp}, {delivery_count}, {required_roles}, {required_distance}, {reward_points}", "{mention}, {name}, {userid}, {uid}, {avatar}, {id}, {title}, {earned_points}", "{mention}, {name}, {userid}, {uid}, {avatar}, {id}, {title}, {description}, {link}", "{mention}, {name}, {userid}, {uid}, {avatar}, {id}, {title}, {description}, {link}, {departure}, {destination}, {distance}, {meetup_timestamp}, {departure_timestamp}", "{mention}, {name}, {userid}, {uid}, {avatar}, {id}, {title}, {description}, {link}, {departure}, {destination}, {distance}, {meetup_timestamp}, {departure_timestamp}", "{mention}, {name}, {userid}, {uid}, {avatar}, {id}, {title}, {description}"], []);
    return (
        <>
            {Object.keys(ITEMS).map((key, index) => {
                if (!webConfig.plugins.includes(key.split("_")[0])) return <></>;
                return (
                    <Grid key={index} size={12}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <Typography variant="body2" fontWeight="bold" sx={{ display: "flex", alignItems: "center", cursor: "pointer", mb: "10px", flexGrow: 1 }} onClick={() => (openIndex === index ? setOpenIndex(-1) : setOpenIndex(index))}>
                                {ITEMS[key]}
                            </Typography>
                            <div>
                                <IconButton style={{ transition: "transform 0.2s", transform: openIndex === key ? "rotate(180deg)" : "none" }} onClick={() => setOpenIndex(key)}>
                                    <ExpandMoreRounded />
                                </IconButton>
                            </div>
                        </div>
                        {openIndex === index && <MemoDiscordSingleForm theme={theme} vars={VARS[index]} formConfig={formConfig} form_key={key} isPrivate={["announcement_forwarding", "event_forwarding", "event_upcoming_forwarding"].includes(key)} secondsAhead={["event_upcoming_forwarding"].includes(key)} />}
                    </Grid>
                );
            })}
        </>
    );
});

const AnnouncementTypeForm = ({ theme, announcement_type, onUpdate }) => {
    const { t: tr } = useTranslation();
    return (
        <Grid container spacing={2} rowSpacing={-1} sx={{ mt: "5px", mb: "15px" }}>
            <Grid
                size={{
                    xs: 6,
                    md: 3,
                }}>
                <TextField
                    style={{ marginBottom: "16px" }}
                    label="ID"
                    variant="outlined"
                    fullWidth
                    value={announcement_type.id}
                    onChange={e => {
                        if (!isNaN(e.target.value)) onUpdate({ ...announcement_type, id: isNaN(parseInt(e.target.value)) ? e.target.value : parseInt(e.target.value) });
                    }}
                    disabled
                />
            </Grid>
            <Grid
                size={{
                    xs: 6,
                    md: 3,
                }}>
                <TextField
                    style={{ marginBottom: "16px" }}
                    label={tr("name")}
                    variant="outlined"
                    fullWidth
                    value={announcement_type.name}
                    onChange={e => {
                        onUpdate({ ...announcement_type, name: e.target.value });
                    }}
                />
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    md: 6,
                }}>
                <RoleSelect initialRoles={announcement_type.staff_role_ids} onUpdate={newRoles => onUpdate({ ...announcement_type, staff_role_ids: newRoles.map(role => role.id) })} label={tr("staff_roles")} style={{ marginBottom: "16px" }} showAllRoles={true} />
            </Grid>
        </Grid>
    );
};

const MemoAnnouncementTypeForm = memo(({ theme, formConfig }) => {
    const { t: tr } = useTranslation();
    return (
        <>
            {formConfig.state.announcement_types.length === 0 && (
                <div style={{ display: "flex", alignItems: "center" }}>
                    <Typography variant="body2" fontWeight="bold" sx={{ mb: "10px", flexGrow: 1 }}>
                        {tr("no_announcement_type_create")}
                    </Typography>
                    <IconButton
                        variant="contained"
                        color="success"
                        onClick={() => {
                            let newAnnouncementTypes = [{ id: 1, name: tr("new_announcement_type"), staff_role_ids: [] }];
                            formConfig.setState({ ...formConfig.state, announcement_types: newAnnouncementTypes });
                        }}>
                        <FontAwesomeIcon icon={faPlus} />
                    </IconButton>
                </div>
            )}
            {formConfig.state.announcement_types.map((announcement_type, index) => (
                <>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <Typography variant="body2" fontWeight="bold" sx={{ mb: "10px", flexGrow: 1 }}>
                            {announcement_type.name}
                        </Typography>
                        <div>
                            <IconButton
                                variant="contained"
                                color="success"
                                onClick={() => {
                                    let newAnnouncementTypes = [...formConfig.state.announcement_types];
                                    let occupiedIds = [];
                                    for (let i = 0; i < formConfig.state.announcement_types.length; i++) {
                                        occupiedIds.push(Number(formConfig.state.announcement_types[i].id));
                                    }
                                    let nextId = announcement_type.id + 1;
                                    while (occupiedIds.includes(nextId)) {
                                        nextId += 1;
                                    }
                                    newAnnouncementTypes.splice(index + 1, 0, { id: nextId, name: tr("new_announcement_type"), staff_role_ids: [] });
                                    formConfig.setState({ ...formConfig.state, announcement_types: newAnnouncementTypes });
                                }}>
                                <FontAwesomeIcon icon={faPlus} />
                            </IconButton>
                            <IconButton
                                variant="contained"
                                color="error"
                                onClick={() => {
                                    let newAnnouncementTypes = [...formConfig.state.announcement_types];
                                    newAnnouncementTypes.splice(index, 1);
                                    formConfig.setState({ ...formConfig.state, announcement_types: newAnnouncementTypes });
                                }}>
                                <FontAwesomeIcon icon={faMinus} />
                            </IconButton>
                            <IconButton
                                variant="contained"
                                color="info"
                                disabled={index === 0}
                                onClick={() => {
                                    if (index >= 1) {
                                        let newAnnouncementTypes = [...formConfig.state.announcement_types];
                                        newAnnouncementTypes[index] = newAnnouncementTypes[index - 1];
                                        newAnnouncementTypes[index - 1] = announcement_type;
                                        formConfig.setState({ ...formConfig.state, announcement_types: newAnnouncementTypes });
                                    }
                                }}>
                                <FontAwesomeIcon icon={faArrowUp} />
                            </IconButton>
                            <IconButton
                                variant="contained"
                                color="warning"
                                onClick={() => {
                                    if (index <= formConfig.state.announcement_types.length - 2) {
                                        let newAnnouncementTypes = [...formConfig.state.announcement_types];
                                        newAnnouncementTypes[index] = newAnnouncementTypes[index + 1];
                                        newAnnouncementTypes[index + 1] = announcement_type;
                                        formConfig.setState({ ...formConfig.state, announcement_types: newAnnouncementTypes });
                                    }
                                }}
                                disabled={index === formConfig.state.announcement_types.length - 1}>
                                <FontAwesomeIcon icon={faArrowDown} />
                            </IconButton>
                        </div>
                    </div>
                    <AnnouncementTypeForm
                        theme={theme}
                        announcement_type={announcement_type}
                        onUpdate={newAnnouncementType => {
                            let newAnnouncementTypes = [...formConfig.state.announcement_types];
                            newAnnouncementTypes[index] = newAnnouncementType;
                            formConfig.setState({ ...formConfig.state, announcement_types: newAnnouncementTypes });
                        }}
                    />
                </>
            ))}
        </>
    );
});

const ApplicationFormForm = ({ theme, form_item, allLabels, onUpdate }) => {
    const { t: tr } = useTranslation();
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
        } else if (form_item.type === "dropdown" || form_item.type === "radio" || form_item.type === "checkbox") {
            if (form_item.choices === undefined) form_item.choices = [];
        }
    }
    return (
        <Grid container spacing={2} rowSpacing={-1} sx={{ mt: "5px", mb: "15px" }}>
            <Grid
                size={{
                    xs: 12,
                    md: 4,
                }}>
                <TextField
                    select
                    size="small"
                    style={{ marginBottom: "16px" }}
                    label={tr("type")}
                    variant="outlined"
                    fullWidth
                    value={form_item.type}
                    onChange={e => {
                        onUpdate({ ...form_item, type: e.target.value });
                    }}>
                    <MenuItem value="info">{tr("information")}</MenuItem>
                    <MenuItem value="text">{tr("short_answer")}</MenuItem>
                    <MenuItem value="textarea">{tr("paragraph")}</MenuItem>
                    <MenuItem value="number">{tr("number")}</MenuItem>
                    <MenuItem value="datetime">{tr("date_time")}</MenuItem>
                    <MenuItem value="date">{tr("date")}</MenuItem>
                    <MenuItem value="dropdown">{tr("dropdown")}</MenuItem>
                    <MenuItem value="radio">{tr("multiple_choice")}</MenuItem>
                    <MenuItem value="checkbox">{tr("checkboxes")}</MenuItem>
                </TextField>
            </Grid>
            {form_item.type === "info" && (
                <>
                    <Grid
                        size={{
                            xs: 12,
                            md: 12,
                        }}>
                        <TextField
                            size="small"
                            style={{ marginBottom: "16px" }}
                            label={tr("text")}
                            variant="outlined"
                            fullWidth
                            value={form_item.text}
                            rows={3}
                            onChange={e => {
                                onUpdate({ ...form_item, text: e.target.value });
                            }}
                        />
                    </Grid>
                </>
            )}
            {form_item.type === "text" && (
                <>
                    <Grid
                        size={{
                            xs: 12,
                            md: 4,
                        }}>
                        <TextField
                            size="small"
                            style={{ marginBottom: "16px" }}
                            label={tr("minimum_characters")}
                            variant="outlined"
                            fullWidth
                            value={form_item.min_length}
                            onChange={e => {
                                if (!isNaN(e.target.value)) onUpdate({ ...form_item, min_length: isNaN(parseInt(e.target.value)) ? e.target.value : parseInt(e.target.value) });
                            }}
                        />
                    </Grid>
                    <Grid
                        size={{
                            xs: 12,
                            md: 12,
                        }}>
                        <TextField
                            size="small"
                            style={{ marginBottom: "16px" }}
                            label={tr("question")}
                            variant="outlined"
                            fullWidth
                            value={form_item.label}
                            onChange={e => {
                                onUpdate({ ...form_item, label: e.target.value });
                            }}
                        />
                    </Grid>
                    <Grid
                        size={{
                            xs: 12,
                            md: 12,
                        }}>
                        <TextField
                            size="small"
                            style={{ marginBottom: "16px" }}
                            label={tr("placeholder")}
                            variant="outlined"
                            fullWidth
                            value={form_item.placeholder}
                            onChange={e => {
                                onUpdate({ ...form_item, placeholder: e.target.value });
                            }}
                        />
                    </Grid>
                </>
            )}
            {form_item.type === "textarea" && (
                <>
                    <Grid
                        size={{
                            xs: 6,
                            md: 4,
                        }}>
                        <TextField
                            size="small"
                            style={{ marginBottom: "16px" }}
                            label={tr("answer_rows")}
                            variant="outlined"
                            fullWidth
                            value={form_item.rows}
                            onChange={e => {
                                if (!isNaN(e.target.value)) onUpdate({ ...form_item, rows: isNaN(parseInt(e.target.value)) ? e.target.value : parseInt(e.target.value) });
                            }}
                        />
                    </Grid>
                    <Grid
                        size={{
                            xs: 6,
                            md: 4,
                        }}>
                        <TextField
                            size="small"
                            style={{ marginBottom: "16px" }}
                            label={tr("minimum_characters")}
                            variant="outlined"
                            fullWidth
                            value={form_item.min_length}
                            onChange={e => {
                                if (!isNaN(e.target.value)) onUpdate({ ...form_item, min_length: isNaN(parseInt(e.target.value)) ? e.target.value : parseInt(e.target.value) });
                            }}
                        />
                    </Grid>
                    <Grid
                        size={{
                            xs: 12,
                            md: 12,
                        }}>
                        <TextField
                            size="small"
                            style={{ marginBottom: "16px" }}
                            label={tr("question")}
                            variant="outlined"
                            fullWidth
                            value={form_item.label}
                            onChange={e => {
                                onUpdate({ ...form_item, label: e.target.value });
                            }}
                        />
                    </Grid>
                    <Grid
                        size={{
                            xs: 12,
                            md: 12,
                        }}>
                        <TextField
                            size="small"
                            style={{ marginBottom: "16px" }}
                            label={tr("placeholder")}
                            variant="outlined"
                            fullWidth
                            value={form_item.placeholder}
                            onChange={e => {
                                onUpdate({ ...form_item, placeholder: e.target.value });
                            }}
                        />
                    </Grid>
                </>
            )}

            {form_item.type === "number" && (
                <>
                    <Grid
                        size={{
                            xs: 12,
                            md: 4,
                        }}>
                        <TextField
                            size="small"
                            style={{ marginBottom: "16px" }}
                            label={tr("min_value")}
                            variant="outlined"
                            fullWidth
                            value={form_item.min_value}
                            onChange={e => {
                                if (!isNaN(e.target.value)) onUpdate({ ...form_item, min_value: isNaN(parseInt(e.target.value)) ? e.target.value : parseInt(e.target.value) });
                            }}
                        />
                    </Grid>
                    <Grid
                        size={{
                            xs: 12,
                            md: 4,
                        }}>
                        <TextField
                            size="small"
                            style={{ marginBottom: "16px" }}
                            label={tr("max_value")}
                            variant="outlined"
                            fullWidth
                            value={form_item.max_value}
                            onChange={e => {
                                if (!isNaN(e.target.value)) onUpdate({ ...form_item, max_value: isNaN(parseInt(e.target.value)) ? e.target.value : parseInt(e.target.value) });
                            }}
                        />
                    </Grid>
                    <Grid
                        size={{
                            xs: 12,
                            md: 12,
                        }}>
                        <TextField
                            size="small"
                            style={{ marginBottom: "16px" }}
                            label={tr("question")}
                            variant="outlined"
                            fullWidth
                            value={form_item.label}
                            onChange={e => {
                                onUpdate({ ...form_item, label: e.target.value });
                            }}
                        />
                    </Grid>
                </>
            )}
            {(form_item.type === "date" || form_item.type === "datetime" || form_item.type === "dropdown" || form_item.type === "radio" || form_item.type === "checkbox") && (
                <>
                    <Grid
                        size={{
                            xs: 12,
                            md: 12,
                        }}>
                        <TextField
                            size="small"
                            style={{ marginBottom: "16px" }}
                            label={tr("question")}
                            variant="outlined"
                            fullWidth
                            value={form_item.label}
                            onChange={e => {
                                onUpdate({ ...form_item, label: e.target.value });
                            }}
                        />
                    </Grid>
                </>
            )}
            {(form_item.type === "dropdown" || form_item.type === "radio" || form_item.type === "checkbox") && (
                <>
                    <Grid
                        sx={{ marginBottom: "8px" }}
                        size={{
                            xs: 12,
                            md: 12,
                        }}>
                        <Typography xs={12} variant="body2">
                            {tr("choices")}
                        </Typography>
                        <CreatableSelect
                            isMulti
                            name="colors"
                            className="basic-multi-select"
                            classNamePrefix="select"
                            styles={customSelectStyles(theme)}
                            value={form_item.choices.map(choice => ({ value: choice, label: choice }))}
                            onChange={newChoices => {
                                onUpdate({
                                    ...form_item,
                                    choices: newChoices.map(item => item.value),
                                });
                            }}
                            menuPortalTarget={document.body}
                        />
                    </Grid>
                </>
            )}
            <Grid size={12}>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={form_item.x_must_be !== undefined}
                            onChange={() => {
                                if (form_item.x_must_be === undefined) {
                                    onUpdate({ ...form_item, x_must_be: { label: "", value: "" } });
                                } else {
                                    onUpdate({ ...form_item, x_must_be: undefined });
                                }
                            }}
                        />
                    }
                    label={tr("display_condition_based_on_answer_to_specific_question")}
                    size="small"
                    style={{ marginTop: "-8px" }}
                />
            </Grid>
            {form_item.x_must_be !== undefined && (
                <>
                    <Grid
                        size={{
                            xs: 12,
                            md: 6,
                        }}>
                        <TextField
                            select
                            size="small"
                            style={{ marginBottom: "16px" }}
                            label={tr("question")}
                            variant="outlined"
                            fullWidth
                            value={form_item.x_must_be.label}
                            onChange={e => {
                                onUpdate({ ...form_item, x_must_be: { ...form_item.x_must_be, label: e.target.value } });
                            }}>
                            {allLabels.map(label => (
                                <MenuItem value={label}>{label}</MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid
                        size={{
                            xs: 12,
                            md: 6,
                        }}>
                        <TextField
                            size="small"
                            style={{ marginBottom: "16px" }}
                            label={tr("answer")}
                            variant="outlined"
                            fullWidth
                            value={form_item.x_must_be.value}
                            onChange={e => {
                                onUpdate({ ...form_item, x_must_be: { ...form_item.x_must_be, value: e.target.value } });
                            }}
                        />
                    </Grid>
                </>
            )}
        </Grid>
    );
};

const MemoApplicationFormForm = memo(({ theme, form, updateForm }) => {
    const { t: tr } = useTranslation();
    const [openIndex, setOpenIndex] = useState(-1);

    const TYPE_NAME = { info: tr("information"), text: tr("short_answer"), textarea: tr("paragraph"), number: tr("number"), datetime: tr("date_time"), date: tr("date"), dropdown: tr("dropdown"), radio: tr("multiple_choice"), checkbox: tr("checkboxes") };
    if (form.length === 0) {
        return (
            <div style={{ display: "flex", alignItems: "center" }}>
                <Typography variant="body2" fontWeight="bold" sx={{ mb: "10px", flexGrow: 1 }}>
                    {tr("no_form_question_create")}
                </Typography>
                <IconButton
                    variant="contained"
                    color="success"
                    onClick={() => {
                        updateForm([{ type: "info", text: tr("welcome_to_application_form") }]);
                    }}>
                    <FontAwesomeIcon icon={faPlus} />
                </IconButton>
            </div>
        );
    }
    const ApplicationFormItem = memo(({ form_item, index }) => {
        return (
            <>
                <div key={`applicatio-form-div-${index}`} style={{ display: "flex", alignItems: "center" }}>
                    <Typography variant="body2" fontWeight="bold" sx={{ display: "flex", alignItems: "center", cursor: "pointer", mb: "10px", flexGrow: 1, color: form_item.color }} onClick={() => (openIndex === index ? setOpenIndex(-1) : setOpenIndex(index))}>
                        {TYPE_NAME[form_item.type]}
                    </Typography>
                    <div key={`form_item-control-div-${index}`}>
                        <IconButton style={{ transition: "transform 0.2s", transform: openIndex === index ? "rotate(180deg)" : "none" }} onClick={() => setOpenIndex(index)}>
                            <ExpandMoreRounded />
                        </IconButton>
                        <IconButton
                            variant="contained"
                            color="success"
                            onClick={() => {
                                let newForm = [...form];
                                setOpenIndex(index + 1);
                                newForm.splice(index + 1, 0, {
                                    type: "text",
                                    text: tr("new_question"),
                                });
                                updateForm(newForm);
                            }}>
                            <FontAwesomeIcon icon={faPlus} />
                        </IconButton>
                        <IconButton
                            variant="contained"
                            color="error"
                            onClick={() => {
                                let newForm = [...form];
                                newForm.splice(index, 1);
                                updateForm(newForm);
                                setOpenIndex(-1);
                            }}>
                            <FontAwesomeIcon icon={faMinus} />
                        </IconButton>
                        <IconButton
                            variant="contained"
                            color="info"
                            disabled={index === 0}
                            onClick={() => {
                                if (index >= 1) {
                                    let newForm = [...form];
                                    newForm[index] = newForm[index - 1];
                                    newForm[index - 1] = form_item;
                                    updateForm(newForm);
                                    if (openIndex === index) setOpenIndex(index - 1);
                                }
                            }}>
                            <FontAwesomeIcon icon={faArrowUp} />
                        </IconButton>
                        <IconButton
                            variant="contained"
                            color="warning"
                            onClick={() => {
                                if (index <= form.length - 2) {
                                    let newForm = [...form];
                                    newForm[index] = newForm[index + 1];
                                    newForm[index + 1] = form_item;
                                    updateForm(newForm);
                                    if (openIndex === index) setOpenIndex(index + 1);
                                }
                            }}
                            disabled={index === form.length - 1}>
                            <FontAwesomeIcon icon={faArrowDown} />
                        </IconButton>
                    </div>
                </div>
            </>
        );
    });
    const BeforeOpen = memo(({ openIndex }) => <>{form.map((form_item, index) => (index < openIndex || openIndex === -1) && <ApplicationFormItem form_item={form_item} index={index} />)}</>);
    const AfterOpen = memo(({ openIndex }) => <>{form.map((form_item, index) => index > openIndex && openIndex !== -1 && <ApplicationFormItem form_item={form_item} index={index} />)}</>);
    let form_item = form[openIndex];
    let index = openIndex;
    return (
        <>
            {(openIndex > 0 || openIndex === -1) && <BeforeOpen openIndex={openIndex} />}
            {openIndex !== -1 && (
                <>
                    <div key={`form_item-form-div-${index}`} style={{ display: "flex", alignItems: "center" }}>
                        <Typography variant="body2" fontWeight="bold" sx={{ display: "flex", alignItems: "center", cursor: "pointer", mb: "10px", flexGrow: 1, color: form_item.color }} onClick={() => (openIndex === index ? setOpenIndex(-1) : setOpenIndex(index))}>
                            {TYPE_NAME[form_item.type]}
                        </Typography>
                        <div key={`form_item-control-div-${index}`}>
                            <IconButton style={{ transition: "transform 0.2s", transform: openIndex === index ? "rotate(180deg)" : "none" }} onClick={() => setOpenIndex(index)}>
                                <ExpandMoreRounded />
                            </IconButton>
                            <IconButton
                                variant="contained"
                                color="success"
                                onClick={e => {
                                    let newForm = [...form];
                                    setOpenIndex(index + 1);
                                    newForm.splice(index + 1, 0, {
                                        type: "text",
                                        text: tr("new_question"),
                                    });
                                    updateForm(newForm);
                                }}>
                                <FontAwesomeIcon icon={faPlus} />
                            </IconButton>
                            <IconButton
                                variant="contained"
                                color="error"
                                onClick={() => {
                                    let newForm = [...form];
                                    newForm.splice(index, 1);
                                    updateForm(newForm);
                                    setOpenIndex(-1);
                                }}>
                                <FontAwesomeIcon icon={faMinus} />
                            </IconButton>
                            <IconButton
                                variant="contained"
                                color="info"
                                disabled={index === 0}
                                onClick={() => {
                                    if (index >= 1) {
                                        let newForm = [...form];
                                        newForm[index] = newForm[index - 1];
                                        newForm[index - 1] = form_item;
                                        updateForm(newForm);
                                        if (openIndex === index) setOpenIndex(index - 1);
                                    }
                                }}>
                                <FontAwesomeIcon icon={faArrowUp} />
                            </IconButton>
                            <IconButton
                                variant="contained"
                                color="warning"
                                onClick={() => {
                                    if (index <= form.length - 2) {
                                        let newForm = [...form];
                                        newForm[index] = newForm[index + 1];
                                        newForm[index + 1] = form_item;
                                        updateForm(newForm);
                                        if (openIndex === index) setOpenIndex(index + 1);
                                    }
                                }}
                                disabled={index === form.length - 1}>
                                <FontAwesomeIcon icon={faArrowDown} />
                            </IconButton>
                        </div>
                    </div>
                    <ApplicationFormForm
                        key={`application-form-input-div-${index}`}
                        theme={theme}
                        form_item={form_item}
                        allLabels={form.filter(form_item => form_item.label !== undefined).map(form_item => form_item.label)}
                        onUpdate={item => {
                            let newForm = [...form];
                            newForm[index] = item;
                            updateForm(newForm);
                        }}
                    />
                </>
            )}
            {openIndex !== -1 && openIndex < form.length - 1 && <AfterOpen openIndex={openIndex} />}
        </>
    );
});

const ApplicationTypeForm = ({ theme, application_type, onUpdate }) => {
    const { t: tr } = useTranslation();
    const [formModalOpen, setFormModalOpen] = useState(false);
    const [form, setForm] = useState(application_type.form !== undefined ? application_type.form : []);
    return (
        <Grid container spacing={2} rowSpacing={-1} sx={{ mt: "5px", mb: "15px" }}>
            <Grid
                size={{
                    xs: 6,
                    md: 3,
                }}>
                <TextField
                    style={{ marginBottom: "16px" }}
                    label="ID"
                    variant="outlined"
                    fullWidth
                    value={application_type.id}
                    onChange={e => {
                        if (!isNaN(e.target.value)) onUpdate({ ...application_type, id: isNaN(parseInt(e.target.value)) ? e.target.value : parseInt(e.target.value) });
                    }}
                    disabled
                />
            </Grid>
            <Grid
                size={{
                    xs: 6,
                    md: 3,
                }}>
                <TextField
                    style={{ marginBottom: "16px" }}
                    label={tr("name")}
                    variant="outlined"
                    fullWidth
                    value={application_type.name}
                    onChange={e => {
                        onUpdate({ ...application_type, name: e.target.value });
                    }}
                />
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    md: 6,
                }}>
                <RoleSelect initialRoles={application_type.staff_role_ids} onUpdate={newRoles => onUpdate({ ...application_type, staff_role_ids: newRoles.map(role => role.id) })} label={tr("staff_roles")} style={{ marginBottom: "16px" }} showAllRoles={true} />
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    md: 6,
                }}>
                <Typography variant="body2">{tr("required_connections")}</Typography>
                <Select
                    defaultValue={application_type.required_connections.map(connection => ({ value: connection, label: connection === "truckersmp" ? "TruckersMP" : connection.charAt(0).toUpperCase() + connection.slice(1) }))}
                    isMulti
                    name="connections"
                    options={[
                        { value: "email", label: tr("email") },
                        { value: "discord", label: "Discord" },
                        { value: "steam", label: "Steam" },
                        { value: "truckersmp", label: "TruckersMP" },
                    ]}
                    className="basic-multi-select"
                    classNamePrefix="select"
                    styles={customSelectStyles(theme)}
                    value={application_type.required_connections.map(connection => ({ value: connection, label: connection === "truckersmp" ? "TruckersMP" : connection.charAt(0).toUpperCase() + connection.slice(1) }))}
                    onChange={newConnections => {
                        onUpdate({
                            ...application_type,
                            required_connections: newConnections.map(item => item.value),
                        });
                    }}
                    menuPortalTarget={document.body}
                />
            </Grid>
            <Grid
                size={{
                    xs: 4,
                    md: 6,
                }}>
                <TextField
                    select
                    style={{ marginBottom: "16px" }}
                    label={tr("required_member_state")}
                    variant="outlined"
                    fullWidth
                    value={application_type.required_member_state}
                    onChange={e => {
                        onUpdate({ ...application_type, required_member_state: e.target.value });
                    }}>
                    <MenuItem value={-1}>{tr("no_requirement")}</MenuItem>
                    <MenuItem value={0}>{tr("not_member")}</MenuItem>
                    <MenuItem value={1}>{tr("is_member")}</MenuItem>
                </TextField>
            </Grid>
            <Grid
                size={{
                    xs: 4,
                    md: 3,
                }}>
                <TextField
                    style={{ marginBottom: "16px" }}
                    label={tr("cooldown_hours")}
                    variant="outlined"
                    fullWidth
                    value={application_type.cooldown_hours}
                    onChange={e => {
                        onUpdate({ ...application_type, cooldown_hours: e.target.value });
                    }}
                />
            </Grid>
            <Grid
                size={{
                    xs: 4,
                    md: 3,
                }}>
                <TextField
                    select
                    style={{ marginBottom: "16px" }}
                    label={tr("multiple_pending_applications")}
                    variant="outlined"
                    fullWidth
                    value={application_type.allow_multiple_pending}
                    onChange={e => {
                        onUpdate({ ...application_type, allow_multiple_pending: e.target.value });
                    }}>
                    <MenuItem value={true}>{tr("allowed")}</MenuItem>
                    <MenuItem value={false}>{tr("prohibited")}</MenuItem>
                </TextField>
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    md: 6,
                }}>
                <Typography variant="body2">{tr("discord_role_changes")}</Typography>
                <CreatableSelect
                    defaultValue={application_type.discord_role_change.map(role => ({ value: role, label: role }))}
                    isMulti
                    name="roles"
                    className="basic-multi-select"
                    classNamePrefix="select"
                    styles={customSelectStyles(theme)}
                    value={application_type.discord_role_change.map(role => ({ value: role, label: role }))}
                    onChange={newRoles => {
                        onUpdate({
                            ...application_type,
                            discord_role_change: newRoles.map(item => item.value),
                        });
                    }}
                    menuPortalTarget={document.body}
                />
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    md: 6,
                }}>
                <RoleSelect initialRoles={application_type.required_either_user_role_ids} onUpdate={newRoles => onUpdate({ ...application_type, required_either_user_role_ids: newRoles.map(role => role.id) })} label={tr("required_user_roles_any")} style={{ marginBottom: "16px" }} showAllRoles={true} />
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    md: 6,
                }}>
                <RoleSelect initialRoles={application_type.required_all_user_role_ids} onUpdate={newRoles => onUpdate({ ...application_type, required_all_user_role_ids: newRoles.map(role => role.id) })} label={tr("required_user_roles_all")} style={{ marginBottom: "16px" }} showAllRoles={true} />
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    md: 6,
                }}>
                <RoleSelect initialRoles={application_type.prohibited_either_user_role_ids} onUpdate={newRoles => onUpdate({ ...application_type, prohibited_either_user_role_ids: newRoles.map(role => role.id) })} label={tr("prohibited_user_roles_any")} style={{ marginBottom: "16px" }} showAllRoles={true} />
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    md: 6,
                }}>
                <RoleSelect initialRoles={application_type.prohibited_all_user_role_ids} onUpdate={newRoles => onUpdate({ ...application_type, prohibited_all_user_role_ids: newRoles.map(role => role.id) })} label={tr("prohibited_user_roles_all")} style={{ marginBottom: "16px" }} showAllRoles={true} />
            </Grid>
            <Grid
                size={{
                    xs: 6,
                    md: 4,
                }}>
                <TextField
                    style={{ marginBottom: "16px" }}
                    label={tr("discord_message")}
                    variant="outlined"
                    fullWidth
                    value={application_type.content}
                    onChange={e => {
                        onUpdate({ ...application_type, content: e.target.value });
                    }}
                />
            </Grid>
            <Grid
                size={{
                    xs: 6,
                    md: 4,
                }}>
                <TextField
                    style={{ marginBottom: "16px" }}
                    label={tr("discord_channel_id")}
                    variant="outlined"
                    fullWidth
                    value={application_type.channel_id}
                    onChange={e => {
                        if (!isNaN(e.target.value)) onUpdate({ ...application_type, channel_id: e.target.value });
                    }}
                />
            </Grid>
            <Grid
                size={{
                    xs: 6,
                    md: 4,
                }}>
                <TextField
                    style={{ marginBottom: "16px" }}
                    label={tr("discord_webhook_alternative")}
                    variant="outlined"
                    fullWidth
                    value={application_type.webhook_url}
                    onChange={e => {
                        onUpdate({ ...application_type, webhook_url: e.target.value });
                    }}
                />
            </Grid>
            <Grid size={12}>
                <Grid size={12}>
                    <Grid container>
                        <Grid
                            size={{
                                xs: 0,
                                sm: 6,
                                md: 8,
                                lg: 10,
                            }}></Grid>
                        <Grid
                            size={{
                                xs: 12,
                                sm: 6,
                                md: 4,
                                lg: 2,
                            }}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={e => {
                                    e.preventDefault();
                                    setFormModalOpen(true);
                                }}
                                startIcon={<FontAwesomeIcon icon={faWrench} />}
                                fullWidth>
                                {tr("open_form_builder")}
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>
                <Dialog
                    open={formModalOpen}
                    onClose={() => {
                        setFormModalOpen(false);
                    }}
                    fullWidth>
                    <DialogTitle>
                        <Typography variant="h6" sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
                            <FontAwesomeIcon icon={faWrench} />
                            &nbsp;&nbsp;{tr("form_builder")}
                        </Typography>
                    </DialogTitle>
                    <DialogContent>
                        <MemoApplicationFormForm theme={theme} form={form} updateForm={setForm}></MemoApplicationFormForm>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => {
                                setFormModalOpen(false);
                            }}
                            variant="contained"
                            color="secondary"
                            sx={{ ml: "auto" }}>
                            {tr("close")}
                        </Button>
                        <Button
                            onClick={() => {
                                onUpdate({ ...application_type, form: form });
                                setFormModalOpen(false);
                            }}
                            variant="contained"
                            color="success"
                            sx={{ ml: "auto" }}>
                            {tr("save")}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Grid>
        </Grid>
    );
};

const MemoApplicationTypeForm = memo(({ theme, formConfig }) => {
    const { t: tr } = useTranslation();
    const [openIndex, setOpenIndex] = useState(-1);

    if (formConfig.state.application_types.length === 0) {
        return (
            <div style={{ display: "flex", alignItems: "center" }}>
                <Typography variant="body2" fontWeight="bold" sx={{ mb: "10px", flexGrow: 1 }}>
                    {tr("no_application_type_create")}
                </Typography>
                <IconButton
                    variant="contained"
                    color="success"
                    onClick={() => {
                        let newApplicationTypes = [
                            {
                                id: 1,
                                name: tr("new_application_type"),
                                staff_application_type_ids: [],
                                required_connections: [],
                                required_member_state: -1,
                                cooldown_hours: 0,
                                allow_multiple_pending: false,
                                application_type_change: [],
                                required_either_user_application_type_ids: [],
                                required_all_user_application_type_ids: [],
                                prohibited_either_user_application_type_ids: [],
                                prohibited_all_user_application_type_ids: [],
                                content: "",
                                channel_id: "",
                                webhook_url: "",
                            },
                        ];
                        formConfig.setState({ ...formConfig.state, application_types: newApplicationTypes });
                    }}>
                    <FontAwesomeIcon icon={faPlus} />
                </IconButton>
            </div>
        );
    }
    const ApplicationTypeItem = memo(({ application_type, index }) => {
        return (
            <>
                <div key={`application-type-form-div-${index}`} style={{ display: "flex", alignItems: "center" }}>
                    <Typography variant="body2" fontWeight="bold" sx={{ display: "flex", alignItems: "center", cursor: "pointer", mb: "10px", flexGrow: 1, color: application_type.color }} onClick={() => (openIndex === index ? setOpenIndex(-1) : setOpenIndex(index))}>
                        {application_type.name}
                    </Typography>
                    <div key={`application-type-control-div-${index}`}>
                        <IconButton style={{ transition: "transform 0.2s", transform: openIndex === index ? "rotate(180deg)" : "none" }} onClick={() => setOpenIndex(index)}>
                            <ExpandMoreRounded />
                        </IconButton>
                        <IconButton
                            variant="contained"
                            color="success"
                            onClick={() => {
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
                                newApplicationTypes.splice(index + 1, 0, {
                                    ...application_type,
                                    id: nextId,
                                    name: tr("new_application_type"),
                                });
                                formConfig.setState({ ...formConfig.state, application_types: newApplicationTypes });
                                setOpenIndex(index + 1);
                            }}>
                            <FontAwesomeIcon icon={faPlus} />
                        </IconButton>
                        <IconButton
                            variant="contained"
                            color="error"
                            onClick={() => {
                                let newApplicationTypes = [...formConfig.state.application_types];
                                newApplicationTypes.splice(index, 1);
                                formConfig.setState({ ...formConfig.state, application_types: newApplicationTypes });
                                setOpenIndex(-1);
                            }}>
                            <FontAwesomeIcon icon={faMinus} />
                        </IconButton>
                        <IconButton
                            variant="contained"
                            color="info"
                            disabled={index === 0}
                            onClick={() => {
                                if (index >= 1) {
                                    let newApplicationTypes = [...formConfig.state.application_types];
                                    newApplicationTypes[index] = newApplicationTypes[index - 1];
                                    newApplicationTypes[index - 1] = application_type;
                                    formConfig.setState({ ...formConfig.state, application_types: newApplicationTypes });
                                    if (openIndex === index) setOpenIndex(index - 1);
                                }
                            }}>
                            <FontAwesomeIcon icon={faArrowUp} />
                        </IconButton>
                        <IconButton
                            variant="contained"
                            color="warning"
                            onClick={() => {
                                if (index <= formConfig.state.application_types.length - 2) {
                                    let newApplicationTypes = [...formConfig.state.application_types];
                                    newApplicationTypes[index] = newApplicationTypes[index + 1];
                                    newApplicationTypes[index + 1] = application_type;
                                    formConfig.setState({ ...formConfig.state, application_types: newApplicationTypes });
                                    if (openIndex === index) setOpenIndex(index + 1);
                                }
                            }}
                            disabled={index === formConfig.state.application_types.length - 1}>
                            <FontAwesomeIcon icon={faArrowDown} />
                        </IconButton>
                    </div>
                </div>
            </>
        );
    });
    const BeforeOpen = memo(({ openIndex }) => <>{formConfig.state.application_types.map((application_type, index) => (index < openIndex || openIndex === -1) && <ApplicationTypeItem application_type={application_type} index={index} />)}</>);
    const AfterOpen = memo(({ openIndex }) => <>{formConfig.state.application_types.map((application_type, index) => index > openIndex && openIndex !== -1 && <ApplicationTypeItem application_type={application_type} index={index} />)}</>);
    let application_type = formConfig.state.application_types[openIndex];
    let index = openIndex;
    return (
        <>
            {(openIndex > 0 || openIndex === -1) && <BeforeOpen openIndex={openIndex} />}
            {openIndex !== -1 && (
                <>
                    <div key={`application-type-form-div-${index}`} style={{ display: "flex", alignItems: "center" }}>
                        <Typography variant="body2" fontWeight="bold" sx={{ display: "flex", alignItems: "center", cursor: "pointer", mb: "10px", flexGrow: 1, color: application_type.color }} onClick={() => (openIndex === index ? setOpenIndex(-1) : setOpenIndex(index))}>
                            {application_type.name}
                        </Typography>
                        <div key={`application-type-control-div-${index}`}>
                            <IconButton style={{ transition: "transform 0.2s", transform: openIndex === index ? "rotate(180deg)" : "none" }} onClick={() => setOpenIndex(index)}>
                                <ExpandMoreRounded />
                            </IconButton>
                            <IconButton
                                variant="contained"
                                color="success"
                                onClick={e => {
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
                                    newApplicationTypes.splice(index + 1, 0, {
                                        ...application_type,
                                        id: nextId,
                                        name: tr("new_application_type"),
                                    });
                                    formConfig.setState({ ...formConfig.state, application_types: newApplicationTypes });
                                    setOpenIndex(index + 1);
                                }}>
                                <FontAwesomeIcon icon={faPlus} />
                            </IconButton>
                            <IconButton
                                variant="contained"
                                color="error"
                                onClick={() => {
                                    let newApplicationTypes = [...formConfig.state.application_types];
                                    newApplicationTypes.splice(index, 1);
                                    formConfig.setState({ ...formConfig.state, application_types: newApplicationTypes });
                                    setOpenIndex(-1);
                                }}>
                                <FontAwesomeIcon icon={faMinus} />
                            </IconButton>
                            <IconButton
                                variant="contained"
                                color="info"
                                disabled={index === 0}
                                onClick={() => {
                                    if (index >= 1) {
                                        let newApplicationTypes = [...formConfig.state.application_types];
                                        newApplicationTypes[index] = newApplicationTypes[index - 1];
                                        newApplicationTypes[index - 1] = application_type;
                                        formConfig.setState({ ...formConfig.state, application_types: newApplicationTypes });
                                        if (openIndex !== -1) setOpenIndex(index - 1);
                                    }
                                }}>
                                <FontAwesomeIcon icon={faArrowUp} />
                            </IconButton>
                            <IconButton
                                variant="contained"
                                color="warning"
                                onClick={() => {
                                    if (index <= formConfig.state.application_types.length - 2) {
                                        let newApplicationTypes = [...formConfig.state.application_types];
                                        newApplicationTypes[index] = newApplicationTypes[index + 1];
                                        newApplicationTypes[index + 1] = application_type;
                                        formConfig.setState({ ...formConfig.state, application_types: newApplicationTypes });
                                        if (openIndex !== -1) setOpenIndex(index + 1);
                                    }
                                }}
                                disabled={index === formConfig.state.application_types.length - 1}>
                                <FontAwesomeIcon icon={faArrowDown} />
                            </IconButton>
                        </div>
                    </div>
                    <ApplicationTypeForm
                        key={`application-type-input-div-${index}`}
                        theme={theme}
                        application_type={application_type}
                        onUpdate={item => {
                            let newApplicationTypes = [...formConfig.state.application_types];
                            newApplicationTypes[index] = item;
                            formConfig.setState({ ...formConfig.state, application_types: newApplicationTypes });
                        }}
                    />
                </>
            )}
            {openIndex !== -1 && openIndex < formConfig.state.application_types.length - 1 && <AfterOpen openIndex={openIndex} />}
        </>
    );
});

const DivisionForm = ({ theme, division, onUpdate }) => {
    const { t: tr } = useTranslation();
    return (
        <Grid container spacing={2} rowSpacing={-1} sx={{ mt: "5px", mb: "15px" }}>
            <Grid
                size={{
                    xs: 6,
                    md: 3,
                }}>
                <TextField
                    style={{ marginBottom: "16px" }}
                    label="ID"
                    variant="outlined"
                    fullWidth
                    value={division.id}
                    onChange={e => {
                        if (!isNaN(e.target.value)) onUpdate({ ...division, id: isNaN(parseInt(e.target.value)) ? e.target.value : parseInt(e.target.value) });
                    }}
                    disabled
                />
            </Grid>
            <Grid
                size={{
                    xs: 6,
                    md: 3,
                }}>
                <TextField
                    style={{ marginBottom: "16px" }}
                    label={tr("name")}
                    variant="outlined"
                    fullWidth
                    value={division.name}
                    onChange={e => {
                        onUpdate({ ...division, name: e.target.value });
                    }}
                />
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    md: 6,
                }}>
                <RoleSelect isMulti={false} initialRoles={[division.role_id]} onUpdate={newRole => onUpdate({ ...division, role_id: newRole })} label={tr("driver_role")} style={{ marginBottom: "16px" }} showAllRoles={true} />
            </Grid>
            <Grid
                size={{
                    xs: 6,
                    md: 3,
                }}>
                <TextField
                    select
                    style={{ marginBottom: "16px" }}
                    label={tr("reward_type")}
                    variant="outlined"
                    fullWidth
                    value={division.points.mode}
                    onChange={e => {
                        onUpdate({ ...division, points: { ...division.points, mode: e.target.value } });
                    }}>
                    <MenuItem value="static">{tr("static")}</MenuItem>
                    <MenuItem value="ratio">{tr("percent_of_distance")}</MenuItem>
                </TextField>
            </Grid>
            <Grid
                size={{
                    xs: 6,
                    md: 3,
                }}>
                <TextField
                    style={{ marginBottom: "16px" }}
                    label={tr("point_percent")}
                    variant="outlined"
                    fullWidth
                    value={division.points.value}
                    onChange={e => {
                        if (!isNaN(e.target.value)) onUpdate({ ...division, points: { ...division.points, value: parseFloat(e.target.value) } });
                    }}
                />
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    md: 6,
                }}>
                <RoleSelect initialRoles={division.staff_role_ids} onUpdate={newRoles => onUpdate({ ...division, staff_role_ids: newRoles.map(role => role.id) })} label={tr("staff_roles")} style={{ marginBottom: "16px" }} showAllRoles={true} />
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    md: 4,
                }}>
                <TextField
                    style={{ marginBottom: "16px" }}
                    label={tr("discord_message")}
                    variant="outlined"
                    fullWidth
                    value={division.content}
                    onChange={e => {
                        onUpdate({ ...division, content: e.target.value });
                    }}
                />
            </Grid>
            <Grid
                size={{
                    xs: 6,
                    md: 4,
                }}>
                <TextField
                    style={{ marginBottom: "16px" }}
                    label={tr("discord_channel_id")}
                    variant="outlined"
                    fullWidth
                    value={division.channel_id}
                    onChange={e => {
                        if (!isNaN(e.target.value)) onUpdate({ ...division, channel_id: e.target.value });
                    }}
                />
            </Grid>
            <Grid
                size={{
                    xs: 6,
                    md: 4,
                }}>
                <TextField
                    style={{ marginBottom: "16px" }}
                    label={tr("discord_webhook_alternative")}
                    variant="outlined"
                    fullWidth
                    value={division.webhook_url}
                    onChange={e => {
                        onUpdate({ ...division, webhook_url: e.target.value });
                    }}
                />
            </Grid>
        </Grid>
    );
};

const MemoDivisionForm = memo(({ theme, formConfig }) => {
    const { t: tr } = useTranslation();
    const { allPerms } = useContext(AppContext);
    return (
        <>
            {formConfig.state.divisions.length === 0 && (
                <div style={{ display: "flex", alignItems: "center" }}>
                    <Typography variant="body2" fontWeight="bold" sx={{ mb: "10px", flexGrow: 1 }}>
                        {tr("no_division_create")}
                    </Typography>
                    <IconButton
                        variant="contained"
                        color="success"
                        onClick={() => {
                            let newDivisions = [{ id: 1, name: tr("new_division"), points: { mode: "static", value: 500 }, role_id: allPerms.driver[0], staff_role_ids: [], content: "", channel_id: "", webhook_url: "" }];
                            formConfig.setState({ ...formConfig.state, divisions: newDivisions });
                        }}>
                        <FontAwesomeIcon icon={faPlus} />
                    </IconButton>
                </div>
            )}
            {formConfig.state.divisions.map((division, index) => (
                <>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <Typography variant="body2" fontWeight="bold" sx={{ mb: "10px", flexGrow: 1 }}>
                            {division.name}
                        </Typography>
                        <div>
                            <IconButton
                                variant="contained"
                                color="success"
                                onClick={() => {
                                    let newDivisions = [...formConfig.state.divisions];
                                    let occupiedIds = [];
                                    for (let i = 0; i < formConfig.state.divisions.length; i++) {
                                        occupiedIds.push(Number(formConfig.state.divisions[i].id));
                                    }
                                    let nextId = division.id + 1;
                                    while (occupiedIds.includes(nextId)) {
                                        nextId += 1;
                                    }
                                    newDivisions.splice(index + 1, 0, { id: nextId, name: tr("new_division"), points: { mode: division.points.mode, value: division.points.value }, role_id: division.role_id, staff_role_ids: [], content: division.content, channel_id: division.channel_id, webhook_url: division.webhook_url });
                                    formConfig.setState({ ...formConfig.state, divisions: newDivisions });
                                }}>
                                <FontAwesomeIcon icon={faPlus} />
                            </IconButton>
                            <IconButton
                                variant="contained"
                                color="error"
                                onClick={() => {
                                    let newDivisions = [...formConfig.state.divisions];
                                    newDivisions.splice(index, 1);
                                    formConfig.setState({ ...formConfig.state, divisions: newDivisions });
                                }}>
                                <FontAwesomeIcon icon={faMinus} />
                            </IconButton>
                            <IconButton
                                variant="contained"
                                color="info"
                                disabled={index === 0}
                                onClick={() => {
                                    if (index >= 1) {
                                        let newDivisions = [...formConfig.state.divisions];
                                        newDivisions[index] = newDivisions[index - 1];
                                        newDivisions[index - 1] = division;
                                        formConfig.setState({ ...formConfig.state, divisions: newDivisions });
                                    }
                                }}>
                                <FontAwesomeIcon icon={faArrowUp} />
                            </IconButton>
                            <IconButton
                                variant="contained"
                                color="warning"
                                onClick={() => {
                                    if (index <= formConfig.state.divisions.length - 2) {
                                        let newDivisions = [...formConfig.state.divisions];
                                        newDivisions[index] = newDivisions[index + 1];
                                        newDivisions[index + 1] = division;
                                        formConfig.setState({ ...formConfig.state, divisions: newDivisions });
                                    }
                                }}
                                disabled={index === formConfig.state.divisions.length - 1}>
                                <FontAwesomeIcon icon={faArrowDown} />
                            </IconButton>
                        </div>
                    </div>
                    <DivisionForm
                        theme={theme}
                        division={division}
                        onUpdate={newDivision => {
                            let newDivisions = [...formConfig.state.divisions];
                            newDivisions[index] = newDivision;
                            formConfig.setState({ ...formConfig.state, divisions: newDivisions });
                        }}
                    />
                </>
            ))}
        </>
    );
});

function exportCsv(columns, data, filename) {
    const csv = Papa.unparse({
        fields: columns,
        data: data,
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
                        obj[key] = row[key];
                    }
                    return obj;
                });
                resolve(data);
            },
            error: function (err) {
                reject(err);
            },
        });
    });
}
async function importCsvElectron(columns) {
    const dataUrl = await window.electron.ipcRenderer.invoke("open-file-dialog", ["csv"]);
    if (dataUrl) {
        const base64Csv = dataUrl.split(",")[1];
        const fileContent = atob(base64Csv);
        return new Promise((resolve, reject) => {
            Papa.parse(fileContent, {
                header: true,
                complete: function (results) {
                    const data = results.data.map(row => {
                        let obj = {};
                        for (let key in row) {
                            obj[key] = row[key];
                        }
                        return obj;
                    });
                    resolve(data);
                },
                error: function (err) {
                    reject(err);
                },
            });
        });
    }
}

const MemoEconomyForm = memo(({ theme, formConfig }) => {
    const { t: tr } = useTranslation();
    const defaultConfig = {
        truck_refund: 0.3,
        scrap_refund: 0.1,
        garage_refund: 0.5,
        slot_refund: 0.5,
        usd_to_coin: 0.5,
        eur_to_coin: 0.6,
        wear_ratio: 1,
        revenue_share_to_company: 0.4,
        truck_rental_cost: 0.4,
        max_wear_before_service: 0.1,
        max_distance_before_scrap: 500000,
        unit_service_price: 1200,
        allow_purchase_truck: true,
        allow_purchase_garage: true,
        allow_purchase_slot: true,
        allow_purchase_merch: true,
        enable_balance_leaderboard: true,
        currency_name: "coin",
    };

    const configName = {
        truck_refund: tr("truck_refund"),
        scrap_refund: tr("scrap_refund"),
        garage_refund: tr("garage_refund"),
        slot_refund: tr("slot_refund"),
        usd_to_coin: tr("usd_to_coin"),
        eur_to_coin: tr("eur_to_coin"),
        wear_ratio: tr("wear_ratio"),
        revenue_share_to_company: tr("revenue_share_to_company"),
        truck_rental_cost: tr("truck_rental_cost"),
        max_wear_before_service: tr("max_wear_before_service"),
        max_distance_before_scrap: tr("max_distance_before_scrap"),
        unit_service_price: tr("unit_service_price"),
        allow_purchase_truck: tr("allow_purchase_truck"),
        allow_purchase_garage: tr("allow_purchase_garage"),
        allow_purchase_slot: tr("allow_purchase_slot"),
        allow_purchase_merch: tr("allow_purchase_merch"),
        enable_balance_leaderboard: tr("enable_balance_leaderboard"),
        currency_name: tr("currency_name"),
    };

    return (
        <>
            <Typography variant="body2">{tr("config_economy_note")}</Typography>
            <Typography variant="body2" sx={{ mb: "5px" }}>
                For your convenience, we provide a list of default trucks and garages that may be imported into config. Read the{" "}
                <a href="https://wiki.charlws.com/books/chub/page/economy-plugin" target="_blank" rel="noreferrer" style={{ color: theme.palette.info.main }}>
                    wiki article
                </a>{" "}
                for more information.
            </Typography>
            <ButtonGroup sx={{ margin: "5px", mb: "10px" }}>
                <Button
                    component="label"
                    variant="contained"
                    color="success"
                    startIcon={<FontAwesomeIcon icon={faFileImport} />}
                    onClick={async () => {
                        if (!window.isElectron) return;
                        const trucks = await importCsvElectron(["id", "game", "brand", "model", "price"]);
                        if (trucks !== undefined) {
                            formConfig.setState({ ...formConfig.state, economy: { ...formConfig.state.economy, trucks } });
                        }
                    }}>
                    {tr("import_trucks")}
                    {!window.isElectron && (
                        <VisuallyHiddenInput
                            type="file"
                            property={{ accept: "text/csv" }}
                            onChange={async e => {
                                const trucks = await importCsv(["id", "game", "brand", "model", "price"], e);
                                if (trucks !== undefined) {
                                    formConfig.setState({ ...formConfig.state, economy: { ...formConfig.state.economy, trucks } });
                                }
                            }}
                        />
                    )}
                </Button>
                <Button
                    variant="contained"
                    color="info"
                    startIcon={<FontAwesomeIcon icon={faFileExport} />}
                    onClick={() => {
                        exportCsv(["id", "game", "brand", "model", "price"], formConfig.state.economy.trucks, "trucks.csv");
                    }}>
                    {tr("export_trucks")}
                </Button>
            </ButtonGroup>
            <ButtonGroup sx={{ margin: "5px", mb: "10px" }}>
                <Button
                    component="label"
                    variant="contained"
                    color="success"
                    startIcon={<FontAwesomeIcon icon={faFileImport} />}
                    onClick={async () => {
                        if (!window.isElectron) return;
                        const garages = await importCsvElectron(["id", "name", "game", "x", "z", "price", "base_slots", "slot_price"]);
                        if (garages !== undefined) {
                            formConfig.setState({ ...formConfig.state, economy: { ...formConfig.state.economy, garages } });
                        }
                    }}>
                    {tr("import_garages")}
                    {!window.isElectron && (
                        <VisuallyHiddenInput
                            type="file"
                            property={{ accept: "text/csv" }}
                            onChange={async e => {
                                const garages = await importCsv(["id", "name", "game", "x", "z", "price", "base_slots", "slot_price"], e);
                                if (garages !== undefined) {
                                    formConfig.setState({ ...formConfig.state, economy: { ...formConfig.state.economy, garages } });
                                }
                            }}
                        />
                    )}
                </Button>
                <Button
                    variant="contained"
                    color="info"
                    startIcon={<FontAwesomeIcon icon={faFileExport} />}
                    onClick={() => {
                        exportCsv(["id", "name", "game", "x", "z", "price", "base_slots", "slot_price"], formConfig.state.economy.garages, "garages.csv");
                    }}>
                    {tr("export_garages")}
                </Button>
            </ButtonGroup>
            <ButtonGroup sx={{ margin: "5px", mb: "10px" }}>
                <Button
                    component="label"
                    variant="contained"
                    color="success"
                    startIcon={<FontAwesomeIcon icon={faFileImport} />}
                    onClick={async () => {
                        if (!window.isElectron) return;
                        const merch = await importCsvElectron(["id", "name", "buy_price", "sell_price"]);
                        if (merch !== undefined) {
                            formConfig.setState({ ...formConfig.state, economy: { ...formConfig.state.economy, merch } });
                        }
                    }}>
                    {tr("import_merch")}
                    {!window.isElectron && (
                        <VisuallyHiddenInput
                            type="file"
                            property={{ accept: "text/csv" }}
                            onChange={async e => {
                                const merch = await importCsv(["id", "name", "buy_price", "sell_price"], e);
                                if (merch !== undefined) {
                                    formConfig.setState({ ...formConfig.state, economy: { ...formConfig.state.economy, merch } });
                                }
                            }}
                        />
                    )}
                </Button>
                <Button
                    variant="contained"
                    color="info"
                    startIcon={<FontAwesomeIcon icon={faFileExport} />}
                    onClick={() => {
                        exportCsv(["id", "name", "buy_price", "sell_price"], formConfig.state.economy.merch, "merch.csv");
                    }}>
                    {tr("export_merch")}
                </Button>
            </ButtonGroup>
            <Grid container spacing={2} rowSpacing={-1} sx={{ mt: "5px", mb: "15px" }}>
                {Object.entries(defaultConfig).map(([key, value]) => {
                    switch (typeof value) {
                        case "boolean":
                            return (
                                <Grid
                                    key={key}
                                    size={{
                                        xs: 6,
                                        md: 3,
                                    }}>
                                    <TextField
                                        size="small"
                                        select
                                        label={configName[key]}
                                        variant="outlined"
                                        fullWidth
                                        style={{ marginBottom: "16px" }}
                                        value={formConfig.state.economy[key]}
                                        onChange={e => {
                                            formConfig.setState({ ...formConfig.state, economy: { ...formConfig.state.economy, [key]: e.target.value } });
                                        }}>
                                        <MenuItem value={true}>{tr("yes")}</MenuItem>
                                        <MenuItem value={false}>{tr("no")}</MenuItem>
                                    </TextField>
                                </Grid>
                            );
                        case "string":
                            return (
                                <Grid
                                    key={key}
                                    size={{
                                        xs: 6,
                                        md: 3,
                                    }}>
                                    <TextField
                                        size="small"
                                        label={configName[key]}
                                        variant="outlined"
                                        fullWidth
                                        style={{ marginBottom: "16px" }}
                                        value={formConfig.state.economy[key]}
                                        onChange={e => {
                                            formConfig.setState({ ...formConfig.state, economy: { ...formConfig.state.economy, [key]: e.target.value } });
                                        }}
                                    />
                                </Grid>
                            );
                        default:
                            return (
                                <Grid
                                    key={key}
                                    size={{
                                        xs: 6,
                                        md: 3,
                                    }}>
                                    <TextField
                                        size="small"
                                        label={configName[key]}
                                        variant="outlined"
                                        fullWidth
                                        style={{ marginBottom: "16px" }}
                                        value={formConfig.state.economy[key]}
                                        onChange={e => {
                                            formConfig.setState({ ...formConfig.state, economy: { ...formConfig.state.economy, [key]: isNaN(e.target.value) ? value : Number(e.target.value) } });
                                        }}
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
    const { t: tr } = useTranslation();
    const { apiPath, apiVersion, vtcLevel, webConfig: curWebConfig, setWebConfig: setCurWebConfig, curUser } = useContext(AppContext);
    const theme = useTheme();

    const [snackbarContent, setSnackbarContent] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const handleCloseSnackbar = useCallback(() => {
        setSnackbarContent("");
    }, []);

    const [tab, setTab] = useState(0);
    const handleTabChange = (event, newValue) => {
        setTab(newValue);
    };

    // this could make animations show
    const [formSectionRender, setFormSectionRender] = useState(new Array(Object.keys(CONFIG_SECTIONS).length).fill(false));
    const [formSectionOpen, setFormSectionOpen] = useState(new Array(Object.keys(CONFIG_SECTIONS).length).fill(false));
    const handleFormToggle = index => {
        if (!formSectionRender[index]) {
            setFormSectionRender(prevStates => {
                const newStates = [...prevStates];
                newStates[index] = !newStates[index];
                return newStates;
            });
            setTimeout(function () {
                setFormSectionOpen(prevStates => {
                    const newStates = [...prevStates];
                    newStates[index] = !newStates[index];
                    return newStates;
                });
            }, 5);
        } else {
            setTimeout(function () {
                setFormSectionRender(prevStates => {
                    const newStates = [...prevStates];
                    newStates[index] = !newStates[index];
                    return newStates;
                });
            }, 500);
            setFormSectionOpen(prevStates => {
                const newStates = [...prevStates];
                newStates[index] = !newStates[index];
                return newStates;
            });
        }
    };

    const [mfaOtp, setMfaOtp] = useState("");

    const [webConfig, setWebConfig] = useState({ ...curWebConfig, name_color: curWebConfig.name_color !== null ? curWebConfig.name_color : "/", theme_main_color: curWebConfig.theme_main_color !== null ? curWebConfig.theme_main_color : "/", theme_background_color: curWebConfig.theme_background_color !== null ? curWebConfig.theme_background_color : "/" });
    const [webConfigDisabled, setWebConfigDisabled] = useState(false);
    const saveWebConfig = useCallback(async () => {
        window.loading += 1;
        setWebConfigDisabled(true);

        function parse_color(s) {
            if (s.startsWith("#")) {
                return parseInt(s.substring(1), 16);
            } else {
                return -1;
            }
        }

        let newWebConfig = { ...webConfig, name_color: parse_color(webConfig.name_color), theme_main_color: parse_color(webConfig.theme_main_color), theme_background_color: parse_color(webConfig.theme_background_color) };

        setCurWebConfig({ ...webConfig, name_color: webConfig.name_color.startsWith("#") ? webConfig.name_color : null, theme_main_color: webConfig.theme_main_color.startsWith("#") ? webConfig.theme_main_color : null, theme_background_color: webConfig.theme_background_color.startsWith("#") ? webConfig.theme_background_color : null });

        let resp = await axios({ url: `${apiPath}/auth/ticket`, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status !== 200) {
            setWebConfigDisabled(false);
            window.loading -= 1;
            setSnackbarContent(tr("failed_to_generate_auth_ticket_try_again_later"));
            setSnackbarSeverity("error");
            return;
        }
        let ticket = resp.data.token;

        resp = await axios({ url: `https://config.chub.page/config?domain=${curWebConfig.domain}`, data: { config: newWebConfig }, method: "PATCH", headers: { Authorization: `Ticket ${ticket}` } });
        if (resp.status === 204) {
            setSnackbarContent(tr("web_config_updated"));
            setSnackbarSeverity("success");
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }

        setWebConfigDisabled(false);
        window.loading -= 1;
    }, [apiPath, webConfig]);

    const [apiConfig, setApiConfig] = useState(null);
    const formConfig = Array.from({ length: Object.keys(CONFIG_SECTIONS).length }, () => {
        const [state, setState] = useState(null);
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
                setSnackbarContent(error.message);
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
        for (let i = 0; i < config["hook_audit_log"].length; i++) {
            if (config["hook_audit_log"][i]["category"].includes("*")) config["hook_audit_log"][i]["category"] = "*";
        }

        window.loading += 1;
        setApiConfigDisabled(true);

        let resp = await axios({ url: `${apiPath}/config`, method: "PATCH", data: { config: config }, headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            setSnackbarContent(tr("api_config_updated_remember_to_reload_to_make_changes_take"));
            setSnackbarSeverity("success");
            setApiLastModify(+new Date() / 1000);
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }

        setApiConfigDisabled(false);
        window.loading -= 1;
    }, [apiPath, apiConfig]);
    const showReloadApiConfig = useCallback(async () => {
        if (curUser.mfa === false) {
            setSnackbarContent(tr("rejected_you_must_enable_mfa_before_reloading_config"));
            setSnackbarSeverity("error");
            return;
        }
        setReloadModalOpen(true);
    }, []);
    const reloadApiConfig = useCallback(async () => {
        let otp = mfaOtp.replace(" ", "");
        if (isNaN(otp) || otp.length !== 6) {
            setSnackbarContent(tr("invalid_mfa_otp"));
            setSnackbarSeverity("error");
            return;
        }
        setApiConfigDisabled(true);
        let resp = await axios({ url: `${apiPath}/config/reload`, method: "POST", data: { otp: otp }, headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            setSnackbarContent(tr("config_reloaded"));
            setSnackbarSeverity("success");
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setApiConfigDisabled(false);
        setReloadModalOpen(false);
    }, [apiPath, mfaOtp]);
    const enableDiscordRoleConnection = useCallback(async () => {
        setApiConfigDisabled(true);
        let resp = await axios({ url: `${apiPath}/discord/role-connection/enable`, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            setSnackbarContent(tr("success"));
            setSnackbarSeverity("success");
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setApiConfigDisabled(false);
    }, [apiPath]);
    const disableDiscordRoleConnection = useCallback(async () => {
        setApiConfigDisabled(true);
        let resp = await axios({ url: `${apiPath}/discord/role-connection/disable`, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            setSnackbarContent(tr("success"));
            setSnackbarSeverity("success");
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setApiConfigDisabled(false);
    }, [apiPath]);

    useEffect(() => {
        async function doLoad() {
            window.loading += 1;

            const [_apiConfig] = await makeRequestsAuto([{ url: `${apiPath}/config`, auth: true }]);

            if (_apiConfig.config.delivery_rules.required_realistic_settings === undefined) {
                _apiConfig.config.delivery_rules.required_realistic_settings = [];
            }
            setFormConfigOrg(_apiConfig.config);
            setApiConfig(JSON.stringify(_apiConfig.config, null, 4));
            setApiBackup(JSON.stringify(_apiConfig.backup, null, 4));
            setApiLastModify(_apiConfig.config_last_modified);

            if (_apiConfig.config.trackers.length === 0) _apiConfig.config.trackers = [{ type: "trucky", company_id: "", api_token: "", webhook_secret: "", ip_whitelist: [] }];
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

            window.loading -= 1;
        }
        doLoad();
    }, [apiPath]);

    const saveFormConfig = useCallback(
        async section => {
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

            window.loading += 1;
            setApiConfigDisabled(true);

            let resp = await axios({ url: `${apiPath}/config`, method: "PATCH", data: { config: config }, headers: { Authorization: `Bearer ${getAuthToken()}` } });
            if (resp.status === 204) {
                setSnackbarContent(tr("api_config_updated_remember_to_reload_to_make_changes_take"));
                setSnackbarSeverity("success");
                setApiLastModify(+new Date() / 1000);
            } else {
                setSnackbarContent(resp.data.error);
                setSnackbarSeverity("error");
            }

            setApiConfigDisabled(false);
            window.loading -= 1;
        },
        [apiPath, formConfig, formConfigOrg]
    );

    const [buildhash, setBuildHash] = useState("drgn.dev");
    useEffect(() => {
        const scripts = document.getElementsByTagName("script");
        const mainScript = Array.from(scripts).find(script => script.src);

        if (mainScript) {
            const filename = mainScript.src.split("/").pop().replace(".js", "");
            if (filename === "client") setBuildHash("drgn.dev");
            else setBuildHash("drgn." + (filename.substring(0, 8) || "dev"));
        }
    }, []);

    const [advancedPlugins, setAdvancedPlugins] = useState([]);
    const [reloadAP, setReloadAP] = useState(0);
    const loadAdvancedPlugins = useCallback(async () => {
        let resp = await axios({ url: `${apiPath}/advanced-plugin/list`, method: "GET" });
        if (resp.status === 200) {
            setAdvancedPlugins(resp.data);
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
    }, []);
    useEffect(() => {
        loadAdvancedPlugins();
    }, [reloadAP]);

    const [pluginId, setPluginId] = useState("unknown");
    const [pluginKey, setPluginKey] = useState("");
    const [adpSettingsOpen, setADPSettingsOpen] = useState(false);
    const [adpSettings, setADPSettings] = useState({});
    const [adpDisabled, setADPDisabled] = useState(false); // form button
    const toggleAdvancedPlugin = useCallback(async () => {
        let isEnabled = false;
        for (let i = 0; i < advancedPlugins.length; i++) {
            if (advancedPlugins[i].id === pluginId) {
                isEnabled = advancedPlugins[i].enabled;
            }
        }
        if (isEnabled) {
            let resp = await axios({ url: `${apiPath}/advanced-plugin/disable?name=${pluginId}`, method: "POST", headers: { key: pluginKey } });
            if (resp.status === 200) {
                setSnackbarContent(tr("success"));
                setSnackbarSeverity("success");
                setReloadAP(+new Date());
            } else {
                setSnackbarContent(resp.data.error);
                setSnackbarSeverity("error");
            }
        } else {
            let resp = await axios({
                url: `${apiPath}/advanced-plugin/enable?name=${pluginId}`,
                method: "POST",
                headers: { key: pluginKey },
            });
            if (resp.status === 200) {
                setSnackbarContent(tr("success"));
                setSnackbarSeverity("success");
                setReloadAP(+new Date());
            } else {
                setSnackbarContent(resp.data.error);
                setSnackbarSeverity("error");
            }
        }
    }, [advancedPlugins, pluginId, pluginKey]);
    const loadADPSettings = useCallback(async pluginId => {
        let resp = await axios({ url: `${apiPath}/advanced-plugins/${pluginId}/settings`, method: "GET", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 200) {
            setADPSettings(JSON.stringify(resp.data.config, null, 4));
            setADPSettingsOpen(true);
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
    }, []);
    const updateADPSettings = useCallback(async () => {
        try {
            JSON.parse(adpSettings);
        } catch (error) {
            if (error instanceof SyntaxError) {
                setSnackbarContent(error.message);
            } else {
                setSnackbarContent(error);
            }
            setSnackbarSeverity("error");
            return;
        }
        setADPDisabled(true);
        let resp = await axios({
            url: `${apiPath}/advanced-plugins/${pluginId}/settings`,
            method: "PATCH",
            data: { config: JSON.parse(adpSettings) },
            headers: { Authorization: `Bearer ${getAuthToken()}` },
        });
        if (resp.status === 204) {
            setSnackbarContent(tr("success"));
            setSnackbarSeverity("success");
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setADPDisabled(false);
    }, [adpSettings, pluginId]);

    const PLUGINS = { announcement: "Announcement", application: "Application", challenge: "Challenge", division: "Division", downloads: "Downloads", economy: "Economy", event: "Event", poll: "Poll", banner: "Profile Banner", route: "Delivery Route" };
    const DHPLAN = { 0: "Regular Plan", 1: "Premium Plan", 3: "Special Guest" };

    return (
        <>
            <Card>
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                    <Tabs value={tab} onChange={handleTabChange} aria-label="map tabs" color="info" TabIndicatorProps={{ style: { backgroundColor: theme.palette.info.main } }}>
                        <Tab
                            label={
                                <>
                                    <FontAwesomeIcon icon={faCircleInfo} />
                                    {tr("info")}
                                </>
                            }
                            {...tabBtnProps(0, tab, theme)}
                        />
                        <Tab
                            label={
                                <>
                                    <FontAwesomeIcon icon={faServer} />
                                    {tr("api")}
                                </>
                            }
                            {...tabBtnProps(1, tab, theme)}
                        />
                        <Tab
                            label={
                                <>
                                    <FontAwesomeIcon icon={faServer} />
                                    {tr("api_json")}
                                </>
                            }
                            {...tabBtnProps(2, tab, theme)}
                        />
                        <Tab
                            label={
                                <>
                                    <FontAwesomeIcon icon={faDesktop} />
                                    {tr("web")}
                                </>
                            }
                            {...tabBtnProps(3, tab, theme)}
                        />
                    </Tabs>
                </Box>
                <TabPanel value={tab} index={0}>
                    <Typography variant="h6">The Drivers Hub Project (CHub)</Typography>
                    <br />
                    <Typography variant="body2" fontWeight="bold">
                        Information
                    </Typography>
                    <Grid container spacing={2} rowSpacing={-0.5}>
                        <Grid size={12}>
                            <Typography variant="body2">License: {DHPLAN[vtcLevel]}</Typography>
                        </Grid>
                        <Grid
                            size={{
                                xs: 12,
                                md: 6,
                            }}>
                            <Typography variant="body2">Unique ID: {curWebConfig.abbr}</Typography>
                        </Grid>
                        <Grid
                            size={{
                                xs: 12,
                                md: 6,
                            }}>
                            <Typography variant="body2">Company Name: {curWebConfig.name}</Typography>
                        </Grid>
                    </Grid>
                    <br />
                    <Typography variant="body2" fontWeight="bold">
                        Versions
                    </Typography>
                    <Grid container spacing={2} rowSpacing={-0.5}>
                        <Grid
                            size={{
                                xs: 12,
                                md: 6,
                            }}>
                            <Typography variant="body2">Client: 3.4.6 (build.{buildhash})</Typography>
                        </Grid>
                        <Grid
                            size={{
                                xs: 12,
                                md: 6,
                            }}>
                            <Typography variant="body2">Server: {apiVersion}</Typography>
                        </Grid>
                    </Grid>
                    <br />
                    <Typography variant="body2" fontWeight="bold">
                        URLs
                    </Typography>
                    <Grid container spacing={2} rowSpacing={-0.5}>
                        <Grid
                            size={{
                                xs: 12,
                                md: 4,
                            }}>
                            <Typography variant="body2">
                                Trucky Webhook URL:
                                <br />
                                {apiPath}/trucky/update
                            </Typography>
                        </Grid>
                        <Grid
                            size={{
                                xs: 12,
                                md: 4,
                            }}>
                            <Typography variant="body2">
                                TrackSim Webhook URL:
                                <br />
                                {apiPath}/tracksim/update
                            </Typography>
                        </Grid>
                        <Grid
                            size={{
                                xs: 12,
                                md: 4,
                            }}>
                            <Typography variant="body2">
                                Custom Tracker Webhook URL:
                                <br />
                                {apiPath}/custom/update
                            </Typography>
                        </Grid>
                        <Grid
                            size={{
                                xs: 12,
                                md: 12,
                            }}>
                            <Typography variant="body2">
                                <br />
                                Discord Application Redirect URI: https://{webConfig.domain}/auth/discord/callback
                            </Typography>
                        </Grid>
                    </Grid>
                    <br />
                    <Typography variant="body2" fontWeight="bold">
                        Plugins
                    </Typography>
                    <Grid container spacing={2} rowSpacing={-0.5}>
                        {Object.keys(PLUGINS).map(plugin => (
                            <Grid
                                size={{
                                    xs: 6,
                                    sm: 6,
                                    md: 4,
                                    lg: 3,
                                }}>
                                <Typography variant="body2">
                                    {curWebConfig.plugins.includes(plugin) && !["banner", "route"].includes(plugin) && <FontAwesomeIcon icon={faLockOpen}></FontAwesomeIcon>}
                                    {!curWebConfig.plugins.includes(plugin) && !["banner", "route"].includes(plugin) && <FontAwesomeIcon icon={faLock}></FontAwesomeIcon>}
                                    {["banner", "route"].includes(plugin) && <FontAwesomeIcon icon={faCircleQuestion}></FontAwesomeIcon>}
                                    &nbsp;{PLUGINS[plugin]}
                                </Typography>
                            </Grid>
                        ))}
                    </Grid>
                    <br />
                    <Typography variant="body2" fontWeight="bold">
                        Advanced Plugins{" "}
                        <Tooltip
                            placement="top"
                            arrow
                            title={
                                <Typography variant="body2">
                                    Advanced plugins provide additional features on top of the core system and regular plugins.
                                    <br />
                                    These optional functions cost ADP Credits (ADPC) to unlock.
                                    <br />
                                    ADP Credits (ADPC) may be accumulated by referring new VTCs to use CHub (10 credits/referral), joining giveaways in Discord, or be purchased at US$1/credit.
                                    <br />
                                    For more questions regarding advanced plugins or ADP Credits (ADPC), please contact us in Discord.
                                </Typography>
                            }
                            PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, -10] } }] }}>
                            <FontAwesomeIcon icon={faInfoCircle} />
                        </Tooltip>
                    </Typography>
                    <Grid container spacing={2} rowSpacing={-0.5} sx={{ mb: "5px" }}>
                        {advancedPlugins.map(plugin => (
                            <Grid
                                size={{
                                    xs: 6,
                                    sm: 6,
                                    md: 4,
                                    lg: 3,
                                }}>
                                <Typography
                                    variant="body2"
                                    onClick={() => {
                                        setPluginId(plugin.id);
                                    }}>
                                    {plugin.enabled && <FontAwesomeIcon icon={faLockOpen}></FontAwesomeIcon>}
                                    {!plugin.enabled && <FontAwesomeIcon icon={faLock}></FontAwesomeIcon>}
                                    &nbsp;{plugin.name} (ADPC {plugin.cost})&nbsp;
                                    {plugin.settings && plugin.enabled && (
                                        <FontAwesomeIcon
                                            icon={faCogs}
                                            onClick={() => {
                                                loadADPSettings(plugin.id);
                                            }}
                                            style={{ cursor: "pointer" }}></FontAwesomeIcon>
                                    )}
                                </Typography>
                            </Grid>
                        ))}
                    </Grid>
                    <Typography variant="body2">
                        Enable/Disable Advanced Plugin with Key:&nbsp;&nbsp;
                        <TextField
                            select
                            size="small"
                            value={pluginId}
                            onChange={e => {
                                setPluginId(e.target.value);
                            }}>
                            {pluginId === "unknown" && (
                                <MenuItem key="unknown" value="unknown">
                                    Select one
                                </MenuItem>
                            )}
                            {advancedPlugins.map(plugin => (
                                <MenuItem key={plugin.id} value={plugin.id}>
                                    {plugin.name}
                                </MenuItem>
                            ))}
                        </TextField>
                        &nbsp;&nbsp;
                        <TextField
                            size="small"
                            value={pluginKey}
                            onChange={e => {
                                setPluginKey(e.target.value);
                            }}
                        />
                        &nbsp;&nbsp;
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => {
                                toggleAdvancedPlugin();
                            }}>
                            {tr("submit")}
                        </Button>
                    </Typography>
                    <br />
                    <Typography variant="body2">
                        <FontAwesomeIcon icon={faLockOpen}></FontAwesomeIcon> indicates enabled plugins and <FontAwesomeIcon icon={faLock}></FontAwesomeIcon> indicates disabled plugins.
                        <br />
                        <FontAwesomeIcon icon={faCircleQuestion}></FontAwesomeIcon> indicates that the client is not capable of detecting whether the plugin is enabled or disabled.
                        <br />
                        You may be able to purchase new plugins on our{" "}
                        <a href="https://drivershub.charlws.com/setup" style={{ color: theme.palette.info.main, cursor: "pointer" }}>
                            website
                        </a>
                        , where pricing is displayed as well. Alternatively, reach out to us by creating a ticket in our Discord server to purchase additional plugins.
                    </Typography>
                    <Typography variant="body2">
                        CHub Discord Server: <a href="https://discord.gg/KRFsymnVKm">https://discord.gg/KRFsymnVKm</a>
                    </Typography>
                </TabPanel>
                <TabPanel value={tab} index={1}>
                    <Typography variant="body2" component="div" sx={{ mt: "5px" }}>
                        {tr("config_note_1")}
                        <br />
                        {tr("config_note_2")}
                        <br />
                        {tr("config_note_3")}
                        <br />
                        {tr("config_note_4")}
                        <br />
                        <br />
                        {formConfigReady && (
                            <>
                                <Typography variant="h6" style={{ display: "flex", alignItems: "center", cursor: "pointer" }} onClick={() => handleFormToggle(0)}>
                                    <div style={{ flexGrow: 1 }}>{tr("general")}</div>
                                    <IconButton style={{ transition: "transform 0.2s", transform: formSectionOpen[0] ? "rotate(180deg)" : "none" }}>
                                        <ExpandMoreRounded />
                                    </IconButton>
                                </Typography>
                                {formSectionRender[0] && (
                                    <Collapse in={formSectionOpen[0]}>
                                        <Typography variant="body2" sx={{ mb: "15px" }}>
                                            NOTE: Audit Log Category could be either * (for all categories) or a list of categories separated with comma.
                                            <br />
                                            Supported categories: announcement, application, auth, challenge, division, dlog, downloads, economy, event, member, poll, system, tracker, user
                                            <br />
                                            Up to 5 categories is supported by Form Config. To add more categories, use JSON Config.
                                        </Typography>
                                        <Grid container spacing={2} rowSpacing={-1} sx={{ mt: "5px" }}>
                                            <MemoGeneralForm theme={theme} formConfig={formConfig[0]} />
                                            <Grid size={12}>
                                                <Grid container>
                                                    <Grid
                                                        size={{
                                                            xs: 0,
                                                            sm: 6,
                                                            md: 8,
                                                            lg: 10,
                                                        }}></Grid>
                                                    <Grid
                                                        size={{
                                                            xs: 12,
                                                            sm: 6,
                                                            md: 4,
                                                            lg: 2,
                                                        }}>
                                                        <ButtonGroup fullWidth>
                                                            <Button
                                                                variant="contained"
                                                                color="error"
                                                                onClick={() => {
                                                                    showReloadApiConfig();
                                                                }}>
                                                                {tr("reload")}
                                                            </Button>
                                                            <Button
                                                                variant="contained"
                                                                color="success"
                                                                onClick={() => {
                                                                    saveFormConfig("general");
                                                                }}
                                                                disabled={apiConfigDisabled}>
                                                                {tr("save")}
                                                            </Button>
                                                        </ButtonGroup>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    </Collapse>
                                )}

                                <Typography variant="h6" style={{ display: "flex", alignItems: "center", cursor: "pointer" }} onClick={() => handleFormToggle(1)}>
                                    <div style={{ flexGrow: 1 }}>{tr("account_profile")}</div>
                                    <IconButton style={{ transition: "transform 0.2s", transform: formSectionOpen[1] ? "rotate(180deg)" : "none" }}>
                                        <ExpandMoreRounded />
                                    </IconButton>
                                </Typography>
                                {formSectionRender[1] && (
                                    <Collapse in={formSectionOpen[1]}>
                                        <Grid container spacing={2} rowSpacing={-1} sx={{ mt: "5px" }}>
                                            <MemoProfileForm theme={theme} formConfig={formConfig[1]} />
                                            <Grid size={12}>
                                                <Grid container>
                                                    <Grid
                                                        size={{
                                                            xs: 0,
                                                            sm: 6,
                                                            md: 8,
                                                            lg: 10,
                                                        }}></Grid>
                                                    <Grid
                                                        size={{
                                                            xs: 12,
                                                            sm: 6,
                                                            md: 4,
                                                            lg: 2,
                                                        }}>
                                                        <ButtonGroup fullWidth>
                                                            <Button
                                                                variant="contained"
                                                                color="error"
                                                                onClick={() => {
                                                                    showReloadApiConfig();
                                                                }}>
                                                                {tr("reload")}
                                                            </Button>
                                                            <Button
                                                                variant="contained"
                                                                color="success"
                                                                onClick={() => {
                                                                    saveFormConfig("profile");
                                                                }}
                                                                disabled={apiConfigDisabled}>
                                                                {tr("save")}
                                                            </Button>
                                                        </ButtonGroup>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    </Collapse>
                                )}

                                <Typography variant="h6" style={{ display: "flex", alignItems: "center", cursor: "pointer" }} onClick={() => handleFormToggle(2)}>
                                    <div style={{ flexGrow: 1 }}>{tr("tracker")}</div>
                                    <IconButton style={{ transition: "transform 0.2s", transform: formSectionOpen[2] ? "rotate(180deg)" : "none" }}>
                                        <ExpandMoreRounded />
                                    </IconButton>
                                </Typography>
                                {formSectionRender[2] && (
                                    <Collapse in={formSectionOpen[2]}>
                                        <Typography variant="body2" sx={{ mb: "10px" }}>
                                            {tr("config_tracker_note")}
                                            <br />
                                            {tr("config_tracker_note_2")}
                                        </Typography>
                                        <MemoTrackerForm theme={theme} formConfig={formConfig[2]} />
                                        <Grid size={12}>
                                            <Grid container>
                                                <Grid
                                                    size={{
                                                        xs: 0,
                                                        sm: 6,
                                                        md: 8,
                                                        lg: 10,
                                                    }}></Grid>
                                                <Grid
                                                    size={{
                                                        xs: 12,
                                                        sm: 6,
                                                        md: 4,
                                                        lg: 2,
                                                    }}>
                                                    <ButtonGroup fullWidth>
                                                        <Button
                                                            variant="contained"
                                                            color="error"
                                                            onClick={() => {
                                                                showReloadApiConfig();
                                                            }}>
                                                            {tr("reload")}
                                                        </Button>
                                                        <Button
                                                            variant="contained"
                                                            color="success"
                                                            onClick={() => {
                                                                saveFormConfig("tracker");
                                                            }}
                                                            disabled={apiConfigDisabled}>
                                                            {tr("save")}
                                                        </Button>
                                                    </ButtonGroup>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    </Collapse>
                                )}

                                <Typography variant="h6" style={{ display: "flex", alignItems: "center", cursor: "pointer" }} onClick={() => handleFormToggle(3)}>
                                    <div style={{ flexGrow: 1 }}>{tr("job_logging")}</div>
                                    <IconButton style={{ transition: "transform 0.2s", transform: formSectionOpen[3] ? "rotate(180deg)" : "none" }}>
                                        <ExpandMoreRounded />
                                    </IconButton>
                                </Typography>
                                {formSectionRender[3] && (
                                    <Collapse in={formSectionOpen[3]}>
                                        <Typography variant="body2" sx={{ mb: "15px" }}>
                                            {tr("config_job_logging_note")}
                                        </Typography>
                                        <Grid container spacing={2} rowSpacing={-1} sx={{ mt: "5px" }}>
                                            <MemoDlogForm theme={theme} formConfig={formConfig[3]} />
                                            <Grid size={12}>
                                                <Grid container>
                                                    <Grid
                                                        size={{
                                                            xs: 0,
                                                            sm: 6,
                                                            md: 8,
                                                            lg: 10,
                                                        }}></Grid>
                                                    <Grid
                                                        size={{
                                                            xs: 12,
                                                            sm: 6,
                                                            md: 4,
                                                            lg: 2,
                                                        }}>
                                                        <ButtonGroup fullWidth>
                                                            <Button
                                                                variant="contained"
                                                                color="error"
                                                                onClick={() => {
                                                                    showReloadApiConfig();
                                                                }}>
                                                                {tr("reload")}
                                                            </Button>
                                                            <Button
                                                                variant="contained"
                                                                color="success"
                                                                onClick={() => {
                                                                    saveFormConfig("dlog");
                                                                }}
                                                                disabled={apiConfigDisabled}>
                                                                {tr("save")}
                                                            </Button>
                                                        </ButtonGroup>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    </Collapse>
                                )}

                                <Typography variant="h6" style={{ display: "flex", alignItems: "center", cursor: "pointer" }} onClick={() => handleFormToggle(4)}>
                                    <div style={{ flexGrow: 1 }}>{tr("discord_steam_api")}</div>
                                    <IconButton style={{ transition: "transform 0.2s", transform: formSectionOpen[4] ? "rotate(180deg)" : "none" }}>
                                        <ExpandMoreRounded />
                                    </IconButton>
                                </Typography>
                                {formSectionRender[4] && (
                                    <Collapse in={formSectionOpen[4]}>
                                        <Typography variant="body2" sx={{ mb: "15px" }}>
                                            {tr("config_discord_steam_api_note")}
                                            <br />
                                            {tr("config_discord_steam_api_note_2")}
                                        </Typography>
                                        <Grid container spacing={2} rowSpacing={-1} sx={{ mt: "5px" }}>
                                            <MemoDiscordSteamForm theme={theme} formConfig={formConfig[4]} />
                                            <Grid size={12}>
                                                <Grid container>
                                                    <Grid
                                                        size={{
                                                            xs: 0,
                                                            sm: 6,
                                                            md: 8,
                                                            lg: 10,
                                                        }}></Grid>
                                                    <Grid
                                                        size={{
                                                            xs: 12,
                                                            sm: 6,
                                                            md: 4,
                                                            lg: 2,
                                                        }}>
                                                        <ButtonGroup fullWidth>
                                                            <Button
                                                                variant="contained"
                                                                color="error"
                                                                onClick={() => {
                                                                    showReloadApiConfig();
                                                                }}>
                                                                {tr("reload")}
                                                            </Button>
                                                            <Button
                                                                variant="contained"
                                                                color="success"
                                                                onClick={() => {
                                                                    saveFormConfig("discord-steam");
                                                                }}
                                                                disabled={apiConfigDisabled}>
                                                                {tr("save")}
                                                            </Button>
                                                        </ButtonGroup>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    </Collapse>
                                )}

                                <Typography variant="h6" style={{ display: "flex", alignItems: "center", cursor: "pointer" }} onClick={() => handleFormToggle(6)}>
                                    <div style={{ flexGrow: 1 }}>{tr("smtp_email")}</div>
                                    <IconButton style={{ transition: "transform 0.2s", transform: formSectionOpen[6] ? "rotate(180deg)" : "none" }}>
                                        <ExpandMoreRounded />
                                    </IconButton>
                                </Typography>
                                {formSectionRender[6] && (
                                    <Collapse in={formSectionOpen[6]}>
                                        <Typography variant="body2" sx={{ mb: "15px" }}>
                                            {tr("config_smtp_email_note")}
                                            <br />
                                            {tr("config_smtp_email_note_2")}
                                        </Typography>
                                        <Grid container spacing={2} rowSpacing={-1} sx={{ mt: "5px" }}>
                                            <MemoSmtpForm theme={theme} formConfig={formConfig[6]} />
                                            <Grid size={12}>
                                                <Grid container>
                                                    <Grid
                                                        size={{
                                                            xs: 0,
                                                            sm: 6,
                                                            md: 8,
                                                            lg: 10,
                                                        }}></Grid>
                                                    <Grid
                                                        size={{
                                                            xs: 12,
                                                            sm: 6,
                                                            md: 4,
                                                            lg: 2,
                                                        }}>
                                                        <ButtonGroup fullWidth>
                                                            <Button
                                                                variant="contained"
                                                                color="error"
                                                                onClick={() => {
                                                                    showReloadApiConfig();
                                                                }}>
                                                                {tr("reload")}
                                                            </Button>
                                                            <Button
                                                                variant="contained"
                                                                color="success"
                                                                onClick={() => {
                                                                    saveFormConfig("smtp");
                                                                }}
                                                                disabled={apiConfigDisabled}>
                                                                {tr("save")}
                                                            </Button>
                                                        </ButtonGroup>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    </Collapse>
                                )}

                                <Typography variant="h6" style={{ display: "flex", alignItems: "center", cursor: "pointer" }} onClick={() => handleFormToggle(11)}>
                                    <div style={{ flexGrow: 1 }}>{tr("member_events")}</div>
                                    <IconButton style={{ transition: "transform 0.2s", transform: formSectionOpen[11] ? "rotate(180deg)" : "none" }}>
                                        <ExpandMoreRounded />
                                    </IconButton>
                                </Typography>
                                {formSectionRender[11] && (
                                    <Collapse in={formSectionOpen[11]}>
                                        <Typography variant="body2" sx={{ mb: "15px" }}>
                                            {tr("config_member_events_note")}
                                        </Typography>
                                        <Grid container spacing={2} rowSpacing={-1} sx={{ mt: "5px" }}>
                                            <MemoDiscordMemberForm theme={theme} formConfig={formConfig[11]} />
                                            <Grid size={12}>
                                                <Grid container>
                                                    <Grid
                                                        size={{
                                                            xs: 0,
                                                            sm: 6,
                                                            md: 8,
                                                            lg: 10,
                                                        }}></Grid>
                                                    <Grid
                                                        size={{
                                                            xs: 12,
                                                            sm: 6,
                                                            md: 4,
                                                            lg: 2,
                                                        }}>
                                                        <ButtonGroup fullWidth>
                                                            <Button
                                                                variant="contained"
                                                                color="error"
                                                                onClick={() => {
                                                                    showReloadApiConfig();
                                                                }}>
                                                                {tr("reload")}
                                                            </Button>
                                                            <Button
                                                                variant="contained"
                                                                color="success"
                                                                onClick={() => {
                                                                    saveFormConfig("discord-member");
                                                                }}
                                                                disabled={apiConfigDisabled}>
                                                                {tr("save")}
                                                            </Button>
                                                        </ButtonGroup>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    </Collapse>
                                )}

                                <Typography variant="h6" style={{ display: "flex", alignItems: "center", cursor: "pointer" }} onClick={() => handleFormToggle(5)}>
                                    <div style={{ flexGrow: 1 }}>{tr("roles")}</div>
                                    <IconButton style={{ transition: "transform 0.2s", transform: formSectionOpen[5] ? "rotate(180deg)" : "none" }}>
                                        <ExpandMoreRounded />
                                    </IconButton>
                                </Typography>
                                {formSectionRender[5] && (
                                    <Collapse in={formSectionOpen[5]}>
                                        <Typography variant="body2" sx={{ mb: "15px" }}>
                                            {tr("config_roles_note")}
                                            <br />
                                            {tr("config_roles_note_2")}
                                            <br />
                                            {tr("config_roles_note_3")}
                                            <br />
                                            HINT: With form config, you cannot edit the role ID, delete the role whose ID is 0, or add "driver" permission to multiple roles. These may be achieved with JSON config though.
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: "5px" }}>
                                            For your convenience, we provide a list of default roles which may be used to start up your Drivers Hub. Clicking the below button would overwrite your current list of roles with the default one.
                                        </Typography>
                                        <Grid container>
                                            <Grid
                                                size={{
                                                    xs: 0,
                                                    sm: 2,
                                                    md: 4,
                                                    lg: 8,
                                                }}></Grid>
                                            <Grid
                                                size={{
                                                    xs: 12,
                                                    sm: 10,
                                                    md: 8,
                                                    lg: 4,
                                                }}>
                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    sx={{ mb: "15px" }}
                                                    fullWidth
                                                    onClick={() => {
                                                        formConfig[5].setState({ ...formConfig[5].state, roles: DEFAULT_ROLES, perms: DEFAULT_PERMS });
                                                    }}>
                                                    Overwrite current list of roles wite the default one
                                                </Button>
                                            </Grid>
                                        </Grid>
                                        <MemoRoleForm theme={theme} formConfig={formConfig[5]} />
                                        <Grid size={12}>
                                            <Grid container>
                                                <Grid
                                                    size={{
                                                        xs: 0,
                                                        sm: 6,
                                                        md: 8,
                                                        lg: 10,
                                                    }}></Grid>
                                                <Grid
                                                    size={{
                                                        xs: 12,
                                                        sm: 6,
                                                        md: 4,
                                                        lg: 2,
                                                    }}>
                                                    <ButtonGroup fullWidth>
                                                        <Button
                                                            variant="contained"
                                                            color="error"
                                                            onClick={() => {
                                                                showReloadApiConfig();
                                                            }}>
                                                            {tr("reload")}
                                                        </Button>
                                                        <Button
                                                            variant="contained"
                                                            color="success"
                                                            onClick={() => {
                                                                saveFormConfig("role");
                                                            }}
                                                            disabled={apiConfigDisabled}>
                                                            {tr("save")}
                                                        </Button>
                                                    </ButtonGroup>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    </Collapse>
                                )}

                                <Typography variant="h6" style={{ display: "flex", alignItems: "center", cursor: "pointer" }} onClick={() => handleFormToggle(7)}>
                                    <div style={{ flexGrow: 1 }}>{tr("ranks")}</div>
                                    <IconButton style={{ transition: "transform 0.2s", transform: formSectionOpen[7] ? "rotate(180deg)" : "none" }}>
                                        <ExpandMoreRounded />
                                    </IconButton>
                                </Typography>
                                {formSectionRender[7] && (
                                    <Collapse in={formSectionOpen[7]}>
                                        <Typography variant="body2" sx={{ mb: "15px" }}>
                                            {tr("config_ranks_note")}
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: "5px" }}>
                                            For your convenience, we provide a list of default ranks which may be used to start up your Drivers Hub. Clicking the below button would overwrite your current list of ranks with the default one.
                                        </Typography>
                                        <Grid container>
                                            <Grid
                                                size={{
                                                    xs: 0,
                                                    sm: 2,
                                                    md: 4,
                                                    lg: 8,
                                                }}></Grid>
                                            <Grid
                                                size={{
                                                    xs: 12,
                                                    sm: 10,
                                                    md: 8,
                                                    lg: 4,
                                                }}>
                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    sx={{ mb: "15px" }}
                                                    fullWidth
                                                    onClick={() => {
                                                        formConfig[7].setState({ ...formConfig[7].state, ranks: DEFAULT_RANKS });
                                                    }}>
                                                    Overwrite current list of ranks wite the default one
                                                </Button>
                                            </Grid>
                                        </Grid>
                                        <MemoRankForm theme={theme} formConfig={formConfig[7]} />
                                        <Grid size={12}>
                                            <Grid container>
                                                <Grid
                                                    size={{
                                                        xs: 0,
                                                        sm: 6,
                                                        md: 8,
                                                        lg: 10,
                                                    }}></Grid>
                                                <Grid
                                                    size={{
                                                        xs: 12,
                                                        sm: 6,
                                                        md: 4,
                                                        lg: 2,
                                                    }}>
                                                    <ButtonGroup fullWidth>
                                                        <Button
                                                            variant="contained"
                                                            color="error"
                                                            onClick={() => {
                                                                showReloadApiConfig();
                                                            }}>
                                                            {tr("reload")}
                                                        </Button>
                                                        <Button
                                                            variant="contained"
                                                            color="success"
                                                            onClick={() => {
                                                                saveFormConfig("rank");
                                                            }}
                                                            disabled={apiConfigDisabled}>
                                                            {tr("save")}
                                                        </Button>
                                                    </ButtonGroup>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    </Collapse>
                                )}

                                {!curWebConfig.plugins.includes("announcement") && (
                                    <>
                                        <Typography variant="h6" style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                                            <div style={{ flexGrow: 1 }}>{tr("announcement")}</div>
                                            <IconButton>
                                                <FontAwesomeIcon icon={faLock} />
                                            </IconButton>
                                        </Typography>
                                    </>
                                )}

                                {curWebConfig.plugins.includes("announcement") && (
                                    <>
                                        <Typography variant="h6" style={{ display: "flex", alignItems: "center", cursor: "pointer" }} onClick={() => handleFormToggle(8)}>
                                            <div style={{ flexGrow: 1 }}>{tr("announcement")}</div>
                                            <IconButton style={{ transition: "transform 0.2s", transform: formSectionOpen[8] ? "rotate(180deg)" : "none" }}>
                                                <ExpandMoreRounded />
                                            </IconButton>
                                        </Typography>
                                        {formSectionRender[8] && (
                                            <Collapse in={formSectionOpen[8]}>
                                                <MemoAnnouncementTypeForm theme={theme} formConfig={formConfig[8]} />
                                                <Grid size={12}>
                                                    <Grid container>
                                                        <Grid
                                                            size={{
                                                                xs: 0,
                                                                sm: 6,
                                                                md: 8,
                                                                lg: 10,
                                                            }}></Grid>
                                                        <Grid
                                                            size={{
                                                                xs: 12,
                                                                sm: 6,
                                                                md: 4,
                                                                lg: 2,
                                                            }}>
                                                            <ButtonGroup fullWidth>
                                                                <Button
                                                                    variant="contained"
                                                                    color="error"
                                                                    onClick={() => {
                                                                        showReloadApiConfig();
                                                                    }}>
                                                                    {tr("reload")}
                                                                </Button>
                                                                <Button
                                                                    variant="contained"
                                                                    color="success"
                                                                    onClick={() => {
                                                                        saveFormConfig("announcement");
                                                                    }}
                                                                    disabled={apiConfigDisabled}>
                                                                    {tr("save")}
                                                                </Button>
                                                            </ButtonGroup>
                                                        </Grid>
                                                    </Grid>
                                                </Grid>
                                            </Collapse>
                                        )}
                                    </>
                                )}

                                {!curWebConfig.plugins.includes("application") && (
                                    <>
                                        <Typography variant="h6" style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                                            <div style={{ flexGrow: 1 }}>{tr("application")}</div>
                                            <IconButton>
                                                <FontAwesomeIcon icon={faLock} />
                                            </IconButton>
                                        </Typography>
                                    </>
                                )}

                                {curWebConfig.plugins.includes("application") && (
                                    <>
                                        <Typography variant="h6" style={{ display: "flex", alignItems: "center", cursor: "pointer" }} onClick={() => handleFormToggle(10)}>
                                            <div style={{ flexGrow: 1 }}>{tr("application")}</div>
                                            <IconButton style={{ transition: "transform 0.2s", transform: formSectionOpen[10] ? "rotate(180deg)" : "none" }}>
                                                <ExpandMoreRounded />
                                            </IconButton>
                                        </Typography>
                                        {formSectionRender[10] && (
                                            <Collapse in={formSectionOpen[10]}>
                                                <Typography variant="body2" sx={{ mb: "5px" }}>
                                                    For your convenience, we provide a list of default applications which may be used to start up your Drivers Hub. Clicking the below button would overwrite your current list of applications with the default one.
                                                </Typography>
                                                <Grid container>
                                                    <Grid
                                                        size={{
                                                            xs: 0,
                                                            sm: 2,
                                                            md: 3,
                                                            lg: 7,
                                                        }}></Grid>
                                                    <Grid
                                                        size={{
                                                            xs: 12,
                                                            sm: 10,
                                                            md: 9,
                                                            lg: 5,
                                                        }}>
                                                        <Button
                                                            variant="outlined"
                                                            color="error"
                                                            sx={{ mb: "15px" }}
                                                            fullWidth
                                                            onClick={() => {
                                                                formConfig[10].setState({ ...formConfig[10].state, application_types: DEFAULT_APPLICATIONS });
                                                            }}>
                                                            Overwrite current list of applications wite the default one
                                                        </Button>
                                                    </Grid>
                                                </Grid>
                                                <MemoApplicationTypeForm theme={theme} formConfig={formConfig[10]} />
                                                <Grid size={12}>
                                                    <Grid container>
                                                        <Grid
                                                            size={{
                                                                xs: 0,
                                                                sm: 6,
                                                                md: 8,
                                                                lg: 10,
                                                            }}></Grid>
                                                        <Grid
                                                            size={{
                                                                xs: 12,
                                                                sm: 6,
                                                                md: 4,
                                                                lg: 2,
                                                            }}>
                                                            <ButtonGroup fullWidth>
                                                                <Button
                                                                    variant="contained"
                                                                    color="error"
                                                                    onClick={() => {
                                                                        showReloadApiConfig();
                                                                    }}>
                                                                    {tr("reload")}
                                                                </Button>
                                                                <Button
                                                                    variant="contained"
                                                                    color="success"
                                                                    onClick={() => {
                                                                        saveFormConfig("application");
                                                                    }}
                                                                    disabled={apiConfigDisabled}>
                                                                    {tr("save")}
                                                                </Button>
                                                            </ButtonGroup>
                                                        </Grid>
                                                    </Grid>
                                                </Grid>
                                            </Collapse>
                                        )}
                                    </>
                                )}

                                {!curWebConfig.plugins.includes("division") && (
                                    <>
                                        <Typography variant="h6" style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                                            <div style={{ flexGrow: 1 }}>{tr("division")}</div>
                                            <IconButton>
                                                <FontAwesomeIcon icon={faLock} />
                                            </IconButton>
                                        </Typography>
                                    </>
                                )}

                                {curWebConfig.plugins.includes("division") && (
                                    <>
                                        <Typography variant="h6" style={{ display: "flex", alignItems: "center", cursor: "pointer" }} onClick={() => handleFormToggle(9)}>
                                            <div style={{ flexGrow: 1 }}>{tr("division")}</div>
                                            <IconButton style={{ transition: "transform 0.2s", transform: formSectionOpen[9] ? "rotate(180deg)" : "none" }}>
                                                <ExpandMoreRounded />
                                            </IconButton>
                                        </Typography>
                                        {formSectionRender[9] && (
                                            <Collapse in={formSectionOpen[9]}>
                                                <Typography variant="body2">NOTE: The method we determine whether a driver is in a division is to detect whether the driver has a relevant division role, so the "Driver Role" you set here should be given to drivers in the division.</Typography>
                                                <Typography variant="body2" sx={{ mb: "15px" }}>
                                                    NOTE: Division staff must have roles with both "Manage Division" permission and be added to "Staff Roles" of relevant divisions in the config. A global role may be used for all divisions.
                                                </Typography>
                                                <MemoDivisionForm theme={theme} formConfig={formConfig[9]} />
                                                <Grid size={12}>
                                                    <Grid container>
                                                        <Grid
                                                            size={{
                                                                xs: 0,
                                                                sm: 6,
                                                                md: 8,
                                                                lg: 10,
                                                            }}></Grid>
                                                        <Grid
                                                            size={{
                                                                xs: 12,
                                                                sm: 6,
                                                                md: 4,
                                                                lg: 2,
                                                            }}>
                                                            <ButtonGroup fullWidth>
                                                                <Button
                                                                    variant="contained"
                                                                    color="error"
                                                                    onClick={() => {
                                                                        showReloadApiConfig();
                                                                    }}>
                                                                    {tr("reload")}
                                                                </Button>
                                                                <Button
                                                                    variant="contained"
                                                                    color="success"
                                                                    onClick={() => {
                                                                        saveFormConfig("division");
                                                                    }}
                                                                    disabled={apiConfigDisabled}>
                                                                    {tr("save")}
                                                                </Button>
                                                            </ButtonGroup>
                                                        </Grid>
                                                    </Grid>
                                                </Grid>
                                            </Collapse>
                                        )}
                                    </>
                                )}

                                {!curWebConfig.plugins.includes("economy") && (
                                    <>
                                        <Typography variant="h6" style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                                            <div style={{ flexGrow: 1 }}>{tr("economy")}</div>
                                            <IconButton>
                                                <FontAwesomeIcon icon={faLock} />
                                            </IconButton>
                                        </Typography>
                                    </>
                                )}

                                {curWebConfig.plugins.includes("economy") && (
                                    <>
                                        <Typography variant="h6" style={{ display: "flex", alignItems: "center", cursor: "pointer" }} onClick={() => handleFormToggle(13)}>
                                            <div style={{ flexGrow: 1 }}>{tr("economy")}</div>
                                            <IconButton style={{ transition: "transform 0.2s", transform: formSectionOpen[13] ? "rotate(180deg)" : "none" }}>
                                                <ExpandMoreRounded />
                                            </IconButton>
                                        </Typography>
                                        {formSectionRender[13] && (
                                            <Collapse in={formSectionOpen[13]}>
                                                <MemoEconomyForm theme={theme} formConfig={formConfig[13]} />
                                                <Grid size={12}>
                                                    <Grid container>
                                                        <Grid
                                                            size={{
                                                                xs: 0,
                                                                sm: 6,
                                                                md: 8,
                                                                lg: 10,
                                                            }}></Grid>
                                                        <Grid
                                                            size={{
                                                                xs: 12,
                                                                sm: 6,
                                                                md: 4,
                                                                lg: 2,
                                                            }}>
                                                            <ButtonGroup fullWidth>
                                                                <Button
                                                                    variant="contained"
                                                                    color="error"
                                                                    onClick={() => {
                                                                        showReloadApiConfig();
                                                                    }}>
                                                                    {tr("reload")}
                                                                </Button>
                                                                <Button
                                                                    variant="contained"
                                                                    color="success"
                                                                    onClick={() => {
                                                                        saveFormConfig("economy");
                                                                    }}
                                                                    disabled={apiConfigDisabled}>
                                                                    {tr("save")}
                                                                </Button>
                                                            </ButtonGroup>
                                                        </Grid>
                                                    </Grid>
                                                </Grid>
                                            </Collapse>
                                        )}
                                    </>
                                )}

                                <Typography variant="h6" style={{ display: "flex", alignItems: "center", cursor: "pointer" }} onClick={() => handleFormToggle(12)}>
                                    <div style={{ flexGrow: 1 }}>{tr("other_events")}</div>
                                    <IconButton style={{ transition: "transform 0.2s", transform: formSectionOpen[12] ? "rotate(180deg)" : "none" }}>
                                        <ExpandMoreRounded />
                                    </IconButton>
                                </Typography>
                                {formSectionRender[12] && (
                                    <Collapse in={formSectionOpen[12]}>
                                        <Typography variant="body2" sx={{ mb: "15px" }}>
                                            {tr("config_member_events_note")}
                                        </Typography>
                                        <Grid container spacing={2} rowSpacing={-1} sx={{ mt: "5px" }}>
                                            <MemoDiscordOtherForm theme={theme} formConfig={formConfig[12]} />
                                            <Grid size={12}>
                                                <Grid container>
                                                    <Grid
                                                        size={{
                                                            xs: 0,
                                                            sm: 6,
                                                            md: 8,
                                                            lg: 10,
                                                        }}></Grid>
                                                    <Grid
                                                        size={{
                                                            xs: 12,
                                                            sm: 6,
                                                            md: 4,
                                                            lg: 2,
                                                        }}>
                                                        <ButtonGroup fullWidth>
                                                            <Button
                                                                variant="contained"
                                                                color="error"
                                                                onClick={() => {
                                                                    showReloadApiConfig();
                                                                }}>
                                                                {tr("reload")}
                                                            </Button>
                                                            <Button
                                                                variant="contained"
                                                                color="success"
                                                                onClick={() => {
                                                                    saveFormConfig("discord-other");
                                                                }}
                                                                disabled={apiConfigDisabled}>
                                                                {tr("save")}
                                                            </Button>
                                                        </ButtonGroup>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    </Collapse>
                                )}
                            </>
                        )}
                    </Typography>
                </TabPanel>
                <TabPanel value={tab} index={2}>
                    <Typography variant="body2" component="div" sx={{ mt: "5px" }}>
                        {tr("config_note_7")}
                        <br />
                        {tr("config_note_2")}
                        <br />
                        {tr("config_note_8")}
                        <br />
                        {tr("config_note_4")}
                        <br />
                        <br />
                        <FontAwesomeIcon icon={faClockRotateLeft} /> <>{tr("last_modified")}</>: <TimeDelta key={apiLastModify} timestamp={apiLastModify * 1000} />
                    </Typography>
                    {apiConfig !== null && (
                        <div sx={{ position: "relative" }}>
                            <TextField
                                label={tr("json_config")}
                                value={apiConfig}
                                onChange={e => {
                                    setApiConfig(e.target.value);
                                    setApiConfigSelectionStart(e.target.selectionStart);
                                }}
                                onClick={e => {
                                    setApiConfigSelectionStart(e.target.selectionStart);
                                }}
                                fullWidth
                                rows={20}
                                maxRows={20}
                                multiline
                                sx={{ mt: "8px" }}
                                placeholder={`{...}`}
                                spellCheck={false}
                            />
                            {apiConfigSelectionStart !== null && !isNaN(apiConfigSelectionStart - apiConfig.lastIndexOf("\n", apiConfigSelectionStart - 1)) && (
                                <InputLabel sx={{ color: theme.palette.text.secondary, fontSize: "0.8em", mb: "8px" }}>
                                    {tr("line")}
                                    {apiConfig.substr(0, apiConfigSelectionStart).split("\n").length}, <>{tr("column")}</> {apiConfigSelectionStart - apiConfig.lastIndexOf("\n", apiConfigSelectionStart - 1)}
                                </InputLabel>
                            )}
                        </div>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <Box sx={{ display: "grid", justifyItems: "start" }}>
                            <ButtonGroup sx={{ mt: "5px" }} disabled={apiConfigDisabled}>
                                <Button
                                    variant="contained"
                                    color="success"
                                    onClick={() => {
                                        enableDiscordRoleConnection();
                                    }}>
                                    {tr("enable")}
                                </Button>
                                <Button
                                    variant="contained"
                                    color="error"
                                    onClick={() => {
                                        disableDiscordRoleConnection();
                                    }}>
                                    {tr("disable")}
                                </Button>
                                <Button variant="contained" color="secondary">
                                    {tr("discord_role_connection")}
                                </Button>
                            </ButtonGroup>
                        </Box>
                        <Box sx={{ display: "grid", justifyItems: "end" }}>
                            <ButtonGroup sx={{ mt: "5px" }} disabled={apiConfigDisabled}>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={() => {
                                        setApiConfig(apiBackup);
                                    }}>
                                    {tr("revert")}
                                </Button>
                                <Button
                                    variant="contained"
                                    color="success"
                                    onClick={() => {
                                        saveApiConfig();
                                    }}>
                                    {tr("save")}
                                </Button>
                                <Button
                                    variant="contained"
                                    color="error"
                                    onClick={() => {
                                        showReloadApiConfig();
                                    }}>
                                    {tr("reload")}
                                </Button>
                            </ButtonGroup>
                        </Box>
                    </div>
                </TabPanel>
                <TabPanel value={tab} index={3}>
                    <Typography variant="body2" component="div" sx={{ mt: "5px" }}>
                        {tr("config_note_9")}
                        <br />
                        <br />
                        {tr("config_note_10")}
                        <br />
                        {tr("config_note_11")}
                        <br />
                        {tr("config_note_12")}
                        <br />
                        <br />
                        {tr("config_note_13")}
                        <br />
                        {tr("config_note_14")}
                    </Typography>
                    <Grid container spacing={2} sx={{ mt: "5px" }}>
                        <Grid
                            size={{
                                xs: 12,
                                sm: 12,
                                md: 4,
                                lg: 4,
                            }}>
                            <TextField
                                label={tr("company_name")}
                                value={webConfig.name}
                                onChange={e => {
                                    setWebConfig({ ...webConfig, name: e.target.value });
                                }}
                                fullWidth
                            />
                        </Grid>
                        <Grid
                            size={{
                                xs: 6,
                                sm: 6,
                                md: 2,
                                lg: 2,
                            }}>
                            <TextField
                                label={tr("theme_color")}
                                value={webConfig.color}
                                onChange={e => {
                                    setWebConfig({ ...webConfig, color: e.target.value });
                                }}
                                fullWidth
                            />
                        </Grid>
                        <Grid
                            size={{
                                xs: 6,
                                sm: 6,
                                md: 2,
                                lg: 2,
                            }}>
                            <TextField
                                label={tr("truckersmp_vtc_id")}
                                value={webConfig.truckersmp_vtc_id}
                                onChange={e => {
                                    setWebConfig({ ...webConfig, truckersmp_vtc_id: e.target.value });
                                }}
                                fullWidth
                            />
                        </Grid>
                        <Grid
                            size={{
                                xs: 12,
                                sm: 12,
                                md: 4,
                                lg: 4,
                            }}>
                            <TextField
                                select
                                label={
                                    <>
                                        {tr("name_color")}&nbsp;&nbsp;
                                        <SponsorBadge vtclevel={3} />
                                    </>
                                }
                                value={webConfig.use_highest_role_color}
                                onChange={e => {
                                    setWebConfig({ ...webConfig, use_highest_role_color: e.target.value });
                                }}
                                fullWidth
                                disabled={vtcLevel < 3}>
                                <MenuItem value={false}>{tr("default")}</MenuItem>
                                <MenuItem value={true}>{tr("highest_role_color_when_not_customized")}</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid
                            size={{
                                xs: 12,
                                sm: 12,
                                md: 4,
                                lg: 4,
                            }}>
                            <TextField
                                label={tr("logo_url")}
                                value={webConfig.logo_url}
                                onChange={e => {
                                    setWebConfig({ ...webConfig, logo_url: e.target.value });
                                }}
                                fullWidth
                            />
                        </Grid>
                        <Grid
                            size={{
                                xs: 12,
                                sm: 12,
                                md: 4,
                                lg: 4,
                            }}>
                            <TextField
                                label={tr("banner_url")}
                                value={webConfig.banner_url}
                                onChange={e => {
                                    setWebConfig({ ...webConfig, banner_url: e.target.value });
                                }}
                                fullWidth
                            />
                        </Grid>
                        <Grid
                            size={{
                                xs: 12,
                                sm: 12,
                                md: 4,
                                lg: 4,
                            }}>
                            <TextField
                                label={
                                    <>
                                        {tr("background_url")}&nbsp;&nbsp;
                                        <SponsorBadge vtclevel={1} />
                                    </>
                                }
                                value={webConfig.bgimage_url}
                                onChange={e => {
                                    setWebConfig({ ...webConfig, bgimage_url: e.target.value });
                                }}
                                fullWidth
                                disabled={vtcLevel < 1}
                            />
                        </Grid>
                        <Grid
                            size={{
                                xs: 12,
                                sm: 12,
                                md: 6,
                                lg: 6,
                            }}>
                            <Typography variant="h7" sx={{ fontWeight: 800 }}>
                                {tr("name_color")}&nbsp;&nbsp;
                                <SponsorBadge vtclevel={1} disabled={vtcLevel < 1} />
                            </Typography>
                            <br />
                            <ColorInput
                                color={webConfig.name_color}
                                onChange={to => {
                                    setWebConfig({ ...webConfig, name_color: to });
                                }}
                                disableCustom={vtcLevel < 1}
                            />
                        </Grid>
                        <Grid
                            size={{
                                xs: 12,
                                sm: 12,
                                md: 6,
                                lg: 6,
                            }}>
                            <Typography variant="h7" sx={{ fontWeight: 800 }}>
                                {tr("theme_opacity")}&nbsp;&nbsp;
                                <SponsorBadge vtclevel={1} />
                            </Typography>
                            <br />
                            <Slider
                                value={webConfig.theme_darken_ratio * 100}
                                onChange={(e, val) => {
                                    setWebConfig({ ...webConfig, theme_darken_ratio: val / 100 });
                                }}
                                aria-labelledby="continuous-slider"
                                sx={{ color: theme.palette.info.main, height: "20px" }}
                                disabled={vtcLevel < 1}
                            />
                        </Grid>
                        <Grid
                            size={{
                                xs: 12,
                                sm: 12,
                                md: 6,
                                lg: 6,
                            }}>
                            <Typography variant="h7" sx={{ fontWeight: 800 }}>
                                {tr("theme_main_color")}&nbsp;&nbsp;
                                <SponsorBadge vtclevel={1} />
                            </Typography>
                            <br />
                            <ColorInput
                                color={webConfig.theme_main_color}
                                onChange={to => {
                                    setWebConfig({ ...webConfig, theme_main_color: to });
                                }}
                                disableCustom={vtcLevel < 1}
                            />
                        </Grid>
                        <Grid
                            size={{
                                xs: 12,
                                sm: 12,
                                md: 6,
                                lg: 6,
                            }}>
                            <Typography variant="h7" sx={{ fontWeight: 800 }}>
                                {tr("theme_background_color")}&nbsp;&nbsp;
                                <SponsorBadge vtclevel={1} />
                            </Typography>
                            <br />
                            <ColorInput
                                color={webConfig.theme_background_color}
                                onChange={to => {
                                    setWebConfig({ ...webConfig, theme_background_color: to });
                                }}
                                disableCustom={vtcLevel < 1}
                            />
                        </Grid>
                    </Grid>
                    <Box sx={{ display: "grid", justifyItems: "end" }}>
                        <ButtonGroup sx={{ mt: "5px" }}>
                            <Button
                                variant="contained"
                                color="success"
                                onClick={() => {
                                    saveWebConfig();
                                }}
                                disabled={webConfigDisabled}>
                                {tr("save")}
                            </Button>
                        </ButtonGroup>
                    </Box>
                </TabPanel>
            </Card>
            <Dialog
                open={adpSettingsOpen}
                onClose={() => {
                    setADPSettingsOpen(false);
                }}
                fullWidth>
                <DialogTitle>
                    <Typography variant="h6" fontWeight="bold" sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
                        <FontAwesomeIcon icon={faCogs} />
                        &nbsp;&nbsp;Advanced Plugin Settings
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <TextField multiline rows={10} value={adpSettings} onChange={e => setADPSettings(e.target.value)} fullWidth />
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setADPSettingsOpen(false);
                        }}
                        variant="contained"
                        color="secondary"
                        sx={{ ml: "auto" }}>
                        {tr("close")}
                    </Button>
                    <Button
                        onClick={() => {
                            updateADPSettings();
                        }}
                        variant="contained"
                        color="info"
                        sx={{ ml: "auto" }}
                        disabled={adpDisabled}>
                        {tr("submit")}
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={reloadModalOpen}
                onClose={() => {
                    setADPSettingsOpen(false);
                }}>
                <DialogTitle>
                    <Typography variant="h6" fontWeight="bold" sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
                        <FontAwesomeIcon icon={faFingerprint} />
                        &nbsp;&nbsp;{tr("attention_required")}
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2">{tr("for_security_purposes_you_must")}</Typography>
                    <TextField sx={{ mt: "15px" }} label={tr("mfa_otp")} value={mfaOtp} onChange={e => setMfaOtp(e.target.value)} fullWidth />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseReloadModal} variant="contained" color="secondary" sx={{ ml: "auto" }}>
                        {tr("close")}
                    </Button>
                    <Button onClick={reloadApiConfig} variant="contained" color="success" sx={{ ml: "auto" }}>
                        {tr("verify")}
                    </Button>
                </DialogActions>
            </Dialog>
            <Portal>
                <Snackbar open={!!snackbarContent} autoHideDuration={5000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
                    <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
                        {snackbarContent}
                    </Alert>
                </Snackbar>
            </Portal>
        </>
    );
};

export default Configuration;
