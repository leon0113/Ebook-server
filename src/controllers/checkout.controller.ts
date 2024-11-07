import { BookDoc } from "@/models/books.model";
import CartModel from "@/models/cart.model";
import { sendErrorResponse } from "@/utils/helper";
import { RequestHandler } from "express";
import { isValidObjectId } from "mongoose";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-10-28.acacia'
});

export const checkoutHandler: RequestHandler = async (req, res) => {
    const { cartId } = req.body;
    if (isValidObjectId(cartId)) {
        return sendErrorResponse({
            res,
            status: 401,
            message: "Invalid cart id",
        })
    };

    const cart = await CartModel.findById(cartId).populate<{ items: { product: BookDoc, quantity: number }[] }>({
        path: 'items.product'
    });

    if (!cart) {
        return sendErrorResponse({
            res,
            status: 404,
            message: "cart not found",
        })
    };

    stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        success_url: process.env.PAYMENT_SUCCESS_URL,
        cancel_url: process.env.PAYMENT_CANCEL_URL,
        line_items: cart.items.map(({ product, quantity }) => {
            const images = product.cover ? { images: [product.cover.url] } : {};
            return {
                quantity,
                price_data: {
                    currency: 'usd',
                    unit_amount: product.price.sale,
                    product_data: {
                        name: product.title,
                        ...images
                    }
                }
            }
        })
    })
}
