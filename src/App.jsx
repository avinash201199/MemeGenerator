// App.js
import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import MemeSearch from "./components/MemeSearch";
import Temp from "./Temp";
import Meme from "./Meme";
import Footer from "./components/Footer";
import "./style.css";

const App = () => {
    const [temp, setTemp] = useState([]);
    const [meme, setMeme] = useState(null);

    const handleSearch = (query) => {
        const username = "RituGupta";
        const password = "Ritu@123";
    
        
        fetch(`https://api.imgflip.com/search_memes?username=${username}&password=${password}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password, query }),
        })
        
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`Request failed with status: ${res.status}`);
                }
                return res.json();
            })
            .then((data) => {
                console.log(data);
                if (data && data.success) {
                    setTemp(data.data.memes);
                    console.log(data.data.memes)
                } else {
                    console.error("API Error:", data.error_message);
                    
                }
            })
            .catch((error) => {
                console.error("Error searching for memes:", error);
               
            });
    };
    
    

    useEffect(() => {
        fetch("https://api.imgflip.com/get_memes")
            .then((res) => res.json())
            .then((data) => {
                setTemp(data.data.memes);
            });
    }, []);

    return (
        <div className="App">
            <Navbar />
            <MemeSearch onSearch={handleSearch} />
            {meme === null ? <Temp temp={temp} setMeme={setMeme} /> : <Meme meme={meme} setMeme={setMeme} />}
            <Footer />
        </div>
    );
};

export default App;
