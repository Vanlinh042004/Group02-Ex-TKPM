import Class, { IClass } from "../models/Class";
import Course from "../../course/models/Course";
import Registration from "../../registration/models/Registration";
import logger from "../../../utils/logger";

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
        throw new Error("Khóa học không tồn tại");
      }

      if (!course.isActive) {
        throw new Error("Không thể tạo lớp học cho khóa học đã bị deactivate");
      }

      const newClass = new Class(classData);
      return await newClass.save();
    } catch (error: any) {
      logger.error("Error creating class", {
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
      logger.error("Error getting classes", {
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
      logger.error("Error getting class by ID", {
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
      logger.error("Error updating class", {
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
      logger.error("Error getting enrollment count", {
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
        throw new Error("Lớp học không tồn tại");
      }

      const currentEnrollment = await this.getEnrollmentCount(classId);
      return currentEnrollment < classInfo.maxStudents;
    } catch (error: any) {
      logger.error("Error checking available slots", {
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
