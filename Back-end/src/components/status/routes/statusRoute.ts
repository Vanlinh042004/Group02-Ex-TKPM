import express from "express";
import StatusController from "../controllers/statusController";

const router = express.Router();

// CRUD endpoints
// Add status
router.post("/", StatusController.addStatus);
// Rename status by ID
router.patch("/:statusId", StatusController.renameStatus);
// Get all statuses
router.get("/", StatusController.getAllStatuses);

export default router;
