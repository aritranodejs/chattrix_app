import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Base URL (Option 1: From .env file, Option 2: Hardcoded)
  const baseURL = process.env.REACT_APP_API_URL;

  const handleLogin = async () => {
    if (email.trim() && password.trim()) {
      try {
        // Send API request to login
        const response = await axios.post(`${baseURL}/auth/login`, {
          email,
          password,
        });

        if (response.status === 200) {
          // Simulate user login - store user info in localStorage
          localStorage.setItem('id', response?.data?.data?.user?._id);
          localStorage.setItem('token', response?.data?.data?.user?.authToken); // Assuming the API returns a token
          localStorage.setItem('email', email);
          // Redirect to the chat interface
          navigate('/chat');
        }
      } catch (error) {
        // Handle error (invalid login, etc.)
        setError('Invalid email or password. Please try again.');
      }
    } else {
      setError('Please enter valid email and password.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login to Chattrix</h2>
        {error && <div className="error-message">{error}</div>}
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Login</button>
      </div>
    </div>
  );
};

export default Login;
