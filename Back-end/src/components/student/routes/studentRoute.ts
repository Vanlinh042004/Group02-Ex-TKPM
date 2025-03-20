import express from 'express';
import StudentController from '../controllers/studentController';
import validateStudent from '../middlewares/validateStudent';

const router = express.Router();

// Route thêm sinh viên mới
router.post('/add', validateStudent, StudentController.addStudent);

// Route xóa sinh viên theo mã số
router.delete('/delete/:studentId', StudentController.deleteStudent);

// Route cập nhật thông tin sinh viên
router.patch(
  '/update/:studentId',
  validateStudent,
  StudentController.updateStudent
);
// Route tìm kiếm sinh viên theo từ khóa
router.get('/search', StudentController.searchStudent);

// Route lấy danh sách tất cả sinh viên
router.get('/', StudentController.getAllStudent);

// Route import dữ liệu sinh viên từ file
router.post('/import', StudentController.importData);

// Route export dữ liệu sinh viên ra file
router.post('/export', StudentController.exportData);

export default router;
