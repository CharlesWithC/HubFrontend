import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import './index.css';
import './fonts/opensans/opensans.css';
import './fonts/orbitron/orbitron.css';

import App from './App';
import { AppContextProvider, CacheContextProvider, ThemeContextProvider } from './context';
import reportWebVitals from './reportWebVitals';

import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';

import Crashed from "./components/crashed";
import { setAuthMode } from './functions';

import * as Sentry from "@sentry/react";

window.loading = 0;

window.isElectron = (typeof window !== 'undefined' && typeof window.process === 'object' && window.process.type === 'renderer' || typeof process !== 'undefined' && typeof process.versions === 'object' && !!process.versions.electron || typeof navigator === 'object' && typeof navigator.userAgent === 'string' && navigator.userAgent.indexOf('Electron') >= 0);

if (window.isElectron) {
    if (window.host !== undefined) window.dhhost = window.host;
    // window.host will only be defined when it's a custom build
    // otherwise, an official release will not include window.host
    window.dhhost = localStorage.getItem("domain");
    if (window.dhhost === null) vwindow.dhhost = "";
} else {
    window.dhhost = window.location.host;
    if (window.location.hostname === "localhost") window.dhhost = localStorage.getItem("domain");
}

const searchParams = new URLSearchParams(window.location.search);
if (!window.isElectron && window.location.hostname === "localhost" && searchParams.get("domain") !== null) {
    localStorage.setItem("domain", searchParams.get("domain"));
    window.dhhost = searchParams.get("domain");
}

if (searchParams.get("auth_mode") !== null && searchParams.get("auth_redirect") !== null) {
    setAuthMode(searchParams.get("auth_mode"), searchParams.get("auth_redirect"));
}

if (window.location.protocol === 'http:' && window.location.hostname !== 'localhost') {
    window.location.href = window.location.href.replace('http', 'https');
}

if (window.isElectron || window.location.hostname !== "localhost") {
    Sentry.init({
        dsn: "https://0a444a46a3cc99853e971ac04d7f8b3a@o4504067357409280.ingest.sentry.io/4505984184745984",
        integrations: [
            new Sentry.BrowserTracing({}),
            new Sentry.Replay(),
        ],
        // Performance Monitoring
        tracesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!
        // Session Replay
        replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
        replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
    });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        if (window.dhhost !== "localhost:3000") {
            Sentry.withScope(scope => {
                scope.setExtras(errorInfo);
                Sentry.captureException(error);
            });
        }
    }

    render() {
        if (this.state.hasError) {
            return <I18nextProvider i18n={i18n}><Crashed /></I18nextProvider>;
        }
        return this.props.children;
    }
}
root.render(
    <AppContextProvider>
        <ThemeContextProvider>
            <CacheContextProvider>
                <I18nextProvider i18n={i18n}>
                    {(window.isElectron || window.location.hostname !== "localhost") &&
                        <ErrorBoundary>
                            <BrowserRouter><App /></BrowserRouter>
                        </ErrorBoundary>
                    }
                    {(!window.isElectron && window.location.hostname === "localhost") &&
                        <BrowserRouter><App /></BrowserRouter>
                    }
                </I18nextProvider>
            </CacheContextProvider>
        </ThemeContextProvider>
    </AppContextProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();