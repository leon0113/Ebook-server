import { addReview, getPublicReview, getReview } from "@/controllers/review.controller";
import { isAuth } from "@/middlewares/isAuth.middleware";
import { isBookPurchasedByThisUser } from "@/middlewares/isBookPurchasedByThisUser.middleware";
import { newReviewSchema, validate } from "@/middlewares/validator.middleware";
import { Router } from "express";

const reviewRouter = Router();

reviewRouter.post('/',
    isAuth,
    validate(newReviewSchema),
    isBookPurchasedByThisUser,
    addReview
)

reviewRouter.get('/:bookId', isAuth, getReview);
reviewRouter.get('/library/:bookId', getPublicReview)

export default reviewRouter;