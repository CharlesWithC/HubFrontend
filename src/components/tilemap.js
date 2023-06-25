import React, { useEffect, useRef } from 'react';
import { Map, View } from 'ol';
import { Tile } from 'ol/layer';
import { XYZ } from 'ol/source';
import { Feature } from 'ol';
import { LineString } from 'ol/geom';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Typography } from '@mui/material';
import { Projection } from 'ol/proj';
import { Stroke, Style } from 'ol/style';

import { makeRequestsAuto } from '../functions';

function calculateCenterPoint(points) {
    if (points.length === 0) {
        throw new Error('Empty points array');
    }

    let sumX = 0;
    let sumY = 0;

    for (const [x, y] of points) {
        sumX += x;
        sumY += -y;
    }

    const centerX = sumX / points.length;
    const centerY = sumY / points.length;

    return [centerX, centerY];
}

const TileMap = ({ tilesUrl, title, style, route }) => {
    const mapContainerRef = useRef(null);

    useEffect(() => {
        async function doLoad({ tilesUrl, route }) {
            const infoUrl = tilesUrl.replace(/\/tiles$/, "") + "/info/TileMapInfo.json";
            const [mapInfo] = await makeRequestsAuto([
                { url: infoUrl, auth: false },
            ]);

            const tsProjection = new Projection({
                code: 'ZOOMIFY',
                units: 'pixels',
                extent: [
                    mapInfo.x1, -mapInfo.y2, mapInfo.x2, -mapInfo.y1 // x1, -y2, x2, -y1 (reverse y direction)
                ]
            })

            // Create a new OpenLayers map instance
            const map = new Map({
                target: mapContainerRef.current,
                controls: [],
                layers: [
                    // Add a tile layer with the tiled map as the source
                    new Tile({
                        source: new XYZ({
                            url: `${tilesUrl}/{z}/{x}/{y}.png`,
                            wrapX: false,
                            projection: tsProjection,
                        }),
                    }),
                ],
                view: new View({
                    center: route === undefined || route === null || route.length === 0 ? [(mapInfo.x1 + mapInfo.x2) / 2, (mapInfo.y1 + mapInfo.y2) / 2] : calculateCenterPoint(route), // Set the initial center coordinates
                    zoom: 1, // Set the initial zoom level
                    minZoom: mapInfo.minZoom,
                    maxZoom: mapInfo.maxZoom,
                    projection: tsProjection,
                    extent: tsProjection.getExtent(),
                    constrainOnlyCenter: true
                }),
            });

            if (route !== undefined && route !== null && route.length !== 0) {
                const lineStyle = new Style({
                    stroke: new Stroke({
                        color: 'rgba(33, 243, 150, 0.7)',
                        width: 5,
                        shadowColor: 'rgba(0, 0, 0, 0.5)',
                        shadowBlur: 10
                    })
                });

                let features = [];
                for (let i = 1; i < route.length; i++) {
                    const lineFeature = new Feature(
                        new LineString([[route[i - 1][0], -route[i - 1][1]], [route[i][0], -route[i][1]]])
                    );
                    lineFeature.setStyle(lineStyle);
                    features.push(lineFeature);
                }

                const vectorLayer = new VectorLayer({
                    source: new VectorSource({
                        features: features
                    })
                });

                map.addLayer(vectorLayer);
            }

            // Clean up the map instance when the component unmounts
            return () => {
                map.setTarget(null);
            };
        }

        doLoad({ tilesUrl, route });
    }, [tilesUrl, route]);

    return <div style={{ borderRadius: "10px", overflow: "hidden", height: '600px', ...style }}>
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%', background: '#484E66' }}>
            <Typography variant="body2" sx={{ position: "absolute", zIndex: 1, margin: "5px", color: "white" }}>{title}</Typography>
            {route !== undefined && route !== null && route.length === 0 && <div style={{ backgroundColor: "rgb(0,0,0,0.5)", height: "100%", width: "100%" }}></div>}
        </div >
    </div>;
};

export default TileMap;