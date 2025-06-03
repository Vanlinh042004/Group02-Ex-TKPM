import Course, { ICourse } from "../models/Course";
import Class from "../../class/models/Class";
import Registration from "../../registration/models/Registration";
import logger from "../../../utils/logger";
import { Types, Schema } from "mongoose";

// Các hằng số sử dụng trong service
const THIRTY_MINUTES_IN_MS = 30 * 60 * 1000;
const ERROR_MESSAGES = {
  PREREQUISITE_NOT_FOUND: (prereqId: string) =>
    `Môn tiên quyết với ID ${prereqId} không tồn tại`,
  COURSE_NOT_FOUND: "Khóa học không tồn tại",
  CANNOT_CHANGE_COURSE_ID: "Không thể thay đổi mã khóa học",
  CANNOT_CHANGE_CREDITS:
    "Không thể thay đổi số tín chỉ vì đã có sinh viên đăng ký",
  CANNOT_DELETE_AFTER_TIMEOUT:
    "Không thể xóa khóa học sau 30 phút kể từ khi tạo",
  CANNOT_DELETE_WITH_CLASSES: "Không thể xóa khóa học vì đã có lớp học được mở",
};

class CourseService {
  /**
   * Tạo khóa học mới
   * @param courseData Dữ liệu khóa học
   * @returns Promise<ICourse>
   */
  async createCourse(courseData: Partial<ICourse>): Promise<ICourse> {
    try {
      await this.validatePrerequisites(courseData.prerequisites);

      const course = new Course({
        ...courseData,
        createdAt: new Date(),
        isActive: true,
      });

      return await course.save();
    } catch (error: any) {
      this.logError("createCourse", error, { courseData });
      throw error;
    }
  }

  /**
   * Lấy danh sách khóa học
   * @param filters Các bộ lọc
   * @returns Promise<ICourse[]>
   */
  async getCourses(filters: any = {}): Promise<ICourse[]> {
    try {
      return await Course.find(filters)
        .populate("faculty", "name")
        .populate("prerequisites", "courseId name");
    } catch (error: any) {
      this.logError("getCourses", error, { filters });
      throw error;
    }
  }

  /**
   * Lấy chi tiết khóa học
   * @param courseId ID khóa học
   * @returns Promise<ICourse | null>
   */
  async getCourseById(courseId: string): Promise<ICourse | null> {
    try {
      return await Course.findById(courseId)
        .populate("faculty", "name")
        .populate("prerequisites", "courseId name");
    } catch (error: any) {
      this.logError("getCourseById", error, { courseId });
      throw error;
    }
  }

  /**
   * Xóa khóa học
   * Chỉ có thể xóa trong vòng 30 phút sau khi tạo và không có lớp nào
   * @param courseId ID khóa học
   * @returns Promise<boolean>
   */
  async deleteCourse(courseId: string): Promise<boolean> {
    try {
      const course = await Course.findById(courseId);
      if (!course) {
        throw new Error(ERROR_MESSAGES.COURSE_NOT_FOUND);
      }

      await this.validateDeletionTimeConstraint(course.createdAt);
      await this.validateNoClassesExist(courseId);

      await Course.findByIdAndDelete(courseId);
      return true;
    } catch (error: any) {
      this.logError("deleteCourse", error, { courseId });
      throw error;
    }
  }

  /**
   * Cập nhật khóa học
   * @param courseId ID khóa học
   * @param courseData Dữ liệu cập nhật
   * @returns Promise<ICourse | null>
   */
  async updateCourse(
    courseId: string,
    courseData: Partial<ICourse>,
  ): Promise<ICourse | null> {
    try {
      const course = await Course.findById(courseId);
      if (!course) {
        throw new Error(ERROR_MESSAGES.COURSE_NOT_FOUND);
      }

      this.validateCourseIdUnchanged(course.courseId, courseData.courseId);

      if (this.isCreditsChanged(course.credits, courseData.credits)) {
        await this.validateNoActiveRegistrations(courseId);
      }

      return await Course.findByIdAndUpdate(courseId, courseData, {
        new: true,
      });
    } catch (error: any) {
      this.logError("updateCourse", error, { courseId, courseData });
      throw error;
    }
  }

  /**
   * Hủy kích hoạt khóa học (deactivate)
   * @param courseId ID khóa học
   * @returns Promise<ICourse | null>
   */
  async deactivateCourse(courseId: string): Promise<ICourse | null> {
    try {
      const result = await Course.findByIdAndUpdate(
        courseId,
        { isActive: false },
        { new: true },
      );

      if (!result) {
        throw new Error(ERROR_MESSAGES.COURSE_NOT_FOUND);
      }

      return result;
    } catch (error: any) {
      this.logError("deactivateCourse", error, { courseId });
      throw error;
    }
  }

  /**
   * Kiểm tra xem một khóa học có phải là tiên quyết của các khóa học khác không
   * @param courseId ID khóa học
   * @returns Promise<boolean>
   */
  async isPrerequisiteForOtherCourses(courseId: string): Promise<boolean> {
    try {
      const count = await Course.countDocuments({
        prerequisites: new Types.ObjectId(courseId),
      });
      return count > 0;
    } catch (error: any) {
      this.logError("isPrerequisiteForOtherCourses", error, { courseId });
      throw error;
    }
  }

  // Private helper methods

  private async validatePrerequisites(
    prerequisites?: Schema.Types.ObjectId[],
  ): Promise<void> {
    if (!prerequisites || prerequisites.length === 0) {
      return;
    }

    for (const prereqId of prerequisites) {
      const prereq = await Course.findById(prereqId);
      if (!prereq) {
        throw new Error(
          ERROR_MESSAGES.PREREQUISITE_NOT_FOUND(prereqId.toString()),
        );
      }
    }
  }

  private async validateDeletionTimeConstraint(createdAt: Date): Promise<void> {
    const timeElapsed = Date.now() - createdAt.getTime();
    if (timeElapsed > THIRTY_MINUTES_IN_MS) {
      throw new Error(ERROR_MESSAGES.CANNOT_DELETE_AFTER_TIMEOUT);
    }
  }

  private async validateNoClassesExist(courseId: string): Promise<void> {
    const classes = await Class.find({ course: courseId });
    if (classes.length > 0) {
      throw new Error(ERROR_MESSAGES.CANNOT_DELETE_WITH_CLASSES);
    }
  }

  private validateCourseIdUnchanged(originalId: string, newId?: string): void {
    if (newId && newId !== originalId) {
      throw new Error(ERROR_MESSAGES.CANNOT_CHANGE_COURSE_ID);
    }
  }

  private isCreditsChanged(
    originalCredits: number,
    newCredits?: number,
  ): boolean {
    return newCredits !== undefined && newCredits !== originalCredits;
  }

  private async validateNoActiveRegistrations(courseId: string): Promise<void> {
    const classes = await Class.find({ course: courseId });
    if (classes.length > 0) {
      const classIds = classes.map((c) => c._id);
      const registrations = await Registration.findOne({
        class: { $in: classIds },
        status: "active",
      });

      if (registrations) {
        throw new Error(ERROR_MESSAGES.CANNOT_CHANGE_CREDITS);
      }
    }
  }

  private logError(operation: string, error: any, details?: any): void {
    logger.error(`Error in ${operation}`, {
      module: "CourseService",
      operation,
      details: {
        ...details,
        error: error.message,
        stack: error.stack,
      },
    });
  }
}

export default new CourseService();
