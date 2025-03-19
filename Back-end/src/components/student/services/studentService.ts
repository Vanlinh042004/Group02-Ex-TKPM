import Student, { IStudent } from '../models/Student';
import Faculty from '../../faculty/models/Faculty';
import mongoose from 'mongoose';

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
  faculty: string; // Faculty name or ID
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

// Interface cho các từ khóa tìm kiếm
export interface IStudentSearchTermsDTO {
  studentId?: string;
  fullName?: string;
  faculty?: string;
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

      // Tìm faculty bằng tên hoặc ID
      let facultyDoc;
      if (mongoose.Types.ObjectId.isValid(faculty)) {
        facultyDoc = await Faculty.findById(faculty);
      } else {
        facultyDoc = await Faculty.findOne({ name: faculty });
      }

      if (!facultyDoc) {
        throw new Error('Faculty not found');
      }

      // Tạo sinh viên mới
      const newStudent = new Student({
        studentId,
        fullName,
        dateOfBirth,
        gender,
        nationality: nationality || 'Việt Nam',
        faculty: facultyDoc._id,
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

      // Nếu update faculty, kiểm tra và chuyển đổi thành faculty ID
      if (updateData.faculty) {
        let facultyDoc;
        if (mongoose.Types.ObjectId.isValid(updateData.faculty)) {
          facultyDoc = await Faculty.findById(updateData.faculty);
        } else {
          facultyDoc = await Faculty.findOne({ name: updateData.faculty });
        }

        if (!facultyDoc) {
          throw new Error('Faculty not found');
        }

        // Thay thế tên faculty bằng faculty ID
        updateData.faculty = facultyDoc._id.toString();
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
  async searchStudent(searchParams: IStudentSearchTermsDTO): Promise<IStudent[]> {
    try {
      // Kiểm tra nếu không có bất kỳ tham số tìm kiếm nào
      if (!searchParams.studentId && !searchParams.fullName && !searchParams.faculty) {
        return [];
      }

      // Xây dựng điều kiện tìm kiếm
      const searchConditions: any[] = [];

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
        const faculty = await Faculty.findOne({ 
          name: { $regex: searchParams.faculty.toString(), $options: 'i' } 
        });

        if (faculty) {
          searchConditions.push({ faculty: faculty._id });
        } else {
          // Nếu không tìm thấy khoa, trả về mảng rỗng
          return [];
        }
      }

      // Thực hiện tìm kiếm
      const result = await Student.find({
        $and: searchConditions
      }).populate('faculty');

      return result;
    } catch (error) {
      console.log('Error searching students: ', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách tất cả sinh viên
   * @returns Promise<IStudent[]> Danh sách tất cả sinh viên
   */
  async getAllStudent(): Promise<IStudent[]> {
    try {
      const result = await Student.find({}).populate('faculty');
      return result;
    } catch (error) {
      console.log('Error retrieving all students: ', error);
      throw error;
    }
  }

  /**
   * Lấy sinh viên theo mã số
   * @param studentId Mã số sinh viên
   * @returns Promise<IStudent> Thông tin sinh viên
   */
  async getStudentById(studentId: string): Promise<IStudent | null> {
    try {
      const student = await Student.findOne({ studentId }).populate('faculty');
      return student;
    } catch (error) {
      console.log('Error retrieving student: ', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách sinh viên theo khoa
   * @param facultyId Mã hoặc tên khoa
   * @returns Promise<IStudent[]> Danh sách sinh viên của khoa
   */
  async getStudentsByFaculty(facultyId: string): Promise<IStudent[]> {
    try {
      let facultyDoc;
      if (mongoose.Types.ObjectId.isValid(facultyId)) {
        facultyDoc = await Faculty.findById(facultyId);
      } else {
        facultyDoc = await Faculty.findOne({ name: facultyId });
      }

      if (!facultyDoc) {
        throw new Error('Faculty not found');
      }

      const students = await Student.find({ faculty: facultyDoc._id }).populate('faculty');
      return students;
    } catch (error) {
      console.log('Error retrieving students by faculty: ', error);
      throw error;
    }
  }
}

export default new StudentService();