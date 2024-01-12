// FriendsPage.js

import React, { useEffect, useState } from 'react';
import styles from '../styles/Friends.module.css';

// AnimatedText Component for typing animation
const AnimatedText = ({ text }) => {
  // State for managing animated text
  const [animatedText, setAnimatedText] = useState('');

  // Effect to update animatedText over time
  useEffect(() => {
    const interval = setInterval(() => {
      const nextLetter = text.charAt(animatedText.length);
      setAnimatedText((prevText) => prevText + nextLetter);

      // Clear interval when animation completes
      if (animatedText.length === text.length) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval); // Cleanup on component unmount
  }, [animatedText, text]);

  // Render animated text
  return <h1 className="text-4xl font-bold mb-4">{animatedText}</h1>;
};

// FriendsPage Component
const FriendsPage = ({ friendsList: initialFriendsList }) => {
  // State variables
  const [friendName, setFriendName] = useState('');
  const [userId, setUserId] = useState('');
  const [friendsList, setFriendsList] = useState(initialFriendsList || []);

  // Fetch data from backend API
  const fetchData = async () => {
    // Fetch user data
    try {
      // Fetch user data
      const responseUser = await fetch('https://noble-slow-dragon.glitch.me/api/getUser');
      const resultUser = await responseUser.json();

      // Set user ID from the response
      if (resultUser.user) {
        setUserId(resultUser.user._id);
      } else {
        throw new Error(resultUser.error || 'Internal Server Error');
      }

      // Fetch friends data
      const friendsResponse = await fetch('https://noble-slow-dragon.glitch.me/api/getFriends');
      const friendsResult = await friendsResponse.json();

      // Log fetch result and update friends list
      console.log('Fetch Friends Response:', friendsResult);
      if (friendsResult.friends) {
        setFriendsList(friendsResult.friends);
      } else {
        throw new Error(friendsResult.error || 'Internal Server Error');
      }
    } catch (error) {
      console.error('Error fetching data from backend:', error);
    }
  };

  // Function to generate random color
  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  // Function to save friends to local storage
  const saveFriendsToLocalStorage = (friends) => {
    localStorage.setItem('friendsList', JSON.stringify(friends));
  };

  // Function to get friends from local storage
  const getFriendsFromLocalStorage = () => {
    const storedFriends = localStorage.getItem('friendsList');
    return storedFriends ? JSON.parse(storedFriends) : [];
  };

  // Function to handle deleting a friend
  const handleDeleteFriend = async (friendId) => {
    try {
      const response = await fetch(`https://noble-slow-dragon.glitch.me/api/deleteFriend/${friendId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      console.log('Delete Friend Response:', result);

      if (result.success) {
        // Update friends list after deletion
        const updatedFriends = friendsList.filter((friend) => friend._id !== friendId);
        setFriendsList(updatedFriends);
        saveFriendsToLocalStorage(updatedFriends);
      } else {
        throw new Error(result.error || 'Internal Server Error');
      }
    } catch (error) {
      console.error('Error deleting friend on the frontend:', error);

      if (error.response && error.response.data) {
        console.error('Server Response:', error.response.data);
      }
    }
  };

  // Function to handle adding a friend
  const handleAddFriend = async () => {
    try {
      const response = await fetch('https://noble-slow-dragon.glitch.me/api/addFriend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ friendName, userId }),
      });

      console.log('Server Response:', response);

      const result = await response.json();

      console.log('Add Friend Response:', result);

      if (result.friend) {
        // Update friends list after addition
        const updatedFriends = [...friendsList, { ...result.friend, color: getRandomColor() }];
        setFriendsList(updatedFriends);
        saveFriendsToLocalStorage(updatedFriends);

        setFriendName('');
      } else {
        throw new Error(result.error || 'Internal Server Error');
      }
    } catch (error) {
      console.error('Error adding friend on the backend:', error);

      if (error.response && error.response.data) {
        console.error('Server Response:', error.response.data);
      }
    }
  };

  // Effect to fetch data on component mount
  useEffect(() => {
    const storedFriends = getFriendsFromLocalStorage();
    if (storedFriends.length > 0) {
      setFriendsList(storedFriends);
    } else {
      fetchData();
    }

    // Cleanup function on component unmount
    return () => {
      console.log('FriendsPage component unmounted');
    };
  }, []);

  // Render FriendsPage component
  return (
    <div className={styles['friends-container']}>
      <div className={styles['friends-header']}>
        {/* AnimatedText component for typing animation */}
        <AnimatedText text="Add yourself to my friends list and Mongo database!" />
      </div>

      {/* Form to add a friend */}
      <div className={styles['friends-card']}>
        <h2 className="text-xl font-semibold mb-2">Add Friend</h2>
        <input
          type="text"
          value={friendName}
          onChange={(e) => setFriendName(e.target.value)}
          placeholder="Friend Name"
        />
        <button onClick={handleAddFriend}>Add Friend</button>
      </div>

      {/* Display list of friends */}
      <div className={styles['friends-card-container']}>
        <div className={styles['friends-list']}>
          <h2 className="text-xl font-semibold mb-2">Friends List</h2>
          <ul>
            {friendsList.map((friend) => (
              <li
                key={friend._id}
                className={styles['friend-item']}
                style={{ backgroundColor: friend.color || getRandomColor() }}
              >
                <span>{friend.name}</span>
                <button onClick={() => handleDeleteFriend(friend._id)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FriendsPage;
