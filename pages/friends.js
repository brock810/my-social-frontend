import React, { useEffect, useState } from 'react';
import styles from '../styles/Friends.module.css';
import io from 'socket.io-client';

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

  const socket = io('https://noble-slow-dragon.glitch.me');


  const fetchData = async () => {
    try {
      const responseUser = await fetch('https://noble-slow-dragon.glitch.me/api/getUser');
      const resultUser = await responseUser.json();

      if (resultUser.user) {
        setUserId(resultUser.user._id);
      } else {
        throw new Error(resultUser.error || 'Internal Server Error');
      }

      const friendsResponse = await fetch('https://noble-slow-dragon.glitch.me/api/getFriends');
      const friendsResult = await friendsResponse.json();

      console.log('Fetch Friends Response:', friendsResult);

      if (friendsResult.friends) {
        setFriendsList(friendsResult.friends);
        saveFriendsToLocalStorage(friendsResult.friends);
      } else {
        throw new Error(friendsResult.error || 'Internal Server Error');
      }

      socket.onmessage = (event) => {
        // ... (WebSocket event handling)
      };
    } catch (error) {
      console.error('Error fetching data from backend:', error);
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

    return () => {
      if (socket) {
        socket.close();
      }
      console.log('FriendsPage component unmounted');
    };
  }, [socket]);

  useEffect(() => {
    const storedFriends = getFriendsFromLocalStorage();
    if (storedFriends.length > 0) {
      setFriendsList(storedFriends);
    } else {
      fetchData();
    }

    return () => {
      if (socket) {
        socket.close();
      }
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