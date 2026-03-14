import "./init";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./index.css";
import "./fonts/opensans/opensans.css";
import "./fonts/orbitron/orbitron.css";

import App from "./App";
import { AppContextProvider, CacheContextProvider, ThemeContextProvider } from "./context";

import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";

import Crashed from "./components/crashed";
import { setAuthMode } from "./functions";

window.loading = 0;

window.isElectron = (typeof window !== "undefined" && typeof window.process === "object" && window.process.type === "renderer") || (typeof process !== "undefined" && typeof process.versions === "object" && !!process.versions.electron) || (typeof navigator === "object" && typeof navigator.userAgent === "string" && navigator.userAgent.indexOf("Electron") >= 0);

if (window.isElectron) {
    if (window.host !== undefined) window.dhhost = window.host;
    // window.host will only be defined when it's a custom build
    // otherwise, an official release will not include window.host
    window.dhhost = localStorage.getItem("domain");
} else {
    window.dhhost = window.location.host;
    if (window.location.hostname === "localhost") window.dhhost = localStorage.getItem("domain");
}
if (window.dhhost === null) window.dhhost = "";

const searchParams = new URLSearchParams(window.location.search);
if (!window.isElectron && window.location.hostname === "localhost" && searchParams.get("domain") !== null) {
    localStorage.setItem("domain", searchParams.get("domain"));
    window.dhhost = searchParams.get("domain");
}

if (searchParams.get("auth_mode") !== null && searchParams.get("auth_redirect") !== null) {
    setAuthMode(searchParams.get("auth_mode"), searchParams.get("auth_redirect"));
}

if (window.location.protocol === "http:" && window.location.hostname !== "localhost") {
    window.location.href = window.location.href.replace("http", "https");
}

const root = ReactDOM.createRoot(document.getElementById("root"));
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    render() {
        if (this.state.hasError) {
            return (
                <I18nextProvider i18n={i18n}>
                    <Crashed />
                </I18nextProvider>
            );
        }
        return this.props.children;
    }
}
root.render(
    <AppContextProvider>
        <ThemeContextProvider>
            <CacheContextProvider>
                <I18nextProvider i18n={i18n}>
                    {(window.isElectron || window.location.hostname !== "localhost") && (
                        <ErrorBoundary>
                            <BrowserRouter>
                                <App />
                            </BrowserRouter>
                        </ErrorBoundary>
                    )}
                    {!window.isElectron && window.location.hostname === "localhost" && (
                        <BrowserRouter>
                            <App />
                        </BrowserRouter>
                    )}
                </I18nextProvider>
            </CacheContextProvider>
        </ThemeContextProvider>
    </AppContextProvider>
);
