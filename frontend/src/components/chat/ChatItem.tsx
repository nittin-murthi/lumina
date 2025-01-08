// @ts-nocheck
import { Box, Avatar, Typography } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coldarkDark } from "react-syntax-highlighter/dist/esm/styles/prism";

function extractCodeFromString(message: string) {
  if (message.includes("```")) {
    const blocks = message.split("```");
    return blocks;
  }
}

function isCodeBlock(str: string) {
  if (
    str.includes("=") ||
    str.includes(";") ||
    str.includes("[") ||
    str.includes("]") ||
    str.includes("{") ||
    str.includes("}") ||
    str.includes("#") ||
    str.includes("//")
  ) {
    return true;
  }
  return false;
}

type ChatItemProps = {
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
  role: "user" | "assistant";
  image?: {
    url: string;
    data?: File;
  };
};

const ChatItem = ({ content, role, image }: ChatItemProps) => {
  const messageBlocks = typeof content === 'string' ? extractCodeFromString(content) : null;
  const auth = useAuth();

  const renderContent = () => {
    if (Array.isArray(content)) {
      return content.map((item, index) => {
        if (item.type === 'text') {
          return <Typography key={index} sx={{ fontSize: "20px" }}>{item.text}</Typography>;
        } else if (item.type === 'image_url') {
          return (
            <Box key={index} sx={{ mt: 2 }}>
              <img 
                src={item.image_url.url} 
                alt="Content"
                style={{ 
                  maxWidth: '300px', 
                  maxHeight: '300px', 
                  borderRadius: '8px',
                  objectFit: 'contain'
                }} 
              />
            </Box>
          );
        }
        return null;
      });
    }

    if (!messageBlocks) {
      return (
        <>
          <Typography sx={{ fontSize: "20px" }}>{content}</Typography>
          {image && (
            <Box sx={{ mt: 2 }}>
              <img 
                src={image.url} 
                alt="Uploaded content"
                style={{ 
                  maxWidth: '300px', 
                  maxHeight: '300px', 
                  borderRadius: '8px',
                  objectFit: 'contain'
                }} 
              />
            </Box>
          )}
        </>
      );
    }

    return messageBlocks.map((block, index) =>
      isCodeBlock(block) ? (
        <SyntaxHighlighter key={index} style={coldarkDark} language="javascript">
          {block}
        </SyntaxHighlighter>
      ) : (
        <Typography key={index} sx={{ fontSize: "20px" }}>{block}</Typography>
      )
    );
  };

  return role === "assistant" ? (
    <Box
      sx={{
        display: "flex",
        p: 2,
        bgcolor: "#004d5612",
        gap: 2,
        borderRadius: 2,
        my: 1,
      }}
    >
      <Avatar sx={{ ml: "0" }}>
        <img src="pngtree-shine-idea-lightbulb-in-yellow-and-gray-color-png-image_6579931.png" alt="openai" width={"30px"} />
      </Avatar>
      <Box>
        {renderContent()}
      </Box>
    </Box>
  ) : (
    <Box
      sx={{
        display: "flex",
        p: 2,
        bgcolor: "#004d56",
        gap: 2,
        borderRadius: 2,
        my: 1
      }}
    >
      <Avatar sx={{ ml: "0", bgcolor: "black", color: "white" }}>
        {auth?.user?.name[0]}
      </Avatar>
      <Box>
        {renderContent()}
      </Box>
    </Box>
  );
};

export default ChatItem;