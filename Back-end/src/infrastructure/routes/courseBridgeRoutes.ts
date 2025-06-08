import express, { Request, Response } from 'express';

const router = express.Router();

// Lazy loading to avoid initialization order issues
let courseController: any;

function getController() {
  if (!courseController) {
    const { getCourseController } = require('../di/serviceRegistry');
    courseController = getCourseController();
  }
  return courseController;
}

// Course CRUD endpoints - maintain original API format
// Create course
router.post('/', (req: Request, res: Response) => {
  getController().createCourse(req, res);
});

// Get all courses
router.get('/', (req: Request, res: Response) => {
  getController().getCourses(req, res);
});

// NEW ENDPOINTS MUST BE BEFORE /:id to avoid conflicts
// Search courses by name
router.get('/search', (req: Request, res: Response) => {
  getController().searchCourses(req, res);
});

// Get courses that have specific prerequisite
router.get('/prerequisite/:prerequisiteId', (req: Request, res: Response) => {
  getController().getCoursesWithPrerequisite(req, res);
});

// Get courses by faculty
router.get('/faculty/:facultyId', (req: Request, res: Response) => {
  getController().getCoursesByFaculty(req, res);
});

// Get courses by credits
router.get('/credits/:credits', (req: Request, res: Response) => {
  getController().getCoursesByCredits(req, res);
});

// Validate if course can be deleted
router.get('/:id/validate-deletion', (req: Request, res: Response) => {
  getController().validateDeletion(req, res);
});

// Get course by ID (MUST BE AFTER specific routes)
router.get('/:id', (req: Request, res: Response) => {
  getController().getCourseById(req, res);
});

// Update course
router.put('/:id', (req: Request, res: Response) => {
  getController().updateCourse(req, res);
});

// Delete course (30-minute rule applies)
router.delete('/:id', (req: Request, res: Response) => {
  getController().deleteCourse(req, res);
});

// Deactivate course
router.put('/:id/deactivate', (req: Request, res: Response) => {
  getController().deactivateCourse(req, res);
});

export default router;
