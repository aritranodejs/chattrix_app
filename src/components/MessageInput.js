import React, { useState } from 'react';
import { IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import axios from 'axios';

const MessageInput = ({ onSendMessage, receiverId }) => {
  const [input, setInput] = useState('');
  const [image, setImage] = useState(null);
  const baseURL = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem('token');

  // Handle image upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      setImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Function to send message or image to the server
  const sendMessageToBackend = async (messageData) => {
    try {
      const response = await axios.post(
        `${baseURL}/chats/store`,
        { receiverId, message: messageData }, // Still passing the `messageData` here
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        console.log('Message sent successfully:', response.data);
        onSendMessage(response?.data?.data?.message); // Update local chat after the message is sent
      } else {
        console.error('Failed to send message:', response.data);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleSendMessage = () => {
    if (image) {
      // Send image message
      sendMessageToBackend({ type: 'image', image });
      setImage(null); // Clear image after sending
    } else if (input.trim()) {
      // Send just the text, without wrapping it in an object
      sendMessageToBackend(input.trim());
      setInput(''); // Clear text input after sending
    }
  };

  return (
    <div className="message-input">
      <IconButton component="label">
        <AttachFileIcon />
        <input type="file" accept="image/*" hidden onChange={handleFileChange} />
      </IconButton>

      <input
        type="text"
        placeholder="Type a message..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <IconButton onClick={handleSendMessage}>
        <SendIcon />
      </IconButton>
    </div>
  );
};

export default MessageInput;
