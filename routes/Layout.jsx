import {Outlet} from 'react-router-dom';
import NavBar from '../src/components/NavBar.jsx';

const Layout = () => {

    return (
        <div className="flex flex-col h-screen">
            <NavBar/>
            <div className="flex-1 overflow-hidden">
                <Outlet/>
            </div>
        </div>
    )
}

export default Layout