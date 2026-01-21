import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react'; // Import the Auth0 hook
import './App.css';

const API_URL = 'http://localhost:3001/api';

// Utility function to decode JWT token
const decodeToken = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const decoded = JSON.parse(atob(parts[1]));
    return decoded;
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

function App() {
  const [movies, setMovies] = useState([]);
  const [newMovieTitle, setNewMovieTitle] = useState('');
  const [showTokens, setShowTokens] = useState(false);
  const [decodedIdToken, setDecodedIdToken] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Destructure the properties you need from the useAuth0 hook
  const {
    isAuthenticated,
    user,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
    getIdTokenClaims
  } = useAuth0();

  // Check if the user has the required permission by decoding the access token
  useEffect(() => {
    if (isAuthenticated) {
      const checkPermissions = async () => {
        try {
          const token = await getAccessTokenSilently();
          const decodedToken = decodeToken(token);
          const permissions = decodedToken?.['permissions'] || [];
          setIsAdmin(permissions.includes('manage:movies'));
          console.log('Access Token Permissions:', permissions);
          console.log('Is Admin:', permissions.includes('manage:movies'));
        } catch (error) {
          console.error('Failed to check permissions:', error);
          setIsAdmin(false);
        }
      };
      checkPermissions();
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  // The useEffect hook will now only run if the user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const fetchMovies = async () => {
        try {
          const token = await getAccessTokenSilently(); // Get the token
          const response = await fetch(`${API_URL}/movies`, {
            headers: {
              Authorization: `Bearer ${token}`, // Add the token to the header
            },
          });
          const data = await response.json();
          setMovies(data);
        } catch (error) {
          console.error("Failed to fetch movies:", error);
        }
      };
      fetchMovies();
    }
  }, [isAuthenticated, getAccessTokenSilently]); // Rerun this effect when isAuthenticated changes

  // Fetch and decode tokens when user clicks to view them
  const handleShowTokens = async () => {
    try {
      const idTokenClaims = await getIdTokenClaims();
      const token = await getAccessTokenSilently();
      setDecodedIdToken(decodeToken(idTokenClaims.__raw));
      setAccessToken(token);
      setShowTokens(true);
    } catch (error) {
      console.error('Failed to fetch tokens:', error);
    }
  };
  // ... (No changes needed for handleAddMovie, handleToggleWatched, handleDeleteMovie)
  const handleAddMovie = async (e) => {
    e.preventDefault();
    if (!newMovieTitle.trim()) return;
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`${API_URL}/movies`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ title: newMovieTitle }),
      });
      const addedMovie = await response.json();
      setMovies([...movies, addedMovie]);
      setNewMovieTitle('');
    } catch (error) { console.error("Failed to add movie:", error); }
  };
  const handleToggleWatched = async (id) => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`${API_URL}/movies/${id}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, });
      const updatedMovie = await response.json();
      setMovies(movies.map(movie => movie.id === id ? updatedMovie : movie));
    } catch (error) { console.error("Failed to update movie:", error); }
  };
  const handleDeleteMovie = async (id) => {
    try {
      const token = await getAccessTokenSilently();
      await fetch(`${API_URL}/movies/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}`} });
      setMovies(movies.filter(movie => movie.id !== id));
    } catch (error) { console.error("Failed to delete movie:", error); }
  };

  // --- Login Button Component ---
  const LoginButton = () => (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2>Welcome to Your Movie Wishlist</h2>
        <p>Please log in to continue.</p>
        <button className="add-movie-form button" onClick={() => loginWithRedirect()}>Log In</button>
    </div>
  );

  // --- Main App Display ---
  if (!isAuthenticated) {
    return (
      <div className="App">
        <LoginButton />
      </div>
    );
  }

  return (
    <div className="App">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>My Movie Wishlist</h1>
        <div>
            <span style={{ marginRight: '15px' }}>Hello, {user.name}!</span>
            <button style={{ borderRadius: '4px', width: 'auto', padding: '8px 12px', marginRight: '10px' }} onClick={handleShowTokens}>
                View Tokens
            </button>
            <button className="delete-btn" style={{ borderRadius: '4px', width: 'auto', padding: '8px 12px' }} onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
                Log Out
            </button>
        </div>
      </div>
      
      {showTokens && (
        <div style={{ backgroundColor: '#f5f5f5', padding: '20px', marginBottom: '20px', borderRadius: '4px', border: '1px solid #ddd' }}>
          <h2>Auth0 Tokens</h2>
          <button onClick={() => setShowTokens(false)} style={{ marginBottom: '15px', padding: '8px 12px' }}>Hide Tokens</button>
          
          <div style={{ marginBottom: '20px' }}>
            <h3>ID Token (Decoded)</h3>
            <pre style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '4px', overflow: 'auto', maxHeight: '300px', border: '1px solid #ccc' }}>
              {JSON.stringify(decodedIdToken, null, 2)}
            </pre>
          </div>
          
          <div>
            <h3>Access Token</h3>
            <pre style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '4px', overflow: 'auto', maxHeight: '200px', border: '1px solid #ccc' }}>
              {accessToken}
            </pre>
          </div>
        </div>
      )}
      
      {isAdmin && (
      <form onSubmit={handleAddMovie} className="add-movie-form">
        <input type="text" value={newMovieTitle} onChange={(e) => setNewMovieTitle(e.target.value)} placeholder="e.g., The Godfather" />
        <button type="submit">Add Movie</button>
      </form>
      )}

      <ul className="movie-list">
        {movies.map((movie) => (
          <li key={movie.id} className="movie-item">
            <span className={`title ${movie.watched ? 'watched' : ''}`} onClick={() => handleToggleWatched(movie.id)} style={{cursor: isAdmin ? 'pointer' : 'default'}}>
              {movie.title}
            </span>
            {isAdmin && (
            <button onClick={() => handleDeleteMovie(movie.id)} className="delete-btn">X</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
