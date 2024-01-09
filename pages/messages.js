import React, { useState, useEffect } from 'react';
import styles from '../styles/Message.module.css';
import AvatarPicker from './AvatarPicker';
import MessageInput from './MessageInput';
import io from 'socket.io-client';
import { useRef } from 'react';

const isBrowser = typeof window !== 'undefined';

const MessageItem = ({ message, deleteMessage, formatTimestamp, selectedAvatar }) => (
  <li key={message._id} className={styles['chat-bubble']}>
    <div className={styles['avatar-container']}>
      {/* Use the selectedAvatar prop here */}
      <img src={selectedAvatar} alt="User Avatar" className={styles['user-avatar']} />
    </div>
    <div className={styles['message-content']}>
      <span className={styles['message-sender']}>{message.sender}: </span>
      {message.deleted ? (
        <span className={styles['message-deleted']}>This message has been deleted</span>
      ) : (
        <>
          {message.text}
          <div className={styles['message-metadata']}>
            <span className={styles['timestamp']}>{formatTimestamp(message.timestamp)}</span>
          </div>
          <button onClick={() => deleteMessage(message._id)} className={styles['delete-button']}>
            Delete
          </button>
        </>
      )}
    </div>
  </li>
);

const MessageList = ({ messages, deleteMessage, formatTimestamp, selectedAvatar }) => (
  <div className={styles['message-list']}>
    <ul>
      {messages.map((message) => (
        <MessageItem
          key={message._id}
          message={message}
          deleteMessage={deleteMessage}
          formatTimestamp={formatTimestamp}
          selectedAvatar={selectedAvatar} // Pass the selectedAvatar here
        />
      ))}
    </ul>
  </div>
);

const Message = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(
    isBrowser ? localStorage.getItem('selectedAvatar') || 'https://placekitten.com/40/40' : 'https://placekitten.com/40/40'
  );

  const socketRef = useRef(null);

  function formatTimestamp(timestamp) {
    const date = new Date(timestamp);

    if (isNaN(date.getTime())) {
      // Handle the case where the timestamp is not a valid date
      return 'Invalid timestamp';
    }

    const options = { hour: 'numeric', minute: 'numeric', second: 'numeric' };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  }

  const fetchMessages = async () => {
    try {
      const response = await fetch('https://noble-slow-dragon.glitch.me/api/getMessage');
      const result = await response.json();
      if (Array.isArray(result)) {
        setMessages(result);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const saveMessagesToLocalStorage = (messages) => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  };

  const getMessagesFromLocalStorage = () => {
    const storedMessages = localStorage.getItem('chatMessages');
    return storedMessages ? JSON.parse(storedMessages) : [];
  };

  useEffect(() => {
    // Initialize WebSocket connection
    socketRef.current = new WebSocket('wss://noble-slow-dragon.glitch.me');
  
    // Event listener for WebSocket open
    socketRef.current.addEventListener('open', (event) => {
      console.log('WebSocket connection opened:', event);
    });
  
    // Event listener for WebSocket message
    socketRef.current.addEventListener('message', (event) => {
      console.log('WebSocket message received:', event.data);
      // Handle incoming messages as needed
      const data = JSON.parse(event.data);
      setMessages((prevMessages) => [...prevMessages, data]);
      saveMessagesToLocalStorage([...prevMessages, data]);
    });
  
    // Event listener for WebSocket close
    socketRef.current.addEventListener('close', (event) => {
      console.log('WebSocket connection closed:', event);
    });
  
    // Event listener for WebSocket error
    socketRef.current.addEventListener('error', (event) => {
      console.error('WebSocket error:', event);
    });
  
    return () => {
      // Clean up WebSocket connection when component unmounts
      socketRef.current.close();
    };
  }, []);

  const sendMessage = async () => {
    try {
      const response = await fetch('https://noble-slow-dragon.glitch.me/api/sendMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: newMessage }),
      });

      const result = await response.json();

      if (result.message) {
        const updatedMessages = [...messages, result.message];
        setMessages(updatedMessages);
        saveMessagesToLocalStorage(updatedMessages);
        setNewMessage('');

        // Use the existing WebSocket connection
        if (socketRef.current) {
          socketRef.current.send(JSON.stringify({ type: 'new_message', message: result.message }));
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  useEffect(() => {
    const storedMessages = getMessagesFromLocalStorage();
    if (storedMessages.length > 0) {
      setMessages(storedMessages);
    } else {
      fetchMessages();
    }
  }, []);

  const deleteMessage = async (id) => {
    try {
      const response = await fetch(`https://noble-slow-dragon.glitch.me/api/deleteMessage/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      console.log('Delete Message Response:', result);

      if (result.success) {
        const updatedMessages = messages
          .map((message) => (message._id === id ? { ...message, deleted: true } : message))
          .filter((message) => !message.deleted);

        setMessages(updatedMessages);
        saveMessagesToLocalStorage(updatedMessages);

        // Use the existing WebSocket connection
        if (socketRef.current) {
          socketRef.current.send(JSON.stringify({ type: 'delete_message', messageId: id }));
        }
      } else {
        // Handle the case where result.success is not true
        console.error('Error deleting message:', result.error);
        // You might want to show an error message or handle it in some way
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };
  

  return (
    <div className={styles['message-container']}>
      <div className={styles['message-header']}>
        <h1 className="text-4xl font-bold mb-4">Chat Room</h1>
        <h3>Text me! I will receive the message in my MongoDB!</h3>
      </div>
      <div className={styles['message-card-container']}>
        <div className={styles['message-card']}>
          <MessageList
            messages={messages}
            deleteMessage={deleteMessage}
            formatTimestamp={formatTimestamp}
            selectedAvatar={selectedAvatar}
          />
          <MessageInput
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            sendMessage={sendMessage}
            selectedAvatar={selectedAvatar}
            setSelectedAvatar={setSelectedAvatar}
          />
        </div>
      </div>
    </div>
  );
};

export default Message;
