import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, Typography, Button, ButtonGroup, Box, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid } from '@mui/material';
import { Portal } from '@mui/base';
import { JsonEditor } from 'jsoneditor-react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faServer, faClockRotateLeft, faFingerprint, faDesktop } from '@fortawesome/free-solid-svg-icons';

import { customAxios as axios, makeRequestsAuto, getAuthToken } from '../functions';
import TimeAgo from '../components/timeago';

var vars = require("../variables");

const Configuration = () => {
    const [snackbarContent, setSnackbarContent] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const handleCloseSnackbar = useCallback(() => {
        setSnackbarContent("");
    }, []);

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
    const [apiBackup, setApiBackup] = useState(null);
    const [apiLastModify, setApiLastModify] = useState(0);
    const [apiLastChange, setApiLastChange] = useState(0);
    const updateApiConfig = useCallback((e) => {
        setApiConfig(e.target.value);
        setApiLastChange(+new Date()); // to ensure json updates correctly when needed
    }, [setApiConfig]);

    const [reloadModalOpen, setReloadModalOpen] = useState(false);
    function handleCloseReloadModal() {
        setReloadModalOpen(false);
    }

    const saveApiConfig = useCallback(async () => {
        const loadingStart = new CustomEvent('loadingStart', {});
        window.dispatchEvent(loadingStart);

        let config = apiConfig;
        const secret_keys = ["tracker_api_token", "tracker_webhook_secret", "discord_client_secret", "discord_bot_token", "steam_api_key", "smtp_port", "smtp_passwd"];
        for (let i = 0; i < secret_keys.length; i++) {
            if (config[secret_keys[i]] === "") delete config[secret_keys[i]];
        }

        let resp = await axios({ url: `${vars.dhpath}/config`, method: "PATCH", data: { config: config }, headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            setSnackbarContent(`API config updated! Remember to reload to make changes take effect!`);
            setSnackbarSeverity("success");
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }

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
        let resp = await axios({ url: `${vars.dhpath}/config/reload`, method: "POST", data: { otp: otp }, headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            setSnackbarContent(`Config reloaded!`);
            setSnackbarSeverity("success");
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
    }, [mfaOtp]);
    const enableDiscordRoleConnection = useCallback(async () => {
        let resp = await axios({ url: `${vars.dhpath}/discord/role-connection/enable`, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            setSnackbarContent(`Success!`);
            setSnackbarSeverity("success");
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
    }, []);
    const disableDiscordRoleConnection = useCallback(async () => {
        let resp = await axios({ url: `${vars.dhpath}/discord/role-connection/disable`, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            setSnackbarContent(`Success!`);
            setSnackbarSeverity("success");
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
    }, []);

    useEffect(() => {
        async function doLoad() {
            const loadingStart = new CustomEvent('loadingStart', {});
            window.dispatchEvent(loadingStart);

            const [_apiConfig] = await makeRequestsAuto([
                { url: `${vars.dhpath}/config`, auth: true },
            ]);

            setApiConfig(_apiConfig.config);
            setApiBackup(_apiConfig.backup);
            setApiLastModify(_apiConfig.config_last_modified);

            const loadingEnd = new CustomEvent('loadingEnd', {});
            window.dispatchEvent(loadingEnd);
        }
        doLoad();
    }, []);

    return (<>
        <Card>
            <CardContent>
                <Typography variant="h5" component="div">
                    <FontAwesomeIcon icon={faDesktop} /> Web Config
                </Typography>
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
            </CardContent>
        </Card>
        <br />
        <Card>
            <CardContent>
                <Typography variant="h5" component="div">
                    <FontAwesomeIcon icon={faServer} /> API Config
                </Typography>
                <Typography variant="body2" component="div" sx={{ mt: "5px" }}>
                    - You must reload config after saving to make it take effect.
                    <br />
                    - API Config does not directly affect Web Config which controls company name, color, logo and banner on Drivers Hub.
                    <br />
                    <br />
                    - Certain attributes such as "tracker[].api_token" are not visible due to security concerns, they are saved but will not be returned.
                    <br />
                    - Thus, when you get api_token and webhook_secret from the tracker app, remember to double save them elsewhere because they need to be provided again when you add a new tracker.
                    <br />
                    <br />
                    <FontAwesomeIcon icon={faClockRotateLeft} /> Last Modified: <TimeAgo key={apiLastModify} timestamp={apiLastModify * 1000} />
                </Typography>
                {apiConfig !== null && <JsonEditor
                    key={apiLastChange}
                    value={apiConfig}
                    onChange={updateApiConfig}
                />}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'grid', justifyItems: 'start' }}>
                        <ButtonGroup sx={{ mt: "5px" }}>
                            <Button variant="contained" color="success" onClick={() => { enableDiscordRoleConnection(); }}>Enable</Button>
                            <Button variant="contained" color="error" onClick={() => { disableDiscordRoleConnection(); }}>Disable</Button>
                            <Button variant="contained" color="secondary">Discord Role Connection</Button>
                        </ButtonGroup>
                    </Box>
                    <Box sx={{ display: 'grid', justifyItems: 'end' }}>
                        <ButtonGroup sx={{ mt: "5px" }}>
                            <Button variant="contained" color="secondary" onClick={() => { setApiConfig(apiBackup); setApiLastChange(+new Date()); }}>Revert</Button>
                            <Button variant="contained" color="success" onClick={() => { saveApiConfig(); }}>Save</Button>
                            <Button variant="contained" color="error" onClick={() => { showReloadApiConfig(); }}>Reload</Button>
                        </ButtonGroup>
                    </Box>
                </div>
            </CardContent>
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