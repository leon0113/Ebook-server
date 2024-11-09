import BookModel, { BookDoc } from "@/models/books.model";
import CartModel from "@/models/cart.model";
import OrderModel from "@/models/order.model";
import { sanitizeUrl, sendErrorResponse } from "@/utils/helper";
import { stripe } from "@/utils/stripe";
import { RequestHandler } from "express";
import { isValidObjectId, sanitizeFilter } from "mongoose";


export const checkoutHandler: RequestHandler = async (req, res) => {
    try {
        const { cartId } = req.body;

        if (!isValidObjectId(cartId)) {
            return sendErrorResponse({
                res,
                status: 401,
                message: "Invalid cart id",
            })
        };

        const cart = await CartModel.findOne({ _id: cartId, userId: req.user.id }).populate<{ items: { product: BookDoc, quantity: number }[] }>({
            path: 'items.product'
        });

        if (!cart) {
            return sendErrorResponse({
                res,
                status: 404,
                message: "cart not found",
            })
        };

        const newOrder = await OrderModel.create({
            userId: req.user.id,
            orderItems: cart.items.map((item) => {
                return {
                    id: item.product._id,
                    price: item.product.price.sale,
                    quantity: item.quantity,
                    totalPrice: item.product.price.sale * item.quantity
                }
            })
        })

        const customer = await stripe.customers.create({
            name: req.user.name,
            email: req.user.email,
            metadata: {
                userId: req.user.id,
                orderId: newOrder._id.toString(),
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
    } catch (error) {
        console.log(error);
        res.json("Error at purchasing")
    }
}

export const instantCheckoutHandler: RequestHandler = async (req, res) => {
    try {
        const { productId } = req.body;

        if (!isValidObjectId(productId)) {
            return sendErrorResponse({
                res,
                status: 401,
                message: "Invalid product id",
            })
        };

        const product = await BookModel.findById(productId);

        if (!product) {
            return sendErrorResponse({
                res,
                status: 404,
                message: "Product not found",
            })
        };

        const newOrder = await OrderModel.create({
            userId: req.user.id,
            orderItems: [
                {
                    id: product._id,
                    price: product.price.sale,
                    quantity: 1,
                    totalPrice: product.price.sale
                }
            ]
        });


        const customer = await stripe.customers.create({
            name: req.user.name,
            email: req.user.email,
            metadata: {
                userId: req.user.id,
                orderId: newOrder._id.toString(),
                type: 'instant-checkout'
            }
        });

        const images = product.cover ? { images: [sanitizeUrl(product.cover.url)] } : {};

        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],
            success_url: process.env.PAYMENT_SUCCESS_URL,
            cancel_url: process.env.PAYMENT_CANCEL_URL,
            line_items: [{
                quantity: 1,
                price_data: {
                    currency: 'usd',
                    unit_amount: product.price.sale,
                    product_data: {
                        name: product.title,
                        ...images
                    }
                }
            }],
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

    } catch (error) {
        console.log(error);
        res.json("Error at purchasing")
    }
}