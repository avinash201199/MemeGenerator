// MemeSearch.js
import React from "react";
import "../style.css";

const MemeSearch = ({ searchQuery, setSearchQuery }) => {
    const handleSearchChange = (event) => {
        // Update the search query state in the parent component
        setSearchQuery(event.target.value);
    };

    return (
        <div className="meme-search">
            <input
            className="mem"
                type="text"
                placeholder="Search Memes"
                value={searchQuery}
                onChange={handleSearchChange}
            />
        </div>
    );
};

export default MemeSearch;
