import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardMedia, CardContent, Box, Tabs, Tab, Grid, Typography, Button, ButtonGroup, IconButton, Snackbar, Alert, useTheme, MenuItem, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Slider, Divider, Chip, Tooltip } from '@mui/material';
import { Portal } from '@mui/base';

import Select from 'react-select';
import { useNavigate } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRefresh, faFingerprint, faHashtag, faScrewdriverWrench, faCrown, faClover } from '@fortawesome/free-solid-svg-icons';

import moment from 'moment-timezone';
import QRCodeStyling from 'qr-code-styling';
import CreatableSelect from 'react-select/creatable';

import { makeRequestsWithAuth, customAxios as axios, getAuthToken, makeRequestsAuto, getFormattedDate } from '../functions';
import { useRef } from 'react';
import ColorInput from '../components/colorInput';
import TimeAgo from '../components/timeago';
import CustomTable from '../components/table';
import MarkdownRenderer from '../components/markdown';
import { faChrome, faFirefox, faEdge, faInternetExplorer, faOpera, faSafari } from '@fortawesome/free-brands-svg-icons';

import { customSelectStyles } from '../designs';
var vars = require("../variables");

const RADIO_TYPES = { "tsr": "TruckStopRadio", "tfm": "TruckersFM", "simhit": "SimulatorHits" };
const trackerMapping = { "tracksim": "TrackSim", "trucky": "Trucky" };

function tabBtnProps(index, current, theme) {
    return {
        id: `map-tab-${index}`,
        'aria-controls': `map-tabpanel-${index}`,
        style: { color: current === index ? theme.palette.info.main : 'inherit' }
    };
}

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

const sessionsColumns = [
    { id: 'device', label: 'Device' },
    { id: 'ip', label: 'IP' },
    { id: 'country', label: 'Country' },
    { id: 'create_time', label: 'Creation' },
    { id: 'last_used_time', label: 'Last Used' },
];
const appSessionsColumns = [
    { id: 'app_name', label: 'Application Name' },
    { id: 'create_time', label: 'Creation' },
    { id: 'last_used_time', label: 'Last Used' },
];

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
    const navigate = useNavigate();

    const [otp, setOtp] = useState("");
    const [otpAction, setOtpAction] = useState("");
    const [otpPass, setOtpPass] = useState(0); // timestamp, before which user doesn't need to re-enter the otp
    const [requireOtp, setRequireOtp] = useState(false);
    const [mfaEnabled, setMfaEnabled] = useState(vars.userInfo.mfa);
    const handleOtp = useCallback(() => {
        if (otp.replaceAll(" ", "") === "" || isNaN(otp.replaceAll(" ", "")) || otp.length !== 6) {
            setSnackbarContent(`Invalid OTP`);
            setSnackbarSeverity("warning");
            return;
        }

        if (otpAction === "update-password") {
            updatePassword();
        } else if (otpAction === "disable-password") {
            disablePassword();
        } else if (otpAction === "create-apptoken") {
            createAppToken();
        } else if (otpAction === "disable-mfa") {
            disableMfa();
        } else if (otpAction === "resign") {
            memberResign();
        } else if (otpAction === "delete-account") {
            deleteAccount();
        }
        setOtpAction("");
        setRequireOtp(false);
    }, [otp, otpAction]);

    const [userSettings, setUserSettings] = useState(vars.userSettings);

    const updateUnit = useCallback((to) => {
        vars.userSettings.unit = to;
        localStorage.setItem("client-settings", JSON.stringify(vars.userSettings));
        setUserSettings({ ...userSettings, unit: to });
    }, [userSettings]);

    const updateFontSize = useCallback((to) => {
        vars.userSettings.font_size = to;
        localStorage.setItem("client-settings", JSON.stringify(vars.userSettings));
        setUserSettings({ ...userSettings, font_size: to });

        const themeUpdated = new CustomEvent('themeUpdated', {});
        window.dispatchEvent(themeUpdated);
    }, [userSettings]);

    const allTimeZones = moment.tz.names();
    const updateDisplayTimezone = useCallback((to) => { // Display = DateTimeField
        vars.userSettings.display_timezone = to;
        localStorage.setItem("client-settings", JSON.stringify(vars.userSettings));
        setUserSettings({ ...userSettings, display_timezone: to });
    }, [userSettings]);

    const updateTheme = useCallback((to) => {
        vars.userSettings.theme = to;
        localStorage.setItem("client-settings", JSON.stringify(vars.userSettings));
        setUserSettings({ ...userSettings, theme: to });
        if (userSettings.use_custom_theme) {
            if (!["auto", "dark", "light"].includes(to)) {
                vars.userSettings.use_custom_theme = false;
                setUserSettings({ ...userSettings, theme: to, use_custom_theme: false });
            }
        }

        const themeUpdated = new CustomEvent('themeUpdated', {});
        window.dispatchEvent(themeUpdated);
    }, [userSettings]);

    const updateUseCustomTheme = useCallback((to) => {
        vars.userSettings.use_custom_theme = to;
        localStorage.setItem("client-settings", JSON.stringify(vars.userSettings));
        setUserSettings({ ...userSettings, use_custom_theme: to });

        if (to === true) {
            if (userSettings.theme === "halloween") {
                vars.userSettings.theme = "dark";
                setUserSettings({ ...userSettings, use_custom_theme: to, theme: "dark" });
            }
        }

        const themeUpdated = new CustomEvent('themeUpdated', {});
        window.dispatchEvent(themeUpdated);
    }, [userSettings]);

    const updateThemeDarkenRatio = useCallback((to) => {
        vars.userSettings.theme_darken_ratio = to;
        localStorage.setItem("client-settings", JSON.stringify(vars.userSettings));
        setUserSettings({ ...userSettings, theme_darken_ratio: to });

        const themeUpdated = new CustomEvent('themeUpdated', {});
        window.dispatchEvent(themeUpdated);
    }, [userSettings]);

    const updateThemeBackgroundColor = useCallback((to) => {
        vars.userSettings.theme_background = to;
        localStorage.setItem("client-settings", JSON.stringify(vars.userSettings));
        setUserSettings({ ...userSettings, theme_background: to });

        const themeUpdated = new CustomEvent('themeUpdated', {});
        window.dispatchEvent(themeUpdated);
    }, [userSettings]);

    const updateThemeMainColor = useCallback((to) => {
        vars.userSettings.theme_main = to;
        localStorage.setItem("client-settings", JSON.stringify(vars.userSettings));
        setUserSettings({ ...userSettings, theme_main: to });

        const themeUpdated = new CustomEvent('themeUpdated', {});
        window.dispatchEvent(themeUpdated);
    }, [userSettings]);

    const updateDataSaver = useCallback((to) => {
        vars.userSettings.data_saver = to;
        localStorage.setItem("client-settings", JSON.stringify(vars.userSettings));
        setUserSettings({ ...userSettings, data_saver: to });

        const dataSaverUpdated = new CustomEvent('dataSaverUpdated', { detail: { enabled: to } });
        window.dispatchEvent(dataSaverUpdated);
        const radioUpdated = new CustomEvent('radioUpdated', {});
        window.dispatchEvent(radioUpdated);
    }, [userSettings]);

    const updateRadio = useCallback((to) => {
        vars.userSettings.radio = to;
        localStorage.setItem("client-settings", JSON.stringify(vars.userSettings));
        setUserSettings({ ...userSettings, radio: to });

        const radioUpdated = new CustomEvent('radioUpdated', {});
        window.dispatchEvent(radioUpdated);
    }, [userSettings]);

    const updateRadioType = useCallback((to) => {
        vars.userSettings.radio_type = to;
        localStorage.setItem("client-settings", JSON.stringify(vars.userSettings));
        setUserSettings({ ...userSettings, radio_type: to });

        const radioTypeUpdated = new CustomEvent('radioTypeUpdated', {});
        window.dispatchEvent(radioTypeUpdated);
    }, [userSettings]);

    const updateRadioVolume = useCallback((to) => {
        vars.userSettings.radio_volume = to;
        localStorage.setItem("client-settings", JSON.stringify(vars.userSettings));
        setUserSettings({ ...userSettings, radio_volume: to });

        const radioVolumeUpdated = new CustomEvent('radioVolumeUpdated', {});
        window.dispatchEvent(radioVolumeUpdated);
    }, [userSettings]);

    const DEFAULT_USER_CONFIG = { "name_color": "/", "profile_upper_color": "/", "profile_lower_color": "/", "profile_banner_url": "/" };
    const [remoteUserConfig, setRemoteUserConfig] = useState(DEFAULT_USER_CONFIG);
    useEffect(() => {
        if (Object.keys(vars.userConfig).includes(vars.userInfo.discordid)) {
            for (let i = 0; i < vars.userConfig[vars.userInfo.discordid].length; i++) {
                if (vars.userConfig[vars.userInfo.discordid][i].abbr === vars.dhconfig.abbr) {
                    let uc = JSON.parse(JSON.stringify(vars.userConfig[vars.userInfo.discordid][i]));
                    if (uc.name_color === "#x1") {
                        uc.name_color = "/";
                    }
                    if (uc.profile_upper_color === "#x1") {
                        uc.profile_upper_color = "/";
                    }
                    if (uc.profile_lower_color === "#x1") {
                        uc.profile_lower_color = "/";
                    }
                    setRemoteUserConfig(uc);
                }
            }
        }
    }, []);
    const [remoteUserConfigDisabled, setRemoteUserConfigDisabled] = useState(false);
    const updateRemoteUserConfig = useCallback(async () => {
        const loadingStart = new CustomEvent('loadingStart', {});
        window.dispatchEvent(loadingStart);
        setRemoteUserConfigDisabled(true);

        let resp = await axios({ url: `${vars.dhpath}/auth/ticket`, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status !== 200) {
            setRemoteUserConfigDisabled(false);
            const loadingEnd = new CustomEvent('loadingEnd', {});
            window.dispatchEvent(loadingEnd);
            setSnackbarContent(`Failed to generate auth ticket, try again later...`);
            setSnackbarSeverity("error");
            return;
        }
        let ticket = resp.data.token;

        function parse_color(s) {
            if (s.startsWith("#")) {
                return parseInt(s.substring(1), 16);
            } else {
                return -1;
            }
        }

        resp = await axios({ url: `https://config.chub.page/config/user?domain=${vars.dhconfig.domain}`, data: { name_color: parse_color(remoteUserConfig.name_color), profile_upper_color: parse_color(remoteUserConfig.profile_upper_color), profile_lower_color: parse_color(remoteUserConfig.profile_lower_color), profile_banner_url: remoteUserConfig.profile_banner_url }, method: "PATCH", headers: { Authorization: `Ticket ${ticket}` } });
        if (resp.status === 204) {
            setSnackbarContent(`Appearance settings updated!`);
            setSnackbarSeverity("success");
            const [newUserConfig] = await makeRequestsAuto([{ url: "https://config.chub.page/config/user", auth: false }]);
            if (newUserConfig) {
                vars.userConfig = newUserConfig;
            }
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }

        setRemoteUserConfigDisabled(false);
        const loadingEnd = new CustomEvent('loadingEnd', {});
        window.dispatchEvent(loadingEnd);
    }, [remoteUserConfig]);

    let trackers = [];
    for (let i = 0; i < vars.apiconfig.trackers.length; i++) {
        if (!trackers.includes(vars.apiconfig.trackers[i].type)) {
            trackers.push(vars.apiconfig.trackers[i].type);
        }
    }
    const [tracker, setTracker] = useState(vars.userInfo.tracker);
    const updateTracker = useCallback(async (to) => {
        let resp = await axios({ url: `${vars.dhpath}/user/tracker/switch?uid=${vars.userInfo.uid}`, data: { tracker: to }, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            setSnackbarContent("Tracker updated");
            setSnackbarSeverity("success");
            vars.userInfo.tracker = tracker;
            setTracker(to);
            vars.users[vars.userInfo.uid] = vars.userInfo;
            const userUpdated = new CustomEvent('userUpdated', { detail: { user: vars.userInfo } });
            window.dispatchEvent(userUpdated);
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
    }, [tracker]);

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
                setSnackbarContent(`Failed to disable ${NOTIFICATION_NAMES[disabled[i]]} Notification: ` + resp.data.error);
                setSnackbarSeverity("error");
                reloadNotificationSettings();
            }
        }

        const loadingEnd = new CustomEvent('loadingEnd', {});
        window.dispatchEvent(loadingEnd);
    }, [notificationSettings]);

    const [userLanguage, setUserLanguage] = useState("en");
    const [supportedLanguages, setSupportedLanguages] = useState([]);
    const updateUserLanguage = useCallback(async (e) => {
        const loadingStart = new CustomEvent('loadingStart', {});
        window.dispatchEvent(loadingStart);

        setUserLanguage(e.target.value);
        let resp = await axios({ url: `${vars.dhpath}/user/language`, data: { language: e.target.value }, method: "PATCH", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            setSnackbarContent(`Changed language to ${LANGUAGES[e.target.value]}`);
            setSnackbarSeverity("success");
        } else {
            setSnackbarContent(`Failed to change language to ${LANGUAGES[e.target.value]}: ` + resp.data.error);
            setSnackbarSeverity("error");
        }

        const loadingEnd = new CustomEvent('loadingEnd', {});
        window.dispatchEvent(loadingEnd);
    }, []);

    const [newTruckersMPID, setNewTruckersMPID] = useState(vars.userInfo.truckersmpid);
    const [newTruckersMPDisabled, setTruckersmpDisabled] = useState(false);
    const updateTruckersMPID = useCallback(async () => {
        if (isNaN(newTruckersMPID) || String(newTruckersMPID).replaceAll(" ", "") === "") {
            setSnackbarContent(`Invalid TruckersMP ID`);
            setSnackbarSeverity("error");
            return;
        }
        if (Number(newTruckersMPID) === vars.userInfo.truckersmpid) {
            setSnackbarContent(`TruckersMP ID was not updated`);
            setSnackbarSeverity("warning");
            return;
        }

        const loadingStart = new CustomEvent('loadingStart', {});
        window.dispatchEvent(loadingStart);

        setTruckersmpDisabled(true);
        let resp = await axios({ url: `${vars.dhpath}/user/truckersmp`, data: { truckersmpid: newTruckersMPID }, method: "PATCH", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            setSnackbarContent(`Updated TruckersMP Account`);
            setSnackbarSeverity("success");
        } else {
            setSnackbarContent(`Failed to update TruckersMP Account: ` + resp.data.error);
            setSnackbarSeverity("error");
        }
        setTruckersmpDisabled(false);

        const loadingEnd = new CustomEvent('loadingEnd', {});
        window.dispatchEvent(loadingEnd);
    }, [newTruckersMPID]);

    const [newEmail, setNewEmail] = useState(vars.userInfo.email);
    const [newEmailDisabled, setEmailDisabled] = useState(false);
    const updateEmail = useCallback(async () => {
        if (newEmail.indexOf("@") === -1) {
            setSnackbarContent(`Invalid Email`);
            setSnackbarSeverity("error");
            return;
        }
        if (newEmail === vars.userInfo.email) {
            setSnackbarContent(`Email was not updated`);
            setSnackbarSeverity("warning");
            return;
        }

        const loadingStart = new CustomEvent('loadingStart', {});
        window.dispatchEvent(loadingStart);

        setEmailDisabled(true);
        let resp = await axios({ url: `${vars.dhpath}/user/email`, data: { email: newEmail }, method: "PATCH", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            setSnackbarContent(`Email update request submitted. Please check your inbox for confirmation email.`);
            setSnackbarSeverity("success");
        } else {
            setSnackbarContent(`Failed to update email: ` + resp.data.error);
            setSnackbarSeverity("error");
        }
        setEmailDisabled(false);

        const loadingEnd = new CustomEvent('loadingEnd', {});
        window.dispatchEvent(loadingEnd);
    }, [newEmail]);

    const [newProfile, setNewProfile] = useState({ name: vars.userInfo.name, avatar: vars.userInfo.avatar });
    const [newProfileDisabled, setNewProfileDisabled] = useState(false);
    const updateProfile = useCallback(async (sync_to = undefined) => {
        setNewProfileDisabled(true);
        sync_to === undefined ? sync_to = "" : sync_to = `?sync_to_${sync_to}=true`;
        let resp = await axios({ url: `${vars.dhpath}/user/profile${sync_to}`, method: "PATCH", data: newProfile, headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            if (sync_to !== "") {
                resp = await axios({ url: `${vars.dhpath}/user/profile`, method: "GET", headers: { Authorization: `Bearer ${getAuthToken()}` } });
                setNewProfile({ name: resp.data.name, avatar: resp.data.avatar });
                vars.userInfo = resp.data;
                vars.users[vars.userInfo.uid] = resp.data;
                for (let i = 0; i < vars.members.length; i++) {
                    if (vars.members[i].uid === vars.userInfo.uid) {
                        vars.members[i] = resp.data;
                        break;
                    }
                }
            } else {
                vars.userInfo.name = newProfile.name;
                vars.userInfo.avatar = newProfile.avatar;
                vars.userInfo = vars.userInfo;
                vars.users[vars.userInfo.uid] = vars.userInfo;
                for (let i = 0; i < vars.members.length; i++) {
                    if (vars.members[i].uid === vars.userInfo.uid) {
                        vars.members[i] = vars.userInfo;
                        break;
                    }
                }
            }
            setSnackbarContent("Profile updated");
            setSnackbarSeverity("success");
        } else {
            setSnackbarContent(`Failed to update profile: ` + resp.data.error);
            setSnackbarSeverity("error");
        }
        setNewProfileDisabled(false);
    }, [newProfile]);

    const [newAboutMe, setNewAboutMe] = useState(vars.userInfo.bio);
    const [newAboutMeDisabled, setAboutMeDisabled] = useState(false);
    const updateAboutMe = useCallback(async (e) => {
        const loadingStart = new CustomEvent('loadingStart', {});
        window.dispatchEvent(loadingStart);
        setAboutMeDisabled(true);

        let resp = await axios({ url: `${vars.dhpath}/user/bio`, data: { bio: newAboutMe }, method: "PATCH", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            setSnackbarContent(`Updated About Me`);
            setSnackbarSeverity("success");
        } else {
            setSnackbarContent(`Failed to update about me to ${LANGUAGES[e.target.value]}: ` + resp.data.error);
            setSnackbarSeverity("error");
        }

        setAboutMeDisabled(false);
        const loadingEnd = new CustomEvent('loadingEnd', {});
        window.dispatchEvent(loadingEnd);
    }, [newAboutMe]);

    const [newPassword, setNewPassword] = useState("");
    const [newPasswordDisabled, setUpdatePasswordDisabled] = useState(false);
    const updatePassword = useCallback(async (e) => {
        const loadingStart = new CustomEvent('loadingStart', {});
        window.dispatchEvent(loadingStart);
        setUpdatePasswordDisabled(true);

        if (otpPass !== 0 && +new Date() - otpPass > 30000 && otp !== "") {
            setOtpPass(0); setOtp(""); updatePassword();
            return;
        }

        let resp = null;
        if (!mfaEnabled) {
            resp = await axios({ url: `${vars.dhpath}/user/password`, data: { password: newPassword }, method: "PATCH", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        } else if (otp !== "") {
            resp = await axios({ url: `${vars.dhpath}/user/password`, data: { password: newPassword, otp: otp }, method: "PATCH", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        } else {
            setOtpAction("update-password");
            setRequireOtp(true);
            setUpdatePasswordDisabled(false);
            const loadingEnd = new CustomEvent('loadingEnd', {});
            window.dispatchEvent(loadingEnd);
            return;
        }
        if (resp.status === 204) {
            setSnackbarContent(`Updated Password`);
            setSnackbarSeverity("success");
            setOtpPass(+new Date() + 30000);
        } else {
            setSnackbarContent(`Failed to update password: ` + resp.data.error);
            setSnackbarSeverity("error");
            setOtp(""); setOtpPass(0);
        }

        setUpdatePasswordDisabled(false);
        const loadingEnd = new CustomEvent('loadingEnd', {});
        window.dispatchEvent(loadingEnd);
    }, [newPassword, otp, otpPass, mfaEnabled]);
    const disablePassword = useCallback(async (e) => {
        const loadingStart = new CustomEvent('loadingStart', {});
        window.dispatchEvent(loadingStart);
        setUpdatePasswordDisabled(true);

        if (otpPass !== 0 && +new Date() - otpPass > 30000 && otp !== "") {
            setOtpPass(0); setOtp(""); updatePassword();
            return;
        }

        let resp = null;
        if (!mfaEnabled) {
            resp = await axios({ url: `${vars.dhpath}/user/password/disable`, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        } else if (otp !== "") {
            resp = await axios({ url: `${vars.dhpath}/user/password/disable`, data: { otp: otp }, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        } else {
            setOtpAction("disable-password");
            setRequireOtp(true);
            setUpdatePasswordDisabled(false);
            const loadingEnd = new CustomEvent('loadingEnd', {});
            window.dispatchEvent(loadingEnd);
            return;
        }
        if (resp.status === 204) {
            setSnackbarContent(`Disabled Password Login`);
            setSnackbarSeverity("success");
        } else {
            setSnackbarContent(`Failed to disable password login: ` + resp.data.error);
            setSnackbarSeverity("error");
        }

        setUpdatePasswordDisabled(false);
        const loadingEnd = new CustomEvent('loadingEnd', {});
        window.dispatchEvent(loadingEnd);
    }, [otp, otpPass, mfaEnabled]);

    const [newAppToken, setNewAppToken] = useState(null);
    const [newAppTokenName, setNewAppTokenName] = useState("");
    const [newAppTokenDisabled, setNewAppTokenDisabled] = useState(false);
    const createAppToken = useCallback(async (e) => {
        const loadingStart = new CustomEvent('loadingStart', {});
        window.dispatchEvent(loadingStart);
        setNewAppTokenDisabled(true);

        if (otpPass !== 0 && +new Date() - otpPass > 30000 && otp !== "") {
            setOtpPass(0); setOtp(""); createAppToken();
            return;
        }

        let resp = null;
        if (!mfaEnabled) {
            resp = await axios({ url: `${vars.dhpath}/token/application`, data: { app_name: newAppTokenName }, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        } else if (otp !== "") {
            resp = await axios({ url: `${vars.dhpath}/token/application`, data: { app_name: newAppTokenName, otp: otp }, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        } else {
            setOtpAction("create-apptoken");
            setRequireOtp(true);
            setNewAppTokenDisabled(false);
            const loadingEnd = new CustomEvent('loadingEnd', {});
            window.dispatchEvent(loadingEnd);
            return;
        }
        if (resp.status === 200) {
            setSnackbarContent(`Created Application Token`);
            setSnackbarSeverity("success");
            setOtpPass(+new Date() + 30000);
            setNewAppToken(resp.data.token);
        } else {
            setSnackbarContent(`Failed to create appplication token: ` + resp.data.error);
            setSnackbarSeverity("error");
            setOtp(""); setOtpPass(0);
        }

        setNewAppTokenDisabled(false);
        const loadingEnd = new CustomEvent('loadingEnd', {});
        window.dispatchEvent(loadingEnd);
    }, [newAppTokenName, otp, otpPass, mfaEnabled]);

    const [mfaSecret, setMfaSecret] = useState("");
    const mfaSecretQRCodeRef = useRef(null);
    const [modalEnableMfa, setModalEnableMfa] = useState(false);
    const [manageMfaDisabled, setManageMfaDisabled] = useState(false);
    const enableMfa = useCallback(async (e) => {
        const loadingStart = new CustomEvent('loadingStart', {});
        window.dispatchEvent(loadingStart);

        if (!modalEnableMfa) {
            let newSecret = RandomB32String(16);
            function RandomB32String(length) {
                var result = '';
                var characters = 'ABCDEFGHIJLKMNOPQRSTUVWXYZ234567';
                var charactersLength = characters.length;
                for (var i = 0; i < length; i++) {
                    result += characters.charAt(Math.floor(Math.random() * charactersLength));
                }
                return result;
            }
            setMfaSecret(newSecret);
            setOtp(""); setOtpPass(0);
            setModalEnableMfa(true);

            const qrCode = new QRCodeStyling({
                width: 200,
                height: 200,
                type: "svg",
                data: `otpauth://totp/${vars.dhconfig.name.replaceAll(" ", "%20")}%20Drivers%20Hub?secret=${newSecret}&issuer=drivershub.charlws&digits=6&period=30`,
                image: "https://cdn.chub.page/assets/logo.png",
                dotsOptions: {
                    color: theme.palette.text.secondary,
                    type: "extra-rounded"
                },
                backgroundOptions: {
                    color: "transparent",
                },
                imageOptions: {
                    crossOrigin: "anonymous",
                    margin: 0,
                    hideBackgroundDots: false,
                }
            });
            let qrInterval = setInterval(function () {
                if (mfaSecretQRCodeRef !== null && mfaSecretQRCodeRef.current !== null) {
                    qrCode.append(mfaSecretQRCodeRef.current);
                    clearInterval(qrInterval);
                }
            }, 50);
        } else {
            setManageMfaDisabled(true);
            let resp = await axios({ url: `${vars.dhpath}/user/mfa/enable`, data: { secret: mfaSecret, otp: otp }, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
            if (resp.status === 204) {
                setSnackbarContent(`MFA Enabled`);
                setSnackbarSeverity("success");
                setOtpPass(+new Date() + 30000);
                vars.userInfo.mfa = true;
                setMfaEnabled(true);
                setModalEnableMfa(false);
                vars.users[vars.userInfo.uid] = vars.userInfo;
                const userUpdated = new CustomEvent('userUpdated', { detail: { user: vars.userInfo } });
                window.dispatchEvent(userUpdated);
            } else {
                setSnackbarContent(`Failed to enable MFA: ` + resp.data.error);
                setSnackbarSeverity("error");
                setOtp(""); setOtpPass(0);
            }
            setManageMfaDisabled(false);
        }

        const loadingEnd = new CustomEvent('loadingEnd', {});
        window.dispatchEvent(loadingEnd);
    }, [otp, mfaSecret, modalEnableMfa]);
    const disableMfa = useCallback(async (e) => {
        const loadingStart = new CustomEvent('loadingStart', {});
        window.dispatchEvent(loadingStart);
        setManageMfaDisabled(true);

        if (otpPass !== 0 && +new Date() - otpPass > 30000 && otp !== "") {
            setOtpPass(0); setOtp(""); disableMfa();
            return;
        }

        let resp = null;
        if (otp !== "") {
            resp = await axios({ url: `${vars.dhpath}/user/mfa/disable`, data: { otp: otp }, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        } else {
            setOtpAction("disable-mfa");
            setRequireOtp(true);
            setManageMfaDisabled(false);
            const loadingEnd = new CustomEvent('loadingEnd', {});
            window.dispatchEvent(loadingEnd);
            return;
        }
        if (resp.status === 204) {
            setSnackbarContent(`MFA Disabled`);
            setSnackbarSeverity("success");
            setOtpPass(+new Date() + 30000);
            vars.userInfo.mfa = false;
            setMfaEnabled(false);
            vars.users[vars.userInfo.uid] = vars.userInfo;
            const userUpdated = new CustomEvent('userUpdated', { detail: { user: vars.userInfo } });
            window.dispatchEvent(userUpdated);
        } else {
            setSnackbarContent(`Failed to disable MFA: ` + resp.data.error);
            setSnackbarSeverity("error");
            setOtp(""); setOtpPass(0);
        }

        setManageMfaDisabled(false);
        const loadingEnd = new CustomEvent('loadingEnd', {});
        window.dispatchEvent(loadingEnd);
    }, [newAppTokenName, otp, otpPass]);

    const [resignConfirm, setResignConfirm] = useState(false);
    const [resignDisabled, setResignDisabled] = useState(false);
    const resignRef = useRef(null);
    const memberResign = useCallback(async (e) => {
        const loadingStart = new CustomEvent('loadingStart', {});
        window.dispatchEvent(loadingStart);
        setResignDisabled(true);

        if (otpPass !== 0 && +new Date() - otpPass > 30000 && otp !== "") {
            setOtpPass(0); setOtp(""); memberResign();
            return;
        }

        let resp = null;
        if (!mfaEnabled) {
            resp = await axios({ url: `${vars.dhpath}/member/resign`, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        } else if (otp !== "") {
            resp = await axios({ url: `${vars.dhpath}/member/resign`, data: { otp: otp }, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        } else {
            setOtpAction("resign");
            setRequireOtp(true);
            setResignDisabled(false);
            const loadingEnd = new CustomEvent('loadingEnd', {});
            window.dispatchEvent(loadingEnd);
            return;
        }
        if (resp.status === 204) {
            setSnackbarContent(`You have resigned! Goodbye and best wishes!`);
            setSnackbarSeverity("success");
            setOtpPass(+new Date() + 30000);
        } else {
            setSnackbarContent(`Failed to resign: ` + resp.data.error);
            setSnackbarSeverity("error");
            setOtp(""); setOtpPass(0);
        }

        setResignDisabled(false);
        const loadingEnd = new CustomEvent('loadingEnd', {});
        window.dispatchEvent(loadingEnd);
    }, [otp, otpPass, mfaEnabled]);

    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [deleteDisabled, setDeleteDisabled] = useState(false);
    const deleteRef = useRef(null);
    const deleteAccount = useCallback(async (e) => {
        const loadingStart = new CustomEvent('loadingStart', {});
        window.dispatchEvent(loadingStart);
        setDeleteDisabled(true);

        if (otpPass !== 0 && +new Date() - otpPass > 30000 && otp !== "") {
            setOtpPass(0); setOtp(""); memberResign();
            return;
        }

        let resp = null;
        if (!mfaEnabled) {
            resp = await axios({ url: `${vars.dhpath}/user/${vars.userInfo.uid}`, method: "DELETE", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        } else if (otp !== "") {
            resp = await axios({ url: `${vars.dhpath}/user/${vars.userInfo.uid}`, data: { otp: otp }, method: "DELETE", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        } else {
            setOtpAction("delete-account");
            setRequireOtp(true);
            setResignDisabled(false);
            const loadingEnd = new CustomEvent('loadingEnd', {});
            window.dispatchEvent(loadingEnd);
            return;
        }

        if (resp.status === 204) {
            setSnackbarContent(`Account deleted! Goodbye!`);
            setSnackbarSeverity("success");
            setOtpPass(+new Date() + 30000);
        } else {
            setSnackbarContent(`Failed to delete account: ` + resp.data.error);
            setSnackbarSeverity("error");
            setOtp(""); setOtpPass(0);
        }

        setDeleteDisabled(false);
        const loadingEnd = new CustomEvent('loadingEnd', {});
        window.dispatchEvent(loadingEnd);
    }, []);

    useEffect(() => {
        async function doLoad() {
            const [_notificationSettings, _userLanguage] = await makeRequestsWithAuth([
                `${vars.dhpath}/user/notification/settings`,
                `${vars.dhpath}/user/language`]);
            let newNotificationSettings = [];
            for (let i = 0; i < NOTIFICATION_TYPES.length; i++) {
                if (_notificationSettings[NOTIFICATION_TYPES[i]]) {
                    newNotificationSettings.push({ value: NOTIFICATION_TYPES[i], label: NOTIFICATION_NAMES[NOTIFICATION_TYPES[i]] });
                }
            }
            setNotificationSettings(newNotificationSettings);
            setSupportedLanguages(vars.languages);
            setUserLanguage(_userLanguage.language);
        }
        doLoad();
    }, []);

    const [sessions, setSessions] = useState([]);
    const [sessionsTotalItems, setSessionsTotalItems] = useState(0);
    const [sessionsPage, setSessionsPage] = useState(-1);
    const [sessionsPageSize, setSessionsPageSize] = useState(10);

    const [appSessions, setAppSessions] = useState([]);
    const [appSessionsTotalItems, setAppSessionsTotalItems] = useState(0);
    const [appSessionsPage, setAppSessionsPage] = useState(-1);
    const [appSessionsPageSize, setAppSessionsPageSize] = useState(10);

    async function loadSessions() {
        let mySessionsPage = sessionsPage;
        mySessionsPage === -1 ? mySessionsPage = 1 : mySessionsPage += 1;
        let myAppSessionsPage = appSessionsPage;
        myAppSessionsPage === -1 ? myAppSessionsPage = 1 : myAppSessionsPage += 1;

        const [_sessions, _appSessions] = await makeRequestsWithAuth([
            `${vars.dhpath}/token/list?page=${mySessionsPage}&page_size=${sessionsPageSize}`,
            `${vars.dhpath}/token/application/list?page=${myAppSessionsPage}&page_size=${appSessionsPageSize}`]);

        function getDeviceIcon(userAgent) {
            if (userAgent.indexOf("Chrome") != -1) return <FontAwesomeIcon icon={faChrome} />;
            else if (userAgent.indexOf("Firefox") != -1) return <FontAwesomeIcon icon={faFirefox} />;
            else if (userAgent.indexOf("MSIE") != -1) return <FontAwesomeIcon icon={faInternetExplorer} />;
            else if (userAgent.indexOf("Edge") != -1) return <FontAwesomeIcon icon={faEdge} />;
            else if (userAgent.indexOf("Opera") != -1) return <FontAwesomeIcon icon={faOpera} />;
            else if (userAgent.indexOf("Safari") != -1) return <FontAwesomeIcon icon={faSafari} />;
        }

        const calculateSHA256Hash = async (input) => {
            const encoder = new TextEncoder();
            const data = encoder.encode(input);

            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
            return hashHex;
        };
        const tokenHash = await calculateSHA256Hash(getAuthToken());

        let newSessions = [];
        for (let i = 0; i < _sessions.list.length; i++) {
            newSessions.push({
                ..._sessions.list[i], "device": getDeviceIcon(_sessions.list[i].user_agent), "create_time": <TimeAgo key={`${+new Date()}`} timestamp={_sessions.list[i].create_timestamp * 1000} />, "last_used_time": <TimeAgo key={`${+new Date()}`} timestamp={_sessions.list[i].last_used_timestamp * 1000} />, contextMenu: (tokenHash !== _sessions.list[i].hash) ? (<MenuItem onClick={() => { revokeSession(_sessions.list[i].hash); loadSessions(); }}>Revoke</MenuItem>) : (<MenuItem disabled > Current Session</MenuItem >)
            });
        };
        setSessions(newSessions);
        setSessionsTotalItems(_sessions.total_items);
        let newAppSessions = [];
        for (let i = 0; i < _appSessions.list.length; i++) {
            newAppSessions.push({ ..._appSessions.list[i], "create_time": <TimeAgo key={`${+new Date()}`} timestamp={_appSessions.list[i].create_timestamp * 1000} />, "last_used_time": <TimeAgo key={`${+new Date()}`} timestamp={_appSessions.list[i].last_used_timestamp * 1000} />, contextMenu: <MenuItem onClick={() => { revokeAppSession(_appSessions.list[i].hash); }}>Revoke</MenuItem> });
        }
        setAppSessions(newAppSessions);
        setAppSessionsTotalItems(_appSessions.total_items);
    };
    useEffect(() => {
        loadSessions();
    }, [sessionsPage, appSessionsPage]);

    const revokeSession = useCallback(async (hash) => {
        const loadingStart = new CustomEvent('loadingStart', {});
        window.dispatchEvent(loadingStart);

        let resp = await axios({ url: `${vars.dhpath}/token/hash`, data: { hash: hash }, method: "DELETE", headers: { Authorization: `Bearer ${getAuthToken()}` } });

        if (resp.status === 204) {
            setSnackbarContent(`Token Revoked`);
            setSnackbarSeverity("success");
            loadSessions();
        } else {
            setSnackbarContent(`Failed to revoke token: ` + resp.data.error);
            setSnackbarSeverity("error");
        }

        const loadingEnd = new CustomEvent('loadingEnd', {});
        window.dispatchEvent(loadingEnd);
    }, []);

    const revokeAppSession = useCallback(async (hash) => {
        const loadingStart = new CustomEvent('loadingStart', {});
        window.dispatchEvent(loadingStart);

        let resp = await axios({ url: `${vars.dhpath}/token/application`, data: { hash: hash }, method: "DELETE", headers: { Authorization: `Bearer ${getAuthToken()}` } });

        if (resp.status === 204) {
            setSnackbarContent(`Application Token Revoked`);
            setSnackbarSeverity("success");
            loadSessions();
        } else {
            setSnackbarContent(`Failed to revoke application token: ` + resp.data.error);
            setSnackbarSeverity("error");
        }

        const loadingEnd = new CustomEvent('loadingEnd', {});
        window.dispatchEvent(loadingEnd);
    }, []);

    const [badges, setBadges] = useState([]);
    const [badgeNames, setBadgeNames] = useState([]);
    useEffect(() => {
        if (Object.keys(vars.specialRolesMap).includes(vars.userInfo.discordid)) {
            let newBadges = [];
            let newBadgeNames = [];
            for (let i = 0; i < vars.specialRolesMap[vars.userInfo.discordid].length; i++) {
                let sr = vars.specialRolesMap[vars.userInfo.discordid][i];
                let badge = null;
                let badgeName = null;
                if (['lead_developer', 'project_manager', 'community_manager', 'development_team', 'support_manager', 'marketing_manager', 'support_team', 'marketing_team', 'graphic_team'].includes(sr.role)) {
                    badge = <Tooltip key={`badge-${vars.userInfo.uid}-chub}`} placement="top" arrow title="CHub Staff"
                        PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, -10] } }] }}>
                        <FontAwesomeIcon icon={faScrewdriverWrench} style={{ color: "#2fc1f7" }} />
                    </Tooltip>;
                    badgeName = "chub";
                }
                if (['community_legend'].includes(sr.role)) {
                    badge = <Tooltip key={`badge-${vars.userInfo.uid}-legend`} placement="top" arrow title="CHub Community Legend"
                        PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, -10] } }] }}>
                        <FontAwesomeIcon icon={faCrown} style={{ color: "#b2db80" }} />
                    </Tooltip>;
                    badgeName = "legend";
                }
                if (['platinum_sponsor', 'gold_sponsor', 'silver_sponsor', 'bronze_sponsor', 'server_booster', 'translation_team', 'web_client_beta'].includes(sr.role)) {
                    badge = <Tooltip key={`badge-${vars.userInfo.uid}-supporter`} placement="top" arrow title="CHub Supporter"
                        PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, -10] } }] }}>
                        <FontAwesomeIcon icon={faClover} style={{ color: "#f47fff" }} />
                    </Tooltip>;
                    badgeName = "supporter";
                }
                if (badge !== null && !badgeNames.includes(badgeName)) {
                    newBadges.push(badge);
                    newBadgeNames.push(badgeName);
                    setBadges(newBadges);
                    setBadgeNames(newBadgeNames);
                }
            }
        }
    }, []);

    return <Card>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={tab} onChange={handleChange} aria-label="map tabs" TabIndicatorProps={{ style: { backgroundColor: theme.palette.info.main } }}>
                <Tab label="General" {...tabBtnProps(0, tab, theme)} />
                <Tab label="Appearance" {...tabBtnProps(1, tab, theme)} />
                <Tab label="Security" {...tabBtnProps(2, tab, theme)} />
                <Tab label="Sessions" {...tabBtnProps(3, tab, theme)} />
            </Tabs>
        </Box>
        <TabPanel value={tab} index={0}>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={12} md={6} lg={6}>
                    <Typography variant="h7" sx={{ fontWeight: 800 }}>Tracker</Typography>
                    <br />
                    <ButtonGroup fullWidth>
                        {trackers.includes("trucky") && <Button variant="contained" color={tracker === "trucky" ? "info" : "secondary"} onClick={() => { updateTracker("trucky"); }}>Trucky</Button>}
                        {trackers.includes("tracksim") && <Button variant="contained" color={tracker === "tracksim" ? "info" : "secondary"} onClick={() => { updateTracker("tracksim"); }}>TrackSim</Button>}
                    </ButtonGroup>
                </Grid>

                <Grid item xs={12} sm={12} md={6} lg={6}>
                    <Typography variant="h7" sx={{ fontWeight: 800 }}>Display Timezone</Typography>
                    <br />
                    <Select
                        name="colors"
                        className="basic-multi-select"
                        classNamePrefix="select"
                        styles={customSelectStyles(theme)}
                        options={allTimeZones.map((zone) => ({ value: zone, label: zone }))}
                        value={{ value: userSettings.display_timezone, label: userSettings.display_timezone }}
                        onChange={(item) => { updateDisplayTimezone(item.value); }}
                        menuPortalTarget={document.body}
                    />
                </Grid>

                <Grid item xs={12} sm={12} md={6} lg={6}>
                    <Typography variant="h7" sx={{ fontWeight: 800 }}>Data Saver Mode</Typography>
                    <br />
                    <ButtonGroup fullWidth>
                        <Button variant="contained" color={userSettings.data_saver === true ? "info" : "secondary"} onClick={() => { updateDataSaver(true); }}>Enabled</Button>
                        <Button variant="contained" color={userSettings.data_saver === false ? "info" : "secondary"} onClick={() => { updateDataSaver(false); }}>Disabled</Button>
                    </ButtonGroup>
                </Grid>

                <Grid item xs={12} sm={12} md={6} lg={6}>
                    <Typography variant="h7" sx={{ fontWeight: 800 }}>Radio</Typography>
                    <br />
                    <ButtonGroup fullWidth>
                        <Button variant="contained" color={userSettings.radio === "enabled" ? "info" : "secondary"} onClick={() => { updateRadio("enabled"); }}>Enabled</Button>
                        <Button variant="contained" color={userSettings.radio === "auto" ? "info" : "secondary"} onClick={() => { updateRadio("auto"); }}>Auto Play</Button>
                        <Button variant="contained" color={userSettings.radio === "disabled" ? "info" : "secondary"} onClick={() => { updateRadio("disabled"); }}>Disabled</Button>
                    </ButtonGroup>
                </Grid>

                <Grid item xs={12} sm={12} md={6} lg={6}>
                    <Typography variant="h7" sx={{ fontWeight: 800 }}>Radio Provider</Typography>
                    <br />
                    <CreatableSelect
                        defaultValue={{ value: userSettings.radio_type, label: RADIO_TYPES[userSettings.radio_type] !== undefined ? RADIO_TYPES[userSettings.radio_type] : userSettings.radio_type }}
                        name="colors"
                        options={Object.keys(RADIO_TYPES).map((radioType) => ({ value: radioType, label: RADIO_TYPES[radioType] !== undefined ? RADIO_TYPES[radioType] : radioType }))}
                        className="basic-multi-select"
                        classNamePrefix="select"
                        styles={customSelectStyles(theme)}
                        value={{ value: userSettings.radio_type, label: RADIO_TYPES[userSettings.radio_type] !== undefined ? RADIO_TYPES[userSettings.radio_type] : userSettings.radio_type }}
                        onChange={(item) => { updateRadioType(item.value); }}
                        menuPortalTarget={document.body}
                    />
                </Grid>

                <Grid item xs={12} sm={12} md={6} lg={6}>
                    <Typography variant="h7" sx={{ fontWeight: 800 }}>Radio Volume</Typography>
                    <br />
                    <Slider value={userSettings.radio_volume} onChange={(e, val) => { updateRadioVolume(val); }} aria-labelledby="continuous-slider" sx={{ color: theme.palette.info.main }} />
                </Grid>

                <Grid item xs={12} sm={12} md={6} lg={6}>
                    <Typography variant="h7" sx={{ fontWeight: 800 }}>Notification Settings <IconButton size="small" aria-label="Edit" onClick={(e) => { reloadNotificationSettings(); }}><FontAwesomeIcon icon={faRefresh} /></IconButton ></Typography>
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
                        styles={customSelectStyles(theme)}
                        value={notificationSettings}
                        onChange={updateNotificationSettings}
                        menuPortalTarget={document.body}
                    />}
                    {notificationSettings === null && <Typography variant="body2">Loading...</Typography>}
                </Grid>

                <Grid item xs={12} sm={12} md={6} lg={6}>
                    <Typography variant="h7" sx={{ fontWeight: 800 }}>Language (API & Notifications Only)</Typography>
                    <br />
                    <TextField select size="small"
                        key="user-language"
                        name="User Language"
                        value={userLanguage}
                        onChange={updateUserLanguage}
                        sx={{ marginTop: "6px", height: "30px" }}
                        fullWidth
                    >
                        {supportedLanguages.map(language => (
                            <MenuItem key={language} value={language}>{LANGUAGES[language]}</MenuItem>
                        ))}
                    </TextField>
                </Grid>

                <Grid item xs={12} sm={12} md={12} lg={12}>
                    <Typography variant="h7" sx={{ fontWeight: 800 }}>Profile</Typography>
                    <Grid container spacing={2} sx={{ mt: "3px" }}>
                        <Grid item xs={12} sm={12} md={4} lg={4}>
                            <TextField
                                label="Name"
                                value={newProfile.name}
                                onChange={(e) => setNewProfile({ ...newProfile, name: e.target.value })}
                                fullWidth disabled={newProfileDisabled}
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={12} sm={12} md={6} lg={6}>
                            <TextField
                                label="Avatar URL"
                                value={newProfile.avatar}
                                onChange={(e) => setNewProfile({ ...newProfile, avatar: e.target.value })}
                                fullWidth disabled={newProfileDisabled}
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={12} sm={12} md={2} lg={2}>
                            <Button variant="contained" onClick={() => { updateProfile(); }} disabled={newProfileDisabled} fullWidth>Save</Button>
                        </Grid>
                    </Grid>
                    <ButtonGroup fullWidth sx={{ mt: "5px" }}>
                        <Button variant="contained" color="secondary">Sync To</Button>
                        <Button variant="contained" color="success" onClick={() => { updateProfile("discord"); }} disabled={newProfileDisabled}>Discord</Button>
                        <Button variant="contained" color="warning" onClick={() => { updateProfile("steam"); }} disabled={newProfileDisabled}>Steam</Button>
                        <Button variant="contained" color="error" onClick={() => { updateProfile("truckersmp"); }} disabled={newProfileDisabled}>TruckersMP</Button>
                    </ButtonGroup>
                </Grid>

                <Grid item xs={12} sm={12} md={6} lg={6}>
                    <Typography variant="h7" sx={{ fontWeight: 800 }}>Account Connections</Typography>
                    <Grid container spacing={2} sx={{ mt: "3px" }}>
                        <Grid item xs={8} sm={8} md={8} lg={8}>
                            <TextField
                                label="Email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                fullWidth size="small"
                            />
                        </Grid>
                        <Grid item xs={4} sm={4} md={4} lg={4}>
                            <Button variant="contained" onClick={() => { updateEmail(); }} disabled={newEmailDisabled} fullWidth>Update</Button>
                        </Grid>
                    </Grid>
                    <Grid container spacing={2} sx={{ mt: "3px" }}>
                        <Grid item xs={8} sm={8} md={8} lg={8}>
                            <TextField
                                label="Discord"
                                value={vars.userInfo.discordid}
                                fullWidth disabled size="small"
                            />
                        </Grid>
                        <Grid item xs={4} sm={4} md={4} lg={4}>
                            <Button variant="contained" onClick={() => { localStorage.setItem("update-discord", +new Date()); navigate("/auth/discord/redirect"); }} fullWidth>Update (OAuth)</Button>
                        </Grid>
                    </Grid>
                    <Grid container spacing={2} sx={{ mt: "3px" }}>
                        <Grid item xs={8} sm={8} md={8} lg={8}>
                            <TextField
                                label="Steam"
                                value={vars.userInfo.steamid}
                                fullWidth disabled size="small"
                            />
                        </Grid>
                        <Grid item xs={4} sm={4} md={4} lg={4}>
                            <Button variant="contained" onClick={() => { localStorage.setItem("update-steam", +new Date()); navigate("/auth/steam/redirect"); }} fullWidth>Update (OAuth)</Button>
                        </Grid>
                    </Grid>
                    <Grid container spacing={2} sx={{ mt: "3px" }}>
                        <Grid item xs={8} sm={8} md={8} lg={8}>
                            <TextField
                                label="TruckersMP"
                                value={newTruckersMPID}
                                onChange={(e) => setNewTruckersMPID(e.target.value)}
                                fullWidth size="small"
                            />
                        </Grid>
                        <Grid item xs={4} sm={4} md={4} lg={4}>
                            <Button variant="contained" onClick={() => { updateTruckersMPID(); }} disabled={newTruckersMPDisabled} fullWidth>Update</Button>
                        </Grid>
                    </Grid>
                </Grid>

                <Grid item xs={12} sm={12} md={6} lg={6}>
                    <Typography variant="h7" sx={{ fontWeight: 800 }}>About Me</Typography>
                    <br />
                    <TextField
                        multiline
                        key="about-me"
                        name="About Me"
                        value={newAboutMe}
                        onChange={(e) => { setNewAboutMe(e.target.value); }}
                        rows={7}
                        placeholder={"Say something about you!"}
                        sx={{ mt: "5px" }} fullWidth
                    />
                    <Button variant="contained" onClick={() => { updateAboutMe(); }} disabled={newAboutMeDisabled} sx={{ mt: "5px" }} fullWidth>Save</Button>
                </Grid>
            </Grid>
        </TabPanel>
        <TabPanel value={tab} index={1}>
            <Typography variant="h7" sx={{ fontWeight: 800 }}>Local Settings</Typography>
            <Typography variant="body2">These settings are stored locally and will only apply to the current client.</Typography>
            <br />
            <Grid container spacing={2}>
                <Grid item xs={12} sm={12} md={4} lg={4}>
                    <Typography variant="h7" sx={{ fontWeight: 800 }}>Distance Unit</Typography>
                    <br />
                    <ButtonGroup fullWidth>
                        <Button variant="contained" color={userSettings.unit === "metric" ? "info" : "secondary"} onClick={() => { updateUnit("metric"); }}>Metric</Button>
                        <Button variant="contained" color={userSettings.unit === "imperial" ? "info" : "secondary"} onClick={() => { updateUnit("imperial"); }}>Imperial</Button>
                    </ButtonGroup>
                </Grid>

                <Grid item xs={12} sm={12} md={4} lg={4}>
                    <Typography variant="h7" sx={{ fontWeight: 800 }}>Font Size <Chip sx={{ bgcolor: "#387aff", height: "16px", borderRadius: "5px", marginTop: "-3px" }} label="Experimental" /></Typography>
                    <br />
                    <ButtonGroup fullWidth>
                        <Button variant="contained" color={userSettings.font_size === "smaller" ? "info" : "secondary"} onClick={() => { updateFontSize("smaller"); }}>Smaller</Button>
                        <Button variant="contained" color={userSettings.font_size === "regular" ? "info" : "secondary"} onClick={() => { updateFontSize("regular"); }}>Regular</Button>
                        <Button variant="contained" color={userSettings.font_size === "larger" ? "info" : "secondary"} onClick={() => { updateFontSize("larger"); }}>Larger</Button>
                    </ButtonGroup>
                </Grid>

                <Grid item xs={12} sm={12} md={4} lg={4}>
                    <Typography variant="h7" sx={{ fontWeight: 800 }}>Theme</Typography>
                    <br />
                    <ButtonGroup fullWidth>
                        <Button variant="contained" color={userSettings.theme === "auto" ? "info" : "secondary"} onClick={() => { updateTheme("auto"); }}>Auto (Device)</Button>
                        <Button variant="contained" color={userSettings.theme === "dark" ? "info" : "secondary"} onClick={() => { updateTheme("dark"); }}>Dark</Button>
                        <Button variant="contained" color={userSettings.theme === "light" ? "info" : "secondary"} onClick={() => { updateTheme("light"); }}>Light</Button>
                    </ButtonGroup>
                </Grid>

                <Grid item xs={12} sm={12} md={4} lg={4}>
                    <Typography variant="h7" sx={{ fontWeight: 800 }}>Custom Theme</Typography>
                    <br />
                    <ButtonGroup fullWidth>
                        <Button variant="contained" color={userSettings.use_custom_theme === true ? "info" : "secondary"} onClick={() => { updateUseCustomTheme(true); }}>Enabled</Button>
                        <Button variant="contained" color={userSettings.use_custom_theme === false ? "info" : "secondary"} onClick={() => { updateUseCustomTheme(false); }}>Disabled</Button>
                    </ButtonGroup>
                    <br />
                    <br />
                    <Typography variant="h7" sx={{ fontWeight: 800 }}>Theme Darken Ratio</Typography>
                    <br />
                    <Slider value={userSettings.theme_darken_ratio * 100} onChange={(e, val) => { updateThemeDarkenRatio(val / 100); }} aria-labelledby="continuous-slider" sx={{ color: theme.palette.info.main }} />
                </Grid>

                <Grid item xs={6} sm={6} md={4} lg={4}>
                    <Typography variant="h7" sx={{ fontWeight: 800 }}>Theme Main Color</Typography>
                    <br />
                    <ColorInput color={userSettings.theme_main} onChange={updateThemeMainColor} disableDefault={true} />
                </Grid>

                <Grid item xs={6} sm={6} md={4} lg={4}>
                    <Typography variant="h7" sx={{ fontWeight: 800 }}>Theme Background Color</Typography>
                    <br />
                    <ColorInput color={userSettings.theme_background} onChange={updateThemeBackgroundColor} disableDefault={true} />
                </Grid>
            </Grid>
            <Divider sx={{ mt: "20px", mb: "20px" }} />
            <Typography variant="h7" sx={{ fontWeight: 800 }}>User Appearance Settings</Typography>
            <Typography variant="body2">These settings are synced to a remote server and will be displayed on other users' clients.</Typography>
            <Typography variant="body2">You must click "save" to sync settings to the remote server, otherwise the settings will be lost once you refresh or close this tab.</Typography>
            <br />
            <Grid container spacing={2}>
                <Grid item xs={12} sm={12} md={4} lg={4}>
                    <Typography variant="h7" sx={{ fontWeight: 800 }}>Name Color</Typography>
                    <br />
                    <ColorInput color={remoteUserConfig.name_color} onChange={(val) => { console.log(val); setRemoteUserConfig({ ...remoteUserConfig, name_color: val }); }} />
                    <Typography variant="h7" sx={{ fontWeight: 800 }}>Profile Color (Upper)</Typography>
                    <br />
                    <ColorInput color={remoteUserConfig.profile_upper_color} onChange={(val) => { console.log(val); setRemoteUserConfig({ ...remoteUserConfig, profile_upper_color: val }); }} />
                    <Typography variant="h7" sx={{ fontWeight: 800 }}>Profile Color (Lower)</Typography>
                    <br />
                    <ColorInput color={remoteUserConfig.profile_lower_color} onChange={(val) => { setRemoteUserConfig({ ...remoteUserConfig, profile_lower_color: val }); }} />
                    <TextField
                        label="Profile Banner URL"
                        value={remoteUserConfig.profile_banner_url}
                        onChange={(e) => { setRemoteUserConfig({ ...remoteUserConfig, profile_banner_url: e.target.value }); }}
                        fullWidth size="small"
                        sx={{ mt: "10px" }}
                    />
                    <Button variant="contained" onClick={() => { updateRemoteUserConfig(); }} fullWidth disabled={remoteUserConfigDisabled} sx={{ mt: "10px" }}>Save</Button>
                </Grid>
                <Grid item xs={0} sm={0} md={1} lg={1}></Grid>
                <Grid item xs={12} sm={12} md={4} lg={4}>
                    <Card sx={{ maxWidth: 340, minWidth: 340, padding: "5px", backgroundImage: `linear-gradient(${remoteUserConfig.profile_upper_color}, ${remoteUserConfig.profile_lower_color})` }}>
                        <CardMedia
                            component="img"
                            image={remoteUserConfig.profile_banner_url}
                            onError={(event) => {
                                event.target.src = `${vars.dhpath}/member/banner?userid=${vars.userInfo.userid}`;
                            }}
                            alt=""
                            sx={{ borderRadius: "5px 5px 0 0" }}
                        />
                        <CardContent sx={{ padding: "10px", backgroundImage: `linear-gradient(${theme.palette.background.paper}A0, ${theme.palette.background.paper}E0)`, borderRadius: "0 0 5px 5px" }}>
                            <CardContent sx={{ padding: "10px", backgroundImage: `linear-gradient(${theme.palette.background.paper}E0, ${theme.palette.background.paper}E0)`, borderRadius: "5px" }}>
                                <div style={{ display: "flex", flexDirection: "row" }}>
                                    <Typography variant="h6" sx={{ fontWeight: 800, flexGrow: 1, display: 'flex', alignItems: "center" }}>
                                        {vars.userInfo.name}
                                    </Typography>
                                    <Typography variant="h7" sx={{ flexGrow: 1, display: 'flex', alignItems: "center", maxWidth: "fit-content" }}>
                                        {badges.map((badge, index) => { return <span key={index}>{badge}&nbsp;</span>; })}
                                        {vars.userInfo.userid !== null && vars.userInfo.userid !== undefined && vars.userInfo.userid >= 0 && <Tooltip placement="top" arrow title="User ID"
                                            PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, -10] } }] }}><Typography variant="body2"><FontAwesomeIcon icon={faHashtag} />{vars.userInfo.userid}</Typography></Tooltip>}
                                    </Typography>
                                </div>
                                <Divider sx={{ mt: "8px", mb: "8px" }} />
                                {newAboutMe !== "" && <>
                                    <Typography variant="body2" sx={{ fontWeight: 800 }}>
                                        ABOUT ME
                                    </Typography>
                                    <Typography variant="body2">
                                        <MarkdownRenderer>{newAboutMe}</MarkdownRenderer>
                                    </Typography>
                                </>}
                                <Grid container sx={{ mt: "10px" }}>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" sx={{ fontWeight: 800 }}>
                                            MEMBER SINCE
                                        </Typography>
                                        <Typography variant="body2" sx={{ display: "inline-block" }}>
                                            {getFormattedDate(new Date(vars.userInfo.join_timestamp * 1000)).split(" at ")[0]}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" sx={{ fontWeight: 800 }}>
                                            TRACKER
                                        </Typography>
                                        <Typography variant="body2">
                                            {trackerMapping[tracker]}
                                        </Typography>
                                    </Grid>
                                </Grid>
                                {vars.userInfo.roles !== null && vars.userInfo.roles !== undefined && <Box sx={{ mt: "10px" }}>
                                    <Typography variant="body2" sx={{ fontWeight: 800 }}>
                                        {vars.userInfo.roles.length > 1 ? `ROLES` : `ROLE`}
                                    </Typography>
                                    {vars.userInfo.roles.map((role) => (
                                        <Chip
                                            key={`role-${role}`}
                                            avatar={<div style={{ marginLeft: "5px", width: "12px", height: "12px", backgroundColor: vars.roles[role] !== undefined && vars.roles[role].color !== undefined ? vars.roles[role].color : "#777777", borderRadius: "100%" }} />}
                                            label={vars.roles[role] !== undefined ? vars.roles[role].name : `Unknown Role (${role})`}
                                            variant="outlined"
                                            size="small"
                                            sx={{ borderRadius: "5px", margin: "3px" }}
                                        />
                                    ))}
                                </Box>}
                            </CardContent>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </TabPanel>
        <TabPanel value={tab} index={2}>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={12} md={6} lg={6}>
                    <Typography variant="h7" sx={{ fontWeight: 800 }}>Password Login</Typography>
                    <br />
                    <Typography variant="body2">- An unique email must be linked to your account to enable password login.</Typography>
                    <Typography variant="body2">- You will be able to login with email and password if password login is enabled.</Typography>
                    <Typography variant="body2">- If you no longer want to use password login, disable it for better security.</Typography>
                    <Typography variant="body2">- If MFA is not enabled, certain actions may be blocked if you logged in with password.</Typography>
                    <Grid container spacing={2} sx={{ mt: "3px" }}>
                        <Grid item xs={12} sm={12} md={6} lg={8}>
                            <TextField
                                label="New Password"
                                value={newPassword}
                                type="password"
                                onChange={(e) => setNewPassword(e.target.value)}
                                fullWidth size="small"
                            />
                        </Grid>
                        <Grid item xs={12} sm={12} md={6} lg={4}>
                            <ButtonGroup fullWidth>
                                <Button variant="contained" color="error" onClick={() => { disablePassword(); }} disabled={newPasswordDisabled}>Disable</Button>
                                <Button variant="contained" onClick={() => { updatePassword(); }} disabled={newPasswordDisabled}>Update</Button>
                            </ButtonGroup>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={6}>
                    <Typography variant="h7" sx={{ fontWeight: 800 }}>Multiple Factor Authentication (MFA) {mfaEnabled && <>- <span style={{ color: theme.palette.success.main }}>Already Enabled</span></>}</Typography>
                    <br />
                    <Typography variant="body2">- When MFA is enabled, a one-time-pass (OTP) is required upon login or perfoming sensitive action.</Typography>
                    <Typography variant="body2">- It is highly recommended to enable MFA for enhanced account security.</Typography>
                    <Typography variant="body2">- You will need an application like Authy or Google Authenticator to generate the one-time-pass (OTP).</Typography>
                    <Typography variant="body2">- If you lost access to the application, you may ask a staff member to disable MFA for you.</Typography>
                    <Grid container spacing={2} sx={{ mt: "3px" }}>
                        <Grid item xs={12} sm={12} md={6} lg={8}></Grid>
                        <Grid item xs={12} sm={12} md={6} lg={4}>
                            <ButtonGroup fullWidth>
                                {!mfaEnabled && <Button variant="contained" onClick={() => { enableMfa(); }} disabled={manageMfaDisabled}>Enable</Button>}
                                {mfaEnabled && <Button variant="contained" color="error" onClick={() => { disableMfa(); }} disabled={manageMfaDisabled}>Disable</Button>}
                            </ButtonGroup>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={6}>
                    <Typography variant="h7" sx={{ fontWeight: 800 }}>Application Authorization</Typography>
                    <br />
                    <Typography variant="body2">- An application token is provided to authorize external applications to act on behalf of you.</Typography>
                    <Typography variant="body2">- Always make sure you the application is trusted.</Typography>
                    <Typography variant="body2">- Dangerous actions like resigning cannot be done with application authorization.</Typography>
                    <Typography variant="body2">- Existing application authorizations are managed in "Sessions" tab.</Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.warning.main }}>- If anyone asks you to provide a bearer token, using F12 Developer Tools, they are trying to hack your account! Please report to security@chub.page immediately!</Typography>
                    <Grid container spacing={2} sx={{ mt: "3px" }}>
                        <Grid item xs={12} sm={12} md={8} lg={10}>
                            {newAppToken === null && <TextField
                                label="Application Name"
                                value={newAppTokenName}
                                onChange={(e) => setNewAppTokenName(e.target.value)}
                                fullWidth size="small"
                            />}
                            {newAppToken !== null && <TextField
                                label={`Application Token for ${newAppTokenName}`}
                                value={newAppToken}
                                fullWidth size="small" disabled
                            />}
                        </Grid>
                        <Grid item xs={12} sm={12} md={4} lg={2}>
                            {newAppToken === null && <Button variant="contained" onClick={() => { createAppToken(); }} disabled={newAppTokenDisabled} fullWidth>Create</Button>}
                            {newAppToken !== null && <Button variant="contained" onClick={() => { window.navigator.clipboard.writeText(newAppToken); }} fullWidth>Copy</Button>}
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={6}>
                    {vars.userInfo.userid !== null && vars.userInfo.userid >= 0 && <>
                        <Typography variant="h7" sx={{ color: theme.palette.warning.main }}>Leave <b>{vars.dhconfig.name}</b></Typography>
                        <br />
                        <Typography variant="body2">- All data, including jobs and points, that is currently linked to your account, will be unlinked.</Typography>
                        <Typography variant="body2">- The data will be kept but will have no owner. To delete them, you must reach out to a staff in the company.</Typography>
                        <Typography variant="body2">- You may have to create an application or ticket to inform Human Resources to prevent being banned.</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.warning.main }}>- Think twice! This cannot be undone!</Typography>
                        <Grid container spacing={2} sx={{ mt: "3px" }}>
                            <Grid item xs={12} sm={12} md={6} lg={8}>
                            </Grid>
                            <Grid item xs={12} sm={12} md={6} lg={4}>
                                <Button ref={resignRef} variant="contained" color="error" onClick={() => { if (!resignConfirm) { setResignDisabled(true); setResignConfirm(true); setTimeout(function () { setResignDisabled(false); }, 5000); } else memberResign(); }} disabled={resignDisabled} fullWidth>{!resignConfirm ? "Resign" : `${resignDisabled ? "Confirm? Wait..." : "Confirmed! Resign!"}`}</Button>
                            </Grid>
                        </Grid>
                    </>}
                    {(vars.userInfo.userid === null || vars.userInfo.userid < 0) && <>
                        <Typography variant="h7" sx={{ color: theme.palette.warning.main, fontWeight: 800 }}>Delete Account</Typography>
                        <br />
                        <Typography variant="body2">- Your account will be disabled for a 14-day cooldown, during which you may login again to recover it.</Typography>
                        <Typography variant="body2">- After the cooldown, the account will be deleted, along with personal information like email.</Typography>
                        <Typography variant="body2">- Certain data might be kept. For example, the information you sent in an application.</Typography>
                        <Typography variant="body2">- To completely delete such data, reach out to a staff in the company.</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.warning.main }}>- Deleting account will not remove an active ban.</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.warning.main }}>- Think twice! This cannot be undone!</Typography>
                        <Grid container spacing={2} sx={{ mt: "3px" }}>
                            <Grid item xs={12} sm={12} md={6} lg={8}>
                            </Grid>
                            <Grid item xs={12} sm={12} md={6} lg={4}>
                                <Button ref={deleteRef} variant="contained" color="error" onClick={() => { if (!deleteConfirm) { setDeleteDisabled(true); setDeleteConfirm(true); setTimeout(function () { setDeleteDisabled(false); }, 5000); } else deleteAccount(); }} disabled={deleteDisabled} fullWidth>{!deleteConfirm ? "Delete" : `${deleteDisabled ? "Confirm? Wait..." : "Confirmed! Delete!"}`}</Button>
                            </Grid>
                        </Grid>
                    </>}
                </Grid>
            </Grid>
        </TabPanel>
        <TabPanel value={tab} index={3}>
            {sessions.length > 0 && <CustomTable columns={sessionsColumns} data={sessions} totalItems={sessionsTotalItems} rowsPerPageOptions={[10, 25, 50, 100, 250]} defaultRowsPerPage={sessionsPageSize} onPageChange={setSessionsPage} onRowsPerPageChange={setSessionsPageSize} name="User Sessions" />}
            {appSessions.length > 0 && <CustomTable columns={appSessionsColumns} data={appSessions} totalItems={appSessionsTotalItems} rowsPerPageOptions={[10, 25, 50, 100, 250]} defaultRowsPerPage={appSessionsPageSize} onPageChange={setAppSessionsPage} onRowsPerPageChange={setAppSessionsPageSize} style={{ marginTop: "10px" }} name="Application Authorizations" />}
        </TabPanel>
        <Dialog open={modalEnableMfa} onClose={(e) => { setModalEnableMfa(false); }}>
            <DialogTitle>
                <Typography variant="h6" sx={{ flexGrow: 1, display: 'flex', alignItems: "center" }}>
                    <FontAwesomeIcon icon={faFingerprint} />&nbsp;&nbsp;Multiple Factor Authentication (MFA)
                </Typography>
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={12} md={7} lg={7}>
                        <Typography variant="body2">- To enable MFA, first install an Authentication App, like Authy and Google Authenticator.</Typography>
                        <Typography variant="body2">- Then, scan the QR code below to add the account.</Typography>
                        <Typography variant="body2">- Or, enter the code manually: <b>{mfaSecret}</b></Typography>
                        <Typography variant="body2">- Finally, enter the 6-digit OTP below and click "Verify".</Typography>
                        <TextField
                            sx={{ mt: "15px" }}
                            label="MFA OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={12} md={5} lg={5}>
                        <div ref={mfaSecretQRCodeRef} style={{ marginTop: "-15px", marginLeft: "20px" }} />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={(e) => { setModalEnableMfa(false); }} variant="contained" color="secondary" sx={{ ml: 'auto' }}>
                    Close
                </Button>
                <Button onClick={() => { window.navigator.clipboard.writeText(mfaSecret); }} variant="contained" color="info" sx={{ ml: 'auto' }}>
                    Copy Secret
                </Button>
                <Button onClick={enableMfa} disabled={manageMfaDisabled} variant="contained" color="success" sx={{ ml: 'auto' }}>
                    Verify
                </Button>
            </DialogActions>
        </Dialog>
        <Dialog open={requireOtp} onClose={(e) => { setRequireOtp(false); }}>
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
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    fullWidth
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={(e) => { setRequireOtp(false); }} variant="contained" color="secondary" sx={{ ml: 'auto' }}>
                    Close
                </Button>
                <Button onClick={handleOtp} variant="contained" color="success" sx={{ ml: 'auto' }}>
                    Verify
                </Button>
            </DialogActions>
        </Dialog>
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
    </Card >;
};

export default Settings;