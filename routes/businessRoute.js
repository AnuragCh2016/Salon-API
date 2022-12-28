import express from "express";
import { Business } from "../models/Business.js";
import { BusinessController } from "../controllers/businessController.js";

const router = express.Router();

router.get("/", BusinessController.searchBusinesses);
router.post("/create", BusinessController.insertBusinesses);
router.get("/:businessId/services", BusinessController.listServices);
router.get("/:businessId/timeslots", BusinessController.listTimeSlots);
router.get("/:businessId/report", BusinessController.generateReport);

export default router;