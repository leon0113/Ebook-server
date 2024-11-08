import { sendErrorResponse } from "@/utils/helper";
import { stripe } from "@/utils/stripe";
import { RequestHandler } from "express";

export const handlePayment: RequestHandler = (req, res) => {
    const sig = req.headers["stripe-signature"];

    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig!, endpointSecret);
    } catch (err) {
        return sendErrorResponse({
            res,
            message: "Could not complete payment!",
            status: 400,
        });
    }

    console.log("EVENT:::::::::::::::::::::::::::::", event);

    res.send();
};