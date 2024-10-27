import { Model, model, ObjectId, Schema } from "mongoose";

interface HistoryDoc {
    bookId: ObjectId;
    userId: ObjectId;
    lastLocationBook: string;
    highlights: {
        selection: string;
        fill: string;
    }[]
};


const historySchema = new Schema<HistoryDoc>({
    bookId: {
        type: Schema.ObjectId,
        ref: 'Book',
        required: true
    },
    userId: {
        type: Schema.ObjectId,
        ref: 'User',
        required: true
    },
    lastLocationBook: String,
    highlights: [
        {
            selection: String,
            fill: String,
        }
    ]
}, { timestamps: true });


const HistoryModel = model('History', historySchema);

export default HistoryModel as Model<HistoryDoc>