import { Model, model, ObjectId, Schema } from "mongoose";
import { number } from "zod";

interface cartItem {
    product: ObjectId;
    quantity: number;
};

interface cartDoc {
    userId: ObjectId;
    items: cartItem[];
};


const cartSchema = new Schema<cartDoc>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [
        {
            product: {
                type: Schema.Types.ObjectId,
                ref: 'Book',
                required: true
            },
            quantity: {
                type: Number,
                default: 1
            },

        }
    ]
}, { timestamps: true });


const CartModel = model('Cart', cartSchema);

export default CartModel as Model<cartDoc>;




