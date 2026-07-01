import express from "express";
import cors from "cors";
import "dotenv/config";
import { clerkMiddleware, requireAuth } from "@clerk/express";
import aiRouter from "./src/routes/ai.routes.js";
import connectCloudinary from "./src/config/cloudinary.js";
import userRouter from "./src/routes/user.routes.js";

const app = express();

await connectCloudinary();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(clerkMiddleware());

app.get("/", (req, res) => res.send("Server is Live!"));

app.use("/api", requireAuth());
app.use("/api/ai", aiRouter);
app.use("/api/user", userRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(
    `Server is running on port ${PORT} => http://localhost:${PORT} 🍽️`
  );
});
