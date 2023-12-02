import { useTranslation } from 'react-i18next';
import React from 'react';
import { Card, Box, Tabs, Tab } from '@mui/material';

import TileMap from '../components/tilemap';
import { useTheme } from '@emotion/react';

function tabBtnProps(index, current, theme) {
    return {
        id: `map-tab-${index}`,
        'aria-controls': `map-tabpanel-${index}`,
        style: { color: current === index ? theme.palette.info.main : 'inherit' }
    };
}

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`map-tabpanel-${index}`}
            aria-labelledby={`map-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const Map = () => {
    const { t: tr } = useTranslation();
    const [tab, setTab] = React.useState(0);

    const handleChange = (event, newValue) => {
        setTab(newValue);
    };

    const theme = useTheme();

    return <Card>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={tab} onChange={handleChange} aria-label="map tabs" color="info" TabIndicatorProps={{ style: { backgroundColor: theme.palette.info.main } }}>
                <Tab label={tr("ets2_base")} {...tabBtnProps(0, tab, theme)} />
                <Tab label={tr("ets2_promods")} {...tabBtnProps(1, tab, theme)} />
                <Tab label={tr("ats_base")} {...tabBtnProps(2, tab, theme)} />
                <Tab label={tr("ats_promods")} {...tabBtnProps(3, tab, theme)} />
            </Tabs>
        </Box>
        <TabPanel value={tab} index={0}>
            <TileMap tilesUrl={"https://map.charlws.com/ets2/base/tiles"} title={tr("euro_truck_simulator_2_base_map")} />
        </TabPanel>
        <TabPanel value={tab} index={1}>
            <TileMap tilesUrl={"https://map.charlws.com/ets2/promods/tiles"} title={tr("euro_truck_simulator_2_promods_map")} />
        </TabPanel>
        <TabPanel value={tab} index={2}>
            <TileMap tilesUrl={"https://map.charlws.com/ats/base/tiles"} title={tr("american_truck_simulator_base_map")} />
        </TabPanel>
        <TabPanel value={tab} index={3}>
            <TileMap tilesUrl={"https://map.charlws.com/ats/promods/tiles"} title={tr("american_truck_simulator_promods_map")} />
        </TabPanel>
    </Card>;
};

export default Map;