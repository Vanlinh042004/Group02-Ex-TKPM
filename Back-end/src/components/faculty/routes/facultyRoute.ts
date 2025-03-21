import express from 'express';
import FacultyController from '../controllers/facultyController';

const router = express.Router();

router.get('/', FacultyController.getAllFaculties); // Thêm route GET
router.patch('/update/:facultyId', FacultyController.renameFaculty);
router.post('/add', FacultyController.addFaculty);

export default router;
