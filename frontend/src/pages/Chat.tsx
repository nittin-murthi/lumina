// @ts-nocheck
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Avatar, Box, Button, IconButton, Typography } from '@mui/material'
import { useAuth } from '../context/AuthContext';
import { red } from '@mui/material/colors';
import ChatItem from '../components/chat/ChatItem';
import { IoMdSend } from 'react-icons/io';
import { MdAddPhotoAlternate } from 'react-icons/md';
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
  const auth = useAuth();
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    const content = inputRef.current?.value as string;
    if (!content && !selectedImage) return;

    if (inputRef && inputRef.current) {
      inputRef.current.value = "";
    }

    const newMessage: Message = { 
      role: "user", 
      content: content || "",
      ...(selectedImage && { image: { url: imagePreview!, data: selectedImage } })
    };

    setChatMessages((prev) => [...prev, newMessage]);
    
    try {
      const chatData = await sendChatRequest(content || "", selectedImage);
      setChatMessages([...chatData.chats]);
      // Clear image after sending
      setSelectedImage(null);
      setImagePreview(null);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  const handleDeleteChats = async () => {
    try {
      toast.loading("Deleting Chats", { id: "deletechats" });
      await deleteUserChats();
      setChatMessages([]);
      toast.success("Deleted Chats Successfully", { id: "deletechats" });
    } catch (error) {
      console.log(error);
      toast.error("Deleting chats failed", { id: "deletechats" });
    }
  };
  
  useLayoutEffect(() => {
    if (auth?.isLoggedIn && auth.user) {
      toast.loading("Loading Chats", { id: "loadchats" });
      getUserChats()
        .then((data) => {
          setChatMessages([...data.chats]);
          toast.success("Successfully loaded chats", { id: "loadchats" });
        })
        .catch((err) => {
          console.log(err);
          toast.error("Loading Failed", { id: "loadchats" });
        });
    }
  }, [auth]);

  useEffect(() => {
    if (!auth?.user) {
      navigate("/login");
    }
  }, [auth, navigate]);

  return (
      <Box sx={{display: 'flex', flex: 1, width: '100%', height: '100%', mt: 3, gap: 3}}>
        <Box sx={{display: { md: 'flex', xs: 'none', sm: 'none'}, flex: 0.2, flexDirection: 'column'}}>
            <Box sx={{
              display: 'flex', 
              width: '100%', 
              height: '60vh',
              bgcolor: 'rgb(17, 29, 39)', 
              borderRadius: 5,
              flexDirection: 'column',
              mx: 3,
              // border: '1px solid rgba(0, 0, 0, 0.2)'
            }}>
              <Avatar sx={{mx: "auto", my: 2, bgcolor: 'white', color: 'black', fontWeight: 700,}}>
                  {auth?.user?.name?.charAt(0)}
              </Avatar>
              {/* <Typography sx={{mx: "auto", fontFamily: "work sans", color: 'white', fontWeight: 700,}}>
                  Hello, {auth?.user?.name}
              </Typography> */}
              <Typography sx={{mx: "auto", fontFamily: "work sans", color: 'white', fontWeight: 700,}}>
                  Chats
              </Typography>
              <Button onClick={handleDeleteChats} sx={{width: "200px", my: "auto", color: 'white', fontWeight: 700, borderRadius: 3, mx: "auto", bgcolor: red[300], "&:hover": {bgcolor: red[400]}}}>
                Clear
              </Button>
            </Box>
        </Box>
        <Box sx={{ display: "flex", flex: { md: 1, xs: 0.8, sm: 1}, flexDirection: 'column'}}>
          <Typography sx={{textAlign: "center", fontFamily: "work sans", color: 'white', fontWeight: 700,}}>
            Chat
          </Typography>
          <Box sx={{ width: "100%", height: "60vh", borderRadius: 5, mx: 'auto', display: 'flex', flexDirection: 'column', overflow: 'scroll', overflowX: 'hidden', scrollBehavior: 'smooth'}}>
            {chatMessages.map((chat, index) => (
              <ChatItem content={chat.content} role={chat.role as "assistant" | "user"} image={chat.image} key={index}/>
            ))}
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
                    mt: 2, 
                    position: 'relative', 
                    width: 'fit-content',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <motion.img 
                    src={imagePreview} 
                    alt="Preview" 
                    style={{ 
                      maxWidth: '200px', 
                      maxHeight: '200px', 
                      display: 'block',
                      objectFit: 'cover'
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
                      position: 'absolute', 
                      top: 8, 
                      right: 8, 
                      bgcolor: 'rgba(0,0,0,0.6)',
                      color: 'white',
                      padding: '4px',
                      minWidth: '24px',
                      minHeight: '24px',
                      '&:hover': { 
                        bgcolor: 'rgba(0,0,0,0.8)',
                        transform: 'scale(1.1)'
                      },
                      transition: 'all 0.2s ease-in-out'
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
          <div
            style={{
              width: "100%",
              borderRadius: 8,
              backgroundColor: "rgb(17,27,39)",
              display: "flex",
              margin: "auto",
              alignItems: "center",
              padding: "10px",
            }}
          >
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleImageSelect}
            />
            <IconButton 
              onClick={() => fileInputRef.current?.click()} 
              sx={{ color: "white", mx: 1 }}
            >
              <MdAddPhotoAlternate />
            </IconButton>
            <input 
              ref={inputRef} 
              type="text" 
              style={{
                width: "100%",
                height: "50px",
                borderRadius: 5,
                border: "none",
                padding: "10px",
                backgroundColor: "transparent",
                fontSize: "20px",
                color: "white"
              }} 
              placeholder="Type your message here..." 
            />
            <IconButton onClick={handleSubmit} sx={{ color: "white", mx: 1 }}>
              <IoMdSend />
            </IconButton>
          </div>
        </Box>
      </Box>
  )
}

export default Chat