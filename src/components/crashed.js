import { useMemo, useContext } from "react";
import { useTranslation } from "react-i18next";
import { AppContext, ThemeContext } from "../context";

import { Button, useMediaQuery, createTheme, ThemeProvider } from "@mui/material";
import { getDesignTokens } from "../designs";

const Crashed = ({ errorUploaded }) => {
  const { t: tr } = useTranslation();
  const { vtcLogo, vtcBackground, customBackground, webConfig } = useContext(AppContext);
  const { themeSettings } = useContext(ThemeContext);

  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const themeMode = themeSettings.theme === "auto" ? (prefersDarkMode ? "dark" : "light") : themeSettings.theme;
  const muiTheme = { dark: "dark", light: "light", halloween: "dark" };
  const designTokens = getDesignTokens({ vtcBackground, customBackground, webConfig }, {}, themeMode, muiTheme[themeMode], themeSettings.use_custom_theme, themeSettings.theme_background, themeSettings.theme_main, themeSettings.theme_darken_ratio);
  const theme = useMemo(() => createTheme(designTokens, muiTheme[themeMode]), [designTokens, themeMode]);

  useEffect(() => {
    // auto clear cache on crash
    localStorage.removeItem("cache");
    localStorage.removeItem("cache-logo");
    localStorage.removeItem("cache-background");
    localStorage.removeItem("cache-banner");
    localStorage.removeItem("cache-web-config");
    localStorage.removeItem("cache-preload");
    localStorage.removeItem("cache-user");
    localStorage.removeItem("cache-list-param");
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <div className="loading-div" style={theme.palette !== undefined ? { backgroundColor: theme.palette.background.default, color: theme.palette.text.primary } : {}}>
        <img src={vtcLogo} className={`loader`} alt="" />
        <p>{tr("oops_drivers_hub_crashed")}</p>
        <Button variant="contained" color="primary" onClick={() => window.location.reload()}>
          {tr("reload")}
        </Button>
      </div>
    </ThemeProvider>
  );
};

export default Crashed;
