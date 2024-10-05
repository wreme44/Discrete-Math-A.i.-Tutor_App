import React, { useEffect, useState } from "react";
import { supabase } from '../supabaseClient.js';
import { useNavigate, Link } from "react-router-dom";

const MyProfile = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [name, setName] = useState('');
    const navigate = useNavigate();

    // Fetching logged-in users' authentication details
    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setIsLoading(false);

            if (user) {
                const { data, error } = await supabase
                    .from('users')
                    .select('name')
                    .eq('user_id', user.id)
                    .single();

                if (error) {
                    console.error(error);
                } else {
                    setName(data.name);
                }
            }
        };
        fetchUser();
    }, []);

    if (isLoading) {
        return <div><img src='/loading.gif' /></div>;
    }

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) console.error(error);
        navigate('/login');
    };

    const handleCheckStatus = () => {
        navigate('/myStatus'); // Navigates to the status page
    };

    return (
        <div className="myAccount">
            {/* <div className="logo-account">
                <img className="logo-profile" src="./logo.png" />
            </div> */}
            <div className="myAccount-content">
                <h5 className="myAccount-title">Your DiscreteMentor Account</h5>
                <h2 className="username">{user ? name : 'Sign up or Login below'}</h2>
                {user ? (
                    <>
                        <div className="check-status-div">
                            <button className="check-status-button" onClick={handleCheckStatus}>
                                Check Your Progress
                            </button>
                        </div>
                        <button className="signout-button" onClick={handleSignOut}>Sign Out</button>
                    </>
                ) : (
                    <>
                        <div className="myAccount-login-signup">
                            <p>Don't have an Account?<Link className="link-to-login-signup" to="/signup"> Sign Up</Link></p>
                            <p>Have an Account?<Link className="link-to-login-signup" to="/login"> Login</Link></p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default MyProfile;
