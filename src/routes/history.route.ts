import { getBookHistory, updateBookHistory } from "@/controllers/history.controller";
import { isAuth } from "@/middlewares/isAuth.middleware";
import { isBookPurchasedByThisUser } from "@/middlewares/isBookPurchasedByThisUser.middleware";
import { historyValidationSchema, validate } from "@/middlewares/validator.middleware";
import { Router } from "express";

const historyRouter = Router();

historyRouter.post('/', isAuth, validate(historyValidationSchema), isBookPurchasedByThisUser, updateBookHistory);

historyRouter.get('/:bookId', isAuth, getBookHistory);

export default historyRouter;