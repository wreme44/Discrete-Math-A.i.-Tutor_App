import React, { useEffect, useState } from "react";
import { supabase } from '../supabaseClient.js';
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from 'react-modal';


Modal.setAppElement('#root');

const MyProfile = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [passwordForDeletion, setPasswordForDeletion] = useState(''); // Password input for deletion confirmation
    const [notification, setNotification] = useState(''); // State for notifications in the modal
    const [userId, setUserId] = useState(() => {
        const savedUserId = sessionStorage.getItem('userId');
        return savedUserId ? JSON.parse(savedUserId) : (null);
    });
    const [name, setName] = useState(() => {
        const savedName = sessionStorage.getItem('name');
        return savedName ? JSON.parse(savedName) : '';
    });
    const [newName, setNewName] = useState('');
    const [emailConfirmation, setEmailConfirmation] = useState('');  // Field for email confirmation
    const [isEditing, setIsEditing] = useState(false);
    const [toastActive, setToastActive] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSmallScreen, setIsSmallScreen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Add class to body
        document.body.classList.add('profileBody');

        return () => {
            // Remove class when leaving the page
            document.body.classList.remove('profileBody');
        };
    }, []);

    // Fetch user data
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
                    const { data, error } = await supabase
                        .from('users')
                        .select('name, email')
                        .eq('user_id', user.id)
                        .single();

                    if (error && error.code === 'PGRST116') {
                        const { error: insertError } = await supabase
                            .from('users')
                            .insert([{ user_id: user.id, name: user.email.split('@')[0], email: user.email }]);

                        if (insertError) {
                            console.error("Error inserting user into the database:", insertError);
                        } else {
                            setName(user.email.split('@')[0]);
                            sessionStorage.setItem('name', JSON.stringify(user.email.split('@')[0]));
                            setNewName(user.email.split('@')[0]);
                        }
                    } else if (data) {
                        setName(data.name);
                        setNewName(data.name);
                        sessionStorage.setItem('name', JSON.stringify(data.name));
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

    // switch 2 containers to 1
    useEffect(() => {

        const handleResize = () => {

            if (window.innerWidth < 480) {
                setIsSmallScreen(true)
            }
            else {
                setIsSmallScreen(false)
            }
        }
        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    // Toggle edit state
    const handleEditProfile = () => {
        setIsEditing(!isEditing);
    };

    // Update profile (name) with email confirmation
    const handleUpdateProfile = async () => {
        if (toastActive) return;
        if (!newName || newName === name) {
            setToastActive(true);
            toast.error("Please enter a new name to update", {
                position: "top-center",
                autoClose: 4000,
                theme: "colored",
                onClose: () => setToastActive(false)
            });
            return;
        }
        if (!emailConfirmation || emailConfirmation !== user.email) {
            setToastActive(true);
            toast.error("Please confirm your email address to update the profile", {
                position: "top-center",
                autoClose: 4000,
                theme: "colored",
                onClose: () => setToastActive(false)
            });
            return;
        }

        const { error } = await supabase
            .from('users')
            .update({ name: newName })  // Update name only after confirming email
            .eq('user_id', user.id);

        if (error) {
            console.error("Error updating profile:", error);
            toast.error("Error updating profile. Please try again", {
                position: "top-center",
                autoClose: 4000,
                theme: "colored",
                onClose: () => setToastActive(false)
            });
        } else {
            setName(newName);
            sessionStorage.setItem('name', JSON.stringify(newName));
            toast.success("Profile updated successfully!", {
                position: "top-center",
                autoClose: 4000,
                theme: "colored",
                onClose: () => setToastActive(false)
            });
            setIsEditing(false);
        }
    };

    // Delete profile function
    const handleDeleteProfile = () => {
        setPasswordForDeletion(''); // Clear the password field
        setNotification(''); // Clear any previous notifications
        setIsModalOpen(true); // Open the modal
        sessionStorage.clear()
    };

    const confirmDeleteProfile = async () => {
        if (!passwordForDeletion) {
            setNotification("Please enter your password to confirm.");
            return;
        }

        const { error: authError } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: passwordForDeletion
        });

        if (authError) {
            setNotification("Invalid password. Please try again.");
            return;
        }

        const { error } = await supabase
            .from('users')
            .delete()
            .eq('user_id', user.id);

        if (error) {
            console.error("Error deleting profile:", error);
        } else {
            toast.success("Profile deleted successfully!", {
                position: "top-center",
                autoClose: 4000,
                theme: "colored"
            });
            await supabase.auth.signOut();
            navigate('/signup');
        }

        setIsModalOpen(false);
    };


    // Handle navigation to the Games page
    const handleGamesNavigation = () => {
        navigate('/games');
    };

    // Handle navigation to the Assessment page
    const handleAssessmentNavigation = () => {
        navigate('/assessment');
    };



    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen"><img src='/loading-ripple.svg' /></div>;
    }

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) console.error(error);
        sessionStorage.clear();
        // navigate('/login');
        window.location.reload();
    };

    const handleCheckStatus = () => {
        navigate('/myStatus');
    };

    const handleMainPageNav = () => {
        navigate('/');
    };

    return (
        <>
            {user ? (
                <div className="myAccount space-x-[20px] ">
                            <div className="profile-container w-full xxxsm:w-[200px] xxsm:w-[225px] xsm:w-[225px] sm:w-[275px] md:w-[300px] lg:w-[350px] xl:w-[350px] h-auto max-h-[90vh] overflow-y-auto">
                                {/* Username */}
                                {/* <img className="user-icon" alt="home button" src='/D.Mentor5.png' /> */}
                                <div className="username xxxsm:text-[16px] xxsm:text-[18px] xsm:text-[18px] sm:text-[22px] md:text-[24px] lg:text-[28px] xl:text-[28px]
                                xxxsm:mb-[4px] xxsm:mb-[6px] xsm:mb-[6px] sm:mb-[10px] md:mb-[16px] lg:mb-[18px] xl:mb-[20px]
                                xxxsm:mt-[4px] xxsm:mt-[6px] xsm:mt-[6px] sm:mt-[10px] md:mt-[16px] lg:mt-[18px] xl:mt-[20px]">
                                    {name}
                                </div>
                                {/* Lessons & Exercises button (MainPage) */}
                                <button className="main-page-nav-button xxxsm:w-[80%] xxsm:w-[80%] xsm:w-[80%] sm:w-[80%] md:w-[68%] lg:w-[70%] xl:w-[70%]
                                            xxxsm:my-[2px] xxsm:my-[2px] xsm:my-[2px] sm:my-[4px] md:my-[8px] lg:my-[10px] xl:my-[10px]
                                            xxxsm:text-[10px] xxsm:text-[12px] xsm:text-[12px] sm:text-[14px] md:text-[14px] lg:text-[16px] xl:text-[16px]" onClick={handleMainPageNav}>
                                    <div className="relative flex items-center justify-center">
                                        <img className="absolute left-[-5px] xxxsm:w-3 xxsm:w-4 xsm:w-4 sm:w-4 md:w-5 lg:w-5 xl:w-5 h-auto" alt="Submit" src="/learn-icon.svg" />
                                        <span className="ml-0 mr-0">Lessons & Exercises</span>
                                    </div>
                                </button>
                                {/* Check Progress Status */}
                                <button className="check-status-button xxxsm:w-[80%] xxsm:w-[80%] xsm:w-[80%] sm:w-[80%] md:w-[68%] lg:w-[70%] xl:w-[70%]
                                            xxxsm:my-[2px] xxsm:my-[2px] xsm:my-[2px] sm:my-[4px] md:my-[8px] lg:my-[10px] xl:my-[10px]
                                            xxxsm:text-[10px] xxsm:text-[12px] xsm:text-[12px] sm:text-[14px] md:text-[14px] lg:text-[16px] xl:text-[16px]" onClick={handleCheckStatus}>
                                    <div className="relative flex items-center justify-center">
                                        <img className="absolute left-[-5px] xxxsm:w-3 xxsm:w-4 xsm:w-4 sm:w-4 md:w-5 lg:w-5 xl:w-5 h-auto" alt="Submit" src="/check-status.svg" />
                                        <span className="ml-0 mr-0">Check Your Progress</span>
                                    </div>
                                </button>
                                {/* Assessment Page Button */}
                                <button
                                    className="challenges-button-col xxxsm:w-[80%] xxsm:w-[80%] xsm:w-[80%] sm:w-[80%] md:w-[68%] lg:w-[70%] xl:w-[70%]
                                xxxsm:my-[2px] xxsm:my-[2px] xsm:my-[2px] sm:my-[4px] md:my-[8px] lg:my-[10px] xl:my-[10px]
                                xxxsm:text-[10px] xxsm:text-[12px] xsm:text-[12px] sm:text-[14px] md:text-[14px] lg:text-[16px] xl:text-[16px]"
                                    onClick={handleAssessmentNavigation}
                                >
                                    <div className="relative flex items-center justify-center">
                                        <img className="absolute left-[-5px] xxxsm:w-3 xxsm:w-4 xsm:w-4 sm:w-4 md:w-5 lg:w-5 xl:w-5 h-auto" alt="Submit" src="/exam-icon.svg" />
                                        <span className="ml-0 mr-0">Challenge Center</span>
                                    </div>
                                </button>
                                {/* Games Button */}
                                <button
                                    className="games-button-profile-col xxxsm:w-[80%] xxsm:w-[80%] xsm:w-[80%] sm:w-[80%] md:w-[68%] lg:w-[70%] xl:w-[70%]
                                            xxxsm:my-[2px] xxsm:my-[2px] xsm:my-[2px] sm:my-[4px] md:my-[8px] lg:my-[10px] xl:my-[10px]
                                            xxxsm:text-[10px] xxsm:text-[12px] xsm:text-[12px] sm:text-[14px] md:text-[14px] lg:text-[16px] xl:text-[16px]"
                                    onClick={handleGamesNavigation}>
                                    <div className="relative flex items-center justify-center">
                                        <img className="absolute left-0 xxxsm:w-3 xxsm:w-4 xsm:w-4 sm:w-4 md:w-5 lg:w-5 xl:w-5 h-auto mr-2" alt="Games" src="/games-profile.svg" />
                                        <span className="">Game Hub</span> {/* absolute left-1/2 transform -translate-x-1/2 mx-auto*/}
                                    </div>
                                </button>
                                {/* EDIT - Toggle the update name form */}
                                <button className={`edit-profile-button ${isEditing ? 'edit-cancel-button':''} xxxsm:w-[80%] xxsm:w-[80%] xsm:w-[80%] sm:w-[80%] md:w-[70%] lg:w-[70%] xl:w-[70%]
                                            xxxsm:my-[2px] xxsm:my-[2px] xsm:my-[2px] sm:my-[4px] md:my-[8px] lg:my-[10px] xl:my-[10px]
                                            xxxsm:text-[10px] xxsm:text-[12px] xsm:text-[12px] sm:text-[14px] md:text-[14px] lg:text-[16px] xl:text-[16px]`} onClick={handleEditProfile}>
                                    {isEditing ? (
                                        <div className="relative flex items-center justify-center"> {/* justify-center */}
                                            <img className="absolute left-0 xxxsm:w-3 xxsm:w-4 xsm:w-4 sm:w-4 md:w-5 lg:w-5 xl:w-5 h-auto mr-2" alt="Submit" src="/cancel-edit.svg" />
                                            <span className="">Cancel Edit</span>
                                        </div>
                                    ) : (
                                        <div className="relative flex items-center justify-center">
                                            <img className="absolute left-0 xxxsm:w-3 xxsm:w-4 xsm:w-4 sm:w-4 md:w-5 lg:w-5 xl:w-5 h-auto mr-2" alt="Submit" src="/edit-profile.svg" />
                                            <span className="">Edit Username</span>
                                        </div>
                                    )}
                                </button>
                                {isEditing && (
                                    <div className="update-profile">
                                        <label htmlFor="newName" className="input-label xxxsm:text-[10px] xxsm:text-[12px] xsm:text-[12px] sm:text-[14px] md:text-[14px] lg:text-[16px] xl:text-[16px]
                                            xxxsm:mb-[2px] xxsm:mb-[3px] xsm:mb-[3px] sm:mb-[3px] md:mb-[5px] lg:mb-[5px] xl:mb-[5px]">Update Username</label>
                                        <input
                                            id="newName"
                                            className="input-field xxxsm:w-[80%] xxsm:w-[80%] xsm:w-[80%] sm:w-[80%] md:w-[70%] lg:w-[70%] xl:w-[70%]
                                        xxxsm:text-[12px] xxsm:text-[14px] xsm:text-[14px] sm:text-[16px] md:text-[16px] lg:text-[18px] xl:text-[18px]
                                        xxxsm:mb-[2px] xxsm:mb-[3px] xsm:mb-[3px] sm:mb-[5px] md:mb-[12px] lg:mb-[15px] xl:mb-[15px]"
                                            type="text"
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                        />

                                        <label htmlFor="emailConfirmation" className="input-label xxxsm:text-[10px] xxsm:text-[12px] xsm:text-[12px] sm:text-[14px] md:text-[14px] lg:text-[16px] xl:text-[16px]
                                            xxxsm:mb-[2px] xxsm:mb-[3px] xsm:mb-[3px] sm:mb-[3px] md:mb-[5px] lg:mb-[5px] xl:mb-[5px]">Confirm Email to Update</label>
                                        <input
                                            id="emailConfirmation"
                                            className="input-field xxxsm:w-[80%] xxsm:w-[80%] xsm:w-[80%] sm:w-[80%] md:w-[70%] lg:w-[70%] xl:w-[70%]
                                    xxxsm:text-[12px] xxsm:text-[14px] xsm:text-[14px] sm:text-[16px] md:text-[16px] lg:text-[18px] xl:text-[18px]
                                        xxxsm:mb-[2px] xxsm:mb-[3px] xsm:mb-[3px] sm:mb-[5px] md:mb-[12px] lg:mb-[15px] xl:mb-[15px]"
                                            type="email"
                                            value={emailConfirmation}
                                            onChange={(e) => setEmailConfirmation(e.target.value)}
                                        />

                                        <button className="update-profile-button xxxsm:w-[80%] xxsm:w-[80%] xsm:w-[80%] sm:w-[80%] md:w-[70%] lg:w-[70%] xl:w-[70%]
                                            xxxsm:my-[2px] xxsm:my-[2px] xsm:my-[2px] sm:my-[4px] md:my-[8px] lg:my-[10px] xl:my-[10px]
                                            xxxsm:text-[10px] xxsm:text-[12px] xsm:text-[12px] sm:text-[14px] md:text-[14px] lg:text-[16px] xl:text-[16px]" onClick={handleUpdateProfile}>
                                            <div className="relative flex items-center justify-center">
                                                <img className="absolute left-0 xxxsm:w-3 xxsm:w-4 xsm:w-4 sm:w-4 md:w-5 lg:w-5 xl:w-5 h-auto" alt="Submit" src="/feather.svg" />
                                                <span className="">Update Username</span>
                                            </div>
                                        </button>
                                    </div>
                                )}
                                {/* Delete profile button */}
                                <button className="delete-account-button xxxsm:w-[80%] xxsm:w-[80%] xsm:w-[80%] sm:w-[80%] md:w-[70%] lg:w-[70%] xl:w-[70%]
                                            xxxsm:mt-[15px] xxsm:mt-[20px] xsm:mt-[20px] sm:mt-[30px] md:mt-[30px] lg:mt-[40px] xl:mt-[40px]
                                            xxxsm:text-[10px] xxsm:text-[12px] xsm:text-[12px] sm:text-[14px] md:text-[16px] lg:text-[16px] xl:text-[16px]" onClick={handleDeleteProfile}>
                                    <div className="relative flex items-center justify-center">
                                        <img className="del-profile-icon absolute left-0 xxxsm:w-3 xxsm:w-4 xsm:w-4 sm:w-4 md:w-5 lg:w-5 xl:w-5 h-auto" alt="Submit" src="/delete-user.svg" />
                                        <span className="">Delete Profile</span>
                                    </div>
                                </button>
                                {/* Sign out */}
                                <button className="signout-button xxxsm:w-[80%] xxsm:w-[80%] xsm:w-[80%] sm:w-[80%] md:w-[70%] lg:w-[70%] xl:w-[70%]
                                            xxxsm:my-[2px] xxsm:my-[2px] xsm:my-[3px] sm:my-[5px] md:my-[12px] lg:my-[15px] xl:my-[15px]
                                            xxxsm:text-[10px] xxsm:text-[12px] xsm:text-[12px] sm:text-[14px] md:text-[14px] lg:text-[16px] xl:text-[16px]" onClick={handleSignOut}>
                                    <div className="relative flex items-center justify-center">
                                        <img className="absolute left-0 xxxsm:w-3 xxsm:w-4 xsm:w-4 sm:w-4 md:w-5 lg:w-5 xl:w-5 h-auto" alt="Submit" src="/log-out.svg" />
                                        <span className="">Sign Out</span>
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
                                        transform: 'translate(-50%, -50%)',
                                        background: 'rgba(3, 78, 144, 0.95)',
                                        borderRadius: '20px',
                                        padding: '20px',
                                        maxWidth: '400px',
                                        width: '90%'
                                    },
                                    overlay: {
                                        backgroundColor: 'rgba(0, 0, 0, 0.5)'
                                    }
                                }}
                            >
                                <h3 className="text-center text-lg font-bold text-white mb-4">
                                    Confirm Delete Profile
                                </h3>
                                <p className="text-center text-sm text-gray-200 mb-4">
                                    Please re-enter your password to confirm deletion. This action cannot be undone.
                                </p>
                                <input
                                    type="password"
                                    placeholder="Enter your password"
                                    className="w-full p-2 mb-4 rounded-md border border-gray-500 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={passwordForDeletion}
                                    onChange={(e) => setPasswordForDeletion(e.target.value)}
                                />
                                {notification && (
                                    <p className="text-sm text-center text-red-500 font-bold mb-4">
                                        {notification}
                                    </p>
                                )}
                                <div className="flex justify-around">
                                    <button
                                        className="w-32 py-2 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 transition-colors"
                                        onClick={confirmDeleteProfile}
                                    >
                                        Confirm
                                    </button>
                                    <button
                                        className="w-32 py-2 bg-gray-500 text-white font-semibold rounded-md hover:bg-gray-600 transition-colors"
                                        onClick={() => setIsModalOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </Modal>
                </div>
            ) : (
                <div className="no-account flex flex-col items-center justify-center">
                    <div className="">
                        <img
                            src="D.Mentor9.PNG"
                            alt="Background"
                            className="no-account-image relative w-[50vw] h-[70vh] xxxsm:w-[27vw] xxsm:w-[30vw] xsm:w-[40vw] sm:w-[45vw] md:w-[50vw] lg:w-[50vw] xl:w-[50vw] 
                                xxxsm:h-[15vh] xxsm:h-[20vh] xsm:h-[30vh] sm:h-[40vh] md:h-[55vh] lg:h-[60vh] xl:h-[70vh]
                                xxxsm:mt-[15px] xxsm:mt-[15px] xsm:mt-[15px] sm:mt-[40px] md:mt-[70px] lg:mt-[80px] xl:mt-[80px]
                                xxxsm:mb-[15px] xxsm:mb-[15px] xsm:mb-[15px] sm:mb-[20px] md:mb-[25px] lg:mb-[30px] xl:mb-[30px]
                                opacity-75 top-0 left-1/2 transform -translate-x-1/2"
                        />
                    </div>
                    <div className="non-profile-container">
                        <div className="flex items-center xxxsm:space-x-[6px] xxsm:space-x-[8px] xsm:space-x-[14px] sm:space-x-[16px] md:space-x-[16px] lg:space-x-[16px] xl:space-x-[16px]
                        xxxsm:text-[9px] xxsm:text-[12px] xsm:text-[14px] sm:text-[14px] md:text-[18px] lg:text-[20px] xl:text-[20px]">
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
















// {isSmallScreen ? (
//     <>
//         <div className="profile-container w-full xxxsm:w-[200px] xxsm:w-[225px] xsm:w-[225px] sm:w-[275px] md:w-[300px] lg:w-[350px] xl:w-[350px] h-auto max-h-[90vh] overflow-y-auto">
//             {/* Username */}
//             {/* <img className="user-icon" alt="home button" src='/D.Mentor5.png' /> */}
//             <div className="username xxxsm:text-[16px] xxsm:text-[18px] xsm:text-[18px] sm:text-[22px] md:text-[24px] lg:text-[28px] xl:text-[28px]
//             xxxsm:mb-[4px] xxsm:mb-[6px] xsm:mb-[6px] sm:mb-[10px] md:mb-[16px] lg:mb-[18px] xl:mb-[20px]
//             xxxsm:mt-[4px] xxsm:mt-[6px] xsm:mt-[6px] sm:mt-[10px] md:mt-[16px] lg:mt-[18px] xl:mt-[20px]">
//                 {name}
//             </div>
//             {/* Lessons & Exercises button (MainPage) */}
//             <button className="main-page-nav-button xxxsm:w-[80%] xxsm:w-[80%] xsm:w-[80%] sm:w-[80%] md:w-[68%] lg:w-[70%] xl:w-[70%]
//                         xxxsm:my-[2px] xxsm:my-[2px] xsm:my-[2px] sm:my-[4px] md:my-[8px] lg:my-[10px] xl:my-[10px]
//                         xxxsm:text-[10px] xxsm:text-[12px] xsm:text-[12px] sm:text-[14px] md:text-[14px] lg:text-[16px] xl:text-[16px]" onClick={handleMainPageNav}>
//                 <div className="relative flex items-center justify-center">
//                     <img className="absolute left-[-5px] xxxsm:w-3 xxsm:w-4 xsm:w-4 sm:w-4 md:w-5 lg:w-5 xl:w-5 h-auto" alt="Submit" src="/learn-icon.svg" />
//                     <span className="ml-0 mr-0">Lessons & Exercises</span>
//                 </div>
//             </button>
//             {/* Check Progress Status */}
//             <button className="check-status-button xxxsm:w-[80%] xxsm:w-[80%] xsm:w-[80%] sm:w-[80%] md:w-[68%] lg:w-[70%] xl:w-[70%]
//                         xxxsm:my-[2px] xxsm:my-[2px] xsm:my-[2px] sm:my-[4px] md:my-[8px] lg:my-[10px] xl:my-[10px]
//                         xxxsm:text-[10px] xxsm:text-[12px] xsm:text-[12px] sm:text-[14px] md:text-[14px] lg:text-[16px] xl:text-[16px]" onClick={handleCheckStatus}>
//                 <div className="relative flex items-center justify-center">
//                     <img className="absolute left-[-5px] xxxsm:w-3 xxsm:w-4 xsm:w-4 sm:w-4 md:w-5 lg:w-5 xl:w-5 h-auto" alt="Submit" src="/check-status.svg" />
//                     <span className="ml-0 mr-0">Check Your Progress</span>
//                 </div>
//             </button>
//             {/* Assessment Page Button */}
//             <button
//                 className="challenges-button-col xxxsm:w-[80%] xxsm:w-[80%] xsm:w-[80%] sm:w-[80%] md:w-[68%] lg:w-[70%] xl:w-[70%]
//             xxxsm:my-[2px] xxsm:my-[2px] xsm:my-[2px] sm:my-[4px] md:my-[8px] lg:my-[10px] xl:my-[10px]
//             xxxsm:text-[10px] xxsm:text-[12px] xsm:text-[12px] sm:text-[14px] md:text-[14px] lg:text-[16px] xl:text-[16px]"
//                 onClick={handleAssessmentNavigation}
//             >
//                 <div className="relative flex items-center justify-center">
//                     <img className="absolute left-[-5px] xxxsm:w-3 xxsm:w-4 xsm:w-4 sm:w-4 md:w-5 lg:w-5 xl:w-5 h-auto" alt="Submit" src="/exam-icon.svg" />
//                     <span className="ml-0 mr-0">Challenge Center</span>
//                 </div>
//             </button>
//             {/* Games Button */}
//             <button
//                 className="games-button-profile-col xxxsm:w-[80%] xxsm:w-[80%] xsm:w-[80%] sm:w-[80%] md:w-[68%] lg:w-[70%] xl:w-[70%]
//                         xxxsm:my-[2px] xxsm:my-[2px] xsm:my-[2px] sm:my-[4px] md:my-[8px] lg:my-[10px] xl:my-[10px]
//                         xxxsm:text-[10px] xxsm:text-[12px] xsm:text-[12px] sm:text-[14px] md:text-[14px] lg:text-[16px] xl:text-[16px]"
//                 onClick={handleGamesNavigation}>
//                 <div className="relative flex items-center justify-center">
//                     <img className="absolute left-0 xxxsm:w-3 xxsm:w-4 xsm:w-4 sm:w-4 md:w-5 lg:w-5 xl:w-5 h-auto mr-2" alt="Games" src="/games-profile.svg" />
//                     <span className="">Game Hub</span> {/* absolute left-1/2 transform -translate-x-1/2 mx-auto*/}
//                 </div>
//             </button>
//             {/* EDIT - Toggle the update name form */}
//             <button className="edit-profile-button xxxsm:w-[80%] xxsm:w-[80%] xsm:w-[80%] sm:w-[80%] md:w-[70%] lg:w-[70%] xl:w-[70%]
//                         xxxsm:my-[2px] xxsm:my-[2px] xsm:my-[2px] sm:my-[4px] md:my-[8px] lg:my-[10px] xl:my-[10px]
//                         xxxsm:text-[10px] xxsm:text-[12px] xsm:text-[12px] sm:text-[14px] md:text-[14px] lg:text-[16px] xl:text-[16px]" onClick={handleEditProfile}>
//                 {isEditing ? (
//                     <div className="relative flex items-center justify-center"> {/* justify-center */}
//                         <img className="absolute left-0 xxxsm:w-3 xxsm:w-4 xsm:w-4 sm:w-4 md:w-5 lg:w-5 xl:w-5 h-auto mr-2" alt="Submit" src="/cancel-edit.svg" />
//                         <span className="">Cancel Edit</span>
//                     </div>
//                 ) : (
//                     <div className="relative flex items-center justify-center">
//                         <img className="absolute left-0 xxxsm:w-3 xxsm:w-4 xsm:w-4 sm:w-4 md:w-5 lg:w-5 xl:w-5 h-auto mr-2" alt="Submit" src="/edit-profile.svg" />
//                         <span className="">Edit Username</span>
//                     </div>
//                 )}
//             </button>
//             {isEditing && (
//                 <div className="update-profile">
//                     <label htmlFor="newName" className="input-label xxxsm:text-[10px] xxsm:text-[12px] xsm:text-[12px] sm:text-[14px] md:text-[14px] lg:text-[16px] xl:text-[16px]
//                         xxxsm:mb-[2px] xxsm:mb-[3px] xsm:mb-[3px] sm:mb-[3px] md:mb-[5px] lg:mb-[5px] xl:mb-[5px]">Update Username</label>
//                     <input
//                         id="newName"
//                         className="input-field xxxsm:w-[80%] xxsm:w-[80%] xsm:w-[80%] sm:w-[80%] md:w-[70%] lg:w-[70%] xl:w-[70%]
//                     xxxsm:text-[12px] xxsm:text-[14px] xsm:text-[14px] sm:text-[16px] md:text-[16px] lg:text-[18px] xl:text-[18px]
//                     xxxsm:mb-[2px] xxsm:mb-[3px] xsm:mb-[3px] sm:mb-[5px] md:mb-[12px] lg:mb-[15px] xl:mb-[15px]"
//                         type="text"
//                         value={newName}
//                         onChange={(e) => setNewName(e.target.value)}
//                     />

//                     <label htmlFor="emailConfirmation" className="input-label xxxsm:text-[10px] xxsm:text-[12px] xsm:text-[12px] sm:text-[14px] md:text-[14px] lg:text-[16px] xl:text-[16px]
//                         xxxsm:mb-[2px] xxsm:mb-[3px] xsm:mb-[3px] sm:mb-[3px] md:mb-[5px] lg:mb-[5px] xl:mb-[5px]">Confirm Email to Update</label>
//                     <input
//                         id="emailConfirmation"
//                         className="input-field xxxsm:w-[80%] xxsm:w-[80%] xsm:w-[80%] sm:w-[80%] md:w-[70%] lg:w-[70%] xl:w-[70%]
//                 xxxsm:text-[12px] xxsm:text-[14px] xsm:text-[14px] sm:text-[16px] md:text-[16px] lg:text-[18px] xl:text-[18px]
//                     xxxsm:mb-[2px] xxsm:mb-[3px] xsm:mb-[3px] sm:mb-[5px] md:mb-[12px] lg:mb-[15px] xl:mb-[15px]"
//                         type="email"
//                         value={emailConfirmation}
//                         onChange={(e) => setEmailConfirmation(e.target.value)}
//                     />

//                     <button className="update-profile-button xxxsm:w-[80%] xxsm:w-[80%] xsm:w-[80%] sm:w-[80%] md:w-[70%] lg:w-[70%] xl:w-[70%]
//                         xxxsm:my-[2px] xxsm:my-[2px] xsm:my-[2px] sm:my-[4px] md:my-[8px] lg:my-[10px] xl:my-[10px]
//                         xxxsm:text-[10px] xxsm:text-[12px] xsm:text-[12px] sm:text-[14px] md:text-[14px] lg:text-[16px] xl:text-[16px]" onClick={handleUpdateProfile}>
//                         <div className="relative flex items-center justify-center">
//                             <img className="absolute left-0 xxxsm:w-3 xxsm:w-4 xsm:w-4 sm:w-4 md:w-5 lg:w-5 xl:w-5 h-auto" alt="Submit" src="/feather.svg" />
//                             <span className="">Update Username</span>
//                         </div>
//                     </button>
//                 </div>
//             )}
//             {/* Delete profile button */}
//             <button className="delete-account-button xxxsm:w-[80%] xxsm:w-[80%] xsm:w-[80%] sm:w-[80%] md:w-[70%] lg:w-[70%] xl:w-[70%]
//                         xxxsm:mt-[15px] xxsm:mt-[20px] xsm:mt-[20px] sm:mt-[30px] md:mt-[30px] lg:mt-[40px] xl:mt-[40px]
//                         xxxsm:text-[10px] xxsm:text-[12px] xsm:text-[12px] sm:text-[14px] md:text-[16px] lg:text-[16px] xl:text-[16px]" onClick={handleDeleteProfile}>
//                 <div className="relative flex items-center justify-center">
//                     <img className="del-profile-icon absolute left-0 xxxsm:w-3 xxsm:w-4 xsm:w-4 sm:w-4 md:w-5 lg:w-5 xl:w-5 h-auto" alt="Submit" src="/delete-user.svg" />
//                     <span className="">Delete Profile</span>
//                 </div>
//             </button>
//             {/* Sign out */}
//             <button className="signout-button xxxsm:w-[80%] xxsm:w-[80%] xsm:w-[80%] sm:w-[80%] md:w-[70%] lg:w-[70%] xl:w-[70%]
//                         xxxsm:my-[2px] xxsm:my-[2px] xsm:my-[3px] sm:my-[5px] md:my-[12px] lg:my-[15px] xl:my-[15px]
//                         xxxsm:text-[10px] xxsm:text-[12px] xsm:text-[12px] sm:text-[14px] md:text-[14px] lg:text-[16px] xl:text-[16px]" onClick={handleSignOut}>
//                 <div className="relative flex items-center justify-center">
//                     <img className="absolute left-0 xxxsm:w-3 xxsm:w-4 xsm:w-4 sm:w-4 md:w-5 lg:w-5 xl:w-5 h-auto" alt="Submit" src="/log-out.svg" />
//                     <span className="">Sign Out</span>
//                 </div>
//             </button>
//         </div>
//         <ToastContainer pauseOnFocusLoss={false} limit={1} />
//         <Modal
//             isOpen={isModalOpen}
//             onRequestClose={() => setIsModalOpen(false)}
//             contentLabel="Confirm Delete Profile"
//             style={{
//                 content: {
//                     top: '50%',
//                     left: '50%',
//                     right: 'auto',
//                     bottom: 'auto',
//                     transform: 'translate(-50%, -50%)',
//                     background: 'rgba(3, 78, 144, 0.95)',
//                     borderRadius: '20px',
//                     padding: '20px',
//                     maxWidth: '400px',
//                     width: '90%'
//                 },
//                 overlay: {
//                     backgroundColor: 'rgba(0, 0, 0, 0.5)'
//                 }
//             }}
//         >
//             <h3 className="text-center text-lg font-bold text-white mb-4">
//                 Confirm Delete Profile
//             </h3>
//             <p className="text-center text-sm text-gray-200 mb-4">
//                 Please re-enter your password to confirm deletion. This action cannot be undone.
//             </p>
//             <input
//                 type="password"
//                 placeholder="Enter your password"
//                 className="w-full p-2 mb-4 rounded-md border border-gray-500 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 value={passwordForDeletion}
//                 onChange={(e) => setPasswordForDeletion(e.target.value)}
//             />
//             {notification && (
//                 <p className="text-sm text-center text-red-500 font-bold mb-4">
//                     {notification}
//                 </p>
//             )}
//             <div className="flex justify-around">
//                 <button
//                     className="w-32 py-2 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 transition-colors"
//                     onClick={confirmDeleteProfile}
//                 >
//                     Confirm
//                 </button>
//                 <button
//                     className="w-32 py-2 bg-gray-500 text-white font-semibold rounded-md hover:bg-gray-600 transition-colors"
//                     onClick={() => setIsModalOpen(false)}
//                 >
//                     Cancel
//                 </button>
//             </div>
//         </Modal>
//     </>
// ) : (
//     <>
//         {/* LEFT container */}
//         <div className="profile-container-left w-full xxxsm:w-[200px] xxsm:w-[225px] xsm:w-[225px] sm:w-[275px] md:w-[300px] lg:w-[350px] xl:w-[350px] h-auto max-h-[90vh] overflow-y-auto"> {/* xsm:h-[200px] sm:h-[250px] md:h-[250px] lg:h-[300px] xl:h-[300px] */}
//             {/* Username */}
//             {/* <img className="user-icon" alt="home button" src='/D.Mentor5.png' /> */}
//             <div className="username xxxsm:text-[16px] xxsm:text-[18px] xsm:text-[18px] sm:text-[22px] md:text-[24px] lg:text-[28px] xl:text-[28px]
//             xxxsm:mb-[4px] xxsm:mb-[6px] xsm:mb-[6px] sm:mb-[10px] md:mb-[16px] lg:mb-[18px] xl:mb-[20px]
//             xxxsm:mt-[4px] xxsm:mt-[6px] xsm:mt-[6px] sm:mt-[10px] md:mt-[16px] lg:mt-[18px] xl:mt-[20px]">
//                 {name}
//             </div>
//             {/* <div className="relative inline-block group">
//             <button className="main-page-nav-button xxxsm:w-[80%] xxsm:w-[80%] xsm:w-[80%] sm:w-[80%] md:w-[68%] lg:w-[70%] xl:w-[130%]
//                         xxxsm:my-[2px] xxsm:my-[2px] xsm:my-[2px] sm:my-[4px] md:my-[8px] lg:my-[10px] xl:my-[10px]
//                         xxxsm:text-[10px] xxsm:text-[12px] xsm:text-[12px] sm:text-[14px] md:text-[14px] lg:text-[16px] xl:text-[16px]" onClick={handleMainPageNav}>
//                 <div className="relative flex items-center justify-center">
//                     <img className="absolute left-[-5px] xxxsm:w-3 xxsm:w-4 xsm:w-4 sm:w-4 md:w-5 lg:w-5 xl:w-5 h-auto" alt="Submit" src="/learn-icon.svg" />
//                     <span className="ml-0 mr-0">Lessons & Exercises</span>
//                 </div>
//             </button>
//             <div className="absolute xxxsm:bottom-11 xxsm:bottom-11 xsm:bottom-11 sm:bottom-14 md:bottom-14 lg:bottom-16 xl:bottom-16 
//                         left-1/2 transform -translate-x-1/2 mb-2 bg-teal-600 text-white
//                         text-xs rounded-lg py-1 pl-1 pr-0 w-[150px] opacity-0 group-hover:opacity-100 
//                         transition-opacity duration-500 z-10">
//                 <img className="w-24 h-auto " alt="" src="/notFound.png" />
//                 The Cloaked Mentor Awaits
//                 <div className="absolute left-1/2 transform -translate-x-1/2 w-0 h-0 border-t-8 border-t-teal-600 border-x-8 border-x-transparent top-full"></div>
//             </div>
//         </div> */}
//             {/* Check Progress Status */}
//             <button className="check-status-button xxxsm:w-[80%] xxsm:w-[80%] xsm:w-[80%] sm:w-[80%] md:w-[68%] lg:w-[70%] xl:w-[70%]
//                         xxxsm:my-[2px] xxsm:my-[2px] xsm:my-[2px] sm:my-[4px] md:my-[8px] lg:my-[10px] xl:my-[10px]
//                         xxxsm:text-[20px] xxsm:text-[11px] xsm:text-[12px] sm:text-[14px] md:text-[14px] lg:text-[16px] xl:text-[16px]" onClick={handleCheckStatus}>
//                 <div className="relative flex items-center justify-center">
//                     <img className="absolute left-[-5px] xxxsm:w-3 xxsm:w-4 xsm:w-4 sm:w-4 md:w-5 lg:w-5 xl:w-5 h-auto" alt="Submit" src="/check-status.svg" />
//                     <span className="ml-0 mr-0">Check Your Progress</span>
//                 </div>
//             </button>
//             {/* EDIT - Toggle the update name form */}
//             <button className="edit-profile-button xxxsm:w-[80%] xxsm:w-[80%] xsm:w-[80%] sm:w-[80%] md:w-[70%] lg:w-[70%] xl:w-[70%]
//                         xxxsm:my-[2px] xxsm:my-[2px] xsm:my-[2px] sm:my-[4px] md:my-[8px] lg:my-[10px] xl:my-[10px]
//                         xxxsm:text-[10px] xxsm:text-[12px] xsm:text-[12px] sm:text-[14px] md:text-[14px] lg:text-[16px] xl:text-[16px]" onClick={handleEditProfile}>
//                 {isEditing ? (
//                     <div className="relative flex items-center justify-center"> {/* justify-center */}
//                         <img className="absolute left-0 xxxsm:w-3 xxsm:w-4 xsm:w-4 sm:w-4 md:w-5 lg:w-5 xl:w-5 h-auto mr-2" alt="Submit" src="/cancel-edit.svg" />
//                         <span className="">Cancel Edit</span>
//                     </div>
//                 ) : (
//                     <div className="relative flex items-center justify-center">
//                         <img className="absolute left-0 xxxsm:w-3 xxsm:w-4 xsm:w-4 sm:w-4 md:w-5 lg:w-5 xl:w-5 h-auto mr-2" alt="Submit" src="/edit-profile.svg" />
//                         <span className="">Edit Username</span>
//                     </div>
//                 )}
//             </button>
//             {isEditing && (
//                 <div className="update-profile">
//                     <label htmlFor="newName" className="input-label xxxsm:text-[10px] xxsm:text-[12px] xsm:text-[12px] sm:text-[14px] md:text-[14px] lg:text-[16px] xl:text-[16px]
//                         xxxsm:mb-[2px] xxsm:mb-[3px] xsm:mb-[3px] sm:mb-[3px] md:mb-[5px] lg:mb-[5px] xl:mb-[5px]">Update Username</label>
//                     <input
//                         id="newName"
//                         className="input-field xxxsm:w-[80%] xxsm:w-[80%] xsm:w-[80%] sm:w-[80%] md:w-[70%] lg:w-[70%] xl:w-[70%]
//                     xxxsm:text-[12px] xxsm:text-[14px] xsm:text-[14px] sm:text-[16px] md:text-[16px] lg:text-[18px] xl:text-[18px]
//                     xxxsm:mb-[2px] xxsm:mb-[3px] xsm:mb-[3px] sm:mb-[5px] md:mb-[12px] lg:mb-[15px] xl:mb-[15px]"
//                         type="text"
//                         value={newName}
//                         onChange={(e) => setNewName(e.target.value)}
//                     />

//                     <label htmlFor="emailConfirmation" className="input-label xxxsm:text-[10px] xxsm:text-[12px] xsm:text-[12px] sm:text-[14px] md:text-[14px] lg:text-[16px] xl:text-[16px]
//                         xxxsm:mb-[2px] xxsm:mb-[3px] xsm:mb-[3px] sm:mb-[3px] md:mb-[5px] lg:mb-[5px] xl:mb-[5px]">Confirm Email to Update</label>
//                     <input
//                         id="emailConfirmation"
//                         className="input-field xxxsm:w-[80%] xxsm:w-[80%] xsm:w-[80%] sm:w-[80%] md:w-[70%] lg:w-[70%] xl:w-[70%]
//                 xxxsm:text-[12px] xxsm:text-[14px] xsm:text-[14px] sm:text-[16px] md:text-[16px] lg:text-[18px] xl:text-[18px]
//                     xxxsm:mb-[2px] xxsm:mb-[3px] xsm:mb-[3px] sm:mb-[5px] md:mb-[12px] lg:mb-[15px] xl:mb-[15px]"
//                         type="email"
//                         value={emailConfirmation}
//                         onChange={(e) => setEmailConfirmation(e.target.value)}
//                     />

//                     <button className="update-profile-button xxxsm:w-[80%] xxsm:w-[80%] xsm:w-[80%] sm:w-[80%] md:w-[70%] lg:w-[70%] xl:w-[70%]
//                         xxxsm:my-[2px] xxsm:my-[2px] xsm:my-[2px] sm:my-[4px] md:my-[8px] lg:my-[10px] xl:my-[10px]
//                         xxxsm:text-[10px] xxsm:text-[12px] xsm:text-[12px] sm:text-[14px] md:text-[14px] lg:text-[16px] xl:text-[16px]" onClick={handleUpdateProfile}>
//                         <div className="relative flex items-center justify-center">
//                             <img className="absolute left-0 xxxsm:w-3 xxsm:w-4 xsm:w-4 sm:w-4 md:w-5 lg:w-5 xl:w-5 h-auto" alt="Submit" src="/feather.svg" />
//                             <span className="">Update Username</span>
//                         </div>
//                     </button>
//                 </div>
//             )}
//             {/* Delete profile button */}
//             <button className="delete-account-button xxxsm:w-[80%] xxsm:w-[80%] xsm:w-[80%] sm:w-[80%] md:w-[70%] lg:w-[70%] xl:w-[70%]
//                         xxxsm:mt-[15px] xxsm:mt-[20px] xsm:mt-[20px] sm:mt-[30px] md:mt-[30px] lg:mt-[40px] xl:mt-[40px]
//                         xxxsm:text-[10px] xxsm:text-[12px] xsm:text-[12px] sm:text-[14px] md:text-[16px] lg:text-[16px] xl:text-[16px]" onClick={handleDeleteProfile}>
//                 <div className="relative flex items-center justify-center">
//                     <img className="del-profile-icon absolute left-0 xxxsm:w-3 xxsm:w-4 xsm:w-4 sm:w-4 md:w-5 lg:w-5 xl:w-5 h-auto" alt="Submit" src="/delete-user.svg" />
//                     <span className="">Delete Profile</span>
//                 </div>
//             </button>
//             {/* Sign out */}
//             <button className="signout-button xxxsm:w-[80%] xxsm:w-[80%] xsm:w-[80%] sm:w-[80%] md:w-[70%] lg:w-[70%] xl:w-[70%]
//                         xxxsm:my-[2px] xxsm:my-[2px] xsm:my-[3px] sm:my-[5px] md:my-[12px] lg:my-[15px] xl:my-[15px]
//                         xxxsm:text-[10px] xxsm:text-[12px] xsm:text-[12px] sm:text-[14px] md:text-[14px] lg:text-[16px] xl:text-[16px]" onClick={handleSignOut}>
//                 <div className="relative flex items-center justify-center">
//                     <img className="absolute left-0 xxxsm:w-3 xxsm:w-4 xsm:w-4 sm:w-4 md:w-5 lg:w-5 xl:w-5 h-auto" alt="Submit" src="/log-out.svg" />
//                     <span className="">Sign Out</span>
//                 </div>
//             </button>
//         </div>
//         {/* RIGHT container */}
//         <div className="profile-container-right w-full xxxsm:w-[200px] xxsm:w-[225px] xsm:w-[225px] sm:w-[275px] md:w-[300px] lg:w-[350px] xl:w-[350px] h-auto max-h-[90vh] overflow-y-auto"> {/* xsm:h-[200px] sm:h-[250px] md:h-[250px] lg:h-[300px] xl:h-[300px] */}
//             {/* Username */}
//             {/* <div className="items-center justify-center">

            
//             <img className="profile-img-col w-14" alt="D-Mentor" src='/notFound.png' />
//             </div> */}
//             <div className="learning-div-title xxxsm:text-[16px] xxsm:text-[18px] xsm:text-[18px] sm:text-[22px] md:text-[24px] lg:text-[28px] xl:text-[28px]
//             xxxsm:mb-[4px] xxsm:mb-[6px] xsm:mb-[6px] sm:mb-[10px] md:mb-[16px] lg:mb-[18px] xl:mb-[20px]
//             xxxsm:mt-[4px] xxsm:mt-[6px] xsm:mt-[6px] sm:mt-[10px] md:mt-[16px] lg:mt-[18px] xl:mt-[20px]">
//                 Learning Hub
//             </div>
//             {/* <div className="relative inline-block group">
//             <button className="main-page-nav-button xxxsm:w-[80%] xxsm:w-[80%] xsm:w-[80%] sm:w-[80%] md:w-[68%] lg:w-[70%] xl:w-[130%]
//                         xxxsm:my-[2px] xxsm:my-[2px] xsm:my-[2px] sm:my-[4px] md:my-[8px] lg:my-[10px] xl:my-[10px]
//                         xxxsm:text-[10px] xxsm:text-[12px] xsm:text-[12px] sm:text-[14px] md:text-[14px] lg:text-[16px] xl:text-[16px]" onClick={handleMainPageNav}>
//                 <div className="relative flex items-center justify-center">
//                     <img className="absolute left-[-5px] xxxsm:w-3 xxsm:w-4 xsm:w-4 sm:w-4 md:w-5 lg:w-5 xl:w-5 h-auto" alt="Submit" src="/learn-icon.svg" />
//                     <span className="ml-0 mr-0">Lessons & Exercises</span>
//                 </div>
//             </button>
//             <div className="absolute xxxsm:bottom-11 xxsm:bottom-11 xsm:bottom-11 sm:bottom-14 md:bottom-14 lg:bottom-16 xl:bottom-16 
//                         left-1/2 transform -translate-x-1/2 mb-2 bg-teal-600 text-white
//                         text-xs rounded-lg py-1 pl-1 pr-0 w-[150px] opacity-0 group-hover:opacity-100 
//                         transition-opacity duration-500 z-10">
//                 <img className="w-24 h-auto " alt="" src="/notFound.png" />
//                 The Cloaked Mentor Awaits
//                 <div className="absolute left-1/2 transform -translate-x-1/2 w-0 h-0 border-t-8 border-t-teal-600 border-x-8 border-x-transparent top-full"></div>
//             </div>
//         </div> */}
//             {/* Lessons & Exercises button (MainPage) */}
//             <button className="main-page-nav-button xxxsm:w-[80%] xxsm:w-[80%] xsm:w-[80%] sm:w-[80%] md:w-[68%] lg:w-[70%] xl:w-[70%]
//                         xxxsm:my-[2px] xxsm:my-[2px] xsm:my-[2px] sm:my-[4px] md:my-[8px] lg:my-[10px] xl:my-[10px]
//                         xxxsm:text-[10px] xxsm:text-[12px] xsm:text-[12px] sm:text-[14px] md:text-[14px] lg:text-[16px] xl:text-[16px]" onClick={handleMainPageNav}>
//                 <div className="relative flex items-center justify-center">
//                     <img className="absolute left-[-5px] xxxsm:w-3 xxsm:w-4 xsm:w-4 sm:w-4 md:w-5 lg:w-5 xl:w-5 h-auto" alt="Submit" src="/learn-icon.svg" />
//                     <span className="ml-0 mr-0">Lessons & Exercises</span>
//                 </div>
//             </button>
//             {/* Assessment Page Button */}
//             <button
//                 className="challenges-button-row xxxsm:w-[80%] xxsm:w-[80%] xsm:w-[80%] sm:w-[80%] md:w-[68%] lg:w-[70%] xl:w-[70%]
//             xxxsm:my-[2px] xxsm:my-[2px] xsm:my-[2px] sm:my-[4px] md:my-[8px] lg:my-[10px] xl:my-[10px]
//             xxxsm:text-[10px] xxsm:text-[12px] xsm:text-[12px] sm:text-[14px] md:text-[14px] lg:text-[16px] xl:text-[16px]"
//                 onClick={handleAssessmentNavigation}
//             >
//                 <div className="relative flex items-center justify-center">
//                     <img className="absolute left-[-5px] xxxsm:w-3 xxsm:w-4 xsm:w-4 sm:w-4 md:w-5 lg:w-5 xl:w-5 h-auto" alt="Submit" src="/exam-icon.svg" />
//                     <span className="ml-0 mr-0">Challenge Center</span>
//                 </div>
//             </button>
//             {/* Games Button */}
//             <button
//                 className="games-button-profile-row xxxsm:w-[80%] xxsm:w-[80%] xsm:w-[80%] sm:w-[80%] md:w-[68%] lg:w-[70%] xl:w-[70%]
//                         xxxsm:mt-[2px] xxsm:mt-[60px] xsm:mt-[62px] sm:mt-[77px] md:mt-[88px] lg:mt-[100px] xl:mt-[100px]
//                         xxxsm:mb-[2px] xxsm:mb-[2px] xsm:mb-[3px] sm:mb-[5px] md:mb-[12px] lg:mb-[15px] xl:mb-[15px]
//                         xxxsm:text-[10px] xxsm:text-[12px] xsm:text-[12px] sm:text-[14px] md:text-[14px] lg:text-[16px] xl:text-[16px]"
//                 onClick={handleGamesNavigation}>
//                 <div className="relative flex items-center justify-center">
//                     <img className="absolute left-0 xxxsm:w-3 xxsm:w-4 xsm:w-4 sm:w-4 md:w-5 lg:w-5 xl:w-5 h-auto mr-2" alt="Games" src="/games-profile.svg" />
//                     <span className="">Game Hub</span> {/* absolute left-1/2 transform -translate-x-1/2 mx-auto*/}
//                 </div>
//             </button>
//         </div>
//         <ToastContainer pauseOnFocusLoss={false} limit={1} />
//         <Modal
//             isOpen={isModalOpen}
//             onRequestClose={() => setIsModalOpen(false)}
//             contentLabel="Confirm Delete Profile"
//             style={{
//                 content: {
//                     top: '50%',
//                     left: '50%',
//                     right: 'auto',
//                     bottom: 'auto',
//                     transform: 'translate(-50%, -50%)',
//                     background: 'rgba(3, 78, 144, 0.95)',
//                     borderRadius: '20px',
//                     padding: '20px',
//                     maxWidth: '400px',
//                     width: '90%'
//                 },
//                 overlay: {
//                     backgroundColor: 'rgba(0, 0, 0, 0.5)'
//                 }
//             }}
//         >
//             <h3 className="text-center text-lg font-bold text-white mb-4">
//                 Confirm Delete Profile
//             </h3>
//             <p className="text-center text-sm text-gray-200 mb-4">
//                 Please re-enter your password to confirm deletion. This action cannot be undone.
//             </p>
//             <input
//                 type="password"
//                 placeholder="Enter your password"
//                 className="w-full p-2 mb-4 rounded-md border border-gray-500 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 value={passwordForDeletion}
//                 onChange={(e) => setPasswordForDeletion(e.target.value)}
//             />
//             {notification && (
//                 <p className="text-sm text-center text-red-500 font-bold mb-4">
//                     {notification}
//                 </p>
//             )}
//             <div className="flex justify-around">
//                 <button
//                     className="w-32 py-2 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 transition-colors"
//                     onClick={confirmDeleteProfile}
//                 >
//                     Confirm
//                 </button>
//                 <button
//                     className="w-32 py-2 bg-gray-500 text-white font-semibold rounded-md hover:bg-gray-600 transition-colors"
//                     onClick={() => setIsModalOpen(false)}
//                 >
//                     Cancel
//                 </button>
//             </div>
//         </Modal>
//     </>
// )}