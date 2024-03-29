// ExplorePage.js

import React, { useEffect, useState } from 'react';
import styles from '../styles/Explore.module.css';

const ExplorePage = () => {
  const [socialMediaLinks, setSocialMediaLinks] = useState([]);
  const [newMediaLink, setNewMediaLink] = useState('');
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState('');

  const handleAddMediaLink = async () => {
    try {
      const response = await fetch('https://noble-slow-dragon.glitch.me/api/addSocialMediaLink', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: userName,
          url: newMediaLink,
        }),
      });

      const result = await response.json();

      console.log('Add Media Link Response:', result);

      if (result.success) {
        const newLink = { ...result.link, id: result.link._id };
        setSocialMediaLinks((prevLinks) => [...prevLinks, newLink]);
        setNewMediaLink('');
        setUserName('');
      } else {
        throw new Error(result.error || 'Internal Server Error');
      }
    } catch (error) {
      console.error('Error adding media link on the frontend:', error);
      setError(error.message || 'An error occurred while adding media link');
    }
  };

  const handleDeleteMediaLink = async (id) => {
    try {
      if (id === undefined || id === null) {
        console.error('Cannot delete a link with undefined or null ID. Received ID:', id);
        return;
      }

      console.log('Deleting media link with ID:', id);

      try {
        const response = await fetch(`https://noble-slow-dragon.glitch.me/api/deleteSocialMediaLink/${id}`, {
          method: 'DELETE',
        });

        const result = await response.json();

        console.log('Delete Media Link Response:', result);

        if (result.success) {
          setSocialMediaLinks((prevLinks) => prevLinks.filter((link) => link.id !== id));
        } else {
          throw new Error(result.error || 'Internal Server Error');
        }
      } catch (error) {
        console.error('Error deleting media link on the frontend:', error);
        setError(error.message || 'An error occurred while deleting media link');
      }
    } catch (error) {
      console.error('Error in handleDeleteMediaLink:', error);
    }
  };

  useEffect(() => {
    const fetchSocialMediaLinks = async () => {
      try {
        const response = await fetch('https://noble-slow-dragon.glitch.me/api/getSocialMediaLinks');
        const result = await response.json();

        if (result.socialMediaLinks) {
          setSocialMediaLinks(result.socialMediaLinks);
        } else {
          throw new Error(result.error || 'Internal server Error');
        }
      } catch (error) {
        console.error('Error fetching social media links from backend', error);
        setError(error.message || 'An error occurred while fetching social media links');
      }
    };

    fetchSocialMediaLinks();
  }, []);

  return (
    <div className={styles['explore-container']}>
      <div className={styles['explore-header']}>
        <h1 className="text-4xl font-bold mb-4">Exploring Social Media</h1>
        <p className="text-lg opacity-80">Add any social media for me to see!</p>
      </div>

      <div className={styles['social-media-links']}>
        <h2 className="text-3xl font-semibold mb-2">My Social Media Links</h2>
        <ul className={styles['media-links-list']}>
          {socialMediaLinks.map((link) => (
            <li key={link.id} className={styles['media-link-item']}>
              <a href={link.url} target="_blank" rel="noopener noreferrer">
                {link.name}
              </a>
              <button
                onClick={() => {
                  const linkId = link._id;
                  if (linkId !== undefined && linkId !== null) {
                    console.log('Attempting to delete link with ID:', linkId);
                    handleDeleteMediaLink(linkId);
                  } else {
                    console.error('Cannot delete a link with undefined or null ID. Received ID:', linkId);
                  }
                }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles['add-media-link-form']}>
        <h2 className="text-3xl font-semibold mb-2">Add Your Social Media Link</h2>
        <div className={styles['input-container']}>
          <input
            type="text"
            placeholder="Your Name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className={styles['input-field']}
          />
          <input
            type="text"
            placeholder="Social Media Link"
            value={newMediaLink}
            onChange={(e) => setNewMediaLink(e.target.value)}
            className={styles['input-field']}
          />
          <button onClick={handleAddMediaLink} className={styles['add-link-button']}>
            Add Link
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;
