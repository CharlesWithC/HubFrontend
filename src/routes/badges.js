import { useTranslation } from 'react-i18next';
import React from 'react';
import { Grid, Card, CardHeader, CardContent, Typography } from '@mui/material';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClover, faCrown, faEarthAmericas, faScrewdriverWrench } from '@fortawesome/free-solid-svg-icons';

import MarkdownRenderer from '../components/markdown';

const Badges = () => {
    const { t: tr } = useTranslation();

    const badgeData = [
        {
            title: tr("chub_team"),
            icon: faScrewdriverWrench,
            color: '#2fc1f7',
            description:
                tr("badge_chub_team_explained"),
        },
        {
            title: tr("community_legend"),
            icon: faCrown,
            color: '#b2db80',
            description:
                tr("badge_community_legend_explained"),
        },
        {
            title: tr("network_partner"),
            icon: faEarthAmericas,
            color: '#5ae9e1',
            description:
                tr("badge_network_partner_explained"),
        },
        {
            title: tr("supporter"),
            icon: faClover,
            color: '#f47fff',
            description:
                tr("badge_supporter_explained"),
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
                                &nbsp;&nbsp;<b>{tr("chub_badges")}</b>
                            </div>
                        }
                        subheader={
                            <>{tr("these_badges_are_created_by")}<br />{tr("disclaimer_the_badges_are_not")}</>
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