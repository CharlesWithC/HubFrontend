
import { loadConfig } from '../functions/config';
import { useState, useEffect } from 'react';
var vars = require('../variables');

function Loader({onLoaderLoaded}) {
    const [loadMessage, setLoadMessage] = useState("Locating Drivers Hub...");

    useEffect(() => {
        async function fetchConfig() {
            let loadedConfig = (await loadConfig("hub.atmvtc.com"));
            vars.dhconfig = loadedConfig.config;
            vars.dhapplication = loadedConfig.application;
            vars.dhstyle = loadedConfig.style;

            setLoadMessage(`Teleporting to ${vars.dhconfig.name}...`);

            onLoaderLoaded();
        }
        fetchConfig();
    }, [onLoaderLoaded]);

    return (
        <div className="loading-div">
            <img src={process.env.PUBLIC_URL + '/logo.png'} className="loader" alt="CHub Logo" />
            <p>
                {loadMessage}
            </p>
        </div>
    );
}

export default Loader;