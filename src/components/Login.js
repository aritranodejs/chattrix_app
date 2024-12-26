import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();

  // Base URL 
  const baseURL = process.env.REACT_APP_API_URL;

  const validateFields = () => {
    let isValid = true;

    // Validate email
    if (!email.trim()) {
      setEmailError('Email is required.');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email address.');
      isValid = false;
    } else {
      setEmailError('');
    }

    // Validate password
    if (!password.trim()) {
      setPasswordError('Password is required.');
      isValid = false;
    } else {
      setPasswordError('');
    }

    return isValid;
  };

  const handleLogin = async () => {
    // Validate fields before submitting
    if (validateFields()) {
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
          onKeyUp={validateFields} // Validate on keyup
        />
        {emailError && <div className="error-message">{emailError}</div>}

        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyUp={validateFields} // Validate on keyup
        />
        {passwordError && <div className="error-message">{passwordError}</div>}

        <p className="register-link"  style={{ marginTop: '1rem', textAlign: 'center', color: 'black' }}>
          Don't have an account? <a href="/register">Register</a>
        </p>
        <button onClick={handleLogin}>Login</button>
        <p className='forgot-password' style={{ marginTop: '1rem', textAlign: 'center', color: 'black' }}><a href="/forgot-password">Forgot Your Password?</a></p>
      </div>
    </div>
  );
};

export default Login;
