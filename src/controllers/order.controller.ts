import BookModel, { BookDoc } from "@/models/books.model";
import OrderModel from "@/models/order.model";
import UserModel from "@/models/user.model";
import { StripeCustomer } from "@/types";
import { sendErrorResponse } from "@/utils/helper";
import { stripe } from "@/utils/stripe";
import { RequestHandler } from "express";
import { isValidObjectId } from "mongoose";

export const getOrders: RequestHandler = async (req, res) => {
    const orders = await OrderModel.find({ userId: req.user.id }).populate<{
        orderItems: {
            id: BookDoc,
            price: number;
            quantity: number;
            totalPrice: number
        }[]
    }>("orderItems.id").sort("-createdAt");

    res.json({
        orders: orders.map(order => {
            return {
                id: order._id,
                stripeCustomerId: order.stripeCustomerId,
                paymentId: order.paymentId,
                totalAmount: order.totalAmount ? (order.totalAmount / 100).toFixed(2) : '00',
                paymentStatus: order.paymentStatus,
                date: order.createdAt,
                orderItems: order.orderItems.map(({ id: book, price, quantity, totalPrice }) => {
                    return {
                        id: book._id,
                        title: book.title,
                        cover: book.cover?.url,
                        slug: book.slug,
                        price: (price / 100).toFixed(2),
                        quantity,
                        totalPrice: (totalPrice / 100).toFixed(2)
                    }
                })
            }
        })
    })
};


export const getOrderStatus: RequestHandler = async (req, res) => {
    const { bookId } = req.params;
    let status = "false";

    if (!isValidObjectId(bookId)) {
        res.json({ status });
        return;
    }

    const user = await UserModel.findOne({ _id: req.user.id, books: bookId });

    if (user) status = "true";

    res.json({ status });
};


export const getOrderSuccessStatus: RequestHandler = async (req, res) => {
    const { sessionId } = req.body;

    if (typeof sessionId !== 'string') {
        return sendErrorResponse({
            res,
            message: 'Invalid session id',
            status: 400
        })
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    let customer: StripeCustomer;
    if (typeof session.customer === 'string') {
        customer = await stripe.customers.retrieve(session.customer) as unknown as StripeCustomer


        const { orderId } = customer!.metadata;

        const order = await OrderModel.findById(orderId).populate<{
            orderItems: {
                id: BookDoc,
                price: number;
                quantity: number;
                totalPrice: number
            }[]
        }>("orderItems.id");

        if (!order) {
            return sendErrorResponse({
                res,
                message: 'Order not found',
                status: 404
            })
        };


        // Update the `copySold` field in the BookModel
        const bulkUpdates = order.orderItems.map(async ({ id: book, quantity }) => {
            if (book && book._id) {
                await BookModel.findByIdAndUpdate(
                    book._id,
                    { $inc: { copySold: quantity / 2 } }, // Increment `copySold` by the quantity
                    { new: true } // Return the updated document
                );
            }
        });

        // Wait for all updates to complete
        await Promise.all(bulkUpdates);

        const data = order.orderItems.map(({ id: book, price, quantity, totalPrice }) => {
            return {
                id: book._id,
                title: book.title,
                cover: book.cover?.url,
                slug: book.slug,
                price: (price / 100).toFixed(2),
                quantity,
                totalPrice: (totalPrice / 100).toFixed(2)
            }
        });


        res.json({ orders: data, totalAmount: order.totalAmount ? (order.totalAmount / 100).toFixed(2) : '00' });
        return;
    };

    sendErrorResponse({
        res,
        message: 'Something went wrong',
        status: 500
    })
}

