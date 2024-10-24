import { sendErrorResponse } from "@/utils/helper";
import { RequestHandler } from "express";

export const isAuthor: RequestHandler = (req, res, next) => {
    if (req.user.role === 'author') {
        next()
    } else {
        return sendErrorResponse({
            status: 403,
            message: 'You are not an author',
            res
        })
    }
}
