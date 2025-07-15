import React, { useEffect, useState } from 'react';
import './App.css';

// Add Google Fonts import
const fontLink = document.createElement('link');
fontLink.href = 'https://fonts.googleapis.com/css2?family=Quicksand:wght@500;700&family=Pacifico&display=swap';
fontLink.rel = 'stylesheet';
document.head.appendChild(fontLink);

/**
 * Main App component for the Recipe Finder application
 */
function App() {
  const [hasSearched, setHasSearched] = useState(false);
  const [view, setView] = useState('home');
  const [category, setCategory] = useState(null);
  const [favorites, setFavorites] = useState(() => {
    const favs = localStorage.getItem('favorites');
    return favs ? JSON.parse(favs) : [];
  });
  const [modalRecipe, setModalRecipe] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const handleNav = (nav) => {
    setView(nav);
    setHasSearched(false);
    setCategory(null);
  };

  const handleCategorySelect = (cat) => {
    setCategory(cat);
    setView('home');
    setHasSearched(true);
  };

  const toggleFavorite = (recipe) => {
    setFavorites((prev) => {
      const exists = prev.find((r) => r.idMeal === recipe.idMeal);
      if (exists) {
        return prev.filter((r) => r.idMeal !== recipe.idMeal);
      } else {
        return [...prev, recipe];
      }
    });
  };

  const isFavorited = (idMeal) => favorites.some((r) => r.idMeal === idMeal);

  const openRecipeModal = async (recipe) => {
    if (!recipe || !recipe.idMeal) {
      console.error("Invalid recipe object:", recipe);
      return;
    }

    setModalRecipe(null);
    setModalLoading(true);
    
    try {
      const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipe.idMeal}`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      
      if (data.meals && data.meals[0]) {
        setModalRecipe(data.meals[0]);
      } else {
        console.error("No recipe data found for ID:", recipe.idMeal);
      }
    } catch (error) {
      console.error("Failed to fetch recipe details:", error);
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setModalRecipe(null);
    setModalLoading(false);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="header-title">🥞 recipe finder</h1>
        <nav className="header-nav">
          <a href="#" onClick={() => handleNav('home')}>Home</a>
          <a href="#" onClick={() => handleNav('categories')}>Categories</a>
          <a href="#" onClick={() => handleNav('favorites')}>Favorites</a>
          <a href="#" onClick={() => handleNav('about')}>About</a>
        </nav>
      </header>

      <main className="main-content">
        {view === 'home' && !hasSearched && !category && (
          <div className="welcome-section">
            <img 
              src="https://cdn-icons-png.flaticon.com/512/1046/1046857.png" 
              alt="Cooking" 
              className="welcome-icon"
            />
            <h2>Welcome to Recipe Finder!</h2>
            <p>Type an ingredient or dish name below and discover delicious recipes.</p>
          </div>
        )}

        {view === 'home' && (
          <RecipeFinder
            onSearch={() => setHasSearched(true)}
            category={category}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            isFavorited={isFavorited}
            openRecipeModal={openRecipeModal}
          />
        )}

        {view === 'categories' && (
          <Categories onSelect={handleCategorySelect} />
        )}

        {view === 'favorites' && (
          <Favorites
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            isFavorited={isFavorited}
            openRecipeModal={openRecipeModal}
          />
        )}

        {view === 'about' && (
          <div className="about-section">
            <h2>🍳 Welcome to the recipe finder App!</h2>
            <p>
              Your cozy little helper to find yummy recipes in seconds.<br/>
              Whether you're hungry or just curious, type in a dish or ingredient and let the magic happen!<br/><br/>
              Built with coffee ☕ and lots of React JS. 💻<br/><br/>
              <span className="highlight">✨ Made with love by Asra Shahbaz</span>,<br/>
              <span className="highlight">someone who believes coding and cooking both need the right mix! 💛</span>
            </p>
          </div>
        )}
      </main>

      {/* Recipe Details Modal */}
      {(modalRecipe || modalLoading) && (
        <RecipeDetailsModal
          recipe={modalRecipe}
          loading={modalLoading}
          closeModal={closeModal}
          toggleFavorite={toggleFavorite}
          isFavorited={isFavorited}
        />
      )}

      <footer className="app-footer">
        &copy; 2025 Recipe Finder. All rights reserved.
      </footer>
    </div>
  );
}

/**
 * RecipeFinder component for searching and displaying recipes
 */
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

  return (
    <div className="recipe-finder">
      <form onSubmit={searchRecipes} className="search-form">
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
        <p className="loading-text">
          <span className="loading-icon">🔄</span> Loading recipes...
        </p>
      )}
      
      {error && (
        <p className="error-text">
          <span className="error-icon">😔</span> {error}
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
              className="recipe-image"
            />
            <h3 className="recipe-title">
              {recipe.strMeal}
              <span
                className={`heart-icon ${isFavorited && isFavorited(recipe.idMeal) ? 'filled' : 'empty'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite && toggleFavorite(recipe);
                }}
                title={isFavorited && isFavorited(recipe.idMeal) ? 'Remove from favorites' : 'Add to favorites'}
              >
                {isFavorited && isFavorited(recipe.idMeal) ? '♥' : '♡'}
              </span>
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Categories component to display recipe categories
 */
function Categories({ onSelect }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetch('https://www.themealdb.com/api/json/v1/1/list.php?c=list')
      .then(res => res.json())
      .then(data => {
        setCategories(data.categories || data.meals || []);
      })
      .catch(() => setError('Failed to load categories.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-section"><h2>Categories</h2><p>Loading categories...</p></div>;
  if (error) return <div className="error-section"><h2>Categories</h2><p>{error}</p></div>;

  return (
    <div className="categories-section">
      <h2>Categories</h2>
      <div className="categories-grid">
        {categories.map((cat, idx) => (
          <button
            key={cat.strCategory || idx}
            className="category-button"
            onClick={() => onSelect(cat.strCategory)}
          >
            {cat.strCategory}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Favorites component to display favorited recipes
 */
function Favorites({ favorites, toggleFavorite, isFavorited, openRecipeModal }) {
  return (
    <div className="favorites-section">
      <h2>Your Favorite Recipes</h2>
      {favorites.length === 0 ? (
        <p className="no-favorites">No favorites yet. Go add some!</p>
      ) : (
        <div className="recipe-list">
          {favorites.map(recipe => (
            <div
              key={recipe.idMeal}
              className="recipe-card"
              onClick={() => openRecipeModal(recipe)}
            >
              <img
                src={recipe.strMealThumb}
                alt={recipe.strMeal}
                className="recipe-image"
              />
              <h3 className="recipe-title">
                {recipe.strMeal}
                <span
                  className={`heart-icon ${isFavorited && isFavorited(recipe.idMeal) ? 'filled' : 'empty'}`}
                  onClick={e => {
                    e.stopPropagation();
                    toggleFavorite && toggleFavorite(recipe);
                  }}
                  title={isFavorited && isFavorited(recipe.idMeal) ? 'Remove from favorites' : 'Add to favorites'}
                >
                  {isFavorited && isFavorited(recipe.idMeal) ? '♥' : '♡'}
                </span>
              </h3>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * RecipeDetailsModal component for displaying recipe details
 */
function RecipeDetailsModal({ recipe, loading, closeModal, toggleFavorite, isFavorited }) {
  const getYoutubeEmbed = (url) => {
    if (!url) return null;
    const match = url.match(/(?:v=|\.be\/)([\w-]{11})/);
    if (!match) return null;
    return `https://www.youtube.com/embed/${match[1]}`;
  };

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          {recipe && (
            <button
              className="modal-fav-btn"
              onClick={() => toggleFavorite && toggleFavorite(recipe)}
              title={isFavorited && isFavorited(recipe.idMeal) ? 'Remove from favorites' : 'Add to favorites'}
            >
              {isFavorited && isFavorited(recipe.idMeal) ? '♥' : '♡'}
            </button>
          )}
          <button className="modal-close" onClick={closeModal} title="Close">
            ×
          </button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="modal-loading">Loading recipe details...</div>
          ) : !recipe ? (
            <div className="modal-error">
              <p>Unable to load recipe details.</p>
              <button onClick={closeModal} className="btn-primary">Close</button>
            </div>
          ) : (
            <>
              <h2 className="modal-title">{recipe.strMeal}</h2>
              <img 
                src={recipe.strMealThumb} 
                alt={recipe.strMeal} 
                className="modal-image"
              />
              
              <div className="recipe-meta">
                {recipe.strArea && <span className="meta-item">🌎 {recipe.strArea}</span>}
                {recipe.strTags && <span className="meta-item">🏷️ {recipe.strTags.split(',').map(tag => tag.trim()).join(', ')}</span>}
              </div>

              <div className="ingredients-section">
                <h4>Ingredients:</h4>
                <ul className="ingredients-list">
                  {Array.from({ length: 20 }, (_, i) => i + 1)
                    .map(i => ({
                      ingredient: recipe[`strIngredient${i}`],
                      measure: recipe[`strMeasure${i}`],
                    }))
                    .filter(item => item.ingredient && item.ingredient.trim())
                    .map((item, idx) => (
                      <li key={idx}>{item.ingredient} - {item.measure}</li>
                    ))}
                </ul>
              </div>

              <div className="instructions-section">
                <h4>Instructions:</h4>
                <p className="instructions-text">{recipe.strInstructions}</p>
              </div>

              {recipe.strYoutube && getYoutubeEmbed(recipe.strYoutube) && (
                <div className="video-container">
                  <iframe
                    src={getYoutubeEmbed(recipe.strYoutube)}
                    title="YouTube Video"
                    allowFullScreen
                    frameBorder="0"
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;