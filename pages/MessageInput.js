// MessageInput.js

import React, { useState } from 'react';
import AvatarPicker from './AvatarPicker';
import styles from '../styles/MessageInput.module.css'; 
const MessageInput = ({ newMessage, setNewMessage, sendMessage, setSelectedAvatar }) => {
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const handleAvatarSelect = (avatar) => {
    setSelectedAvatar(avatar);
    setShowAvatarPicker(false);
  };

  return (
    <div className={styles['message-input']}>
      {!showAvatarPicker && (
        <button onClick={() => setShowAvatarPicker(true)} className={styles['avatar-button']}>
          Choose Your Avatar
        </button>
      )}

      {showAvatarPicker && (
        <div className={styles['avatar-picker']}>
          <AvatarPicker onSelect={handleAvatarSelect} />
          <button onClick={() => setShowAvatarPicker(false)} className={styles['close-button']}>
            Close
          </button>
        </div>
      )}

      <textarea
        rows="3"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Type your message..."
        className={styles['message-textarea']}  
      />
      <button onClick={sendMessage} className={styles['send-button']}>  {/* Add a class for styling the send button */}
        Send
      </button>
    </div>
  );
};

export default MessageInput;
