import express from "express";
import FacultyController from "../controllers/facultyController";

const router = express.Router();

// CRUD endpoints
// Add faculty
router.post("/", FacultyController.addFaculty);
// Rename faculty by ID
router.patch("/:facultyId", FacultyController.renameFaculty);
// Get all faculties
router.get("/", FacultyController.getAllFaculties);

export default router;
