// App.js
import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import MemeSearch from "./components/MemeSearch";
import Temp from "./Temp";
import Meme from "./Meme";
import Footer from "./components/Footer";
import { Route,Routes } from "react-router-dom";

import Home from "./components/Home";
import "./style.css";
import About from "./components/About";
import Memes from "./components/Memes";


const App = () => {

    return (
        
        <Routes>
            <Route exact path="/" element={<Home />} />
            
            <Route path="/about" element={<About />} />
            <Route path="/memes" element={<Memes />} />
           
            {/* Define other routes here */}
        </Routes>
       
        
    );
};

export default App;
