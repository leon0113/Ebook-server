import UserModel from '@/models/user.model';
import { newReviewReqHandler } from './../types';
import { RequestHandler } from "express";
import { sendErrorResponse } from '@/utils/helper';

export const isBookPurchasedByThisUser: RequestHandler<{}, {}, newReviewReqHandler> = async (req, res, next) => {
    const user = await UserModel.findOne({ _id: req.user.id, books: req.body.bookId });
    if (!user) {
        return sendErrorResponse({
            res,
            status: 403,
            message: 'Sorry you are not allowed for this action'
        })
    }

    next();
}