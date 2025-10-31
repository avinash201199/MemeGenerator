import { useState, useEffect } from 'react';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('favoriteMemes') || '[]');
    setFavorites(saved);
  }, []);

  const toggleFavorite = (meme) => {
    const saved = JSON.parse(localStorage.getItem('favoriteMemes') || '[]');
    const exists = saved.find(fav => fav.id === meme.id);
    
    let updated;
    if (exists) {
      updated = saved.filter(fav => fav.id !== meme.id);
    } else {
      updated = [...saved, {
        id: meme.id,
        name: meme.name,
        url: meme.url,
        box_count: meme.box_count,
        width: meme.width,
        height: meme.height,
        added_at: new Date().toISOString()
      }];
    }
    
    localStorage.setItem('favoriteMemes', JSON.stringify(updated));
    setFavorites(updated);
    return !exists;
  };

  const isFavorite = (memeId) => {
    return favorites.some(fav => fav.id === memeId);
  };

  return { favorites, toggleFavorite, isFavorite };
};