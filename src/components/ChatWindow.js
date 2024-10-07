import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import MessageInput from './MessageInput';
import axios from 'axios'; // To handle friend request and edit/delete messages
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client'; // Import Socket.IO client

// Initialize socket connection (make sure to replace process.env.API_URL with the actual URL)
const socket = io(process.env.REACT_APP_API_URL, {
  transports: ['websocket'],
});

const ChatWindow = ({ chat, messages, onSendMessage }) => {
  const navigate = useNavigate();
  const [chatMessages, setChatMessages] = useState(messages || []);
  const [isFriend, setIsFriend] = useState(false);
  const [loadingFriendRequest, setLoadingFriendRequest] = useState(false);
  const [error, setError] = useState('');
  const [editingMessage, setEditingMessage] = useState(null);
  const messageEndRef = useRef(null); // Reference to the message list end for auto-scroll

  const currentUserId = localStorage.getItem('id');
  const baseURL = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem('token');

  const room = currentUserId < chat._id ? `${currentUserId}-${chat._id}` : `${chat._id}-${currentUserId}`;

  useEffect(() => {
    // Initialize isFriend status and chat messages
    const isFriendStatus = localStorage.getItem(`isFriend_${chat._id}`) === 'true';
    setIsFriend(isFriendStatus);
    setChatMessages(messages);

    // Join the room for real-time chat
    socket.emit('joinRoom', room);
    console.log(`Joined room: ${room}`);

    // Listen for new messages in the room
    socket.on('message', (newMessage) => {
      console.log('New message received:', newMessage);

      // Append new message to the chatMessages state
      setChatMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    // Cleanup listener when component unmounts
    return () => {
      socket.off('message');
    };
  }, [messages, chat._id, room]);

  // Scroll to the bottom of the chat messages
  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Scroll to the bottom on first render or when messages change
    scrollToBottom();
  }, [chatMessages]);

  // Helper function to format date for message grouping
  const formatDate = (timestamp) => {
    const messageDate = new Date(timestamp);
    const today = new Date();

    // Check if the message date is today
    if (
      messageDate.getDate() === today.getDate() &&
      messageDate.getMonth() === today.getMonth() &&
      messageDate.getFullYear() === today.getFullYear()
    ) {
      return 'Today';
    }

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return messageDate.toLocaleDateString(undefined, options);
  };

  // Helper function to check if a message belongs to a new day
  const isNewDay = (currentMessage, previousMessage) => {
    const currentMessageDate = new Date(currentMessage.createdAt).setHours(0, 0, 0, 0);
    const previousMessageDate = previousMessage
      ? new Date(previousMessage.createdAt).setHours(0, 0, 0, 0)
      : null;
    return currentMessageDate !== previousMessageDate;
  };

  // Format the timestamp for display
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Handle sending a new message
  const handleSendMessage = (newMessageText) => {
    const newMessage = {
      receiverId: chat._id,
      message: newMessageText,
      senderId: currentUserId,
      createdAt: new Date(),
    };

    // Emit the message to the server with the room information
    socket.emit('sendMessage', { room, message: newMessage });

    // Update local state for the sender immediately
    setChatMessages((prevMessages) => [...prevMessages, newMessage]);

    // Call the onSendMessage prop to handle API-related logic
    onSendMessage(chat._id, newMessage);
  };

  // Handle editing a message
  const handleEditMessage = async (messageId, newText) => {
    try {
      await axios.put(
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
      setEditingMessage(null);
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
      setChatMessages(updatedMessages);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
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
            Authorization: `Bearer ${token}`,
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
      <div className="chat-header">
        {isFriend === false && !loadingFriendRequest && (
          <button className="btn btn-primary" onClick={handleAddFriend}>
            Add Friend
          </button>
        )}
        {loadingFriendRequest && <p>Sending friend request...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>

      <div className="messages">
        {chatMessages.length > 0 ? (
          chatMessages.map((message, index) => {
            const previousMessage = chatMessages[index - 1];
            const showDate = isNewDay(message, previousMessage);

            return (
              <React.Fragment key={message._id || Math.random()}>
                {/* Show the date if it's a new day */}
                {showDate && (
                  <div className="message-date-badge">
                    <span>{formatDate(message.createdAt)}</span>
                  </div>
                )}
                <div className={`message ${message.senderId === currentUserId ? 'sent' : 'received'}`}>
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
                  <div className="message-options">
                    <span className="timestamp">{formatTimestamp(message.createdAt)}</span>
                    {message.senderId === currentUserId && (
                      <div className="message-menu">
                        <button>...</button>
                        <div className="message-actions">
                          <button onClick={() => setEditingMessage(message._id)}>Edit</button>
                          <button onClick={() => handleDeleteMessage(message._id)}>Delete</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </React.Fragment>
            );
          })
        ) : (
          isFriend === true ? (
            <div className="no-messages">
              {chat?.status === 'initiate' ? (
                <h3>
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
        <div ref={messageEndRef} /> {/* Scroll target */}
      </div>

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
