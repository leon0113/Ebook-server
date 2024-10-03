import { generateAuthLink, verifyAuthToken } from "@/controllers/auth.controller";
import { emailValidationSchema, validate } from "@/middlewares/validator.middleware";
import { Router } from "express";

const authRouter = Router();

authRouter.post('/generate-link', validate(emailValidationSchema), generateAuthLink);
authRouter.get('/verify', verifyAuthToken);

export default authRouter;