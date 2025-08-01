import { Server } from "socket.io";
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';

// Create a new instance of the Socket.IO server
const io = new Server({
  cors: {
    origin: ["https://relicario-app.vercel.app", "http://localhost:3000"],    
  }
});


let onlineUsers = [];

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


io.on("connection", (socket) => {    

    socket.on("addNewUser", (userId) => {
        !onlineUsers.some((user) => user.userId === userId) && onlineUsers.push({userId, socketId: socket.id});
        io.emit("getOnlineUsers", onlineUsers);
    });

    socket.on("disconnect", () => {
        onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
        io.emit("getOnlineUsers", onlineUsers);
    }); 

    socket.on("sendMessage", (message) => {        
        
        const user = onlineUsers.find((user) => user.userId === message.recipientId);
        if(user) {
            io.to(user.socketId).emit("getMessage", message);
            io.to(user.socketId).emit("getNotification", {
                senderId: message.senderId,
                isRead: false,
                date: new Date().toISOString(),
            });
        }
    }); 
});


app.get('/', (req, res) => {  
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


io.listen(4000);