import { Request, Response } from 'express';
import courseService from '../services/courseService';
import logger from '../../../utils/logger';

class CourseController {
  /**
   * Thêm khóa học mới
   * @param req Request
   * @param res Response
   */
  async createCourse(req: Request, res: Response): Promise<void> {
    try {
      logger.debug('Creating course', {
        module: 'CourseController',
        operation: 'CREATE_COURSE',
        details: { courseData: req.body },
      });

      const course = await courseService.createCourse(req.body);

      logger.info('Course created successfully', {
        module: 'CourseController',
        operation: 'CREATE_COURSE',
        details: { courseId: course.courseId },
      });

      // Log audit trail for creation
      logger.audit('CREATE', 'course', course.courseId, null, course);

      res.status(201).json({
        success: true,
        data: course,
      });
    } catch (error: any) {
      logger.error('Error creating course', {
        module: 'CourseController',
        operation: 'CREATE_COURSE',
        details: {
          error: error.message,
          stack: error.stack,
        },
      });
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Lấy danh sách khóa học
   * @param req Request
   * @param res Response
   */
  async getCourses(req: Request, res: Response): Promise<void> {
    try {
      const filters = req.query;

      logger.debug('Getting courses', {
        module: 'CourseController',
        operation: 'GET_COURSES',
        details: { filters },
      });

      const courses = await courseService.getCourses(filters);

      logger.info('Courses retrieved successfully', {
        module: 'CourseController',
        operation: 'GET_COURSES',
        details: { count: courses.length },
      });

      res.status(200).json({
        success: true,
        data: courses,
      });
    } catch (error: any) {
      logger.error('Error getting courses', {
        module: 'CourseController',
        operation: 'GET_COURSES',
        details: {
          error: error.message,
          stack: error.stack,
        },
      });
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Lấy chi tiết khóa học
   * @param req Request
   * @param res Response
   */
  async getCourseById(req: Request, res: Response): Promise<void> {
    try {
      logger.debug('Getting course by ID', {
        module: 'CourseController',
        operation: 'GET_COURSE_BY_ID',
        details: { courseId: req.params.id },
      });

      const course = await courseService.getCourseById(req.params.id);

      if (!course) {
        logger.warn('Course not found', {
          module: 'CourseController',
          operation: 'GET_COURSE_BY_ID',
          details: { courseId: req.params.id },
        });

        res.status(404).json({
          success: false,
          message: 'Khóa học không tồn tại',
        });
        return;
      }

      logger.info('Course retrieved successfully', {
        module: 'CourseController',
        operation: 'GET_COURSE_BY_ID',
        details: { courseId: course.courseId },
      });

      res.status(200).json({
        success: true,
        data: course,
      });
    } catch (error: any) {
      logger.error('Error getting course by ID', {
        module: 'CourseController',
        operation: 'GET_COURSE_BY_ID',
        details: {
          courseId: req.params.id,
          error: error.message,
          stack: error.stack,
        },
      });
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Xóa khóa học
   * @param req Request
   * @param res Response
   */
  async deleteCourse(req: Request, res: Response): Promise<void> {
    try {
      logger.debug('Deleting course', {
        module: 'CourseController',
        operation: 'DELETE_COURSE',
        details: { courseId: req.params.id },
      });

      // Get course before deletion for audit
      const courseToDelete = await courseService.getCourseById(req.params.id);

      await courseService.deleteCourse(req.params.id);

      logger.info('Course deleted successfully', {
        module: 'CourseController',
        operation: 'DELETE_COURSE',
        details: { courseId: req.params.id },
      });

      // Log audit trail for deletion
      logger.audit('DELETE', 'course', req.params.id, courseToDelete, null);

      res.status(200).json({
        success: true,
        message: 'Xóa khóa học thành công',
      });
    } catch (error: any) {
      logger.error('Error deleting course', {
        module: 'CourseController',
        operation: 'DELETE_COURSE',
        details: {
          courseId: req.params.id,
          error: error.message,
          stack: error.stack,
        },
      });
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Cập nhật khóa học
   * @param req Request
   * @param res Response
   */
  async updateCourse(req: Request, res: Response): Promise<void> {
    try {
      logger.debug('Updating course', {
        module: 'CourseController',
        operation: 'UPDATE_COURSE',
        details: {
          courseId: req.params.id,
          updateData: req.body,
        },
      });

      // Get course before update for audit
      const oldCourse = await courseService.getCourseById(req.params.id);

      const course = await courseService.updateCourse(req.params.id, req.body);

      if (!course) {
        logger.warn('Course not found for update', {
          module: 'CourseController',
          operation: 'UPDATE_COURSE',
          details: { courseId: req.params.id },
        });

        res.status(404).json({
          success: false,
          message: 'Khóa học không tồn tại',
        });
        return;
      }

      logger.info('Course updated successfully', {
        module: 'CourseController',
        operation: 'UPDATE_COURSE',
        details: { courseId: course.courseId },
      });

      // Log audit trail for update
      logger.audit('UPDATE', 'course', course.courseId, oldCourse, course);

      res.status(200).json({
        success: true,
        data: course,
      });
    } catch (error: any) {
      logger.error('Error updating course', {
        module: 'CourseController',
        operation: 'UPDATE_COURSE',
        details: {
          courseId: req.params.id,
          error: error.message,
          stack: error.stack,
        },
      });
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Hủy kích hoạt khóa học (deactivate)
   * @param req Request
   * @param res Response
   */
  async deactivateCourse(req: Request, res: Response): Promise<void> {
    try {
      logger.debug('Deactivating course', {
        module: 'CourseController',
        operation: 'DEACTIVATE_COURSE',
        details: { courseId: req.params.id },
      });

      // Get course before deactivation for audit
      const oldCourse = await courseService.getCourseById(req.params.id);

      const course = await courseService.deactivateCourse(req.params.id);

      if (!course) {
        logger.warn('Course not found for deactivation', {
          module: 'CourseController',
          operation: 'DEACTIVATE_COURSE',
          details: { courseId: req.params.id },
        });

        res.status(404).json({
          success: false,
          message: 'Khóa học không tồn tại',
        });
        return;
      }

      logger.info('Course deactivated successfully', {
        module: 'CourseController',
        operation: 'DEACTIVATE_COURSE',
        details: { courseId: course.courseId },
      });

      // Log audit trail for deactivation
      logger.audit('DEACTIVATE', 'course', course.courseId, oldCourse, course);

      res.status(200).json({
        success: true,
        data: course,
        message: 'Khóa học đã bị deactivate',
      });
    } catch (error: any) {
      logger.error('Error deactivating course', {
        module: 'CourseController',
        operation: 'DEACTIVATE_COURSE',
        details: {
          courseId: req.params.id,
          error: error.message,
          stack: error.stack,
        },
      });
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default new CourseController();
