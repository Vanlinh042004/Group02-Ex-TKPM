import Registration, { IRegistration, RegistrationStatus } from '../models/Registration';
import Class, { IClass } from '../../class/models/Class';
import Student from '../../student/models/Student';
import Course from '../../course/models/Course';
import mongoose from 'mongoose';
import logger from '../../../utils/logger';
import { ICreateStudentDTO } from '../../student/services/studentService';

export interface IStudentInfo extends Partial<ICreateStudentDTO> {}

export interface ICourseTranscript {
  classId: string,
  courseId: string;
  name: string;
  credits: number;
  grade: number;
  status: string;
}

export interface ITranscript {
  studentInfo: IStudentInfo,
  courses: ICourseTranscript[];
  gpa: number;
  totalCredits: number;
}

class RegistrationService {
  /**
   * Đăng ký khóa học cho sinh viên
   * @param studentId ID sinh viên
   * @param classId Mã lớp học
   * @returns Promise<IRegistration>
   */
  async registerCourse(
    studentId: string, 
    classId: string
  ): Promise<IRegistration> {
    const session = await mongoose.startSession();
    
    try {
      // Bắt đầu transaction
      session.startTransaction();

      // Kiểm tra sinh viên có tồn tại không
      const student = await Student.findOne({ studentId }).session(session);
      if (!student) {
        throw new Error('Sinh viên không tồn tại');
      }

      // Kiểm tra lớp học có tồn tại không
      const classInfo = await Class.findOne({ classId })
        .populate('course')
        .session(session);
      
      if (!classInfo) {
        throw new Error('Lớp học không tồn tại');
      }

      // Kiểm tra khóa học
      const course = await Course.findById(classInfo.course);
      if (!course || !course.isActive) {
        throw new Error('Khóa học không tồn tại hoặc đã bị deactivate');
      }

      // Kiểm tra môn tiên quyết
      if (course.prerequisites && course.prerequisites.length > 0) {
        // Lấy tất cả các lớp đã đăng ký và hoàn thành của sinh viên
        const studentRegistrations = await Registration.find({
          student: student._id,
          status: 'active',
          grade: { $exists: true },
        }).populate({
          path: 'class',
          populate: {
            path: 'course',
          },
        });

        // Lấy danh sách các khóa học đã hoàn thành
        const completedCourseIds = studentRegistrations
          .map((reg: any) => {
            if (!reg.class || !reg.class.course) return '';
            return reg.class.course._id.toString();
          })
          .filter((id) => id !== '');

        // Kiểm tra xem tất cả các môn tiên quyết đã được hoàn thành chưa
        for (const prereqId of course.prerequisites) {
          if (!completedCourseIds.includes(prereqId.toString())) {
            throw new Error('Sinh viên chưa hoàn thành môn tiên quyết');
          }
        }
      }

      // Kiểm tra số lượng sinh viên trong lớp
      const currentRegistrationsCount = await Registration.countDocuments({
        class: classInfo._id,
        status: 'active'
      }).session(session);

      if (currentRegistrationsCount >= classInfo.maxStudents) {
        throw new Error('Lớp học đã đủ số lượng sinh viên tối đa');
      }

      // Kiểm tra sinh viên đã đăng ký lớp này chưa
      const existingRegistration = await Registration.findOne({
        student: student._id,
        class: classInfo._id,
        status: 'active'
      }).session(session);

      if (existingRegistration) {
        throw new Error('Sinh viên đã đăng ký lớp học này');
      }

      // Tạo đăng ký mới
      const registration = new Registration({
        student: student._id,
        class: classInfo._id,
        registrationDate: new Date(),
        status: 'active'
      });

      // Lưu đăng ký
      const savedRegistration = await registration.save({ session });

      // Commit transaction
      await session.commitTransaction();

      return savedRegistration;
    } catch (error: any) {
      // Abort transaction nếu có lỗi
      await session.abortTransaction();

      logger.error('Lỗi đăng ký khóa học', {
        module: 'RegistrationService',
        operation: 'registerCourse',
        details: {
          studentId,
          classId,
          errorMessage: error.message
        }
      });
      throw error;
    } finally {
      // Kết thúc session
      session.endSession();
    }
  }

  /**
   * Hủy đăng ký môn học
   * @param registrationId ID đăng ký
   * @param reason Lý do hủy
   * @returns Promise<IRegistration | null>
   */
  async cancelRegistration(
    registrationId: string, 
    reason: string
  ): Promise<IRegistration | null> {
    try {
      const registration = await Registration.findById(registrationId)
        .populate('class');

      if (!registration) {
        throw new Error('Đăng ký không tồn tại');
      }

      // Kiểm tra trạng thái hiện tại
      if (registration.status !== 'active') {
        throw new Error('Chỉ được hủy đăng ký cho các đăng ký đang hoạt động');
      }

      return await Registration.findByIdAndUpdate(
        registrationId,
        {
          status: 'cancelled',
          cancellationDate: new Date(),
          cancellationReason: reason
        },
        { new: true }
      );
    } catch (error: any) {
      logger.error('Lỗi hủy đăng ký', {
        module: 'RegistrationService',
        operation: 'cancelRegistration',
        details: {
          registrationId,
          reason,
          errorMessage: error.message
        }
      });
      throw error;
    }
  }

   /**
   * Cập nhật điểm số
   * @param registrationId ID đăng ký
   * @param grade Điểm số
   * @returns Promise<IRegistration | null>
   */
   async updateGrade(
    registrationId: string, 
    grade: number
  ): Promise<IRegistration | null> {
    try {
      // Kiểm tra điểm hợp lệ
      if (grade < 0 || grade > 10) {
        throw new Error('Điểm số không hợp lệ (0-10)');
      }
  
      // Kiểm tra xem registration có tồn tại không
      const registration = await Registration.findById(registrationId);
      if (!registration) {
        throw new Error('Đăng ký không tồn tại');
      }
  
      // Kiểm tra trạng thái của registration
      if (registration.status !== 'active') {
        throw new Error('Chỉ được cập nhật điểm cho các đăng ký đang hoạt động');
      }
  
      // Cập nhật điểm
      return await Registration.findByIdAndUpdate(
        registrationId, 
        { 
          grade,
          // Nếu grade đã được nhập trước đó, giữ nguyên các thông tin khác
          ...(registration.grade === undefined && { 
            updatedAt: new Date() 
          }) 
        }, 
        { new: true }
      );
    } catch (error: any) {
      logger.error('Lỗi cập nhật điểm', {
        module: 'RegistrationService',
        operation: 'updateGrade',
        details: {
          registrationId,
          grade,
          errorMessage: error.message
        }
      });
      throw error;
    }
  }

  /**
    * Lấy danh sách tất cả các đăng ký
    * @returns Promise<IRegistration[]>
    */
    async getAllRegistrations(): Promise<IRegistration[]> {
     try {
      const registrations = await Registration.find()
        .populate('student', 'studentId fullName email')
        .populate({
         path: 'class',
         populate: {
          path: 'course',
          select: 'courseId name'
         }
        });

      return registrations;
     } catch (error: any) {
      logger.error('Lỗi lấy danh sách tất cả các đăng ký', {
        module: 'RegistrationService',
        operation: 'getAllRegistrations',
        details: {
         errorMessage: error.message
        }
      });
      throw error;
     }
    }

  /**
   * Lấy danh sách sinh viên trong một lớp học
   * @param classId Mã lớp học
   * @returns Promise<IRegistration[]>
   */
  async getAllStudentsFromClass(classId: string): Promise<IRegistration[]> {
    try {
      const classInfo = await Class.findOne({ classId });
      if (!classInfo) {
        throw new Error('Lớp học không tồn tại');
      }

      const registrations = await Registration.find({ 
        class: classInfo._id, 
        status: 'active' 
      }).populate({
        path: 'student',
        select: 'studentId fullName email' // Chọn các trường cần thiết
      });

      return registrations;
    } catch (error: any) {
      logger.error('Lỗi lấy danh sách sinh viên trong lớp', {
        module: 'RegistrationService',
        operation: 'getAllStudentsFromClass',
        details: {
          classId,
          errorMessage: error.message
        }
      });
      throw error;
    }
  }
  /**
   * Xuất bảng điểm cho sinh viên
   * @param studentId Mã sinh viên
   * @returns Promise<ITranscript>
   */
  async generateTranscript(studentId: string): Promise<ITranscript> {
    try {
      // Loại bỏ ký tự xuống dòng và trim
      studentId = studentId.trim();
  
      // Tìm sinh viên
      const student = await Student.findOne({ studentId })
        .populate('faculty')
        .populate('program')
        .populate('phoneNumberConfig')
        .populate('status');
      
      if (!student) {
        throw new Error('Sinh viên không tồn tại');
      }
  
      // Lấy các đăng ký khóa học
      const registrations = await Registration.find({ 
        student: student._id, 
        status: 'active',
        grade: { $exists: true }
      }).populate({
        path: 'class',
        populate: {
          path: 'course'
        }
      });
  
      // Chuẩn bị dữ liệu bảng điểm
      let totalWeightedPoints = 0;
      let totalCredits = 0;
  
      const courses = registrations.map(reg => {
        const course = (reg.class as any).course;
        
        // Tính toán điểm và học phần
        const courseEntry: ICourseTranscript = {
          classId: (reg.class as any).classId.toString(),
          courseId: course.courseId,
          name: course.name,
          credits: course.credits,
          grade: reg.grade || 0,
          status: reg.grade && reg.grade >= 5 ? 'Passed' : 'Failed'
        };
  
        // Tính GPA
        if (reg.grade !== undefined && reg.grade !== null) {
          totalWeightedPoints += (reg.grade * course.credits);
          totalCredits += course.credits;
        }
  
        return courseEntry;
      });
  
      // Tính GPA
      const gpa = totalCredits > 0 
        ? Number((totalWeightedPoints / totalCredits).toFixed(2)) 
        : 0;
  
      // Log thông tin xuất bảng điểm
      logger.info('Lấy bảng điểm thành công', {
        module: 'RegistrationService',
        operation: 'generateTranscript',
        details: {
          studentId,
          courseCount: courses.length,
          gpa
        }
      });
      const studentInfo: IStudentInfo = {
        ...student.toObject(),
        faculty: student.faculty ? (student.faculty as any).toObject() : undefined,
        program: student.program ? (student.program as any).toObject() : undefined,
        phoneNumberConfig: student.phoneNumberConfig ? (student.phoneNumberConfig as any).toObject() : undefined,
        status: student.status ? (student.status as any).toObject() : undefined,
      };

      return {
        studentInfo,
        courses,
        gpa,
        totalCredits
      };
    } catch (error: any) {
      logger.error('Lỗi khi lấy bảng điểm', {
        module: 'RegistrationService',
        operation: 'generateTranscript',
        details: {
          studentId,
          errorMessage: error.message
        }
      });
      throw error;
    }
  }
}

export default new RegistrationService();