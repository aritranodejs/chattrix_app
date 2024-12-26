import React, { useState } from 'react';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

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

    return isValid;
  };

  const handleForgotPassword = async () => {
    // Validate fields before submitting
    if (validateFields()) {
      try {
        console.log('Email:', email);
        // Send API request 
        const response = await axios.post(`${baseURL}/auth/forgot-password`, {
          email
        });

        if (response.status === 200) {
          setSuccess(response?.data?.message);
          setEmail('');
          setTimeout(() => {
            setSuccess('');
            setError('');
          }, 3000);
        }
      } catch (error) {
        // Handle error
        setError(error?.response?.data?.data?.email?.message);
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Forgot Password</h2>
        {error && <div className="error-message">{error}</div>}
        
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyUp={validateFields} // Validate on keyup
        />
        {success && <div className="success-message">{success}</div>}
        {emailError && <div className="error-message">{emailError}</div>}
        <button onClick={handleForgotPassword}>Submit</button>
      </div>
    </div>
  );
};

export default ForgotPassword;
