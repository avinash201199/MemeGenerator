import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../ThemeContext";
// eslint-disable-next-line no-unused-vars
import "../index.css"

const Navbar = ({setMeme, searchQuery, setSearchQuery}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const isHomePage = location.pathname === "/";
    const { isDarkTheme, toggleTheme } = useTheme();

    const handleSearchChange = (event) => {
        if (setSearchQuery) {
            setSearchQuery(event.target.value);
        }
    };

    const getActiveLinkStyle = (path) => (
        location.pathname === path
            ? {
                color: '#1E90FF',
                textDecoration: 'underline',
                textDecorationColor: '#1E90FF',
                textUnderlineOffset: '4px',
                fontWeight: 'bold'
            }
            : {}
    );

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
                <nav className={`navbar shadow-lg sticky top-0 z-50 border-b transition-colors duration-300 ${isDarkTheme ? 'bg-black text-white border-gray-800' : 'bg-white text-black border-gray-200'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Left side: Logo */}
                    <div className="flex items-center">
                        <Link 
                            to="/" 
                            onClick={() => setMeme && setMeme(null)}
                            className={`logo font-bold text-xl sm:text-2xl bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent hover:from-blue-300 hover:to-purple-400 transition-all duration-300`}
                        >
                            Meme Generator
                        </Link>
                    </div>

                    {/* Center: Desktop Navigation Links */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-8">
                            <Link 
                                to="/" 
                                onClick={() => setMeme && setMeme(null)} 
                                style={getActiveLinkStyle("/")}
                                className={`${isDarkTheme ? 'text-white hover:text-blue-400' : 'text-gray-900 hover:text-blue-600'} transition-colors duration-200 px-3 py-2 rounded-md text-sm font-medium`}
                            >
                                Home
                            </Link>
                            
                            <Link
                                to="/dynamic"
                                style={getActiveLinkStyle("/dynamic")}
                                className={`${isDarkTheme ? 'text-white hover:text-blue-400' : 'text-gray-900 hover:text-blue-600'} transition-colors duration-200 px-3 py-2 rounded-md text-sm font-medium`}
                            >
                                Dynamic Meme
                            </Link>
                            
                            <Link
                                to="/about"
                                style={getActiveLinkStyle("/about")}
                                className={`${isDarkTheme ? 'text-white hover:text-blue-400' : 'text-gray-900 hover:text-blue-600'} transition-colors duration-200 px-3 py-2 rounded-md text-sm font-medium`}
                            >
                                About
                            </Link>
                            
                            <Link
                                to="/history"
                                style={getActiveLinkStyle("/history")}
                                className={`${isDarkTheme ? 'text-white hover:text-blue-400' : 'text-gray-900 hover:text-blue-600'} transition-colors duration-200 px-3 py-2 rounded-md text-sm font-medium`}
                            >
                                History
                            </Link>
                        </div>
                    </div>

                    {/* Right side: Search, Theme Toggle, Go Back Button */}
                    <div className="hidden md:flex items-center space-x-4">
                        {/* Search Bar - Only show on home page */}
                        {isHomePage && (
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search Memes..."
                                    value={searchQuery || ""}
                                    onChange={handleSearchChange}
                                    className={`px-4 py-2 pl-10 rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 text-sm w-48 lg:w-64 transition-all duration-200 ${
                                        isDarkTheme 
                                            ? 'bg-gray-800 text-white border-gray-600 focus:border-blue-400' 
                                            : 'bg-gray-100 text-gray-900 border-gray-300 focus:border-blue-500'
                                    }`}
                                />
                                <svg className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        )}

                        {/* Theme Toggle Button */}
                        <button 
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-none rounded-full px-4 py-2 text-sm cursor-pointer transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                            onClick={toggleTheme}
                        >
                            {isDarkTheme ? '☀️' : '🌙'}
                        </button>
                        
                        <button
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-none rounded-full px-4 py-2 text-sm cursor-pointer transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setMeme && setMeme(null);
                                navigate("/");
                            }}
                        >
                            ← Go Back
                        </button>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center space-x-2">
                        {/* Mobile Search Toggle */}
                        {isHomePage && (
                            <button
                                className={`${isDarkTheme ? 'text-white hover:text-blue-400' : 'text-gray-900 hover:text-blue-600'} transition-colors duration-200 p-2`}
                                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <path d="m21 21-4.35-4.35"></path>
                                </svg>
                            </button>
                        )}
                        
                        {/* Hamburger Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className={`inline-flex items-center justify-center p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset transition-all duration-200 ${
                                isDarkTheme 
                                    ? 'text-gray-300 hover:text-white hover:bg-gray-700 focus:ring-white' 
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-500'
                            }`}
                        >
                            <span className="sr-only">Open main menu</span>
                            {!isMobileMenuOpen ? (
                                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            ) : (
                                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Search Bar (Dropdown) */}
            {isHomePage && isMobileSearchOpen && (
                <div className={`md:hidden border-t px-4 py-3 ${isDarkTheme ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-300'}`}>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search Memes..."
                            value={searchQuery || ""}
                            onChange={handleSearchChange}
                            className={`px-4 py-2 pl-10 rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 text-sm w-full transition-all duration-200 ${
                                isDarkTheme 
                                    ? 'bg-gray-800 text-white border-gray-600 focus:border-blue-400' 
                                    : 'bg-white text-gray-900 border-gray-300 focus:border-blue-500'
                            }`}
                        />
                        <svg className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
            )}

            {/* Mobile Navigation Menu */}
            {isMobileMenuOpen && (
                <div className={`md:hidden border-t ${isDarkTheme ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'}`}>
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <Link
                            to="/"
                            onClick={() => {
                                setMeme && setMeme(null);
                                closeMobileMenu();
                            }}
                            style={getActiveLinkStyle("/")}
                            className={`${isDarkTheme ? 'text-white hover:text-blue-400 hover:bg-gray-700' : 'text-gray-900 hover:text-blue-600 hover:bg-gray-100'} block px-3 py-2 rounded-md text-base font-medium transition-all duration-200`}
                        >
                            Home
                        </Link>
                        
                        <Link
                            to="/dynamic"
                            onClick={closeMobileMenu}
                            style={getActiveLinkStyle("/dynamic")}
                            className={`${isDarkTheme ? 'text-white hover:text-blue-400 hover:bg-gray-700' : 'text-gray-900 hover:text-blue-600 hover:bg-gray-100'} block px-3 py-2 rounded-md text-base font-medium transition-all duration-200`}
                        >
                            Dynamic Meme
                        </Link>
                        
                        <Link
                            to="/about"
                            onClick={closeMobileMenu}
                            style={getActiveLinkStyle("/about")}
                            className={`${isDarkTheme ? 'text-white hover:text-blue-400 hover:bg-gray-700' : 'text-gray-900 hover:text-blue-600 hover:bg-gray-100'} block px-3 py-2 rounded-md text-base font-medium transition-all duration-200`}
                        >
                            About
                        </Link>
                        
                        <Link
                            to="/history"
                            onClick={closeMobileMenu}
                            style={getActiveLinkStyle("/history")}
                            className={`${isDarkTheme ? 'text-white hover:text-blue-400 hover:bg-gray-700' : 'text-gray-900 hover:text-blue-600 hover:bg-gray-100'} block px-3 py-2 rounded-md text-base font-medium transition-all duration-200`}
                        >
                            History
                        </Link>
                    </div>
                    
                    {/* Mobile Action Buttons */}
                    <div className={`px-4 py-3 border-t space-y-3 ${isDarkTheme ? 'border-gray-700' : 'border-gray-300'}`}>
                        <button 
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-none rounded-full px-4 py-2 text-sm cursor-pointer transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                            onClick={() => {
                                toggleTheme();
                                closeMobileMenu();
                            }}
                        >
                            {isDarkTheme ? '☀️ Light Mode' : '🌙 Dark Mode'}
                        </button>
                        
                        <button
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-none rounded-full px-4 py-2 text-sm cursor-pointer transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setMeme && setMeme(null);
                                navigate("/");
                                closeMobileMenu();
                            }}
                        >
                            ← Go Back
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
}

export default Navbar;