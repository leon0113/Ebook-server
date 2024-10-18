import { authorReqBody } from "@/types";
import { RequestHandler } from "express";

export const registerAuthor: RequestHandler<{}, {}, authorReqBody> = (req, res) => {
    req.body
}