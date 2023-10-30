import React, { useState, useEffect, useCallback } from 'react';
import { Card, Typography, Button, ButtonGroup, Box, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, InputLabel, Tabs, Tab, Collapse, IconButton, MenuItem } from '@mui/material';
import { ExpandMoreRounded } from '@mui/icons-material';
import { Portal } from '@mui/base';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faServer, faClockRotateLeft, faFingerprint, faDesktop } from '@fortawesome/free-solid-svg-icons';

import { customAxios as axios, makeRequestsAuto, getAuthToken } from '../functions';
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

var vars = require("../variables");

function tabBtnProps(index, current, theme) {
    return {
        id: `config-tab-${index}`,
        'aria-controls': `config-tabpanel-${index}`,
        style: { color: current === index ? theme.palette.info.main : 'inherit' }
    };
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

    const [formOpenStates, setFormOpenStates] = useState([true, false]);
    const handleFormToggle = (index) => {
        setFormOpenStates((prevOpenStates) => {
            const newOpenStates = [...prevOpenStates];
            newOpenStates[index] = !newOpenStates[index];
            return newOpenStates;
        });
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
    const [formConfig, setFormConfig] = useState(null);
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
            setFormConfig(config);
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

            setApiConfig(JSON.stringify(_apiConfig.config, null, 4));
            setFormConfig(_apiConfig.config);
            setApiBackup(JSON.stringify(_apiConfig.backup, null, 4));
            setApiLastModify(_apiConfig.config_last_modified);

            const loadingEnd = new CustomEvent('loadingEnd', {});
            window.dispatchEvent(loadingEnd);
        }
        doLoad();
    }, []);

    const setFormConfigVal = useCallback((key, val) => {
        setFormConfig({ ...formConfig, [key]: val });
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
                    {formConfig !== null &&
                        <>
                            <Typography variant="h6" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleFormToggle(0)}>
                                <div style={{ flexGrow: 1 }}>General</div>
                                <IconButton style={{ transition: 'transform 0.2s', transform: formOpenStates[0] ? 'rotate(180deg)' : 'none' }}>
                                    <ExpandMoreRounded />
                                </IconButton>
                            </Typography>
                            <Collapse in={formOpenStates[0]}>
                                <Grid container spacing={2} sx={{ mt: "5px" }}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            style={{ marginBottom: '16px' }}
                                            label="Company Name"
                                            variant="outlined"
                                            fullWidth
                                            value={formConfig.name}
                                            onChange={(e) => { setFormConfigVal("name", e.target.value); }}
                                        />
                                    </Grid>
                                    <Grid item xs={6} md={3}>
                                        <TextField
                                            style={{ marginBottom: '16px' }}
                                            label="Language"
                                            variant="outlined"
                                            fullWidth
                                            value={formConfig.language}
                                            onChange={(e) => { setFormConfigVal("language", e.target.value); }}
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
                                            label="Distance Unit"
                                            variant="outlined"
                                            fullWidth
                                            value={formConfig.distance_unit}
                                            onChange={(e) => { setFormConfigVal("distance_unit", e.target.value); }}
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
                                </Grid>
                            </Collapse>
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