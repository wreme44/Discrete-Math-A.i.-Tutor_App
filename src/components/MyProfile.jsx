import React, { useEffect, useState } from "react";
import { supabase } from '../supabaseClient.js';
import { useNavigate, Link } from "react-router-dom";
import './MyProfile.css'; // Import the CSS file


const MyProfile = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [name, setName] = useState('');
    const [newName, setNewName] = useState('');  // State to handle the updated name
    const [isEditing, setIsEditing] = useState(false);  // New state to handle showing the edit section
    const navigate = useNavigate();

    // Fetching logged-in users' authentication details and check if a row exists
    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setIsLoading(false);

            if (user) {
                try {
                    // Check if user already exists in the "users" table
                    const { data, error } = await supabase
                        .from('users')
                        .select('name')
                        .eq('user_id', user.id)
                        .single();

                    if (error && error.code === 'PGRST116') {
                        // If the user does not exist, insert a new row in the "users" table
                        const { error: insertError } = await supabase
                            .from('users')
                            .insert([{ user_id: user.id, name: user.email.split('@')[0] }]);  // Default name is based on email

                        if (insertError) {
                            console.error("Error inserting user into the database:", insertError);
                        } else {
                            // Set the default name after inserting
                            setName(user.email.split('@')[0]);
                            setNewName(user.email.split('@')[0]);
                        }
                    } else if (data) {
                        // If the user exists, set the name from the database
                        setName(data.name);
                        setNewName(data.name);
                    } else {
                        console.error("Error fetching user data:", error);
                    }
                } catch (err) {
                    console.error("Error during fetching or inserting user data:", err);
                }
            }
        };
        fetchUser();
    }, []);

    // Toggle edit state for the profile
    const handleEditProfile = () => {
        setIsEditing(!isEditing);  // Toggle the editing state
    };

    // Update profile (e.g., name) in the users table
    const handleUpdateProfile = async () => {
        if (!newName || newName === name) {
            alert("Please enter a new name to update.");
            return;
        }

        const { error } = await supabase
            .from('users')
            .update({ name: newName })  // Update the name
            .eq('user_id', user.id);  // Ensure that only the current user's row is updated

        if (error) {
            console.error("Error updating profile:", error);
        } else {
            setName(newName);  // Update the displayed name after successful update
            alert("Profile updated successfully!");
            setIsEditing(false);  // Close the edit section after the update
        }
    };

    // Delete profile from the users table
    const handleDeleteProfile = async () => {
        const confirmDelete = window.confirm("Are you sure you want to delete your profile? This action cannot be undone.");
        if (!confirmDelete) return;

        const { error } = await supabase
            .from('users')
            .delete()
            .eq('user_id', user.id);  // Ensure that only the current user's row is deleted

        if (error) {
            console.error("Error deleting profile:", error);
        } else {
            alert("Profile deleted successfully.");
            await supabase.auth.signOut();  // Sign out the user after deletion
            navigate('/signup');  // Redirect to the signup page
        }
    };

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen"><img src='/loading-ripple.svg' /></div>;
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
            <div className="profile-container">
                <h5 className="myAccount-title">Your DiscreteMentor Account</h5>
                <h2 className="username">{user ? name : 'Sign up or Login below'}</h2>

                {user ? (
                    <>
                        <div className="check-status-div">
                            <button className="check-status-button" onClick={handleCheckStatus}>
                                Check Your Progress
                            </button>
                        </div>

                        {/* Toggle the update name form */}
                        <button className="edit-profile-button" onClick={handleEditProfile}>
                            {isEditing ? "Cancel Edit" : "Edit Profile"}
                        </button>

                        {isEditing && (
                            <div className="update-profile">
                                <label htmlFor="newName" className="input-label">Update Name:</label>
                                <input
                                    id="newName"
                                    className="input-field"
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                />
                                <button className="check-status-button" onClick={handleUpdateProfile}>
                                    Update Profile
                                </button>
                            </div>
                        )}

                        {/* Delete profile button */}
                        <div className="delete-profile-div">
                            <button className="check-status-button" onClick={handleDeleteProfile}>
                                Delete Profile
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
