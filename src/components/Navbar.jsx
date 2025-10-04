// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const Navbar = ({setMeme, searchQuery, setSearchQuery}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const isHomePage = location.pathname === "/";

    const handleSearchChange = (event) => {
        if (setSearchQuery) {
            setSearchQuery(event.target.value);
        }
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    const handleNavigation = (path) => {
        setMeme && setMeme(null);
        navigate(path);
        closeMobileMenu();
    };

    return (
        <>
            <style>{`
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes slideUp {
                    from {
                        opacity: 1;
                        transform: translateY(0);
                    }
                    to {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                }
                
                .animate-slideDown {
                    animation: slideDown 0.3s ease-out forwards;
                }
                
                .animate-slideUp {
                    animation: slideUp 0.3s ease-out forwards;
                }
            `}</style>
            
            <nav className="navbar bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white px-4 sm:px-6 lg:px-8 py-3 shadow-lg sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                            {/* Hamburger Menu Button - Left side */}
                            <button
                                className="lg:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                aria-label="Toggle menu"
                            >
                                <div className="w-6 h-5 flex flex-col justify-between">
                                    <span className={`w-full h-0.5 bg-white rounded-full transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                                    <span className={`w-full h-0.5 bg-white rounded-full transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
                                    <span className={`w-full h-0.5 bg-white rounded-full transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
                                </div>
                            </button>
                            
                            {/* Logo */}
                            <Link to="/" onClick={() => setMeme && setMeme(null)} className="logo font-bold text-lg sm:text-xl bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent hover:from-purple-300 hover:to-[#A08FFB] transition-all duration-300">
                                🎭 Meme Generator
                            </Link>
                        </div>

                        {/* Desktop Navigation Links */}
                        <ul className="hidden lg:flex items-center space-x-1">
                            <li>
                                <Link 
                                    to="/" 
                                    onClick={() => setMeme && setMeme(null)} 
                                    className={`px-4 py-2.5 rounded-lg transition-all duration-200 ${
                                        location.pathname === "/" 
                                        ? "bg-[#A08FFB] text-black" 
                                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                                    }`}
                                >
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    to="/" 
                                    onClick={() => setMeme && setMeme(null)} 
                                    className={`px-4 py-2.5 rounded-lg transition-all duration-200 ${
                                        location.pathname === "/" 
                                        ? "bg-[#A08FFB] text-black" 
                                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                                    }`}
                                >
                                    Memes
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/about"
                                    className={`px-4 py-2.5 rounded-lg transition-all duration-200 ${
                                        location.pathname === "/about" 
                                        ? "bg-[#A08FFB] text-black" 
                                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                                    }`}
                                >
                                    About
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/history"
                                    className={`px-4 py-2.5 rounded-lg transition-all duration-200 ${
                                        location.pathname === "/history" 
                                        ? "bg-[#A08FFB] text-black" 
                                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                                    }`}
                                >
                                    History
                                </Link>
                            </li>
                        </ul>

                        {/* Right side: Search and GitHub */}
                        <div className="flex items-center space-x-2 sm:space-x-4">
                            {/* Desktop Search - Only show on home page */}
                            {isHomePage && (
                                <div className="hidden md:block relative">
                                    <input
                                        type="text"
                                        placeholder="Search memes..."
                                        value={searchQuery || ""}
                                        onChange={handleSearchChange}
                                        className="bg-gray-800 text-white pl-10 pr-4 py-2 rounded-full border border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 focus:outline-none text-sm w-48 lg:w-64 transition-all duration-200"
                                    />
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                        <circle cx="11" cy="11" r="8"></circle>
                                        <path d="m21 21-4.35-4.35"></path>
                                    </svg>
                                </div>
                            )}

                            {/* Mobile Search Toggle - Only show on home page */}
                            {isHomePage && (
                                <button
                                    className={`md:hidden p-2 rounded-lg transition-all duration-200 ${
                                        isMobileSearchOpen 
                                        ? 'bg-purple-600 text-white' 
                                        : 'hover:bg-gray-800'
                                    }`}
                                    onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                                    aria-label="Toggle search"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="11" cy="11" r="8"></circle>
                                        <path d="m21 21-4.35-4.35"></path>
                                    </svg>
                                </button>
                            )}

                            {/* GitHub Link */}
                            <a 
                                href="https://github.com/avinash201199/MemeGenerator" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="hidden sm:flex p-2 rounded-lg hover:bg-gray-800 transition-all duration-200 hover:scale-110"
                                aria-label="GitHub Repository"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512">
                                    <path d="M256,32C132.3,32,32,134.9,32,261.7c0,101.5,64.2,187.5,153.2,217.9a17.56,17.56,0,0,0,3.8.4c8.3,0,11.5-6.1,11.5-11.4,0-5.5-.2-19.9-.3-39.1a102.4,102.4,0,0,1-22.6,2.7c-43.1,0-52.9-33.5-52.9-33.5-10.2-26.5-24.9-33.6-24.9-33.6-19.5-13.7-.1-14.1,1.4-14.1h.1c22.5,2,34.3,23.8,34.3,23.8,11.2,19.6,26.2,25.1,39.6,25.1a63,63,0,0,0,25.6-6c2-14.8,7.8-24.9,14.2-30.7-49.7-5.8-102-25.5-102-113.5,0-25.1,8.7-45.6,23-61.6-2.3-5.8-10-29.2,2.2-60.8a18.64,18.64,0,0,1,5-.5c8.1,0,26.4,3.1,56.6,24.1a208.21,208.21,0,0,1,112.2,0c30.2-21,48.5-24.1,56.6-24.1a18.64,18.64,0,0,1,5,.5c12.2,31.6,4.5,55,2.2,60.8,14.3,16.1,23,36.6,23,61.6,0,88.2-52.4,107.6-102.3,113.3,8,7.1,15.2,21.1,15.2,42.5,0,30.7-.3,55.5-.3,63,0,5.4,3.1,11.5,11.4,11.5a19.35,19.35,0,0,0,4-.4C415.9,449.2,480,363.1,480,261.7,480,134.9,379.7,32,256,32Z" fill="currentColor"></path>
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Mobile Search Bar (Dropdown with Animation) */}
                    {isHomePage && isMobileSearchOpen && (
                        <div className="md:hidden mt-3 animate-slideDown">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search memes..."
                                    value={searchQuery || ""}
                                    onChange={handleSearchChange}
                                    className="bg-gray-800 text-white pl-10 pr-4 py-2.5 rounded-full border border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 focus:outline-none text-sm w-full shadow-lg"
                                    autoFocus
                                />
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <path d="m21 21-4.35-4.35"></path>
                                </svg>
                                <button
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                    onClick={() => setIsMobileSearchOpen(false)}
                                    aria-label="Close search"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Mobile Menu (Hamburger Dropdown) */}
                    <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <ul className="py-4 space-y-2">
                            <li>
                                <Link 
                                    to="/" 
                                    onClick={() => handleNavigation("/")}
                                    className={`block px-4 py-3 rounded-lg transition-all duration-200 ${
                                        location.pathname === "/" 
                                        ? "bg-[#A08FFB] text-black font-medium" 
                                        : "text-gray-300 hover:bg-[#A08FFB] hover:text-black"
                                    }`}
                                >
                                    🏠 Home
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    to="/" 
                                    onClick={() => handleNavigation("/")}
                                    className={`block px-4 py-3 rounded-lg transition-all duration-200 ${
                                        location.pathname === "/" 
                                        ? "bg-[#A08FFB] text-black font-medium" 
                                        : "text-gray-300 hover:bg-[#A08FFB] hover:text-black"
                                    }`}
                                >
                                    😂 Memes
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/about"
                                    onClick={() => handleNavigation("/about")}
                                    className={`block px-4 py-3 rounded-lg transition-all duration-200 ${
                                        location.pathname === "/about" 
                                        ? "bg-[#A08FFB] text-black font-medium" 
                                        : "text-gray-300 hover:bg-[#A08FFB] hover:text-black"
                                    }`}
                                >
                                    ℹ️ About
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/history"
                                    onClick={() => handleNavigation("/history")}
                                    className={`block px-4 py-3 rounded-lg transition-all duration-200 ${
                                        location.pathname === "/history" 
                                        ? "bg-[#A08FFB] text-black font-medium" 
                                        : "text-gray-300 hover:bg-[#A08FFB] hover:text-black"
                                    }`}
                                >
                                    📜 History
                                </Link>
                            </li>
                            <li>
                                <button
                                    className="w-full text-left px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white transition-all duration-200 shadow-md font-medium"
                                    onClick={() => {
                                        setMeme && setMeme(null);
                                        navigate("/");
                                        closeMobileMenu();
                                    }}
                                >
                                    ← Go Back
                                </button>
                            </li>
                            <li className="sm:hidden pt-2">
                                <a 
                                    href="https://github.com/avinash201199/MemeGenerator" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="flex items-center space-x-2 px-4 py-3 rounded-lg text-gray-300 hover:bg-[#A08FFB] hover:text-black transition-all duration-200"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 512 512">
                                        <path d="M256,32C132.3,32,32,134.9,32,261.7c0,101.5,64.2,187.5,153.2,217.9a17.56,17.56,0,0,0,3.8.4c8.3,0,11.5-6.1,11.5-11.4,0-5.5-.2-19.9-.3-39.1a102.4,102.4,0,0,1-22.6,2.7c-43.1,0-52.9-33.5-52.9-33.5-10.2-26.5-24.9-33.6-24.9-33.6-19.5-13.7-.1-14.1,1.4-14.1h.1c22.5,2,34.3,23.8,34.3,23.8,11.2,19.6,26.2,25.1,39.6,25.1a63,63,0,0,0,25.6-6c2-14.8,7.8-24.9,14.2-30.7-49.7-5.8-102-25.5-102-113.5,0-25.1,8.7-45.6,23-61.6-2.3-5.8-10-29.2,2.2-60.8a18.64,18.64,0,0,1,5-.5c8.1,0,26.4,3.1,56.6,24.1a208.21,208.21,0,0,1,112.2,0c30.2-21,48.5-24.1,56.6-24.1a18.64,18.64,0,0,1,5,.5c12.2,31.6,4.5,55,2.2,60.8,14.3,16.1,23,36.6,23,61.6,0,88.2-52.4,107.6-102.3,113.3,8,7.1,15.2,21.1,15.2,42.5,0,30.7-.3,55.5-.3,63,0,5.4,3.1,11.5,11.4,11.5a19.35,19.35,0,0,0,4-.4C415.9,449.2,480,363.1,480,261.7,480,134.9,379.7,32,256,32Z" fill="currentColor"></path>
                                    </svg>
                                    <span>View on GitHub</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </>
    );
}

export default Navbar;