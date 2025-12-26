import { useState, useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AppContext, ThemeContext } from '../../context';

import { Button, Card, Grid, Typography, TextField, CardContent, ButtonGroup, Box, IconButton, Dialog, DialogTitle, DialogContent, Snackbar, Alert, useMediaQuery } from '@mui/material';
import Portal from '@mui/material/Portal';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose, faRobot } from '@fortawesome/free-solid-svg-icons';
import { faSteam, faDiscord } from '@fortawesome/free-brands-svg-icons';

import HCaptcha from '@hcaptcha/react-hcaptcha';

import { customAxios as axios } from '../../functions';

const AuthLogin = () => {
    const { t: tr } = useTranslation();
    const { apiPath, apiConfig, webConfig } = useContext(AppContext);
    const { themeSettings } = useContext(ThemeContext);

    const CONNECTION_NAME = { "email": tr("email"), "discord": "Discord", "steam": "Steam", "truckersmp": "TruckersMP" };

    const navigate = useNavigate();
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const themeMode = themeSettings.theme === "auto" ? (prefersDarkMode ? 'dark' : 'light') : themeSettings.theme;

    const [snackbarContent, setSnackbarContent] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const handleCloseSnackbar = useCallback(() => {
        setSnackbarContent("");
    }, []);

    const [action, setAction] = useState("");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [authDisabled, setAuthDisabled] = useState(false);
    const validateEP = useCallback(() => {
        if (email.indexOf("@") === -1) {
            setSnackbarContent(tr("invalid_email"));
            setSnackbarSeverity("warning");
            return false;
        }
        return true;
    }, [email, password]);

    const [modalCaptcha, setModalCaptcha] = useState(false);
    const handleCaptcha = useCallback(async (token) => {
        setModalCaptcha(false);
        setAuthDisabled(true);

        if (action === "login") {
            setSnackbarContent(tr("logging_in"));
            setSnackbarSeverity("info");

            let resp = await axios({ url: `${apiPath}/auth/password`, data: { email: email, password: password, "captcha-response": token }, method: "POST" });
            if (resp.status === 200) {
                if (resp.data.mfa) {
                    setSnackbarContent(tr("success_redirecting_to_mfa"));
                    setSnackbarSeverity("success");
                    setTimeout(function () { navigate(`/auth/mfa?token=${resp.data.token}`); }, 3000);
                } else {
                    setSnackbarContent(tr("success_please_wait"));
                    setSnackbarSeverity("success");
                    setTimeout(function () { navigate(`/auth?token=${resp.data.token}`); }, 3000);
                }
            } else {
                setSnackbarContent(resp.data.error);
                setSnackbarSeverity("error");
            }
        } else if (action === "register") {
            let resp = await axios({ url: `${apiPath}/auth/register`, data: { email: email, password: password, "captcha-response": token }, method: "POST" });
            if (resp.status === 200) {
                setSnackbarContent(tr("success_account_registered"));
                setSnackbarSeverity("success");
                setTimeout(function () { navigate(`/auth?token=${resp.data.token}`); }, 3000);
            } else {
                setSnackbarContent(resp.data.error);
                setSnackbarSeverity("error");
            }
        } else if (action === "reset-password") {
            let resp = await axios({ url: `${apiPath}/auth/reset`, data: { email: email, "captcha-response": token }, method: "POST" });
            if (resp.status === 204) {
                setSnackbarContent(tr("password_reset_email_sent"));
                setSnackbarSeverity("success");
            } else {
                setSnackbarContent(resp.data.error);
                setSnackbarSeverity("error");
            }
        }

        setAuthDisabled(false);
    }, [apiPath, action, email, password]);

    return (
        <div style={{
            backgroundImage: `url(${themeSettings.bg_image})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
        }}>
            <Card sx={{ width: { xs: "100%", sm: "80%", md: "80%", lg: "60%" }, position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                <CardContent sx={{ padding: { xs: "20px", sm: "30px", md: "40px", lg: "40px" }, mb: "20px" }}>
                    <Grid container spacing={2}>
                        <Grid
                            size={{
                                xs: 12,
                                sm: 12,
                                md: 8,
                                lg: 8
                            }}>
                            <Typography variant="h3" sx={{ fontWeight: 800 }}>{tr("welcome_back")}<IconButton variant="contained" color="primary" onClick={() => { navigate("/"); }}><FontAwesomeIcon icon={faClose} /></IconButton></Typography>
                            <TextField label={tr("email")} variant="outlined" fullWidth margin="normal" value={email} onChange={(e) => { setEmail(e.target.value); }} />
                            <TextField label={tr("password")} variant="outlined" fullWidth margin="normal" type="password" value={password} onChange={(e) => { setPassword(e.target.value); }} onKeyDown={(e) => { if (e.key === tr("enter")) { setAction("login"); setModalCaptcha(true); } }} />
                            <Typography variant="body2" onClick={() => { if (validateEP()) { setAction("reset-password"); setModalCaptcha(true); } }} sx={{ cursor: "pointer", width: "fit-content" }}>{tr("forgot_your_password")}</Typography>
                            <br />
                            <ButtonGroup fullWidth>
                                <Button variant="contained" color="primary" disabled={authDisabled || !apiConfig.register_methods.includes("email")} onClick={() => { if (validateEP()) { setAction("register"); setModalCaptcha(true); } }}>{tr("register")}</Button>
                                <Button variant="contained" color="info" disabled={authDisabled} onClick={() => { if (validateEP()) { setAction("login"); setModalCaptcha(true); } }}>{tr("login")}</Button>
                            </ButtonGroup>
                        </Grid>

                        <Grid
                            size={{
                                xs: 12,
                                sm: 12,
                                md: 4,
                                lg: 4
                            }}>
                            <Box sx={{ display: { xs: "none", sm: "none", md: "block", lg: "block" }, margin: 0, height: "210px", maxHeight: "210px", width: "100%" }} >
                                <img src={`https://cdn.chub.page/assets/${webConfig.abbr}/banner.png?${webConfig.banner_key !== undefined ? webConfig.banner_key : ""}`} alt="" style={{ width: "100%" }} />
                            </Box>
                            <br />
                            <Typography variant="body2" sx={{ mb: "5px" }}>{tr("register_with")}: {apiConfig.register_methods.map((item) => (CONNECTION_NAME[item])).join(" / ")} | <span>{tr("or_login_with")}</span>:</Typography>
                            <ButtonGroup fullWidth>
                                <Button variant="contained" color="primary" onClick={() => { navigate("/auth/discord/redirect"); }}>
                                    <FontAwesomeIcon icon={faDiscord} />&nbsp;&nbsp;Discord
                                </Button>
                                <Button variant="contained" color="primary" onClick={() => { navigate("/auth/steam/redirect"); }}>
                                    <FontAwesomeIcon icon={faSteam} />&nbsp;&nbsp;Steam
                                </Button>
                            </ButtonGroup>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
            <Dialog open={modalCaptcha} onClose={() => setModalCaptcha(false)}>
                <DialogTitle><FontAwesomeIcon icon={faRobot} />&nbsp;&nbsp;{tr("are_you_a_robot")}</DialogTitle>
                <DialogContent>
                    <HCaptcha
                        theme={themeMode}
                        sitekey="1788882d-3695-4807-abac-7d7166ec6325"
                        onVerify={handleCaptcha}
                    />
                </DialogContent>
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
        </div>
    );
};

export default AuthLogin;