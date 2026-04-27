import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";

dotenv.config();

// ✅ CREATE APP FIRST
const app = express();

// ✅ MIDDLEWARE
app.use(cors({ origin: "*" }));
app.use(express.json());

// ✅ ROUTES (AFTER app is created)
app.use("/api/auth", authRoutes);

// ✅ TEST ROUTE
app.get("/", (req, res) => {
  res.send("RecallAI Backend Running 🚀");
});

// ✅ DB CONNECTION
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("Mongo error:", err.message));

// ✅ START SERVER
app.listen(5000, () => {
  console.log("Server running on port 5000");
});