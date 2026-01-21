import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react'; // Import the Auth0 hook
import './App.css';

const API_URL = 'http://localhost:3001/api';

function App() {
  const [movies, setMovies] = useState([]);
  const [newMovieTitle, setNewMovieTitle] = useState('');
  
  // Destructure the properties you need from the useAuth0 hook
  const {
    isAuthenticated,
    user,
    loginWithRedirect,
    logout,
  } = useAuth0();

  // The useEffect hook will now only run if the user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const fetchMovies = async () => {
        try {
          const response = await fetch(`${API_URL}/movies`);
          const data = await response.json();
          setMovies(data);
        } catch (error) {
          console.error("Failed to fetch movies:", error);
        }
      };
      fetchMovies();
    }
  }, [isAuthenticated]); // Rerun this effect when isAuthenticated changes

  // --- All your handler functions (handleAddMovie, etc.) remain the same ---
  // ... (No changes needed for handleAddMovie, handleToggleWatched, handleDeleteMovie)
  const handleAddMovie = async (e) => {
    e.preventDefault();
    if (!newMovieTitle.trim()) return;
    try {
      const response = await fetch(`${API_URL}/movies`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: newMovieTitle }),
      });
      const addedMovie = await response.json();
      setMovies([...movies, addedMovie]);
      setNewMovieTitle('');
    } catch (error) { console.error("Failed to add movie:", error); }
  };
  const handleToggleWatched = async (id) => {
    try {
      const response = await fetch(`${API_URL}/movies/${id}`, { method: 'PUT' });
      const updatedMovie = await response.json();
      setMovies(movies.map(movie => movie.id === id ? updatedMovie : movie));
    } catch (error) { console.error("Failed to update movie:", error); }
  };
  const handleDeleteMovie = async (id) => {
    try {
      await fetch(`${API_URL}/movies/${id}`, { method: 'DELETE' });
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
            <button className="delete-btn" style={{ borderRadius: '4px', width: 'auto', padding: '8px 12px' }} onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
                Log Out
            </button>
        </div>
      </div>
      
      <form onSubmit={handleAddMovie} className="add-movie-form">
        <input type="text" value={newMovieTitle} onChange={(e) => setNewMovieTitle(e.target.value)} placeholder="e.g., The Godfather" />
        <button type="submit">Add Movie</button>
      </form>
      
      <ul className="movie-list">
        {movies.map((movie) => (
          <li key={movie.id} className="movie-item">
            <span className={`title ${movie.watched ? 'watched' : ''}`} onClick={() => handleToggleWatched(movie.id)}>
              {movie.title}
            </span>
            <button onClick={() => handleDeleteMovie(movie.id)} className="delete-btn">X</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
