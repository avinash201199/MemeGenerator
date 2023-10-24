import "./style.css"
import Temp from "./Temp"
import Meme from "./Meme"
import Footer from "./components/Footer";
import { useState, useEffect } from "react";

const App = () => {
    const [temp, setTemp] = useState([]);
    const [meme, setMeme] = useState(null);
    useEffect(() => {
        fetch("https://api.imgflip.com/get_memes")
            .then((res) => res.json())
            .then((data) => {
                setTemp(data.data.memes);
            })
    }, []);
    return (
        <div className="App">
            <h1>Meme Generator</h1>
            {meme === null ? (<Temp temp={temp} setMeme={setMeme} />) : (<Meme meme={meme} setMeme={setMeme} />)}
            <Footer /> 
        </div>
    );
}

export default App;