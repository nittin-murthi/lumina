// @ts-nocheck
import TextField from "@mui/material/TextField";

type Props = {
  name: string;
  type: string;
  label: string;
};

const CustomizedInput = (props: Props) => {
  return (
    <TextField
      margin="normal"
      InputLabelProps={{ 
        style: { 
          color: "white",
          fontSize: "1rem",
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, sans-serif",
        } 
      }}
      name={props.name}
      label={props.label}
      type={props.type}
      InputProps={{
        style: {
          width: "100%",
          borderRadius: 10,
          fontSize: "1.1rem",
          color: "white",
          fontFamily: "inherit",
          padding: "0.25rem 0",
          background: "transparent",
        },
      }}
      sx={{
        width: "100%",
        "& .MuiOutlinedInput-root": {
          background: "transparent",
          "& fieldset": {
            borderColor: "rgba(255, 255, 255, 0.3)",
            borderRadius: "10px",
            borderWidth: "1px",
          },
          "&:hover fieldset": {
            borderColor: "rgba(255, 255, 255, 0.5)",
          },
          "&.Mui-focused fieldset": {
            borderColor: "#00fffc",
            borderWidth: "1px",
          },
        },
        "& .MuiInputBase-input": {
          padding: "0.75rem 1rem",
          "&::placeholder": {
            color: "rgba(255, 255, 255, 0.5)",
          },
        },
      }}
    />
  );
};

export default CustomizedInput;