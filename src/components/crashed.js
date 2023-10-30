import { useMemo } from 'react';
import { useTheme } from '@emotion/react';
import { Button } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { getDesignTokens } from '../designs';

var vars = require("../variables");

const Crashed = ({ errorUploaded }) => {
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const themeMode = vars.userSettings.theme === "auto" ? (prefersDarkMode ? 'dark' : 'light') : vars.userSettings.theme;
    const muiTheme = { "dark": "dark", "light": "light", "halloween": "dark" };
    const designTokens = getDesignTokens(themeMode, muiTheme[themeMode], vars.userSettings.use_custom_theme, vars.userSettings.theme_background, vars.userSettings.theme_main, vars.userSettings.theme_darken_ratio);
    const theme = useMemo(
        () => createTheme(designTokens, muiTheme[themeMode]),
        [designTokens, themeMode],
    );

    return (
        <ThemeProvider theme={theme}>
            <div className="loading-div" style={theme.palette !== undefined ? { backgroundColor: theme.palette.background.default, color: theme.palette.text.primary } : {}}>
                <img src={vars.dhlogo} className={`loader`} alt="" />
                <p>
                    Oops, Drivers Hub crashed...<br />
                    The error should have been reported to the CHub Team if not blocked.<br />
                    You may also create a ticket in Discord to report the problem.
                </p>
                <Button variant="contained" color="primary" onClick={() => window.location.reload()}>Reload</Button>
            </div>
        </ThemeProvider>
    );
};

export default Crashed;