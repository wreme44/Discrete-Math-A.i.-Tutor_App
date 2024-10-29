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
                            <img className="home-icon" alt="home button" src='/logo.png'/>
                        </div>
                    </Link>
                    <Link to="/">
                        <div className="header-title text-base sm:text-lg md:text-xl lg:text-2xl xl:text-2xl">
                            Discrete Mentor
                        </div>
                    </Link>
                    <div className="header-right">
                        <Link className="header-account xsm:text-xs sm:text-sm md:text-base lg:text-lg xl:text-lg" to="/myProfile">My Account</Link>
                        <p className="xsm:text-xs sm:text-sm md:text-base lg:text-lg xl:text-lg">|</p>
                        <Link className="header-login xsm:text-xs sm:text-sm md:text-base lg:text-lg xl:text-lg" to="/login">Log In</Link>
                    </div>
                </nav>
            </header>
        </div>
    )
}

export default NavBar