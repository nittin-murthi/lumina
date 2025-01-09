// @ts-nocheck
import { useEffect, useRef, useState } from 'react'
import { Box, Button, IconButton, Typography } from '@mui/material'
import { useAuth } from '../context/AuthContext';
import ChatItem from '../components/chat/ChatItem';
import { IoMdSend } from 'react-icons/io';
import { MdAddPhotoAlternate } from 'react-icons/md';
import { FaTrash } from 'react-icons/fa';
import { deleteUserChats, getUserChats, sendChatRequest } from '../helpers/api-communicator';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

type Message = {
  role: "user" | "assistant";
  content: string;
  image?: {
    url: string;
    data?: File;
  };
};

const Chat = () => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const auth = useAuth();
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSubmit = async () => {
    const content = inputRef.current?.value as string;
    if (!content && !selectedImage) return;
    
    if (inputRef.current) {
      inputRef.current.value = "";
    }

    const message: Message = {
      role: "user",
      content: content,
    };

    if (selectedImage) {
      message.image = {
        url: URL.createObjectURL(selectedImage),
        data: selectedImage,
      };
      setSelectedImage(null);
      setImagePreview(null);
    }

    setChatMessages((prev) => [...prev, message]);

    try {
      const chatData = await sendChatRequest(content, selectedImage);
      if (chatData.chats && Array.isArray(chatData.chats)) {
        setChatMessages(chatData.chats);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const handleClear = async () => {
    try {
      toast.loading("Clearing Chat", { id: "clear" });
      await deleteUserChats();
      setChatMessages([]);
      toast.success("Cleared Successfully", { id: "clear" });
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong", { id: "clear" });
    }
  };

  useEffect(() => {
    if (auth?.isLoggedIn && auth.user) {
      toast.loading("Loading Chats", { id: "loadchats" });
      getUserChats()
        .then((data) => {
          if (data.chats) {
            setChatMessages(data.chats);
          }
          toast.success("Successfully loaded chats", { id: "loadchats" });
        })
        .catch((err) => {
          console.log(err);
          toast.error("Loading Failed", { id: "loadchats" });
        });
    }
  }, [auth]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 64px)",
        width: "100%",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          height: "100%",
        }}
      >
        <Box
          ref={chatContainerRef}
          sx={{
            flex: 1,
            overflow: "auto",
            px: 3,
            pb: 3,
            display: "flex",
            flexDirection: "column",
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-track": {
              background: "transparent",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              background: "rgba(255, 255, 255, 0.2)",
            },
            justifyContent: chatMessages.length === 0 ? "center" : "flex-start",
          }}
        >
          {chatMessages.map((chat, index) => (
            <ChatItem
              content={chat.content}
              role={chat.role}
              key={index}
              image={chat.image}
            />
          ))}
          <div ref={messagesEndRef} />
        </Box>
        {imagePreview && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}
            >
              <Box
                sx={{
                  position: "absolute",
                  bottom: "80px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "fit-content",
                  borderRadius: "12px",
                  overflow: "hidden",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                }}
              >
                <motion.img
                  src={imagePreview}
                  alt="Preview"
                  style={{
                    maxWidth: "200px",
                    maxHeight: "200px",
                    display: "block",
                    objectFit: "cover",
                  }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                />
                <IconButton
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview(null);
                  }}
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    bgcolor: "rgba(0,0,0,0.6)",
                    color: "white",
                    padding: "4px",
                    minWidth: "24px",
                    minHeight: "24px",
                    "&:hover": {
                      bgcolor: "rgba(0,0,0,0.8)",
                      transform: "scale(1.1)",
                    },
                    transition: "all 0.2s ease-in-out",
                  }}
                >
                  <motion.div
                    whileHover={{ rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    ×
                  </motion.div>
                </IconButton>
              </Box>
            </motion.div>
          </AnimatePresence>
        )}
        <motion.div
          initial={false}
          animate={{
            y: chatMessages.length === 0 ? "-400%" : 0,
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          style={{ width: "100%", position: "relative", zIndex: 1 }}
        >
          <Box
            sx={{
              p: 3,
              bgcolor: "transparent",
              display: "flex",
              justifyContent: "center",
              marginTop: chatMessages.length === 0 ? "-45vh" : 0,
            }}
          >
            <Box sx={{ 
              display: "flex", 
              gap: 2, 
              alignItems: "center",
              width: chatMessages.length === 0 ? "70%" : "100%",
              transition: "width 0.5s ease-in-out",
              position: "relative",
              zIndex: 2,
            }}>
              {chatMessages.length > 0 && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <IconButton
                    onClick={handleClear}
                    sx={{
                      height: "45px",
                      width: "45px",
                      bgcolor: "rgba(255, 0, 0, 0.15)",
                      color: "#ff4444",
                      borderRadius: "8px",
                      "&:hover": { 
                        bgcolor: "rgba(255, 0, 0, 0.25)",
                      },
                      transition: "all 0.2s ease-in-out",
                    }}
                  >
                    <FaTrash size={16} />
                  </IconButton>
                </motion.div>
              )}
              <Box
                sx={{
                  width: "100%",
                  borderRadius: "8px",
                  bgcolor: "rgb(17,27,39)",
                  display: "flex",
                  alignItems: "center",
                  height: "45px",
                  boxShadow: chatMessages.length === 0 
                    ? 'none'
                    : `
                      0 0 15px rgba(0, 255, 252, 0.15),
                      0 0 30px rgba(0, 255, 252, 0.1),
                      0 0 45px rgba(0, 255, 252, 0.05)
                    `,
                  border: "1px solid rgba(0, 255, 252, 0.2)",
                  position: "relative",
                  "&::before": chatMessages.length === 0 ? {
                    content: '""',
                    position: "absolute",
                    inset: "-4px",
                    borderRadius: "12px",
                    padding: "4px",
                    background: "linear-gradient(45deg, rgba(0, 255, 252, 0.3), rgba(0, 255, 252, 0.5))",
                    WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    WebkitMaskComposite: "xor",
                    maskComposite: "exclude",
                    animation: "pulse 2s ease-in-out infinite",
                    boxShadow: `
                      0 0 30px rgba(0, 255, 252, 0.3),
                      0 0 60px rgba(0, 255, 252, 0.2)
                    `,
                  } : {},
                  "@keyframes pulse": {
                    "0%": {
                      opacity: 0.4,
                    },
                    "50%": {
                      opacity: 1,
                    },
                    "100%": {
                      opacity: 0.4,
                    },
                  },
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleImageSelect}
                />
                <IconButton
                  onClick={() => fileInputRef.current?.click()}
                  sx={{ color: "white", mx: 1, zIndex: 2 }}
                >
                  <MdAddPhotoAlternate />
                </IconButton>
                <input
                  ref={inputRef}
                  onKeyDown={handleKeyDown}
                  type="text"
                  style={{
                    width: "100%",
                    height: "45px",
                    background: "transparent",
                    padding: "10px",
                    border: "none",
                    outline: "none",
                    color: "white",
                    fontSize: "16px",
                    position: "relative",
                    zIndex: 2,
                  }}
                  placeholder="Type your message here..."
                />
                <IconButton onClick={handleSubmit} sx={{ color: "white", mx: 1, zIndex: 2 }}>
                  <IoMdSend />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </motion.div>
      </Box>
    </Box>
  );
};

export default Chat;