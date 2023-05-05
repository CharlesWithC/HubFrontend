
import { useState } from 'react';

import Loader from '../components/loader';
import TopBar from '../components/topbar';
import SideBar from '../components/sidebar';
var vars = require('../variables');

function Home() {
    const [, setRerender] = useState(false);

    const runRerender = () => {
        setTimeout(function () { setRerender(true); }, 500);
    };

    if (vars.dhconfig == null) {
        return <Loader onLoaderLoaded={runRerender} />;
    } else {
        return <div><TopBar sidebarWidth={260}></TopBar><SideBar width={260}></SideBar></div>;
    }
}

export default Home;