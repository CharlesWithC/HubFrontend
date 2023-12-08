import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './fonts/opensans/opensans.css';
import './fonts/orbitron/orbitron.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import Crashed from "./components/crashed";

import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';

import * as Sentry from "@sentry/react";

window.isElectron = (typeof window !== 'undefined' && typeof window.process === 'object' && window.process.type === 'renderer' || typeof process !== 'undefined' && typeof process.versions === 'object' && !!process.versions.electron || typeof navigator === 'object' && typeof navigator.userAgent === 'string' && navigator.userAgent.indexOf('Electron') >= 0);

var vars = require("./variables");
if (window.isElectron) {
    if (window.host !== undefined) vars.host = window.host;
    // window.host will only be defined when it's a custom build
    // otherwise, an official release will not include window.host
} else {
    vars.host = window.location.host;
}

if (window.location.protocol === 'http:' && window.location.hostname !== 'localhost') {
    window.location.href = window.location.href.replace('http', 'https');
}

if (vars.host !== "localhost:3000") {
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
        if (vars.host !== "localhost:3000") {
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
    <ErrorBoundary>
        <I18nextProvider i18n={i18n}>
            <BrowserRouter><App /></BrowserRouter>
        </I18nextProvider>
    </ErrorBoundary>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();