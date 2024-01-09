import React, { useEffect, useState } from 'react';
import styles from '../styles/Explore.module.css';
import io from 'socket.io-client';

const isBrowser = typeof window !== 'undefined';

const ExplorePage = () => {
  const [socialMediaLinks, setSocialMediaLinks] = useState([]);
  const [newMediaLink, setNewMediaLink] = useState('');
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState('');

  const socket = io('https://noble-slow-dragon.glitch.me');

  const saveLinksToLocalStorage = (links) => {
    localStorage.setItem('socialMediaLinks', JSON.stringify(links));
  };

  const getLinksFromLocalStorage = () => {
    const storedLinks = localStorage.getItem('socialMediaLinks');
    return storedLinks ? JSON.parse(storedLinks) : [];
  };

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
  
        // Broadcast the new link to all connected clients using WebSocket
        socket.emit('newMediaLink', newLink);
  
        // Use the callback version of setSocialMediaLinks to ensure the latest state
        setSocialMediaLinks((prevLinks) => {
          saveLinksToLocalStorage([...prevLinks, newLink]);
          return [...prevLinks, newLink];
        });
  
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
          saveLinksToLocalStorage(socialMediaLinks.filter((link) => link.id !== id));
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
        const storedLinks = getLinksFromLocalStorage();
  
        if (result.socialMediaLinks) {
          setSocialMediaLinks(result.socialMediaLinks);
          saveLinksToLocalStorage(result.socialMediaLinks);
        } else {
          if (storedLinks.length > 0) {
            setSocialMediaLinks(storedLinks);
          } else {
            fetchSocialMediaLinks();
          }
        }
  
        // Listen for newMediaLink events from the server
        socket.on('newMediaLink', (newLink) => {
          setSocialMediaLinks((prevLinks) => [...prevLinks, newLink]);
          saveLinksToLocalStorage([...socialMediaLinks, newLink]);
        });
  
        return () => {
          // Clean up the socket connection when the component unmounts
          socket.disconnect();
        };
      } catch (error) {
        console.error('Error fetching social media links from backend', error);
        setError(error.message || 'An error occurred while fetching social media links');
      }
    };
  
    const storedLinks = getLinksFromLocalStorage();
  
    if (storedLinks.length > 0) {
      setSocialMediaLinks(storedLinks);
    } else {
      fetchSocialMediaLinks();
    }
  }, []);
  

  return (
    <div className={styles['explore-container']}>
      <div className={styles['explore-header']}>
        <h1 className="text-4xl font-bold mb-4">Exploring Social Media</h1>
        <p className="text-lg opacity-80">Add any social media to get your name out there!</p>
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
