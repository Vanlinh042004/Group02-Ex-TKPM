import Student, { IStudent } from '../models/Student';
import Faculty from '../../faculty/models/Faculty';
import Program from '../../program/models/Program';
import Status from '../../status/models/Status';
import { importCSV, exportCSV } from '../../../utils/csvHandler';
import { importJSON, exportJSON } from '../../../utils/jsonHandler';

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

// Interface cho dữ liệu tìm kiếm
export interface IStudentSearchTermsDTO {
  studentId?: string;
  fullName?: string;
  faculty?: string;
}

// Interface cho dữ liệu tạo student mới
export interface ICreateStudentDTO {
  studentId: string;
  fullName: string;
  dateOfBirth: Date | string;
  gender: string;
  nationality: string;
  faculty: string; // Faculty name or facultyId
  course: string;
  program: string; // Program name or programId

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

      // Tìm faculty bằng tên hoặc facultyId
      const facultyDoc = await Faculty.findOne({
        $or: [{ name: faculty }, { facultyId: faculty }],
      });

      if (!facultyDoc) {
        throw new Error('Faculty not found');
      }

      // Tìm program bằng tên hoặc programId
      const programDoc = await Program.findOne({
        $or: [{ name: program }, { programId: program }],
      });

      if (!programDoc) {
        throw new Error('Program not found');
      }

      // Tìm status bằng tên
      const statusDoc = await Status.findOne({ name: status });

      if (!statusDoc) {
        throw new Error('Status not found');
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
        program: programDoc._id,
        permanentAddress,
        temporaryAddress,
        mailingAddress,
        identityDocument,
        email,
        phone,
        status: statusDoc._id,
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
  async updateStudent(
    studentId: string,
    updateData: IUpdateStudentDTO
  ): Promise<IStudent> {
    try {
      if (!studentId || !updateData) {
        throw new Error('Missing required fields');
      }

      // Nếu update faculty, kiểm tra và chuyển đổi
      if (updateData.faculty) {
        const facultyDoc = await Faculty.findOne({
          $or: [
            { name: updateData.faculty },
            { facultyId: updateData.faculty },
          ],
        });

        if (!facultyDoc) {
          throw new Error('Faculty not found');
        }

        // Thay thế bằng ObjectId của faculty
        updateData.faculty = facultyDoc._id.toString();
      }

      // Tương tự cho program nếu cần update
      if (updateData.program) {
        const programDoc = await Program.findOne({
          $or: [
            { name: updateData.program },
            { programId: updateData.program },
          ],
        });

        if (!programDoc) {
          throw new Error('Program not found');
        }

        // Thay thế bằng ObjectId của program
        updateData.program = programDoc._id.toString();
      }

      // Tương tự cho status nếu cần update
      if (updateData.status) {
        const statusDoc = await Status.findOne({
          name: updateData.status,
        });

        if (!statusDoc) {
          throw new Error('Status not found');
        }

        // Thay thế bằng ObjectId của status
        updateData.status = statusDoc._id.toString();
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
   * @param searchParams Các tham số tìm kiếm
   * @returns Promise<IStudent[]> Danh sách sinh viên phù hợp
   */
  async searchStudent(
    searchParams: IStudentSearchTermsDTO
  ): Promise<IStudent[]> {
    try {
      // Kiểm tra nếu không có bất kỳ tham số tìm kiếm nào
      if (
        !searchParams.studentId &&
        !searchParams.fullName &&
        !searchParams.faculty
      ) {
        return [];
      }

      // Xây dựng điều kiện tìm kiếm
      const searchConditions: any[] = [];

      // Tìm kiếm theo mã sinh viên
      if (searchParams.studentId) {
        searchConditions.push({
          studentId: searchParams.studentId.toString(),
        });
      }

      // Tìm kiếm theo tên
      if (searchParams.fullName) {
        searchConditions.push({
          fullName: { $regex: searchParams.fullName.toString(), $options: 'i' },
        });
      }

      // Tìm kiếm theo khoa
      if (searchParams.faculty) {
        // Tìm ID của khoa
        const faculty = await Faculty.findOne({
          $or: [
            {
              name: { $regex: searchParams.faculty.toString(), $options: 'i' },
            },
            { facultyId: searchParams.faculty },
          ],
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
        $and: searchConditions,
      })
        .populate('faculty')
        .populate('program')
        .populate('status');

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
      const result = await Student.find({})
        .populate('faculty')
        .populate('program')
        .populate('status');
      return result;
    } catch (error) {
      console.log('Error retrieving all students: ', error);
      throw error;
    }
  }

  /**
   * Lấy sinh viên theo mã số
   * @param studentId Mã số sinh viên
   * @returns Promise<IStudent | null> Thông tin sinh viên
   */
  async getStudentById(studentId: string): Promise<IStudent | null> {
    try {
      const student = await Student.findOne({ studentId })
        .populate('faculty')
        .populate('program');
      return student;
    } catch (error) {
      console.log('Error retrieving student: ', error);
      throw error;
    }
  }

  /**
   * Import dữ liệu sinh viên từ file
   * @param format Định dạng file (csv, json)
   * @param filePath Đường dẫn tới file
   * @return Promise<any[]> Dữ liệu sinh viên đã import
   */
  async importData(format: string, filePath: string): Promise<any[]> {
    let data;
    switch (format) {
      case 'csv':
        data = await importCSV(filePath);
        break;
      case 'json':
        data = await importJSON(filePath);
        break;
      default:
        throw new Error('Unsupported format');
    }

    // Save data to database
    await Student.insertMany(data);

    return data;
  }

  /**
   * Export dữ liệu sinh viên ra file
   * @param format Định dạng file (csv, json, xml, excel)
   * @param filePath Đường dẫn tới file
   * @returns Promise<void>
   */
  async exportData(format: string, filePath: string): Promise<void> {
    // Fetch data from database
    const data = await Student.find().lean();
    switch (format) {
      case 'csv':
        await exportCSV(data, filePath);
        break;
      case 'json':
        await exportJSON(data, filePath);
        break;
      default:
        throw new Error('Unsupported format');
    }
  }
}

export default new StudentService();
