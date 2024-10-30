import BookModel from "@/models/books.model";
import UserModel from "@/models/user.model";
import { sendErrorResponse } from "@/utils/helper";
import { RequestHandler } from "express";

export const isValidReadingRequest: RequestHandler = async (req, res, next) => {
    const url = req.url;

    const regex = new RegExp("/([^/?]+.epub)");
    const regexMatch = url.match(regex);

    if (!regexMatch) {
        return sendErrorResponse({
            res,
            status: 403,
            message: "Invalid request"
        })
    }
    const bookFileId = regexMatch[1];

    const book = await BookModel.findOne({ "fileInfo.id": bookFileId });

    if (!book) {
        return sendErrorResponse({
            res,
            status: 403,
            message: "Invalid request"
        })
    }

    const user = await UserModel.findOne({ _id: req.user.id, books: book._id });
    if (!user) {
        return sendErrorResponse({
            res,
            status: 403,
            message: "Unauthorized request!"
        })
    }

    next();
}
