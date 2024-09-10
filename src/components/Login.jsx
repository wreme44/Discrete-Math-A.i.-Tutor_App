import React, {useState} from "react";
import {useNavigate, Link} from "react-router-dom";
import {supabase} from "../client";

const Login = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (email, password) => {

        const {data, error} = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) console.error(error);
        if (data){
            navigate('/myProfile');
        }
    }

    return (
        <div className="centered-container">
            <div className="centered-content">
                <form onSubmit={(e) => {e.preventDefault(); handleLogin(email, password)}}>
                    <h5>Login</h5>
                    <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)}/>
                    <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)}/>
                    <button type="submit">Login</button>
                    <p>Don't have an Account?<Link to="/signup">Sign Up</Link></p>
                </form>
            </div>
        </div>
    )
}

export default Login