import { getAuthorDetails, registerAuthor } from "@/controllers/author.controller";
import { isAuth } from "@/middlewares/isAuth.middleware";
import { newAuthorSchema, validate } from "@/middlewares/validator.middleware";
import { Router } from "express";

const authorRouter = Router();

authorRouter.post('/register', isAuth, validate(newAuthorSchema), registerAuthor);
authorRouter.get('/:slug', getAuthorDetails)

export default authorRouter;