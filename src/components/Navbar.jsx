import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../ThemeContext";
import { FaSearch, FaTimes, FaGithub } from "react-icons/fa";
import "../index.css";

const Navbar = ({ setMeme, searchQuery, setSearchQuery }) => {
    const searchInputRef = useRef(null);
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const isHomePage = location.pathname === "/";
    const { isDarkTheme, toggleTheme } = useTheme();

    // Handle scroll effect for navbar and scroll-to-top button
    useEffect(() => {
        const handleScroll = () => {
            const scrolled = window.scrollY > 20;
            setIsScrolled(scrolled);
        };
        
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // no-op

    // Toggle mobile search
    const toggleMobileSearch = () => {
        setIsMobileSearchOpen(!isMobileSearchOpen);
        if (!isMobileSearchOpen && searchInputRef.current) {
            // Focus search input when opening
            setTimeout(() => searchInputRef.current.focus(), 100);
        }
    };

    const handleSearchChange = (event) => {
        if (setSearchQuery) {
            setSearchQuery(event.target.value);
        }
    };

    // Close mobile menu and reset search
    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
        setIsMobileSearchOpen(false);
    };

    // Handle navigation and close mobile menu
    const handleNavigation = (path) => {
        if (path === "/") {
            setMeme && setMeme(null);
        }
        closeMobileMenu();
        window.scrollTo(0, 0);
    };

    return (
        <>
            {/* Skip to content for accessibility */}
            <a
                href="#main"
                className="sr-only focus:not-sr-only fixed top-2 left-2 z-[60] px-3 py-2 rounded-md bg-blue-600 text-white shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
                Skip to content
            </a>
            <nav
                className={`fixed top-1 left-0 right-0 z-40 transition-all duration-300 ${isScrolled
                        ? isDarkTheme
                            ? 'bg-gray-900/95 backdrop-blur-lg shadow-2xl border-b border-gray-800'
                            : 'bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-200'
                        : isDarkTheme
                            ? 'bg-gray-900/80 backdrop-blur-md border-b border-gray-800/50'
                            : 'bg-white/80 backdrop-blur-md border-b border-gray-200/50'
                    }`}
                aria-label="Main navigation"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 md:h-20">
                        {/* Logo with animated gradient */}
                        <Link
                            to="/"
                            onClick={() => handleNavigation("/")}
                            className="group flex items-center space-x-2 transition-transform duration-300 hover:scale-105"
                            aria-label="Home"
                        >
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg blur-sm opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className={`relative px-4 py-2 rounded-lg ${isDarkTheme ? 'bg-gray-900' : 'bg-white'}`}>
                                    <span className="font-extrabold text-xl sm:text-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                                        Meme Generator
                                    </span>
                                    <img
                                        src="./favicon/icons8-doge-16.png"
                                        alt="Logo Icon"
                                        className="inline-block w-6 h-6 ml-2 relative top-[-5px]"
                                    />
                                </div>
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-1">
                            {[
                                { path: "/", label: "Home" },
                                { path: "/dynamic", label: "Dynamic" },
                                { path: "/about", label: "About" },
                                { path: "/history", label: "History" }
                            ].map(({ path, label }) => (
                                <Link
                                    key={path}
                                    to={path}
                                    onClick={() => handleNavigation(path)}
                                    className={`relative px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 group focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${isDarkTheme ? 'focus-visible:ring-blue-400 focus-visible:ring-offset-gray-900' : 'focus-visible:ring-blue-500 focus-visible:ring-offset-white'} ${location.pathname === path
                                            ? isDarkTheme
                                                ? 'text-blue-400'
                                                : 'text-blue-600'
                                            : isDarkTheme
                                                ? 'text-gray-300 hover:text-white'
                                                : 'text-gray-700 hover:text-gray-900'
                                        }`}
                                    aria-current={location.pathname === path ? 'page' : undefined}
                                >
                                    <span className="relative z-10">{label}</span>
                                    <span className={`absolute inset-0 rounded-lg transition-all duration-300 ${location.pathname === path
                                            ? isDarkTheme
                                                ? 'bg-blue-500/20'
                                                : 'bg-blue-100'
                                            : isDarkTheme
                                                ? 'bg-transparent group-hover:bg-gray-800/50'
                                                : 'bg-transparent group-hover:bg-gray-100/50'
                                        }`}></span>
                                    {location.pathname === path && (
                                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></span>
                                    )}
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
                                        className={`px-4 py-2 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 ${isDarkTheme 
                                            ? 'bg-gray-800 text-white placeholder-gray-400 focus:ring-blue-500' 
                                            : 'bg-gray-100 text-gray-900 placeholder-gray-500 focus:ring-blue-400'}`}
                                        name="meme-search"
                                        autoComplete="off"
                                        enterKeyHint="search"
                                        aria-label="Search memes"
                                    />
                                    <FaSearch className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`} />
                                </div>
                            )}
                            <a
                                href="https://github.com/avinash201199/MemeGenerator"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`p-2 rounded-full transition-all duration-300 ${isDarkTheme 
                                    ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
                                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'}`}
                                aria-label="View source on GitHub"
                            >
                                <FaGithub className="w-6 h-6" />
                            </a>

                            <button
                                onClick={toggleTheme}
                                className={`p-2 rounded-full ${isDarkTheme ? 'text-yellow-400 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'}`}
                                aria-label={`Switch to ${isDarkTheme ? 'light' : 'dark'} mode`}
                            >
                                {isDarkTheme ? '☀️' : '🌙'}
                            </button>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleNavigation("/");
                                }}
                                className={`group relative overflow-hidden px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-300 hover:scale-105 ${
                                    isDarkTheme
                                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/30'
                                        : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-blue-500/30'
                                }`}
                                aria-label="Back to Home"
                            >
                                <span className="relative z-10 flex items-center space-x-2">
                                    <span>←</span>
                                    <span>Back</span>
                                </span>
                                <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                            </button>
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden flex items-center space-x-3">
                        <a
                            href="https://github.com/avinash201199/MemeGenerator"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`p-2 rounded-full ${isDarkTheme 
                                ? 'text-gray-300 hover:bg-gray-800' 
                                : 'text-gray-700 hover:bg-gray-100'}`}
                            aria-label="View source on GitHub"
                        >
                            <FaGithub className="w-5 h-5" />
                        </a>
                            {isHomePage && (
                                <button 
                                    onClick={toggleMobileSearch}
                                    className={`p-2 rounded-full ${isMobileSearchOpen 
                                        ? (isDarkTheme ? 'bg-gray-800 text-blue-400' : 'bg-gray-100 text-blue-600')
                                        : (isDarkTheme ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100')}`}
                                    aria-label={isMobileSearchOpen ? 'Close search' : 'Open search'}
                                >
                                    {isMobileSearchOpen ? <FaTimes /> : <FaSearch />}
                                </button>
                            )}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className={`p-2 rounded-full ${isDarkTheme ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'}`}
                                aria-expanded={isMobileMenuOpen}
                                aria-label="Toggle menu"
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
                </div>
            </nav>
        </>
    );
};

export default Navbar;