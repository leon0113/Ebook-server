import { addReview } from "@/controllers/review.controller";
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

export default reviewRouter;