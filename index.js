import { Server } from "socket.io";

const io = new Server({cors: {origin: "http://localhost:3000"}});

let onlineUsers = [];

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





io.listen(4000);