import React from 'react';

import BrowserLogin from './browserAuth';

class Redirect extends React.Component {
    componentDidMount() {
        const { to, path } = this.props;
        if (window.isElectron) {
            window.electron.ipcRenderer.send("browser-auth");
            window.electron.ipcRenderer.send("open-url", "https://" + window.dhhost + path + "?auth_mode=app_login&auth_redirect=http://" + window.location.host + path.replaceAll("/redirect", "/callback"));
        } else {
            window.location.href = to;
        }
    }

    render() {
        if (window.isElectron) {
            return <BrowserLogin />;
        }
        return null;
    }
}

export default Redirect;