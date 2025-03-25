import express from 'express';
import StudentController from '../controllers/studentController';
import validateStudent from '../middlewares/validateStudent';

const router = express.Router();

// CRUD endpoints
// Add student
router.post('/', validateStudent, StudentController.addStudent);
// Delete student by ID
router.delete('/:studentId', StudentController.deleteStudent);
// Update student by ID
router.patch('/:studentId', validateStudent, StudentController.updateStudent);
// Get all students
router.get('/', StudentController.getAllStudent);

// Additional actions
// Search student by Id, name or faculty
router.get('/search', StudentController.searchStudent);
// Import data from CSV file
router.post('/import', StudentController.importData);
// Export data to CSV file
router.get('/export', StudentController.exportData);

export default router;
