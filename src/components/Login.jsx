import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";

const Login = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [notification, setNotification] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (email, password) => {

        setNotification('');
        if (!email || !password){
            // setNotification('Please fill out all fields.')
            return;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            
            if (error.message === 'Invalid login credentials'){
                setNotification('The Email or Password is incorrect. Please try again or sign up')
            }
            else if (error.message === 'Email not confirmed'){
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

    return (
        <div className="login-page">
            <div className="login-container">
                <h5 className="login-title">Login</h5>
                <form onSubmit={(e) => { e.preventDefault(); handleLogin(email, password) }}>
                    <div className="email">
                        <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required/>
                    </div>
                    <div className="password">
                        <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required/>
                    </div>
                    <button className="login-button" type="submit">Login</button>
                    <p>Don't have an Account?<Link className="link-to-login-signup" to="/signup"> Sign Up</Link></p>
                </form>
                {notification && <p className="login-notification">{notification}</p>}
            </div>
        </div>
    )
}

export default Login