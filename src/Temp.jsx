/* eslint-disable react/prop-types */
// import { useState, useEffect } from "react";
// eslint-disable-next-line react/prop-types

import React, { useRef, useLayoutEffect } from "react";
import gsap from "gsap";

const Temp = ({ temp, setMeme }) => {
  const containerRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(containerRef.current.children, {
        opacity: 0,
        duration: 1,
        ease: "power4.out",
        stagger: {
          amount: 0.3,
          each: 0.1,
        },
        y: 50,
        scale: 0.9,
      });
    }, containerRef.current);

    return () => {
      ctx.revert();
    };
  }, [temp]);

  return (
    <div className="Templates p-4 mb-24">
      <div 
        className="grid grid-cols-3 lg:grid-cols-6 gap-6 justify-items-center max-w-7xl mx-auto"
        ref={containerRef}
      >
        {temp.map((temps) => (
          <div
            key={temps.id}
            className="template cursor-pointer flex flex-col items-center justify-center p-3 transition-transform duration-200 hover:scale-105"
            onClick={() => setMeme(temps)}
            style={{ width: '220px', height: '260px' }}
          >
            <div
              style={{ 
                backgroundImage: `url(${temps.url})`, 
                width: '200px', 
                height: '200px', 
                backgroundSize: 'cover', 
                backgroundPosition: 'center', 
                borderRadius: '20px', 
                border: '4px solid #ff2e63', 
                boxShadow: '0 4px 18px rgba(255,46,99,0.15), 0 0 0 2px #08d9d6',
                minHeight: '200px',
                minWidth: '200px'
              }}
              className="meme flex items-center justify-center relative flex-shrink-0"
            >
            </div>
            <div className="mt-3 text-center text-sm font-bold text-pink-600 dark:text-cyan-300 truncate w-full px-2" title={temps.name}>
              {temps.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Temp;
