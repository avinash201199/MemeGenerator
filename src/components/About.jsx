// ```jsx
import React, { useState, useEffect } from 'react';
import "../style.css"
import Navbar from './Navbar';
import Footer from './Footer';
import "../index.css";

const About = () => {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowButton(true);
      } else {
        setShowButton(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col min-h-screen text-white bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Navbar/>
      
      <main className="flex-grow bg-white dark:bg-transparent backdrop-blur-lg rounded-2xl shadow-[0_0_30px_#00ffff25]">
        <h2 className="my-8 text-5xl font-bold tracking-wide text-center text-black dark:text-white">
          About Us
        </h2>

        <div className="container bg-transparent flex flex-col items-center justify-center gap-12 px-6 m-12 mx-auto mx about-us md:flex-row ">
          {/* Image Section - Left */}
          <div className="flex justify-center md:w-1/2 bg-transparent">                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        
            <img 
              className="transition-transform border border-white duration-300 ease-in-out shadow-xl w-80 md:w-96 rounded-full hover:scale-105"
              src="https://imgs.search.brave.com/nPN8L2uSoOYMROzi5KKfKHm-r3b64jY5QBGPGXqFXDE/rs:fit:860:0:0/g:ce/aHR0cHM6Ly9tZW1l/LWdlbmVyYXRvci5j/b20vd3AtY29udGVu/dC91cGxvYWRzLzIw/MjAvMDkvVHJpZ2dl/cmVkLVJlZC1FeWVz/LU1lbWUtR2VuZXJh/dG9yLTE1MHgxNTAu/anBn"
              alt="Meme Illustration"
            />
          </div>

          {/* Text Section - Right */}
          <div className="space-y-6 md:w-1/2 ">
            <p className="leading-relaxed text-white-800 light:text-gray-800 text-5xl">
              Welcome to our <span className="font-semibold text-pink-400">Meme Generator</span>! 
              We’re passionate about creating and sharing memes that bring joy and laughter. 
              Our platform is a fun place for meme enthusiasts to discover, create, and spread 
              hilarious content with the world.
            </p>
            <p className="leading-relaxed text-white-800 light:text-gray-800 text-5xl">
              We believe in the power of humor to connect people. Whether you’re a seasoned 
              meme creator or simply looking for a good laugh, you’ve come to the right place. 
              Our mission is to give you the <span className="font-semibold text-yellow-300">tools and inspiration</span> 
              to unleash your creativity and spread happiness.
            </p>
            <p className="leading-relaxed text-white-800 light:text-gray-800 text-5xl">
              We’re constantly working to improve and provide the best meme-making experience. 
              Got feedback or suggestions? We’d <span className="underline cursor-pointer decoration-pink-500 hover:text-pink-400">
              love to hear from you!</span>
            </p>
          </div>
        </div>
      </main>

      {showButton && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3 bg-pink-500 text-white rounded-full shadow-lg hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-300 w-12 h-12 flex items-center justify-center font-bold"
        >
          ↑
        </button>
      )}
      
      <Footer/>
    </div>
  );
};

export default About;
// ```
