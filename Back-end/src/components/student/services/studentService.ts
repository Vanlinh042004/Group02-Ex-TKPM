import Student, { IStudent } from '../models/Student';
import Faculty from '../../faculty/models/Faculty';
import Program from '../../program/models/program';
import Status from '../../status/models/Status';
import { importCSV, exportCSV } from '../../../utils/csvHandler';
import { importJSON, exportJSON } from '../../../utils/jsonHandler';
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
      if (!studentId) throw new Error('Missing required field: studentId');
      if (!fullName) throw new Error('Missing required field: fullName');
      if (!dateOfBirth) throw new Error('Missing required field: dateOfBirth');
      if (!gender) throw new Error('Missing required field: gender');
      if (!faculty) throw new Error('Missing required field: faculty');
      if (!course) throw new Error('Missing required field: course');
      if (!program) throw new Error('Missing required field: program');
      if (!mailingAddress) throw new Error('Missing required field: mailingAddress');
    //  if (!mailingAddress.country) throw new Error('Missing required field: mailingAddress.country');
      if (!identityDocument) throw new Error('Missing required field: identityDocument');
      if (!identityDocument.number) throw new Error('Missing required field: identityDocument.number');
      if (!email) throw new Error('Missing required field: email');
      if (!phone) throw new Error('Missing required field: phone');
      if (!status) throw new Error('Missing required field: status');

      // Kiểm tra sinh viên đã tồn tại
      const existingStudent = await Student.findOne({ studentId });
      if (existingStudent) {
        throw new Error('Student already exists');
      }

      // Tìm faculty bằng tên hoặc facultyId
      const facultyDoc = await Faculty.findOne({
        $or: [{ name: faculty }, { _id: faculty }],
      });

      if (!facultyDoc) {
        throw new Error('Faculty not found');
      }

      // Tìm program bằng tên hoặc programId
      const programDoc = await Program.findOne({
        $or: [{ name: program }, { _id: program }],
      });

      if (!programDoc) {
        throw new Error('Program not found');
      }

      // Tìm status bằng tên
      const statusDoc = await Status.findOne({ _id: status });

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
            { _id: updateData.faculty },
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
            { _id: updateData.program },
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
          _id: updateData.status,
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
  async importData(format: string, data: any[]): Promise<any[]> {
    let formattedData;
console.log('data',data);
    switch (format) {
      case "csv":
        formattedData =  await this.processCSVData(data);
        break;
      case "json":
        formattedData = await this.processJSONData(data);
        break;
      default:
        throw new Error("Định dạng không được hỗ trợ!");
    }
console.log('dt',formattedData);
    // Lưu dữ liệu vào database
    await Student.insertMany(formattedData);

    return formattedData;
}

/// Xử lý dữ liệu CSV (chuyển đổi dữ liệu trước khi lưu)
async processCSVData(data: any[]): Promise<any[]> {
  return data.map(item => ({
      studentId: item.studentId || null,
      fullName: item.fullName || "",
      gender: item.gender || "Không xác định",
      dateOfBirth: item.dateOfBirth ? new Date(item.dateOfBirth) : null,
      email: item.email || "",
      phone: item.phone || "",
      course: item.course ? parseInt(item.course, 10) || null : null,
      faculty: item.faculty || "",
      program: item.program || "",
      status: item.status || "",
      nationality: item.nationality || "Không rõ",
      identityDocument: item.identityDocument || {
          type: "",
          number: "",
          issueDate: null,
          issuePlace: "",
          expiryDate: null
      },
      mailingAddress: item.mailingAddress || {
          streetAddress: "",
          ward: "",
          district: "",
          city: "",
          country: ""
      },
      permanentAddress: item.permanentAddress || {
          streetAddress: "",
          ward: "",
          district: "",
          city: "",
          country: ""
      }
  }));
}

// Xử lý dữ liệu JSON (chuyển đổi dữ liệu trước khi lưu)

async processJSONData(data: any[]): Promise<any[]> {
  return data.map(item => {
    const parseDate = (date: any) => {
      if (date && date.$date) {
        return new Date(date.$date);
      }
      return new Date(date);
    };

    const parseObjectId = (id: any) => {
      if (id && id.$oid) {
        return new mongoose.Types.ObjectId(id.$oid);
      }
      return new mongoose.Types.ObjectId(id);
    };

    return {
      studentId: item.studentId || "N/A",
      fullName: item.fullName || "Không có tên",
      gender: item.gender || "Không xác định",
      dateOfBirth: parseDate(item.dateOfBirth) || new Date("2000-01-01"), // Ngày mặc định
      email: item.email || "no-email@example.com",
      phone: item.phone || "0000000000",
      course: item.course ? parseInt(item.course, 10) || null : 2024, // Mặc định là 2024 nếu thiếu
      faculty: parseObjectId(item.faculty) || "Không xác định",
      program: parseObjectId(item.program) || "Không xác định",
      status: parseObjectId(item.status) || "Chưa cập nhật",
      nationality: item.nationality || "Không rõ",
      identityDocument: {
        type: item.identityDocument?.type || "Không xác định",
        number: item.identityDocument?.number || "000000000",
        issueDate: parseDate(item.identityDocument?.issueDate),
        issuePlace: item.identityDocument?.issuePlace || "Không xác định",
        expiryDate: parseDate(item.identityDocument?.expiryDate),
        hasChip: item.identityDocument?.hasChip || false,
      },
      mailingAddress: {
        streetAddress: item.mailingAddress?.streetAddress || "Không có địa chỉ",
        ward: item.mailingAddress?.ward || "Không có phường",
        district: item.mailingAddress?.district || "Không có quận",
        city: item.mailingAddress?.city || "Không có thành phố",
        country: item.mailingAddress?.country || "Không có quốc gia"
      },
      permanentAddress: {
        streetAddress: item.permanentAddress?.streetAddress || "Không có địa chỉ",
        ward: item.permanentAddress?.ward || "Không có phường",
        district: item.permanentAddress?.district || "Không có quận",
        city: item.permanentAddress?.city || "Không có thành phố",
        country: item.permanentAddress?.country || "Không có quốc gia"
      }
    };
  });
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
