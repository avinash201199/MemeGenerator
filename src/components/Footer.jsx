
import React from "react";
import "../index.css";

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 text-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                    {/* Left side - Copyright */}
                    <div className="text-center md:text-left">
                        <p className="text-gray-300 text-sm">
                            © {currentYear} Meme Generator
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                            All rights reserved.
                        </p>
                    </div>
                    
                    {/* Center - Logo or Brand */}
                    <div className="text-center">
                        <h3 className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
                            🎭 Meme Generator
                        </h3>
                        <p className="text-gray-400 text-sm mt-1">
                            Creating laughter, one meme at a time
                        </p>
                    </div>
                    
                    {/* Right side - GitHub link */}
                    <div className="flex justify-center md:justify-end">
                        <a 
                            href="https://github.com/avinash201199/MemeGenerator" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            aria-label="Contribute on GitHub"
                            className="flex items-center space-x-2 p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all duration-300 hover:scale-105 group"
                        >
                            <svg className="w-6 h-6 text-gray-300 group-hover:text-yellow-400 transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                            </svg>
                            <span className="font-medium text-gray-300 group-hover:text-yellow-400 transition-colors duration-300">
                                Contribute on GitHub
                            </span>
                        </a>
                    </div>
                </div>
                
                {/* Pages section above footer */}
                <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {/* Quick Links */}
                    <div>
                        <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Quick Links</h4>
                        <ul className="mt-3 space-y-2 text-sm">
                            <li>
                                <a href="/" className="text-gray-300 hover:text-white transition-colors">Home</a>
                            </li>
                            <li>
                                <a href="/dynamic" className="text-gray-300 hover:text-white transition-colors">Dynamic</a>
                            </li>
                            <li>
                                <a href="/about" className="text-gray-300 hover:text-white transition-colors">About</a>
                            </li>
                            <li>
                                <a href="/history" className="text-gray-300 hover:text-white transition-colors">History</a>
                            </li>
                        </ul>
                    </div>
                    {/* Resources */}
                    <div>
                        <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Resources</h4>
                        <ul className="mt-3 space-y-2 text-sm">
                            <li><a href="https://github.com/avinash201199/MemeGenerator" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">Contribute</a></li>
                            <li><a href="https://github.com/avinash201199/MemeGenerator/issues" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">Issues</a></li>
                            <li><a href="https://hacktoberfest.com/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">HacktoberFest</a></li>
                            <li><a href="#" className="text-gray-300 hover:text-white transition-colors">FAQ</a></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom border */}
                <div className="mt-8 pt-6 border-t border-gray-700">
                    <div className="text-center">
                        <p className="text-gray-400 text-xs">
                            Built with ❤️ for HacktoberFest {currentYear} | Made with React & Tailwind CSS
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
