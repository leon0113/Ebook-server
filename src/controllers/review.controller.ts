import ReviewModel from "@/models/review.model";
import { newReviewReqHandler } from "@/types";
import { sendErrorResponse } from "@/utils/helper";
import { RequestHandler } from "express";
import { isValidObjectId } from "mongoose";

export const addReview: RequestHandler<{}, {}, newReviewReqHandler> = async (req, res) => {
    const { bookId, rating, content } = req.body;

    await ReviewModel.findOneAndUpdate({ bookId: bookId, userId: req.user.id }, {
        rating: rating, content: content
    }, { upsert: true });

    res.json({ message: "Review added" })
};



export const getReview: RequestHandler = async (req, res) => {
    const { bookId } = req.params;

    if (!isValidObjectId(bookId)) {
        return sendErrorResponse({
            res,
            status: 422,
            message: "Book not available"
        })
    }

    const review = await ReviewModel.findOne({ bookId: bookId, userId: req.user.id });

    if (!review) {
        return sendErrorResponse({
            res,
            status: 404,
            message: "Review not available"
        })
    }


    res.json({
        rating: review.rating,
        content: review.content
    })
}