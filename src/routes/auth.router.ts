import { generateAuthLink, logoutUser, sendProfileInfo, updateProfile, verifyAuthToken } from "@/controllers/auth.controller";
import { fileParser } from "@/middlewares/file.middleware";
import { isAuth } from "@/middlewares/isAuth.middleware";
import { emailValidationSchema, newUserSchema, validate } from "@/middlewares/validator.middleware";
import { Router } from "express";

const authRouter = Router();

authRouter.post('/generate-link', validate(emailValidationSchema), generateAuthLink);
authRouter.get('/verify', verifyAuthToken);
authRouter.get('/profile', isAuth, sendProfileInfo);
authRouter.post('/logout', isAuth, logoutUser);
authRouter.put('/profile', isAuth, fileParser, validate(newUserSchema), updateProfile);

export default authRouter;