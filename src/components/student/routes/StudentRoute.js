const express = require('express');
const router = express.Router();

const StudentController = require('../controllers/StudentController');

const validateStudent = require('../middlewares/validateStudent');

router.post('/add', validateStudent, StudentController.addStudent);
router.delete('/delete/:studentId', StudentController.deleteStudent);
router.patch(
  '/update/:studentId',
  validateStudent,
  StudentController.updateStudent
);
router.get('/search', StudentController.searchStudent);
router.get('/list', StudentController.getAllStudent);
module.exports = router;
