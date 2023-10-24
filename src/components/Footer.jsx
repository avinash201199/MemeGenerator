
import React from "react";

const Footer = () => {
    const currentYear = new Date().getFullYear();


    

    return (
        <footer className="footer">
            <div className="container">
                <p>&copy; {currentYear} Meme Generator</p>
            </div>
        </footer>
    );
};

export default Footer;
