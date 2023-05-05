import './App.css';
import { useMemo } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from "@mui/material/CssBaseline";

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './routes/home';

import { getDesignTokens } from './designs';

function App() {
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const themeMode = prefersDarkMode ? 'dark' : 'light';
    const theme = useMemo(
        () =>
            createTheme(getDesignTokens(themeMode), themeMode),
        [themeMode],
    );

    return (
        <BrowserRouter>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Routes>
                    <Route path="/" element={<Home />} />
                </Routes>
            </ThemeProvider>
        </BrowserRouter>
    );
}

export default App;
