import React, {useEffect, useState} from "react";
import {supabase} from '../client.js';
import {useNavigate, Link} from "react-router-dom";

const MyProfile = () => {

    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    // const [uploading, setUploading] = useState(false);
    // const [avatarUrl, setAvatarUrl] = useState(null);
    const navigate = useNavigate();
    // fetching logged in users authentication details
    // useEffect(() => {
    //     const fetchUser = async () => {
    //         const {data: {user}} = await supabase.auth.getUser();
    //         setUser(user);
    //         setIsLoading(false);
    //     }
    //     fetchUser();
    // }, [])

    // if (isLoading) {
    //     return <div><img src='/loading.gif'/></div>
    // }

    const handleSignOut = async () => {

        // const {error} = await supabase.auth.signOut();
        // if (error) console.error(error);
        // navigate('/login');
    }
    // user option to upload profile pic
    // const handleFileUpload = async (event) => {

    //     setUploading(true);
    //     const file = event.target.files[0];
    //     const filePath = `${user.id}/${file.name}`;

    //     let {error: uploadError} = await supabase.storage
    //         .from('profile-pictures')
    //         .upload(filePath, file);

    //     if (uploadError) {
    //         console.error(uploadError);
    //         return;
    //     }

    //     let {error: insertError} = await supabase
    //         .from('profiles')
    //         .upsert({id: user.id, avatar_filename: file.name});

    //     if (insertError) {
    //         console.error(insertError);
    //         return;
    //     }

    //     let {data: url, error: urlError} = await supabase.storage
    //         .from('profile-pictures')
    //         .createSignedUrl(filePath, 60);

    //     if (urlError) {
    //         console.error(urlError);
    //         return;
    //     }

    //     setAvatarUrl(url);
    //     setUploading(false);
    // }

    return (
        <div className="myAccount">
            <div className="myAccount-content">
                <h5 className="myAccount-title">Your DiscreteMentor Account,</h5>
                <h2>{user ? user.email : 'Sign up or Login'}</h2>
                {user ? (
                    <>
                        <input type="file" accept="image/*" onChange={handleFileUpload} disabled={uploading}/>
                        {avatarUrl && <img src={avatarUrl} alt="Avatar"/>}
                        <button onClick={handleSignOut}>Sign Out</button>
                    </>
                ) : (
                    <>
                        <p>Don't have an Account?<Link className="link-to-login-signup" to="/signup"> Sign Up</Link></p>
                        <p >Have an Account?<Link className="link-to-login-signup" to="/login"> Login</Link></p>
                    </>
                )}
            </div>
        </div>
    )
}

export default MyProfile