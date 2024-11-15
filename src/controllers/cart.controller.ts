import { ObjectId } from 'mongoose';
import CartModel from "@/models/cart.model";
import { cartItemsReqHandler } from "@/types";
import { RequestHandler } from "express";
import { sendErrorResponse } from '@/utils/helper';

interface getCartDetails {
    items: {
        product: {
            _id: ObjectId;
            title: string;
            cover?: {
                url: string;
                id: string
            };
            price: {
                mrp: number;
                sale: number
            };
            slug: string;
        };
        quantity: number;
    }[]
}


export const updateCart: RequestHandler<{}, {}, cartItemsReqHandler> = async (req, res) => {
    const { items } = req.body;

    let cart = await CartModel.findOne({ userId: req.user.id });

    if (!cart) {
        cart = await CartModel.create({ userId: req.user.id, items });
    } else {
        for (const item of items) {
            const oldProduct = cart.items.find((p) => item.product === p.product.toString());
            if (oldProduct) {
                oldProduct.quantity += item.quantity;
                // if the quantity is 0 or less then remove the product from the cart
                if (oldProduct.quantity <= 0) {
                    cart.items = cart.items.filter(({ product }) => oldProduct.product !== product);
                }
            } else {
                cart.items.push({
                    product: item.product as any,
                    quantity: item.quantity
                });
            }
        }
    };

    await cart.save();

    res.json({ cart: cart._id })
};


export const getCart: RequestHandler = async (req, res) => {
    const cart = await CartModel.findOne({ userId: req.user.id }).populate<getCartDetails>({
        path: "items.product",
        select: "title cover slug price"
    });

    if (!cart) {
        return sendErrorResponse({
            res,
            status: 404,
            message: "Cart not found",
        })
    }

    res.json({
        cart: {
            id: cart._id,
            items: cart.items.map((item) => ({
                product: {
                    id: item.product._id,
                    title: item.product.title,
                    cover: item.product.cover,
                    slug: item.product.slug,
                    price: {
                        mrp: (item.product.price.mrp / 100).toFixed(2),
                        sale: (item.product.price.sale / 100).toFixed(2)
                    }
                },
                quantity: item.quantity
            }))
        }
    })
};


export const clearCart: RequestHandler = async (req, res) => {
    await CartModel.findOneAndUpdate({ userId: req.user.id }, { items: [] });
    res.json({ message: "Cart cleared" });
}