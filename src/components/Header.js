import React from 'react';
import profilePic from '../assets/images/logo192.png';

const Header = ({ userDetails, chatStatus, isFriend }) => {
    const formatLastSeen = (lastSeenAt) => {
        const now = new Date();
        const lastSeenDate = new Date(lastSeenAt);
        
        const isToday = now.toDateString() === lastSeenDate.toDateString();
        
        if (isToday) {
            return `Today at ${lastSeenDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        const isYesterday = yesterday.toDateString() === lastSeenDate.toDateString();
        
        if (isYesterday) {
            return `Yesterday at ${lastSeenDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        }
        return lastSeenDate.toLocaleString();
    };

    return (
        <>
            {isFriend === false ? null : (
                <div className="header">
                    <div className="profile">
                        <img src={profilePic} alt="Profile" className="profile-pic" />
                    </div>
                    <div className="header-info">
                        <h1 className="username">{userDetails?.name}</h1>
                        {chatStatus !== 'initiate' && (
                            <p className="status">
                                {userDetails?.isOnline
                                    ? 'Online'
                                    : `Last seen: ${formatLastSeen(userDetails?.lastSeenAt)}`}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </>
    );    
};

export default Header;
