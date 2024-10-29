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
            <div className="login-container w-full xxsm:w-[250px] xsm:w-[300px] sm:w-[350px] md:w-[350px] lg:w-[400px] xl:w-[400px] h-auto xxsm:h-[180px] xsm:h-[200px] sm:h-[250px] md:h-[250px] lg:h-[300px] xl:h-[300px]">
                <h5 className="login-title xsm:text-[18px] sm:text-[26px] md:text-[26px] lg:text-[30px] xl:text-[30px]
                            xsm:mb-[10px] sm:mb-[20px] md:mb-[20px] lg:mb-[20px] xl:mb-[20px]">Login</h5>
                <form onSubmit={(e) => { e.preventDefault(); handleLogin(email, password) }}>
                    <div className="email">
                        <input 
                        className="w-full xsm:h-[35px] sm:h-[46px] md:h-[46px] lg:h-[46px] xl:h-[46px] p-2 rounded-md border border-white focus:outline-none focus:ring-2 focus:ring-blue-300" 
                        type="email" 
                        placeholder="Email" 
                        onChange={(e) => setEmail(e.target.value)} 
                        required />
                    </div>
                    <div className="password">
                        <input 
                        className="w-full xsm:h-[35px] sm:h-[46px] md:h-[46px] lg:h-[46px] xl:h-[46px] p-2 rounded-md border border-white focus:outline-none focus:ring-2 focus:ring-blue-300" 
                        type="password" 
                        placeholder="Password" 
                        onChange={(e) => setPassword(e.target.value)} 
                        required />
                    </div>
                    <button className="login-button w-full xxsm:w-[60px] xsm:w-[70px] sm:w-[80px] md:w-[80px] lg:w-[90px] xl:w-[90px] h-auto xsm:h-[30px] sm:h-[38px] md:h-[38px] lg:h-[42px] xl:h-[42px]
                                    xsm:mt-[32px] sm:mt-[32px] md:mt-[32px] lg:mt-[70px] xl:mt-[70px]" type="submit">
                        <div className="flex items-center justify-center">
                            <img className="xsm:w-3 sm:w-4 md:w-4 lg:w-5 xl:w-5 mr-2 -ml-2 " alt="Submit" src="/log-in.svg" />
                            <span className="ml-0 -mr-1 xsm:text-[14px] sm:text-[14px] md:text-[14px] lg:text-[16px] xl:text-[16px]">Login</span>
                        </div>
                    </button>
                    <p className="xsm:text-[12px] sm:text-[14px] md:text-[14px] lg:text-[16px]">Don't have an Account?<Link className="link-to-login-signup" to="/signup"> Sign Up</Link></p>
                    {/* <img className="w-9 h-auto mr-0" alt="Submit" src="/submit3.svg"/> */}
                </form>
                {notification && <p className="login-notification xsm:text-[10px] sm:text-[12px] md:text-[16px] lg:text-[16px]">{notification}</p>}
            </div>
        </div>
    )

}

export default Login






// return (
//     <div className="login-page">
//         <div className="login-container xsh:py-4 xsh:px-2 sm:py-8 sm:px-4">
//             <h5 className="login-title text-lg xsh:text-base sm:text-xl">Login</h5>
//             <form onSubmit={(e) => { e.preventDefault(); handleLogin(email, password) }}>
//                 <div className="email xsh:mb-2">
//                     <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required className="w-full p-2 xsh:p-1 sm:p-3"/>
//                 </div>
//                 <div className="password xsh:mb-2">
//                     <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required className="w-full p-2 xsh:p-1 sm:p-3"/>
//                 </div>
//                 <button className="login-button w-full py-2 xsh:py-1 sm:py-3" type="submit">
//                     <div className="flex items-center justify-center">
//                         <img className="w-5 h-auto mr-2 -ml-2" alt="Submit" src="/log-in.svg" />
//                         <span className="ml-0 -mr-1">Login</span>
//                     </div>
//                 </button>
//                 <p className="xsh:mt-0">Don't have an Account?<Link className="link-to-login-signup" to="/signup"> Sign Up</Link></p>
//                 {/* <img className="w-9 h-auto mr-0" alt="Submit" src="/submit3.svg"/> */}
//             </form>
//             {notification && <p className="login-notification">{notification}</p>}
//         </div>
//     </div>
// )


// return (
//     <div className="login-page">
//         <div className="login-container xsh:py-4 xsh:px-2 sm:py-8 sm:px-4">
//             <h5 className="login-title text-lg xsh:text-base sm:text-xl">Login</h5>
//             <form onSubmit={(e) => { e.preventDefault(); handleLogin(email, password) }}>
//                 <div className="email mb-4 xsh:mb-2">
//                     <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required className="w-full p-2 xsh:p-1 sm:p-3" />
//                 </div>
//                 <div className="password mb-4 xsh:mb-2">
//                     <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required className="w-full p-2 xsh:p-1 sm:p-3" />
//                 </div>
//                 <button className="login-button w-full py-2 xsh:py-1 sm:py-3" type="submit">
//                     <div className="flex items-center justify-center">
//                         <img className="w-5 h-auto mr-2 -ml-2" alt="Submit" src="/log-in.svg" />
//                         <span className="ml-0 -mr-1">Login</span>
//                     </div>
//                 </button>
//                 <p className="mt-4 xsh:mt-2">Don't have an Account?<Link className="link-to-login-signup" to="/signup"> Sign Up</Link></p>
//             </form>
//             {notification && <p className="login-notification mt-4 xsh:mt-2">{notification}</p>}
//         </div>
//     </div>
// );

















// return (
//     <div className="login-page">
//         <div className="login-container xsh:py-4 xsh:px-2 sm:py-8 sm:px-4">
//             <h5 className="login-title">Login</h5>
//             <form onSubmit={(e) => { e.preventDefault(); handleLogin(email, password) }}>
//                 <div className="email">
//                     <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required/>
//                 </div>
//                 <div className="password">
//                     <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required/>
//                 </div>
//                 <button className="login-button" type="submit">
//                     <div className="flex items-center justify-center">
//                         <img className="w-5 h-auto mr-2 -ml-2" alt="Submit" src="/log-in.svg" />
//                         <span className="ml-0 -mr-1">Login</span>
//                     </div>
//                 </button>
//                 <p>Don't have an Account?<Link className="link-to-login-signup" to="/signup"> Sign Up</Link></p>
//                 {/* <img className="w-9 h-auto mr-0" alt="Submit" src="/submit3.svg"/> */}
//             </form>
//             {notification && <p className="login-notification">{notification}</p>}
//         </div>
//     </div>
// )