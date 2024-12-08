import BookModel from "@/models/books.model";
import { formatBook, sendErrorResponse } from "@/utils/helper";
import { RequestHandler } from "express";

export const searchBooks: RequestHandler = async (req, res) => {
    const { title } = req.query;

    if (typeof title !== 'string') {
        return sendErrorResponse({
            res,
            status: 422,
            message: 'Invalid search query',
        })
    };
    if (title.trim().length < 3) {
        return sendErrorResponse({
            res,
            status: 422,
            message: 'Search query is too short',
        })
    };

    const results = await BookModel.find({
        title: {
            $regex: title,
            $options: 'i'
        }
    });

    res.json({
        results: results.map((book) => formatBook(book))
    })

};