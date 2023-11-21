import React from 'react';
import { Grid, Card, CardHeader, CardContent, Typography } from '@mui/material';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClover, faCrown, faEarthAmericas, faScrewdriverWrench } from '@fortawesome/free-solid-svg-icons';

import MarkdownRenderer from '../components/markdown';

const Badges = () => {
    const badgeData = [
        {
            title: 'CHub Team',
            icon: faScrewdriverWrench,
            color: '#2fc1f7',
            description:
                'The most mysterious badge! Users with this badge are team members of The Drivers Hub Project (CHub). The project that powers the website you are currently viewing.\nLearn more about the project at [drivershub.charlws.com](https://drivershub.charlws.com).',
        },
        {
            title: 'Community Legend',
            icon: faCrown,
            color: '#b2db80',
            description:
                'The hardest badge to get! Community Legends are individuals who have contributed extensively to the TruckSim community. They could be leaders of large VTCs, managers of reputable projects, or other legendary and respected people.',
        },
        {
            title: 'Network Partner',
            icon: faEarthAmericas,
            color: '#5ae9e1',
            description:
                'Providers of servers serving the .html file, loaded when you open the Drivers Hub. They help reduce the load on the main server, making the website more stable and accessible to users from different regions.\nIf you are interested, reach out to us by creating a ticket in [Discord](https://discord.gg/KRFsymnVKm).',
        },
        {
            title: 'Supporter',
            icon: faClover,
            color: '#f47fff',
            description:
                'Supporters play a crucial role in sustaining The Drivers Hub Project (CHub). They can be sponsors on Patreon, server boosters in Discord, or beta testers providing valuable feedback during project development.\nIf you are interested in becoming a sponsor, visit [charl.ws/patreon](https://charl.ws/patreon).',
        },
    ];

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Card>
                    <CardHeader
                        title={
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <img
                                    src="https://cdn.chub.page/assets/logo.png"
                                    alt=""
                                    width="24px"
                                    height="24px"
                                    style={{ marginTop: "2px" }}
                                />
                                &nbsp;&nbsp;<b>CHub Badges</b>
                            </div>
                        }
                        subheader={
                            <>
                                These badges are created by CHub to distinguish those who are
                                special :)
                                <br />
                                Disclaimer: The badges are not linked with certain VTCs and are not
                                managed by them.
                            </>
                        }
                        titleTypographyProps={{ align: 'center' }}
                        subheaderTypographyProps={{ align: 'center' }}
                    />
                </Card>
            </Grid>
            {badgeData.map((badge) => (
                <Grid item key={badge.title} xs={12} sm={12} md={6} lg={6}>
                    <Card>
                        <CardContent>
                            <Typography
                                variant="h5"
                                sx={{ flexGrow: 1, fontWeight: 'bold', mb: '10px' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <FontAwesomeIcon icon={badge.icon} style={{ color: badge.color }} />
                                    &nbsp;&nbsp;{badge.title}
                                </div>
                            </Typography>
                            <Typography variant="body1">
                                <MarkdownRenderer>{badge.description}</MarkdownRenderer>
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};

export default Badges;