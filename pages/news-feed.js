// NewsFeedPage.js

import React, { useEffect, useState } from 'react';
import styles from '../styles/Newsfeed.module.css';

// NewsFeedPage component
const NewsFeedPage = () => {
  // State variables
  const [news, setNews] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Function to fetch news from the backend
  const fetchNews = async () => {
    try {
      // Retrieve stored news from local storage
      const storedNews = JSON.parse(localStorage.getItem('news')) || [];
      setNews(storedNews);
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const result = await response.json();
  
      console.log('Fetch News Response:', result);
  
      if (result.news) {
        // Update state with the fetched news and save to local storage
        setNews(result.news);
        localStorage.setItem('news', JSON.stringify(result.news));
      } else {
        throw new Error(result.error || 'Internal Server Error');
      }
    } catch (error) {
      console.error('Error fetching news from backend', error);
      setError(error.message || 'An error occurred while fetching news');
    }
  };

  // Function to handle adding news
  const handleAddNews = async () => {
    try {
      // Add news to the backend
      const response = await fetch('https://noble-slow-dragon.glitch.me/api/addNews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTitle, content: newContent }),
      });

      const result = await response.json();

      console.log('Add News Response:', result);

      if (result.news) {
        // Update state with the new news and save to local storage
        setNews((prevNews) => [...prevNews, result.news]);
        localStorage.setItem('news', JSON.stringify([...news, result.news]));
        setNewTitle('');
        setNewContent('');
      } else {
        throw new Error(result.error || 'Internal Server Error');
      }
    } catch (error) {
      console.error('Error adding news on the frontend:', error);
      setError(error.message || 'An error occurred while adding news');
    }
  };

  // Function to handle deleting news
  const handleDeleteNews = async (id) => {
    try {
      // Delete news on the backend
      const response = await fetch(`https://noble-slow-dragon.glitch.me/api/deleteNews/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();

      console.log('Delete News Response:', result);

      if (result.success) {
        // Update state with the deleted news and save to local storage
        setNews((prevNews) => prevNews.filter((item) => item._id !== id));
        localStorage.setItem('news', JSON.stringify(news.filter((item) => item._id !== id)));
      } else {
        throw new Error(result.error || 'Internal Server Error');
      }
    } catch (error) {
      console.error('Error deleting news on the frontend:', error);
      setError(error.message || 'An error occurred while deleting news');
    }
  };

  // Effect hook to fetch news on component mount
  useEffect(() => {
    fetchNews();
  }, []);

  // Filtered news based on search term
  const filteredNews = news.filter(
    (item) =>
      item.title.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
      item.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // JSX return
  return (
    <div className={`${styles['news-feed-container']} ${styles['global-body']}`}>
      <div className={styles['news-feed-header']}>
        <h1 className="text-4xl font-bold mb-4">Add some recent news about yourself!</h1>
      </div>

      <div className={styles['news-feed-form']}>
        {/* Input fields for adding news */}
        <input
          type="text"
          placeholder="Name"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <textarea
          placeholder="Content"
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
        />
        {/* Button to add news */}
        <button onClick={handleAddNews}>Add News</button>
      </div>

      <div className={styles['news-feed-search']}>
        {/* Input for searching news */}
        <input
          type="text"
          placeholder="Search News"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {/* Button to clear search term */}
        {searchTerm && (
          <button onClick={() => setSearchTerm('')}>Clear Search</button>
        )}
      </div>

      <div className={styles['news-feed-card-container']}>
        {/* Display filtered news */}
        {filteredNews.map((item) => (
          <div key={item._id} className={styles['news-feed-card']}>
            <h2 className="text-xl font-semibold mb-2">{item.title}</h2>
            <p className="text-sm opacity-70">{item.content}</p>
            {/* Button to delete news */}
            <button onClick={() => handleDeleteNews(item._id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsFeedPage;
