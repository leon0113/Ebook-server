import { model, Model, Schema, Types } from "mongoose";

export interface BookDoc {
    _id?: Types.ObjectId;
    authorId: Types.ObjectId;
    title: string;
    slug: string;
    description: string;
    language: string;
    publishedAt: Date;
    publicationName: string;
    genre: string;
    averageRating?: number,
    status: "publish" | "unpublish",
    copySold?: number,
    price: {
        mrp: number,
        sale: number
    };
    cover?: {
        id: string,
        url: string
    };
    fileInfo: {
        id: string,
        size: string
    };
};


const bookSchema = new Schema<BookDoc>({
    authorId: {
        type: Schema.Types.ObjectId,
        ref: "Author",
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    language: {
        type: String,
        required: true,
        trim: true
    },
    publicationName: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        trim: true,
        unique: true,
    },
    genre: {
        type: String,
        required: true,
        trim: true
    },
    averageRating: {
        type: Number
    },
    publishedAt: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ["publish", "unpublish"],
        default: "publish"
    },
    copySold: {
        type: Number,
        default: 0
    },
    price: {
        type: Object,
        required: true,
        mrp: {
            type: Number,
            required: true
        },
        sale: {
            type: Number,
            required: true
        }
    },
    cover: {
        url: String,
        id: String
    },
    fileInfo: {
        type: Object,
        required: true,
        id: {
            type: String,
            required: true
        },
        size: {
            type: String,
            required: true
        }
    }
}, { timestamps: true });


bookSchema.pre('save', function (next) {
    const { mrp, sale } = this.price;
    this.price = { mrp: mrp * 100, sale: sale * 100 };
    next();
})


const BookModel = model('Book', bookSchema);

export default BookModel as Model<BookDoc>