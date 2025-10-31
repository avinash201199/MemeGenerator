import React, { useState, useEffect } from "react";

import Navbar from "./Navbar";
import Temp from "../Temp";
import Meme from "../Meme";
import Footer from "./Footer";
import "../style.css";
import "../index.css";

const Home = () => {
  const [temp, setTemp] = useState([]);
  const [meme, setMeme] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [itemsPerPage] = useState(18); // Fixed 18 items per page



  useEffect(() => {
    setIsLoading(true);
    fetch("https://api.imgflip.com/get_memes")
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load memes');
        return res.json();
      })
      .then((data) => {
        setTemp(data.data.memes);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  // Enhanced filtering with categories
  const filteredMemes = temp.filter((meme) => {
    const matchesSearch = meme.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedCategory === 'all') return matchesSearch;
    
    const categoryKeywords = {
      reaction: ['surprised', 'pikachu', 'yelling', 'woman', 'cat'],
      funny: ['spongebob', 'mocking', 'fine', 'dog'],
      choice: ['drake', 'buttons', 'two buttons', 'exit'],
      success: ['cheers', 'dicaprio', 'handshake'],
      programming: ['debugging', 'brain', 'expanding']
    };
    
    const keywords = categoryKeywords[selectedCategory] || [];
    const matchesCategory = keywords.some(keyword => 
      meme.name.toLowerCase().includes(keyword)
    );
    
    return matchesSearch && matchesCategory;
  });

  // Calculate the index of the last and first item on the current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMemes = filteredMemes.slice(indexOfFirstItem, indexOfLastItem);

  // Function to change the current page
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const nextPage = () => {
    if (currentPage < Math.ceil(filteredMemes.length / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Pagination logic for compact display
  const renderPagination = () => {
    const totalPages = Math.ceil(filteredMemes.length / itemsPerPage);
    const pages = [];
    const maxVisiblePages = 7;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Complex pagination with dots
      if (currentPage <= 4) {
        // Show: 1 2 3 4 5 ... last
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        // Show: 1 ... (last-4) (last-3) (last-2) (last-1) last
        pages.push(1, '...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show: 1 ... (current-1) current (current+1) ... last
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="App min-h-screen flex flex-col">
      <Navbar
        setMeme={setMeme}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <main className="flex-grow px-2 sm:px-4">
        {meme === null ? (
          <>
            {/* Categories */}
            <div className="mb-6 text-center">
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                {[
                  { id: 'all', name: 'All', icon: '🎭' },
                  { id: 'reaction', name: 'Reaction', icon: '😱' },
                  { id: 'funny', name: 'Funny', icon: '😂' },
                  { id: 'choice', name: 'Choice', icon: '🤔' },
                  { id: 'success', name: 'Success', icon: '🎉' },
                  { id: 'programming', name: 'Code', icon: '💻' }
                ].map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-all ${
                      selectedCategory === category.id
                        ? 'bg-pink-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {category.icon} {category.name}
                  </button>
                ))}
              </div>
              <p className="text-gray-400 text-sm">
                {filteredMemes.length} memes found
                {selectedCategory !== 'all' && ` in ${selectedCategory}`}
              </p>
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-4 mx-auto max-w-md">
                <div className="flex items-center gap-2">
                  <span className="text-red-400">⚠️</span>
                  <div>
                    <p className="text-red-300 text-sm">{error}</p>
                    <button 
                      onClick={() => window.location.reload()}
                      className="text-red-400 hover:text-red-300 text-xs underline mt-1"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Loading State */}
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
                {[...Array(18)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-700 h-32 sm:h-40 rounded-lg mb-2"></div>
                    <div className="bg-gray-700 h-3 rounded mb-1"></div>
                    <div className="bg-gray-700 h-3 w-2/3 rounded"></div>
                  </div>
                ))}
              </div>
            ) : filteredMemes.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">😅</div>
                <h3 className="text-white text-xl mb-2">No memes found</h3>
                <p className="text-gray-400 mb-4">
                  {searchQuery ? `No results for "${searchQuery}"` : 'No memes in this category'}
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <Temp temp={currentMemes} setMeme={setMeme} />
            )}
            {/* Pagination - Only show if has results */}
            {!isLoading && filteredMemes.length > 0 && (
              <div className="pagination flex flex-wrap items-center justify-center mb-20 gap-1 px-4">
              <button
                className="bg-gray-800 text-gray-300 px-4 py-2 border border-gray-600 rounded-lg cursor-pointer hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                onClick={prevPage}
                disabled={currentPage === 1}
              >
                Previous
              </button>

              {renderPagination().map((page, index) => (
                <React.Fragment key={`page-${index}-${page}`}>
                  {page === '...' ? (
                    <span className="text-gray-400 px-3 py-2 text-sm">...</span>
                  ) : (
                    <button
                      className={`px-4 py-2 min-w-[44px] border rounded-lg cursor-pointer transition-all duration-300 font-bold text-sm ${
                        currentPage === page
                          ? 'active bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white border-blue-400 shadow-lg shadow-blue-500/60 transform scale-110'
                          : 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700 hover:text-white hover:border-gray-500 hover:scale-105'
                      }`}
                      onClick={() => paginate(page)}
                      style={currentPage === page ? {
                        boxShadow: '0 4px 20px rgba(37, 99, 235, 0.6), 0 0 0 2px rgba(59, 130, 246, 0.4)',
                        background: 'linear-gradient(135deg, #3b82f6, #2563eb, #1d4ed8)'
                      } : {}}
                    >
                      {page}
                    </button>
                  )}
                </React.Fragment>
              ))}

              <button
                className="bg-gray-800 text-gray-300 px-4 py-2 border border-gray-600 rounded-lg cursor-pointer hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                onClick={nextPage}
                disabled={currentPage === Math.ceil(filteredMemes.length / itemsPerPage)}
              >
                Next
              </button>
              </div>
            )}
          </>
        ) : (
          <>
            <Meme meme={meme} setMeme={setMeme} />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Home;
