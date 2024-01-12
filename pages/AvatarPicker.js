// AvatarPicker.js

import React from 'react';
import styles from '../styles/MessageInput.module.css';
import Image from 'next/image';

// List of cat avatars to choose from
const avatars = [
  'https://placekitten.com/40/40',
  'https://placekitten.com/41/41',
  'https://placekitten.com/42/42',
];

/**
 * AvatarPicker component provides a selection of cat avatars.
 * @param {Object} props - The component props.
 * @param {function} props.onSelect - Function to handle avatar selection.
 * @returns {JSX.Element} - The rendered AvatarPicker component.
 */
const AvatarPicker = ({ onSelect }) => {
  return (
    <div className={styles['avatar-picker']}>
      <p>Pick a cat!</p>
      <div className={styles['avatar-list']}>
        {avatars.map((avatar, index) => (
          // Each cat avatar displayed as an Image component
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
