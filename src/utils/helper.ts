import { UserDoc } from "@/models/user.model";
import { Response } from "express";

type ErrorMessageProp = {
    status: number;
    message: string;
    res: Response;
};

export const sendErrorResponse = ({ status, message, res }: ErrorMessageProp) => {
    res.status(status).json({ message })
}


export const FormatUserProfile = (user: UserDoc) => {
    return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
    }
}