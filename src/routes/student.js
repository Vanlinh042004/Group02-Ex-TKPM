const express = require('express');
const router = express.Router();

const StudentController = require('../controllers/StudentController');

router.post('/add', StudentController.addStudent);
router.delete('/delete/:studentId', StudentController.deleteStudent);

module.exports = router;