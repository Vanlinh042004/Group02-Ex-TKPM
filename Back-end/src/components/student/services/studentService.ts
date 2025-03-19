import Student, { IStudent } from '../models/Student';

// Interface cho địa chỉ DTO
export interface IAddressDTO {
  streetAddress?: string;
  ward?: string;
  district?: string;
  city?: string;
  country: string;
}

// Interface cho các loại giấy tờ DTO
export interface IIdentityBaseDTO {
  type: string;
  number: string;
  issueDate: Date | string;
  issuePlace: string;
  expiryDate: Date | string;
}

export interface ICMND_DTO extends IIdentityBaseDTO {
  type: 'CMND';
}

export interface ICCCD_DTO extends IIdentityBaseDTO {
  type: 'CCCD';
  hasChip: boolean;
}

export interface IPassport_DTO extends IIdentityBaseDTO {
  type: 'Hộ chiếu';
  issuingCountry: string;
  notes?: string;
}

export type IdentityDocumentDTO = ICMND_DTO | ICCCD_DTO | IPassport_DTO;

// Interface cho dữ liệu tạo student mới
export interface ICreateStudentDTO {
  studentId: string;
  fullName: string;
  dateOfBirth: Date | string;
  gender: string;
  nationality: string;
  faculty: string;
  course: string;
  program: string;
  
  // Địa chỉ
  permanentAddress?: IAddressDTO;
  temporaryAddress?: IAddressDTO;
  mailingAddress: IAddressDTO;
  
  // Giấy tờ tùy thân
  identityDocument: IdentityDocumentDTO;
  
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
        nationality,
        faculty,
        course,
        program,
        permanentAddress,
        temporaryAddress,
        mailingAddress,
        identityDocument,
        email,
        phone,
        status,
      } = student;

      // Kiểm tra các trường bắt buộc
      if (
        !studentId ||
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
        !status
      ) {
        throw new Error('Missing required fields');
      }

      // Kiểm tra sinh viên đã tồn tại
      const existingStudent = await Student.findOne({ studentId });
      if (existingStudent) {
        throw new Error('Student already exists');
      }

      // Tạo sinh viên mới
      const newStudent = new Student({
        studentId,
        fullName,
        dateOfBirth,
        gender,
        nationality: nationality || 'Việt Nam',
        faculty,
        course,
        program,
        permanentAddress,
        temporaryAddress,
        mailingAddress,
        identityDocument,
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
          { email: { $regex: searchTerm, $options: 'i' } },
          { phone: { $regex: searchTerm, $options: 'i' } },
          { 'identityDocument.number': { $regex: searchTerm, $options: 'i' } }
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