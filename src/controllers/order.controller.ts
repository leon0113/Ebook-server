import { BookDoc } from "@/models/books.model";
import OrderModel from "@/models/order.model";
import UserModel from "@/models/user.model";
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
    }>("orderItems.id");

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
}

