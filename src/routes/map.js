import React from 'react';
import PropTypes from 'prop-types';
import { Card, Box, Tabs, Tab } from '@mui/material';

import TileMap from '../components/tilemap';

function a11yProps(index) {
    return {
        id: `map-tab-${index}`,
        'aria-controls': `map-tabpanel-${index}`,
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

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

const Map = () => {
    const [tab, setTab] = React.useState(0);

    const handleChange = (event, newValue) => {
        setTab(newValue);
    };

    return <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tab} onChange={handleChange} aria-label="map tabs" textColor="info">
                <Tab label="ETS2 (Base)" {...a11yProps(0)} />
                <Tab label="ETS2 (ProMods)" {...a11yProps(1)} />
                <Tab label="ATS (Base)" {...a11yProps(2)} />
                <Tab label="ATS (ProMods)" {...a11yProps(2)} />
            </Tabs>
        </Box>
        <TabPanel value={tab} index={0}>
            <TileMap tilesUrl={"https://map.charlws.com/ets2/base/tiles"} title={"Euro Truck Simulator 2 - Base Map"} />
        </TabPanel>
        <TabPanel value={tab} index={1}>
            <TileMap tilesUrl={"https://map.charlws.com/ets2/promods/tiles"} title={"Euro Truck Simulator 2 - ProMods Map"} />
        </TabPanel>
        <TabPanel value={tab} index={2}>
            <TileMap tilesUrl={"https://map.charlws.com/ats/base/tiles"} title={"American Truck Simulator - Base Map"} />
        </TabPanel>
        <TabPanel value={tab} index={3}>
            <TileMap tilesUrl={"https://map.charlws.com/ats/promods/tiles"} title={"American Truck Simulator - ProMods Map"} />
        </TabPanel>
    </Card>
};

export default Map;