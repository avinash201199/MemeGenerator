import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaSearch, FaTimes, FaGithub } from "react-icons/fa";
import "../index.css";

const Navbar = ({ setMeme, searchQuery, setSearchQuery, isDark, toggleTheme }) => {
    const searchInputRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const isHomePage = location.pathname === "/";

    useEffect(() => {
        const handleScroll = () => {
            const scrolled = window.scrollY > 20;
            setIsScrolled(scrolled);
        };
        
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMobileSearch = () => {
        setIsMobileSearchOpen(!isMobileSearchOpen);
        if (!isMobileSearchOpen && searchInputRef.current) {
            setTimeout(() => searchInputRef.current.focus(), 100);
        }
    };

    const handleSearchChange = (event) => {
        if (setSearchQuery) {
            setSearchQuery(event.target.value);
        }
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
        setIsMobileSearchOpen(false);
    };

    const handleBackClick = () => {
        setMeme && setMeme(null);
        if(window.history.length > 1){
            navigate(-1);
        } else {
            navigate("/");
        }
    };

    const handleNavigation = (path) => {
        if (path === "/") {
            setMeme && setMeme(null);
        }
        closeMobileMenu();
        window.scrollTo(0, 0);
    };

    return (
        <>
            <nav
                className={`fixed top-1 left-0 right-0 z-40 transition-all duration-300 ${isScrolled
                        ? isDark
                            ? 'bg-gray-900/95 backdrop-blur-lg shadow-2xl border-b border-gray-800'
                            : 'bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-200'
                        : isDark
                            ? 'bg-gray-900/80 backdrop-blur-md border-b border-gray-800/50'
                            : 'bg-white/80 backdrop-blur-md border-b border-gray-200/50'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 md:h-18">
                        {/* Logo */}
                        <Link
                            to="/"
                            onClick={() => handleNavigation("/")}
                            className="group flex items-center space-x-2 transition-transform duration-300 hover:scale-105"
                        >
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg blur-sm opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className={`relative px-4 py-2 rounded-lg ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
                                    <span className="font-extrabold text-xl sm:text-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                                        Meme Generator
                                    </span>
                                </div>
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-1">
                            {[
                                { path: "/", label: "Home" },
                                { path: "/favorites", label: "Favorites" },
                                { path: "/meme-history", label: "My Memes" },
                                { path: "/dynamic", label: "Dynamic" },
                                { path: "/about", label: "About" }
                            ].map(({ path, label }) => (
                                <Link
                                    key={path}
                                    to={path}
                                    onClick={() => handleNavigation(path)}
                                    className={`relative px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${location.pathname === path
                                            ? isDark ? 'text-blue-400' : 'text-blue-600'
                                            : isDark ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'
                                        }`}
                                >
                                    {label}
                                </Link>
                            ))}
                        </div>

                        {/* Right side actions */}
                        <div className="hidden md:flex items-center space-x-4">
                            {isHomePage && (
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search memes..."
                                        value={searchQuery || ''}
                                        onChange={handleSearchChange}
                                        className={`px-4 py-2 pr-10 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 transition-all ${isDark 
                                            ? 'bg-gray-800 text-white placeholder-gray-400 focus:ring-pink-500 border border-gray-700' 
                                            : 'bg-gray-100 text-gray-900 placeholder-gray-500 focus:ring-pink-400 border border-gray-300'}`}
                                    />
                                    {searchQuery ? (
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            <FaTimes />
                                        </button>
                                    ) : (
                                        <FaSearch className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                                    )}
                                </div>
                            )}
                            
                            <a
                                href="https://github.com/avinash201199/MemeGenerator"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`p-2 rounded-full transition-all duration-300 ${
                                    isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'}`}
                            >
                                <FaGithub className="w-6 h-6" />
                            </a>

                            <button
                                onClick={toggleTheme}
                                className={`p-2 rounded-full transition-all duration-300 ${
                                    isDark ? 'text-yellow-400 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                {isDark ? '☀️' : '🌙'}
                            </button>
                            
                            <button
                                onClick={handleBackClick}
                                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium transition-all duration-300"
                            >
                                ← Back
                            </button>
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden flex items-center space-x-3">
                            {isHomePage && (
                                <button 
                                    onClick={toggleMobileSearch}
                                    className={`p-2 rounded-full ${isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'}`}
                                >
                                    {isMobileSearchOpen ? <FaTimes /> : <FaSearch />}
                                </button>
                            )}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className={`p-2 rounded-full ${isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'}`}
                            >
                                {isMobileMenuOpen ? (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                ) : (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                    
                    {/* Mobile Search */}
                    {isMobileSearchOpen && isHomePage && (
                        <div className={`md:hidden px-4 pb-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search memes..."
                                value={searchQuery || ''}
                                onChange={handleSearchChange}
                                className={`w-full px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 ${isDark 
                                    ? 'bg-gray-800 text-white placeholder-gray-400 focus:ring-pink-500' 
                                    : 'bg-gray-100 text-gray-900 placeholder-gray-500 focus:ring-pink-400'}`}
                            />
                        </div>
                    )}
                    
                    {/* Mobile Menu */}
                    {isMobileMenuOpen && (
                        <div className={`md:hidden px-4 pb-4 space-y-2 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                            {[
                                { path: "/", label: "Home" },
                                { path: "/favorites", label: "Favorites" },
                                { path: "/meme-history", label: "My Memes" },
                                { path: "/dynamic", label: "Dynamic" },
                                { path: "/about", label: "About" }
                            ].map(({ path, label }) => (
                                <Link
                                    key={path}
                                    to={path}
                                    onClick={() => handleNavigation(path)}
                                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                                        location.pathname === path
                                            ? isDark ? "bg-gray-800 text-blue-400" : "bg-blue-100 text-blue-600"
                                            : isDark ? "text-gray-300 hover:bg-gray-800" : "text-gray-700 hover:bg-gray-100"
                                    }`}
                                >
                                    {label}
                                </Link>
                            ))}
                            
                            <div className="flex justify-between items-center pt-3 border-t border-gray-300">
                                <button
                                    onClick={toggleTheme}
                                    className={`p-2 rounded-full ${isDark ? "text-yellow-400 hover:bg-gray-800" : "text-gray-700 hover:bg-gray-100"}`}
                                >
                                    {isDark ? "☀️" : "🌙"}
                                </button>
                                <button
                                    onClick={handleBackClick}
                                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full text-sm"
                                >
                                    ← Back
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </nav>
        </>
    );
};

export default Navbar;