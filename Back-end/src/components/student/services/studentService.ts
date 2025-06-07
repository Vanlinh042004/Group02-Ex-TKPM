import Student, { IStudent } from "../models/Student";
import Faculty from "../../faculty/models/Faculty";
import Program from "../../program/models/program";
import Status from "../../status/models/Status";
import PhoneNumberConfig from "../../phone-number/models/PhoneNumberConfig";
import { importCSV, exportCSV } from "../../../utils/csvHandler";
import { importJSON, exportJSON } from "../../../utils/jsonHandler";
import mongoose from "mongoose";
import {
  validStatuses,
  statusTransitionRules,
} from "../../status/config/statusRules";
import i18next from "../../../config/i18n";

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
  type: "CMND";
}

export interface ICCCD_DTO extends IIdentityBaseDTO {
  type: "CCCD";
  hasChip: boolean;
}

export interface IPassport_DTO extends IIdentityBaseDTO {
  type: "Hộ chiếu";
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
  phoneNumberConfig: string; // PhoneNumberConfig name or ID
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
        phoneNumberConfig,
        status,
      } = student;

      // Kiểm tra các trường bắt buộc với i18next
      if (!studentId) throw new Error(i18next.t('errors:missing_required_field', { field: 'studentId' }));
      if (!fullName) throw new Error(i18next.t('errors:missing_required_field', { field: 'fullName' }));
      if (!dateOfBirth) throw new Error(i18next.t('errors:missing_required_field', { field: 'dateOfBirth' }));
      if (!gender) throw new Error(i18next.t('errors:missing_required_field', { field: 'gender' }));
      if (!faculty) throw new Error(i18next.t('errors:missing_required_field', { field: 'faculty' }));
      if (!course) throw new Error(i18next.t('errors:missing_required_field', { field: 'course' }));
      if (!program) throw new Error(i18next.t('errors:missing_required_field', { field: 'program' }));
      if (!mailingAddress) throw new Error(i18next.t('errors:missing_required_field', { field: 'mailingAddress' }));
      if (!identityDocument) throw new Error(i18next.t('errors:missing_required_field', { field: 'identityDocument' }));
      if (!identityDocument.number) throw new Error(i18next.t('errors:missing_required_field', { field: 'identityDocument.number' }));
      if (!email) throw new Error(i18next.t('errors:missing_required_field', { field: 'email' }));
      if (!phone) throw new Error(i18next.t('errors:missing_required_field', { field: 'phone' }));
      if (!status) throw new Error(i18next.t('errors:missing_required_field', { field: 'status' }));

      // Kiểm tra sinh viên đã tồn tại
      const existingStudent = await Student.findOne({ studentId });
      if (existingStudent) {
        throw new Error(i18next.t('errors:student_id_exists'));
      }

      // Tìm faculty bằng tên hoặc facultyId
      const facultyDoc = await Faculty.findOne({
        $or: [{ name: faculty }, { _id: faculty }],
      });

      if (!facultyDoc) {
        throw new Error(i18next.t('errors:faculty_not_found'));
      }

      // Tìm program bằng tên hoặc programId
      const programDoc = await Program.findOne({
        $or: [{ name: program }, { _id: program }],
      });

      if (!programDoc) {
        throw new Error(i18next.t('errors:program_not_found'));
      }

      // Tìm status bằng tên
      const statusDoc = await Status.findOne({ _id: status });

      if (!statusDoc) {
        throw new Error(i18next.t('errors:status_not_found'));
      }

      // Tìm phoneNumberConfig bằng tên hoặc ID
      const phoneNumberConfigDoc = await PhoneNumberConfig.findOne({
        country: phoneNumberConfig,
      });

      if (!phoneNumberConfigDoc) {
        throw new Error(i18next.t('errors:phone_config_not_found'));
      }

      // Tạo sinh viên mới
      const newStudent = new Student({
        studentId,
        fullName,
        dateOfBirth,
        gender,
        nationality: nationality || i18next.t('common:defaults.nationality'),
        faculty: facultyDoc._id,
        course,
        program: programDoc._id,
        permanentAddress,
        temporaryAddress,
        mailingAddress,
        identityDocument,
        email,
        phone,
        phoneNumberConfig: phoneNumberConfigDoc._id,
        status: statusDoc._id,
      });

      return await newStudent.save();
    } catch (error) {
      console.log(i18next.t('common:logging.error_adding_student'), error);
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
        throw new Error(i18next.t('errors:student_not_found'));
      }
    } catch (error) {
      console.log(i18next.t('common:logging.error_deleting_student'), error);
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
    updateData: IUpdateStudentDTO,
  ): Promise<IStudent> {
    try {
      if (!studentId || !updateData) {
        throw new Error(i18next.t('errors:missing_required_fields'));
      }
      
      if (updateData.phoneNumberConfig) {
        const phoneNumberConfigDoc = await PhoneNumberConfig.findOne({
          $or: [
            { _id: updateData.phoneNumberConfig },
            { country: updateData.phoneNumberConfig },
          ],
        });

        if (!phoneNumberConfigDoc) {
          throw new Error(i18next.t('errors:phone_config_not_found_update'));
        }

        updateData.phoneNumberConfig = phoneNumberConfigDoc._id.toString();
      }

      // Kiểm tra trạng thái nếu cần cập nhật
      if (updateData.status) {
        const currentStudent = await Student.findOne({ studentId });

        if (!currentStudent) {
          throw new Error(i18next.t('errors:student_not_found'));
        }

        const currentStatusId = currentStudent.status.toString();
        const newStatusId = updateData.status;

        const currentStatusDoc = await Status.findById(currentStatusId);
        if (!currentStatusDoc) {
          throw new Error(i18next.t('errors:current_status_not_found'));
        }

        const currentStatusName = currentStatusDoc.name;

        const newStatusDoc = await Status.findById(newStatusId);
        if (!newStatusDoc) {
          throw new Error(i18next.t('errors:new_status_not_found'));
        }

        const newStatusName = newStatusDoc.name;

        if (!validStatuses.includes(newStatusName)) {
          throw new Error(i18next.t('errors:invalid_status', { status: newStatusName }));
        }

        const allowedTransitions = statusTransitionRules[currentStatusName] || [];
        if (!allowedTransitions.includes(newStatusName)) {
          throw new Error(
            i18next.t('errors:status_transition_not_allowed', {
              currentStatus: currentStatusName,
              newStatus: newStatusName
            })
          );
        }

        updateData.status = newStatusDoc._id.toString();
      }

      const result = await Student.findOneAndUpdate({ studentId }, updateData, {
        new: true,
      });

      if (!result) {
        throw new Error(i18next.t('errors:student_not_found'));
      }

      return result;
    } catch (error: any) {
      console.log(i18next.t('common:logging.error_updating_student'), error);
      throw error;
    }
  }

  /**
   * Tìm kiếm sinh viên theo từ khóa
   */
  async searchStudent(searchParams: IStudentSearchTermsDTO): Promise<IStudent[]> {
    try {
      if (!searchParams.studentId && !searchParams.fullName && !searchParams.faculty) {
        return [];
      }

      const searchConditions: any[] = [];

      if (searchParams.studentId) {
        searchConditions.push({
          studentId: searchParams.studentId.toString(),
        });
      }

      if (searchParams.fullName) {
        searchConditions.push({
          fullName: { $regex: searchParams.fullName.toString(), $options: "i" },
        });
      }

      if (searchParams.faculty) {
        const faculty = await Faculty.findOne({
          $or: [
            { name: { $regex: searchParams.faculty.toString(), $options: "i" } },
            { facultyId: searchParams.faculty },
          ],
        });

        if (faculty) {
          searchConditions.push({ faculty: faculty._id });
        } else {
          return [];
        }
      }

      const result = await Student.find({ $and: searchConditions })
        .populate("faculty")
        .populate("program")
        .populate("status")
        .populate("phoneNumberConfig");

      return result;
    } catch (error) {
      console.log(i18next.t('common:logging.error_searching_students'), error);
      throw error;
    }
  }

  /**
   * Lấy danh sách tất cả sinh viên
   */
  async getAllStudent(): Promise<IStudent[]> {
    try {
      const result = await Student.find({})
        .populate("faculty")
        .populate("program")
        .populate("status")
        .populate("phoneNumberConfig");
      return result;
    } catch (error) {
      console.log(i18next.t('common:logging.error_retrieving_all_students'), error);
      throw error;
    }
  }

  /**
   * Lấy sinh viên theo mã số
   */
  async getStudentById(studentId: string): Promise<IStudent | null> {
    try {
      const student = await Student.findOne({ studentId })
        .populate("faculty")
        .populate("program")
        .populate("status")
        .populate("phoneNumberConfig");
      return student;
    } catch (error) {
      console.log(i18next.t('common:logging.error_retrieving_student'), error);
      throw error;
    }
  }

  /**
   * Import dữ liệu sinh viên từ file
   */
  async importData(format: string, data: any[]): Promise<any[]> {
    let formattedData;
    
    switch (format) {
      case "csv":
        formattedData = await this.processCSVData(data);
        break;
      case "json":
        formattedData = await this.processJSONData(data);
        break;
      default:
        throw new Error(i18next.t('errors:unsupported_format'));
    }
    
    await Student.insertMany(formattedData);
    return formattedData;
  }

  /**
   * Export dữ liệu sinh viên ra file
   */
  async exportData(format: string, filePath: string): Promise<void> {
    const data = await Student.find().lean();
    
    switch (format) {
      case "csv":
        await exportCSV(data, filePath);
        break;
      case "json":
        await exportJSON(data, filePath);
        break;
      default:
        throw new Error(i18next.t('errors:unsupported_format_export'));
    }
  }

  // Helper methods để xử lý data import (giữ nguyên logic cũ với i18next)
  private async processCSVData(data: any[]): Promise<any[]> {
    return data.map((item) => ({
      studentId: item.studentId || null,
      fullName: item.fullName || "",
      gender: item.gender || i18next.t('common:defaults.gender_unknown'),
      dateOfBirth: item.dateOfBirth ? new Date(item.dateOfBirth) : null,
      email: item.email || "",
      phone: item.phone || "",
      course: item.course ? parseInt(item.course, 10) || null : null,
      faculty: item.faculty || "",
      program: item.program || "",
      status: item.status || "",
      nationality: item.nationality || i18next.t('common:defaults.nationality_unknown'),
      identityDocument: item.identityDocument || {
        type: "",
        number: "",
        issueDate: null,
        issuePlace: "",
        expiryDate: null,
      },
      mailingAddress: item.mailingAddress || {
        streetAddress: "",
        ward: "",
        district: "",
        city: "",
        country: "",
      },
      permanentAddress: item.permanentAddress || {
        streetAddress: "",
        ward: "",
        district: "",
        city: "",
        country: "",
      },
    }));
  }

  private async processJSONData(data: any[]): Promise<any[]> {
    return data.map((item) => {
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
        fullName: item.fullName || i18next.t('common:defaults.no_name'),
        gender: item.gender || i18next.t('common:defaults.gender_unknown'),
        dateOfBirth: parseDate(item.dateOfBirth) || new Date("2000-01-01"),
        email: item.email || i18next.t('common:defaults.default_email'),
        phone: item.phone || i18next.t('common:defaults.default_phone'),
        course: item.course ? parseInt(item.course, 10) || null : i18next.t('common:defaults.default_course'),
        faculty: parseObjectId(item.faculty) || i18next.t('common:defaults.faculty_unknown'),
        program: parseObjectId(item.program) || i18next.t('common:defaults.program_unknown'),
        status: parseObjectId(item.status) || i18next.t('common:defaults.status_not_updated'),
        nationality: item.nationality || i18next.t('common:defaults.nationality_unknown'),
        identityDocument: {
          type: item.identityDocument?.type || i18next.t('common:defaults.identity_type_unknown'),
          number: item.identityDocument?.number || i18next.t('common:defaults.identity_number_default'),
          issueDate: parseDate(item.identityDocument?.issueDate),
          issuePlace: item.identityDocument?.issuePlace || i18next.t('common:defaults.identity_place_unknown'),
          expiryDate: parseDate(item.identityDocument?.expiryDate),
          hasChip: item.identityDocument?.hasChip || false,
        },
        mailingAddress: {
          streetAddress: item.mailingAddress?.streetAddress || i18next.t('common:defaults.no_address'),
          ward: item.mailingAddress?.ward || i18next.t('common:defaults.no_ward'),
          district: item.mailingAddress?.district || i18next.t('common:defaults.no_district'),
          city: item.mailingAddress?.city || i18next.t('common:defaults.no_city'),
          country: item.mailingAddress?.country || i18next.t('common:defaults.no_country'),
        },
        permanentAddress: {
          streetAddress: item.permanentAddress?.streetAddress || i18next.t('common:defaults.no_address'),
          ward: item.permanentAddress?.ward || i18next.t('common:defaults.no_ward'),
          district: item.permanentAddress?.district || i18next.t('common:defaults.no_district'),
          city: item.permanentAddress?.city || i18next.t('common:defaults.no_city'),
          country: item.permanentAddress?.country || i18next.t('common:defaults.no_country'),
        },
      };
    });
  }
}

export default new StudentService();