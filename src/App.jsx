// App.js
import React from "react";
import { Route,Routes } from "react-router-dom";

import Home from "./components/Home";
import "./style.css";
import About from "./components/About";



const App = () => {

    return (
        
        <Routes>
            <Route exact path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
           
            {/* Define other routes here */}
        </Routes>
       
        
    );
};

export default App;
