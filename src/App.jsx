/* eslint-disable no-unused-vars */
// App.jsx
import React, { useState } from "react";
import { Route, Routes } from "react-router-dom";
import { ThemeProvider } from "./ThemeContext";
import Home from "./components/Home";
import "./style.css";
import "./theme.css";
import About from "./components/About";
import History from "./components/History";
import MemeHistory from "./components/MemeHistory";
import Favorites from "./components/Favorites";
import Dynamicmeme from "./components/Dynamicmeme";
import NewMeme from "./components/NewMeme";

const App = () => {
    const [meme, setMeme] = useState(null);
    
    return (
        <ThemeProvider>
            <div className="theme-bg-primary min-h-screen transition-colors">
                <Routes>
				<Route path="/" element={<Home setMeme={setMeme} meme={meme} />} />
                <Route path="/about" element={<About />} />
                <Route path="/history" element={<History />} />
                <Route path="/meme-history" element={<MemeHistory />} />
                <Route path="/favorites" element={<Favorites setMeme={setMeme} />} />
                <Route path="/dynamic" element={<Dynamicmeme />} />
                <Route path="/newmeme" element={<NewMeme />} />

                {/* Define other routes here */}
                </Routes>
            </div>
        </ThemeProvider>
    );
};

export default App;