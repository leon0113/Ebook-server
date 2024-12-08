import { BookDoc } from "@/models/books.model";
import { UserDoc } from "@/models/user.model";
import { Request, Response } from "express";

type ErrorMessageProp = {
    status: number;
    message: string;
    res: Response;
};

export const sendErrorResponse = ({ status, message, res }: ErrorMessageProp) => {
    res.status(status).json({ message })
}


export const FormatUserProfile = (user: UserDoc): Request['user'] => {
    return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar?.url,
        signedUp: user.signedUp,
        authorId: user?.authorId?.toString(),
        books: user.books.map(book => book.toString())
    }
};

interface FormattedBooks {
    id: string;
    title: string;
    genre: string;
    slug: string;
    cover?: string;
    rating?: string;
    price: {
        mrp: string;
        sale: string;
    };
    sold?: number
}


export const formatBook = (book: BookDoc): FormattedBooks => {

    const {
        _id,
        title,
        cover,
        averageRating,
        slug,
        genre,
        price: { mrp, sale },
        copySold
    } = book;


    return {
        id: _id?.toString() || '',
        title,
        cover: cover?.url,
        slug,
        genre,
        rating: averageRating?.toFixed(1),
        price: {
            mrp: (mrp / 100).toFixed(2),
            sale: (sale / 100).toFixed(2),
        },
        sold: copySold
    };

};


export function formatFileSize(bytes: number) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};


export function sanitizeUrl(url: string) {
    return url.replace(/ /g, "%20")
};


export const generateS3ClientPublicUrl = (bucketName: string, uniqueFileName: string): string => {
    return `https://${bucketName}.s3.amazonaws.com/${uniqueFileName}`
};


