import { getAuthorDetails, registerAuthor, updateAuthor } from "@/controllers/author.controller";
import { isAuth } from "@/middlewares/isAuth.middleware";
import { isAuthor } from "@/middlewares/isAuthor.middleware";
import { newAuthorSchema, validate } from "@/middlewares/validator.middleware";
import { Router } from "express";

const authorRouter = Router();

authorRouter.post('/register', isAuth, validate(newAuthorSchema), registerAuthor);
authorRouter.patch('/', isAuth, isAuthor, validate(newAuthorSchema), updateAuthor);
authorRouter.get('/:id', getAuthorDetails)

export default authorRouter;