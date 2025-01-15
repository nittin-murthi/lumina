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
import { TopMessage, BottomMessage } from '../components/chat/WelcomeMessage';

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
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const scrollToBottom = () => {
    if (messagesEndRef.current && shouldAutoScroll) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: "smooth", 
        block: "start"
      });
    }
  };

  useEffect(() => {
    if (chatMessages.length > 0) {
      scrollToBottom();
    }
  }, [chatMessages]);

  // Handle scroll events to determine if we should auto-scroll
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      // If we're near the bottom (within 100px), enable auto-scroll
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShouldAutoScroll(isNearBottom);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

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
      setIsUploading(true);
      toast.loading("Processing your image...", { id: "imageUpload" });
    }

    console.log('New message being added:', message);
    // Update messages with animation timing in mind
    setTimeout(() => {
      setChatMessages((prev) => {
        console.log('Previous chat messages:', prev);
        const newMessages = [...prev, message];
        console.log('Updated chat messages:', newMessages);
        return newMessages;
      });
    }, 100);

    try {
      const chatData = await sendChatRequest(content, selectedImage);
      console.log('API Response:', chatData);
      if (chatData.chats && Array.isArray(chatData.chats)) {
        setTimeout(() => {
          console.log('Setting chat messages from API:', chatData.chats);
          setChatMessages(chatData.chats);
          // Only clear the image after we get a successful response
          if (selectedImage) {
            toast.success("Image uploaded successfully", { id: "imageUpload" });
          }
          setSelectedImage(null);
          setImagePreview(null);
          setIsUploading(false);
        }, 100);
      } else {
        console.error("Invalid response format:", chatData);
        if (selectedImage) {
          toast.error("Failed to process image", { id: "imageUpload" });
        }
        setIsUploading(false);
      }
    } catch (error) {
      console.error("API Error Details:", error);
      if (selectedImage) {
        toast.error("Failed to upload image", { id: "imageUpload" });
      } else {
        toast.error("Something went wrong");
      }
      setIsUploading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Set up preview first
      setImagePreview(URL.createObjectURL(file));
      setSelectedImage(file);
      // Small delay to ensure preview is visible before toast
      setTimeout(() => {
        toast.success("Image uploaded successfully", { id: "imageSelect" });
      }, 100);
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
            pb: chatMessages.length === 0 ? 3 : "100px",
            display: "flex",
            flexDirection: "column",
            background: "transparent",
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
            justifyContent: chatMessages.length === 0 ? "flex-end" : "flex-start",
          }}
        >
          <AnimatePresence mode="wait">
            {chatMessages.length === 0 ? (
              <TopMessage />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                style={{ width: "100%" }}
              >
                {chatMessages.map((chat, index) => (
                  <ChatItem
                    key={index}
                    content={chat.content}
                    role={chat.role}
                    image={chat.image}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </Box>
        {imagePreview && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "40px" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ 
                duration: 0.3,
                ease: [0.4, 0, 0.2, 1]
              }}
              style={{
                width: "100%",
                overflow: "hidden",
                position: "absolute",
                bottom: "calc(100% + 8px)",
                left: 0,
                right: 0,
                paddingLeft: "16px",
                paddingRight: "16px",
                zIndex: 20
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  height: "40px",
                  borderRadius: "8px",
                  bgcolor: "rgba(17, 27, 39, 0.95)",
                  display: "flex",
                  alignItems: "center",
                  padding: "4px 8px",
                  border: "1px solid rgba(0, 255, 252, 0.3)",
                  boxShadow: `
                    0 0 15px rgba(0, 255, 252, 0.15),
                    0 0 30px rgba(0, 255, 252, 0.1),
                    0 4px 10px rgba(0, 0, 0, 0.25)
                  `,
                  transform: "translateY(0)",
                  position: "relative",
                }}
              >
                <Box
                  sx={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "4px",
                    overflow: "hidden",
                    flexShrink: 0,
                    mr: 1,
                    position: "relative",
                    border: "1px solid rgba(0, 255, 252, 0.2)"
                  }}
                >
                  <motion.img
                    src={imagePreview}
                    alt="Preview"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      filter: isUploading ? "brightness(0.7)" : "none",
                    }}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                  {isUploading && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(0, 0, 0, 0.3)",
                      }}
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ 
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                        style={{
                          width: "16px",
                          height: "16px",
                          border: "2px solid rgba(0, 255, 252, 0.3)",
                          borderTopColor: "rgba(0, 255, 252, 1)",
                          borderRadius: "50%",
                        }}
                      />
                    </Box>
                  )}
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: "rgba(255, 255, 255, 0.8)",
                    flexGrow: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}
                >
                  {isUploading ? "Uploading image..." : "Image selected"}
                </Typography>
                {!isUploading && (
                  <IconButton
                    onClick={() => {
                      setSelectedImage(null);
                      setImagePreview(null);
                    }}
                    sx={{
                      color: "white",
                      p: "4px",
                      "&:hover": {
                        bgcolor: "rgba(255, 255, 255, 0.1)",
                      },
                    }}
                  >
                    <motion.div
                      whileHover={{ rotate: 90 }}
                      transition={{ duration: 0.2 }}
                      style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      ×
                    </motion.div>
                  </IconButton>
                )}
              </Box>
            </motion.div>
          </AnimatePresence>
        )}
        <motion.div
          initial={false}
          layout
          animate={{
            y: 0,
            height: "auto",
            position: "fixed",
            top: chatMessages.length === 0 ? "50vh" : "85vh"
          }}
          transition={{ 
            duration: 0.8, 
            ease: "easeInOut",
            layout: {
              duration: 0.8,
              ease: "easeInOut"
            }
          }}
          style={{ 
            width: "100%", 
            position: "fixed",
            top: chatMessages.length === 0 ? "50vh" : "85vh",
            background: "transparent",
            zIndex: 10,
            transform: "translateY(-50%)",
            left: 0,
            right: 0
          }}
        >
          <Box
            sx={{
              p: 3,
              bgcolor: "transparent",
              display: "flex",
              flexDirection: "column",
              gap: 3,
              maxWidth: "100%",
              margin: "0 auto"
            }}
          >
            <motion.div
              layout
              transition={{
                duration: 0.8,
                ease: "easeInOut"
              }}
            >
              <Box sx={{ 
                display: "flex", 
                gap: 2, 
                alignItems: "center",
                width: "100%",
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
              <AnimatePresence mode="wait">
                {chatMessages.length === 0 && <BottomMessage />}
              </AnimatePresence>
            </motion.div>
          </Box>
        </motion.div>
      </Box>
    </Box>
  );
};

export default Chat;