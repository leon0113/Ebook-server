import { getOrders, getOrderStatus } from "@/controllers/order.controller";
import { isAuth } from "@/middlewares/isAuth.middleware";
import { Router } from "express";

const orderRouter = Router();

orderRouter.get('/', isAuth, getOrders);
orderRouter.get('/check-status/:bookId', isAuth, getOrderStatus);

export default orderRouter;