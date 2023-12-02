import { useTranslation } from 'react-i18next';
import React from 'react';
import { Grid, Card, CardHeader, CardContent, Typography, List, ListItem, ListItemText, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const UpgradeCard = () => {
    const { t: tr } = useTranslation();
    
    const bronze = [tr("a_special_discord_role"), tr("a_special_thank_you")];
    const silver = [tr("silver_name"), tr("custom_color_theme"), tr("more_radio_stations")];
    const gold = [tr("gold_name"), tr("custom_background_image"), tr("custom_profile_theme"), tr("custom_profile_banner"), tr("configurable_display_timezone"), tr("sponsor_support")];
    const platinum = [tr("more_name_color"), tr("any_radio_stations_radio_url"), tr("advanced_staff_functions"), tr("early_access_to_all_chub_features"), tr("sponsor_priority_support")];

    const navigate = useNavigate();

    return (
        <Grid container spacing={2} justifyContent="center">
            <Grid item xs={12}>
                <Card>
                    <CardHeader
                        title={tr("become_a_sponsor")}
                        subheader={<>{tr("fuel_the_journey_power_the_drivers_hub_project_chub")}<a style={{ cursor: "pointer" }} onClick={() => { navigate("/supporters"); }}>{tr("explore_our_current_backers")}</a><br /><a style={{ cursor: "pointer" }} onClick={() => { navigate("/settings"); }}>{tr("activate_exclusive_benefits_by_connecting_your_patreon_account_in_settings")}</a></>}
                        titleTypographyProps={{ align: 'center' }}
                        subheaderTypographyProps={{ align: 'center' }}
                    />
                </Card>
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={3}>
                <Card>
                    <CardHeader
                        title={tr("bronze_sponsor")}
                        subheader={tr("cheapest_choice")}
                        titleTypographyProps={{ align: 'center', color: '#cd7f32' }}
                        subheaderTypographyProps={{ align: 'center' }}
                    />
                    <CardContent>
                        <List>
                            {bronze.map((feature) => (
                                <ListItem key={feature}>
                                    <ListItemText primary={feature} />
                                </ListItem>
                            ))}
                        </List>
                        <Typography variant="h5" align="center" gutterBottom>
                            $1/mo.
                        </Typography>
                        <a href="https://www.patreon.com/checkout/charlws?rid=9973080" target="_blank" rel="noreferrer"><Button variant="contained" color="primary" fullWidth>{tr("sponsor")}</Button></a>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={3}>
                <Card>
                    <CardHeader
                        title={tr("silver_sponsor")}
                        subheader={tr("including_bronze_perks")}
                        titleTypographyProps={{ align: 'center', color: '#c0c0c0' }}
                        subheaderTypographyProps={{ align: 'center' }}
                    />
                    <CardContent>
                        <List>
                            {silver.map((feature) => (
                                <ListItem key={feature}>
                                    <ListItemText primary={feature} />
                                </ListItem>
                            ))}
                        </List>
                        <Typography variant="h5" align="center" gutterBottom>
                            $3/mo.
                        </Typography>
                        <a href="https://www.patreon.com/checkout/charlws?rid=9360617" target="_blank" rel="noreferrer"><Button variant="contained" color="primary" fullWidth>{tr("sponsor")}</Button></a>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={3}>
                <Card>
                    <CardHeader
                        title={tr("gold_sponsor")}
                        subheader={tr("including_silver_perks")}
                        titleTypographyProps={{ align: 'center', color: '#ffd700' }}
                        subheaderTypographyProps={{ align: 'center' }}
                    />
                    <CardContent>
                        <List>
                            {gold.map((feature) => (
                                <ListItem key={feature}>
                                    <ListItemText primary={feature} />
                                </ListItem>
                            ))}
                        </List>
                        <Typography variant="h5" align="center" gutterBottom>
                            $5/mo.
                        </Typography>
                        <a href="https://www.patreon.com/checkout/charlws?rid=9973090" target="_blank" rel="noreferrer"><Button variant="contained" color="primary" fullWidth>{tr("sponsor")}</Button></a>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={3}>
                <Card>
                    <CardHeader
                        title={tr("platinum_sponsor")}
                        subheader={tr("including_gold_perks")}
                        titleTypographyProps={{ align: 'center', color: '#e5e4e2' }}
                        subheaderTypographyProps={{ align: 'center' }}
                    />
                    <CardContent>
                        <List>
                            {platinum.map((feature) => (
                                <>
                                    {feature !== tr("advanced_staff_functions") && <ListItem key={feature}>
                                        <ListItemText primary={feature} />
                                    </ListItem>}
                                    {feature === tr("advanced_staff_functions") &&
                                        <>
                                            <ListItem key={feature} style={{ paddingBottom: 0 }}>
                                                <ListItemText primary={feature} />
                                            </ListItem>
                                            <List style={{ marginLeft: '20px', paddingTop: 0 }}>
                                                <ListItem style={{ paddingTop: 0, paddingBottom: 0 }}>
                                                    <ListItemText primary={tr("auto_import_multiple_trucky_jobs")} />
                                                </ListItem>
                                                <ListItem style={{ paddingTop: 0, paddingBottom: 0 }}>
                                                    <ListItemText primary={tr("sync_member_profiles")} />
                                                </ListItem>
                                                <ListItem style={{ paddingTop: 0, paddingBottom: 0 }}>
                                                    <ListItemText primary={tr("batch_update_tracker")} />
                                                </ListItem>
                                                <ListItem style={{ paddingTop: 0, paddingBottom: 0 }}>
                                                    <ListItemText primary={tr("batch_update_roles")} />
                                                </ListItem>
                                                <ListItem style={{ paddingTop: 0, paddingBottom: 0 }}>
                                                    <ListItemText primary={tr("batch_dismiss_members")} />
                                                </ListItem>
                                                <ListItem style={{ paddingTop: 0, paddingBottom: 0 }}>
                                                    <ListItemText primary={tr("prune_users")} />
                                                </ListItem>
                                            </List>
                                        </>
                                    }
                                </>
                            ))}
                        </List>
                        <Typography variant="h5" align="center" gutterBottom>
                            $8/mo.
                        </Typography>
                        <a href="https://www.patreon.com/checkout/charlws?rid=9973097" target="_blank" rel="noreferrer"><Button variant="contained" color="primary" fullWidth>{tr("sponsor")}</Button></a>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};

export default UpgradeCard;