import React, { useState, useEffect } from 'react';
import styles from '../styles/Message.module.css';
import AvatarPicker from './AvatarPicker';
import MessageInput from './MessageInput';
import io from 'socket.io-client';

// Check if running in a browser environment
const isBrowser = typeof window !== 'undefined';

const MessageItem = ({ message, deleteMessage, formatTimestamp, selectedAvatar }) => (
  <li key={message._id} className={styles['chat-bubble']}>
    {/* Display the selectedAvatar emoji beside the message */}
    <div className={styles['avatar-container']}>
      {selectedAvatar} {/* Render the selected emoji */}
    </div>
    <div className={styles['message-content']}>
      <span className={styles['message-sender']}>{message.sender}: </span>
      {/* Conditional rendering based on message deletion */}
      {message.deleted ? (
        <span className={styles['message-deleted']}>This message has been deleted</span>
      ) : (
        <>
          {message.text}
          <div className={styles['message-metadata']}>
            {/* Display the formatted timestamp */}
            <span className={styles['timestamp']}>{formatTimestamp(message.timestamp)}</span>
          </div>
          {/* Button to delete the message */}
          <button onClick={() => deleteMessage(message._id)} className={styles['delete-button']}>
            Delete
          </button>
        </>
      )}
    </div>
  </li>
);

// Component for the list of messages
const MessageList = ({ messages, deleteMessage, formatTimestamp, selectedAvatar }) => (
  <div className={styles['message-list']}>
    <ul>
      {/* Map through messages and render MessageItem component for each */}
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

// Main Message component
const Message = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(
    isBrowser ? (localStorage.getItem('selectedAvatar') || '😻') : '🐱'
  );
  
  
  

  // Initialize socket connection to the server
  const socket = io('https://noble-slow-dragon.glitch.me');

  // Function to format timestamps in a user-friendly way
  function formatTimestamp(timestamp) {
    const date = new Date(timestamp);

    if (isNaN(date.getTime())) {
      // Handle the case where the timestamp is not a valid date
      return 'Invalid timestamp';
    }

    const options = { hour: 'numeric', minute: 'numeric', second: 'numeric' };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  }

  // Function to fetch messages from the server
  const fetchMessages = async () => {
    try {
      const response = await fetch('https://noble-slow-dragon.glitch.me/api/getMessage');
      const result = await response.json();

      // Update the state with the fetched messages if they are an array
      if (Array.isArray(result)) {
        setMessages(result);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Function to save messages to local storage
  const saveMessagesToLocalStorage = (messages) => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  };

  // Function to retrieve messages from local storage
  const getMessagesFromLocalStorage = () => {
    const storedMessages = localStorage.getItem('chatMessages');
    return storedMessages ? JSON.parse(storedMessages) : [];
  };

  // Effect hook to run on component mount
  useEffect(() => {
    // Fetch messages from the server
    fetchMessages();

    // Listen for incoming messages from the WebSocket server
    socket.on('message', (data) => {
      console.log('New message from server:', data);
      // Update the messages state with the new message
      setMessages((prevMessages) => [...prevMessages, data]);
      saveMessagesToLocalStorage([...prevMessages, data]);
    });

    // Clean up the WebSocket connection when the component is unmounted
    return () => {
      socket.disconnect();
    };
  }, []);

  // Function to send a new message
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
        // Update state with the new message and save to local storage
        const updatedMessages = [...messages, result.message];
        setMessages(updatedMessages);
        saveMessagesToLocalStorage(updatedMessages);
        setNewMessage('');

        // Emit a message to the WebSocket server
        if (socket) {
          socket.emit('message', { type: 'new_message', message: result.message });
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Effect hook to run on component mount to fetch messages or retrieve from local storage
  useEffect(() => {
    const storedMessages = getMessagesFromLocalStorage();
    if (storedMessages.length > 0) {
      setMessages(storedMessages);
    } else {
      fetchMessages();
    }
  }, []);

  // Function to delete a message
  const deleteMessage = async (id) => {
    try {
      const response = await fetch(`https://noble-slow-dragon.glitch.me/api/deleteMessage/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      console.log('Delete Message Response:', result);

      if (result.success) {
        // Update state with the deleted message and save to local storage
        const updatedMessages = messages
          .map((message) => (message._id === id ? { ...message, deleted: true } : message))
          .filter((message) => !message.deleted);

        setMessages(updatedMessages);
        saveMessagesToLocalStorage(updatedMessages);

        // Emit a message to the WebSocket server about the deleted message
        if (socket) {
          socket.emit('message', { type: 'delete_message', messageId: id });
        }
      } else {
        // Handle the case where result.success is not true
        console.error('Error deleting message:', result.error);
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
          {/* Render the MessageList and MessageInput components */}
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
