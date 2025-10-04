import React, { useState, useEffect } from "react";
import Intro from "../components/Intro";

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
  const [itemsPerPage] = useState(9);

  useEffect(() => {
    fetch("https://api.imgflip.com/get_memes")
      .then((res) => res.json())
      .then((data) => {
        setTemp(data.data.memes);
      });
  }, []);

  const filteredMemes = temp.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMemes = filteredMemes.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const nextPage = () =>
    currentPage < Math.ceil(filteredMemes.length / itemsPerPage) &&
    setCurrentPage(currentPage + 1);

  const renderPagination = () => {
    const totalPages = Math.ceil(filteredMemes.length / itemsPerPage);
    const pages = [];
    const maxVisiblePages = 7;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push("...", totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, "...");
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages
        );
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

      <main className="flex-grow">
        <Intro /> {/* 👈 Intro is placed here, only on Home */}
        
        {meme === null ? (
          <>
            <Temp temp={currentMemes} setMeme={setMeme} />

            <div className="pagination flex items-center justify-center mb-20 gap-1 px-4">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className="bg-gray-800 text-gray-300 px-4 py-2 border border-gray-600 rounded-lg cursor-pointer hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Previous
              </button>

              {renderPagination().map((page, index) => (
                <React.Fragment key={`page-${index}-${page}`}>
                  {page === "..." ? (
                    <span className="text-gray-400 px-3 py-2 text-sm">...</span>
                  ) : (
                    <button
                      onClick={() => paginate(page)}
                      className={`px-4 py-2 min-w-[44px] border rounded-lg cursor-pointer transition-all duration-300 font-bold text-sm ${
                        currentPage === page
                          ? "active bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white border-blue-400 shadow-lg shadow-blue-500/60 transform scale-110"
                          : "bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700 hover:text-white hover:border-gray-500 hover:scale-105"
                      }`}
                    >
                      {page}
                    </button>
                  )}
                </React.Fragment>
              ))}

              <button
                onClick={nextPage}
                disabled={
                  currentPage === Math.ceil(filteredMemes.length / itemsPerPage)
                }
                className="bg-gray-800 text-gray-300 px-4 py-2 border border-gray-600 rounded-lg cursor-pointer hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <Meme meme={meme} setMeme={setMeme} />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Home;
