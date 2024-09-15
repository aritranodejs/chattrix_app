// App.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import Login from './components/Login';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const baseURL = process.env.REACT_APP_API_URL;

const fetchMessagesForChat = async (receiverId, token) => {
  try {
    const response = await axios.get(`${baseURL}/chats/${receiverId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (response.status === 200) {
      console.log('API Response:', response.data); // Log API response for debugging
      return response.data.data || []; // Return messages or an empty array if no messages
    } else {
      console.error('Failed to fetch messages. Status:', response.status);
      return [];
    }
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
};

function App() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatMessages, setChatMessages] = useState({});
  const [token, setToken] = useState(localStorage.getItem('token')); // Retrieve token from localStorage

  useEffect(() => {
    const fetchInitialMessages = async () => {
      if (selectedChat && token) {
        console.log('Fetching messages for receiverId:', selectedChat._id);
        const fetchedMessages = await fetchMessagesForChat(selectedChat._id, token);
        console.log('Fetched messages:', fetchedMessages); // Log fetched messages for debugging
        setChatMessages(prevMessages => ({
          ...prevMessages,
          [selectedChat._id]: fetchedMessages
        }));
      }
    };

    fetchInitialMessages();
  }, [selectedChat, token]);

  const handleSelectChat = async (chat) => {
    console.log('Chat selected:', chat);
    setSelectedChat(chat);

    // Fetch messages dynamically when a chat is selected
    const fetchedMessages = await fetchMessagesForChat(chat._id, token);
    console.log('Fetched messages for selected chat:', fetchedMessages); // Log fetched messages for debugging
    setChatMessages(prevMessages => ({
      ...prevMessages,
      [chat._id]: fetchedMessages
    }));
  };

  const handleSendMessage = (chatId, newMessage) => {
    setChatMessages(prevMessages => ({
      ...prevMessages,
      [chatId]: [...(prevMessages[chatId] || []), newMessage] // Append new message
    }));
  };

  const isLoggedIn = !!localStorage.getItem('email');

  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/chat"
            element={isLoggedIn ? (
              <>
                <Sidebar 
                  onSelectChat={handleSelectChat} 
                  selectedChatId={selectedChat?._id} 
                />
                {selectedChat ? (
                  <ChatWindow
                    chat={selectedChat}
                    messages={chatMessages[selectedChat._id] || []} 
                    onSendMessage={handleSendMessage} 
                  />
                ) : (
                  <div className="no-chat-selected">
                    <h3>Select a chat to start messaging</h3>
                  </div>
                )}
              </>
            ) : (
              <Navigate to="/" />
            )}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
