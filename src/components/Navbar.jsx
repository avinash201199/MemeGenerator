// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../index.css"

const Navbar = ({setMeme, searchQuery, setSearchQuery}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const isHomePage = location.pathname === "/";

    const handleSearchChange = (event) => {
        if (setSearchQuery) {
            setSearchQuery(event.target.value);
        }
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <nav className="bg-black text-white shadow-md sticky top-0 z-50 w-full" style={{
            borderRadius: '25px',
            margin: '10px',
            width: 'calc(100% - 20px)',
            boxShadow: 'inset rgba(63, 64, 65, 0.363) -10px -14px 16px, rgba(124, 215, 221, 0.22) 1px -2px 20px 20px'
        }}>
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                {/* Main navbar content */}
                <div className="flex justify-between items-center h-14 sm:h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <h1 className="font-bold text-base sm:text-lg lg:text-xl xl:text-2xl text-white">
                            Meme Generator
                        </h1>
                    </div>
                    
                    {/* Desktop Navigation Links - Hidden on mobile */}
                    <div className="hidden lg:flex lg:items-center lg:space-x-4 xl:space-x-6">
                        <Link 
                            to="/" 
                            onClick={() => setMeme && setMeme(null)} 
                            className="text-white hover:text-blue-400 transition-colors duration-200 text-sm xl:text-base px-2 py-1"
                        >
                            Home
                        </Link>
                        <Link 
                            to="/" 
                            onClick={() => setMeme && setMeme(null)} 
                            className="text-white hover:text-blue-400 transition-colors duration-200 text-sm xl:text-base px-2 py-1"
                        >
                            Memes
                        </Link>
                        <Link
                            to="/about"
                            className="text-white hover:text-blue-400 transition-colors duration-200 text-sm xl:text-base px-2 py-1"
                        >
                            About
                        </Link>
                        <Link
                            to="/history"
                            className="text-white hover:text-blue-400 transition-colors duration-200 text-sm xl:text-base px-2 py-1"
                        >
                            History
                        </Link>
                        <button
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-none rounded-full px-3 py-1.5 xl:px-4 xl:py-2 text-xs xl:text-sm cursor-pointer transition-all duration-200 shadow-md hover:shadow-lg font-medium"
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

                    {/* Right side: Search Bar, GitHub Link, and Mobile Menu Toggle */}
                    <div className="flex items-center space-x-2 sm:space-x-3">
                        {/* Desktop Search Bar - Only show on home page */}
                        {isHomePage && (
                            <div className="hidden lg:block">
                                <input
                                    type="text"
                                    placeholder="Search Memes..."
                                    value={searchQuery || ""}
                                    onChange={handleSearchChange}
                                    className="bg-gray-800 text-white px-3 py-1.5 xl:px-4 xl:py-2 rounded-full border border-gray-600 focus:border-blue-400 focus:outline-none text-sm w-32 xl:w-48"
                                />
                            </div>
                        )}

                        {/* Mobile Search Toggle - Only show on home page */}
                        {isHomePage && (
                            <button
                                className="lg:hidden text-white hover:text-blue-400 transition-colors duration-200 p-2"
                                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                                aria-label="Toggle search"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                            className="text-white hover:text-blue-400 transition-colors duration-200 p-2"
                            aria-label="GitHub Repository"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 512 512">
                                <path d="M256,32C132.3,32,32,134.9,32,261.7c0,101.5,64.2,187.5,153.2,217.9a17.56,17.56,0,0,0,3.8.4c8.3,0,11.5-6.1,11.5-11.4,0-5.5-.2-19.9-.3-39.1a102.4,102.4,0,0,1-22.6,2.7c-43.1,0-52.9-33.5-52.9-33.5-10.2-26.5-24.9-33.6-24.9-33.6-19.5-13.7-.1-14.1,1.4-14.1h.1c22.5,2,34.3,23.8,34.3,23.8,11.2,19.6,26.2,25.1,39.6,25.1a63,63,0,0,0,25.6-6c2-14.8,7.8-24.9,14.2-30.7-49.7-5.8-102-25.5-102-113.5,0-25.1,8.7-45.6,23-61.6-2.3-5.8-10-29.2,2.2-60.8a18.64,18.64,0,0,1,5-.5c8.1,0,26.4,3.1,56.6,24.1a208.21,208.21,0,0,1,112.2,0c30.2-21,48.5-24.1,56.6-24.1a18.64,18.64,0,0,1,5,.5c12.2,31.6,4.5,55,2.2,60.8,14.3,16.1,23,36.6,23,61.6,0,88.2-52.4,107.6-102.3,113.3,8,7.1,15.2,21.1,15.2,42.5,0,30.7-.3,55.5-.3,63,0,5.4,3.1,11.5,11.4,11.5a19.35,19.35,0,0,0,4-.4C415.9,449.2,480,363.1,480,261.7,480,134.9,379.7,32,256,32Z" fill="currentColor"></path>
                            </svg>
                        </a>

                        {/* Mobile Menu Toggle (Hamburger) */}
                        <button
                            className="lg:hidden text-white hover:text-blue-400 transition-colors duration-200 p-2"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                {isMobileMenuOpen ? (
                                    <>
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </>
                                ) : (
                                    <>
                                        <line x1="3" y1="6" x2="21" y2="6"></line>
                                        <line x1="3" y1="12" x2="21" y2="12"></line>
                                        <line x1="3" y1="18" x2="21" y2="18"></line>
                                    </>
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Search Bar (Dropdown) */}
                {isHomePage && isMobileSearchOpen && (
                    <div className="lg:hidden pb-3 border-t border-gray-700 mt-2 pt-3">
                        <input
                            type="text"
                            placeholder="Search Memes..."
                            value={searchQuery || ""}
                            onChange={handleSearchChange}
                            className="bg-gray-800 text-white px-4 py-2 rounded-full border border-gray-600 focus:border-blue-400 focus:outline-none text-sm w-full"
                        />
                    </div>
                )}

                {/* Mobile Navigation Menu */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden pb-3 border-t border-gray-700 mt-2 pt-3">
                        <div className="flex flex-col space-y-2">
                            <Link 
                                to="/" 
                                onClick={() => {
                                    setMeme && setMeme(null);
                                    closeMobileMenu();
                                }} 
                                className="text-white hover:text-blue-400 transition-colors duration-200 text-base py-2 px-2 rounded"
                            >
                                Home
                            </Link>
                            <Link 
                                to="/" 
                                onClick={() => {
                                    setMeme && setMeme(null);
                                    closeMobileMenu();
                                }} 
                                className="text-white hover:text-blue-400 transition-colors duration-200 text-base py-2 px-2 rounded"
                            >
                                Memes
                            </Link>
                            <Link
                                to="/about"
                                onClick={closeMobileMenu}
                                className="text-white hover:text-blue-400 transition-colors duration-200 text-base py-2 px-2 rounded"
                            >
                                About
                            </Link>
                            <Link
                                to="/history"
                                onClick={closeMobileMenu}
                                className="text-white hover:text-blue-400 transition-colors duration-200 text-base py-2 px-2 rounded"
                            >
                                History
                            </Link>
                            <button
                                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-none rounded-full px-4 py-2 text-sm cursor-pointer transition-all duration-200 shadow-md hover:shadow-lg font-medium mt-2 text-left"
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
            </div>
        </nav>
    );
}

export default Navbar;
