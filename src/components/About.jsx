import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "../style.css";
import "../index.css";

const About = () => {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowButton(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <Navbar />

      {/* Main Section */}
      <main className="flex-grow px-6 py-16 md:px-16">
        <h2 className="text-5xl font-extrabold text-center mb-16 tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-yellow-300">
          About Us
        </h2>

        <div className="flex flex-col-reverse md:flex-row items-center justify-center gap-16">
          {/* Text Section */}
          <div className="md:w-1/2 space-y-8 text-lg leading-relaxed text-gray-200">
            <p>
              Welcome to our <span className="text-pink-400 font-semibold">Meme Generator</span> — 
              where creativity meets laughter! We’re passionate about crafting memes 
              that spark smiles, spread joy, and make the internet a happier place.
            </p>

            <p>
              Whether you’re a seasoned meme creator or a casual scroller, 
              our platform gives you the <span className="text-yellow-300 font-semibold">tools and freedom</span> 
              to design memes that match your humor and personality.
            </p>

            <p>
              We believe memes are more than jokes — they’re a universal language. 
              They connect people, lighten moods, and tell stories in seconds.  
              That’s why we’re here: to make meme creation simple, fun, and accessible for everyone.
            </p>

            <p>
              Have feedback or new ideas? We’d{" "}
              <span className="text-pink-400 underline hover:text-pink-300 cursor-pointer">
                love to hear from you!
              </span>
            </p>
          </div>

          {/* Image Section */}
          <div className="md:w-1/2 flex justify-center">
            <img
              src="https://cdn-icons-png.flaticon.com/512/742/742751.png"
              alt="Funny Meme Illustration"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://cdn-icons-png.flaticon.com/512/904/904124.png"; // fallback image
              }}
              className="w-72 md:w-96 rounded-full shadow-[0_0_40px_#ff00ff40] hover:scale-105 transition-transform duration-300 bg-white p-4"
            />
          </div>
        </div>
      </main>

      {/* Scroll-to-top button */}
      {showButton && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-4 bg-pink-500 text-white rounded-full shadow-lg hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-300 transition-transform transform hover:scale-110"
          aria-label="Scroll to top"
        >
          ↑
        </button>
      )}

      <Footer />
    </div>
  );
};

export default About;
