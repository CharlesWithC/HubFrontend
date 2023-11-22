import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Button, Card, Grid, Typography, TextField, CardContent, ButtonGroup, Box, IconButton, Dialog, DialogTitle, DialogContent, Snackbar, Alert, useTheme } from '@mui/material';
import { Portal } from '@mui/base';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose, faRobot } from '@fortawesome/free-solid-svg-icons';
import { faSteam, faDiscord } from '@fortawesome/free-brands-svg-icons';
import HCaptcha from '@hcaptcha/react-hcaptcha';

import { customAxios as axios } from '../../functions';

var vars = require("../../variables");

const AuthLogin = () => {
    const navigate = useNavigate();
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const themeMode = vars.userSettings.theme === "auto" ? (prefersDarkMode ? 'dark' : 'light') : vars.userSettings.theme;
    const theme = useTheme();

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
            setSnackbarContent("Invalid Email");
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
            setSnackbarContent("Logging in...");
            setSnackbarSeverity("info");

            let resp = await axios({ url: `${vars.dhpath}/auth/password`, data: { email: email, password: password, "captcha-response": token }, method: "POST" });
            if (resp.status === 200) {
                if (resp.data.mfa) {
                    setSnackbarContent("Success! Redirecting to Multiple Factor Authentication...");
                    setSnackbarSeverity("success");
                    setTimeout(function () { navigate(`/auth/mfa?token=${resp.data.token}`); }, 3000);
                } else {
                    setSnackbarContent("Success! Please wait...");
                    setSnackbarSeverity("success");
                    setTimeout(function () { navigate(`/auth?token=${resp.data.token}`); }, 3000);
                }
            } else {
                setSnackbarContent(resp.data.error);
                setSnackbarSeverity("error");
            }
        } else if (action === "register") {
            let resp = await axios({ url: `${vars.dhpath}/auth/register`, data: { email: email, password: password, "captcha-response": token }, method: "POST" });
            if (resp.status === 200) {
                setSnackbarContent("Success! Account registered! Check your email for confirmation link before the account get closed automatically!");
                setSnackbarSeverity("success");
                setTimeout(function () { navigate(`/auth?token=${resp.data.token}`); }, 3000);
            } else {
                setSnackbarContent(resp.data.error);
                setSnackbarSeverity("error");
            }
        } else if (action === "reset-password") {
            let resp = await axios({ url: `${vars.dhpath}/auth/reset`, data: { email: email, "captcha-response": token }, method: "POST" });
            if (resp.status === 204) {
                setSnackbarContent("We have sent a password reset link if the email is associated with a user.");
                setSnackbarSeverity("success");
            } else {
                setSnackbarContent(resp.data.error);
                setSnackbarSeverity("error");
            }
        }

        setAuthDisabled(false);
    }, [action, email, password]);

    return (
        <div style={{
            backgroundImage: `url(${vars.dhbgimage})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
        }}>
            <Card sx={{ width: { xs: "100%", sm: "80%", md: "80%", lg: "60%" }, backgroundColor: vars.dhbgimage === "" ? theme.palette.primary.main : theme.palette.primary.main + "cc", position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                <CardContent sx={{ padding: { xs: "20px", sm: "30px", md: "40px", lg: "40px" }, mb: "20px" }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={12} md={8} lg={8}>
                            <Typography variant="h3" sx={{ fontWeight: 800 }}>Welcome back! <IconButton variant="contained" color="primary" onClick={() => { navigate("/"); }}><FontAwesomeIcon icon={faClose} /></IconButton></Typography>
                            <TextField label="Email" variant="outlined" fullWidth margin="normal" value={email} onChange={(e) => { setEmail(e.target.value); }} />
                            <TextField label="Password" variant="outlined" fullWidth margin="normal" type="password" value={password} onChange={(e) => { setPassword(e.target.value); }} />
                            <Typography variant="body2" onClick={() => { if (validateEP()) { setAction("reset-password"); setModalCaptcha(true); } }} sx={{ cursor: "pointer", width: "fit-content" }}>Forgot your password?</Typography>
                            <br />
                            <ButtonGroup fullWidth>
                                <Button variant="contained" color="primary" disabled={authDisabled} onClick={() => { if (validateEP()) { setAction("register"); setModalCaptcha(true); } }}>
                                    Register
                                </Button>
                                <Button variant="contained" color="info" disabled={authDisabled} onClick={() => { if (validateEP()) { setAction("login"); setModalCaptcha(true); } }}>
                                    Login
                                </Button>
                            </ButtonGroup>
                        </Grid>

                        <Grid item xs={12} sm={12} md={4} lg={4}>
                            <Box sx={{ display: { xs: "none", sm: "none", md: "block", lg: "block" }, margin: 0, height: "210px", maxHeight: "210px", width: "100%" }} >
                                <img src={`https://cdn.chub.page/assets/${vars.dhconfig.abbr}/banner.png?${vars.dhconfig.banner_key !== undefined ? vars.dhconfig.banner_key : ""}`} alt="" style={{ width: "100%" }} />
                            </Box>
                            <br />
                            <Typography variant="body2" sx={{ mb: "5px" }}>Register or login with:</Typography>
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
                <DialogTitle><FontAwesomeIcon icon={faRobot} />&nbsp;&nbsp;Are you a robot?</DialogTitle>
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