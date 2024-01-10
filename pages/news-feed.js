// NewsFeedPage.js

import React, { useEffect, useState } from 'react';
import styles from '../styles/Newsfeed.module.css';

const NewsFeedPage = () => {
  const [news, setNews] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchNews = async () => {
    try {
      const response = await fetch('https://noble-slow-dragon.glitch.me/api/getNews');
      const result = await response.json();

      console.log('Fetch News Response:', result);

      if (result.news) {
        setNews(result.news);
      } else {
        throw new Error(result.error || 'Internal Server Error');
      }
    } catch (error) {
      console.error('Error fetching news from backend', error);
      setError(error.message || 'An error occurred while fetching news');
    }
  };

  const handleAddNews = async () => {
    try {
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
        setNews(result.news);
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
  return (
    <div className={`${styles['news-feed-container']} ${styles['global-body']}`}>
      <div className={styles['news-feed-header']}>
        <h1 className="text-4xl font-bold mb-4">Add your name with some news about yourself!</h1>
      </div>

      <div className={styles['news-feed-form']}>
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
        <button onClick={handleAddNews}>Add News</button>
      </div>

      <div className={styles['news-feed-search']}>
        <input
          type="text"
          placeholder="Search News"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')}>Clear Search</button>
        )}
      </div>

      <div className={styles['news-feed-card-container']}>
        {filteredNews.map((item) => (
          <div key={item._id} className={styles['news-feed-card']}>
            <h2 className="text-xl font-semibold mb-2">{item.title}</h2>
            <p className="text-sm opacity-70">{item.content}</p>
            <button onClick={() => handleDeleteNews(item._id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsFeedPage;
