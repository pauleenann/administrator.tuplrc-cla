import React, { useState, useEffect } from 'react';
import './LoginPage.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    
    // Check if the user is already logged in when the component mounts
    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/user/check-session', { withCredentials: true });
                
                if (response.data.loggedIn) {
                    // If the user is logged in, redirect to the dashboard
                    navigate('/dashboard');
                }
            } catch (error) {
                console.error('Error checking session:', error);
            }
        };

        checkLoginStatus();
    }, [navigate]);

    // Function to handle login
    const login = async () => {
        if (!username || !password) {
            setError("Both fields are required.");
            return;
        }

        try {
            setLoading(true);

            const response = await axios.post(
                'http://localhost:3001/api/user/login',
                { username, password },
                { withCredentials: true } // Include credentials for secure cookie handling
            );

            if (response.status === 200) {
                console.log("Login successful:", response.data);
                // Redirect to dashboard
                navigate('/dashboard');
                
            }
        } catch (err) {
            setError(err.response?.data?.message || "An error occurred during login.");
        } finally {
            setLoading(false);
        }
    };

    // Handle "Enter" key press
    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            login();
        }
    };

    return (
        <div className='login-container'>
            <div className='wrapper'>
                <div className="logo-container">
                    <img src="/tuplogo.png" alt="Logo 1" className="logo" />
                    <img src="/clalogo.png" alt="Logo 2" className="logo" />
                </div>
                <div>
                    <h1>College of Liberal Arts</h1>
                    <h2>Learning Resource Center</h2>
                </div>
                <div className='input-box'>
                    <input
                        type="text"
                        placeholder="Enter Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <input
                        type="password"
                        placeholder="Enter Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                </div>
                {error && <div className="error-message">{error}</div>}
                <div className="login">
                    {loading ? (
                        <div className="spinner-grow text-danger" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    ) : (
                        <button className="btn login-btn" onClick={login}>
                            Login
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
