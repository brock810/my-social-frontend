import React, { useEffect, useState } from 'react';
import styles from '../styles/Friends.module.css';

const AnimatedText = ({ text }) => {
  const [animatedText, setAnimatedText] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      const nextLetter = text.charAt(animatedText.length);
      setAnimatedText((prevText) => prevText + nextLetter);

      if (animatedText.length === text.length) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [animatedText, text]);

  return <h1 className="text-4xl font-bold mb-4">{animatedText}</h1>;
};

const FriendsPage = ({ friendsList: initialFriendsList }) => {
  const [friendName, setFriendName] = useState('');
  const [userId, setUserId] = useState('');
  const [friendsList, setFriendsList] = useState(initialFriendsList || []);

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const saveFriendsToLocalStorage = (friends) => {
    localStorage.setItem('friendsList', JSON.stringify(friends));
  };

  const handleDeleteFriend = async (friendId) => {
    try {
      const response = await fetch(`https://noble-slow-dragon.glitch.me/api/deleteFriend/${friendId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      console.log('Delete Friend Response:', result);

      if (result.friend) {
        const updatedFriends = friendsList.filter((friend) => friend._id !== friendId);
        setFriendsList(updatedFriends);
        saveFriendsToLocalStorage(updatedFriends);
      } else {
        throw new Error(result.error || 'Internal Server Error');
      }
    } catch (error) {
      console.error('Error deleting friend on the backend:', error);

      if (error.response && error.response.data) {
        console.error('Server Response:', error.response.data);
      }
    }
  };

  const handleAddFriend = async () => {
    try {
      const response = await fetch('https://noble-slow-dragon.glitch.me/api/addFriend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ friendName, userId }),
      });

      const result = await response.json();

      console.log('Add Friend Response:', result);

      if (result.friend) {
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

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await fetch('https://noble-slow-dragon.glitch.me/api/getFriends');
        const result = await response.json();

        if (result.friends) {
          setFriendsList(result.friends);
          saveFriendsToLocalStorage(result.friends);
        } else {
          throw new Error(result.error || 'Internal Server Error');
        }
      } catch (error) {
        console.error('Error fetching friends from backend', error);
      }
    };

    // Fetch friends initially
    fetchFriends();

    // Poll every 10 seconds (adjust as needed)
    const pollInterval = setInterval(fetchFriends, 10000);

    // Cleanup when the component is unmounted
    return () => {
      clearInterval(pollInterval);
      console.log('FriendsPage component unmounted');
    };
  }, []);

  return (
    <div className={styles['friends-container']}>
      <div className={styles['friends-header']}>
        <AnimatedText text="Add yourself to my friends list and connect with friends to grow your network! " />
      </div>

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
