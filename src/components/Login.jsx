import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Modal from 'react-modal';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [notification, setNotification] = useState('');
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);  // State to control reset modal visibility
    const [resetEmail, setResetEmail] = useState('');  // State for email input in reset modal
    const [resetNotification, setResetNotification] = useState('');  // State to display reset notification
    const navigate = useNavigate();

    const handleLogin = async (email, password) => {
        setNotification('');
        if (!email || !password) {
            // setNotification('Please fill out all fields.')
            return;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            if (error.message === 'Invalid login credentials') {
                setNotification('The Email or Password is incorrect. Please try again or sign up')
            }
            else if (error.message === 'Email not confirmed') {
                setNotification('Please verify your Email and then log in.')
            }
            else {
                setNotification(`Error logging in: ${error.message}`)
            }
            console.error(error);
        }
        else if (data) {
            navigate('/myProfile');
        }
    }

    // Function to handle password reset request
    const handlePasswordReset = async () => {
        setResetNotification('');  // Clear previous notifications
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

    return (
        <div className="login-page">
            <div className="login-container w-full xxsm:w-[250px] xsm:w-[300px] sm:w-[350px] md:w-[350px] lg:w-[400px] xl:w-[400px] h-auto xxsm:h-[180px] xsm:h-[200px] sm:h-[250px] md:h-[250px] lg:h-[300px] xl:h-[300px]">
                <h5 className="login-title xsm:text-[18px] sm:text-[26px] md:text-[26px] lg:text-[30px] xl:text-[30px]
                            xsm:mb-[10px] sm:mb-[20px] md:mb-[20px] lg:mb-[20px] xl:mb-[20px]">Login</h5>
                <form onSubmit={(e) => { e.preventDefault(); handleLogin(email, password) }}>
                    <div className="email">
                        <input
                            className="w-full xsm:h-[35px] sm:h-[46px] md:h-[46px] lg:h-[46px] xl:h-[46px] p-2 rounded-md border border-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                            type="email"
                            placeholder="Email"
                            onChange={(e) => setEmail(e.target.value)}
                            required />
                    </div>
                    <div className="password">
                        <input
                            className="w-full xsm:h-[35px] sm:h-[46px] md:h-[46px] lg:h-[46px] xl:h-[46px] p-2 rounded-md border border-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                            type="password"
                            placeholder="Password"
                            onChange={(e) => setPassword(e.target.value)}
                            required />
                    </div>
                    <button className="login-button w-full xxsm:w-[60px] xsm:w-[70px] sm:w-[80px] md:w-[80px] lg:w-[90px] xl:w-[90px] h-auto xsm:h-[30px] sm:h-[38px] md:h-[38px] lg:h-[42px] xl:h-[42px]
                                    xsm:mt-[32px] sm:mt-[32px] md:mt-[32px] lg:mt-[70px] xl:mt-[70px]" type="submit">
                        <div className="flex items-center justify-center">
                            <img className="xsm:w-3 sm:w-4 md:w-4 lg:w-5 xl:w-5 mr-2 -ml-2 " alt="Submit" src="/log-in.svg" />
                            <span className="ml-0 -mr-1 xsm:text-[14px] sm:text-[14px] md:text-[14px] lg:text-[16px] xl:text-[16px]">Login</span>
                        </div>
                    </button>
                    <p className="xsm:text-[12px] sm:text-[14px] md:text-[14px] lg:text-[16px]">Don't have an Account?<Link className="link-to-login-signup" to="/signup"> Sign Up</Link></p>
                    {/* <img className="w-9 h-auto mr-0" alt="Submit" src="/submit3.svg"/> */}
                </form>
                {notification && <p className="login-notification xsm:text-[10px] sm:text-[12px] md:text-[16px] lg:text-[16px]">{notification}</p>}

                {/* Password Reset Link */}
                <button
                    className="reset-password-link mt-4 text-sm text-blue-500 hover:underline focus:outline-none"
                    onClick={() => setIsResetModalOpen(true)}
                >
                    Forgot Password?
                </button>
            </div>

            {/* Password Reset Modal */}
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
                        background: 'rgba(255, 255, 255, 0.9)',
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
                <p className="text-center text-sm mb-4">Enter your email address, and we'll send you a link to reset your password.</p>
                <input
                    type="email"
                    placeholder="Email"
                    className="w-full p-2 mb-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                />
                <button
                    onClick={handlePasswordReset}
                    className="w-full py-2 mb-4 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                    Send Reset Link
                </button>
                {resetNotification && <p className="text-center text-sm text-gray-700">{resetNotification}</p>}
                <button
                    className="w-full py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 mt-4"
                    onClick={() => setIsResetModalOpen(false)}
                >
                    Cancel
                </button>
            </Modal>
        </div>
    )
}

export default Login;
