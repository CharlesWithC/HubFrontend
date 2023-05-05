import TopBar from '../components/topbar';
import SideBar from '../components/sidebar';

function Home() {
    return <div><TopBar sidebarWidth={260}></TopBar><SideBar width={260}></SideBar></div>;
}

export default Home;