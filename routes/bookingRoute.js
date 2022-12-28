import express from "express";
import { BookingController } from "../controllers/bookingController.js";

const router = express.Router();

router.post("/:businessId/book", BookingController.bookService);
router.delete("/:bookingId/cancel", BookingController.cancelBooking);

export default router;
