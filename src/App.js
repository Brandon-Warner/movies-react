import { useState, useEffect } from 'react';
import './App.css';

// The base URL of your backend API
const API_URL = 'http://localhost:3001/api';

function App() {
  const [movies, setMovies] = useState([]);
  const [newMovieTitle, setNewMovieTitle] = useState('');

  // --- Data Fetching and Updating ---

  // Fetch all movies from the server when the app starts
  useEffect(() => {
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
  }, []); // The empty array ensures this runs only once on mount

  // Handle adding a new movie
  const handleAddMovie = async (e) => {
    e.preventDefault(); // Prevent form from refreshing the page
    if (!newMovieTitle.trim()) return; // Don't add empty titles

    try {
      const response = await fetch(`${API_URL}/movies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newMovieTitle }),
      });

      const addedMovie = await response.json();
      setMovies([...movies, addedMovie]); // Add the new movie to the local state
      setNewMovieTitle(''); // Clear the input field
    } catch (error) {
      console.error("Failed to add movie:", error);
    }
  };

  // Handle toggling the 'watched' status of a movie
  const handleToggleWatched = async (id) => {
    try {
      const response = await fetch(`${API_URL}/movies/${id}`, {
        method: 'PUT',
      });
      const updatedMovie = await response.json();
      // Update the movie in the local state
      setMovies(movies.map(movie => movie.id === id ? updatedMovie : movie));
    } catch (error) {
      console.error("Failed to update movie:", error);
    }
  };

  // Handle deleting a movie
  const handleDeleteMovie = async (id) => {
    try {
      await fetch(`${API_URL}/movies/${id}`, {
        method: 'DELETE',
      });
      // Remove the movie from the local state
      setMovies(movies.filter(movie => movie.id !== id));
    } catch (error) {
      console.error("Failed to delete movie:", error);
    }
  };


  return (
    <div className="App">
      <h1>My Movie Wishlist</h1>

      {/* Form to add a new movie */}
      <form onSubmit={handleAddMovie} className="add-movie-form">
        <input
          type="text"
          value={newMovieTitle}
          onChange={(e) => setNewMovieTitle(e.target.value)}
          placeholder="e.g., The Godfather"
        />
        <button type="submit">Add Movie</button>
      </form>

      {/* List of movies */}
      <ul className="movie-list">
        {movies.map((movie) => (
          <li key={movie.id} className="movie-item">
            <span
              className={`title ${movie.watched ? 'watched' : ''}`}
              onClick={() => handleToggleWatched(movie.id)}
            >
              {movie.title}
            </span>
            <button
              onClick={() => handleDeleteMovie(movie.id)}
              className="delete-btn"
            >
              X
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
