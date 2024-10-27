import React, { useEffect, useState } from "react";
import { supabase } from '../supabaseClient.js';
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from 'react-modal'

Modal.setAppElement('#root');

const MyProfile = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [userId, setUserId] = useState(() => {
        const savedUserId = sessionStorage.getItem('userId');
        return savedUserId ? JSON.parse(savedUserId) : (null);
    })
    const [name, setName] = useState(() => {
        const savedName = sessionStorage.getItem('name');
        return savedName ? JSON.parse(savedName) : '';
    });
    const [newName, setNewName] = useState('');  // State to handle the updated name
    const [isEditing, setIsEditing] = useState(false);  // New state to handle showing the edit section
    const [toastActive, setToastActive] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false)
    const navigate = useNavigate();

    // Fetching logged-in users' authentication details and check if a row exists
    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error) {
                console.error("Error fetching user:", error);
                setIsLoading(false);
                return;
            }
            if (user) {
                setUser(user);
                setUserId(user.id);
                sessionStorage.setItem('userId', JSON.stringify(user.id));
                setIsLoading(false);
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
                            sessionStorage.setItem('name', JSON.stringify(user.email.split('@')[0]));
                            setNewName(user.email.split('@')[0]);
                        }
                    } else if (data) {
                        // If the user exists, set the name from the database
                        setName(data.name);
                        sessionStorage.setItem('name', JSON.stringify(data.name));
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
        if (toastActive) return;
        if (!newName || newName === name) {
            setToastActive(true);
            toast.error("Please enter a new name to update",
                {
                    position: "top-center",
                    autoClose: 4000,
                    theme: "colored",
                    onClose: () => setToastActive(false)
                });
            return;
        }

        const { error } = await supabase
            .from('users')
            .update({ name: newName })  // Update the name
            .eq('user_id', user.id);  // Ensure that only the current user's row is updated

        if (error) {
            console.error("Error updating profile:", error);
            toast.error("Error updating username. Please try again",
                {
                    position: "top-center",
                    autoClose: 4000,
                    theme: "colored",
                    onClose: () => setToastActive(false)
                });
        } else {
            setName(newName);  // Update the displayed name after successful update
            sessionStorage.setItem('name', JSON.stringify(newName));
            toast.success("Profile updated successfully!",
                {
                    position: "top-center",
                    autoClose: 4000,
                    theme: "colored",
                    onClose: () => setToastActive(false)
                });
            setIsEditing(false);  // Close the edit section after the update
        }
    };

    // Delete profile from the users table
    const handleDeleteProfile = async () => {
        // console.log("Delete button clicked"); // Debugging log

        setIsModalOpen(true);
        // console.log("isModalOpen:", isModalOpen)
    }

    // Delete profile from the users table
    const confirmDeleteProfile = async () => {
        // const confirmDelete = window.confirm("Are you sure you want to delete your profile? This action cannot be undone.");
        // if (!confirmDelete) return;
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('user_id', user.id);  // Ensure that only the current user's row is deleted

        if (error) {
            console.error("Error deleting profile:", error);
        } else {
            toast.success("Profile deleted successfully!",
                {
                    position: "top-center",
                    autoClose: 4000,
                    theme: "colored",
                    onClose: () => setToastActive(false)
                });
            await supabase.auth.signOut();  // Sign out the user after deletion
            navigate('/signup');  // Redirect to the signup page
        }
        setIsModalOpen(false);
    };

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen"><img src='/loading-ripple.svg' /></div>;
    }

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) console.error(error);
        // clearing session storage when user logs out (in able to trigger lesson / exercise fetching)
        // sessionStorage.removeItem('hasFetchedData');
        sessionStorage.clear(); // clearing entire storage of current session
        navigate('/login');
    };

    const handleCheckStatus = () => {
        navigate('/myStatus'); // Navigates to the status page
    };

    return (
        <>
            {user ? (
                <div className="myAccount">
                    <div className="profile-container">
                        {/* <h5 className="myAccount-title">Your DiscreteMentor Account</h5> */}
                        {/* <img className="user-icon" alt="home button" src='/D.Mentor5.png' /> */}
                        <div className="username">{name}</div>
                        {/* <div><ToastContainer/></div> */}
                        {/* <div className="username">
                            <div className="items-center justify-center">
                                <span className="mt-1">{name}</span>
                            </div>
                        </div> */}
                        {/* Check Progress Status */}
                        <div className="check-status-div">
                            <button className="check-status-button" onClick={handleCheckStatus}>
                                <div className="flex items-center justify-center">
                                    <img className="w-5 h-auto mr-2" alt="Submit" src="/check-status.svg" />
                                    <span className="ml-0 mr-1">Check Your Progress</span>
                                </div>
                            </button>
                        </div>
                        {/* EDIT - Toggle the update name form */}
                        <button className="edit-profile-button" onClick={handleEditProfile}>
                            {isEditing ? (
                                <div className="flex items-center justify-center">
                                    <img className="w-5 h-auto mr-2" alt="Submit" src="/cancel-edit.svg" />
                                    <span className="ml-0 mr-1">Cancel Edit</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center">
                                    <img className="w-5 h-auto mr-2" alt="Submit" src="/edit-profile.svg" />
                                    <span className="ml-0 mr-1">Edit Username</span>
                                </div>
                            )}
                        </button>
                        {isEditing && (
                            <div className="update-profile">
                                <label htmlFor="newName" className="input-label">Update Username</label>
                                <input
                                    id="newName"
                                    className="input-field"
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                />
                                <button className="update-profile-button" onClick={handleUpdateProfile}>
                                    <div className="flex items-center justify-center">
                                        <img className="w-5 h-auto mr-2" alt="Submit" src="/feather.svg" />
                                        <span className="ml-0 mr-1">Update Username</span>
                                    </div>

                                </button>
                            </div>
                        )}
                        {/* Delete profile button */}
                        <button className="delete-account-button" onClick={handleDeleteProfile}>
                            <div className="flex items-center justify-center">
                                <img className="w-5 h-auto mr-2" alt="Submit" src="/delete-user.svg" />
                                <span className="ml-0 mr-1">Delete Profile</span>
                            </div>
                        </button>
                        {/* Sign out */}
                        <button className="signout-button" onClick={handleSignOut}>
                            <div className="flex items-center justify-center">
                                <img className="w-5 h-auto mr-2" alt="Submit" src="/log-out.svg" />
                                <span className="ml-0 mr-1">Sign Out</span>
                            </div>
                        </button>
                    </div>

                    <ToastContainer
                        pauseOnFocusLoss={false}
                        limit={1}
                    />
                    <Modal
                        isOpen={isModalOpen}
                        onRequestClose={() => setIsModalOpen(false)}
                        contentLabel="Confirm Delete Profile"
                        style={{
                            content: {
                                top: '50%',
                                left: '50%',
                                right: 'auto',
                                bottom: 'auto',
                                // marginRight: '-50%',
                                transform: 'translate(-50%, -50%)',
                                // color: 'black',
                                background: 'rgba(70, 102, 133, 0.97)',
                                borderRadius: '20px',
                                textAlign: 'center',
                                boxShadow: '0px 0px 30px 1px rgba(255, 255, 255, 0.4)',
                                padding: '20px',
                                // minWidth: '350px',
                                // minHeight: '400px',
                                maxHeight: '400px',
                                maxWidth: '400px',
                                margin: 'auto',
                            },
                            overlay: {
                                backgroundColor: 'rgba(255, 255, 255, 0.3)' // Optional overlay style for backdrop
                            }
                        }}
                    >
                        <div className="flex items-center justify-center">
                            {/* <h2 className="del-profile-title">Confirm Delete Profile</h2> */}
                            <span className="del-profile-text">{`Are you sure? \n\nDeleting your profile cannot be undone!`}</span>
                        </div>

                        <div className="flex items-center justify-center">
                            <button className="del-profile-button" onClick={confirmDeleteProfile}>
                                <div className="flex items-center justify-center">
                                    {/* <img className="w-5 h-auto mr-2" alt="Submit" src="/confirm-delete.svg" /> */}
                                    <span className="ml-0 mr-1">Confirm Deletion</span>
                                </div>
                            </button>
                            <button className="cancel-del-button" onClick={() => setIsModalOpen(false)}>
                                <div className="flex items-center justify-center">
                                    {/* <img className="w-5 h-auto mr-2" alt="Submit" src="/cancel-edit.svg" /> */}
                                    <span className="ml-0 mr-1">Cancel</span>
                                </div>
                            </button>
                        </div>
                    </Modal>
                </div>
            ) : (
                <div className="no-account">
                    <div className="non-profile-container">
                        {/* <div className="non-user"> */}
                        {/* <span>Welcome to your</span> */}
                        {/* <img className="user-icon" alt="home button" src='/D.Mentor5.png' /> */}
                        {/* </div> */}
                        <div className="myAccount-login-signup">
                            <p>Don't have an Account?<Link className="no-account-login-signup" to="/signup"> Sign Up</Link></p>
                            <p>Have an Account?<Link className="no-account-login-signup" to="/login"> Login</Link></p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default MyProfile;
