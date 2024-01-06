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

const Message = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(
    isBrowser ? localStorage.getItem('selectedAvatar') || 'https://placekitten.com/40/40' : 'https://placekitten.com/40/40'
  );
  const [senderName, setSenderName] = useState('');
  const [socket, setSocket] = useState(null);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);

    if (isNaN(date.getTime())) {
      return 'Invalid timestamp';
    }

    const options = { hour: 'numeric', minute: 'numeric', second: 'numeric' };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch('http://localhost:8888/api/getMessage');
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
      if (!newMessage) {
        console.log('Message text is required.');
        return;
      }

      const response = await fetch('http://localhost:3001/api/sendMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: newMessage, sender: senderName }),
      });

      const result = await response.json();
      if (result.message) {
        setMessages((prevMessages) => [...prevMessages, result.message]);
        saveMessagesToLocalStorage([...messages, result.message]);
        setNewMessage('');
        setSenderName('');
        socket.send(JSON.stringify(result.message)); // Send the message through WebSocket
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const deleteMessage = async (id) => {
    try {
      const response = await fetch(`http://localhost:8888/api/deleteMessage/${id}`, {
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
        socket.send(JSON.stringify({ deleted: true, _id: id })); // Notify WebSocket about deleted message
      } else {
        console.error('Error deleting message:', result.error);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  useEffect(() => {
    const storedMessages = getMessagesFromLocalStorage();
    if (storedMessages.length > 0) {
      setMessages(storedMessages);
    } else {
      fetchMessages();
    }

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, []);

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
            setSenderName={setSenderName}
            senderName={senderName}
          />
        </div>
      </div>
    </div>
  );
};

export default Message;