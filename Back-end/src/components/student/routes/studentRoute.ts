import express from 'express';
import StudentController from '../controllers/studentController';
import validateStudent from '../middlewares/validateStudent';

const router = express.Router();

router.post('/add', validateStudent, StudentController.addStudent);
router.delete('/delete/:studentId', StudentController.deleteStudent);
router.patch(
  '/update/:studentId',
  validateStudent,
  StudentController.updateStudent
);
router.get('/search', StudentController.searchStudent);
router.get('/list', StudentController.getAllStudent);
//router.patch('/update/')

export default router;