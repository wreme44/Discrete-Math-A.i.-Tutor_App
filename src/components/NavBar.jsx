import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";

const NavBar = () => {

    const [isOpen, setIsOpen] = useState(false);
    // in case window size below threshhold => side bar converts to burger menu
    useEffect(() => {

        function handleResize() {
            if (window.innerWidth > 700) {
                setIsOpen(false);
            }
        }
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        }
    }, [setIsOpen])

    return (
        <div className="header-bar">
            <header>
                <nav className="header-nav">
                    <Link to="/">
                        <div className="header-home-button">
                            <img className="home-icon" alt="home button" src='/home-icon.png'/>
                        </div>
                    </Link>
                    <Link className="header-home-button" to="/">Discrete Mentor</Link>
                    <Link to="/login">
                        <div className="header-login">
                            Log In
                        </div>

                    </Link>
                </nav>
            </header>
        </div>
    )
}

export default NavBar