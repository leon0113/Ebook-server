import { generateAuthLink } from "@/controllers/auth.controller";
import { emailValidationSchema, validate } from "@/middlewares/validator.middleware";
import { Router } from "express";

const authRouter = Router();

authRouter.post('/generate-link', validate(emailValidationSchema), generateAuthLink)

export default authRouter;