import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../ThemeContext";
import "../index.css";

const Navbar = ({ setMeme, searchQuery, setSearchQuery }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const isHomePage = location.pathname === "/";
    const { isDarkTheme, toggleTheme } = useTheme();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSearchChange = (event) => {
        if (setSearchQuery) {
            setSearchQuery(event.target.value);
        }
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <>
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                        ? isDarkTheme
                            ? 'bg-gray-900/95 backdrop-blur-lg shadow-2xl border-b border-gray-800'
                            : 'bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-200'
                        : isDarkTheme
                            ? 'bg-gray-900/80 backdrop-blur-md border-b border-gray-800/50'
                            : 'bg-white/80 backdrop-blur-md border-b border-gray-200/50'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 md:h-20">
                        {/* Logo with animated gradient */}
                        <Link
                            to="/"
                            onClick={() => setMeme && setMeme(null)}
                            className="group flex items-center space-x-2 transition-transform duration-300 hover:scale-105"
                        >
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg blur-sm opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className={`relative px-4 py-2 rounded-lg ${isDarkTheme ? 'bg-gray-900' : 'bg-white'}`}>
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
                                { path: "/dynamic", label: "Dynamic" },
                                { path: "/about", label: "About" },
                                { path: "/history", label: "History" }
                            ].map(({ path, label }) => (
                                <Link
                                    key={path}
                                    to={path}
                                    onClick={() => path === "/" && setMeme && setMeme(null)}
                                    className={`relative px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 group ${location.pathname === path
                                            ? isDarkTheme
                                                ? 'text-blue-400'
                                                : 'text-blue-600'
                                            : isDarkTheme
                                                ? 'text-gray-300 hover:text-white'
                                                : 'text-gray-700 hover:text-gray-900'
                                        }`}
                                >
                                    <span className="relative z-10">{label}</span>
                                    <span className={`absolute inset-0 rounded-lg transition-all duration-300 ${location.pathname === path
                                            ? isDarkTheme
                                                ? 'bg-blue-500/20'
                                                : 'bg-blue-100'
                                            : isDarkTheme
                                                ? 'bg-transparent group-hover:bg-gray-800'
                                                : 'bg-transparent group-hover:bg-gray-100'
                                        }`}></span>
                                    {location.pathname === path && (
                                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></span>
                                    )}
                                </Link>
                            ))}
                        </div>

                        {/* Right side actions */}
                        <div className="hidden md:flex items-center space-x-3">
                            {/* Search Bar - Hidden below 980px */}
                            {isHomePage && (
                                <div className="relative group hidden lg:block">
                                    <input
                                        type="text"
                                        placeholder="Search memes..."
                                        value={searchQuery || ""}
                                        onChange={handleSearchChange}
                                        className={`pl-10 pr-4 py-2.5 rounded-full text-sm w-48 xl:w-64 transition-all duration-300 focus:w-72 border-2 ${isDarkTheme
                                                ? 'bg-gray-800/50 text-white border-gray-700 focus:border-blue-500 focus:bg-gray-800'
                                                : 'bg-gray-100/50 text-gray-900 border-gray-200 focus:border-blue-500 focus:bg-white'
                                            } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                                    />
                                    <svg
                                        className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'
                                            }`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            )}

                            {/* Theme Toggle */}
                            <button
                                onClick={toggleTheme}
                                className={`relative overflow-hidden rounded-full p-2.5 transition-all duration-300 hover:scale-110 ${isDarkTheme
                                        ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg shadow-yellow-500/50'
                                        : 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-purple-500/50'
                                    }`}
                                aria-label="Toggle theme"
                            >
                                <span className="relative z-10 text-lg">
                                    {isDarkTheme ? '☀️' : '🌙'}
                                </span>
                            </button>

                            {/* Go Back Button */}
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    setMeme && setMeme(null);
                                    navigate("/");
                                }}
                                className={`group relative overflow-hidden px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-300 hover:scale-105 ${isDarkTheme
                                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/30'
                                        : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-blue-500/30'
                                    }`}
                            >
                                <span className="relative z-10 flex items-center space-x-2">
                                    <span>←</span>
                                    <span>Back</span>
                                </span>
                                <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                            </button>
                        </div>

                        {/* Mobile Controls */}
                        <div className="md:hidden flex items-center space-x-2">
                            {isHomePage && (
                                <button
                                    onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                                    className={`p-2 rounded-lg transition-all duration-300 ${isMobileSearchOpen
                                            ? isDarkTheme
                                                ? 'bg-blue-500/20 text-blue-400'
                                                : 'bg-blue-100 text-blue-600'
                                            : isDarkTheme
                                                ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                        }`}
                                    aria-label="Toggle search"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="11" cy="11" r="8"></circle>
                                        <path d="m21 21-4.35-4.35"></path>
                                    </svg>
                                </button>
                            )}

                            {/* Show search toggle for tablets (768px-1024px) */}
                            {isHomePage && (
                                <button
                                    onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                                    className={`hidden md:block lg:hidden p-2 rounded-lg transition-all duration-300 ${isMobileSearchOpen
                                            ? isDarkTheme
                                                ? 'bg-blue-500/20 text-blue-400'
                                                : 'bg-blue-100 text-blue-600'
                                            : isDarkTheme
                                                ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                        }`}
                                    aria-label="Toggle search"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="11" cy="11" r="8"></circle>
                                        <path d="m21 21-4.35-4.35"></path>
                                    </svg>
                                </button>
                            )}

                            <button
                                onClick={toggleTheme}
                                className={`p-2 rounded-lg transition-all duration-300 ${isDarkTheme
                                        ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                                        : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                                    }`}
                            >
                                {isDarkTheme ? '☀️' : '🌙'}
                            </button>

                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className={`p-2 rounded-lg transition-all duration-300 ${isMobileMenuOpen
                                        ? isDarkTheme
                                            ? 'bg-blue-500/20 text-blue-400'
                                            : 'bg-blue-100 text-blue-600'
                                        : isDarkTheme
                                            ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                    }`}
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    {isMobileMenuOpen ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Search - Now works for both mobile and tablet */}
                {isHomePage && isMobileSearchOpen && (
                    <div className={`lg:hidden px-4 py-3 border-t transition-all duration-300 ease-in-out ${isDarkTheme ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50/50 border-gray-200'
                        }`}
                        style={{
                            animation: 'slideDown 0.3s ease-out',
                            transformOrigin: 'top'
                        }}>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search memes..."
                                value={searchQuery || ""}
                                onChange={handleSearchChange}
                                autoFocus
                                className={`w-full pl-10 pr-4 py-2.5 rounded-full text-sm border-2 transition-all duration-300 ${isDarkTheme
                                        ? 'bg-gray-800 text-white border-gray-700 focus:border-blue-500'
                                        : 'bg-white text-gray-900 border-gray-200 focus:border-blue-500'
                                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                            />
                            <svg className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'
                                }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                )}

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className={`md:hidden border-t transition-all duration-300 ease-in-out ${isDarkTheme ? 'bg-gray-900/95 border-gray-800 backdrop-blur-lg' : 'bg-white/95 border-gray-200 backdrop-blur-lg'
                        }`}
                        style={{
                            animation: 'slideDown 0.3s ease-out',
                            transformOrigin: 'top'
                        }}>
                        <div className="px-4 py-3 space-y-2">
                            {[
                                { path: "/", label: "Home", icon: "🏠" },
                                { path: "/dynamic", label: "Dynamic", icon: "⚡" },
                                { path: "/about", label: "About", icon: "ℹ️" },
                                { path: "/history", label: "History", icon: "📜" }
                            ].map(({ path, label, icon }) => (
                                <Link
                                    key={path}
                                    to={path}
                                    onClick={() => {
                                        path === "/" && setMeme && setMeme(null);
                                        closeMobileMenu();
                                    }}
                                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${location.pathname === path
                                            ? isDarkTheme
                                                ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 border border-blue-500/30'
                                                : 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-600 border border-blue-200'
                                            : isDarkTheme
                                                ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                        }`}
                                >
                                    <span className="text-xl">{icon}</span>
                                    <span>{label}</span>
                                    {location.pathname === path && (
                                        <span className="ml-auto w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></span>
                                    )}
                                </Link>
                            ))}
                        </div>

                        <div className={`px-4 py-3 border-t ${isDarkTheme ? 'border-gray-800' : 'border-gray-200'}`}>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    setMeme && setMeme(null);
                                    navigate("/");
                                    closeMobileMenu();
                                }}
                                className="w-full px-5 py-3 rounded-xl font-medium text-sm bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg transition-all duration-300 hover:scale-105"
                            >
                                ← Go Back to Home
                            </button>
                        </div>
                    </div>
                )}
            </nav>

            {/* Add custom animation styles */}
            <style>{`
                @keyframes slideDown {
                    0% {
                        opacity: 0;
                        transform: translateY(-10px) scaleY(0.95);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0) scaleY(1);
                    }
                }
                
                /* Smooth max-height transition for collapsible elements */
                .lg\\:hidden {
                    transition: max-height 0.3s ease-in-out, opacity 0.3s ease-in-out;
                }
            `}</style>
        </>
    );
};

export default Navbar