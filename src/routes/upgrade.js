import React from 'react';
import { Grid, Card, CardHeader, CardContent, Typography, List, ListItem, ListItemText, Button } from '@mui/material';

const UpgradeCard = () => {
    const bronze = ["Patron Discord Role", "A special Thank You on our website"];
    const silver = ["Silver Name", "Customizable Theme", "View Detailed Statistics"];
    const gold = ["Gold Name", "Customizable Background Image", "Access to more Radio Stations", "Export Delivery Route", "Patron Support"];
    const platinum = ["More choices on name color", "Access to ANY Radio Stations (customizable URL)", "Advanced Staff Functions", "Early Access to all CHub features", "Patron Priority Support"];

    return (
        <Grid container spacing={2} justifyContent="center">
            <Grid item xs={12} sm={12} md={6} lg={3}>
                <Card>
                    <CardHeader
                        title="Bronze Patreon"
                        subheader="Cheapest choice"
                        titleTypographyProps={{ align: 'center' }}
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
                            Subscribe
                        </Button></a>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={3}>
                <Card>
                    <CardHeader
                        title="Silver Patreon"
                        subheader="Including Bronze Perks"
                        titleTypographyProps={{ align: 'center' }}
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
                            Subscribe
                        </Button></a>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={3}>
                <Card>
                    <CardHeader
                        title="Gold Patreon"
                        subheader="Including Silver Perks"
                        titleTypographyProps={{ align: 'center' }}
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
                            Subscribe
                        </Button></a>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={3}>
                <Card>
                    <CardHeader
                        title="Platinum Patreon"
                        subheader="Including Gold Perks"
                        titleTypographyProps={{ align: 'center' }}
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
                            Subscribe
                        </Button></a>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};

export default UpgradeCard;