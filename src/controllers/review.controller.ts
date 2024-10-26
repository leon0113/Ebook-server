import ReviewModel from "@/models/review.model";
import { newReviewReqHandler } from "@/types";
import { RequestHandler } from "express";

export const addReview: RequestHandler<{}, {}, newReviewReqHandler> = async (req, res) => {
    const { bookId, rating, content } = req.body;

    await ReviewModel.findOneAndUpdate({ bookId: bookId, userId: req.user.id }, {
        rating: rating, content: content
    }, { upsert: true });

    res.json({ message: "Review added" })
}