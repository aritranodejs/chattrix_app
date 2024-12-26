import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [cpassword, setCPassword] = useState('');
  const [cpasswordError, setCPasswordError] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Base URL 
  const baseURL = process.env.REACT_APP_API_URL;
  const { token } = useParams();

  const validateFields = () => {
    let isValid = true;

    // Validate password
    if (!password.trim()) {
      setPasswordError('Password is required.');
      isValid = false;
    } else {
      setPasswordError('');
    }

    // Validate confirm password
    if (!cpassword.trim()) {
      setCPasswordError('Confirm password is required.');
      isValid = false;
    } else if (password !== cpassword) {
      setCPasswordError('Passwords do not match.');
      isValid = false;
    } else {
      setCPasswordError('');
    }

    return isValid;
  };

  const handleResetPassword = async () => {
    // Validate fields before submitting
    if (validateFields()) {
      try {
        // Send API request 
        const response = await axios.post(`${baseURL}/auth/reset-password/`, {
          token,
          password,
          confirmPassword: cpassword
        });

        if (response.status === 200) {
          navigate('/');
        }
      } catch (error) {
        // Handle error
        setError('Something went wrong. Please try again.');
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Reset Password</h2>
        {error && <div className="error-message">{error}</div>}
        
        <input
          type="password"
          placeholder="Enter your new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyUp={validateFields} // Validate on keyup
        />
        {passwordError && <div className="error-message">{passwordError}</div>}

        <input
          type="password"
          placeholder="Confirm your new password"
          value={cpassword}
          onChange={(e) => setCPassword(e.target.value)}
          onKeyUp={validateFields} // Validate on keyup
        />
        {cpasswordError && <div className="error-message">{cpasswordError}</div>}
        <button onClick={handleResetPassword}>Submit</button>
      </div>
    </div>
  );
};

export default ResetPassword;
