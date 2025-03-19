import { Request, Response } from 'express';
import StudentService, { ICreateStudentDTO, IUpdateStudentDTO } from '../services/studentService';

class StudentController {
  /**
   * Thêm sinh viên mới
   * @param req Request
   * @param res Response
   */
  async addStudent(req: Request, res: Response): Promise<void> {
    try {
      const student = req.body as ICreateStudentDTO;
      const result = await StudentService.addStudent(student);
      res.status(200).json({ message: 'Student added successfully', data: result });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Xóa sinh viên theo mã số
   * @param req Request
   * @param res Response
   */
  async deleteStudent(req: Request, res: Response): Promise<void> {
    try {
      const studentId = req.params.studentId;
      await StudentService.deleteStudent(studentId);
      res.status(200).json({ message: 'Student deleted successfully' });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Cập nhật thông tin sinh viên
   * @param req Request
   * @param res Response
   */
  async updateStudent(req: Request, res: Response): Promise<void> {
    try {
      const studentId = req.params.studentId;
      const updateData = req.body as IUpdateStudentDTO;
      const result = await StudentService.updateStudent(studentId, updateData);
      res.status(200).json({ message: 'Student updated successfully', data: result });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Tìm kiếm sinh viên
   * @param req Request
   * @param res Response
   */
  async searchStudent(req: Request, res: Response): Promise<void> {
    try {
      const searchTerm = (req.query.searchTerm as string) || req.params.studentId;
      const result = await StudentService.searchStudent(searchTerm);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Lấy danh sách tất cả sinh viên
   * @param req Request
   * @param res Response
   */
  async getAllStudent(req: Request, res: Response): Promise<void> {
    try {
      const result = await StudentService.getAllStudent();
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}

export default new StudentController();