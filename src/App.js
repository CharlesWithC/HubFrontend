import './App.css';
import { useMemo, useState } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from "@mui/material/CssBaseline";

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './routes/home';
import Auth from './routes/auth';
import Loader from './components/loader';
import { getDesignTokens } from './designs';

var vars = require('./variables');

function App() {
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const themeMode = prefersDarkMode ? 'dark' : 'light';
    const theme = useMemo(
        () =>
            createTheme(getDesignTokens(themeMode), themeMode),
        [themeMode],
    );

    const [, setRerender] = useState(false);

    const runRerender = () => {
        setTimeout(function () { setRerender(true); }, 500);
    };

    if (vars.dhconfig == null) {
        return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Loader onLoaderLoaded={runRerender} />
        </ThemeProvider>)
        ;
    } else {
        return (
            <BrowserRouter>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/auth" element={<Auth />} />
                    </Routes>
                </ThemeProvider>
            </BrowserRouter>
        );
    }
}

export default App;
