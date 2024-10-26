import { z } from "zod";
import { newAuthorSchema, newBookSchema, newReviewSchema, updateBookSchema } from "./middlewares/validator.middleware";


export type authorReqBody = z.infer<typeof newAuthorSchema>
export type createBookReqHandler = z.infer<typeof newBookSchema>
export type updateBookReqHandler = z.infer<typeof updateBookSchema>
export type newReviewReqHandler = z.infer<typeof newReviewSchema>