import React, {useState} from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../client";

const SignUp = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSignUp = async (email, password) => {
        
        const {data, error} = await supabase.auth.signUp({
            email, 
            password,
        })
        if (error) console.error(error);
        if (data){
            navigate('/myProfile');
        }
    }

    return (
        <div className="login-page">
            <div className="login-container">
                <h5 className="login-title">Sign Up</h5>
                <form onSubmit={(e) => {e.preventDefault(); handleSignUp(email, password)}}>
                    <div className="email">
                        <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)}/>
                    </div>
                    <div className="password">
                        <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)}/>
                    </div>
                    <button className="login-button" type="submit">Sign Up</button>
                    <p className="link-to-login-signup">Already have an Account?<Link to="/login"> Login</Link></p>
                </form>
            </div>
        </div>
    )
}

export default SignUp