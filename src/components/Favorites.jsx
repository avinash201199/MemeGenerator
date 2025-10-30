import React from 'react';
import { useFavorites } from '../hooks/useFavorites';

const Favorites = ({ setMeme }) => {
  const { favorites, toggleFavorite } = useFavorites();

  if (favorites.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 p-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-white text-2xl font-bold mb-6">Your Favorite Templates</h1>
          
          <div className="text-center py-12">
            <div className="text-6xl mb-4">❤️</div>
            <h3 className="text-white text-xl mb-2">No Favorites Yet</h3>
            <p className="text-gray-400 mb-4">
              Heart your favorite meme templates to see them here
            </p>
            <a 
              href="/"
              className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg transition-colors inline-block"
            >
              Browse Templates
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-white text-2xl font-bold mb-6">Your Favorite Templates</h1>
        
        <p className="text-gray-400 mb-6">
          {favorites.length} favorite template{favorites.length !== 1 ? 's' : ''}
        </p>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {favorites.map((template) => (
            <div
              key={template.id}
              className="group relative bg-gray-800 rounded-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-pink-500/20 border border-gray-700 hover:border-pink-500"
              onClick={() => setMeme(template)}
            >
              <div className="aspect-square relative overflow-hidden">
                <img 
                  src={template.url} 
                  alt={template.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                />
                
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300"></div>
                
                {/* Heart button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(template);
                  }}
                  className="absolute top-2 right-2 p-1 rounded-full bg-black/50 hover:bg-black/70 transition-all"
                >
                  <span className="text-red-500 text-lg">❤️</span>
                </button>
                
                {/* Play icon on hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-pink-600 rounded-full p-3 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                    <span className="text-white text-xl">🎭</span>
                  </div>
                </div>
              </div>

              <div className="p-2 sm:p-3">
                <h3 className="text-white text-xs sm:text-sm font-medium truncate mb-1">{template.name}</h3>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-xs text-gray-500">📝 {template.box_count} texts</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Favorites;