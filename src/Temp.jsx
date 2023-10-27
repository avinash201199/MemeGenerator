/* eslint-disable react/prop-types */
// import { useState, useEffect } from "react";
// eslint-disable-next-line react/prop-types
const Temp = ({ temp, setMeme }) => {
    return (
        <div className="container mx-auto p-4">
            {temp.map(temps => (
                <div key={temps.id}
                    className="template w-1/3 inline-block border-30 border-transparent"
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