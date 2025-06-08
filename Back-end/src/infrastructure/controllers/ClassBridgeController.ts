import { Request, Response } from 'express';
import { ClassService } from '../../application/services/ClassService';
import {
  CreateClassDto,
  UpdateClassDto,
  ClassFilterDto,
} from '../../application/dtos/ClassDto';
import { getClassService } from '../di/serviceRegistry';
import logger from '../../utils/logger';

/**
 * Class Bridge Controller
 * Maintains original API format while using Clean Architecture internally
 */
export class ClassBridgeController {
  private classService: ClassService | null = null;

  private getClassService(): ClassService {
    if (!this.classService) {
      this.classService = getClassService();
    }
    return this.classService;
  }

  /**
   * Create a new class
   * POST /api/v2/classes
   */
  async createClass(req: Request, res: Response): Promise<void> {
    try {
      logger.debug('Creating class', {
        module: 'ClassBridgeController',
        operation: 'CREATE_CLASS',
        details: { classData: req.body },
      });

      // Map request to DTO
      const createDto: CreateClassDto = {
        classId: req.body.classId,
        courseId: req.body.course, // Original API uses 'course', we use 'courseId'
        academicYear: req.body.academicYear,
        semester: req.body.semester,
        instructor: req.body.instructor,
        maxStudents: req.body.maxStudents,
        schedule: req.body.schedule,
        classroom: req.body.classroom,
      };

      const classData = await this.getClassService().createClass(createDto);

      // Map response to original format
      const responseData = this.mapToOriginalFormat(classData);

      logger.info('Class created successfully', {
        module: 'ClassBridgeController',
        operation: 'CREATE_CLASS',
        details: { classId: classData.classId },
      });

      // Log audit trail for creation
      logger.audit('CREATE', 'class', classData.classId, null, responseData);

      res.status(201).json({
        success: true,
        data: responseData,
      });
    } catch (error: any) {
      logger.error('Error creating class', {
        module: 'ClassBridgeController',
        operation: 'CREATE_CLASS',
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
   * Get all classes with filters
   * GET /api/v2/classes
   */
  async getClasses(req: Request, res: Response): Promise<void> {
    try {
      const filters: ClassFilterDto = {
        courseId: req.query.course as string, // Map 'course' to 'courseId'
        academicYear: req.query.academicYear as string,
        semester: req.query.semester as string,
        instructor: req.query.instructor as string,
        classroom: req.query.classroom as string,
        minStudents: req.query.minStudents
          ? parseInt(req.query.minStudents as string)
          : undefined,
        maxStudents: req.query.maxStudents
          ? parseInt(req.query.maxStudents as string)
          : undefined,
      };

      logger.debug('Getting classes', {
        module: 'ClassBridgeController',
        operation: 'GET_CLASSES',
        details: { filters },
      });

      // For original API compatibility, use populated courses
      const classes =
        await this.getClassService().getClassesWithPopulatedCourse();

      logger.info('Classes retrieved successfully', {
        module: 'ClassBridgeController',
        operation: 'GET_CLASSES',
        details: { count: classes.length },
      });

      res.status(200).json({
        success: true,
        data: classes,
      });
    } catch (error: any) {
      logger.error('Error getting classes', {
        module: 'ClassBridgeController',
        operation: 'GET_CLASSES',
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
   * Get class by ID
   * GET /api/v2/classes/:id
   */
  async getClassById(req: Request, res: Response): Promise<void> {
    try {
      logger.debug('Getting class by ID', {
        module: 'ClassBridgeController',
        operation: 'GET_CLASS_BY_ID',
        details: { classId: req.params.id },
      });

      const classData = await this.getClassService().getClassById(
        req.params.id
      );

      if (!classData) {
        logger.warn('Class not found', {
          module: 'ClassBridgeController',
          operation: 'GET_CLASS_BY_ID',
          details: { classId: req.params.id },
        });

        res.status(404).json({
          success: false,
          message: 'Lớp học không tồn tại',
        });
        return;
      }

      // For single class, get with populated course data
      const populatedClasses =
        await this.getClassService().getClassesWithPopulatedCourse();
      const populatedClass = populatedClasses.find(
        (c) => c._id.toString() === req.params.id
      );

      logger.info('Class retrieved successfully', {
        module: 'ClassBridgeController',
        operation: 'GET_CLASS_BY_ID',
        details: { classId: classData.classId },
      });

      res.status(200).json({
        success: true,
        data: populatedClass || this.mapToOriginalFormat(classData),
      });
    } catch (error: any) {
      logger.error('Error getting class by ID', {
        module: 'ClassBridgeController',
        operation: 'GET_CLASS_BY_ID',
        details: {
          classId: req.params.id,
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
   * Update class
   * PUT /api/v2/classes/:id
   */
  async updateClass(req: Request, res: Response): Promise<void> {
    try {
      logger.debug('Updating class', {
        module: 'ClassBridgeController',
        operation: 'UPDATE_CLASS',
        details: {
          classId: req.params.id,
          updateData: req.body,
        },
      });

      // Get class before update for audit
      const oldClass = await this.getClassService().getClassById(req.params.id);

      const updateDto: UpdateClassDto = {
        instructor: req.body.instructor,
        maxStudents: req.body.maxStudents,
        schedule: req.body.schedule,
        classroom: req.body.classroom,
      };

      const classData = await this.getClassService().updateClass(
        req.params.id,
        updateDto
      );

      if (!classData) {
        logger.warn('Class not found for update', {
          module: 'ClassBridgeController',
          operation: 'UPDATE_CLASS',
          details: { classId: req.params.id },
        });

        res.status(404).json({
          success: false,
          message: 'Lớp học không tồn tại',
        });
        return;
      }

      const responseData = this.mapToOriginalFormat(classData);

      logger.info('Class updated successfully', {
        module: 'ClassBridgeController',
        operation: 'UPDATE_CLASS',
        details: { classId: classData.classId },
      });

      // Log audit trail for update
      logger.audit(
        'UPDATE',
        'class',
        classData.classId,
        oldClass,
        responseData
      );

      res.status(200).json({
        success: true,
        data: responseData,
      });
    } catch (error: any) {
      logger.error('Error updating class', {
        module: 'ClassBridgeController',
        operation: 'UPDATE_CLASS',
        details: {
          classId: req.params.id,
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
   * Get enrollment count
   * GET /api/v2/classes/:id/enrollment
   */
  async getEnrollmentCount(req: Request, res: Response): Promise<void> {
    try {
      logger.debug('Getting enrollment count', {
        module: 'ClassBridgeController',
        operation: 'GET_ENROLLMENT_COUNT',
        details: { classId: req.params.id },
      });

      const count = await this.getClassService().getEnrollmentCount(
        req.params.id
      );

      logger.info('Enrollment count retrieved successfully', {
        module: 'ClassBridgeController',
        operation: 'GET_ENROLLMENT_COUNT',
        details: {
          classId: req.params.id,
          count,
        },
      });

      res.status(200).json({
        success: true,
        data: { count },
      });
    } catch (error: any) {
      logger.error('Error getting enrollment count', {
        module: 'ClassBridgeController',
        operation: 'GET_ENROLLMENT_COUNT',
        details: {
          classId: req.params.id,
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

  // Helper method to map Clean Architecture response to original format
  private mapToOriginalFormat(classData: any): any {
    return {
      _id: classData.id,
      classId: classData.classId,
      course: classData.courseId, // Map back to 'course' for original API
      academicYear: classData.academicYear,
      semester: classData.semester,
      instructor: classData.instructor,
      maxStudents: classData.maxStudents,
      schedule: classData.schedule,
      classroom: classData.classroom,
      createdAt: classData.createdAt,
      updatedAt: classData.updatedAt,
    };
  }
}

export default ClassBridgeController;
