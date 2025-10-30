import React, { useState, useEffect } from 'react';
import { downloadMeme } from '../utils/socialShare';

const MemeHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('memeHistory') || '[]');
    setHistory(saved);
    setLoading(false);
  }, []);

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear all history?')) {
      localStorage.removeItem('memeHistory');
      setHistory([]);
    }
  };

  const deleteMeme = (id) => {
    const updated = history.filter(meme => meme.id !== id);
    localStorage.setItem('memeHistory', JSON.stringify(updated));
    setHistory(updated);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-4">
        <div className="animate-pulse">
          <div className="bg-gray-700 h-8 w-48 rounded mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-700 h-48 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-white text-2xl font-bold">Your Meme History</h1>
          {history.length > 0 && (
            <button 
              onClick={clearHistory}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              🗑️ Clear All
            </button>
          )}
        </div>
        
        {history.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-white text-xl mb-2">No Memes Yet</h3>
            <p className="text-gray-400 mb-4">
              Your generated memes will appear here
            </p>
            <a 
              href="/"
              className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg transition-colors inline-block"
            >
              Create Your First Meme
            </a>
          </div>
        ) : (
          <>
            <p className="text-gray-400 mb-4">
              {history.length} meme{history.length !== 1 ? 's' : ''} in your history
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {history.map((meme) => (
                <div key={meme.id} className="bg-gray-800 rounded-lg overflow-hidden group hover:shadow-xl transition-all">
                  <div className="relative">
                    <img 
                      src={meme.url} 
                      alt="Generated meme" 
                      className="w-full h-48 object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all"></div>
                    
                    {/* Action buttons */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => deleteMeme(meme.id)}
                        className="bg-red-600 hover:bg-red-700 text-white p-1 rounded text-xs mr-1"
                        title="Delete"
                      >
                        🗑️
                      </button>
                      <button
                        onClick={() => downloadMeme(meme.url, `meme-${meme.id}`)}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-1 rounded text-xs"
                        title="Download"
                      >
                        💾
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-3">
                    <h3 className="text-white font-medium text-sm truncate mb-1">
                      {meme.template_name}
                    </h3>
                    <p className="text-gray-400 text-xs mb-2">
                      {new Date(meme.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                    
                    {/* Show meme texts */}
                    {meme.texts && meme.texts.length > 0 && (
                      <div className="text-xs text-gray-500">
                        {meme.texts.slice(0, 2).map((text, i) => (
                          <p key={i} className="truncate">"{text}"</p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MemeHistory;