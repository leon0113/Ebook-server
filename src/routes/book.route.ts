import { createNewBook, getAllPurchasedBooks, getBooksByGenre, getBooksPublicDetails, updateBook } from "@/controllers/book.controller";
import { fileParser } from "@/middlewares/file.middleware";
import { isAuth } from "@/middlewares/isAuth.middleware";
import { isAuthor } from "@/middlewares/isAuthor.middleware";
import { newBookSchema, updateBookSchema, validate } from "@/middlewares/validator.middleware";
import { Router } from "express";

const bookRouter = Router(); // '/book'

bookRouter.post('/create', isAuth, isAuthor, fileParser, validate(newBookSchema), createNewBook);
bookRouter.patch('/', isAuth, isAuthor, fileParser, validate(updateBookSchema), updateBook);
bookRouter.get('/library', isAuth, getAllPurchasedBooks);
bookRouter.get('/details/:slug', getBooksPublicDetails);
bookRouter.get('/by-genre/:genre', getBooksByGenre);



export default bookRouter;