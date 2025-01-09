import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";

export const TopMessage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "2rem",
        textAlign: "left",
      }}
    >
      <Box
        sx={{
          background: "rgba(17, 27, 39, 0.8)",
          borderRadius: "16px",
          padding: "2rem",
          border: "1px solid rgba(0, 255, 252, 0.2)",
          boxShadow: `
            0 0 15px rgba(0, 255, 252, 0.15),
            0 0 30px rgba(0, 255, 252, 0.1)
          `,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: "#00fffc", fontWeight: "bold", mb: 3 }}>
          Hello! 👋
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 2, fontSize: "1.1rem", lineHeight: 1.6 }}>
          I am an AI Programming Assistant built to answer all your questions about programming.
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 3, fontSize: "1.1rem", lineHeight: 1.6 }}>
          If you are new to programming, I would be happy to work with you and help you improve. Remember, like any skill, your ability to program improves with practice.
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 2, color: "#00fffc" }}>
          So go ahead and take any help from me!
        </Typography>
      </Box>
    </motion.div>
  );
};

export const BottomMessage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "2rem",
        textAlign: "left",
      }}
    >
      <Box
        sx={{
          background: "rgba(17, 27, 39, 0.8)",
          borderRadius: "16px",
          padding: "2rem",
          border: "1px solid rgba(0, 255, 252, 0.2)",
          boxShadow: `
            0 0 15px rgba(0, 255, 252, 0.15),
            0 0 30px rgba(0, 255, 252, 0.1)
          `,
        }}
      >
        <Box>
          <Typography variant="body1" sx={{ mb: 1, fontSize: "1.1rem", color: "#00fffc" }}>
            You can:
          </Typography>
          <ul style={{ listStyleType: "none", padding: 0 }}>
            {[
              "Ask me how to think about the overall program structure",
              "Ask me about any particular part of a given program",
              "Inquire about assignment instructions",
              "Ask what to do if your program doesn't compile",
            ].map((item, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                style={{
                  marginBottom: "0.8rem",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <span style={{ color: "#00fffc", marginRight: "0.5rem" }}>•</span>
                {item}
              </motion.li>
            ))}
          </ul>
        </Box>
        
        <Typography 
          variant="body1" 
          sx={{ 
            mt: 3, 
            fontStyle: "italic", 
            color: "rgba(255, 255, 255, 0.7)",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            pt: 2
          }}
        >
          Remember, the more specific your question, the better I can assist you!
        </Typography>
      </Box>
    </motion.div>
  );
};
