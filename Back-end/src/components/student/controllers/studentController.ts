import { Request, Response } from 'express';
import StudentService, { ICreateStudentDTO, IUpdateStudentDTO, IStudentSearchTermsDTO } from '../services/studentService';

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
      const searchParams: IStudentSearchTermsDTO = {
        studentId: req.query.studentId as string,
        fullName: req.query.fullName as string,
        faculty: req.query.faculty as string
      };
      
      const hasSearchParams = Object.values(searchParams).some(param => param !== undefined);
      
      if (!hasSearchParams) {
        res.status(400).json({ message: 'At least one search parameter is required' });
        return;
      }

      const result = await StudentService.searchStudent(searchParams);
      
      // Trả về kết quả, nếu không tìm thấy sinh viên nào
      if (result.length === 0) {
        res.status(404).json({ message: 'No students found', data: [] });
      } else {
        res.status(200).json(result);
      }
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
  //async updateStudentName(req: Request, res: Response): Promise<void> {

}

export default new StudentController();