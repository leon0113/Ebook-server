import { model, Model, ObjectId, Schema } from "mongoose";

interface ReviewDoc {
    userId: ObjectId;
    bookId: ObjectId;
    rating: number;
    content?: string
};


const reviewSchema = new Schema<ReviewDoc>({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    bookId: {
        type: Schema.Types.ObjectId,
        ref: "Book",
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    content: {
        type: String,
        trim: true
    }
}, { timestamps: true });



const ReviewModel = model('review', reviewSchema);

export default ReviewModel as Model<ReviewDoc>