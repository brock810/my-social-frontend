import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { setUser } from './redux/actions/userActions';
import { useClient } from 'react';

const Component = ({ user, setUser }) => {
  useClient();
  const [inputValue, setInputValue] = useState('');
  const [backendUser, setBackendUser] = useState(null);
  const getUserEndpoint = 'http://localhost:3001/api/getUser'; 
  const setUserEndpoint = 'http://localhost:3001/api/setUser'; 
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(getUserEndpoint);
        const result = await response.json();
        setBackendUser(result.user);
      } catch (error) {
        console.error('Error fetching user data from backend:', error);
      }
    };

    fetchData();
  }, []);


  const handleSetUser = async () => {
    try {
      setLoading(true);
      const response = await fetch(setUserEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user: { name: 'John Doe' } }),
      });

      const result = await response.json();
      setBackendUser(result.user);
      setLoading(false);
    } catch (error) {
      console.error('Error setting user on the backend:', error);
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Frontend User: {user ? user.name : 'No user set'}</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <h2>Backend User: {backendUser ? backendUser.name : 'No user set on the backend'}</h2>
          <button onClick={() => setUser({ name: 'John Doe' })}>Set Frontend User</button>
          <button onClick={handleSetUser}>Set Backend User</button>
        </div>
      )}
    </div>
  );
};

const mapStateToProps = (state) => ({
  user: state.user,
});

const mapDispatchToProps = {
  setUser,
};

export default connect(mapStateToProps, mapDispatchToProps)(Component);
