// src/components/Intro.jsx
import React from "react";

const Intro = () => {
  return (
    // <section className="text-center p-10 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl shadow-lg mt-6 border border-gray-700">
    //   <h1 className="text-4xl font-extrabold mb-6">Welcome to Meme Generator 🎉</h1>
    //   <p className="text-xl max-w-2xl mx-auto leading-relaxed">
    //     Create and explore hilarious memes instantly! Choose images from our collection, then add captions to generate memes in seconds.
    //   </p>
    // </section>
<section className="animate-fadeIn text-center p-10 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl shadow-xl mt-6 border border-gray-700">
  <h1 className="text-4xl font-extrabold mb-6">Welcome to Meme Generator 🎉</h1>
  <p className="text-xl max-w-2xl mx-auto leading-relaxed">
    Create and explore hilarious memes instantly! Choose images from our collection, then add captions to generate memes in seconds.
  </p>
  <button className="mt-6 bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-3 rounded-full text-lg font-semibold shadow-md hover:scale-105 transition">
    Start Creating →
  </button>
</section>

  );
};

export default Intro;
