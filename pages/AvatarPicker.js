import React from 'react';
import styles from '../styles/MessageInput.module.css';

const avatars = [
  '😺', // Emoji for cat face
  '🐱', // Emoji for cat
  '😻', // Emoji for smiling cat with heart-eyes
];

const AvatarPicker = ({ onSelect }) => {
  return (
    <div className={styles['avatar-picker']}>
      <p>Pick an avatar!</p>
      <div className={styles['avatar-list']}>
        {avatars.map((avatar, index) => (
          <div
            key={index}
            className={styles['avatar']}
            onClick={() => onSelect(avatar)}
          >
            {avatar}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvatarPicker;
