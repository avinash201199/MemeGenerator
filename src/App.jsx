// App.jsx
import React from "react";
import { Route, Routes } from "react-router-dom";
import { ThemeProvider } from "./ThemeContext";
import Home from "./components/Home";
import "./style.css";
import About from "./components/About";
import History from "./components/History";
import Dynamicmeme from "./components/Dynamicmeme";
import Analytics from "./components/Analytics";

const App = () => {
    return (
        <ThemeProvider>
            <Routes>
				<Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/history" element={<History />} />
                <Route path="/dynamic" element={<Dynamicmeme />} />
                <Route path="/analytics" element={<Analytics />} />

                {/* Define other routes here */}
            </Routes>
        </ThemeProvider>
    );
};

export default App;