import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import MessageInput from './MessageInput'; // Ensure this component is properly imported
import axios from 'axios'; // To handle the friend request API call and edit/delete messages
import { useNavigate } from 'react-router-dom';

const ChatWindow = ({ chat, messages, onSendMessage }) => {
  const navigate = useNavigate();
  const [chatMessages, setChatMessages] = useState(messages || []);
  const [isFriend, setIsFriend] = useState(false); // State to track if the user is a friend
  const [loadingFriendRequest, setLoadingFriendRequest] = useState(false); // State for friend request status
  const [error, setError] = useState('');
  const [editingMessage, setEditingMessage] = useState(null); // Track the message being edited

  const currentUserId = localStorage.getItem('id'); // Replace this with actual current user ID
  const baseURL = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem('token'); // Get token from localStorage

  useEffect(() => {
    setChatMessages(messages);
  }, [messages]);

  // Check if the user is a friend by checking localStorage
  useEffect(() => {
    const isFriendStatus = localStorage.getItem(`isFriend_${chat._id}`) === 'true'; // Fix: compare with 'true'
    setIsFriend(isFriendStatus);
  }, [chat]);

  // Handle sending a new message
  const handleSendMessage = (newMessageText) => {
    const newMessage = {
      receiverId: chat._id,
      message: newMessageText,
      senderId: currentUserId, // Make sure senderId is set
      createdAt: new Date(), // Add a timestamp for when the message is sent
      token: token
    };
    onSendMessage(chat._id, newMessage);
  };

  // Handle editing a message
  const handleEditMessage = async (messageId, newText) => {
    try {
      await axios.post(
        `${baseURL}/chats/edit/${messageId}`,
        { message: newText },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      const updatedMessages = chatMessages.map((msg) =>
        msg._id === messageId ? { ...msg, message: newText } : msg
      );
      setChatMessages(updatedMessages);
      setEditingMessage(null); // Clear editing mode
    } catch (error) {
      console.error('Error editing message:', error);
    }
  };

  // Handle deleting a message
  const handleDeleteMessage = async (messageId) => {
    try {
      await axios.delete(`${baseURL}/chats/destroy/${messageId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const updatedMessages = chatMessages.filter((msg) => msg._id !== messageId);
      setChatMessages(updatedMessages); // Remove the message from state
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  // Format the timestamp for display (e.g., "3:15 PM")
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Handle sending a friend request
  const handleAddFriend = async () => {
    setLoadingFriendRequest(true);
    try {
      const response = await axios.post(
        `${baseURL}/friends/store`, 
        { receiverId: chat._id }, // Pass the chat user ID as the friendId
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
          },
        }
      );

      if (response.status === 200) {
        setIsFriend(true); // Update the state to indicate the user is now a friend
        localStorage.setItem(`isFriend_${chat._id}`, 'true'); // Store as string in localStorage
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message?.receiverId?.message || 'Error sending friend request';
      setError(errorMessage);
    } finally {
      setLoadingFriendRequest(false);
    }
  };

  // Accept Friends
  const handleAcceptFriend = async (status) => {
    try {
      const response = await axios.post(
        `${baseURL}/friends/toggle/${chat._id}/${status}`,  // URL with chat ID and status
        null, // No body, so pass null
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
          },
        }
      );      

      if (response.status === 200) {
        const message = 'ok';
        alert(message);
        navigate('/chat');
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message?.receiverId?.message || 'Error Accepting friend request';
      setError(errorMessage);
    }
  };

  return (
    <div className="chat-window">
      {/* Chat Header */}
      <div className="chat-header">
        {/* Show Add Friend button if not a friend */}
        {isFriend === false && !loadingFriendRequest && (
          <button className="btn btn-primary" onClick={handleAddFriend}>
            Add Friend
          </button>
        )}
        {loadingFriendRequest && <p>Sending friend request...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>

      {/* Messages Section */}
      <div className="messages">
        {chatMessages.length > 0 ? (
          chatMessages.map((message) => (
            <div
              key={message._id}
              className={`message ${message.senderId === currentUserId ? 'sent' : 'received'}`}
            >
              {/* Message Content */}
              <div className="message-content">
                <strong>{message.senderId === currentUserId ? 'You' : chat.name}: </strong>
                {editingMessage === message._id ? (
                  <input
                    type="text"
                    defaultValue={message.message}
                    onBlur={(e) => handleEditMessage(message._id, e.target.value)}
                    autoFocus
                  />
                ) : (
                  <span>{message.message}</span>
                )}
              </div>

              {/* Message Options (three dots menu) */}
              <div className="message-options">
                <span className="timestamp">{formatTimestamp(message.createdAt)}</span>
                {message.senderId === currentUserId && (
                  <div className="message-menu">
                    <button onClick={() => setEditingMessage(message._id)}>...</button>
                    <div className="message-actions">
                      <button onClick={() => setEditingMessage(message._id)}>Edit</button>
                      <button onClick={() => handleDeleteMessage(message._id)}>Delete</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          isFriend === true ? ( // Fix: compare isFriend as boolean, not string
            <div className="no-messages">
              {/* Check if the status is 'initiate' */}
              {chat?.status === 'initiate' ? (
                <h3>
                  {/* Check if the current user initiated the request */}
                  {chat?.senderId?._id !== currentUserId ? (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button className="btn btn-success" onClick={() => handleAcceptFriend('accepted')}>
                        Accept
                      </button>
                      <button className="btn btn-danger" onClick={() => handleAcceptFriend('deleted')}>
                        Reject
                      </button>
                    </div>                  
                  ) : (
                    "Please wait for the friend request to be accepted."
                  )}
                </h3>
              ) : (
                <h3>No messages yet. Start the conversation!</h3>
              )}
            </div>
          ) : (
            <div className="no-messages">
              <h3>You are not friends yet. Add this person to start chatting!</h3>
            </div>
          )
        )}
      </div>

      {/* Show MessageInput only if the user is a friend */}
      {((isFriend === true) && (chat?.status === 'accepted' || chat?.status === 'active')) && (
        <MessageInput onSendMessage={handleSendMessage} receiverId={chat._id} />
      )}
    </div>
  );
};

ChatWindow.propTypes = {
  chat: PropTypes.object.isRequired,
  messages: PropTypes.array.isRequired,
  onSendMessage: PropTypes.func.isRequired,
};

export default ChatWindow;
