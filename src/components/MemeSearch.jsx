// MemeSearch.js
import React from "react";
import "../style.css";
import "../index.css";

const MemeSearch = ({ searchQuery, setSearchQuery }) => {
    const handleSearchChange = (event) => {
        // Update the search query state in the parent component
        setSearchQuery(event.target.value);
    };

    return (
        <div className="meme-search text-center mt-20">
            <input
            className="mem w-full max-w-300 p-2 border-2 border-gray-300 rounded-20 text-2xl outline-none"
                type="text"
                placeholder="Search Memes"
                value={searchQuery}
                onChange={handleSearchChange}
            />
        </div>
    );
};

export default MemeSearch;
