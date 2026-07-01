import express from "express";
import { auth } from "../middlewares/auth.middleware.js";
import {
  getPublishedCreations,
  getUserCreations,
  toggleLikeCreation,
} from "../controller/user.controller.js";

const userRouter = express.Router();

userRouter.get("/get-user-creations", auth, getUserCreations);
userRouter.get("/get-published-creations", auth, getPublishedCreations);
userRouter.post("/toggle-like-creation", auth, toggleLikeCreation);

export default userRouter;
