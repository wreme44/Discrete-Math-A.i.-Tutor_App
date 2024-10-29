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
                    <div className="profile-container w-full xsm:w-[225px] sm:w-[275px] md:w-[300px] lg:w-[350px] xl:w-[350px] h-auto "> {/* xsm:h-[200px] sm:h-[250px] md:h-[250px] lg:h-[300px] xl:h-[300px] */}
                        {/* <h5 className="myAccount-title">Your DiscreteMentor Account</h5> */}
                        {/* <img className="user-icon" alt="home button" src='/D.Mentor5.png' /> */}
                        <div className="username xsm:text-[18px] sm:text-[22px] md:text-[24px] lg:text-[28px] xl:text-[28px]
                            xsm:mb-[6px] sm:mb-[10px] md:mb-[16px] lg:mb-[18px] xl:mb-[20px]
                            xsm:mt-[6px] sm:mt-[10px] md:mt-[16px] lg:mt-[18px] xl:mt-[20px]">{name}</div>
                        {/* <div><ToastContainer/></div> */}
                        {/* <div className="username">
                            <div className="items-center justify-center">
                                <span className="mt-1">{name}</span>
                            </div>
                        </div> */}
                        {/* Check Progress Status */}
                        <div className="check-status-div">
                            <button className="check-status-button xsm:w-[80%] sm:w-[80%] md:w-[70%] lg:w-[70%] xl:w-[70%]
                                        xsm:my-[2px] sm:my-[4px] md:my-[8px] lg:my-[10px] xl:my-[10px]
                                        xsm:text-[12px] sm:text-[14px] md:text-[14px] lg:text-[16px] xl:text-[16px]" onClick={handleCheckStatus}>
                                <div className="flex items-center justify-center">
                                    <img className="xsm:w-4 sm:w-4 md:w-5 lg:w-5 xl:w-5 h-auto mr-2" alt="Submit" src="/check-status.svg" />
                                    <span className="ml-0 mr-1">Check Your Progress</span>
                                </div>
                            </button>
                        </div>
                        {/* EDIT - Toggle the update name form */}
                        <button className="edit-profile-button xsm:w-[80%] sm:w-[80%] md:w-[70%] lg:w-[70%] xl:w-[70%]
                                        xsm:my-[2px] sm:my-[4px] md:my-[8px] lg:my-[10px] xl:my-[10px]
                                        xsm:text-[12px] sm:text-[14px] md:text-[14px] lg:text-[16px] xl:text-[16px]" onClick={handleEditProfile}>
                            {isEditing ? (
                                <div className="flex items-center justify-center">
                                    <img className="xsm:w-4 sm:w-4 md:w-5 lg:w-5 xl:w-5 h-auto mr-2" alt="Submit" src="/cancel-edit.svg" />
                                    <span className="ml-0 mr-1">Cancel Edit</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center">
                                    <img className="xsm:w-4 sm:w-4 md:w-5 lg:w-5 xl:w-5 h-auto mr-2" alt="Submit" src="/edit-profile.svg" />
                                    <span className="ml-0 mr-1">Edit Username</span>
                                </div>
                            )}
                        </button>
                        {isEditing && (
                            <div className="update-profile">
                                <label htmlFor="newName" className="input-label xsm:text-[12px] sm:text-[14px] md:text-[14px] lg:text-[16px] xl:text-[16px]
                                        xsm:mb-[3px] sm:mb-[3px] md:mb-[5px] lg:mb-[5px] xl:mb-[5px]">Update Username</label>
                                <input
                                    id="newName"
                                    className="input-field xsm:w-[80%] sm:w-[80%] md:w-[70%] lg:w-[70%] xl:w-[70%]
                                    xsm:text-[14px] sm:text-[16px] md:text-[16px] lg:text-[18px] xl:text-[18px]
                                    xsm:mb-[3px] sm:mb-[5px] md:mb-[12px] lg:mb-[15px] xl:mb-[15px]"
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                />
                                <button className="update-profile-button xsm:w-[80%] sm:w-[80%] md:w-[70%] lg:w-[70%] xl:w-[70%]
                                        xsm:my-[2px] sm:my-[4px] md:my-[8px] lg:my-[10px] xl:my-[10px]
                                        xsm:text-[12px] sm:text-[14px] md:text-[14px] lg:text-[16px] xl:text-[16px]" onClick={handleUpdateProfile}>
                                    <div className="flex items-center justify-center">
                                        <img className="xsm:w-4 sm:w-4 md:w-5 lg:w-5 xl:w-5 h-auto mr-2" alt="Submit" src="/feather.svg" />
                                        <span className="ml-0 mr-1">Update Username</span>
                                    </div>

                                </button>
                            </div>
                        )}
                        {/* Delete profile button */}
                        <button className="delete-account-button xsm:w-[80%] sm:w-[80%] md:w-[70%] lg:w-[70%] xl:w-[70%]
                                        xsm:mt-[20px] sm:mt-[30px] md:mt-[30px] lg:mt-[40px] xl:mt-[40px]
                                        xsm:text-[12px] sm:text-[14px] md:text-[14px] lg:text-[16px] xl:text-[16px]" onClick={handleDeleteProfile}>
                            <div className="flex items-center justify-center">
                                <img className="xsm:w-4 sm:w-4 md:w-5 lg:w-5 xl:w-5 h-auto mr-2" alt="Submit" src="/delete-user.svg" />
                                <span className="ml-0 mr-1">Delete Profile</span>
                            </div>
                        </button>
                        {/* Sign out */}
                        <button className="signout-button xsm:w-[80%] sm:w-[80%] md:w-[70%] lg:w-[70%] xl:w-[70%]
                                        xsm:my-[3px] sm:my-[5px] md:my-[12px] lg:my-[15px] xl:my-[15px]
                                        xsm:text-[12px] sm:text-[14px] md:text-[14px] lg:text-[16px] xl:text-[16px]" onClick={handleSignOut}>
                            <div className="flex items-center justify-center">
                                <img className="xsm:w-4 sm:w-4 md:w-5 lg:w-5 xl:w-5 h-auto mr-2" alt="Submit" src="/log-out.svg" />
                                <span className="ml-0 mr-1">Sign Out</span>
                            </div>
                        </button>
                    </div>
                    <ToastContainer pauseOnFocusLoss={false} limit={1} />
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
                            <span className="del-profile-text xsm:text-[14px] sm:text-[16px] md:text-[18px] lg:text-[22px] xl:text-[22px]">
                                {`Are you sure? \n\nDeleting your profile cannot be undone!`}
                            </span>
                        </div>
                        <div className="flex items-center justify-center">
                            <button className="del-profile-button xsm:text-[11px] sm:text-[12px] md:text-[14px] lg:text-[16px] xl:text-[16px]
                            xsm:mr-[2px] sm:mr-[6px] md:mr-[8px] lg:mr-[10px] xl:mr-[10px]
                            xsm:mt-[20px] sm:mt-[40px] md:mt-[40px] lg:mt-[40px] xl:mt-[40px]" onClick={confirmDeleteProfile}>
                                <div className="flex items-center justify-center">
                                    {/* <img className="w-5 h-auto mr-2" alt="Submit" src="/confirm-delete.svg" /> */}
                                    <span className="ml-0 mr-1">Confirm Deletion</span>
                                </div>
                            </button>
                            <button className="cancel-del-button xsm:text-[11px] sm:text-[12px] md:text-[14px] lg:text-[16px] xl:text-[16px]
                            xsm:mt-[20px] sm:mt-[40px] md:mt-[40px] lg:mt-[40px] xl:mt-[40px]"
                                onClick={() => setIsModalOpen(false)}>
                                <div className="flex items-center justify-center">
                                    {/* <img className="w-5 h-auto mr-2" alt="Submit" src="/cancel-edit.svg" /> */}
                                    <span className="ml-0 mr-1">Cancel</span>
                                </div>
                            </button>
                        </div>
                    </Modal>
                </div>
            ) : (
                // <div className="no-account">
                //     <div className="non-profile-container">
                //         {/* <div className="non-user"> */}
                //         {/* <span>Welcome to your</span> */}
                //         {/* <img className="user-icon" alt="home button" src='/D.Mentor5.png' /> */}
                //         {/* </div> */}
                //         {/* <div className="myAccount-login-signup">
                //             <p>Don't have an Account?<Link className="no-account-login-signup" to="/signup"> Sign Up</Link></p>
                //             <p>Have an Account?<Link className="no-account-login-signup" to="/login"> Login</Link></p>
                //         </div> */}
                //     </div>
                // </div>
                <div className="no-account flex flex-col items-center justify-center">
                    <div className="">
                        <img
                            src="D.Mentor9.PNG"
                            alt="Background"
                            className="no-account-image relative w-[50vw] h-[70vh] xsm:w-[40vw] sm:w-[45vw] md:w-[50vw] lg:w-[50vw] xl:w-[50vw] 
                                xsm:h-[30vh] sm:h-[40vh] md:h-[55vh] lg:h-[60vh] xl:h-[70vh]
                                xsm:mt-[15px] sm:mt-[40px] md:mt-[70px] lg:mt-[80px] xl:mt-[80px]
                                xsm:mb-[15px] sm:mb-[20px] md:mb-[25px] lg:mb-[30px] xl:mb-[30px]
                                opacity-75 top-0 left-1/2 transform -translate-x-1/2"
                        />
                    </div>
                    <div className="non-profile-container">
                        <div className="flex items-center space-x-4
                        xsm:text-[12px] sm:text-[14px] md:text-[18px] lg:text-[20px] xl:text-[20px]">
                            <Link className="no-account-login-signup font-bold" to="/login">Login</Link>
                            <p className='font-bold'>|</p>
                            <Link className="no-account-login-signup font-bold" to="/signup">Sign Up</Link>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default MyProfile;

// sm:w-[50vh] md:w-[50vh] lg:w-[50vh] xl:w-[50vh]
// sm:h-[70vh] md:h-[70vh] lg:h-[70vh] xl:h-[70vh]