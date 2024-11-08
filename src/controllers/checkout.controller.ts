import { BookDoc } from "@/models/books.model";
import CartModel from "@/models/cart.model";
import { sanitizeUrl, sendErrorResponse } from "@/utils/helper";
import { stripe } from "@/utils/stripe";
import { RequestHandler } from "express";
import { isValidObjectId, sanitizeFilter } from "mongoose";


export const checkoutHandler: RequestHandler = async (req, res) => {
    const { cartId } = req.body;

    if (!isValidObjectId(cartId)) {
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

    const customer = await stripe.customers.create({
        name: req.user.name,
        email: req.user.email,
        metadata: {
            userId: req.user.id,
            cartId,
            type: 'checkout'
        }
    })

    const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        success_url: process.env.PAYMENT_SUCCESS_URL,
        cancel_url: process.env.PAYMENT_CANCEL_URL,
        line_items: cart.items.map(({ product, quantity }) => {
            const images = product.cover ? { images: [sanitizeUrl(product.cover.url)] } : {};
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
        }),
        customer: customer.id
    });

    if (session.url) {
        res.json({ checkoutUrl: session.url })
    } else {
        sendErrorResponse({
            res,
            message: 'Payment failed',
            status: 500
        })
    }
}
