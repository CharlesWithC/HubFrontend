import { useMemo, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { AppContext, ThemeContext } from '../context';

import { Button, useMediaQuery, createTheme, ThemeProvider } from '@mui/material';
import { getDesignTokens } from '../designs';

var vars = require("../variables");

const Crashed = ({ errorUploaded }) => {
    const { t: tr } = useTranslation();
    const { webConfig } = useCOntext(AppContext);
    const { themeSettings } = useContext(ThemeContext);

    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const themeMode = themeSettings.theme === "auto" ? (prefersDarkMode ? 'dark' : 'light') : themeSettings.theme;
    const muiTheme = { "dark": "dark", "light": "light", "halloween": "dark" };
    const designTokens = getDesignTokens({ webConfig }, {}, themeMode, muiTheme[themeMode], themeSettings.use_custom_theme, themeSettings.theme_background, themeSettings.theme_main, themeSettings.theme_darken_ratio);
    const theme = useMemo(
        () => createTheme(designTokens, muiTheme[themeMode]),
        [designTokens, themeMode],
    );

    return (
        <ThemeProvider theme={theme}>
            <div className="loading-div" style={theme.palette !== undefined ? { backgroundColor: theme.palette.background.default, color: theme.palette.text.primary } : {}}>
                <img src={vars.dhlogo} className={`loader`} alt="" />
                <p>{tr("oops_drivers_hub_crashed")}<br />{tr("please_report_the_error_in")}&nbsp;<a href="https://discord.gg/KRFsymnVKm" target="_blank" rel="noreferrer">{tr("chub_discord_server")}</a>.<br />{tr("include_how_it_was_triggered")}</p>
                <Button variant="contained" color="primary" onClick={() => window.location.reload()}>{tr("reload")}</Button>
            </div>
        </ThemeProvider>
    );
};

export default Crashed;