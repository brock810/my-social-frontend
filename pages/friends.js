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

  const socket = new WebSocket('wss://noble-slow-dragon.glitch.me'); // WebSocket connection

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
        saveFriendsToLocalStorage(friendsResult.friends); // Save to local storage
      } else {
        throw new Error(friendsResult.error || 'Internal Server Error');
      }

      // Listen for incoming friends updates from the WebSocket server
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'new_friend') {
          const updatedFriends = [...friendsList, data.friend];
          setFriendsList(updatedFriends);
          saveFriendsToLocalStorage(updatedFriends);
        } else if (data.type === 'delete_friend') {
          const friendId = data.friendId;
          const updatedFriends = friendsList.filter((friend) => friend._id !== friendId);
          setFriendsList(updatedFriends);
          saveFriendsToLocalStorage(updatedFriends);
        }
      };
    } catch (error) {
      console.error('Error fetching data from backend:', error);
    }
  };

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

  const getFriendsFromLocalStorage = () => {
    const storedFriends = localStorage.getItem('friendsList');
    return storedFriends ? JSON.parse(storedFriends) : [];
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

        // Move the WebSocket friend addition emission here
        if (socket) {
          socket.send(JSON.stringify({ type: 'new_friend', friend: result.friend }));
        }
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

  const handleDeleteFriend = async (friendId) => {
    try {
      const response = await fetch(`https://noble-slow-dragon.glitch.me/api/deleteFriend/${friendId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      console.log('Delete Friend Response:', result);

      if (result.success) {
        setFriendsList((prevFriends) => prevFriends.filter((friend) => friend._id !== friendId));
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