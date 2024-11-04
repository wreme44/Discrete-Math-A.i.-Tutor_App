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
                            <img className="home-icon xxxsm:w-[40px] xxsm:w-[50px] xsm:w-[60px] sm:w-[60px] md:w-[60px] lg:w-[60px] xl:w-[60px] 
                                xxxsm:h-[40px] xxsm:h-[45px] xsm:h-[50px] sm:h-[50px] md:h-[50px] lg:h-[50px] xl:h-[50px]" 
                                alt="home button" src='/logo.png'/>
                        </div>
                    </Link>
                    <Link to="/">
                        <div className="header-title text-base xxxsm:text-[10px] xxsm:text-[12px] xsm:text-base sm:text-lg md:text-xl lg:text-2xl xl:text-2xl">
                            Discrete Mentor
                        </div>
                    </Link>
                    <div className="header-right">
                        <Link className="header-account xxxsm:text-[6px] xxsm:text-[10px] xsm:text-xs sm:text-sm md:text-base lg:text-lg xl:text-lg" to="/myProfile">My Account</Link>
                        <p className="xxxsm:text-[6px] xxsm:text-[10px] xsm:text-xs sm:text-sm md:text-base lg:text-lg xl:text-lg">|</p>
                        <Link className="header-login xxxsm:text-[6px] xxsm:text-[10px] xsm:text-xs sm:text-sm md:text-base lg:text-lg xl:text-lg" to="/login">Log In</Link>
                    </div>
                </nav>
            </header>
        </div>
    )
}

export default NavBar