import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const SignUp = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [notification, setNotification] = useState('');
    const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

    const handleSignUp = async (e) => {
        e.preventDefault();
        setNotification('');

        if (!email || !password || !name) {
            setNotification('Please fill out all fields.');
            return;
        }

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name
                    }
                }
            });

            if (error) {
                if (error.message === 'User already registered') {
                    setNotification('This Email address is already registered. Please log in or use a different Email to sign up');
                } else {
                    console.error('Error signing up:', error.message);
                    setNotification(`Error signing up: ${error.message}`);
                }
            } else if (data.user) {
                const { error: insertError } = await supabase
                    .from('users')
                    .insert([{
                        user_id: data.user.id,
                        name,
                        email,
                        role: 'student',
                        current_level: 'beginner'
                    }]);

                if (insertError) {
                    console.error('Error inserting user data:', insertError.message);
                }
                setNotification('Please check your inbox and verify your email before logging in');
            }
        } catch (error) {
            console.error('Signup error:', error.message);
        }
    };

    return (
        <div className="signup-page">
            <div className="signup-container w-full xxxsm:w-[180px] xxsm:w-[220px] xsm:w-[300px] sm:w-[350px] md:w-[350px] lg:w-[400px] xl:w-[400px]
                        h-auto xxxsm:h-[160px] xxsm:h-[180px] xsm:h-[200px] sm:h-[250px] md:h-[250px] lg:h-[300px] xl:h-[300px]">
                <h5 className="signup-title xxxsm:text-[12px] xxsm:text-[16px] xsm:text-[18px] sm:text-[26px] md:text-[26px] lg:text-[30px] xl:text-[30px]
                            xxxsm:mb-[6px] xxsm:mb-[6px] xsm:mb-[8px] sm:mb-[12px] md:mb-[20px] lg:mb-[20px] xl:mb-[20px]">Sign Up</h5>
                <form onSubmit={handleSignUp}>
                    <div className="name">
                        <input
                            className="login-input-field w-full xxxsm:h-[20px] xxsm:h-[25px] xsm:h-[30px] sm:h-[40px] md:h-[46px] lg:h-[46px] xl:h-[46px] 
                            p-2 rounded-md border border-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                            type="text"
                            placeholder="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="email">
                        <input
                            className="login-input-field w-full xxxsm:h-[20px] xxsm:h-[25px] xsm:h-[30px] sm:h-[40px] md:h-[46px] lg:h-[46px] xl:h-[46px] 
                            p-2 rounded-md border border-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="password relative">
                        <input
                            className="login-input-field w-full xxxsm:h-[20px] xxsm:h-[25px] xsm:h-[30px] sm:h-[40px] md:h-[46px] lg:h-[46px] xl:h-[46px] 
                            p-2 rounded-md border border-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-blue-500 hover:text-blue-700 focus:outline-none"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? "Hide" : "Show"}
                        </button>
                    </div>
                    <button className="signup-button w-full xxxsm:w-[50px] xxsm:w-[60px] xsm:w-[70px] sm:w-[80px] md:w-[80px] lg:w-[90px] xl:w-[90px] 
                                    h-auto xxxsm:h-[22px] xxsm:h-[25px] xsm:h-[30px] sm:h-[38px] md:h-[38px] lg:h-[42px] xl:h-[42px]
                                    xxxsm:mt-[8px] xxsm:mt-[15px] xsm:mt-[10px] sm:mt-[13px] md:mt-[29px] lg:mt-[20px] xl:mt-[20px]
                                    xxxsm:text-[10px] xxsm:text-[12px] xsm:text-[14px] sm:text-[14px] md:text-[14px] lg:text-[16px] xl:text-[16px]"
                        type="submit">Sign Up</button>
                    <p className=" xxxsm:text-[9px] xxsm:text-[11px] xsm:text-[12px] sm:text-[14px] md:text-[14px] lg:text-[16px]">Already have an Account?<Link className="link-to-login-signup" to="/login"> Login</Link></p>
                </form>
                {notification && <p className="signup-notification xxxsm:text-[8px] xxsm:text-[9px] xsm:text-[10px] sm:text-[12px] md:text-[16px] lg:text-[16px]">{notification}</p>}
            </div>
        </div>
    );
};

export default SignUp;
