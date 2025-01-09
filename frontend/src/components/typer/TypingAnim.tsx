import { TypeAnimation } from "react-type-animation";

const TypingAnim = () => {
  return (
    <TypeAnimation
      sequence={[
        "Your personal ECE120 Teaching Assistant",
        1000,
        "Skip the office hours queue",
        2000,
        "Accessible anytime, anywhere 💻",
        1500,
      ]}
      speed={50}
      style={{
        fontSize: "48px",
        color: "white",
        display: "inline-block",
        textShadow: "1px 1px 10px rgba(0, 0, 0, 0.5)",
      }}
      repeat={Infinity}
    />
  );
};

export default TypingAnim;