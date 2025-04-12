import Registration, { IRegistration } from '../models/Registration';
import Class, { IClass } from '../../class/models/Class';
import Course, { ICourse } from '../../course/models/Course';
import classService from '../../class/services/classService';
import Student from '../../student/models/Student';
import { Types } from 'mongoose';
import logger from '../../../utils/logger';

// Define interfaces for populated documents
interface IPopulatedClass extends Omit<IClass, 'course'> {
  course: ICourse;
}

interface IPopulatedRegistration extends Omit<IRegistration, 'class'> {
  class: IPopulatedClass;
}

class RegistrationService {
  /**
   * Đăng ký khóa học cho sinh viên
   * @param studentId ID sinh viên
   * @param classId ID lớp học
   * @returns Promise<IRegistration>
   */
  async registerCourse(
    studentId: string,
    classId: string
  ): Promise<IRegistration> {
    try {
      // Kiểm tra sinh viên có tồn tại không
      const student = await Student.findById(studentId);
      if (!student) {
        throw new Error('Sinh viên không tồn tại');
      }

      // Kiểm tra lớp học có tồn tại không
      const classInfo = await Class.findById(classId).populate('course');
      if (!classInfo) {
        throw new Error('Lớp học không tồn tại');
      }

      // Kiểm tra khóa học có active không
      const course = await Course.findById(classInfo.course);
      if (!course || !course.isActive) {
        throw new Error('Khóa học không tồn tại hoặc đã bị deactivate');
      }

      // Kiểm tra môn tiên quyết
      if (course.prerequisites && course.prerequisites.length > 0) {
        // Lấy tất cả các lớp đã đăng ký và hoàn thành của sinh viên
        const studentRegistrations = (await Registration.find({
          student: studentId,
          status: 'active',
          grade: { $exists: true },
        }).populate({
          path: 'class',
          populate: {
            path: 'course',
          },
        })) as unknown as IPopulatedRegistration[];

        // Lấy danh sách các khóa học đã hoàn thành
        const completedCourseIds = studentRegistrations
          .map((reg) => {
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

      // Kiểm tra lớp học có còn chỗ không
      const hasAvailableSlots = await classService.hasAvailableSlots(classId);
      if (!hasAvailableSlots) {
        throw new Error('Lớp học đã đủ số lượng sinh viên tối đa');
      }

      // Kiểm tra sinh viên đã đăng ký lớp này chưa
      const existingRegistration = await Registration.findOne({
        student: studentId,
        class: classId,
        status: 'active',
      });

      if (existingRegistration) {
        throw new Error('Sinh viên đã đăng ký lớp học này');
      }

      // Tạo đăng ký mới
      const registration = new Registration({
        student: studentId,
        class: classId,
        registrationDate: new Date(),
        status: 'active',
      });

      return await registration.save();
    } catch (error: any) {
      logger.error('Error registering course', {
        module: 'RegistrationService',
        operation: 'registerCourse',
        details: {
          studentId,
          classId,
          error: error.message,
          stack: error.stack,
        },
      });
      throw error;
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
      const registration = await Registration.findById(registrationId);

      if (!registration) {
        throw new Error('Đăng ký không tồn tại');
      }

      // TODO: Kiểm tra thời hạn quy định của học kỳ
      // Giả định: Có một hàm kiểm tra deadline dựa trên học kỳ
      const classInfo = await Class.findById(registration.class);
      if (!classInfo) {
        throw new Error('Lớp học không tồn tại');
      }

      // Cài đặt logic kiểm tra deadline ở đây
      // Ví dụ: isBeforeDeadline(classInfo.semester, classInfo.academicYear)
      // Nếu quá hạn, throw Error

      return await Registration.findByIdAndUpdate(
        registrationId,
        {
          status: 'cancelled',
          cancellationDate: new Date(),
          cancellationReason: reason,
        },
        { new: true }
      );
    } catch (error: any) {
      logger.error('Error cancelling registration', {
        module: 'RegistrationService',
        operation: 'cancelRegistration',
        details: {
          registrationId,
          reason,
          error: error.message,
          stack: error.stack,
        },
      });
      throw error;
    }
  }

  /**
   * Lấy đăng ký của sinh viên
   * @param studentId ID sinh viên
   * @param filters Các bộ lọc
   * @returns Promise<IRegistration[]>
   */
  async getStudentRegistrations(
    studentId: string,
    filters: any = {}
  ): Promise<IRegistration[]> {
    try {
      return await Registration.find({
        student: studentId,
        ...filters,
      }).populate({
        path: 'class',
        populate: {
          path: 'course',
          select: 'courseId name credits',
        },
      });
    } catch (error: any) {
      logger.error('Error getting student registrations', {
        module: 'RegistrationService',
        operation: 'getStudentRegistrations',
        details: {
          studentId,
          filters,
          error: error.message,
          stack: error.stack,
        },
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

      return await Registration.findByIdAndUpdate(
        registrationId,
        { grade },
        { new: true }
      );
    } catch (error: any) {
      logger.error('Error updating grade', {
        module: 'RegistrationService',
        operation: 'updateGrade',
        details: {
          registrationId,
          grade,
          error: error.message,
          stack: error.stack,
        },
      });
      throw error;
    }
  }
}

export default new RegistrationService();
