const express = require('express');
const router = express.Router();

const StudentController = require('../controllers/StudentController');

router.post('/add', StudentController.addStudent);
router.delete('/delete/:studentId', StudentController.deleteStudent);
router.patch('/update/:studentId', StudentController.updateStudent);
router.get('/search', StudentController.searchStudents);

module.exports = router;