import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Grid, Card, CardHeader, CardContent, Typography, List, ListItem, ListItemText, Button, Tooltip } from "@mui/material";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

const UpgradeCard = () => {
    const { t: tr } = useTranslation();

    const navigate = useNavigate();

    const bronze = [
        "A Special Discord Role",
        "A Special Thank You"
    ];

    const silver = [
        "Silver Name",
        "Custom Color Theme",
        "More Radio Stations"
    ];

    const gold = [
        "Gold Name",
        "Automatic Discord Rank Role",
        "Custom Hub & Profile Theming"
    ];

    const platinum = [
        "Fully Customizable Name Color",
        "Any Radio Stations (via URL)",
        "Advanced Staff Functions"
    ];


    return (
        <Grid container spacing={2} justifyContent="center">
            <Grid size={12}>
                <Card>
                    <CardHeader
                        title={tr("become_a_sponsor")}
                        subheader={
                            <>
                                {tr("fuel_the_journey_power_the_drivers_hub_project_chub")}{" "}
                                <a
                                    style={{ cursor: "pointer" }}
                                    onClick={() => {
                                        navigate("/supporters");
                                    }}>
                                    {tr("explore_our_current_backers")}
                                </a>
                                <br />
                                <a
                                    style={{ cursor: "pointer" }}
                                    onClick={() => {
                                        navigate("/settings");
                                    }}>
                                    Activate exclusive benefits by connecting your CHub Membership account in Settings.
                                </a>
                                <br />
                                <br />
                                Please visit our main website <a href="https://drivershub.charlws.com/sponsor">drivershub.charlws.com</a> to sponsor us!
                            </>
                        }
                        titleTypographyProps={{ align: "center" }}
                        subheaderTypographyProps={{ align: "center" }}
                    />
                </Card>
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    sm: 12,
                    md: 6,
                    lg: 3,
                }}>
                <Card>
                    <CardHeader title={tr("bronze_sponsor")} subheader={tr("cheapest_choice")} titleTypographyProps={{ align: "center", color: "#cd7f32" }} subheaderTypographyProps={{ align: "center" }} />
                    <CardContent>
                        <List sx={{ marginTop: "-32px" }}>
                            {bronze.map(feature => (
                                <ListItem key={feature}>
                                    <ListItemText primary={feature} />
                                </ListItem>
                            ))}
                        </List>
                        <Typography variant="h5" align="center" gutterBottom>
                            CA$2.99/mo
                        </Typography>
                        <Button
                            variant="contained"
                            color="info"
                            fullWidth
                            onClick={() => {
                                window.location.href = "https://drivershub.charlws.com/sponsor";
                            }}>
                            Visit Main Website
                        </Button>
                    </CardContent>
                </Card>
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    sm: 12,
                    md: 6,
                    lg: 3,
                }}>
                <Card>
                    <CardHeader title={tr("silver_sponsor")} subheader={tr("including_bronze_perks")} titleTypographyProps={{ align: "center", color: "#c0c0c0" }} subheaderTypographyProps={{ align: "center" }} />
                    <CardContent>
                        <List sx={{ marginTop: "-32px" }}>
                            {silver.map(feature => (
                                <ListItem key={feature}>
                                    <ListItemText primary={feature} />
                                </ListItem>
                            ))}
                        </List>
                        <Typography variant="h5" align="center" gutterBottom>
                            CA$4.99/mo
                        </Typography>
                        <Button
                            variant="contained"
                            color="info"
                            fullWidth
                            onClick={() => {
                                window.location.href = "https://drivershub.charlws.com/sponsor";
                            }}>
                            Visit Main Website
                        </Button>
                    </CardContent>
                </Card>
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    sm: 12,
                    md: 6,
                    lg: 3,
                }}>
                <Card>
                    <CardHeader title={tr("gold_sponsor")} subheader={tr("including_silver_perks")} titleTypographyProps={{ align: "center", color: "#ffd700" }} subheaderTypographyProps={{ align: "center" }} />
                    <CardContent>
                        <List sx={{ marginTop: "-32px" }}>
                            {gold.map(feature => (
                                <ListItem key={feature} sx={{ color: feature === tr("automatic_discord_rank_role") ? "#ffd700" : undefined }}>
                                    <ListItemText primary={feature} />
                                </ListItem>
                            ))}
                        </List>
                        <Typography variant="h5" align="center" gutterBottom>
                            CA$6.66/mo <span style={{ fontSize: "12px", color: "grey" }}>when billed quarterly</span>
                        </Typography>
                        <Typography variant="h5" align="center" gutterBottom color="grey">
                            Or, CA$7.99 <span style={{ fontSize: "12px" }}>every month</span>
                        </Typography>
                        <Button
                            variant="contained"
                            color="info"
                            fullWidth
                            onClick={() => {
                                window.location.href = "https://drivershub.charlws.com/sponsor";
                            }}>
                            Visit Main Website
                        </Button>
                    </CardContent>
                </Card>
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    sm: 12,
                    md: 6,
                    lg: 3,
                }}>
                <Card>
                    <CardHeader title={tr("platinum_sponsor")} subheader={tr("including_gold_perks")} titleTypographyProps={{ align: "center", color: "#e5e4e2" }} subheaderTypographyProps={{ align: "center" }} />
                    <CardContent>
                        <List sx={{ marginTop: "-32px" }}>
                            {platinum.map(feature => (
                                <>
                                    <ListItem key={feature}>
                                        <ListItemText primary={feature} />
                                        {feature === "Advanced Staff Functions" && (
                                            <Tooltip
                                                title={
                                                    <div>
                                                        • Auto Import Multiple Trucky Jobs<br />
                                                        • Sync Member Profiles<br />
                                                        • Batch Update Tracker<br />
                                                        • Batch Update Roles<br />
                                                        • Batch Dismiss Members<br />
                                                        • Prune Users
                                                    </div>
                                                }
                                                arrow
                                                placement="left"
                                            >
                                                <FontAwesomeIcon icon={faInfoCircle} style={{ marginLeft: '8px', fontSize: '16px' }} />
                                            </Tooltip>
                                        )}
                                    </ListItem>
                                </>
                            ))}
                        </List>
                        <Typography variant="h5" align="center" gutterBottom>
                            CA$9.99/mo <span style={{ fontSize: "12px", color: "grey" }}>when billed quarterly</span>
                        </Typography>
                        <Typography variant="h5" align="center" gutterBottom color="grey">
                            Or, CA$11.99 <span style={{ fontSize: "12px" }}>every month</span>
                        </Typography>
                        <Button
                            variant="contained"
                            color="info"
                            fullWidth
                            onClick={() => {
                                window.location.href = "https://drivershub.charlws.com/sponsor";
                            }}>
                            Visit Main Website
                        </Button>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};

export default UpgradeCard;
