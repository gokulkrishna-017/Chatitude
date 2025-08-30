import e from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import path from "path";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { connectDB } from "./libs/db.js";

dotenv.config();

const app = e();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"], // change to your frontend URL in prod
    credentials: true,
  },
});

// ---- socket logic ----
const userSocketMap = {}; // { userId: socketId }

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// ---- middlewares ----
app.use(e.json({ limit: "50mb" }));
app.use(e.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// ---- routes ----
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// ---- static frontend (production) ----
const __dirname = path.resolve();
if (process.env.NODE_ENV === "production") {
  app.use(e.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

// ---- start server ----
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log("Server is running on port", PORT);
  connectDB();
});

export { app, server, io };
