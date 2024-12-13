import React, { useContext } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import { FaGoogle } from "react-icons/fa";
import 'react-toastify/dist/ReactToastify.css';
import '../styles/loginpage.css';
import { UserContext } from "../App";

const LoginPage = () => {
    const navigate = useNavigate();
    const {setUser} = useContext(UserContext);

    const login = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                const res = await axios.post(`${import.meta.env.VITE_BASE_API_URL}/user`, {
                    accessToken: tokenResponse.access_token
                }, {withCredentials: true});
    
                if (res.status === 200) {
                    setUser(res.data.user);
                    toast.success(res.data.message);
                    navigate('/');
                } else {
                    toast.error(res.data.error);
                }
            } catch (error) {
                toast.error("Failed to log in.");
                console.error("Error during login:", error);
            }
        },
        onError: (error) => {
            console.error("Login Error:", error);
            toast.error("Login Failed");
        },
        scope: "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile",
    });
    
    return (
        <div className="login-container">
            <header className="login-header">
                <h1>Data Nexify</h1>
                <p>Solve Your Business Challenges with DataNexify</p>
            </header>
            <div className="login-box">
                <h2>Welcome!</h2>
                <p>Sign in to continue</p>
                <div className="login-btn">
                    <button onClick={() => login()} className="google-login-btn">
                        <FaGoogle className="icon"/> &nbsp;Sign in with Google
                    </button>
                </div>
            </div>
            <ToastContainer autoClose={3000} position="top-right" />
        </div>
    );
};

export default LoginPage;
