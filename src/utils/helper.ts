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


export function formatFileSize(bytes: number) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};


export function sanitizeUrl(url: string) {
    return url.replace(/ /g, "%20")
}