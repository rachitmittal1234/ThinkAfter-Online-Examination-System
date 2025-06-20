import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import { loginUser,registerUser,adminLogin,updateUserProfile,getUserProfile,changeUserPassword,getAllUsers } from "../controllers/userController.js";

const  userRouter = express.Router();

userRouter.post('/register',registerUser)
userRouter.post('/login',loginUser)
userRouter.post('/admin',adminLogin)
userRouter.get('/profile/:userId', getUserProfile);
userRouter.put('/profile/:userId', updateUserProfile);
userRouter.put('/change-password/:userId', changeUserPassword);
userRouter.get('/all',  getAllUsers);

export default userRouter;


