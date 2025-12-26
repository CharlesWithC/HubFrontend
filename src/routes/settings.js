import { useState, useCallback, useEffect, useContext, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext, ThemeContext } from '../context';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { debounce } from 'lodash';

import { Card, CardMedia, CardContent, Box, Tabs, Tab, Grid, Typography, Button, ButtonGroup, IconButton, Snackbar, Alert, useTheme, MenuItem, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Slider, Divider, Chip, Tooltip, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';
import { CheckRounded, CloudUploadRounded } from '@mui/icons-material';
import Portal from '@mui/material/Portal';
import { customSelectStyles } from '../designs';

import Select from 'react-select';
import moment from 'moment-timezone';
import QRCodeStyling from 'qr-code-styling';
import CreatableSelect from 'react-select/creatable';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRefresh, faFingerprint, faHashtag, faScrewdriverWrench, faEarthAmericas, faCrown, faClover, faDesktop, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { faChrome, faFirefox, faEdge, faInternetExplorer, faOpera, faSafari, faPatreon } from '@fortawesome/free-brands-svg-icons';

import ColorInput from '../components/colorInput';
import TimeDelta from '../components/timedelta';
import CustomTable from '../components/table';
import MarkdownRenderer from '../components/markdown';
import SponsorBadge from '../components/sponsorBadge';

import { makeRequestsWithAuth, customAxios as axios, getAuthToken, writeLS, setAuthMode } from '../functions';

const LANGUAGES = { 'ar': 'Arabic (العربية)', 'be': 'Belarusian (беларуская)', 'bg': 'Bulgarian (български)', 'cs': 'Czech (čeština)', 'cy': 'Welsh (Cymraeg)', 'da': 'Danish (dansk)', 'de': 'German (Deutsch)', 'el': 'Greek (Ελληνικά)', 'en': 'English', 'eo': 'Esperanto', 'es': 'Spanish (Español)', 'et': 'Estonian (eesti keel)', 'fi': 'Finnish (suomi)', 'fr': 'French (français)', 'ga': 'Irish (Gaeilge)', 'gd': 'Scottish (Gàidhlig)', 'hu': 'Hungarian (magyar)', 'hy': 'Armenian (Հայերեն)', 'id': 'Indonesian (Bahasa Indonesia)', 'is': 'Icelandic (íslenska)', 'it': 'Italian (italiano)', 'ja': 'Japanese (日本語)', 'ko': 'Korean (한국어)', 'lt': 'Lithuanian (lietuvių kalba)', 'lv': 'Latvian (latviešu valoda)', 'mk/sl': 'Macedonian/Slovenian (македонски/​slovenščina)', 'mn': 'Mongolian (Монгол)', 'mo': 'Moldavian (Moldova)', 'ne': 'Nepali (नेपाली)', 'nl': 'Dutch (Nederlands)', 'nn': 'Norwegian (norsk nynorsk)', 'pl': 'Polish (polski)', 'pt': 'Portuguese (Português)', 'ro': 'Romanian (română)', 'ru': 'Russian (русский)', 'sk': 'Slovak (slovenčina)', 'sl': 'Slovenian (slovenščina)', 'sq': 'Albanian (Shqip)', 'sr': 'Serbian (српски)', 'sv': 'Swedish (Svenska)', 'th': 'Thai (ไทย)', 'tr': 'Turkish (Türkçe)', 'uk': 'Ukrainian (українська)', 'vi': 'Vietnamese (Tiếng Việt)', 'yi': 'Yiddish (ייִדיש)', 'zh': 'Chinese (中文)' };
const RADIO_TYPES = { "tfm": "TruckersFM", "simhit": "SimulatorHits", "custom-pean": "[Custom] PeanFM" };
const CUSTOM_RADIO_URL = { "custom-pean": "https://radio.plvtc.com/listen/peanfm/radio.mp3" };
const settingsRoutes = ["/general", "/profile", "/appearance", "/security", "/sessions"];

const DEFAULT_BGCOLOR = {
    light: {
        default: '#fafafa',
        paper: '#f0f0f0',
    },
    dark: {
        default: '#2F3136',
        paper: '#212529',
    }
};

function tabBtnProps(index, current, theme) {
    return {
        id: `map-tab-${index}`,
        'aria-controls': `map-tabpanel-${index}`,
        style: { color: current === index ? theme.palette.info.main : 'inherit' }
    };
}

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

const Settings = ({ defaultTab = 0 }) => {
    const { t: tr } = useTranslation();
    const { apiPath, vtcBackground, customBackground, setCustomBackground, specialUsers, patrons, curUserPatreonID, vtcLogo, userConfig, setUserConfig, vtcLevel, userLevel, apiConfig, webConfig, languages, allRoles, setUsers, curUser, userSettings, setUserSettings } = useContext(AppContext);
    const { themeSettings, setThemeSettings } = useContext(ThemeContext);

    const sessionsColumns = useMemo(() => ([
        { id: 'device', label: tr("device") },
        { id: 'ip', label: tr("ip") },
        { id: 'country', label: tr("country") },
        { id: 'create_time', label: tr("creation") },
        { id: 'last_used_time', label: tr("last_used") },
    ]), []);
    const appSessionsColumns = useMemo(() => ([
        { id: 'app_name', label: tr("application_name") },
        { id: 'create_time', label: tr("creation") },
        { id: 'last_used_time', label: tr("last_used") },
    ]), []);
    const NOTIFICATION_NAMES = useMemo(() => ({
        "drivershub": tr("drivers_hub"),
        "discord": "Discord",
        "login": tr("login"),
        "dlog": tr("delivery_log"),
        "member": tr("member"),
        "bonus": tr("bonus"),
        "new_announcement": tr("new_announcement"),
        "application": tr("application"),
        "new_challenge": tr("new_challenge"),
        "challenge": tr("challenge"),
        "division": tr("division"),
        "new_downloads": tr("new_downloads"),
        "economy": tr("economy"),
        "new_event": tr("new_event"),
        "upcoming_event": tr("upcoming_event"),
        "new_poll": tr("new_poll"),
        "poll_result": tr("poll_result"),
        "new_task": tr("new_task"),
        "task_reminder": tr("task_reminder"),
        "task_updated": tr("task_updated"),
        "task_mark_completed": tr("staff_user_completed_task"),
        "task_confirm_completed": tr("user_task_accepted_rejected")
    }), []);
    const NOTIFICATION_TYPES = useMemo(() => Object.keys(NOTIFICATION_NAMES), []);
    const PRIVACY_ATTRIBUTES = useMemo(() => ({
        "role_history": tr("hide_role_history"),
        "ban_history": tr("hide_ban_history"),
        "email": tr("hide_email"),
        "account_connections": tr("hide_account_connections"),
        "activity": tr("hide_activity"),
        "public_profile": tr("hide_profile_from_external_users")
    }), []);
    const PRIVACY_TYPES = useMemo(() => Object.keys(PRIVACY_ATTRIBUTES), []);
    const trackerMapping = { "unknown": tr("unknown"), "tracksim": "TrackSim", "trucky": "Trucky", "custom": tr("custom") };

    const [tab, setTab] = useState(defaultTab);
    const handleChange = useCallback((event, newValue) => {
        window.history.pushState("", "", "/settings" + settingsRoutes[newValue]);
        setTab(newValue);
    }, []);
    useEffect(() => {
        if (window.location.pathname !== "/settings" + settingsRoutes[tab]) {
            window.history.pushState("", "", "/settings" + settingsRoutes[tab]);
        }
    }, []);

    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

    const [snackbarContent, setSnackbarContent] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const handleCloseSnackbar = useCallback((e) => {
        setSnackbarContent("");
    }, []);

    const theme = useTheme();
    const navigate = useNavigate();

    const [allowClearCache, setAllowClearCache] = useState(localStorage.getItem("cache-preload") !== null);
    const connectedCHubAccount = useMemo(() => {
        let tiers = ["platinum", "gold", "silver", "bronze"];
        for (let k = 0; k < 4; k++) {
            for (let i = 0; i < patrons[tiers[k]].length; i++) {
                if (patrons[tiers[k]][i].abbr === webConfig.abbr && patrons[tiers[k]][i].uid === curUser.uid && !patrons[tiers[k]][i].patreon_id) {
                    return "OK";
                }
            }
        }
        return "N/A";
    }, [patrons, webConfig, curUser]);

    const [otp, setOtp] = useState("");
    const [otpAction, setOtpAction] = useState("");
    const [otpPass, setOtpPass] = useState(0); // timestamp, before which user doesn't need to re-enter the otp
    const [requireOtp, setRequireOtp] = useState(false);
    const [mfaEnabled, setMfaEnabled] = useState(curUser.mfa);
    const handleOtp = useCallback(() => {
        if (otp.replaceAll(" ", "") === "" || isNaN(otp.replaceAll(" ", "")) || otp.length !== 6) {
            setSnackbarContent(tr("invalid_otp"));
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

    const debounceTimeout = useRef(null);
    useEffect(() => {
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        debounceTimeout.current = setTimeout(() => {
            writeLS("client-settings", { ...userSettings, ...themeSettings }, window.dhhost);
        }, 200);

        return () => {
            if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current);
            }
        };
    }, [userSettings, themeSettings]);

    const [disablePresenceSettings, setDisablePresenceSettings] = useState(false);
    const updateDiscordPresence = useCallback(async (to) => {
        setDisablePresenceSettings(true);
        await window.electron.ipcRenderer.send("presence-settings", to);
        setUserSettings(prevSettings => ({ ...prevSettings, presence: to }));
        setTimeout(function () { setDisablePresenceSettings(false); }, 10000);
    }, []);

    const updateUnit = useCallback((to) => {
        setUserSettings(prevSettings => ({ ...prevSettings, unit: to }));
    }, []);

    const updateRPP = useCallback((to) => {
        setUserSettings(prevSettings => ({ ...prevSettings, default_row_per_page: to }));
    }, []);

    const updateFontSize = useCallback((to) => {
        setUserSettings(prevSettings => ({ ...prevSettings, font_size: to }));
    }, []);

    const allTimeZones = moment.tz.names();
    const updateDisplayTimezone = useCallback((to) => { // Display = DateTimeField
        setUserSettings(prevSettings => ({ ...prevSettings, display_timezone: to }));
    }, []);

    const updateTheme = useCallback((to) => {
        setThemeSettings(prevSettings => ({ ...prevSettings, theme: to }));
    }, []);

    const updateUseCustomTheme = useCallback((to) => {
        setThemeSettings(prevSettings => ({ ...prevSettings, use_custom_theme: to, ...(to === true && prevSettings.theme === "halloween" ? { theme: "dark" } : {}) }));
    }, []);

    const DRdebounceTimeout = useRef(null);
    const [localThemeDarkenRatio, setLocalThemeDarkenRatio] = useState(themeSettings.theme_darken_ratio);
    useEffect(() => {
        if (DRdebounceTimeout.current) {
            clearTimeout(DRdebounceTimeout.current);
        }

        DRdebounceTimeout.current = setTimeout(() => {
            setThemeSettings(prevSettings => ({ ...prevSettings, theme_darken_ratio: localThemeDarkenRatio }));
        }, 200);

        return () => {
            if (DRdebounceTimeout.current) {
                clearTimeout(DRdebounceTimeout.current);
            }
        };
    }, [localThemeDarkenRatio]);

    const updateThemeBackgroundColor = useCallback((to) => {
        setThemeSettings(prevSettings => ({ ...prevSettings, theme_background: to }));
    }, []);

    const updateThemeMainColor = useCallback((to) => {
        setThemeSettings(prevSettings => ({ ...prevSettings, theme_main: to }));
    }, []);

    const updateDataSaver = useCallback((to) => {
        setUserSettings(prevSettings => ({ ...prevSettings, data_saver: to }));
    }, []);

    const updateStreamerMode = useCallback((to) => {
        setUserSettings(prevSettings => ({ ...prevSettings, streamer_mode: to }));
    }, []);

    const updateRadio = useCallback((to) => {
        setUserSettings(prevSettings => ({ ...prevSettings, radio: to }));
    }, []);

    const updateRadioType = useCallback((to) => {
        setUserSettings(prevSettings => ({ ...prevSettings, radio_type: to }));
    }, []);

    const updateRadioVolume = useCallback((to) => {
        setUserSettings(prevSettings => ({ ...prevSettings, radio_volume: to }));
    }, []);

    const DEFAULT_USER_CONFIG = { "name_color": "/", "profile_upper_color": "/", "profile_lower_color": "/", "profile_banner_url": "/" };
    const [remoteUserConfig, setRemoteUserConfig] = useState(DEFAULT_USER_CONFIG);
    useEffect(() => {
        if (userConfig[curUser.uid] !== undefined) {
            let uc = userConfig[curUser.uid];
            if (uc.name_color === null) {
                uc.name_color = "/";
            }
            if (uc.profile_upper_color === null) {
                uc.profile_upper_color = "/";
            }
            if (uc.profile_lower_color === null) {
                uc.profile_lower_color = "/";
            }
            setRemoteUserConfig(uc);
        }
    }, []);
    const [remoteUserConfigDisabled, setRemoteUserConfigDisabled] = useState(false);
    const updateRemoteUserConfig = useCallback(async () => {
        window.loading += 1;
        setRemoteUserConfigDisabled(true);

        let resp = await axios({ url: `${apiPath}/auth/ticket`, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status !== 200) {
            setRemoteUserConfigDisabled(false);
            window.loading -= 1;
            setSnackbarContent(tr("failed_to_generate_auth_ticket_try_again_later"));
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

        resp = await axios({ url: `https://config.chub.page/config/user?domain=${webConfig.domain}`, data: { name_color: parse_color(remoteUserConfig.name_color), profile_upper_color: parse_color(remoteUserConfig.profile_upper_color), profile_lower_color: parse_color(remoteUserConfig.profile_lower_color), profile_banner_url: remoteUserConfig.profile_banner_url }, method: "PATCH", headers: { Authorization: `Ticket ${ticket}` } });
        if (resp.status === 204) {
            setSnackbarContent(tr("appearance_settings_updated"));
            setSnackbarSeverity("success");
            setUserConfig(userConfig => ({ ...userConfig, [curUser.uid]: { abbr: webConfig.abbr, name_color: remoteUserConfig.name_color, profile_upper_color: remoteUserConfig.profile_upper_color, profile_lower_color: remoteUserConfig.profile_lower_color, profile_banner_url: remoteUserConfig.profile_banner_url } }));
        } else {
            if (resp.data.error !== undefined) setSnackbarContent(resp.data.error);
            else setSnackbarContent(tr("unknown_error_please_try_again_later"));
            setSnackbarSeverity("error");
        }

        setRemoteUserConfigDisabled(false);
        window.loading -= 1;
    }, [apiPath, remoteUserConfig]);

    let trackers = useMemo(() => {
        const result = [];
        for (let i = 0; i < apiConfig.trackers.length; i++) {
            if (!result.includes(apiConfig.trackers[i].type)) {
                result.push(apiConfig.trackers[i].type);
            }
        }
        return result;
    }, [apiConfig]);
    const [tracker, setTracker] = useState(curUser.tracker);
    const updateTracker = useCallback(async (to) => {
        let resp = await axios({ url: `${apiPath}/user/tracker/switch?uid=${curUser.uid}`, data: { tracker: to }, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            setSnackbarContent(tr("tracker_updated"));
            setSnackbarSeverity("success");
            curUser.tracker = tracker;
            setTracker(to);
            setUsers(users => ({ ...users, [curUser.uid]: curUser }));
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
    }, [apiPath, tracker]);

    const [notificationSettings, setNotificationSettings] = useState(null);
    const reloadNotificationSettings = useCallback(async () => {
        const [_notificationSettings] = await makeRequestsWithAuth([`${apiPath}/user/notification/settings`]);
        let newNotificationSettings = [];
        for (let i = 0; i < NOTIFICATION_TYPES.length; i++) {
            if (_notificationSettings[NOTIFICATION_TYPES[i]]) {
                newNotificationSettings.push({ value: NOTIFICATION_TYPES[i], label: NOTIFICATION_NAMES[NOTIFICATION_TYPES[i]] });
            }
        }
        setNotificationSettings(newNotificationSettings);
    }, [apiPath]);
    const updateNotificationSettings = useCallback(async (newSettings) => {
        window.loading += 1;

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
            let resp = await axios({ url: `${apiPath}/user/notification/settings/${enabled[i]}/enable`, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
            if (resp.status === 204) {
                setSnackbarContent(tr("enabled_notification", { type: NOTIFICATION_NAMES[enabled[i]] }));
                setSnackbarSeverity("success");
            } else {
                setSnackbarContent(resp.data.error);
                setSnackbarSeverity("error");
                reloadNotificationSettings();
            }
        }
        for (let i = 0; i < disabled.length; i++) {
            let resp = await axios({ url: `${apiPath}/user/notification/settings/${disabled[i]}/disable`, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
            if (resp.status === 204) {
                setSnackbarContent(tr("disabled_notification", { type: NOTIFICATION_NAMES[enabled[i]] }));
                setSnackbarSeverity("success");
            } else {
                setSnackbarContent(resp.data.error);
                setSnackbarSeverity("error");
                reloadNotificationSettings();
            }
        }

        window.loading -= 1;
    }, [apiPath, notificationSettings]);

    const [privacySettings, setPrivacySettings] = useState(null);
    const reloadPrivacySettings = useCallback(async () => {
        const [_privacySettings] = await makeRequestsWithAuth([`${apiPath}/user/privacy`]);
        let newPrivacySettings = [];
        for (let i = 0; i < PRIVACY_TYPES.length; i++) {
            if (_privacySettings[PRIVACY_TYPES[i]]) {
                newPrivacySettings.push({ value: PRIVACY_TYPES[i], label: PRIVACY_ATTRIBUTES[PRIVACY_TYPES[i]] });
            }
        }
        setPrivacySettings(newPrivacySettings);
    }, [apiPath]);
    const debounceUpdatePrivacySettings = debounce(async (newSettings) => {
        if (window.privacyUpdating) return;
        window.privacyUpdating = true;
        window.loading += 1;

        const objSettings = JSON.parse(JSON.stringify(PRIVACY_ATTRIBUTES));
        for (let i = 0; i < PRIVACY_TYPES.length; i++) {
            objSettings[PRIVACY_TYPES[i]] = false;
        }
        for (let i = 0; i < newSettings.length; i++) {
            objSettings[newSettings[i].value] = true;
        }

        let resp = await axios({ url: `${apiPath}/user/privacy`, method: "PATCH", data: { ...objSettings }, headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            setSnackbarContent(tr("updated_privacy_settings"));
            setSnackbarSeverity("success");
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }

        window.loading -= 1;
        delete window.privacyUpdating;
    }, 3000);
    const updatePrivacySettings = useCallback(async (newSettings) => {
        setPrivacySettings(newSettings);
        debounceUpdatePrivacySettings(newSettings);
    }, [apiPath, privacySettings]);

    const [userLanguage, setUserLanguage] = useState(userSettings.language);
    const [languageLoading, setLanguageLoading] = useState(false);
    const updateUserLanguage = useCallback(async (e) => {
        window.loading += 1;

        setUserLanguage(e.target.value);
        setLanguageLoading(true);
        let resp = await axios({ url: `${apiPath}/user/language`, data: { language: e.target.value }, method: "PATCH", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            i18n.changeLanguage(e.target.value);
            setUserSettings(prevSettings => ({ ...prevSettings, language: e.target.value }));
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setLanguageLoading(false);

        window.loading -= 1;
    }, [apiPath]);

    const [newTruckersMPID, setNewTruckersMPID] = useState(curUser.truckersmpid);
    const [newTruckersMPDisabled, setTruckersmpDisabled] = useState(false);
    const updateTruckersMPID = useCallback(async () => {
        if (isNaN(newTruckersMPID) || String(newTruckersMPID).replaceAll(" ", "") === "") {
            setSnackbarContent(tr("invalid_truckersmp_id"));
            setSnackbarSeverity("error");
            return;
        }
        if (Number(newTruckersMPID) === curUser.truckersmpid) {
            setSnackbarContent(tr("truckersmp_id_was_not_updated"));
            setSnackbarSeverity("warning");
            return;
        }

        window.loading += 1;

        setTruckersmpDisabled(true);
        let resp = await axios({ url: `${apiPath}/user/truckersmp`, data: { truckersmpid: newTruckersMPID }, method: "PATCH", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            setSnackbarContent(tr("updated_truckersmp_account"));
            setSnackbarSeverity("success");
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setTruckersmpDisabled(false);

        window.loading -= 1;
    }, [apiPath, newTruckersMPID]);

    const [newEmail, setNewEmail] = useState(curUser.email);
    const [newEmailDisabled, setEmailDisabled] = useState(false);
    const updateEmail = useCallback(async () => {
        if (newEmail.indexOf("@") === -1) {
            setSnackbarContent(tr("invalid_email"));
            setSnackbarSeverity("error");
            return;
        }
        if (newEmail === curUser.email) {
            setSnackbarContent(tr("email_was_not_updated"));
            setSnackbarSeverity("warning");
            return;
        }

        window.loading += 1;

        setEmailDisabled(true);
        let resp = await axios({ url: `${apiPath}/user/email`, data: { email: newEmail }, method: "PATCH", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            setSnackbarContent(tr("email_update_request_submitted_please_check_your_inbox_for_confirmation"));
            setSnackbarSeverity("success");
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setEmailDisabled(false);

        window.loading -= 1;
    }, [apiPath, newEmail]);

    const [newProfile, setNewProfile] = useState({ name: curUser.name, avatar: curUser.avatar });
    const [newProfileDisabled, setNewProfileDisabled] = useState(false);
    const updateProfile = useCallback(async (sync_to = undefined) => {
        setNewProfileDisabled(true);
        sync_to === undefined ? sync_to = "" : sync_to = `?sync_to_${sync_to}=true`;
        let resp = await axios({ url: `${apiPath}/user/profile${sync_to}`, method: "PATCH", data: newProfile, headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 200) {
            setUsers(users => ({ ...users, [curUser.uid]: resp.data }));
            setNewProfile({ name: resp.data.name, avatar: resp.data.avatar });
            setSnackbarContent(tr("profile_updated"));
            setSnackbarSeverity("success");
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setNewProfileDisabled(false);
    }, [apiPath, newProfile]);

    const [newAboutMe, setNewAboutMe] = useState(curUser.bio);
    const [newAboutMeDisabled, setAboutMeDisabled] = useState(false);
    const updateAboutMe = useCallback(async (e) => {
        window.loading += 1;
        setAboutMeDisabled(true);

        let resp = await axios({ url: `${apiPath}/user/bio`, data: { bio: newAboutMe }, method: "PATCH", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            setSnackbarContent(tr("updated_about_me"));
            setSnackbarSeverity("success");
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }

        setAboutMeDisabled(false);
        window.loading -= 1;
    }, [apiPath, newAboutMe]);

    const [newPassword, setNewPassword] = useState("");
    const [newPasswordDisabled, setUpdatePasswordDisabled] = useState(false);
    const updatePassword = useCallback(async (e) => {
        window.loading += 1;
        setUpdatePasswordDisabled(true);

        if (otpPass !== 0 && +new Date() - otpPass > 30000 && otp !== "") {
            setOtpPass(0); setOtp(""); updatePassword();
            return;
        }

        let resp = null;
        if (!mfaEnabled) {
            resp = await axios({ url: `${apiPath}/user/password`, data: { password: newPassword }, method: "PATCH", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        } else if (otp !== "") {
            resp = await axios({ url: `${apiPath}/user/password`, data: { password: newPassword, otp: otp }, method: "PATCH", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        } else {
            setOtpAction("update-password");
            setRequireOtp(true);
            setUpdatePasswordDisabled(false);
            window.loading -= 1;
            return;
        }
        if (resp.status === 204) {
            setSnackbarContent(tr("updated_password"));
            setSnackbarSeverity("success");
            setOtpPass(+new Date() + 30000);
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
            setOtp(""); setOtpPass(0);
        }

        setUpdatePasswordDisabled(false);
        window.loading -= 1;
    }, [apiPath, newPassword, otp, otpPass, mfaEnabled]);
    const disablePassword = useCallback(async (e) => {
        window.loading += 1;
        setUpdatePasswordDisabled(true);

        if (otpPass !== 0 && +new Date() - otpPass > 30000 && otp !== "") {
            setOtpPass(0); setOtp(""); updatePassword();
            return;
        }

        let resp = null;
        if (!mfaEnabled) {
            resp = await axios({ url: `${apiPath}/user/password/disable`, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        } else if (otp !== "") {
            resp = await axios({ url: `${apiPath}/user/password/disable`, data: { otp: otp }, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        } else {
            setOtpAction("disable-password");
            setRequireOtp(true);
            setUpdatePasswordDisabled(false);
            window.loading -= 1;
            return;
        }
        if (resp.status === 204) {
            setSnackbarContent(tr("disabled_password_login"));
            setSnackbarSeverity("success");
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }

        setUpdatePasswordDisabled(false);
        window.loading -= 1;
    }, [apiPath, otp, otpPass, mfaEnabled]);

    const [newAppToken, setNewAppToken] = useState(null);
    const [newAppTokenName, setNewAppTokenName] = useState("");
    const [newAppTokenDisabled, setNewAppTokenDisabled] = useState(false);
    const createAppToken = useCallback(async (e) => {
        window.loading += 1;
        setNewAppTokenDisabled(true);

        if (otpPass !== 0 && +new Date() - otpPass > 30000 && otp !== "") {
            setOtpPass(0); setOtp(""); createAppToken();
            return;
        }

        let resp = null;
        if (!mfaEnabled) {
            resp = await axios({ url: `${apiPath}/token/application`, data: { app_name: newAppTokenName }, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        } else if (otp !== "") {
            resp = await axios({ url: `${apiPath}/token/application`, data: { app_name: newAppTokenName, otp: otp }, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        } else {
            setOtpAction("create-apptoken");
            setRequireOtp(true);
            setNewAppTokenDisabled(false);
            window.loading -= 1;
            return;
        }
        if (resp.status === 200) {
            setSnackbarContent(tr("created_application_token"));
            setSnackbarSeverity("success");
            setOtpPass(+new Date() + 30000);
            setNewAppToken(resp.data.token);
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
            setOtp(""); setOtpPass(0);
        }

        setNewAppTokenDisabled(false);
        window.loading -= 1;
    }, [apiPath, newAppTokenName, otp, otpPass, mfaEnabled]);

    const [mfaSecret, setMfaSecret] = useState("");
    const mfaSecretQRCodeRef = useRef(null);
    const [modalEnableMfa, setModalEnableMfa] = useState(false);
    const [manageMfaDisabled, setManageMfaDisabled] = useState(false);
    const enableMfa = useCallback(async (e) => {
        window.loading += 1;

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
                data: `otpauth://totp/${webConfig.name.replaceAll(" ", "%20")}%20Drivers%20Hub?secret=${newSecret}&issuer=drivershub.charlws&digits=6&period=30`,
                image: vtcLogo,
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
            let resp = await axios({ url: `${apiPath}/user/mfa/enable`, data: { secret: mfaSecret, otp: otp }, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
            if (resp.status === 204) {
                setSnackbarContent(tr("mfa_enabled"));
                setSnackbarSeverity("success");
                setOtpPass(+new Date() + 30000);
                curUser.mfa = true;
                setMfaEnabled(true);
                setModalEnableMfa(false);
                setUsers(users => ({ ...users, [curUser.uid]: curUser }));
            } else {
                setSnackbarContent(resp.data.error);
                setSnackbarSeverity("error");
                setOtp(""); setOtpPass(0);
            }
            setManageMfaDisabled(false);
        }

        window.loading -= 1;
    }, [apiPath, otp, mfaSecret, modalEnableMfa]);
    const disableMfa = useCallback(async (e) => {
        window.loading += 1;
        setManageMfaDisabled(true);

        if (otpPass !== 0 && +new Date() - otpPass > 30000 && otp !== "") {
            setOtpPass(0); setOtp(""); disableMfa();
            return;
        }

        let resp = null;
        if (otp !== "") {
            resp = await axios({ url: `${apiPath}/user/mfa/disable`, data: { otp: otp }, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        } else {
            setOtpAction("disable-mfa");
            setRequireOtp(true);
            setManageMfaDisabled(false);
            window.loading -= 1;
            return;
        }
        if (resp.status === 204) {
            setSnackbarContent(tr("mfa_disabled"));
            setSnackbarSeverity("success");
            setOtpPass(+new Date() + 30000);
            curUser.mfa = false;
            setMfaEnabled(false);
            setUsers(users => ({ ...users, [curUser.uid]: curUser }));
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
            setOtp(""); setOtpPass(0);
        }

        setManageMfaDisabled(false);
        window.loading -= 1;
    }, [apiPath, newAppTokenName, otp, otpPass]);

    const [resignConfirm, setResignConfirm] = useState(false);
    const [resignDisabled, setResignDisabled] = useState(false);
    const resignRef = useRef(null);
    const memberResign = useCallback(async (e) => {
        window.loading += 1;
        setResignDisabled(true);

        if (otpPass !== 0 && +new Date() - otpPass > 30000 && otp !== "") {
            setOtpPass(0); setOtp(""); memberResign();
            return;
        }

        let resp = null;
        if (!mfaEnabled) {
            resp = await axios({ url: `${apiPath}/member/resign`, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        } else if (otp !== "") {
            resp = await axios({ url: `${apiPath}/member/resign`, data: { otp: otp }, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        } else {
            setOtpAction("resign");
            setRequireOtp(true);
            setResignDisabled(false);
            window.loading -= 1;
            return;
        }
        if (resp.status === 204) {
            setSnackbarContent(tr("you_have_resigned_goodbye_and_best_wishes"));
            setSnackbarSeverity("success");
            setOtpPass(+new Date() + 30000);
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
            setOtp(""); setOtpPass(0);
        }

        setResignDisabled(false);
        window.loading -= 1;
    }, [apiPath, otp, otpPass, mfaEnabled]);

    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [deleteDisabled, setDeleteDisabled] = useState(false);
    const deleteRef = useRef(null);
    const deleteAccount = useCallback(async (e) => {
        window.loading += 1;
        setDeleteDisabled(true);

        if (otpPass !== 0 && +new Date() - otpPass > 30000 && otp !== "") {
            setOtpPass(0); setOtp(""); memberResign();
            return;
        }

        let resp = null;
        if (!mfaEnabled) {
            resp = await axios({ url: `${apiPath}/user/${curUser.uid}`, method: "DELETE", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        } else if (otp !== "") {
            resp = await axios({ url: `${apiPath}/user/${curUser.uid}`, data: { otp: otp }, method: "DELETE", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        } else {
            setOtpAction("delete-account");
            setRequireOtp(true);
            setResignDisabled(false);
            window.loading -= 1;
            return;
        }

        if (resp.status === 204) {
            setSnackbarContent(tr("account_deleted_goodbye"));
            setSnackbarSeverity("success");
            setOtpPass(+new Date() + 30000);
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
            setOtp(""); setOtpPass(0);
        }

        setDeleteDisabled(false);
        window.loading -= 1;
    }, [apiPath]);

    useEffect(() => {
        reloadNotificationSettings();
        reloadPrivacySettings();
    }, [apiPath]);

    const [sessions, setSessions] = useState([]);
    const [sessionsTotalItems, setSessionsTotalItems] = useState(0);
    const [sessionsPage, setSessionsPage] = useState(1);
    const sessionsPageRef = useRef(1);
    const [sessionsPageSize, setSessionsPageSize] = useState(userSettings.default_row_per_page);

    const [appSessions, setAppSessions] = useState([]);
    const [appSessionsTotalItems, setAppSessionsTotalItems] = useState(0);
    const [appSessionsPage, setAppSessionsPage] = useState(1);
    const appSessionsPageRef = useRef(1);
    const [appSessionsPageSize, setAppSessionsPageSize] = useState(userSettings.default_row_per_page);

    useEffect(() => {
        sessionsPageRef.current = sessionsPage;
    }, [sessionsPage]);
    useEffect(() => {
        appSessionsPageRef.current = appSessionsPage;
    }, [appSessionsPage]);
    const loadSessions = useCallback(async () => {
        const [_sessions, _appSessions] = await makeRequestsWithAuth([
            `${apiPath}/token/list?page=${sessionsPage}&page_size=${sessionsPageSize}`,
            `${apiPath}/token/application/list?page=${appSessionsPage}&page_size=${appSessionsPageSize}`]);

        function getDeviceIcon(userAgent) {
            if (userAgent.indexOf("Chrome") != -1)
                return <Tooltip placement="top" arrow title="Chrome"
                    PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, -10] } }] }}>
                    <FontAwesomeIcon icon={faChrome} /></Tooltip>;
            else if (userAgent.indexOf("Firefox") != -1)
                return <Tooltip placement="top" arrow title="Firefox"
                    PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, -10] } }] }}>
                    <FontAwesomeIcon icon={faFirefox} /></Tooltip>;
            else if (userAgent.indexOf("MSIE") != -1)
                return <Tooltip placement="top" arrow title={tr("internet_explorer")}
                    PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, -10] } }] }}>
                    <FontAwesomeIcon icon={faInternetExplorer} /></Tooltip>;
            else if (userAgent.indexOf("Edge") != -1)
                return <Tooltip placement="top" arrow title="Edge"
                    PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, -10] } }] }}>
                    <FontAwesomeIcon icon={faEdge} /></Tooltip>;
            else if (userAgent.indexOf("Opera") != -1)
                return <Tooltip placement="top" arrow title="Opera"
                    PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, -10] } }] }}>
                    <FontAwesomeIcon icon={faOpera} /></Tooltip>;
            else if (userAgent.indexOf("Safari") != -1)
                return <Tooltip placement="top" arrow title="Safari"
                    PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, -10] } }] }}>
                    <FontAwesomeIcon icon={faSafari} /></Tooltip>;
            else if (userAgent.indexOf(tr("drivers_hub_desktop")) != -1)
                return <Tooltip placement="top" arrow title={tr("desktop_client")}
                    PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, -10] } }] }}>
                    <FontAwesomeIcon icon={faDesktop} /></Tooltip>;
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
                ..._sessions.list[i], "device": getDeviceIcon(_sessions.list[i].user_agent), "create_time": <TimeDelta key={`${+new Date()}`} timestamp={_sessions.list[i].create_timestamp * 1000} />, "last_used_time": <TimeDelta key={`${+new Date()}`} timestamp={_sessions.list[i].last_used_timestamp * 1000} />, contextMenu: (tokenHash !== _sessions.list[i].hash) ? (<MenuItem onClick={() => { revokeSession(_sessions.list[i].hash); loadSessions(); }}>{tr("revoke")}</MenuItem>) : (<MenuItem disabled >{tr("current_session")}</MenuItem >)
            });
        };
        if (sessionsPageRef.current === sessionsPage) {
            setSessions(newSessions);
            setSessionsTotalItems(_sessions.total_items);
        }
        let newAppSessions = [];
        for (let i = 0; i < _appSessions.list.length; i++) {
            newAppSessions.push({ ..._appSessions.list[i], "create_time": <TimeDelta key={`${+new Date()}`} timestamp={_appSessions.list[i].create_timestamp * 1000} />, "last_used_time": <TimeDelta key={`${+new Date()}`} timestamp={_appSessions.list[i].last_used_timestamp * 1000} />, contextMenu: <MenuItem onClick={() => { revokeAppSession(_appSessions.list[i].hash); }}>{tr("revoke")}</MenuItem> });
        }
        if (appSessionsPageRef.current === appSessionsPage) {
            setAppSessions(newAppSessions);
            setAppSessionsTotalItems(_appSessions.total_items);
        }
    }, [apiPath, sessionsPage, appSessionsPage]);
    useEffect(() => {
        loadSessions();
    }, [sessionsPage, appSessionsPage]);

    const revokeSession = useCallback(async (hash) => {
        window.loading += 1;

        let resp = await axios({ url: `${apiPath}/token/hash`, data: { hash: hash }, method: "DELETE", headers: { Authorization: `Bearer ${getAuthToken()}` } });

        if (resp.status === 204) {
            setSnackbarContent(tr("token_revoked"));
            setSnackbarSeverity("success");
            loadSessions();
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }

        window.loading -= 1;
    }, [apiPath]);

    const revokeAppSession = useCallback(async (hash) => {
        window.loading += 1;

        let resp = await axios({ url: `${apiPath}/token/application`, data: { hash: hash }, method: "DELETE", headers: { Authorization: `Bearer ${getAuthToken()}` } });

        if (resp.status === 204) {
            setSnackbarContent(tr("application_token_revoked"));
            setSnackbarSeverity("success");
            loadSessions();
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }

        window.loading -= 1;
    }, [apiPath]);

    const [badges, setBadges] = useState([]);
    useEffect(() => {
        let newBadges = [];
        let newBadgeNames = [];
        if (Object.keys(specialUsers).includes(curUser.discordid)) {
            for (let i = 0; i < specialUsers[curUser.discordid].length; i++) {
                let sr = specialUsers[curUser.discordid][i];
                let badge = null;
                let badgeName = null;
                if (['lead_developer', 'project_manager', 'community_manager', 'development_team', 'support_manager', 'marketing_manager', 'support_team', 'marketing_team', 'graphic_team'].includes(sr.role)) {
                    badge = <Tooltip key={`badge-${curUser.uid}-chub}`} placement="top" arrow title={tr("chub_team")}
                        PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, -10] } }] }}>
                        <FontAwesomeIcon icon={faScrewdriverWrench} style={{ color: "#2fc1f7" }} />
                    </Tooltip>;
                    badgeName = "chub";
                }
                if (['community_legend'].includes(sr.role)) {
                    badge = <Tooltip key={`badge-${curUser.uid}-legend`} placement="top" arrow title={tr("community_legend")}
                        PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, -10] } }] }}>
                        <FontAwesomeIcon icon={faCrown} style={{ color: "#b2db80" }} />
                    </Tooltip>;
                    badgeName = "legend";
                }
                if (['network_partner'].includes(sr.role)) {
                    badge = <Tooltip key={`badge-${curUser.uid}-network-partner`} placement="top" arrow title={tr("network_partner")}
                        PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, -10] } }] }}>
                        <FontAwesomeIcon icon={faEarthAmericas} style={{ color: "#5ae9e1" }} />
                    </Tooltip>;
                    badgeName = "legend";
                }
                if (['server_booster', 'translation_team'].includes(sr.role)) {
                    badge = <Tooltip key={`badge-${curUser.uid}-supporter`} placement="top" arrow title={tr("supporter")}
                        PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, -10] } }] }}>
                        <FontAwesomeIcon icon={faClover} style={{ color: "#f47fff" }} />
                    </Tooltip>;
                    badgeName = "supporter";
                }
                if (badge !== null && !newBadgeNames.includes(badgeName)) {
                    newBadges.push(badge);
                    newBadgeNames.push(badgeName);
                }
            }
        }

        let tiers = ["platinum", "gold", "silver", "bronze"];
        for (let i = 0; i < tiers.length; i++) {
            for (let j = 0; j < patrons[tiers[i]].length; j++) {
                let patron = patrons[tiers[i]][j];
                if (patron.abbr === webConfig.abbr && patron.uid === curUser.uid) {
                    let badge = <Tooltip key={`badge-${curUser.uid}-supporter`} placement="top" arrow title={tr("supporter")}
                        PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, -10] } }] }}>
                        <FontAwesomeIcon icon={faClover} style={{ color: "#f47fff" }} />
                    </Tooltip>;
                    let badgeName = "supporter";
                    if (badge !== null && !newBadgeNames.includes(badgeName)) {
                        newBadges.push(badge);
                        newBadgeNames.push(badgeName);
                    }

                    break;
                }
            }
        }

        setBadges(newBadges);
    }, []);

    useEffect(() => {
        if (userLevel < 3 && userSettings.display_timezone !== Intl.DateTimeFormat().resolvedOptions().timeZone) {
            updateDisplayTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
        }
        if (userLevel < 2 && userSettings.radio_type !== "tfm" || userLevel < 4 && !Object.keys(RADIO_TYPES).includes(userSettings.radio_type)) {
            updateRadioType("tfm");
        }
        if (userLevel < 3) {
            updateUseCustomTheme(false);
        }
    }, []);

    const handleCustomBackground = (event) => {
        const file = event.target.files[0];
        const fileSizeInMegabytes = file.size / (1024 * 1024);

        if (!file.type.startsWith('image/')) {
            setSnackbarContent(tr("not_a_valid_image"));
            setSnackbarSeverity("warning");
            return;
        }

        if (fileSizeInMegabytes > 2) {
            setSnackbarContent(tr("image_size_must_be_smaller_than_2mb"));
            setSnackbarSeverity("warning");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            setCustomBackground(e.target.result);
            localStorage.setItem('custom-background', e.target.result);
        };
        reader.readAsDataURL(file);
    };
    const handleCustomBackgroundElectron = async () => {
        const fileContent = await window.electron.ipcRenderer.invoke('open-file-dialog', ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"]);
        if (fileContent) {
            const mimeType = fileContent.split(';')[0].slice(5);

            if (!mimeType.startsWith('image/')) {
                setSnackbarContent(tr("not_a_valid_image"));
                setSnackbarSeverity("warning");
                return;
            }

            const fileSizeInBytes = Math.ceil((fileContent.length * 3) / 4);
            const fileSizeInMegabytes = fileSizeInBytes / (1024 * 1024);

            if (fileSizeInMegabytes > 2) {
                setSnackbarContent(tr("image_size_must_be_smaller_than_2mb"));
                setSnackbarSeverity("warning");
                return;
            }

            setCustomBackground(fileContent);
            localStorage.setItem('custom-background', fileContent);
        }
    };

    return (
        <Card>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs value={tab} onChange={handleChange} aria-label="map tabs" TabIndicatorProps={{ style: { backgroundColor: theme.palette.info.main } }}>
                    <Tab label={tr("general")} {...tabBtnProps(0, tab, theme)} />
                    <Tab label={tr("profile")} {...tabBtnProps(1, tab, theme)} />
                    <Tab label={tr("appearance")} {...tabBtnProps(2, tab, theme)} />
                    <Tab label={tr("security")} {...tabBtnProps(3, tab, theme)} />
                    <Tab label={tr("sessions")} {...tabBtnProps(4, tab, theme)} />
                </Tabs>
            </Box>
            <TabPanel value={tab} index={0}>
                <Grid container spacing={2}>
                    <Grid
                        size={{
                            xs: 12,
                            sm: 12,
                            md: 6,
                            lg: 6
                        }}>
                        <Typography variant="h7" sx={{ fontWeight: 800 }}>{tr("tracker")}</Typography>
                        <br />
                        <ButtonGroup fullWidth>
                            {trackers.includes("trucky") && <Button variant="contained" color={tracker === "trucky" ? "info" : "secondary"} onClick={() => { updateTracker("trucky"); }}>Trucky</Button>}
                            {trackers.includes("tracksim") && <Button variant="contained" color={tracker === "tracksim" ? "info" : "secondary"} onClick={() => { updateTracker("tracksim"); }}>TrackSim</Button>}
                            {trackers.includes("custom") && <Button variant="contained" color={tracker === "custom" ? "info" : "secondary"} onClick={() => { updateTracker("custom"); }}>{tr("custom")}</Button>}
                        </ButtonGroup>
                    </Grid>

                    <Grid
                        size={{
                            xs: 12,
                            sm: 12,
                            md: 6,
                            lg: 6
                        }}>
                        <Typography variant="h7" sx={{ fontWeight: 800 }}>{tr("distance_unit")}</Typography>
                        <br />
                        <ButtonGroup fullWidth>
                            <Button variant="contained" color={userSettings.unit === "metric" ? "info" : "secondary"} onClick={() => { updateUnit("metric"); }}>{tr("metric")}</Button>
                            <Button variant="contained" color={userSettings.unit === "imperial" ? "info" : "secondary"} onClick={() => { updateUnit("imperial"); }}>{tr("imperial")}</Button>
                        </ButtonGroup>
                    </Grid>

                    <Grid
                        size={{
                            xs: 12,
                            sm: 12,
                            md: 6,
                            lg: 6
                        }}>
                        <Typography variant="h7" sx={{ fontWeight: 800 }}>{tr("display_timezone")}&nbsp;&nbsp;<SponsorBadge level={3} /></Typography>
                        <div style={{ display: "relative", width: "100%", height: "6.5px" }}></div>
                        <Select
                            name="colors"
                            className="basic-multi-select"
                            classNamePrefix="select"
                            styles={customSelectStyles(theme)}
                            options={allTimeZones.map((zone) => ({ value: zone, label: zone }))}
                            value={{ value: userSettings.display_timezone, label: userSettings.display_timezone }}
                            onChange={(item) => { updateDisplayTimezone(item.value); }}
                            menuPortalTarget={document.body}
                            isDisabled={userLevel < 3}
                        />
                    </Grid>

                    <Grid
                        size={{
                            xs: 12,
                            sm: 12,
                            md: 6,
                            lg: 6
                        }}>
                        <Typography variant="h7" sx={{ fontWeight: 800 }}>{tr("default_table_rowperpage")}</Typography>
                        <br />
                        <TextField select size="small"
                            value={userSettings.default_row_per_page}
                            onChange={(e) => { updateRPP(e.target.value); }}
                            sx={{ marginTop: "6px", height: "30px" }}
                            fullWidth
                        >
                            {[10, 25, 50, 100, 250].map(count => (
                                <MenuItem key={count} value={count}>{count}</MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid
                        size={{
                            xs: 12,
                            sm: 12,
                            md: 6,
                            lg: 6
                        }}>
                        <Typography variant="h7" sx={{ fontWeight: 800 }}>{tr("data_saver_mode")}</Typography>
                        <br />
                        <ButtonGroup fullWidth>
                            <Button variant="contained" color={userSettings.data_saver === true ? "info" : "secondary"} onClick={() => { updateDataSaver(true); }}>{tr("enabled")}</Button>
                            <Button variant="contained" color={userSettings.data_saver === false ? "info" : "secondary"} onClick={() => { updateDataSaver(false); }}>{tr("disabled")}</Button>
                        </ButtonGroup>
                    </Grid>

                    <Grid
                        size={{
                            xs: 12,
                            sm: 12,
                            md: 3,
                            lg: 3
                        }}>
                        <Typography variant="h7" sx={{ fontWeight: 800 }}>{tr("streamer_mode")}</Typography>
                        <br />
                        <ButtonGroup fullWidth>
                            <Button variant="contained" color={userSettings.streamer_mode === true ? "info" : "secondary"} onClick={() => { updateStreamerMode(true); }}>{tr("on")}</Button>
                            <Button variant="contained" color={userSettings.streamer_mode === false ? "info" : "secondary"} onClick={() => { updateStreamerMode(false); }}>{tr("off")}</Button>
                        </ButtonGroup>
                    </Grid>

                    <Grid
                        size={{
                            xs: 12,
                            sm: 12,
                            md: 3,
                            lg: 3
                        }}>
                        <Typography variant="h7" sx={{ fontWeight: 800 }}>{tr("data_cache")}</Typography>
                        <br />
                        <ButtonGroup fullWidth>
                            <Button variant="contained" color="primary" onClick={() => { localStorage.removeItem("cache"); localStorage.removeItem("cache-logo"); localStorage.removeItem("cache-background"); localStorage.removeItem("cache-banner"); localStorage.removeItem("cache-web-config"); localStorage.removeItem("cache-preload"); localStorage.removeItem("cache-user"); localStorage.removeItem("cache-list-param"); setAllowClearCache(false); }} disabled={!allowClearCache}>{tr("clear")}</Button>
                        </ButtonGroup>
                    </Grid>

                    <Grid
                        size={{
                            xs: 12,
                            sm: 12,
                            md: 6,
                            lg: 6
                        }}>
                        <Typography variant="h7" sx={{ fontWeight: 800 }}>{tr("notification_settings")}<IconButton size="small" aria-label={tr("edit")} onClick={(e) => { reloadNotificationSettings(); }}><FontAwesomeIcon icon={faRefresh} /></IconButton ></Typography>
                        <div style={{ display: "relative", width: "100%", height: "3px" }}></div>
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
                        {notificationSettings === null && <Typography variant="body2">{tr("loading")}</Typography>}
                    </Grid>

                    <Grid
                        size={{
                            xs: 12,
                            sm: 12,
                            md: 6,
                            lg: 6
                        }}>
                        <Typography variant="h7" sx={{ fontWeight: 800 }}>{tr("language")}&nbsp;
                            <Tooltip placement="bottom" arrow title={<>{tr("did_not_find_your_language")}<br />{tr("contact_us_to_help_with_translations")}</>}
                                PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, -10] } }] }}>
                                <FontAwesomeIcon icon={faInfoCircle} />
                            </Tooltip>
                        </Typography>
                        <br />
                        {languages && <TextField select size="small"
                            key="user-language"
                            name={tr("user_language")}
                            value={userLanguage}
                            onChange={updateUserLanguage}
                            sx={{ marginTop: "6px", height: "30px" }}
                            fullWidth
                            disabled={languageLoading}
                        >
                            {languages.map(language => (
                                <MenuItem key={language} value={language}>{LANGUAGES[language]}</MenuItem>
                            ))}
                        </TextField>}
                        {!languages && <Typography variant="body2">{tr("loading")}</Typography>}
                    </Grid>

                    <Grid
                        size={{
                            xs: 12,
                            sm: 12,
                            md: 12,
                            lg: 12
                        }}>
                        <Divider />
                    </Grid>

                    <Grid
                        size={{
                            xs: 12,
                            sm: 12,
                            md: 6,
                            lg: 6
                        }}>
                        <Typography variant="h7" sx={{ fontWeight: 800 }}>{tr("radio")}</Typography>
                        <br />
                        <ButtonGroup fullWidth>
                            <Button variant="contained" color={userSettings.radio === "enabled" ? "info" : "secondary"} onClick={() => { updateRadio("enabled"); }}>{tr("enabled")}</Button>
                            <Button variant="contained" color={userSettings.radio === "auto" ? "info" : "secondary"} onClick={() => { updateRadio("auto"); }}>{tr("auto_play")}</Button>
                            <Button variant="contained" color={userSettings.radio === "disabled" ? "info" : "secondary"} onClick={() => { updateRadio("disabled"); }}>{tr("disabled")}</Button>
                        </ButtonGroup>
                    </Grid>
                    <Grid
                        size={{
                            xs: 0,
                            sm: 0,
                            md: 6,
                            lg: 6
                        }}></Grid>

                    <Grid
                        size={{
                            xs: 12,
                            sm: 12,
                            md: 6,
                            lg: 6
                        }}>
                        <Typography variant="h7" sx={{ fontWeight: 800 }}>{tr("radio_provider")}&nbsp;&nbsp;<SponsorBadge level={2} plus={true} /></Typography>
                        <br />
                        <CreatableSelect
                            defaultValue={{ value: userSettings.radio_type, label: RADIO_TYPES[userSettings.radio_type] !== undefined ? RADIO_TYPES[userSettings.radio_type] : userSettings.radio_type }}
                            name="colors"
                            options={Object.keys(RADIO_TYPES).map((radioType) => ({ value: radioType, label: RADIO_TYPES[radioType] !== undefined ? RADIO_TYPES[radioType] : radioType }))}
                            className="basic-multi-select"
                            classNamePrefix="select"
                            styles={customSelectStyles(theme)}
                            value={{ value: userSettings.radio_type, label: RADIO_TYPES[userSettings.radio_type] !== undefined ? RADIO_TYPES[userSettings.radio_type] : userSettings.radio_type }}
                            onChange={(item) => {
                                const isOptionExists = Object.keys(RADIO_TYPES).includes(item.value);
                                if (!isOptionExists) {
                                    if (userLevel < 4) {
                                        setSnackbarContent(tr("radio_url_platinum_perk"));
                                        setSnackbarSeverity("warning");
                                        return;
                                    }
                                    try {
                                        new URL(item.value);
                                    } catch {
                                        setSnackbarContent(tr("invalid_url_for_radio"));
                                        setSnackbarSeverity("warning");
                                        return;
                                    }
                                }
                                if (item.value.startsWith("custom")) {
                                    updateRadioType(CUSTOM_RADIO_URL[item.value]);
                                } else {
                                    updateRadioType(item.value);
                                }
                            }}
                            menuPortalTarget={document.body}
                            formatCreateLabel={(inputValue) => `[Platinum] Use URL: ${inputValue}`}
                            isDisabled={userLevel < 2}
                        />
                    </Grid>

                    <Grid
                        size={{
                            xs: 12,
                            sm: 12,
                            md: 6,
                            lg: 6
                        }}>
                        <Typography variant="h7" sx={{ fontWeight: 800 }}>{tr("radio_volume")}</Typography>
                        <br />
                        <Slider value={userSettings.radio_volume} onChange={(e, val) => { updateRadioVolume(val); }} aria-labelledby="continuous-slider" sx={{ color: theme.palette.info.main }} />
                    </Grid>

                    <Grid
                        size={{
                            xs: 12,
                            sm: 12,
                            md: 12,
                            lg: 12
                        }}>
                        <Divider />
                    </Grid>

                    {window.isElectron && <>
                        <Grid
                            size={{
                                xs: 12,
                                sm: 12,
                                md: 6,
                                lg: 6
                            }}>
                            <Typography variant="h7" sx={{ fontWeight: 800 }}>{tr("discord_presence")}</Typography>
                            <br />
                            <ButtonGroup fullWidth disabled={disablePresenceSettings}>
                                <Button variant="contained" color={userSettings.presence === "full" ? "info" : "secondary"} onClick={() => { updateDiscordPresence("full"); }}>{tr("full")}</Button>
                                <Button variant="contained" color={userSettings.presence === "basic" ? "info" : "secondary"} onClick={() => { updateDiscordPresence("basic"); }}>{tr("basic")}</Button>
                                <Button variant="contained" color={userSettings.presence === "none" ? "info" : "secondary"} onClick={() => { updateDiscordPresence("none"); }}>{tr("none")}</Button>
                            </ButtonGroup>
                        </Grid>
                        <Grid
                            size={{
                                xs: 0,
                                sm: 0,
                                md: 6,
                                lg: 6
                            }}></Grid>

                        <Grid
                            size={{
                                xs: 12,
                                sm: 12,
                                md: 12,
                                lg: 12
                            }}>
                            <Divider />
                        </Grid>
                    </>}

                    {!userSettings.streamer_mode && <Grid
                        size={{
                            xs: 12,
                            sm: 12,
                            md: 12,
                            lg: 12
                        }}>
                        <Typography variant="h7" sx={{ fontWeight: 800 }}>{tr("account_connections")}</Typography>
                        <Grid container spacing={2} sx={{ mt: "5px" }}>
                            <Grid
                                size={{
                                    xs: 12,
                                    sm: 12,
                                    md: 6,
                                    lg: 6
                                }}>
                                <Grid container spacing={2}>
                                    <Grid
                                        size={{
                                            xs: 8,
                                            sm: 8,
                                            md: 8,
                                            lg: 8
                                        }}>
                                        <TextField
                                            label={tr("email")}
                                            value={newEmail}
                                            onChange={(e) => setNewEmail(e.target.value)}
                                            fullWidth size="small"
                                        />
                                    </Grid>
                                    <Grid
                                        size={{
                                            xs: 4,
                                            sm: 4,
                                            md: 4,
                                            lg: 4
                                        }}>
                                        <Button variant="contained" onClick={() => { updateEmail(); }} disabled={newEmailDisabled} fullWidth>{tr("update")}</Button>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid
                                size={{
                                    xs: 12,
                                    sm: 12,
                                    md: 6,
                                    lg: 6
                                }}>
                                <Grid container spacing={2}>
                                    <Grid
                                        size={{
                                            xs: 8,
                                            sm: 8,
                                            md: 8,
                                            lg: 8
                                        }}>
                                        <TextField
                                            label="Discord"
                                            value={curUser.discordid}
                                            fullWidth disabled size="small"
                                        />
                                    </Grid>
                                    <Grid
                                        size={{
                                            xs: 4,
                                            sm: 4,
                                            md: 4,
                                            lg: 4
                                        }}>
                                        <Button variant="contained" onClick={() => { setAuthMode("update-discord"); navigate("/auth/discord/redirect"); }} fullWidth>{tr("update")}</Button>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid
                                size={{
                                    xs: 12,
                                    sm: 12,
                                    md: 6,
                                    lg: 6
                                }}>
                                <Grid container spacing={2}>
                                    <Grid
                                        size={{
                                            xs: 8,
                                            sm: 8,
                                            md: 8,
                                            lg: 8
                                        }}>
                                        <TextField
                                            label="Steam"
                                            value={curUser.steamid}
                                            fullWidth disabled size="small"
                                        />
                                    </Grid>
                                    <Grid
                                        size={{
                                            xs: 4,
                                            sm: 4,
                                            md: 4,
                                            lg: 4
                                        }}>
                                        <Button variant="contained" onClick={() => { setAuthMode("update-steam"); navigate("/auth/steam/redirect"); }} fullWidth>{tr("update")}</Button>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid
                                size={{
                                    xs: 12,
                                    sm: 12,
                                    md: 6,
                                    lg: 6
                                }}>
                                <Grid container spacing={2}>
                                    <Grid
                                        size={{
                                            xs: 8,
                                            sm: 8,
                                            md: 8,
                                            lg: 8
                                        }}>
                                        <TextField
                                            label="TruckersMP"
                                            value={newTruckersMPID}
                                            onChange={(e) => setNewTruckersMPID(e.target.value)}
                                            fullWidth size="small"
                                        />
                                    </Grid>
                                    <Grid
                                        size={{
                                            xs: 4,
                                            sm: 4,
                                            md: 4,
                                            lg: 4
                                        }}>
                                        <Button variant="contained" onClick={() => { updateTruckersMPID(); }} disabled={newTruckersMPDisabled} fullWidth>{tr("update")}</Button>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid
                                size={{
                                    xs: 12,
                                    sm: 12,
                                    md: 6,
                                    lg: 6
                                }}>
                                <Grid container spacing={2}>
                                    <Grid
                                        size={{
                                            xs: 8,
                                            sm: 8,
                                            md: 8,
                                            lg: 8
                                        }}>
                                        <TextField
                                            label="CHub Membership Account"
                                            value={connectedCHubAccount}
                                            fullWidth disabled size="small"
                                        />
                                    </Grid>
                                    <Grid
                                        size={{
                                            xs: 4,
                                            sm: 4,
                                            md: 4,
                                            lg: 4
                                        }}>
                                        <Button variant="contained" onClick={() => {
                                            const hubData = { "name": webConfig.name, "abbr": webConfig.abbr, "uid": curUser.uid };
                                            const hubKey = btoa(JSON.stringify(hubData));
                                            window.location.href = "https://drivershub.charlws.com/sponsor?connect_hub=true&hub_key=" + hubKey;
                                        }} fullWidth>{tr("connect")}</Button>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid
                                size={{
                                    xs: 12,
                                    sm: 12,
                                    md: 6,
                                    lg: 6
                                }}>
                                <Grid container spacing={2}>
                                    <Grid
                                        size={{
                                            xs: 8,
                                            sm: 8,
                                            md: 8,
                                            lg: 8
                                        }}>
                                        <TextField
                                            label="Patreon"
                                            value={curUserPatreonID}
                                            fullWidth disabled size="small"
                                        />
                                    </Grid>
                                    <Grid
                                        size={{
                                            xs: 4,
                                            sm: 4,
                                            md: 4,
                                            lg: 4
                                        }}>
                                        <Button variant="contained" onClick={() => { navigate("/auth/patreon/redirect"); }} fullWidth>{tr("update")}</Button>
                                    </Grid>
                                </Grid>
                            </Grid>
                            {userLevel === 0 && <Grid
                                container
                                justify="center"
                                alignItems="center"
                                size={{
                                    xs: 12,
                                    sm: 12,
                                    md: 6,
                                    lg: 6
                                }}>
                                <Typography variant="body2" align="center"><FontAwesomeIcon icon={faPatreon} />&nbsp;&nbsp;{tr("connect_patreon_account_to_activate_sponsor_perks")}</Typography>
                            </Grid>}
                        </Grid>
                    </Grid>}
                </Grid>
            </TabPanel>
            <TabPanel value={tab} index={1}>
                <Grid container spacing={2}>
                    <Grid
                        size={{
                            xs: 12,
                            sm: 12,
                            md: 6,
                            lg: 6
                        }}>
                        <Grid container spacing={2}>
                            <Grid
                                size={{
                                    xs: 12,
                                    sm: 12,
                                    md: 12,
                                    lg: 12
                                }}>
                                <Typography variant="h7" sx={{ fontWeight: 800 }}>{tr("name")}</Typography>
                                <br />
                                <TextField
                                    value={newProfile.name}
                                    onChange={(e) => setNewProfile({ ...newProfile, name: e.target.value })}
                                    fullWidth disabled={newProfileDisabled}
                                    size="small"
                                />
                            </Grid>
                            <Grid
                                size={{
                                    xs: 12,
                                    sm: 12,
                                    md: 12,
                                    lg: 12
                                }}>
                                <Typography variant="h7" sx={{ fontWeight: 800 }}>{tr("avatar_url")}</Typography>
                                <br />
                                <TextField
                                    value={newProfile.avatar}
                                    onChange={(e) => setNewProfile({ ...newProfile, avatar: e.target.value })}
                                    fullWidth disabled={newProfileDisabled}
                                    size="small"
                                />
                            </Grid>
                            <Grid
                                size={{
                                    xs: 12,
                                    sm: 12,
                                    md: 12,
                                    lg: 12
                                }}>
                                <Button variant="contained" onClick={() => { updateProfile(); }} disabled={newAboutMeDisabled} sx={{ mt: "5px" }} fullWidth>{tr("save")}</Button>
                            </Grid>
                            <Grid
                                size={{
                                    xs: 12,
                                    sm: 12,
                                    md: 12,
                                    lg: 12
                                }}>
                                <ButtonGroup fullWidth sx={{ mt: "5px" }}>
                                    <Button variant="contained" color="secondary">{tr("sync_to")}</Button>
                                    <Button variant="contained" color="success" onClick={() => { updateProfile("discord"); }} disabled={newProfileDisabled}>Discord</Button>
                                    <Button variant="contained" color="warning" onClick={() => { updateProfile("steam"); }} disabled={newProfileDisabled}>Steam</Button>
                                    <Button variant="contained" color="error" onClick={() => { updateProfile("truckersmp"); }} disabled={newProfileDisabled}>TruckersMP</Button>
                                </ButtonGroup>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid
                        size={{
                            xs: 12,
                            sm: 12,
                            md: 6,
                            lg: 6
                        }}>
                        <Typography variant="h7" sx={{ fontWeight: 800 }}>{tr("about_me")}</Typography>
                        <br />
                        <TextField
                            multiline
                            key="about-me"
                            name={tr("about_me")}
                            value={newAboutMe}
                            onChange={(e) => { setNewAboutMe(e.target.value); }}
                            rows={8}
                            placeholder={tr("say_something_about_you")}
                            sx={{ mt: "5px" }} fullWidth
                        />
                        <Button variant="contained" onClick={() => { updateAboutMe(); }} disabled={newAboutMeDisabled} sx={{ mt: "5px" }} fullWidth>{tr("save")}</Button>
                    </Grid>
                    <Grid
                        size={{
                            xs: 12,
                            sm: 12,
                            md: 12,
                            lg: 12
                        }}>
                        <Divider />
                    </Grid>
                    <Grid
                        size={{
                            xs: 12,
                            sm: 12,
                            md: 6,
                            lg: 6
                        }}>
                        <Grid container spacing={2}>
                            {userLevel < 3 && <Grid size={12}>
                                <Typography variant="h7" sx={{ fontWeight: 800, mb: "10px", color: theme.palette.info.main }}>{tr("customize_your_profile_with")}&nbsp;&nbsp;<SponsorBadge level={3} plus={true} /></Typography>
                                <br />
                            </Grid>}
                            <Grid size={12}>
                                <Typography variant="h7" sx={{ fontWeight: 800 }}>{tr("profile_banner_url")}&nbsp;&nbsp;<SponsorBadge level={3} /></Typography>
                                <TextField
                                    value={remoteUserConfig.profile_banner_url}
                                    onChange={(e) => { setRemoteUserConfig({ ...remoteUserConfig, profile_banner_url: e.target.value }); }}
                                    fullWidth size="small"
                                    sx={{ marginLeft: "5px" }}
                                    disabled={userLevel < 3}
                                />
                            </Grid>
                            <Grid size={12}>
                                <Typography variant="h7" sx={{ fontWeight: 800 }}>{tr("name_color")}&nbsp;&nbsp;<SponsorBadge level={2} plus={true} /></Typography>
                                <br />
                                {(vtcLevel >= 1 && webConfig.name_color !== null || userLevel >= 2) && <Box display="flex" flexDirection="row">
                                    {vtcLevel >= 1 && webConfig.name_color !== null &&
                                        <Tooltip placement="bottom" arrow title={tr("vtc_name_color")}
                                            PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, -10] } }] }}>
                                            <Box width="120px" height="60px" bgcolor={webConfig.name_color} p={1} m={1} display="flex" justifyContent="center" alignItems="center" borderRadius="5px" onClick={() => { setRemoteUserConfig({ ...remoteUserConfig, name_color: webConfig.name_color }); }} style={{ cursor: 'pointer' }}>
                                                {remoteUserConfig.name_color === webConfig.name_color && <CheckRounded />}
                                            </Box>
                                        </Tooltip>}
                                    {userLevel >= 2 &&
                                        <Tooltip placement="bottom" arrow title={tr("silver")}
                                            PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, -10] } }] }}>
                                            <Box width="120px" height="60px" bgcolor="#c0c0c0" p={1} m={1} display="flex" justifyContent="center" alignItems="center" borderRadius="5px" onClick={() => { setRemoteUserConfig({ ...remoteUserConfig, name_color: "#c0c0c0" }); }} style={{ cursor: 'pointer' }}>
                                                {remoteUserConfig.name_color === '#c0c0c0' && <CheckRounded />}
                                            </Box>
                                        </Tooltip>}
                                    {userLevel >= 3 && <Tooltip placement="bottom" arrow title={tr("gold")}
                                        PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, -10] } }] }}>
                                        <Box width="120px" height="60px" bgcolor="#ffd700" p={1} m={1} display="flex" justifyContent="center" alignItems="center" borderRadius="5px" onClick={() => { setRemoteUserConfig({ ...remoteUserConfig, name_color: "#ffd700" }); }} style={{ cursor: 'pointer' }}>
                                            {remoteUserConfig.name_color === '#ffd700' && <CheckRounded />}
                                        </Box>
                                    </Tooltip>}
                                    <ColorInput boxWrapper={false} color={remoteUserConfig.name_color} onChange={(val) => { setRemoteUserConfig({ ...remoteUserConfig, name_color: val }); }} customTooltip={tr("custom_color_platinum")} disableDefault={userLevel < 2} disableCustom={userLevel < 4} />
                                </Box>}
                            </Grid>
                            <Grid
                                size={{
                                    xs: 12,
                                    md: 6
                                }}>
                                <Typography variant="h7" sx={{ fontWeight: 800 }}>{tr("profile_theme_primary")}&nbsp;&nbsp;<SponsorBadge level={3} /></Typography>
                                <br />
                                <ColorInput color={remoteUserConfig.profile_upper_color} onChange={(val) => { setRemoteUserConfig({ ...remoteUserConfig, profile_upper_color: val }); }} disableDefault={userLevel < 3} disableCustom={userLevel < 3} />
                            </Grid>
                            <Grid
                                size={{
                                    xs: 12,
                                    md: 6
                                }}>
                                <Typography variant="h7" sx={{ fontWeight: 800 }}>{tr("profile_theme_accent")}&nbsp;&nbsp;<SponsorBadge level={3} /></Typography>
                                <br />
                                <ColorInput color={remoteUserConfig.profile_lower_color} onChange={(val) => { setRemoteUserConfig({ ...remoteUserConfig, profile_lower_color: val }); }} disableDefault={userLevel < 3} disableCustom={userLevel < 3} />
                            </Grid>
                            <Grid size={12}>
                                <Button fullWidth variant="contained" onClick={() => { updateRemoteUserConfig(); }} disabled={remoteUserConfigDisabled || userLevel < 2}>{tr("save")}</Button>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid
                        size={{
                            xs: 12,
                            sm: 12,
                            md: 6,
                            lg: 6
                        }}>
                        <Card sx={{ maxWidth: 340, minWidth: 340, padding: "5px", backgroundImage: `linear-gradient(${remoteUserConfig.profile_upper_color}, ${remoteUserConfig.profile_lower_color})` }}>
                            <CardMedia
                                component="img"
                                image={remoteUserConfig.profile_banner_url}
                                onError={(event) => {
                                    event.target.src = `${apiPath}/member/banner?userid=${curUser.userid}`;
                                }}
                                alt=""
                                sx={{ borderRadius: "5px 5px 0 0" }}
                            />
                            <CardContent sx={{ padding: "10px", backgroundImage: `linear-gradient(${DEFAULT_BGCOLOR[theme.mode].paper}A0, ${DEFAULT_BGCOLOR[theme.mode].paper}E0)`, borderRadius: "0 0 5px 5px" }}>
                                <CardContent sx={{ padding: "10px", backgroundImage: `linear-gradient(${DEFAULT_BGCOLOR[theme.mode].paper}E0, ${DEFAULT_BGCOLOR[theme.mode].paper}E0)`, borderRadius: "5px" }}>
                                    <div style={{ display: "flex", flexDirection: "row" }}>
                                        <Typography variant="h6" sx={{ fontWeight: 800, flexGrow: 1, display: 'flex', alignItems: "center" }}>
                                            {curUser.name}
                                        </Typography>
                                        <Typography variant="h7" sx={{ flexGrow: 1, display: 'flex', alignItems: "center", maxWidth: "fit-content" }}>
                                            {badges.map((badge, index) => { return <a key={index} onClick={() => { navigate("/badges"); }} style={{ cursor: "pointer" }}>{badge}&nbsp;</a>; })}
                                            {curUser.userid !== null && curUser.userid !== undefined && curUser.userid >= 0 && <Tooltip placement="top" arrow title={tr("user_id")}
                                                PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, -10] } }] }}><Typography variant="body2"><FontAwesomeIcon icon={faHashtag} />{curUser.userid}</Typography></Tooltip>}
                                        </Typography>
                                    </div>
                                    <Divider sx={{ mt: "8px", mb: "8px" }} />
                                    {newAboutMe !== "" && <>
                                        <Typography variant="body2" sx={{ fontWeight: 800 }}>
                                            {tr("about_me").toUpperCase()}
                                        </Typography>
                                        <Typography variant="body2">
                                            <MarkdownRenderer>{newAboutMe}</MarkdownRenderer>
                                        </Typography>
                                    </>}
                                    <Grid container sx={{ mt: "10px" }}>
                                        <Grid size={6}>
                                            <Typography variant="body2" sx={{ fontWeight: 800 }}>
                                                {tr("since").toUpperCase()}
                                            </Typography>
                                            <Typography variant="body2" sx={{ display: "inline-block" }}>
                                                <TimeDelta timestamp={curUser.join_timestamp * 1000} rough={true} />
                                            </Typography>
                                        </Grid>
                                        <Grid size={6}>
                                            <Typography variant="body2" sx={{ fontWeight: 800 }}>
                                                {tr("tracker").toUpperCase()}
                                            </Typography>
                                            <Typography variant="body2">
                                                {trackerMapping[tracker]}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                    {curUser.roles !== null && curUser.roles !== undefined && <Box sx={{ mt: "10px" }}>
                                        <Typography variant="body2" sx={{ fontWeight: 800 }}>
                                            {curUser.roles.length > 1 ? `ROLES` : `ROLE`}
                                        </Typography>
                                        {curUser.roles.map((role) => (
                                            <Chip
                                                key={`role-${role}`}
                                                avatar={<div style={{ marginLeft: "5px", width: "12px", height: "12px", backgroundColor: allRoles[role] !== undefined && allRoles[role].color !== undefined ? allRoles[role].color : "#777777", borderRadius: "100%" }} />}
                                                label={allRoles[role] !== undefined ? allRoles[role].name : `Unknown Role (${role})`}
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
                    <Grid
                        size={{
                            xs: 12,
                            sm: 12,
                            md: 6,
                            lg: 6
                        }}>
                        <Typography variant="h7" sx={{ fontWeight: 800 }}>{tr("theme")}</Typography>
                        <br />
                        <ButtonGroup fullWidth>
                            <Button variant="contained" color={themeSettings.theme === "auto" ? "info" : "secondary"} onClick={() => { if (["custombg", "vtcbg"].includes(themeSettings.use_custom_theme)) { updateThemeMainColor(DEFAULT_BGCOLOR[prefersDarkMode ? "dark" : "light"].paper); updateThemeBackgroundColor(DEFAULT_BGCOLOR[prefersDarkMode ? "dark" : "light"].default); setLocalThemeDarkenRatio(prefersDarkMode ? 0.5 : 0.05); } updateTheme("auto"); }}>{tr("auto_device")}</Button>
                            <Button variant="contained" color={themeSettings.theme === "dark" ? "info" : "secondary"} onClick={() => { if (["custombg", "vtcbg"].includes(themeSettings.use_custom_theme)) { updateThemeMainColor(DEFAULT_BGCOLOR["dark"].paper); updateThemeBackgroundColor(DEFAULT_BGCOLOR["dark"].default); setLocalThemeDarkenRatio(0.5); } updateTheme("dark"); }}>{tr("dark")}</Button>
                            <Button variant="contained" color={themeSettings.theme === "light" ? "info" : "secondary"} onClick={() => { if (["custombg", "vtcbg"].includes(themeSettings.use_custom_theme)) { updateThemeMainColor(DEFAULT_BGCOLOR["light"].paper); updateThemeBackgroundColor(DEFAULT_BGCOLOR["light"].default); setLocalThemeDarkenRatio(0.05); } updateTheme("light"); }}>{tr("light")}</Button>
                        </ButtonGroup>
                    </Grid>

                    <Grid
                        size={{
                            xs: 12,
                            sm: 12,
                            md: 6,
                            lg: 6
                        }}>
                        <Typography variant="h7" sx={{ fontWeight: 800 }}>{tr("font_size")}<Chip sx={{ bgcolor: "#387aff", height: "16px", borderRadius: "5px", marginTop: "-3px" }} label={tr("experimental")} /></Typography>
                        <br />
                        <ButtonGroup fullWidth>
                            <Button variant="contained" color={userSettings.font_size === "smaller" ? "info" : "secondary"} onClick={() => { updateFontSize("smaller"); }}>{tr("smaller")}</Button>
                            <Button variant="contained" color={userSettings.font_size === "regular" ? "info" : "secondary"} onClick={() => { updateFontSize("regular"); }}>{tr("regular")}</Button>
                            <Button variant="contained" color={userSettings.font_size === "larger" ? "info" : "secondary"} onClick={() => { updateFontSize("larger"); }}>{tr("larger")}</Button>
                        </ButtonGroup>
                    </Grid>

                    <Grid
                        size={{
                            xs: 12,
                            sm: 12,
                            md: 12,
                            lg: 12
                        }}>
                        <Typography variant="h7" sx={{ fontWeight: 800 }}>{tr("custom_theme")}&nbsp;&nbsp;{userLevel >= 2 && <SponsorBadge level={2} plug={true} />}</Typography>
                        <br />
                        {userLevel < 2 && <>
                            <Typography variant="h7" sx={{ fontWeight: 800, mb: "10px", color: theme.palette.info.main }}>{tr("customize_your_client_with")}&nbsp;&nbsp;<SponsorBadge level={2} plus={true} /></Typography>
                            <br />
                        </>}
                        <ButtonGroup fullWidth>
                            <Button variant="contained" color={themeSettings.use_custom_theme === true ? "info" : "secondary"} onClick={() => { updateUseCustomTheme(true); }} disabled={userLevel < 2}>{tr("enabled")}</Button>
                            <Button variant="contained" color={themeSettings.use_custom_theme === false ? "info" : "secondary"} onClick={() => { updateUseCustomTheme(false); }} disabled={userLevel < 2}>{tr("disabled")}</Button>
                            <Button variant="contained" color={themeSettings.use_custom_theme === "custombg" ? "info" : "secondary"} onClick={() => { updateThemeMainColor(DEFAULT_BGCOLOR[theme.mode].paper); updateThemeBackgroundColor(DEFAULT_BGCOLOR[theme.mode].default); setLocalThemeDarkenRatio(0.4); setThemeSettings(prevSettings => ({ ...prevSettings, bg_image: customBackground })); updateUseCustomTheme("custombg"); }} disabled={userLevel < 3}>{tr("custom_background")}</Button>
                            {vtcLevel >= 1 && webConfig.theme_main_color !== null && webConfig.theme_background_color !== null && <Button variant="contained" color={themeSettings.use_custom_theme === "vtc" ? "info" : "secondary"} onClick={() => { updateUseCustomTheme("vtc"); }}>{tr("vtc_theme")}</Button>}
                            {vtcLevel >= 1 && vtcBackground !== "" && <Button variant="contained" color={themeSettings.use_custom_theme === "vtcbg" ? "info" : "secondary"} onClick={() => { updateThemeMainColor(DEFAULT_BGCOLOR[theme.mode].paper); updateThemeBackgroundColor(DEFAULT_BGCOLOR[theme.mode].default); setLocalThemeDarkenRatio(0.4); setThemeSettings(prevSettings => ({ ...prevSettings, bg_image: vtcBackground })); updateUseCustomTheme("vtcbg"); }}>{tr("vtc_background")}</Button>}
                        </ButtonGroup>
                    </Grid>
                    <Grid
                        size={{
                            xs: 12,
                            sm: 12,
                            md: 2,
                            lg: 4
                        }}>
                        <Typography variant="h7" sx={{ fontWeight: 800 }}>{tr("theme_opacity")}</Typography>
                        <br />
                        <Slider value={localThemeDarkenRatio * 100} onChange={(e, val) => { setLocalThemeDarkenRatio(val / 100); }} aria-labelledby="continuous-slider" sx={{ color: theme.palette.info.main, height: "20px" }} disabled={userLevel < 3} />
                    </Grid>
                    <Grid
                        size={{
                            xs: 6,
                            sm: 6,
                            md: 3,
                            lg: 2
                        }}>
                        <Typography variant="h7" sx={{ fontWeight: 800 }}>{tr("theme_main_color")}</Typography>
                        <br />
                        <ColorInput color={themeSettings.theme_main} onChange={updateThemeMainColor} hideDefault={true} disableDefault={userLevel < 3} disableCustom={userLevel < 3} />
                    </Grid>
                    <Grid
                        size={{
                            xs: 6,
                            sm: 6,
                            md: 3,
                            lg: 2
                        }}>
                        <Typography variant="h7" sx={{ fontWeight: 800 }}>{tr("theme_background_color")}</Typography>
                        <br />
                        <ColorInput color={themeSettings.theme_background} onChange={updateThemeBackgroundColor} hideDefault={true} disableDefault={userLevel < 3} disableCustom={userLevel < 3} />
                    </Grid>
                    <Grid
                        size={{
                            xs: 6,
                            sm: 6,
                            md: 4,
                            lg: 4
                        }}>
                        <Typography variant="h7" sx={{ fontWeight: 800 }}>{tr("custom_background_image")}&nbsp;&nbsp;<SponsorBadge level={3} /></Typography>
                        <br />
                        <Box display="flex" flexDirection="row">
                            {customBackground !== "" &&
                                <img src={customBackground} height="60px" style={{ display: "flex", borderRadius: "5px", marginRight: "10px", opacity: userLevel >= 3 ? 1 : 0.8 }} />
                            }
                            <Tooltip title={tr("update_image")} placement="bottom" arrow PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, -10] } }] }}>
                                <Button component="label" variant="contained" startIcon={<CloudUploadRounded />} sx={{ width: "120px", height: "60px" }} disabled={userLevel < 3} onClick={() => { if (window.isElectron) handleCustomBackgroundElectron(); }}>
                                    {tr("update")}
                                    {!window.isElectron && <VisuallyHiddenInput type="file" property={{ accept: 'image/*' }} onChange={handleCustomBackground} />}
                                </Button>
                            </Tooltip>
                        </Box>
                    </Grid>
                </Grid>
            </TabPanel>
            <TabPanel value={tab} index={3}>
                <Grid container spacing={2}>
                    <Grid
                        size={{
                            xs: 12,
                            sm: 12,
                            md: 12,
                            lg: 12
                        }}>
                        <Typography variant="h7" sx={{ fontWeight: 800 }}>{tr("privacy_settings")}<IconButton size="small" aria-label={tr("edit")} onClick={(e) => { reloadPrivacySettings(); }}><FontAwesomeIcon icon={faRefresh} /></IconButton ></Typography>
                        <Typography variant="body2">{tr("privacy_settings_note_1")}</Typography>
                        <Typography variant="body2">{tr("privacy_settings_note_2")}</Typography>
                        <div style={{ display: "relative", width: "100%", height: "6.5px" }}></div>
                        {privacySettings !== null && <Select
                            defaultValue={privacySettings}
                            isMulti
                            name="colors"
                            options={Object.keys(PRIVACY_ATTRIBUTES)
                                .map((notification_type) => ({
                                    value: notification_type,
                                    label: PRIVACY_ATTRIBUTES[notification_type]
                                }))}
                            className="basic-multi-select"
                            classNamePrefix="select"
                            styles={customSelectStyles(theme)}
                            value={privacySettings}
                            onChange={updatePrivacySettings}
                            menuPortalTarget={document.body}
                        />}
                        {privacySettings === null && <Typography variant="body2">{tr("loading")}</Typography>}
                    </Grid>
                    <Grid
                        size={{
                            xs: 12,
                            sm: 12,
                            md: 6,
                            lg: 6
                        }}>
                        <Typography variant="h7" sx={{ fontWeight: 800 }}>{tr("password_login")}</Typography>
                        <br />
                        <Typography variant="body2">{tr("password_login_note")}</Typography>
                        <Typography variant="body2">{tr("password_login_note_2")}</Typography>
                        <Typography variant="body2">{tr("password_login_note_3")}</Typography>
                        <Typography variant="body2">{tr("password_login_note_4")}</Typography>
                        <Grid container spacing={2} sx={{ mt: "3px" }}>
                            <Grid
                                size={{
                                    xs: 12,
                                    sm: 12,
                                    md: 6,
                                    lg: 8
                                }}>
                                <TextField
                                    label={tr("new_password")}
                                    value={newPassword}
                                    type="password"
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    fullWidth size="small"
                                />
                            </Grid>
                            <Grid
                                size={{
                                    xs: 12,
                                    sm: 12,
                                    md: 6,
                                    lg: 4
                                }}>
                                <ButtonGroup fullWidth>
                                    <Button variant="contained" color="error" onClick={() => { disablePassword(); }} disabled={newPasswordDisabled}>{tr("disable")}</Button>
                                    <Button variant="contained" onClick={() => { updatePassword(); }} disabled={newPasswordDisabled}>{tr("update")}</Button>
                                </ButtonGroup>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid
                        size={{
                            xs: 12,
                            sm: 12,
                            md: 6,
                            lg: 6
                        }}>
                        <Typography variant="h7" sx={{ fontWeight: 800 }}>{tr("multiple_factor_authentication_mfa")}{mfaEnabled && <>- <span style={{ color: theme.palette.success.main }}>{tr("already_enabled")}</span></>}</Typography>
                        <br />
                        <Typography variant="body2">{tr("mfa_note")}</Typography>
                        <Typography variant="body2">{tr("mfa_note_2")}</Typography>
                        <Typography variant="body2">{tr("mfa_note_3")}</Typography>
                        <Typography variant="body2">{tr("mfa_note_4")}</Typography>
                        <Grid container spacing={2} sx={{ mt: "3px" }}>
                            <Grid
                                size={{
                                    xs: 12,
                                    sm: 12,
                                    md: 6,
                                    lg: 8
                                }}></Grid>
                            <Grid
                                size={{
                                    xs: 12,
                                    sm: 12,
                                    md: 6,
                                    lg: 4
                                }}>
                                <ButtonGroup fullWidth>
                                    {!mfaEnabled && <Button variant="contained" onClick={() => { enableMfa(); }} disabled={manageMfaDisabled}>{tr("enable")}</Button>}
                                    {mfaEnabled && <Button variant="contained" color="error" onClick={() => { disableMfa(); }} disabled={manageMfaDisabled}>{tr("disable")}</Button>}
                                </ButtonGroup>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid
                        size={{
                            xs: 12,
                            sm: 12,
                            md: 6,
                            lg: 6
                        }}>
                        <Typography variant="h7" sx={{ fontWeight: 800 }}>{tr("application_authorization")}</Typography>
                        <br />
                        <Typography variant="body2">{tr("application_authorization_note")}</Typography>
                        <Typography variant="body2">{tr("application_authorization_note_2")}</Typography>
                        <Typography variant="body2">{tr("application_authorization_note_3")}</Typography>
                        <Typography variant="body2">{tr("application_authorization_note_4")}</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.warning.main }}>{tr("application_authorization_note_5")}</Typography>
                        <Grid container spacing={2} sx={{ mt: "3px" }}>
                            <Grid
                                size={{
                                    xs: 12,
                                    sm: 12,
                                    md: 8,
                                    lg: 10
                                }}>
                                {newAppToken === null && <TextField
                                    label={tr("application_name")}
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
                            <Grid
                                size={{
                                    xs: 12,
                                    sm: 12,
                                    md: 4,
                                    lg: 2
                                }}>
                                {newAppToken === null && <Button variant="contained" onClick={() => { createAppToken(); }} disabled={newAppTokenDisabled} fullWidth>{tr("create")}</Button>}
                                {newAppToken !== null && <Button variant="contained" onClick={() => { window.navigator.clipboard.writeText(newAppToken); }} fullWidth>{tr("copy")}</Button>}
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid
                        size={{
                            xs: 12,
                            sm: 12,
                            md: 6,
                            lg: 6
                        }}>
                        {curUser.userid !== null && curUser.userid >= 0 && <>
                            <Typography variant="h7" sx={{ color: theme.palette.warning.main }}>{tr("leave")}<b>&nbsp;{webConfig.name}</b></Typography>
                            <br />
                            <Typography variant="body2">{tr("leave_company_note")}</Typography>
                            <Typography variant="body2">{tr("leave_company_note_2")}</Typography>
                            <Typography variant="body2">{tr("leave_company_note_3")}</Typography>
                            <Typography variant="body2" sx={{ color: theme.palette.warning.main }}>{tr("leave_company_note_4")}</Typography>
                            <Grid container spacing={2} sx={{ mt: "3px" }}>
                                <Grid
                                    size={{
                                        xs: 12,
                                        sm: 12,
                                        md: 6,
                                        lg: 8
                                    }}>
                                </Grid>
                                <Grid
                                    size={{
                                        xs: 12,
                                        sm: 12,
                                        md: 6,
                                        lg: 4
                                    }}>
                                    <Button ref={resignRef} variant="contained" color="error" onClick={() => { if (!resignConfirm) { setResignDisabled(true); setResignConfirm(true); setTimeout(function () { setResignDisabled(false); }, 5000); } else memberResign(); }} disabled={resignDisabled} fullWidth>{!resignConfirm ? tr("resign") : `${resignDisabled ? tr("confirm_wait") : tr("confirmed_resign")}`}</Button>
                                </Grid>
                            </Grid>
                        </>}
                        {(curUser.userid === null || curUser.userid < 0) && <>
                            <Typography variant="h7" sx={{ color: theme.palette.warning.main, fontWeight: 800 }}>{tr("delete_account")}</Typography>
                            <br />
                            <Typography variant="body2">{tr("delete_account_note")}</Typography>
                            <Typography variant="body2">{tr("delete_account_note_2")}</Typography>
                            <Typography variant="body2">{tr("delete_account_note_3")}</Typography>
                            <Typography variant="body2">{tr("delete_account_note_4")}</Typography>
                            <Typography variant="body2" sx={{ color: theme.palette.warning.main }}>{tr("delete_account_note_5")}</Typography>
                            <Typography variant="body2" sx={{ color: theme.palette.warning.main }}>{tr("leave_company_note_4")}</Typography>
                            <Grid container spacing={2} sx={{ mt: "3px" }}>
                                <Grid
                                    size={{
                                        xs: 12,
                                        sm: 12,
                                        md: 6,
                                        lg: 8
                                    }}>
                                </Grid>
                                <Grid
                                    size={{
                                        xs: 12,
                                        sm: 12,
                                        md: 6,
                                        lg: 4
                                    }}>
                                    <Button ref={deleteRef} variant="contained" color="error" onClick={() => { if (!deleteConfirm) { setDeleteDisabled(true); setDeleteConfirm(true); setTimeout(function () { setDeleteDisabled(false); }, 5000); } else deleteAccount(); }} disabled={deleteDisabled} fullWidth>{!deleteConfirm ? tr("delete") : `${deleteDisabled ? tr("confirm_wait") : tr("confirmed_delete")}`}</Button>
                                </Grid>
                            </Grid>
                        </>}
                    </Grid>
                </Grid>
            </TabPanel>
            <TabPanel value={tab} index={4}>
                {sessions.length > 0 && <CustomTable columns={sessionsColumns} data={sessions} totalItems={sessionsTotalItems} rowsPerPageOptions={[10, 25, 50, 100, 250]} defaultRowsPerPage={sessionsPageSize} onPageChange={setSessionsPage} onRowsPerPageChange={setSessionsPageSize} name={tr("user_sessions")} />}
                {appSessions.length > 0 && <CustomTable columns={appSessionsColumns} data={appSessions} totalItems={appSessionsTotalItems} rowsPerPageOptions={[10, 25, 50, 100, 250]} defaultRowsPerPage={appSessionsPageSize} onPageChange={setAppSessionsPage} onRowsPerPageChange={setAppSessionsPageSize} style={{ marginTop: "10px" }} name={tr("application_authorizations")} />}
            </TabPanel>
            <Dialog open={modalEnableMfa} onClose={(e) => { setModalEnableMfa(false); }}>
                <DialogTitle>
                    <Typography variant="h6" sx={{ flexGrow: 1, display: 'flex', alignItems: "center" }}>
                        <FontAwesomeIcon icon={faFingerprint} />&nbsp;&nbsp;{tr("multiple_factor_authentication_mfa")}</Typography>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid
                            size={{
                                xs: 12,
                                sm: 12,
                                md: 7,
                                lg: 7
                            }}>
                            <Typography variant="body2">{tr("enable_mfa_note")}</Typography>
                            <Typography variant="body2">{tr("enable_mfa_note_2")}</Typography>
                            <Typography variant="body2">{tr("enable_mfa_note_3")}<b>{mfaSecret}</b></Typography>
                            <Typography variant="body2">{tr("enable_mfa_note_4")}</Typography>
                            <TextField
                                sx={{ mt: "15px" }}
                                label={tr("mfa_otp")}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                fullWidth
                            />
                        </Grid>
                        <Grid
                            size={{
                                xs: 12,
                                sm: 12,
                                md: 5,
                                lg: 5
                            }}>
                            <div ref={mfaSecretQRCodeRef} style={{ marginTop: "-15px", marginLeft: "20px" }} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={(e) => { setModalEnableMfa(false); }} variant="contained" color="secondary" sx={{ ml: 'auto' }}>{tr("close")}</Button>
                    <Button onClick={() => { window.navigator.clipboard.writeText(mfaSecret); }} variant="contained" color="info" sx={{ ml: 'auto' }}>{tr("copy_secret")}</Button>
                    <Button onClick={enableMfa} disabled={manageMfaDisabled} variant="contained" color="success" sx={{ ml: 'auto' }}>{tr("verify")}</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={requireOtp} onClose={(e) => { setRequireOtp(false); }}>
                <DialogTitle>
                    <Typography variant="h6" sx={{ flexGrow: 1, display: 'flex', alignItems: "center" }}>
                        <FontAwesomeIcon icon={faFingerprint} />&nbsp;&nbsp;{tr("attention_required")}</Typography>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2">{tr("for_security_purposes_you_must")}</Typography>
                    <TextField
                        sx={{ mt: "15px" }}
                        label={tr("mfa_otp")}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        fullWidth
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={(e) => { setRequireOtp(false); }} variant="contained" color="secondary" sx={{ ml: 'auto' }}>{tr("close")}</Button>
                    <Button onClick={handleOtp} variant="contained" color="success" sx={{ ml: 'auto' }}>{tr("verify")}</Button>
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
        </Card >
    );
};

export default Settings;