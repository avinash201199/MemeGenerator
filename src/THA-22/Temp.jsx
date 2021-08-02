// import { useState, useEffect } from "react";
const Temp = ({ temp, setMeme }) => {
    return (
        <div className="Templates">
            {temp.map(temps => (
                <div key={temps.id}
                    className="template"
                    onClick={() => {
                        setMeme(temps)
                        // console.log(setMeme);
                    }}>
                    <div style={{ backgroundImage: `url(${temps.url})` }} className="meme">

                    </div>
                </div>
            ))}
        </div>);
}

export default Temp;
