import jwt from 'jsonwebtoken';
import { FormatUserProfile, sendErrorResponse } from "@/utils/helper";
import { RequestHandler } from "express";
import UserModel from '@/models/user.model';

declare global {
    namespace Express {
        export interface Request {
            user: {
                id: string;
                name?: string;
                email: string;
                role: 'user' | 'author';
                avatar?: string;
                signedUp: boolean
            }
        }
    }
}

export const isAuth: RequestHandler = async (req, res, next) => {
    const authToken = req.cookies.authToken;

    if (!authToken) {
        return sendErrorResponse({
            message: 'Unauthorized request!',
            status: 401,
            res
        })
    };

    const payload = jwt.verify(authToken, process.env.JWT_SECRET!) as {
        userId: string;
    };

    const user = await UserModel.findById(payload.userId);

    if (!user) {
        return sendErrorResponse({
            message: 'User not found!',
            status: 401,
            res
        })
    };

    req.user = FormatUserProfile(user);

    next();
}
