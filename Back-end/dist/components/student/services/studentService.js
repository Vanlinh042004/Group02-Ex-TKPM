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
const Student_1 = __importDefault(require("../models/Student"));
const Faculty_1 = __importDefault(require("../../faculty/models/Faculty"));
const program_1 = __importDefault(require("../../program/models/program"));
const mongoose_1 = __importDefault(require("mongoose"));
class StudentService {
    /**
     * Thêm sinh viên mới
     * @param student Thông tin sinh viên cần thêm
     * @returns Promise<IStudent> Thông tin sinh viên đã được lưu
     */
    addStudent(student) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { studentId, fullName, dateOfBirth, gender, nationality, faculty, course, program, permanentAddress, temporaryAddress, mailingAddress, identityDocument, email, phone, status, } = student;
                // Kiểm tra các trường bắt buộc
                if (!studentId ||
                    !fullName ||
                    !dateOfBirth ||
                    !gender ||
                    !faculty ||
                    !course ||
                    !program ||
                    !mailingAddress ||
                    !mailingAddress.country ||
                    !identityDocument ||
                    !identityDocument.number ||
                    !email ||
                    !phone ||
                    !status) {
                    throw new Error('Missing required fields');
                }
                // Kiểm tra sinh viên đã tồn tại
                const existingStudent = yield Student_1.default.findOne({ studentId });
                if (existingStudent) {
                    throw new Error('Student already exists');
                }
                // Tìm faculty bằng tên hoặc ID
                let facultyDoc;
                if (mongoose_1.default.Types.ObjectId.isValid(faculty)) {
                    facultyDoc = yield Faculty_1.default.findById(faculty);
                }
                else {
                    facultyDoc = yield Faculty_1.default.findOne({ name: faculty });
                }
                if (!facultyDoc) {
                    throw new Error('Faculty not found');
                }
                // Tìm program bằng tên hoặc ID
                let programDoc;
                if (mongoose_1.default.Types.ObjectId.isValid(program)) {
                    programDoc = yield program_1.default.findById(program);
                }
                else {
                    programDoc = yield program_1.default.findOne({ name: program });
                }
                if (!programDoc) {
                    throw new Error('Program not found');
                }
                // Tạo sinh viên mới
                const newStudent = new Student_1.default({
                    studentId,
                    fullName,
                    dateOfBirth,
                    gender,
                    nationality: nationality || 'Việt Nam',
                    faculty: facultyDoc._id,
                    course,
                    program: programDoc._id,
                    permanentAddress,
                    temporaryAddress,
                    mailingAddress,
                    identityDocument,
                    email,
                    phone,
                    status,
                });
                return yield newStudent.save();
            }
            catch (error) {
                console.log('Error adding student: ', error);
                throw error;
            }
        });
    }
    /**
     * Xóa sinh viên theo mã số
     * @param studentId Mã số sinh viên
     */
    deleteStudent(studentId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield Student_1.default.findOneAndDelete({ studentId });
                if (!result) {
                    throw new Error('Student not found');
                }
            }
            catch (error) {
                console.log('Error deleting student: ', error);
                throw error;
            }
        });
    }
    /**
     * Cập nhật thông tin sinh viên
     * @param studentId Mã số sinh viên
     * @param updateData Dữ liệu cần cập nhật
     * @returns Promise<IStudent> Thông tin sinh viên sau khi cập nhật
     */
    updateStudent(studentId, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!studentId || !updateData) {
                    throw new Error('Missing required fields');
                }
                // Nếu update faculty, kiểm tra và chuyển đổi thành faculty ID
                if (updateData.faculty) {
                    let facultyDoc;
                    if (mongoose_1.default.Types.ObjectId.isValid(updateData.faculty)) {
                        facultyDoc = yield Faculty_1.default.findById(updateData.faculty);
                    }
                    else {
                        facultyDoc = yield Faculty_1.default.findOne({ name: updateData.faculty });
                    }
                    if (!facultyDoc) {
                        throw new Error('Faculty not found');
                    }
                    // Thay thế tên faculty bằng faculty ID
                    updateData.faculty = facultyDoc._id.toString();
                }
                const result = yield Student_1.default.findOneAndUpdate({ studentId }, updateData, {
                    new: true,
                });
                if (!result) {
                    throw new Error('Student not found');
                }
                return result;
            }
            catch (error) {
                console.log('Error updating student: ', error);
                throw error;
            }
        });
    }
    /**
     * Tìm kiếm sinh viên theo từ khóa
     * @param searchTerm Từ khóa tìm kiếm
     * @returns Promise<IStudent[]> Danh sách sinh viên phù hợp
     */
    searchStudent(searchParams) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Kiểm tra nếu không có bất kỳ tham số tìm kiếm nào
                if (!searchParams.studentId && !searchParams.fullName && !searchParams.faculty) {
                    return [];
                }
                // Xây dựng điều kiện tìm kiếm
                const searchConditions = [];
                // Tìm kiếm theo mã sinh viên
                if (searchParams.studentId) {
                    searchConditions.push({
                        studentId: searchParams.studentId.toString()
                    });
                }
                // Tìm kiếm theo tên
                if (searchParams.fullName) {
                    searchConditions.push({
                        fullName: { $regex: searchParams.fullName.toString(), $options: 'i' }
                    });
                }
                // Tìm kiếm theo khoa
                if (searchParams.faculty) {
                    // Tìm ID của khoa
                    const faculty = yield Faculty_1.default.findOne({
                        name: { $regex: searchParams.faculty.toString(), $options: 'i' }
                    });
                    if (faculty) {
                        searchConditions.push({ faculty: faculty._id });
                    }
                    else {
                        // Nếu không tìm thấy khoa, trả về mảng rỗng
                        return [];
                    }
                }
                // Thực hiện tìm kiếm
                const result = yield Student_1.default.find({
                    $and: searchConditions
                }).populate('faculty');
                return result;
            }
            catch (error) {
                console.log('Error searching students: ', error);
                throw error;
            }
        });
    }
    /**
     * Lấy danh sách tất cả sinh viên
     * @returns Promise<IStudent[]> Danh sách tất cả sinh viên
     */
    getAllStudent() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield Student_1.default.find({}).populate('faculty').populate('program');
                return result;
            }
            catch (error) {
                console.log('Error retrieving all students: ', error);
                throw error;
            }
        });
    }
}
exports.default = new StudentService();
//# sourceMappingURL=studentService.js.map