import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      id: "copyright",
      alignment: "md:text-left",
      content: (
        <>
          <p className="text-gray-200 text-sm font-semibold">
            © {currentYear} Meme Generator
          </p>
          <p className="text-gray-400 text-xs mt-2">
            All rights reserved.
          </p>
        </>
      ),
    },
    {
      id: "brand",
      alignment: "text-center",
      content: (
        <>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-pink-500 to-yellow-400 bg-clip-text text-transparent drop-shadow-sm">
             Meme Generator
          </h3>
          <p className="text-gray-400 text-sm mt-2">
            Creating laughter, one meme at a time
          </p>
        </>
      ),
    },
    {
      id: "github",
      alignment: "md:justify-end",
      content: (
        <a
          href="https://github.com/avinash201199/MemeGenerator"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 px-4 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/20 hover:-translate-y-0.5 group border border-gray-700 hover:border-yellow-500/50"
          aria-label="GitHub Repository"
        >
          <svg
            className="w-5 h-5 text-gray-300 group-hover:text-yellow-400 transition-colors duration-300"
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
          </svg>
          <span className="font-medium text-gray-300 group-hover:text-yellow-400 transition-colors duration-300">
            GitHub
          </span>
        </a>
      ),
    },
  ];

  return (
    <footer className="bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 text-white py-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center mb-8">
          {footerSections.map((section) => (
            <div
              key={section.id}
              className={`text-center ${
                section.id === "copyright" ? "md:text-left" : ""
              } ${section.id === "github" ? "flex justify-center " + section.alignment : ""}`}
            >
              {section.content}
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent my-8" />

        {/* Bottom Section */}
        <div className="text-center">
          <p className="text-gray-400 text-xs leading-relaxed">
            Built with <span className="text-red-400">❤️</span> for
            <span className="font-semibold text-yellow-400"> HacktoberFest 2025</span> | Made with
            <span className="text-blue-400"> React</span> &
            <span className="text-cyan-400"> Tailwind CSS</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;