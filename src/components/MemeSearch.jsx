import React, { useState } from "react";
import "../style.css"; 

const MemeSearch = ({ onSearch }) => {
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = () => {
        onSearch(searchQuery);
    };

    return (
        <div className="search-container"> 
            <input
                className="search-input" 
                type="text"
                placeholder="Search for memes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="search-button" onClick={handleSearch}>
                Search
            </button>
        </div>
    );
};

export default MemeSearch;
