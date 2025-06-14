import Class, { IClass } from "../models/Class";
import Course from "../../course/models/Course";
import Registration from "../../registration/models/Registration";
import logger from "../../../utils/logger";
import i18next from "../../../config/i18n";

class ClassService {
  /**
   * Tạo lớp học mới
   * @param classData Dữ liệu lớp học
   * @returns Promise<IClass>
   */
  async createClass(classData: Partial<IClass>): Promise<IClass> {
    try {
      // Kiểm tra khóa học có tồn tại và đang active không
      const course = await Course.findById(classData.course);
      if (!course) {
        throw new Error(i18next.t('errors:course_not_found'));
      }

      if (!course.isActive) {
        throw new Error(i18next.t('errors:cannot_create_class_for_inactive_course'));
      }

      const newClass = new Class(classData);
      return await newClass.save();
    } catch (error: any) {
      logger.error(i18next.t('common:logging.error_creating_class'), {
        module: "ClassService",
        operation: "createClass",
        details: {
          error: error.message,
          stack: error.stack,
        },
      });
      throw error;
    }
  }

  /**
   * Lấy danh sách lớp học
   * @param filters Các bộ lọc
   * @returns Promise<IClass[]>
   */
  async getClasses(filters: any = {}): Promise<IClass[]> {
    try {
      return await Class.find(filters).populate({
        path: "course",
        populate: {
          path: "faculty",
          select: "name",
        },
      });
    } catch (error: any) {
      logger.error(i18next.t('common:logging.error_getting_classes'), {
        module: "ClassService",
        operation: "getClasses",
        details: {
          filters,
          error: error.message,
          stack: error.stack,
        },
      });
      throw error;
    }
  }

  /**
   * Lấy chi tiết lớp học
   * @param classId ID lớp học
   * @returns Promise<IClass | null>
   */
  async getClassById(classId: string): Promise<IClass | null> {
    try {
      return await Class.findById(classId).populate({
        path: "course",
        populate: {
          path: "faculty",
          select: "name",
        },
      });
    } catch (error: any) {
      logger.error(i18next.t('common:logging.error_getting_class_by_id'), {
        module: "ClassService",
        operation: "getClassById",
        details: {
          classId,
          error: error.message,
          stack: error.stack,
        },
      });
      throw error;
    }
  }

  /**
   * Cập nhật thông tin lớp học
   * @param classId ID lớp học
   * @param classData Dữ liệu cập nhật
   * @returns Promise<IClass | null>
   */
  async updateClass(
    classId: string,
    classData: Partial<IClass>,
  ): Promise<IClass | null> {
    try {
      return await Class.findByIdAndUpdate(classId, classData, { new: true });
    } catch (error: any) {
      logger.error(i18next.t('common:logging.error_updating_class'), {
        module: "ClassService",
        operation: "updateClass",
        details: {
          classId,
          updateData: classData,
          error: error.message,
          stack: error.stack,
        },
      });
      throw error;
    }
  }

  /**
   * Kiểm tra số lượng sinh viên đăng ký
   * @param classId ID lớp học
   * @returns Promise<number>
   */
  async getEnrollmentCount(classId: string): Promise<number> {
    try {
      return await Registration.countDocuments({
        class: classId,
        status: "active",
      });
    } catch (error: any) {
      logger.error(i18next.t('common:logging.error_getting_enrollment_count'), {
        module: "ClassService",
        operation: "getEnrollmentCount",
        details: {
          classId,
          error: error.message,
          stack: error.stack,
        },
      });
      throw error;
    }
  }

  /**
   * Kiểm tra lớp học có đủ chỗ để đăng ký không
   * @param classId ID lớp học
   * @returns Promise<boolean>
   */
  async hasAvailableSlots(classId: string): Promise<boolean> {
    try {
      const classInfo = await Class.findById(classId);
      if (!classInfo) {
        throw new Error(i18next.t('errors:class_not_found'));
      }

      const currentEnrollment = await this.getEnrollmentCount(classId);
      return currentEnrollment < classInfo.maxStudents;
    } catch (error: any) {
      logger.error(i18next.t('common:logging.error_checking_available_slots'), {
        module: "ClassService",
        operation: "hasAvailableSlots",
        details: {
          classId,
          error: error.message,
          stack: error.stack,
        },
      });
      throw error;
    }
  }
}

export default new ClassService();
