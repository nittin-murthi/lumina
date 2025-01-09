import { Box, Button, Typography } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import CustomizedInput from "../components/shared/CustomizedInput";
import { IoArrowForward } from "react-icons/io5";

const Login = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    try {
      toast.loading("Signing In", { id: "login" });
      await auth?.login(email, password);
      toast.success("Signed In Successfully", { id: "login" });
      navigate("/chat");
    } catch (error) {
      console.log(error);
      toast.error("Signing In Failed", { id: "login" });
    }
  };
  
  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 2,
        marginTop: "-5vh",
      }}
    >
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        gap={3}
        p={4}
        sx={{
          width: "100%",
          maxWidth: "440px",
          borderRadius: "16px",
          background: "transparent",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: `
            0 0 10px rgba(0, 255, 252, 0.1),
            0 0 20px rgba(0, 255, 252, 0.05),
            0 0 30px rgba(0, 255, 252, 0.025),
            inset 0 0 10px rgba(0, 255, 252, 0.05)
          `,
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: -1,
            left: -1,
            right: -1,
            bottom: -1,
            borderRadius: "17px",
            background: "linear-gradient(180deg, rgba(0, 255, 252, 0.1), transparent)",
            zIndex: -1,
          }
        }}
      >
        <Typography 
          variant="h4" 
          textAlign="center" 
          sx={{
            fontSize: "3.5rem",
            fontWeight: "800",
            letterSpacing: "0.02em",
            marginBottom: 3,
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', sans-serif",
            width: "100%",
            lineHeight: 1,
          }}
        >
          Login
        </Typography>
        <form
          onSubmit={handleSubmit}
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
          }}
        >
          <CustomizedInput type="email" name="email" label="Email" />
          <CustomizedInput type="password" name="password" label="Password" />
          <Button
            type="submit"
            sx={{
              width: "100%",
              padding: "0.875rem",
              borderRadius: "10px",
              bgcolor: "#00fffc",
              color: "black",
              fontSize: "1.1rem",
              fontWeight: "600",
              fontFamily: "inherit",
              textTransform: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              "&:hover": {
                bgcolor: "#00e5e3",
              },
            }}
          >
            Login
            <IoArrowForward size={22} />
          </Button>
        </form>
      </Box>
    </Box>
  );
};

export default Login;