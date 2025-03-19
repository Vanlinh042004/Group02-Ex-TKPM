import Student, { IStudent } from '../models/Student';

// Interface cho dữ liệu tạo student mới
export interface ICreateStudentDTO {
  studentId: string;
  fullName: string;
  dateOfBirth: Date | string;
  gender: string;
  faculty: string;
  course: string;
  program: string;
  address: string;
  email: string;
  phone: string;
  status: string;
}

// Interface cho dữ liệu cập nhật student
export interface IUpdateStudentDTO extends Partial<ICreateStudentDTO> {}

class StudentService {
  /**
   * Thêm sinh viên mới
   * @param student Thông tin sinh viên cần thêm
   * @returns Promise<IStudent> Thông tin sinh viên đã được lưu
   */
  async addStudent(student: ICreateStudentDTO): Promise<IStudent> {
    try {
      const {
        studentId,
        fullName,
        dateOfBirth,
        gender,
        faculty,
        course,
        program,
        address,
        email,
        phone,
        status,
      } = student;

      if (
        !studentId ||
        !fullName ||
        !dateOfBirth ||
        !gender ||
        !faculty ||
        !course ||
        !program ||
        !address ||
        !email ||
        !phone ||
        !status
      ) {
        throw new Error('Missing required fields');
      }

      const existingStudent = await Student.findOne({ studentId });
      if (existingStudent) {
        throw new Error('Student already exists');
      }

      const newStudent = new Student({
        studentId,
        fullName,
        dateOfBirth,
        gender,
        faculty,
        course,
        program,
        address,
        email,
        phone,
        status,
      });

      return await newStudent.save();
    } catch (error) {
      console.log('Error adding student: ', error);
      throw error;
    }
  }

  /**
   * Xóa sinh viên theo mã số
   * @param studentId Mã số sinh viên
   */
  async deleteStudent(studentId: string): Promise<void> {
    try {
      const result = await Student.findOneAndDelete({ studentId });

      if (!result) {
        throw new Error('Student not found');
      }
    } catch (error) {
      console.log('Error deleting student: ', error);
      throw error;
    }
  }

  /**
   * Cập nhật thông tin sinh viên
   * @param studentId Mã số sinh viên
   * @param updateData Dữ liệu cần cập nhật
   * @returns Promise<IStudent> Thông tin sinh viên sau khi cập nhật
   */
  async updateStudent(studentId: string, updateData: IUpdateStudentDTO): Promise<IStudent> {
    try {
      if (!studentId || !updateData) {
        throw new Error('Missing required fields');
      }

      const result = await Student.findOneAndUpdate({ studentId }, updateData, {
        new: true,
      });

      if (!result) {
        throw new Error('Student not found');
      }

      return result;
    } catch (error: any) {
      console.log('Error updating student: ', error);
      throw error;
    }
  }

  /**
   * Tìm kiếm sinh viên theo từ khóa
   * @param searchTerm Từ khóa tìm kiếm
   * @returns Promise<IStudent[]> Danh sách sinh viên phù hợp
   */
  async searchStudent(searchTerm: string): Promise<IStudent[]> {
    try {
      const result = await Student.find({
        $or: [
          { studentId: { $regex: searchTerm, $options: 'i' } },
          { fullName: { $regex: searchTerm, $options: 'i' } },
        ],
      });
      return result;
    } catch (error) {
      console.log('Error searching student: ', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách tất cả sinh viên
   * @returns Promise<IStudent[]> Danh sách tất cả sinh viên
   */
  async getAllStudent(): Promise<IStudent[]> {
    try {
      const result = await Student.find({});
      return result;
    } catch (error) {
      console.log('Error retrieving all students: ', error);
      throw error;
    }
  }
}

export default new StudentService();