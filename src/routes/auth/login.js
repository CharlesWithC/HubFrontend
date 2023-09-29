import { Button, Card, Grid, Typography, TextField, CardContent, ButtonGroup, Box, IconButton } from '@mui/material';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import { faSteam, faDiscord } from '@fortawesome/free-brands-svg-icons';
import { useNavigate } from 'react-router-dom';

var vars = require("../../variables");

const AuthLogin = () => {
    const navigate = useNavigate();

    return (
        <Card sx={{ width: { xs: "100%", sm: "80%", md: "80%", lg: "60%" }, position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            <CardContent sx={{ padding: { xs: "20px", sm: "30px", md: "40px", lg: "40px" }, mb: "20px" }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={12} md={8} lg={8}>
                        <Typography variant="h3" sx={{ fontWeight: 800 }}>Welcome back! <IconButton variant="contained" color="primary" onClick={() => { navigate("/beta/"); }}><FontAwesomeIcon icon={faClose} /></IconButton></Typography>
                        <TextField label="Email" variant="outlined" fullWidth margin="normal" />
                        <TextField label="Password" variant="outlined" fullWidth margin="normal" type="password" />
                        <Typography variant="body2">Forgot your password?</Typography>
                        <br />
                        <ButtonGroup fullWidth>
                            <Button variant="contained" color="primary">
                                Register
                            </Button>
                            <Button variant="contained" color="info">
                                Login
                            </Button>
                        </ButtonGroup>
                    </Grid>

                    <Grid item xs={12} sm={12} md={4} lg={4}>
                        <Box sx={{ display: { xs: "none", sm: "none", md: "block", lg: "block" }, margin: 0, height: "210px", maxHeight: "210px", width: "100%" }} >
                            <img src={`https://cdn.chub.page/assets/${vars.dhconfig.abbr}/banner.png?${vars.dhconfig.banner_key !== undefined ? vars.dhconfig.banner_key : ""}`} alt="Banner" style={{ width: "100%" }} />
                        </Box>
                        <br />
                        <Typography variant="body2" sx={{ mb: "5px" }}>Register or login with:</Typography>
                        <ButtonGroup fullWidth>
                            <Button variant="contained" color="primary" onClick={() => { navigate("/beta/discord-redirect"); }}>
                                <FontAwesomeIcon icon={faDiscord} />&nbsp;&nbsp;Discord
                            </Button>
                            <Button variant="contained" color="primary" onClick={() => { navigate("/beta/steam-redirect"); }}>
                                <FontAwesomeIcon icon={faSteam} />&nbsp;&nbsp;Steam
                            </Button>
                        </ButtonGroup>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default AuthLogin;