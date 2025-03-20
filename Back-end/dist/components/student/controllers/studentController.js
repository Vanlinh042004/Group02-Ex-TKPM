"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const studentService_1 = __importDefault(require("../services/studentService"));
class StudentController {
    /**
     * Thêm sinh viên mới
     * @param req Request
     * @param res Response
     */
    addStudent(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const student = req.body;
                const result = yield studentService_1.default.addStudent(student);
                res.status(200).json({ message: 'Student added successfully', data: result });
            }
            catch (error) {
                res.status(400).json({ message: error.message });
            }
        });
    }
    /**
     * Xóa sinh viên theo mã số
     * @param req Request
     * @param res Response
     */
    deleteStudent(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const studentId = req.params.studentId;
                yield studentService_1.default.deleteStudent(studentId);
                res.status(200).json({ message: 'Student deleted successfully' });
            }
            catch (error) {
                res.status(400).json({ message: error.message });
            }
        });
    }
    /**
     * Cập nhật thông tin sinh viên
     * @param req Request
     * @param res Response
     */
    updateStudent(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const studentId = req.params.studentId;
                const updateData = req.body;
                const result = yield studentService_1.default.updateStudent(studentId, updateData);
                res.status(200).json({ message: 'Student updated successfully', data: result });
            }
            catch (error) {
                res.status(400).json({ message: error.message });
            }
        });
    }
    /**
     * Tìm kiếm sinh viên
     * @param req Request
     * @param res Response
     */
    searchStudent(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const searchParams = {
                    studentId: req.query.studentId,
                    fullName: req.query.fullName,
                    faculty: req.query.faculty
                };
                const hasSearchParams = Object.values(searchParams).some(param => param !== undefined);
                if (!hasSearchParams) {
                    res.status(400).json({ message: 'At least one search parameter is required' });
                    return;
                }
                const result = yield studentService_1.default.searchStudent(searchParams);
                // Trả về kết quả, nếu không tìm thấy sinh viên nào
                if (result.length === 0) {
                    res.status(404).json({ message: 'No students found', data: [] });
                }
                else {
                    res.status(200).json(result);
                }
            }
            catch (error) {
                res.status(400).json({ message: error.message });
            }
        });
    }
    /**
     * Lấy danh sách tất cả sinh viên
     * @param req Request
     * @param res Response
     */
    getAllStudent(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield studentService_1.default.getAllStudent();
                res.status(200).json(result);
            }
            catch (error) {
                res.status(400).json({ message: error.message });
            }
        });
    }
}
exports.default = new StudentController();
//# sourceMappingURL=studentController.js.map