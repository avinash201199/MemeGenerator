import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../ThemeContext";
// eslint-disable-next-line no-unused-vars
import "../index.css"

const Navbar = ({setMeme, searchQuery, setSearchQuery}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const isHomePage = location.pathname === "/";
    const { isDarkTheme, toggleTheme } = useTheme();

    const handleSearchChange = (event) => {
        if (setSearchQuery) {
            setSearchQuery(event.target.value);
        }
    };

    return (
        <nav className="navbar bg-black text-white flex justify-between items-center px-4 sm:px-10 py-2 shadow-md sticky top-0 z-10 rounded-full border-1 border-black border-opacity-70">
            {/* Left side: Logo and Navigation Links */}
            <div className="flex items-center space-x-6">
                <div className="logo font-bold text-xl sm:text-2xl">Meme Generator</div>
                
                <ul className="nav-links list-none flex items-center space-x-4 sm:space-x-8">
                    <li>
                        <Link 
                            to="/" 
                            onClick={() => setMeme && setMeme(null)} 
                            className="text-white hover:text-blue-400 transition-colors duration-200 text-sm sm:text-base"
                        >
                            Home
                        </Link>
                    </li>
                    <li>
                        <Link 
                            to="/" 
                            onClick={() => setMeme && setMeme(null)} 
                            className="text-white hover:text-blue-400 transition-colors duration-200 text-sm sm:text-base"
                        >
                            Memes
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/dynamic"
                            className="text-white hover:text-blue-400 transition-colors duration-200 text-sm sm:text-base"
                        >
                            Dynamic Meme
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/about"
                            className="text-white hover:text-blue-400 transition-colors duration-200 text-sm sm:text-base"
                        >
                            About
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/history"
                            className="text-white hover:text-blue-400 transition-colors duration-200 text-sm sm:text-base"
                        >
                            History
                        </Link>
                    </li>
                    
                    {/* Theme Toggle Button */}
                    <li>
                        <button 
                            className="theme-toggle bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-none rounded-full px-4 py-2 text-xs sm:text-sm cursor-pointer transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                            onClick={toggleTheme}
                        >
                            {isDarkTheme ? 'Light Mode' : 'Dark Mode'}
                        </button>
                    </li>
                    
                    <li>
                        <button
                            className="goback bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-none rounded-full px-4 py-2 text-xs sm:text-sm cursor-pointer transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setMeme && setMeme(null);
                                navigate("/");
                            }}
                        >
                            ← Go Back
                        </button>
                    </li>
                </ul>
            </div>

            {/* Right side: Search Bar and GitHub Link */}
            <div className="flex items-center space-x-6">
                {/* Search Bar - Only show on home page */}
                {isHomePage && (
                    <>
                        {/* Desktop Search */}
                        <div className="hidden md:block">
                            <input
                                type="text"
                                placeholder="Search Memes..."
                                value={searchQuery || ""}
                                onChange={handleSearchChange}
                                className="bg-gray-800 text-white px-4 py-2 rounded-full border border-gray-600 focus:border-blue-400 focus:outline-none text-sm w-48 lg:w-64"
                            />
                        </div>
                        
                        {/* Mobile Search Toggle */}
                        <button
                            className="md:hidden text-white hover:text-blue-400 transition-colors duration-200"
                            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"></circle>
                                <path d="m21 21-4.35-4.35"></path>
                            </svg>
                        </button>
                    </>
                )}

                {/* GitHub Link */}
                <a href="https://github.com/avinash201199/MemeGenerator" target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-400 transition-colors duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512">
                        <path d="M256,32C132.3,32,32,134.9,32,261.7c0,101.5,64.2,187.5,153.2,217.9a17.56,17.56,0,0,0,3.8.4c8.3,0,11.5-6.1,11.5-11.4,0-5.5-.2-19.9-.3-39.1a102.4,102.4,0,0,1-22.6,2.7c-43.1,0-52.9-33.5-52.9-33.5-10.2-26.5-24.9-33.6-24.9-33.6-19.5-13.7-.1-14.1,1.4-14.1h.1c22.5,2,34.3,23.8,34.3,23.8,11.2,19.6,26.2,25.1,39.6,25.1a63,63,0,0,0,25.6-6c2-14.8,7.8-24.9,14.2-30.7-49.7-5.8-102-25.5-102-113.5,0-25.1,8.7-45.6,23-61.6-2.3-5.8-10-29.2,2.2-60.8a18.64,18.64,0,0,1,5-.5c8.1,0,26.4,3.1,56.6,24.1a208.21,208.21,0,0,1,112.2,0c30.2-21,48.5-24.1,56.6-24.1a18.64,18.64,0,0,1,5,.5c12.2,31.6,4.5,55,2.2,60.8,14.3,16.1,23,36.6,23,61.6,0,88.2-52.4,107.6-102.3,113.3,8,7.1,15.2,21.1,15.2,42.5,0,30.7-.3,55.5-.3,63,0,5.4,3.1,11.5,11.4,11.5a19.35,19.35,0,0,0,4-.4C415.9,449.2,480,363.1,480,261.7,480,134.9,379.7,32,256,32Z" fill="currentColor"></path>
                    </svg>
                </a>
            </div>

            {/* Mobile Search Bar (Dropdown) */}
            {isHomePage && isMobileSearchOpen && (
                <div className="absolute top-full left-0 right-0 bg-black border-t border-gray-700 p-4 md:hidden">
                    <input
                        type="text"
                        placeholder="Search Memes..."
                        value={searchQuery || ""}
                        onChange={handleSearchChange}
                        className="bg-gray-800 text-white px-4 py-2 rounded-full border border-gray-600 focus:border-blue-400 focus:outline-none text-sm w-full"
                    />
                </div>
            )}
        </nav>
    );
}

export default Navbar;