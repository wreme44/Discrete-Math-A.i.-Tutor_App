import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState(''); // State for new password input
  const [confirmPassword, setConfirmPassword] = useState(''); // State for confirm password input
  const [notification, setNotification] = useState(''); // State for any messages to display
  const [isSubmitting, setIsSubmitting] = useState(false); // State to manage button loading state
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
    <div className="reset-password-page">
      <div className="reset-password-container w-full xxsm:w-[250px] xsm:w-[300px] sm:w-[350px] md:w-[400px] lg:w-[450px] xl:w-[500px] h-auto xxsm:h-[250px] xsm:h-[300px] sm:h-[350px] md:h-[400px] lg:h-[450px] xl:h-[500px]">
        <h5 className="reset-password-title xsm:text-[18px] sm:text-[26px] md:text-[28px] lg:text-[30px] xl:text-[32px]
                            xsm:mb-[10px] sm:mb-[20px] md:mb-[25px] lg:mb-[30px] xl:mb-[35px]">Reset Your Password</h5>

        <p className="reset-password-description xsm:text-[12px] sm:text-[14px] md:text-[16px] lg:text-[18px] xl:text-[18px] mb-4 text-center text-gray-600">
          Enter a new password below. Once submitted, you'll be redirected to the login page.
        </p>

        <form onSubmit={handlePasswordReset}>
          <div className="new-password mb-4">
            <input
              type="password"
              placeholder="New Password"
              className="w-full xsm:h-[35px] sm:h-[46px] md:h-[50px] lg:h-[55px] xl:h-[55px] p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="confirm-password mb-4">
            <input
              type="password"
              placeholder="Confirm New Password"
              className="w-full xsm:h-[35px] sm:h-[46px] md:h-[50px] lg:h-[55px] xl:h-[55px] p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="reset-password-button w-full xxsm:w-[60px] xsm:w-[70px] sm:w-[80px] md:w-[90px] lg:w-[100px] xl:w-[110px] h-auto xsm:h-[30px] sm:h-[38px] md:h-[42px] lg:h-[46px] xl:h-[46px]
                                    bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Set New Password"}
          </button>
        </form>

        {notification && (
          <p className="reset-password-notification xsm:text-[10px] sm:text-[12px] md:text-[14px] lg:text-[16px] xl:text-[16px] mt-4 text-center text-gray-700">
            {notification}
          </p>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;
