import Course, { ICourse } from '../models/Course';
import Class from '../../class/models/Class';
import Registration from '../../registration/models/Registration';
import logger from '../../../utils/logger';
import { Types } from 'mongoose';

class CourseService {
  /**
   * Tạo khóa học mới
   * @param courseData Dữ liệu khóa học
   * @returns Promise<ICourse>
   */
  async createCourse(courseData: Partial<ICourse>): Promise<ICourse> {
    try {
      // Kiểm tra môn tiên quyết có tồn tại không
      if (courseData.prerequisites && courseData.prerequisites.length > 0) {
        for (const prereqId of courseData.prerequisites) {
          const prereq = await Course.findById(prereqId);
          if (!prereq) {
            throw new Error(`Môn tiên quyết với ID ${prereqId} không tồn tại`);
          }
        }
      }

      // Tạo khóa học mới
      const course = new Course({
        ...courseData,
        createdAt: new Date(),
        isActive: true,
      });

      return await course.save();
    } catch (error: any) {
      logger.error('Error creating course', {
        module: 'CourseService',
        operation: 'createCourse',
        details: {
          error: error.message,
          stack: error.stack,
        },
      });
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
        .populate('faculty', 'name')
        .populate('prerequisites', 'courseId name');
    } catch (error: any) {
      logger.error('Error getting courses', {
        module: 'CourseService',
        operation: 'getCourses',
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
   * Lấy chi tiết khóa học
   * @param courseId ID khóa học
   * @returns Promise<ICourse | null>
   */
  async getCourseById(courseId: string): Promise<ICourse | null> {
    try {
      return await Course.findById(courseId)
        .populate('faculty', 'name')
        .populate('prerequisites', 'courseId name');
    } catch (error: any) {
      logger.error('Error getting course by ID', {
        module: 'CourseService',
        operation: 'getCourseById',
        details: {
          courseId,
          error: error.message,
          stack: error.stack,
        },
      });
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
        throw new Error('Khóa học không tồn tại');
      }

      // Kiểm tra thời gian tạo (30 phút)
      const timeElapsed = Date.now() - course.createdAt.getTime();
      const thirtyMinutesInMs = 30 * 60 * 1000;

      if (timeElapsed > thirtyMinutesInMs) {
        throw new Error('Không thể xóa khóa học sau 30 phút kể từ khi tạo');
      }

      // Kiểm tra xem có lớp học nào được mở cho khóa học này không
      const classes = await Class.find({ course: courseId });
      if (classes.length > 0) {
        throw new Error('Không thể xóa khóa học vì đã có lớp học được mở');
      }

      await Course.findByIdAndDelete(courseId);
      return true;
    } catch (error: any) {
      logger.error('Error deleting course', {
        module: 'CourseService',
        operation: 'deleteCourse',
        details: {
          courseId,
          error: error.message,
          stack: error.stack,
        },
      });
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
    courseData: Partial<ICourse>
  ): Promise<ICourse | null> {
    try {
      const course = await Course.findById(courseId);

      if (!course) {
        throw new Error('Khóa học không tồn tại');
      }

      // Không cho phép thay đổi mã khóa học
      if (courseData.courseId && courseData.courseId !== course.courseId) {
        throw new Error('Không thể thay đổi mã khóa học');
      }

      // Kiểm tra nếu thay đổi số tín chỉ
      if (courseData.credits && courseData.credits !== course.credits) {
        // Kiểm tra xem đã có sinh viên đăng ký chưa
        const classes = await Class.find({ course: courseId });
        if (classes.length > 0) {
          const classIds = classes.map((c) => c._id);
          const registrations = await Registration.findOne({
            class: { $in: classIds },
            status: 'active',
          });

          if (registrations) {
            throw new Error(
              'Không thể thay đổi số tín chỉ vì đã có sinh viên đăng ký'
            );
          }
        }
      }

      return await Course.findByIdAndUpdate(courseId, courseData, {
        new: true,
      });
    } catch (error: any) {
      logger.error('Error updating course', {
        module: 'CourseService',
        operation: 'updateCourse',
        details: {
          courseId,
          updateData: courseData,
          error: error.message,
          stack: error.stack,
        },
      });
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
      return await Course.findByIdAndUpdate(
        courseId,
        { isActive: false },
        { new: true }
      );
    } catch (error: any) {
      logger.error('Error deactivating course', {
        module: 'CourseService',
        operation: 'deactivateCourse',
        details: {
          courseId,
          error: error.message,
          stack: error.stack,
        },
      });
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
      logger.error('Error checking if course is prerequisite', {
        module: 'CourseService',
        operation: 'isPrerequisiteForOtherCourses',
        details: {
          courseId,
          error: error.message,
          stack: error.stack,
        },
      });
      throw error;
    }
  }
}

export default new CourseService();
