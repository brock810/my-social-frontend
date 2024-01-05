import React from 'react';
import styles from '../styles/MessageInput.module.css';
import Image from 'next/image';

const avatars = [
  'https://placekitten.com/40/40',
  'https://placekitten.com/41/41',
  'https://placekitten.com/42/42',
];

const AvatarPicker = ({ onSelect }) => {
  return (
    <div className={styles['avatar-picker']}>
      <p>Pick a cat!</p>
      <div className={styles['avatar-list']}>
        {avatars.map((avatar, index) => (
          <Image
            key={index}
            src={avatar}
            alt={`Avatar ${index + 1}`}
            width={30} 
            height={30} 
            onClick={() => onSelect(avatar)}
          />
        ))}
      </div>
    </div>
  );
};

export default AvatarPicker;
