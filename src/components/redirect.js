import React from "react";
import BrowserLogin from "./browserAuth";

class Redirect extends React.Component {
  componentDidMount() {
    const { to, path } = this.props;

    const redirectAttempts = parseInt(sessionStorage.getItem("redirectAttempts") || "0");

    if (redirectAttempts > 2) {
      sessionStorage.removeItem("redirectAttempts");
      window.location.href = "/";
      return;
    }

    sessionStorage.setItem("redirectAttempts", (redirectAttempts + 1).toString());

    if (window.isElectron) {
      window.electron.ipcRenderer.send("browser-auth");
      window.electron.ipcRenderer.send("open-url", "https://" + window.dhhost + path + "?auth_mode=app_login&auth_redirect=http://" + window.location.host + path.replaceAll("/redirect", "/callback"));
    } else {
      window.location.href = to;
    }
  }

  componentWillUnmount() {
    sessionStorage.removeItem("redirectAttempts");
  }

  render() {
    if (window.isElectron) {
      return <BrowserLogin />;
    }
    return null;
  }
}

export default Redirect;
