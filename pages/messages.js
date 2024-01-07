import React, { useState, useEffect } from 'react';
import styles from '../styles/Message.module.css';
import AvatarPicker from './AvatarPicker';
import MessageInput from './MessageInput';

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



  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);

    if (isNaN(date.getTime())) {
      // Handle the case where the timestamp is not a valid date
      return 'Invalid timestamp';
    }

    const options = { hour: 'numeric', minute: 'numeric', second: 'numeric' };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/getMessage');
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

  const sendMessage = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/sendMessage', {
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
      const response = await fetch(`http://localhost:3001/api/deleteMessage/${id}`, {
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
      } else {
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
