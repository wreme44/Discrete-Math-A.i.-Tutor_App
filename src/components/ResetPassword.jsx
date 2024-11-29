import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState(''); // State for new password input
    const [confirmPassword, setConfirmPassword] = useState(''); // State for confirm password input
    const [notification, setNotification] = useState(''); // State for any messages to display
    const [isSubmitting, setIsSubmitting] = useState(false); // State to manage button loading state
    const [showNewPassword, setShowNewPassword] = useState(false); // State for toggling new password visibility
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State for toggling confirm password visibility
    const navigate = useNavigate();
    const location = useLocation();

    // Check for access token in URL on page load
    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const access_token = query.get('access_token');
        if (!access_token) {
            setNotification('Invalid or missing reset link. Please try requesting a new password reset.');
        }
    }, [location.search]);

    // Function to handle password reset
    const handlePasswordReset = async (e) => {
        e.preventDefault();
        setNotification('');
        setIsSubmitting(true);

        if (newPassword !== confirmPassword) {
            setNotification("Passwords do not match. Please try again.");
            setIsSubmitting(false);
            return;
        }

        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) {
            setNotification(`Error resetting password: ${error.message}`);
            console.error(error);
        } else {
            setNotification('Password successfully reset! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 2000); // Redirect to login page after 2 seconds
        }

        setIsSubmitting(false);
    };

    return (
        <div className="reset-password-page flex items-center justify-center min-h-screen bg-dark-900">
            <div className="reset-password-container w-full max-w-md bg-gray-800 p-6 rounded-lg shadow-md">
                <h5 className="reset-password-title text-xl sm:text-2xl md:text-3xl lg:text-3xl font-semibold text-center text-white mb-6">
                    Reset Your Password
                </h5>

                <p className="reset-password-description text-sm sm:text-base text-center text-gray-400 mb-6">
                    Enter a new password below. Once submitted, you'll be redirected to the login page.
                </p>

                <form onSubmit={handlePasswordReset}>
                    <div className="new-password mb-4 relative">
                        <input
                            type={showNewPassword ? "text" : "password"}
                            placeholder="New Password"
                            className="w-full p-2 rounded-md border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-blue-400 hover:text-blue-600 focus:outline-none"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                            {showNewPassword
                                ? <img className='xxxsm:w-[9px] xxsm:w-[10px] xsm:w-[12px] sm:w-[14px] md:w-[16px] lg:w-[16px] xl:w-[16px]'
                                    alt='show' src='./hide-reset-pass.svg' />
                                : <img className='xxxsm:w-[9px] xxsm:w-[10px] xsm:w-[12px] sm:w-[14px] md:w-[16px] lg:w-[16px] xl:w-[16px]'
                                    alt='show' src='./show-reset-pass.svg' />}
                        </button>
                    </div>

                    <div className="confirm-password mb-4 relative">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm New Password"
                            className="w-full p-2 rounded-md border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-blue-400 hover:text-blue-600 focus:outline-none"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword
                                ? <img className='xxxsm:w-[9px] xxsm:w-[10px] xsm:w-[12px] sm:w-[14px] md:w-[16px] lg:w-[16px] xl:w-[16px]'
                                    alt='show' src='./hide-reset-pass.svg' />
                                : <img className='xxxsm:w-[9px] xxsm:w-[10px] xsm:w-[12px] sm:w-[14px] md:w-[16px] lg:w-[16px] xl:w-[16px]'
                                    alt='show' src='./show-reset-pass.svg' />}
                        </button>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition-colors duration-200"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Submitting..." : "Set New Password"}
                    </button>
                </form>

                {notification && (
                    <p className="reset-password-notification text-sm text-center text-red-500 font-bold mt-4">
                        {notification}
                    </p>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
