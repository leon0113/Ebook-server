import { updateBookHistory } from "@/controllers/history.controller";
import { isAuth } from "@/middlewares/isAuth.middleware";
import { Router } from "express";

const historyRouter = Router();

historyRouter.post('/', isAuth, updateBookHistory)

export default historyRouter;