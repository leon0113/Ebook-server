import { getOrders } from "@/controllers/order.controller";
import { isAuth } from "@/middlewares/isAuth.middleware";
import { Router } from "express";

const orderRouter = Router();

orderRouter.get('/', isAuth, getOrders)

export default orderRouter;