import './App.css';
import { useMemo, useState } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from "@mui/material/CssBaseline";

import { getDesignTokens } from './designs';
import Loader from './components/loader';
import TopBar from './components/topbar';
import SideBar from './components/sidebar';
var vars = require('./variables');

function App() {
    const [, setRerender] = useState(false);

    const runRerender = () => {
        setTimeout(function () { setRerender(true); }, 500);
    };

    let ret = undefined;

    if (vars.dhconfig == null) {
        ret = <Loader onLoaderLoaded={runRerender} />;
    } else {
        ret = <div><TopBar sidebarWidth={260}></TopBar><SideBar width={260}></SideBar></div>;
    }

    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const themeMode = prefersDarkMode ? 'dark' : 'light';
    const theme = useMemo(
        () =>
            createTheme(getDesignTokens(themeMode), themeMode),
        [themeMode],
    );

    return (<ThemeProvider theme={theme}><CssBaseline />{ret}</ThemeProvider>);
}

export default App;
