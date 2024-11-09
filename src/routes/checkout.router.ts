import { checkoutHandler, instantCheckoutHandler } from "@/controllers/checkout.controller";
import { isAuth } from "@/middlewares/isAuth.middleware";
import { Router } from "express";

const checkoutRouter = Router();

checkoutRouter.post('/', isAuth, checkoutHandler)
checkoutRouter.post('/instant', isAuth, instantCheckoutHandler)

export default checkoutRouter;