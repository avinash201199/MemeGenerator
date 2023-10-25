import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
    const navigate = useNavigate();

    const goBack = () => {
        // Use the navigate function with -1 to go back one level in the route hierarchy
        navigate(-1);
    };

    return (
        <nav className="navbar">
            <div className="logo">Meme Generator</div>
            <ul className="nav-links">
                <li>
                    <Link to="/">Home</Link>
                </li>
                <li>
                    <Link to="/memes">Memes</Link>
                </li>
                <li>
                    <Link to="/about">About</Link>
                </li>
                <button onClick={()=>navigate(-1)}>goBack</button>
            </ul>
           
        </nav>
    );
}

export default Navbar;
