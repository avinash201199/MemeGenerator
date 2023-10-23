/* eslint-disable react/prop-types */
// import { useState, useEffect } from "react";
// eslint-disable-next-line react/prop-types
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
