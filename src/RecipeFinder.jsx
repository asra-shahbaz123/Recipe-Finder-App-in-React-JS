import React, { useEffect, useState } from 'react';
import './App.css';

const RecipeFinder = ({ onSearch, category, favorites = [], toggleFavorite, isFavorited, openRecipeModal }) => {
  const [query, setQuery] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (category) {
      setQuery('');
      setLoading(true);
      setError('');
      fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(category)}`)
        .then(res => res.json())
        .then(data => {
          setRecipes(data.meals || []);
          if (!data.meals) setError('No recipe found.');
        })
        .catch(() => setError('Failed to fetch recipes.'))
        .finally(() => setLoading(false));
    }
  }, [category]);

  const searchRecipes = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (onSearch) onSearch();
    try {
      const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
      const data = await res.json();
      setRecipes(data.meals || []);
      if (!data.meals) setError('No recipe found.');
    } catch (err) {
      setError('Failed to fetch recipes.');
    }
    setLoading(false);
  };

  const handleRecipeClick = (recipe) => {
    if (openRecipeModal) {
      openRecipeModal(recipe);
    }
  };

  // Enhanced Heart component with better styling
  const Heart = ({ filled, onClick }) => (
    <span
      className={`heart-icon ${filled ? 'filled' : 'empty'}`}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
      title={filled ? 'Remove from favorites' : 'Add to favorites'}
    >
      {filled ? '♥' : '♡'}
    </span>
  );

  return (
    <div className="recipe-finder">
      {/* <h1>🍳 Recipe Finder</h1> */}
      <form onSubmit={searchRecipes}>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search for a recipe... "
          className="input-field"
        />
        <button type="submit" className="btn-primary">
          Search 
        </button>
      </form>
      
      {loading && (
        <p>
          <span style={{ fontSize: '1.2em' }}>🔄</span> Loading recipes...
        </p>
      )}
      
      {error && (
        <p className="error-text">
          <span style={{ fontSize: '1.2em' }}>😔</span> {error}
        </p>
      )}
      
      <div className="recipe-list">
        {recipes.map(recipe => (
          <div
            key={recipe.idMeal}
            className="recipe-card"
            onClick={() => handleRecipeClick(recipe)}
          >
            <img 
              src={recipe.strMealThumb} 
              alt={recipe.strMeal}
              loading="lazy"
            />
            <h3>
              {recipe.strMeal}
              <Heart
                filled={isFavorited && isFavorited(recipe.idMeal)}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite && toggleFavorite(recipe);
                }}
              />
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecipeFinder;