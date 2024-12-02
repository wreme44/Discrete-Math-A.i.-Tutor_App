import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Modal from 'react-modal';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
    const [notification, setNotification] = useState('');
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetNotification, setResetNotification] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogin = async (email, password) => {
        setNotification('');
        if (!email || !password) {
            return;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setNotification(`Error logging in: ${error.message}`);
            console.error(error);
        } else if (data) {
            navigate('/myProfile');
            setTimeout(() => {
                window.location.reload();
            }, 200); 
        }
    }

    const handlePasswordReset = async () => {
        setResetNotification('');
        if (!resetEmail) {
            setResetNotification('Please enter a valid email address');
            return;
        }

        const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
            redirectTo: `${window.location.origin}/reset-password`
        });

        if (error) {
            setResetNotification(`Error sending reset email: ${error.message}`);
            console.error(error);
        } else {
            setResetNotification('Password reset link sent! Please check your email.');
        }
    }

    useEffect(() => {
        // Add class to body
        document.body.classList.add('loginBody');

        return () => {
            // Remove class when leaving the page
            document.body.classList.remove('loginBody');
        };
    }, []);

    return (
        <div className="body-login mb-[150px]
        xxxsm:mt-[100px] xxsm:mt-[125px] xsm:mt-[150px] sm:mt-[175px] md:mt-[200px] lg:mt-[200px] xl:mt-[200px]">
            <div className="login-page">
                <div className="login-container w-full xxxsm:w-[180px] xxsm:w-[220px] xsm:w-[300px] sm:w-[350px] md:w-[350px] lg:w-[400px] xl:w-[400px] 
                            h-auto xxxsm:h-[160px] xxsm:h-[180px] xsm:h-[200px] sm:h-[250px] md:h-[250px] lg:h-[300px] xl:h-[300px]">
                    <h5 className="login-title xxxsm:text-[12px] xxsm:text-[16px] xsm:text-[18px] sm:text-[26px] md:text-[26px] lg:text-[30px] xl:text-[30px]
                            xxxsm:mb-[6px] xxsm:mb-[6px] xsm:mb-[10px] sm:mb-[20px] md:mb-[20px] lg:mb-[20px] xl:mb-[20px]">Login</h5>
                    <form onSubmit={(e) => { e.preventDefault(); handleLogin(email, password) }}>
                        <div className="email">
                            <input
                                className="login-input-field w-full xxxsm:h-[25px] xxsm:h-[30px] xsm:h-[35px] sm:h-[46px] md:h-[46px] lg:h-[46px] xl:h-[46px] 
                        p-2 rounded-md border border-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                                type="email"
                                placeholder="Email"
                                onChange={(e) => setEmail(e.target.value)}
                                required />
                        </div>
                        <div className="password relative">
                            <input
                                className="login-input-field w-full xxxsm:h-[25px] xxsm:h-[30px] xsm:h-[35px] sm:h-[46px] md:h-[46px] lg:h-[46px] xl:h-[46px] 
                        p-2 rounded-md border border-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                onChange={(e) => setPassword(e.target.value)}
                                required />
                            <button
                                type="button"
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-blue-500 hover:text-blue-700 focus:outline-none"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword
                                    ? <img className='xxxsm:w-[9px] xxsm:w-[10px] xsm:w-[12px] sm:w-[14px] md:w-[16px] lg:w-[16px] xl:w-[16px]'
                                        alt='show' src='./hide-password.svg' />
                                    : <img className='xxxsm:w-[9px] xxsm:w-[10px] xsm:w-[12px] sm:w-[14px] md:w-[16px] lg:w-[16px] xl:w-[16px]'
                                        alt='show' src='./show-password.svg' />}
                            </button>
                        </div>
                        <button className="login-button w-full xxxsm:w-[50px] xxsm:w-[60px] xsm:w-[70px] sm:w-[80px] md:w-[80px] lg:w-[90px] xl:w-[90px] 
                                    h-auto xxxsm:h-[22px] xxsm:h-[25px] xsm:h-[30px] sm:h-[38px] md:h-[38px] lg:h-[42px] xl:h-[42px]
                                    xxxsm:mt-[35px] xxsm:mt-[35px] xsm:mt-[32px] sm:mt-[32px] md:mt-[32px] lg:mt-[70px] xl:mt-[70px]" type="submit">
                            <div className="flex items-center justify-center">
                                <img className="xxxsm:w-[9px] xxsm:w-[10px] xsm:w-3 sm:w-4 md:w-4 lg:w-5 xl:w-5 mr-2 -ml-2 " alt="Submit" src="/log-in.svg" />
                                <span className="ml-0 -mr-1 xxxsm:text-[10px] xxsm:text-[12px] xsm:text-[14px] sm:text-[14px] md:text-[14px] lg:text-[16px] xl:text-[16px]">Login</span>
                            </div>
                        </button>
                        <p className="xxxsm:text-[9px] xxsm:text-[11px] xsm:text-[12px] sm:text-[14px] md:text-[14px] lg:text-[16px]">Don't have an Account?<Link className="link-to-login-signup" to="/signup"> Sign Up</Link></p>
                    </form>
                    {notification && <p className="login-notification xxxsm:text-[8px] xxsm:text-[9px] xsm:text-[10px] sm:text-[12px] md:text-[16px] lg:text-[16px]">{notification}</p>}

                    <button
                        className="reset-password-link mt-1 text-sm outline-none ring-0 focus:outline-none focus:ring-0 border-1 hover:border-[#c0c0c000] hover:text-[#bcd8ffce] hover:ring-0
                    xxxsm:text-[9px] xxsm:text-[11px] xsm:text-[12px] sm:text-[12px] md:text-[14px] lg:text-[14px]"
                        style={{ outline: 'none', boxShadow: 'none' }}
                        onClick={() => setIsResetModalOpen(true)}
                    >
                        Forgot Password?
                    </button>
                </div>
                <Modal
                    isOpen={isResetModalOpen}
                    onRequestClose={() => setIsResetModalOpen(false)}
                    contentLabel="Reset Password"
                    style={{
                        content: {
                            top: '50%',
                            left: '50%',
                            right: 'auto',
                            bottom: 'auto',
                            transform: 'translate(-50%, -50%)',
                            background: 'rgba(3, 78, 144, 0.95)',
                            borderRadius: '10px',
                            padding: '20px',
                            maxWidth: '400px',
                            width: '90%',
                        },
                        overlay: {
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        }
                    }}
                >
                    <h2 className="text-center text-lg font-semibold mb-4">Reset Password</h2>
                    <p className="text-center text-sm mb-4">Enter your email address, we'll send you a link to reset your password.</p>
                    <input
                        type="email"
                        placeholder="Email"
                        className="login-input-field w-full p-2 mb-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                    />
                    <button
                        onClick={handlePasswordReset}
                        className="w-full py-2 mb-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                        Send Reset Link
                    </button>
                    {resetNotification && (
                        <p style={{ color: 'orange', fontWeight: 'bold', marginTop: '0.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
                            {resetNotification}</p>)}
                    <button
                        className="w-full py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 mt-0"
                        onClick={() => setIsResetModalOpen(false)}
                    >
                        Cancel
                    </button>
                </Modal>
            </div>
        </div>
    )
}

export default Login;
