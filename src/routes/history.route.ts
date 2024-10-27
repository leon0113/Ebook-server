import { updateBookHistory } from "@/controllers/history.controller";
import { isAuth } from "@/middlewares/isAuth.middleware";
import { historyValidationSchema, validate } from "@/middlewares/validator.middleware";
import { Router } from "express";

const historyRouter = Router();

historyRouter.post('/', isAuth, validate(historyValidationSchema), updateBookHistory)

export default historyRouter;