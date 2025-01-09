import { Box } from "@mui/material";
import React from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const Home = () => {
  const auth = useAuth();

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "90vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 20px",
        textAlign: "center",
      }}
    >
      <Box
        sx={{
          maxWidth: "1200px",
          width: "100%",
        }}
      >
        <h1
          style={{
            fontSize: "4.5rem",
            fontWeight: "700",
            marginBottom: "1rem",
            lineHeight: "1.2",
          }}
        >
          Learning circuits is hard.
          <br />
          Getting help is easy.
        </h1>

        <p
          style={{
            fontSize: "1.5rem",
            color: "rgba(255, 255, 255, 0.7)",
            marginBottom: "3rem",
            lineHeight: "1.5",
          }}
        >
          Lumina provides 24/7 personalized ECE120 assistance, helping you master digital logic
          and computer organization with instant, accurate support whenever you need it.
        </p>

        <Box
          sx={{
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
            "& .nav-link": {
              fontSize: "1.2rem",
              padding: "1rem 2rem",
              borderRadius: "8px",
              transition: "transform 0.2s ease-in-out",
              "&:hover": {
                transform: "translateY(-2px)",
              },
            },
          }}
        >
          {auth?.isLoggedIn ? (
            <>
              <Link
                to="/chat"
                className="nav-link"
                style={{ background: "#00fffc", color: "black" }}
              >
                Start Learning
              </Link>
              <Link
                to="/"
                className="nav-link"
                style={{ background: "#51538f", color: "#e0e0ff" }}
                onClick={auth.logout}
              >
                Logout
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="nav-link"
                style={{ background: "#00fffc", color: "black" }}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="nav-link"
                style={{ background: "#51538f", color: "#e0e0ff" }}
              >
                Create Account
              </Link>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Home;