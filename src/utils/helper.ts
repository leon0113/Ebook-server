import { Response } from "express";

type ErrorMessageProp = {
    status: number;
    message: string;
    res: Response;
};

export const sendErrorResponse = ({ status, message, res }: ErrorMessageProp) => {
    res.status(status).json({ message })
}