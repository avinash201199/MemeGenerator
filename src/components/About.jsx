import React from 'react';
import "../style.css"
import Navbar from './Navbar';
import Footer from './Footer';
import "../index.css";

const About = () => {
  return (
    <div>
    <Navbar/>
    <h2 className='text-3xl text-white text-center my-4'>About Us</h2>
    <div className="about-us w-full my-16 flex justify-center items-center p-6 h-screen bg-black text-white gap-10">
    

    <div className='right w-1/2'>
      
      <p className='text-xl leading-1.5 mb-4'>
        Welcome to our meme generation website! We are passionate about creating and sharing memes that make people smile and laugh. Our platform is a fun place for meme enthusiasts to discover, create, and share hilarious content with the world.
      </p>
      <p className='text-xl leading-1.5 mb-4'>
        At our core, we believe in the power of humor to bring people together. Whether you are a seasoned meme creator or just looking for a good laugh, you have come to the right place. Our mission is to provide you with the tools and inspiration you need to unleash your creativity and spread joy through memes.
      </p>
      <p className='text-xl leading-1.5 mb-4'>
        We are constantly working to improve our website and provide you with the best meme-making experience possible. If you have any feedback or suggestions, please feel free to reach out to us. We would love to hear from you!
      </p>
      </div>
      <div className='left w-1/2'><img className="w-80" src='https://imgs.search.brave.com/nPN8L2uSoOYMROzi5KKfKHm-r3b64jY5QBGPGXqFXDE/rs:fit:860:0:0/g:ce/aHR0cHM6Ly9tZW1l/LWdlbmVyYXRvci5j/b20vd3AtY29udGVu/dC91cGxvYWRzLzIw/MjAvMDkvVHJpZ2dl/cmVkLVJlZC1FeWVz/LU1lbWUtR2VuZXJh/dG9yLTE1MHgxNTAu/anBn'/></div>
    </div>
    
    <Footer/>
    </div>
  );
};

export default About;
