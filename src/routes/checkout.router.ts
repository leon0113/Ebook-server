import { checkoutHandler } from "@/controllers/checkout.controller";
import { isAuth } from "@/middlewares/isAuth.middleware";
import { Router } from "express";

const checkoutRouter = Router();

checkoutRouter.post('/', isAuth, checkoutHandler)

export default checkoutRouter;