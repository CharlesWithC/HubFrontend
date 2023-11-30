import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { useTheme } from "@emotion/react";
import { Button } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { getDesignTokens } from "../designs";
var vars = require("../variables");
const Crashed = ({ errorUploaded }) => {
    const { t: tr } = useTranslation();
    const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
    const themeMode = vars.userSettings.theme === "auto" ? (prefersDarkMode ? "dark" : "light") : vars.userSettings.theme;
    const muiTheme = {
        dark: "dark",
        light: "light",
        halloween: "dark",
    };
    const designTokens = getDesignTokens(
        themeMode,
        muiTheme[themeMode],
        vars.userSettings.use_custom_theme,
        vars.userSettings.theme_background,
        vars.userSettings.theme_main,
        vars.userSettings.theme_darken_ratio,
    );
    const theme = useMemo(() => createTheme(designTokens, muiTheme[themeMode]), [designTokens, themeMode]);
    return (
        <ThemeProvider theme={theme}>
            <div
                className="loading-div"
                style={
                    theme.palette !== undefined
                        ? {
                              backgroundColor: theme.palette.background.default,
                              color: theme.palette.text.primary,
                          }
                        : {}
                }
            >
                <img src={vars.dhlogo} className={`loader`} alt="" />
                <p>
                    {tr("oops_drivers_hub_crashed")}
                    <br />
                    {tr("please_report_the_error_in")}
                    <a href="https://discord.gg/KRFsymnVKm" target="_blank" rel="noreferrer">
                        {tr("chub_discord_server")}
                    </a>
                    .<br />
                    {tr("include_how_it_was_triggered")}
                </p>
                <Button variant="contained" color="primary" onClick={() => window.location.reload()}>
                    {tr("reload")}
                </Button>
            </div>
        </ThemeProvider>
    );
};
export default Crashed;
