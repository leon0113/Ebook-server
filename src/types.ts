import { z } from "zod";
import { cartItemSchema, historyValidationSchema, newAuthorSchema, newBookSchema, newReviewSchema, updateBookSchema } from "./middlewares/validator.middleware";


export type authorReqBody = z.infer<typeof newAuthorSchema>
export type createBookReqHandler = z.infer<typeof newBookSchema>
export type updateBookReqHandler = z.infer<typeof updateBookSchema>
export type newReviewReqHandler = z.infer<typeof newReviewSchema>
// export type isPurchasedByTheUserReqHandler = z.infer<typeof purchasedByTheUser>
export type bookHistoryReqHandler = z.infer<typeof historyValidationSchema>
export type cartItemsReqHandler = z.infer<typeof cartItemSchema>
