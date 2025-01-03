import { Model, model, ObjectId, Schema } from "mongoose";

interface AuthorDoc {
    userId: ObjectId;
    name: string;
    about: string;
    slug: string;
    socialLinks: string[];
    books: ObjectId[];
}


const authorSchema = new Schema<AuthorDoc>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    about: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        unique: true
    },
    socialLinks: {
        type: [
            {
                id: {
                    type: String,
                    required: true
                },
                value: {
                    type: String,
                    required: true
                }
            }
        ]
    },
    books: [
        {
            type: Schema.Types.ObjectId,
            ref: "Book",
        },
    ],
}, {
    timestamps: true,
});



const AuthorModel = model('Author', authorSchema);

export default AuthorModel as Model<AuthorDoc>