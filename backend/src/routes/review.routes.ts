import { Router } from "express";
import { ReviewController } from "../controllers/review.controller";

const router = Router();

router.post("/reviews", ReviewController.createReview);
router.get("/reviews/game/:gameId", ReviewController.getReviewsByGameId);
router.get("/reviews/user/:userId", ReviewController.getReviewsByUserId);
router.get("/reviews/:id", ReviewController.getReviewById);
router.put("/reviews/:id", ReviewController.updateReview);
router.delete("/reviews/:id", ReviewController.deleteReview);
router.get("/reviews/game/:gameId/average", ReviewController.getAverageRating);

export default router;
