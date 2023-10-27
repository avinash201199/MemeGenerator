// App.js
import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import MemeSearch from "./MemeSearch";
import Temp from "../Temp";
import Meme from "../Meme";
import Footer from "./Footer";
import "../style.css";

const Home = () => {
    const [temp, setTemp] = useState([]);
    const [meme, setMeme] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetch("https://api.imgflip.com/get_memes")
            .then((res) => res.json())
            .then((data) => {
                setTemp(data.data.memes);
            });
    }, []);

    // Function to filter memes based on the search query
    const filteredMemes = temp.filter((meme) =>
        meme.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        
        <div className="App">
            <Navbar />
            <MemeSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            {meme === null ? <Temp temp={filteredMemes} setMeme={setMeme} /> : <Meme meme={meme} setMeme={setMeme} />}
            <Footer />
        </div>
        
    );
};

export default Home;
