import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Avatar, Box, Button, IconButton, Typography } from '@mui/material'
import { useAuth } from '../context/AuthContext';
import { red } from '@mui/material/colors';
import ChatItem from '../components/chat/ChatItem';
import { IoMdSend } from 'react-icons/io';
import { deleteUserChats, getUserChats, sendChatRequest } from '../helpers/api-communicator';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

type Message = {
  role: "user" | "assistant";
  content: string;
};

const Chat = () => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const auth = useAuth();
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const handleSubmit = async () => {
    const content = inputRef.current?.value as string;
    if (inputRef && inputRef.current) {
      inputRef.current.value = "";
    }
    const newMessage: Message = { role: "user", content: content };
    setChatMessages((prev) => [...prev, newMessage]);
    const chatData = await sendChatRequest(content);
    setChatMessages([...chatData.chats]);
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
      return navigate("/login");
    }
  }, [auth]);

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
              <ChatItem content={chat.content} role={chat.role as "assistant" | "user"} key={index}/>
            ))}
          </Box>
          <div
        style={{
          width: "100%",
          borderRadius: 8,
          backgroundColor: "rgb(17,27,39)",
          display: "flex",
          margin: "auto",
        }}
      >
        {" "}
            <input ref={inputRef} type="text" style={{width: "100%", height: "50px", borderRadius: 5, border: "none", padding: "10px", marginTop: "10px", backgroundColor: "transparent", fontSize: "20px", color: "white"}} placeholder="Type your message here..." />
            <IconButton onClick={handleSubmit} sx={{ color: "white", mx: 1 }}>
              <IoMdSend />
            </IconButton>
          </div>
        </Box>
      </Box>
  )
}

export default Chat