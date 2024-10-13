import { generateAuthLink, logoutUser, sendProfileInfo, verifyAuthToken } from "@/controllers/auth.controller";
import { isAuth } from "@/middlewares/isAuth.middleware";
import { emailValidationSchema, validate } from "@/middlewares/validator.middleware";
import { Router } from "express";

const authRouter = Router();

authRouter.post('/generate-link', validate(emailValidationSchema), generateAuthLink);
authRouter.get('/verify', verifyAuthToken);
authRouter.get('/profile', isAuth, sendProfileInfo);
authRouter.post('/logout', isAuth, logoutUser);

export default authRouter;