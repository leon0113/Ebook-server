import { handlePayment } from "@/controllers/payment.controller";
import express, { Router } from "express";

const webhookRouter = Router();

// webhookRouter.post('/', express.raw({ type: 'application/json' }), handlePayment)
webhookRouter.post(
    "/",
    express.raw({ type: "application/json" }),
    handlePayment
);

export default webhookRouter;