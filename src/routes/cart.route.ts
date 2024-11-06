import { clearCart, getCart, updateCart } from "@/controllers/cart.controller";
import { isAuth } from "@/middlewares/isAuth.middleware";
import { cartItemSchema, validate } from "@/middlewares/validator.middleware";
import { Router } from "express";

const cartRouter = Router();


cartRouter.post('/', isAuth, validate(cartItemSchema), updateCart);
cartRouter.get('/', isAuth, getCart);
cartRouter.post('/clear', isAuth, clearCart);

export default cartRouter;