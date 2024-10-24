import { createNewBook, updateBook } from "@/controllers/book.controller";
import { fileParser } from "@/middlewares/file.middleware";
import { isAuth } from "@/middlewares/isAuth.middleware";
import { isAuthor } from "@/middlewares/isAuthor.middleware";
import { newBookSchema, updateBookSchema, validate } from "@/middlewares/validator.middleware";
import { Router } from "express";

const bookRouter = Router();

bookRouter.post('/create', isAuth, isAuthor, fileParser, validate(newBookSchema), createNewBook);
bookRouter.patch('/', isAuth, isAuthor, fileParser, validate(updateBookSchema), updateBook);



export default bookRouter;