import express from 'express';
import FacultyController from '../controllers/facultyController';

const router = express.Router();

router.patch('/update/:facultyId', FacultyController.renameFaculty);
router.post('/add', FacultyController.addFaculty);
router.get('/list', FacultyController.getAllFaculties);

export default router;