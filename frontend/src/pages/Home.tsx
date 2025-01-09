import { Box, Typography } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaBrain, FaCode, FaImage } from "react-icons/fa";
import { IoSpeedometer } from "react-icons/io5";

const FeatureSection = ({ icon, title, description, color }: { icon: JSX.Element, title: string, description: string, color: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    whileHover={{ scale: 1.02 }}
  >
    <Box
      sx={{
        background: "rgba(17, 27, 39, 0.8)",
        borderRadius: "16px",
        padding: "2.5rem",
        border: `1px solid ${color}`,
        boxShadow: `
          0 0 15px ${color}25,
          0 0 30px ${color}15
        `,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 3,
        position: "relative",
        overflow: "hidden",
        transition: "all 0.3s ease-in-out",
        cursor: "pointer",
        "&:hover": {
          background: `rgba(17, 27, 39, 0.9)`,
          boxShadow: `
            0 0 20px ${color}35,
            0 0 40px ${color}25,
            0 0 60px ${color}15
          `,
          "& .highlight-gradient": {
            opacity: 1,
            transform: "translateY(0%)",
          },
        },
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "1px",
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          opacity: 0.5,
        },
      }}
    >
      <Box
        className="highlight-gradient"
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(145deg, ${color}05 0%, transparent 100%)`,
          opacity: 0,
          transform: "translateY(-10%)",
          transition: "all 0.5s ease-in-out",
          pointerEvents: "none",
        }}
      />
      <Box 
        sx={{ 
          color: color, 
          fontSize: "2.5rem",
          position: "relative",
          transition: "transform 0.3s ease-in-out",
          "&:hover": {
            transform: "scale(1.1)",
          }
        }}
      >
        {icon}
      </Box>
      <Typography 
        variant="h5" 
        sx={{ 
          fontWeight: "700", 
          color: color, 
          fontSize: "1.75rem",
          position: "relative",
        }}
      >
        {title}
      </Typography>
      <Typography 
        variant="body1" 
        sx={{ 
          color: "rgba(255, 255, 255, 0.8)", 
          lineHeight: 1.7,
          fontSize: "1.1rem",
          position: "relative",
        }}
      >
        {description}
      </Typography>
    </Box>
  </motion.div>
);

const Home = () => {
  const auth = useAuth();

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "4rem 20px",
      }}
    >
      <Box
        sx={{
          maxWidth: "1200px",
          width: "100%",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1
            style={{
              fontSize: "4.5rem",
              fontWeight: "700",
              marginBottom: "1rem",
              lineHeight: "1.2",
              textAlign: "center",
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
              textAlign: "center",
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
              marginBottom: "6rem",
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
        </motion.div>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gridTemplateRows: { xs: "auto", md: "auto auto" },
            columnGap: { xs: "4rem", md: "4rem" },
            rowGap: { xs: "6rem", md: "8rem" },
            mt: 8,
            mb: 8,
            mx: "auto",
            maxWidth: "1400px",
            padding: "0 20px",
          }}
        >
          <FeatureSection
            icon={<FaBrain />}
            title="Context-Aware Learning"
            description="Unlike ChatGPT, Lumina is specifically trained on ECE120 course materials, lecture notes, and past problems. Lumina ensures every response is accurate, relevant, and aligned with course objectives. No more generic AI responses!"
            color="#00fffc"
          />
          <FeatureSection
            icon={<FaCode />}
            title="Guided Problem-Solving"
            description="Instead of giving away answers, we guide you through the problem-solving process. Our AI breaks down complex circuits and Verilog concepts into digestible steps, helping you understand the 'why' behind each solution. Perfect for mastering digital logic fundamentals."
            color="#FF3366"
          />
          <FeatureSection
            icon={<FaImage />}
            title="Smart Circuit Analysis"
            description="Upload circuit diagrams or truth tables, and watch our advanced computer vision system analyze them in real-time. We can spot errors, suggest optimizations, and explain circuit behavior - something generic AI tools simply can't match."
            color="#9C27B0"
          />
          <FeatureSection
            icon={<IoSpeedometer />}
            title="Personalized Learning Path"
            description="Our AI adapts to your learning style and knowledge level. Whether you're struggling with basic gates or tackling complex sequential circuits, we provide tailored explanations and practice problems to accelerate your understanding."
            color="#4CAF50"
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Home;