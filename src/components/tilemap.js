import React, { useEffect, useRef } from 'react';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import TileImage from 'ol/source/OSM';
import { get as getProjection } from 'ol/proj';
import { Typography } from '@mui/material';

const TileMap = ({ tilesUrl, title, style }) => {
    const mapContainerRef = useRef(null);

    useEffect(() => {
        // Create a new OpenLayers map instance
        const map = new Map({
            target: mapContainerRef.current,
            controls: [],
            layers: [
                // Add a tile layer with the tiled map as the source
                new TileLayer({
                    source: new TileImage({
                        url: `${tilesUrl}/{z}/{x}/{y}.png`,
                        wrapX: false
                    }),
                }),
            ],
            view: new View({
                center: [0, 0], // Set the initial center coordinates
                zoom: 1, // Set the initial zoom level
                minZoom: 0,
                maxZoom: 8,
                extent: getProjection('EPSG:3857').getExtent(),
                constrainOnlyCenter: true
            }),
        });

        // Clean up the map instance when the component unmounts
        return () => {
            map.setTarget(null);
        };
    }, [tilesUrl]);

    return <div style={{ borderRadius: "10px", overflow: "hidden" }}>
        <div ref={mapContainerRef} style={{ width: '100%', height: '600px', background: '#484E66', ...style }}>
            <Typography variant="body2" sx={{ position: "absolute", zIndex: 1, margin: "5px", color: "white" }}>{title}</Typography>
        </div >
    </div>;
};

export default TileMap;