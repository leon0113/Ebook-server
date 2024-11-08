import { Model, model, ObjectId, Schema } from "mongoose";

interface OrderItem {
    id: ObjectId;
    price: number;
    quantity: number;
    totalPrice: number
}

interface OrderDoc {
    userId: ObjectId;
    stripeCustomerId?: string;
    paymentId?: string;
    totalAmount?: number;
    paymentStatus?: string;
    paymentErrorMessage?: string;
    orderItems: OrderItem[];
    createAt: Date
}

const orderSchema = new Schema<OrderDoc>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    stripeCustomerId: {
        type: String,
    },
    paymentId: {
        type: String,
    },
    totalAmount: {
        type: Number,
    },
    paymentStatus: {
        type: String,
    },
    paymentErrorMessage: {
        type: String
    },
    orderItems: [
        {
            id: {
                type: Schema.Types.ObjectId,
                ref: 'Book',
                required: true
            },
            price: {
                type: Number,
                required: true
            },
            quantity: {
                type: Number,
                required: true
            },
            totalPrice: {
                type: Number,
                required: true
            },

        }
    ]
}, { timestamps: true });


const OrderModel = model("Order", orderSchema);

export default OrderModel as Model<OrderDoc>