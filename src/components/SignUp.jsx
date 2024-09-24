import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const SignUp = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const navigate = useNavigate();

    const handleSignUp = async (e) => {
        e.preventDefault();

        try {
            // Sign up the user with Supabase Auth
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) {
                console.error('Error signing up:', error.message);
            } else if (data.user) {
                // After sign up, store additional details in the users table
                const { error: insertError } = await supabase
                    .from('users')
                    .insert([{ user_id: data.user.id, name, email }]);

                if (insertError) {
                    console.error('Error inserting user data:', insertError.message);
                } else {
                    // Navigate to the profile or home page after successful signup
                    navigate('/myProfile');
                }
            }
        } catch (error) {
            console.error('Signup error:', error.message);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <h5 className="login-title">Sign Up</h5>
                <form onSubmit={handleSignUp}>
                    <div className="name">
                        <input
                            type="text"
                            placeholder="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="email">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="password">
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button className="login-button" type="submit">Sign Up</button>
                    <p>Already have an Account?<Link className="link-to-login-signup" to="/login"> Login</Link></p>
                </form>
            </div>
        </div>
    );
};

export default SignUp;