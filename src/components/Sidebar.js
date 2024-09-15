import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import axios for making API requests
import { Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';

const Sidebar = ({ onSelectChat, selectedChatId }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState(''); // State for search
  const [friends, setFriends] = useState([]); // State for storing friends
  const [loading, setLoading] = useState(false); // State for loading indication
  const [error, setError] = useState(null); // State for handling errors

  const baseURL = process.env.REACT_APP_API_URL;

  // Get the token from localStorage
  const token = localStorage.getItem('token');
  const id = localStorage.getItem('id');

  // Fetch friends from the API
  useEffect(() => {
    const fetchFriends = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${baseURL}/friends`, {
          headers: {
            Authorization: `Bearer ${token}` // Include the token in the Authorization header
          }
        });

        if (response.status === 200) {
          const friends = response?.data?.data?.friends || [];
          const friendIds = friends.map(friend => {
            const friendData = friend.receiverId._id === id ? friend.senderId : friend.receiverId;
            return {
              ...friendData, // Include the selected friend data
              senderId: friend.senderId, // Include senderId
              receiverId: friend.receiverId, // Include receiverId
              isFriend: true, // Assuming these are friends
              status: friend.status // Include friend request status if needed
            };
          });
          setFriends(friendIds); // Store receiverId as the friend
        } else {
          setError('Failed to fetch friends.');
        }
      } catch (err) {
        setError('An error occurred while fetching friends.');
        if (err.response?.status === 401) {
          // Token is invalid or expired, logout the user
          handleLogout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, [baseURL, token]);

  // Handle clicking on a friend, storing their isFriend status in localStorage
  const handleFriendClick = (friend) => {
    localStorage.setItem('selectedFriend', JSON.stringify(friend)); // Store friend data in localStorage
    localStorage.setItem(`isFriend_${friend._id}`, friend.isFriend === false ? false : true ); // Store isFriend status
    onSelectChat(friend); // Select chat
  };
  
  // Handle global search for friends
  const handleSearch = async (searchQuery) => {
    if (!searchQuery) {
      // Reset friends list if search query is empty
      const response = await axios.get(`${baseURL}/friends`, {
        headers: {
          Authorization: `Bearer ${token}` // Include the token in the Authorization header
        }
      });
      if (response.status === 200) {        
        const friends = response?.data?.data?.friends || [];
        const friendIds = friends.map(friend => {
          const friendData = friend.receiverId._id === id ? friend.senderId : friend.receiverId;
          return {
            ...friendData, // Include the selected friend data
            senderId: friend.senderId, // Include senderId
            receiverId: friend.receiverId, // Include receiverId
            isFriend: true, // Assuming these are friends
            status: friend.status // Include friend request status if needed
          };
        });
        setFriends(friendIds); // Store friends with isFriend key
        return;
      } else {
        setError('Failed to fetch friends.');
      }
    }

    setLoading(true);
    try {
      const response = await axios.get(`${baseURL}/friends/search`, {
        headers: {
          Authorization: `Bearer ${token}` // Include the token in the Authorization header
        },
        params: { search: searchQuery }
      });

      if (response.status === 200) {
        setFriends(response?.data?.data?.friends.map(friend => ({
          ...friend
        })));        
      } else {
        setError('No friends found for the given search query.');
      }
    } catch (err) {
      setError('An error occurred while searching for friends.');
      if (err.response?.status === 401) {
        // Token is invalid or expired, logout the user
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle logout API call and clear session
  const handleLogout = async () => {
    try {
      // Call the logout API
      await axios.post(`${baseURL}/auth/logout`, {}, {
        headers: {
          Authorization: `Bearer ${token}` // Include the token in the Authorization header
        }
      });
      
      // Clear session storage
      localStorage.removeItem('id');
      localStorage.removeItem('email');
      localStorage.removeItem('token');
      
      // Redirect to login page
      navigate('/');
    } catch (error) {
      console.error('Error during logout:', error);
      setError('Failed to log out. Please try again.');
    }
  };

  // Filter friends based on search query
  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.uniqueId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>Chattrix</h3>
      </div>

      {/* Search bar */}
      <input
        type="text"
        placeholder="Search....."
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          handleSearch(e.target.value); // Perform global search when query changes
        }}
        className="search-bar"
      />

      <div className="chat-list">
        {loading && <p>Loading.....</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!loading && filteredFriends.map(friend => (
          <div
            key={friend._id}
            className={`chat-item ${selectedChatId === friend._id ? 'active' : ''}`} // Highlight active chat
            onClick={() => handleFriendClick(friend)} // Store friend info when clicked
          >
            <Avatar>
              <PersonIcon />
            </Avatar>
            <div className="chat-details">
              <p>{friend.name}</p>
              {friend.isFriend === false ? (
                friend.status === 'initiate' ? (
                  <span className="badge bg-warning">Pending</span> // Show "Pending" if status is 'initiate'
                ) : ''
              ) : (
                friend.status === 'initiate' ? (
                  <span className="badge bg-warning">Pending</span> // Show "Pending" if status is 'initiate'
                ) : (
                  <span className="badge bg-success">Friend</span> // Show "Friend" if already friends
                )
              )}
              {friend.isOnline && <span className="online-status"></span>} {/* Green dot for online */}
            </div>
          </div>
        ))}
      </div>

      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default Sidebar;
