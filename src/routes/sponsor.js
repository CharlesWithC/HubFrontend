import React from 'react';
import { Grid, Card, CardHeader, CardContent, Typography, List, ListItem, ListItemText, Button } from '@mui/material';

const UpgradeCard = () => {
    const bronze = ["A Special Discord Role", "A Special Thank You"];
    const silver = ["Silver Name", "Custom Color Theme", "More Radio Stations"];
    const gold = ["Gold Name", "Custom Profile Theme", "Custom Profile Banner", "Configurable Display Timezone", "Sponsor Support"];
    const platinum = ["More Name Color", "Any Radio Stations (Radio URL)", "Advanced Staff Functions", "Early Access to all CHub features", "Sponsor Priority Support"];

    return (
        <Grid container spacing={2} justifyContent="center">
            <Grid item xs={12}>
                <Card>
                    <CardHeader
                        title="Become a Sponsor"
                        subheader={<>To support The Drivers Hub Project (CHub)<br />All features are currently unlocked during beta, but you may still support us by sponsoring!</>}
                        titleTypographyProps={{ align: 'center' }}
                        subheaderTypographyProps={{ align: 'center' }}
                    />
                </Card>
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={3}>
                <Card>
                    <CardHeader
                        title="Bronze Sponsor"
                        subheader="Cheapest choice"
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
                        <a href="https://patreon.com/charlws" target="_blank" rel="noreferrer"><Button variant="contained" color="primary" fullWidth>
                            Sponsor
                        </Button></a>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={3}>
                <Card>
                    <CardHeader
                        title="Silver Sponsor"
                        subheader="Including bronze perks"
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
                        <a href="https://patreon.com/charlws" target="_blank" rel="noreferrer"><Button variant="contained" color="primary" fullWidth>
                            Sponsor
                        </Button></a>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={3}>
                <Card>
                    <CardHeader
                        title="Gold Sponsor"
                        subheader="Including silver perks"
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
                        <a href="https://patreon.com/charlws" target="_blank" rel="noreferrer"><Button variant="contained" color="primary" fullWidth>
                            Sponsor
                        </Button></a>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={3}>
                <Card>
                    <CardHeader
                        title="Platinum Sponsor"
                        subheader="Including gold perks"
                        titleTypographyProps={{ align: 'center', color: '#e5e4e2' }}
                        subheaderTypographyProps={{ align: 'center' }}
                    />
                    <CardContent>
                        <List>
                            {platinum.map((feature) => (
                                <ListItem key={feature}>
                                    <ListItemText primary={feature} />
                                </ListItem>
                            ))}
                        </List>
                        <Typography variant="h5" align="center" gutterBottom>
                            $8/mo.
                        </Typography>
                        <a href="https://patreon.com/charlws" target="_blank" rel="noreferrer"><Button variant="contained" color="primary" fullWidth>
                            Sponsor
                        </Button></a>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};

export default UpgradeCard;