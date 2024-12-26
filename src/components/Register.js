import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [cpassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [mobileError, setMobileError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [cpasswordError, setCPasswordError] = useState('');
  const navigate = useNavigate();

  // Base URL 
  const baseURL = process.env.REACT_APP_API_URL;

  const validateFields = () => {
    let isValid = true;

    // Validate name
    if (!name.trim()) {
      setNameError('Name is required.');
      isValid = false;
    } else {
      setNameError('');
    }

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

    // Validate mobile
    if (!mobile.trim()) {
      setMobileError('Mobile number is required.');
      isValid = false;
    } else {
      setMobileError('');
    }

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

  const handleRegister = async () => {
    // Validate fields before submitting
    if (validateFields()) {
      try {
        // Send API request to register
        const response = await axios.post(`${baseURL}/auth/register`, {
          name,
          email,
          mobile,
          role: 'user',
          password,
          cpassword
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
        // Handle error (invalid registration, etc.)
        if (error?.response?.status === 422) {
          const errorDetails = error.response.data?.message; 
        
          if (errorDetails) {
            Object.keys(errorDetails).forEach((field) => {
              const errorMessage = errorDetails[field]?.message;
        
              switch (field) {
                case 'email':
                  console.error('Email error:', errorMessage);
                  setEmailError(errorMessage);
                  break;
                case 'password':
                  console.error('Password error:', errorMessage);
                  setPasswordError(errorMessage);
                  break;
                default:
                  console.error(`${field} error:`, errorMessage);
                  setError(field, errorMessage); // Generic handler for other fields
                  break;
              }
            });
          }
        } else {
          console.error('Registration error:', error);
          setError('An error occurred during registration. Please try again.');
        }
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Register to Chattrix</h2>
        {error && <div className="error-message">{error}</div>}
        
        <input 
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyUp={validateFields} // Validate on keyup
        />
        {nameError && <div className="error-message">{nameError}</div>}

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyUp={validateFields} // Validate on keyup
        />
        {emailError && <div className="error-message">{emailError}</div>}

        <input
          type="text"
          placeholder="Enter your mobile number"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          onKeyUp={validateFields} // Validate on keyup
        />
        {mobileError && <div className="error-message">{mobileError}</div>}

        <input 
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyUp={validateFields} // Validate on keyup
        />
        {passwordError && <div className="error-message">{passwordError}</div>}

        <input
          type="password"
          placeholder="Enter your confirm password"
          value={cpassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          onKeyUp={validateFields} // Validate on keyup
        />
        {cpasswordError && <div className="error-message">{cpasswordError}</div>}

        <p className='login-link' style={{ marginTop: '1rem', textAlign: 'center', color: 'black' }}>Already have an account ? <a href="/">Login</a></p>
        <button onClick={handleRegister}>Register</button>
      </div>
    </div>
  );
};

export default Register;
