// MessageInput.js

import React, { useState } from 'react';
import AvatarPicker from './AvatarPicker';
import styles from '../styles/MessageInput.module.css';

/**
 * MessageInput component handles user input for sending messages.
 * @param {Object} props - The component props.
 * @param {string} props.newMessage - The current message being typed.
 * @param {function} props.setNewMessage - Function to update the message state.
 * @param {function} props.sendMessage - Function to send the typed message.
 * @param {function} props.setSelectedAvatar - Function to set the selected avatar.
 * @returns {JSX.Element} - The rendered MessageInput component.
 */
const MessageInput = ({ newMessage, setNewMessage, sendMessage, setSelectedAvatar }) => {
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  /**
   * Handles avatar selection from the AvatarPicker component.
   * @param {string} avatar - The selected avatar.
   */
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
      <button onClick={sendMessage} className={styles['send-button']}>
        {/* Button to send the typed message */}
        Send
      </button>
    </div>
  );
};

export default MessageInput;
