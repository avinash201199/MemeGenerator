import React from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

const NotFound = () => {
  return (
    <div className="App min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow flex items-center justify-center">
        <div className="text-center px-4">
          <div className="mb-8">
            <h1 style={{
              fontSize: "8rem",
              fontWeight: "bold",
              color: "var(--color-primary)",
              margin: "0",
              textShadow: "0 0 20px rgba(111, 183, 215, 0.5)"
            }}>
              404
            </h1>
            <h2 style={{
              fontSize: "2rem",
              color: "var(--color-text)",
              margin: "10px 0 20px 0"
            }}>
              Oops! Page Not Found
            </h2>
            <p style={{
              fontSize: "1.2rem",
              color: "var(--color-text)",
              opacity: "0.8",
              marginBottom: "30px",
              maxWidth: "500px",
              margin: "0 auto 30px auto"
            }}>
              The page you're looking for doesn't exist. Maybe it was moved, deleted, or you entered the wrong URL.
            </p>
          </div>

          <div className="mb-8">
            <img
              src="https://i.imgflip.com/1g8my4.jpg"
              alt="404 meme"
              style={{
                maxWidth: "400px",
                width: "100%",
                height: "auto",
                borderRadius: "10px",
                marginBottom: "20px",
                border: "2px solid var(--color-primary)"
              }}
            />
            <p style={{
              fontSize: "1rem",
              color: "var(--color-secondary)",
              fontStyle: "italic"
            }}>
              "When you can't find the page you're looking for..."
            </p>
          </div>

          <div style={{ display: "flex", gap: "20px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              to="/"
              style={{
                display: "inline-block",
                padding: "12px 30px",
                backgroundColor: "var(--color-tertiary)",
                color: "var(--color-secondary)",
                textDecoration: "none",
                borderRadius: "10px",
                fontSize: "1.2rem",
                fontWeight: "600",
                transition: "all 0.3s ease",
                border: "2px solid var(--color-secondary)"
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = "var(--color-secondary)";
                e.target.style.color = "var(--color-tertiary)";
                e.target.style.transform = "translateY(-2px)";
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = "var(--color-tertiary)";
                e.target.style.color = "var(--color-secondary)";
                e.target.style.transform = "translateY(0)";
              }}
            >
              🏠 Go Back Home
            </Link>

            <Link
              to="/history"
              style={{
                display: "inline-block",
                padding: "12px 30px",
                backgroundColor: "var(--color-primary)",
                color: "var(--color-background)",
                textDecoration: "none",
                borderRadius: "10px",
                fontSize: "1.2rem",
                fontWeight: "600",
                transition: "all 0.3s ease",
                border: "2px solid var(--color-primary)"
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = "transparent";
                e.target.style.color = "var(--color-primary)";
                e.target.style.transform = "translateY(-2px)";
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = "var(--color-primary)";
                e.target.style.color = "var(--color-background)";
                e.target.style.transform = "translateY(0)";
              }}
            >
              📱 View Meme History
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;