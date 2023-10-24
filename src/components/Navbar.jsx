import React from "react";


const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="logo">Meme Generator</div>
            <ul className="nav-links">
                <li><a href="#home">Home</a></li>
                <li><a href="#memes">Memes</a></li>
                <li><a href="#about">About</a></li>
                {/* Add more anchor tags for other sections if needed */}
            </ul>
        </nav>
    );
}

export default Navbar;
