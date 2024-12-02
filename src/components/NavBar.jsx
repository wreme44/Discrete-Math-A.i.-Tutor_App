import React, {useEffect, useState} from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { supabase } from '../supabaseClient.js';

const NavBar = () => {

    const [userId, setUserId] = useState(() => {
        const savedUserId = sessionStorage.getItem('userId');
        return savedUserId ? JSON.parse(savedUserId) : (null);
    })
    // const [userName, setUserName] = useState(() => {
    //     const savedUserId = sessionStorage.getItem('userId');
    //     return savedUserId ? JSON.parse(savedUserId) : (null);
    // })
    const [isOpen, setIsOpen] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    // const navToGamePage = () => {
    //     navigate('/games');
    // };

    const handleSignOut = async (e) => {
        e.preventDefault();
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error; 
            sessionStorage.clear();
    
            if (location.pathname === '/myProfile') {
                window.location.reload(); 
            } else {
                navigate('/myProfile'); 
                window.location.reload(); 
            }
        } catch (error) {
            console.error("Error signing out:", error.message);
        }
    };


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

    // useEffect(()=> {
    //     setUserId(sessionStorage.getItem('userId'));
    //     const savedName = sessionStorage.getItem('name')
    //     if (savedName){
    //         const fullName = JSON.parse(savedName);
    //         const firstName = fullName.split(' ')[0];
    //         setUserName(firstName)
    //     }
    // }, [])
    return (
        <div className="header-bar">
            <header>
                <nav className="header-nav">
                    <Link to="/">
                        <div className="header-home-button">
                            <img className="home-icon xxxsm:w-[40px] xxsm:w-[50px] xsm:w-[60px] sm:w-[60px] md:w-[60px] lg:w-[60px] xl:w-[60px] 
                                xxxsm:h-[40px] xxsm:h-[45px] xsm:h-[50px] sm:h-[50px] md:h-[50px] lg:h-[50px] xl:h-[50px]" 
                                alt="home button" src='/logo.png' />
                        </div>
                    </Link>
                    <Link to="/">
                        <div className="header-title text-base xxxsm:text-[10px] xxsm:text-[12px] xsm:text-base sm:text-lg md:text-xl lg:text-2xl xl:text-2xl">
                            Discrete Mentor
                        </div>
                    </Link>
                    <div className="header-right">
                        <Link className="header-account xxxsm:text-[6px] xxsm:text-[10px] xsm:text-xs sm:text-sm md:text-base lg:text-lg xl:text-lg" to="/myProfile">My Account</Link>
                        
                        {userId ? (
                            <div className="flex items-center">
                                <p className="xxxsm:text-[6px] xxsm:text-[10px] xsm:text-xs sm:text-sm md:text-base lg:text-lg xl:text-lg text-white">|</p>
                                <a
                                    href="#"
                                    className="header-login xxxsm:text-[6px] xxsm:text-[10px] xsm:text-xs sm:text-sm md:text-base lg:text-lg xl:text-lg focus:outline-none"
                                    onClick={handleSignOut}
                                >
                                    Sign Out
                                </a>
                            </div>
                        ) : (
                            <div className="flex items-center">
                                <p className="xxxsm:text-[6px] xxsm:text-[10px] xsm:text-xs sm:text-sm md:text-base lg:text-lg xl:text-lg">|</p>
                                <Link className="header-login xxxsm:text-[6px] xxsm:text-[10px] xsm:text-xs sm:text-sm md:text-base lg:text-lg xl:text-lg" to="/login">Log In</Link>
                            </div>    
                        )}

                    </div>
                </nav>
            </header>
        </div>
    )
}

export default NavBar