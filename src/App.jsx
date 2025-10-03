// App.js
import React from "react";
import { Route,Routes } from "react-router-dom";

import Home from "./components/Home";
import "./style.css";
import About from "./components/About";
import History from "./components/History";
import NotFound from "./components/NotFound";



const App = () => {

    return (
        
        <Routes>
            <Route exact path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/history" element={<History />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
       
        
    );
};

export default App;
