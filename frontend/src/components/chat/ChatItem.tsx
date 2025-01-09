// @ts-nocheck
import { Box, Avatar, Typography } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coldarkDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface ParsedBlock {
  type: 'text' | 'heading' | 'bullet';
  content: string;
  level?: number;
}

function cleanMessage(content: string): string {
  // Remove agent execution metadata and asterisks
  const cleanedContent = content
    .replace(/\[1m> .*?\[0m/g, '')  // Remove execution markers
    .replace(/\[[\d;]+m/g, '')  // Remove ANSI color codes
    .replace(/Entering new AgentExecutor chain\.\.\./g, '')  // Remove chain entry message
    .replace(/Finished chain\./g, '')  // Remove chain completion message
    .replace(/\*\*/g, '')  // Remove all asterisks
    .trim();  // Remove extra whitespace
  return cleanedContent;
}

function parseContent(text: string): ParsedBlock[] {
  // Clean the message first
  const cleanedText = cleanMessage(text);
  const lines = cleanedText.split('\n');
  const blocks: ParsedBlock[] = [];
  let currentText = '';

  lines.forEach((line) => {
    // Skip empty lines or single symbols
    if (!line.trim() || line.trim().match(/^[:|-]$/)) {
      if (currentText) {
        blocks.push({ type: 'text', content: currentText.trim() });
        currentText = '';
      }
      return;
    }

    // Handle numbered headings (e.g., "1. Title")
    const numberedHeading = line.match(/^(\d+)\.\s+(.+)$/);
    if (numberedHeading) {
      if (currentText) {
        blocks.push({ type: 'text', content: currentText.trim() });
        currentText = '';
      }
      blocks.push({
        type: 'heading',
        content: numberedHeading[2],
        level: parseInt(numberedHeading[1])
      });
      return;
    }

    // Handle bullet points
    if (line.startsWith('• ') || line.startsWith('- ')) {
      if (currentText) {
        blocks.push({ type: 'text', content: currentText.trim() });
        currentText = '';
      }
      blocks.push({
        type: 'bullet',
        content: line.substring(2).trim()
      });
      return;
    }

    // Remove asterisks from text
    line = line.replace(/\*\*/g, '');

    // Accumulate regular text
    currentText += (currentText ? '\n' : '') + line;
  });

  // Add any remaining text
  if (currentText) {
    blocks.push({ type: 'text', content: currentText.trim() });
  }

  return blocks;
}

function renderBlock(block: ParsedBlock, role: string) {
  switch (block.type) {
    case 'heading':
      return (
        <Typography
          sx={{
            fontSize: "1.1rem",
            fontWeight: 600,
            color: "#FFFFFF",
            mt: 2,
            mb: 1.5,
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            paddingBottom: 1,
          }}
          dangerouslySetInnerHTML={{ __html: block.content }}
        />
      );

    case 'bullet':
      return (
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1, ml: 2 }}>
          <Typography sx={{ mr: 2, color: "#00fffc" }}>•</Typography>
          <Typography
            sx={{
              flex: 1,
              fontSize: "1rem",
              lineHeight: 1.6,
              color: role === "assistant" ? "#E0E0E0" : "#FFFFFF",
            }}
            dangerouslySetInnerHTML={{ __html: block.content }}
          />
        </Box>
      );

    case 'text':
      return (
        <Typography
          sx={{
            fontSize: "1rem",
            lineHeight: 1.6,
            color: role === "assistant" ? "#E0E0E0" : "#FFFFFF",
            mb: 1.5
          }}
          dangerouslySetInnerHTML={{ __html: block.content }}
        />
      );
  }
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
  const auth = useAuth();

  const renderContent = () => {
    if (Array.isArray(content)) {
      return content.map((item, index) => {
        if (item.type === 'text') {
          const blocks = parseContent(item.text || '');
          return (
            <Box key={index} sx={{ width: "100%" }}>
              {blocks.map((block, blockIndex) => (
                <Box key={blockIndex}>
                  {renderBlock(block, role)}
                </Box>
              ))}
            </Box>
          );
        } else if (item.type === 'image_url') {
          return (
            <Box key={index} sx={{ mt: 2, width: "100%" }}>
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

    const blocks = parseContent(content);
    return (
      <Box sx={{ width: "100%" }}>
        {blocks.map((block, index) => (
          <Box key={index}>
            {renderBlock(block, role)}
          </Box>
        ))}
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
      </Box>
    );
  };

  return role === "assistant" ? (
    <Box
      sx={{
        display: "flex",
        p: "10px 24px",
        bgcolor: "rgba(0, 77, 86, 0.1)",
        gap: 2,
        borderRadius: 2,
        my: 0.75,
        maxWidth: "85%",
        alignSelf: "flex-start",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(0, 77, 86, 0.2)",
        width: "100%",
        textAlign: "left",
      }}
    >
      <Avatar sx={{ ml: "0", width: 32, height: 32 }}>
        <img src="pngtree-shine-idea-lightbulb-in-yellow-and-gray-color-png-image_6579931.png" alt="openai" width={"24px"} />
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", alignItems: "flex-start", textAlign: "left" }}>
        {renderContent()}
      </Box>
    </Box>
  ) : (
    <Box
      sx={{
        display: "flex",
        p: "10px 24px",
        bgcolor: "rgba(0, 77, 86, 0.3)",
        gap: 2,
        borderRadius: 2,
        my: 0.75,
        maxWidth: "85%",
        alignSelf: "flex-end",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(0, 77, 86, 0.4)",
        width: "100%",
        textAlign: "left",
      }}
    >
      <Avatar sx={{ ml: "0", bgcolor: "black", color: "white", width: 32, height: 32, fontSize: "0.9rem" }}>
        {auth?.user?.name[0]}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", alignItems: "flex-start", textAlign: "left", justifyContent: "center" }}>
        {renderContent()}
      </Box>
    </Box>
  );
};

export default ChatItem;