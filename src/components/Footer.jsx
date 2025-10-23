import React, { useEffect, useRef } from "react";
import "../index.css";
import { FaGithub, FaInstagram, FaLinkedin } from "react-icons/fa";
import { gsap } from "gsap";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const footerRef = useRef(null);

  useEffect(() => {
    // Animate footer on mount
    gsap.fromTo(
      footerRef.current,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.5, ease: "power3.out" }
    );

    // Animate social icons hover
    const icons = footerRef.current.querySelectorAll(".social-icon");
    icons.forEach((icon) => {
      icon.addEventListener("mouseenter", () => {
        gsap.to(icon, { scale: 1.3, rotation: 15, duration: 0.3 });
      });
      icon.addEventListener("mouseleave", () => {
        gsap.to(icon, { scale: 1, rotation: 0, duration: 0.3 });
      });
    });
  }, []);

  return (
    <footer
      ref={footerRef}
      className="relative bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 text-white py-12"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Glass container */}
        <div className="backdrop-blur-md bg-white/10 p-8 rounded-2xl shadow-xl border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {/* Left - Copyright */}
            <div className="text-center md:text-left">
              <p className="text-gray-300 text-sm">© {currentYear} Meme Generator</p>
              <p className="text-gray-400 text-xs mt-1">All rights reserved.</p>
            </div>

            {/* Center - Brand */}
            <div className="text-center">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
                🎭 Meme Generator
              </h3>
              <p className="text-gray-400 text-sm mt-1">
                Creating laughter, one meme at a time
              </p>
            </div>

            {/* Right - Socials */}
            <div className="flex justify-center md:justify-end space-x-4">
              <a
                href="https://github.com/avinash201199/MemeGenerator"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300"
              >
                <FaGithub size={24} />
              </a>
              <a
                href="https://www.instagram.com/lets__code/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300"
              >
                <FaInstagram size={24} />
              </a>
              <a
                href="https://www.linkedin.com/in/avinash-singh-071b79175/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300"
              >
                <FaLinkedin size={24} />
              </a>
            </div>
          </div>

          {/* Links section */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Quick Links</h4>
              <ul className="mt-3 space-y-2 text-sm">
                <li><a href="/" className="text-gray-300 hover:text-white transition-colors">Home</a></li>
                <li><a href="/dynamic" className="text-gray-300 hover:text-white transition-colors">Dynamic</a></li>
                <li><a href="/about" className="text-gray-300 hover:text-white transition-colors">About</a></li>
                <li><a href="/history" className="text-gray-300 hover:text-white transition-colors">History</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Resources</h4>
              <ul className="mt-3 space-y-2 text-sm">
                <li><a href="https://github.com/avinash201199/MemeGenerator" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">Contribute</a></li>
                <li><a href="https://github.com/avinash201199/MemeGenerator/issues" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">Issues</a></li>
                <li><a href="https://hacktoberfest.com/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">HacktoberFest</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="mt-8 pt-6 border-t border-white/20">
            <div className="text-center">
              <p className="text-gray-400 text-xs">
                Built with ❤️ for HacktoberFest {currentYear} | Made with React, TailwindCSS & GSAP
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
