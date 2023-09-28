import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Card, Box, Tabs, Tab, Grid, Typography, Button, ButtonGroup, IconButton, Snackbar, Alert, Select as MUISelect, useTheme, MenuItem, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Portal } from '@mui/base';

import Select from 'react-select';
import { useNavigate } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRefresh, faFingerprint } from '@fortawesome/free-solid-svg-icons';

import QRCodeStyling from 'qr-code-styling';

import { makeRequestsWithAuth, customAxios as axios, getAuthToken } from '../functions';
import { useRef } from 'react';
import TimeAgo from '../components/timeago';
import CustomTable from '../components/table';
import { faChrome, faFirefox, faEdge, faInternetExplorer, faOpera, faSafari } from '@fortawesome/free-brands-svg-icons';

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
        backgroundColor: theme.palette.background.default,
        borderColor: theme.palette.text.secondary
    }),
    option: (base) => ({
        ...base,
        color: '#3c3c3c'
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
    }, [setUserSettings]);

    const updateTheme = useCallback((to) => {
        vars.userSettings.theme = to;
        localStorage.setItem("client-settings", JSON.stringify(vars.userSettings));
        setUserSettings({ ...userSettings, theme: to });

        const themeUpdated = new CustomEvent('themeUpdated', {});
        window.dispatchEvent(themeUpdated);
    }, [setUserSettings]);

    let trackers = [];
    for (let i = 0; i < vars.apiconfig.tracker.length; i++) {
        if (!trackers.includes(vars.apiconfig.tracker[i].type)) {
            trackers.push(vars.apiconfig.tracker[i].type);
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
            const userUpdated = new CustomEvent('userUpdated', {});
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
                image: "https://drivershub.charlws.com/images/logo.png",
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
                const userUpdated = new CustomEvent('userUpdated', {});
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
            const userUpdated = new CustomEvent('userUpdated', {});
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

        let resp = await axios({ url: `${vars.dhpath}/user/${vars.userInfo.uid}`, method: "DELETE", headers: { Authorization: `Bearer ${getAuthToken()}` } });

        if (resp.status === 204) {
            setSnackbarContent(`Account deleted! Goodbye!`);
            setSnackbarSeverity("success");
        } else {
            setSnackbarContent(`Failed to delete account: ` + resp.data.error);
            setSnackbarSeverity("error");
        }

        setDeleteDisabled(false);
        const loadingEnd = new CustomEvent('loadingEnd', {});
        window.dispatchEvent(loadingEnd);
    }, []);

    useEffect(() => {
        async function doLoad() {
            const [_notificationSettings, _languages, _userLanguage] = await makeRequestsWithAuth([
                `${vars.dhpath}/user/notification/settings`,
                `${vars.dhpath}/languages`,
                `${vars.dhpath}/user/language`]);
            let newNotificationSettings = [];
            for (let i = 0; i < NOTIFICATION_TYPES.length; i++) {
                if (_notificationSettings[NOTIFICATION_TYPES[i]]) {
                    newNotificationSettings.push({ value: NOTIFICATION_TYPES[i], label: NOTIFICATION_NAMES[NOTIFICATION_TYPES[i]] });
                }
            }
            setNotificationSettings(newNotificationSettings);
            setSupportedLanguages(_languages.supported);
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
                ..._sessions.list[i], "device": getDeviceIcon(_sessions.list[i].user_agent), "create_time": <TimeAgo timestamp={_sessions.list[i].create_timestamp * 1000} />, "last_used_time": <TimeAgo timestamp={_sessions.list[i].last_used_timestamp * 1000} />, contextMenu: (tokenHash !== _sessions.list[i].hash) ? (<MenuItem onClick={() => { revokeSession(_sessions.list[i].hash); loadSessions(); }}>Revoke</MenuItem>) : (<MenuItem disabled > Current Session</MenuItem >)
            });
        };
        setSessions(newSessions);
        setSessionsTotalItems(_sessions.total_items);
        let newAppSessions = [];
        for (let i = 0; i < _appSessions.list.length; i++) {
            newAppSessions.push({ ..._appSessions.list[i], "create_time": <TimeAgo timestamp={_appSessions.list[i].create_timestamp * 1000} />, "last_used_time": <TimeAgo timestamp={_appSessions.list[i].last_used_timestamp * 1000} />, contextMenu: <MenuItem onClick={() => { revokeAppSession(_appSessions.list[i].hash); }}>Revoke</MenuItem> });
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
                <Grid item xs={12} sm={12} md={4} lg={4}>
                    <Typography variant="h7" sx={{ fontWeight: 800 }}>Distance Unit</Typography>
                    <br />
                    <ButtonGroup>
                        <Button variant="contained" color={userSettings.unit === "metric" ? "info" : "secondary"} onClick={() => { updateUnit("metric"); }}>Metric</Button>
                        <Button variant="contained" color={userSettings.unit === "imperial" ? "info" : "secondary"} onClick={() => { updateUnit("imperial"); }}>Imperial</Button>
                    </ButtonGroup>
                </Grid>

                <Grid item xs={12} sm={12} md={4} lg={4}>
                    <Typography variant="h7" sx={{ fontWeight: 800 }}>Theme</Typography>
                    <br />
                    <ButtonGroup>
                        <Button variant="contained" color={userSettings.theme === "auto" ? "info" : "secondary"} onClick={() => { updateTheme("auto"); }}>Auto (Device)</Button>
                        <Button variant="contained" color={userSettings.theme === "dark" ? "info" : "secondary"} onClick={() => { updateTheme("dark"); }}>Dark</Button>
                        <Button variant="contained" color={userSettings.theme === "light" ? "info" : "secondary"} onClick={() => { updateTheme("light"); }}>Light</Button>
                    </ButtonGroup>
                </Grid>

                <Grid item xs={12} sm={12} md={4} lg={4}>
                    <Typography variant="h7" sx={{ fontWeight: 800 }}>Tracker</Typography>
                    <br />
                    <ButtonGroup>
                        {trackers.includes("trucky") && <Button variant="contained" color={tracker === "trucky" ? "info" : "secondary"} onClick={() => { updateTracker("trucky"); }}>Trucky</Button>}
                        {trackers.includes("tracksim") && <Button variant="contained" color={tracker === "tracksim" ? "info" : "secondary"} onClick={() => { updateTracker("tracksim"); }}>TrackSim</Button>}
                    </ButtonGroup>
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
                        styles={customStyles(theme)}
                        value={notificationSettings}
                        onChange={updateNotificationSettings}
                        menuPortalTarget={document.body}
                    />}
                    {notificationSettings === null && <Typography variant="body2">Loading...</Typography>}
                </Grid>

                <Grid item xs={12} sm={12} md={6} lg={6}>
                    <Typography variant="h7" sx={{ fontWeight: 800 }}>Language (API & Notifications Only)</Typography>
                    <br />
                    <MUISelect
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
                    </MUISelect>
                </Grid>

                <Grid item xs={12} sm={12} md={6} lg={6}>
                    <Typography variant="h7" sx={{ fontWeight: 800 }}>Account Connections</Typography>
                    <Grid container spacing={2} sx={{ mt: "3px" }}>
                        <Grid item xs={12} sm={12} md={8} lg={8}>
                            <TextField
                                label="Email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                fullWidth size="small"
                            />
                        </Grid>
                        <Grid item xs={12} sm={12} md={4} lg={4}>
                            <Button variant="contained" onClick={() => { updateEmail(); }} disabled={newEmailDisabled} fullWidth>Update</Button>
                        </Grid>
                    </Grid>
                    <Grid container spacing={2} sx={{ mt: "3px" }}>
                        <Grid item xs={12} sm={12} md={8} lg={8}>
                            <TextField
                                label="Discord"
                                value={vars.userInfo.discordid}
                                fullWidth disabled size="small"
                            />
                        </Grid>
                        <Grid item xs={12} sm={12} md={4} lg={4}>
                            <Button variant="contained" onClick={() => { localStorage.setItem("update-discord", +new Date()); navigate("/beta/discord-redirect"); }} fullWidth>Update (OAuth)</Button>
                        </Grid>
                    </Grid>
                    <Grid container spacing={2} sx={{ mt: "3px" }}>
                        <Grid item xs={12} sm={12} md={8} lg={8}>
                            <TextField
                                label="Steam"
                                value={vars.userInfo.steamid}
                                fullWidth disabled size="small"
                            />
                        </Grid>
                        <Grid item xs={12} sm={12} md={4} lg={4}>
                            <Button variant="contained" onClick={() => { localStorage.setItem("update-steam", +new Date()); navigate("/beta/steam-redirect"); }} fullWidth>Update (OAuth)</Button>
                        </Grid>
                    </Grid>
                    <Grid container spacing={2} sx={{ mt: "3px" }}>
                        <Grid item xs={12} sm={12} md={8} lg={8}>
                            <TextField
                                label="TruckersMP"
                                value={newTruckersMPID}
                                onChange={(e) => setNewTruckersMPID(e.target.value)}
                                fullWidth size="small"
                            />
                        </Grid>
                        <Grid item xs={12} sm={12} md={4} lg={4}>
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
        <TabPanel value={tab} index={2}>
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