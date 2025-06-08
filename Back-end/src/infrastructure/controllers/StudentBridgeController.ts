/**
 * StudentBridgeController
 *
 * Bridge controller để integrate Clean Architecture với existing student routes
 * Giữ nguyên interface của existing controller nhưng sử dụng Clean Architecture bên dưới
 */

import { Request, Response } from 'express';
import { StudentSimpleAdapter } from '../adapters/StudentSimpleAdapter';
import { serviceRegistry } from '../di/serviceRegistry';
import logger from '../../utils/logger';

export class StudentBridgeController {
  private adapter: StudentSimpleAdapter;

  constructor() {
    // Lazy load adapter để tránh circular dependency
    this.adapter = serviceRegistry.getService('StudentComponentAdapter');
  }

  /**
   * Add student - Bridge to Clean Architecture
   */
  async addStudent(req: Request, res: Response): Promise<void> {
    try {
      logger.debug('Creating student via Clean Architecture', {
        module: 'StudentBridgeController',
        operation: 'ADD_STUDENT',
        details: { studentData: req.body },
      });

      const studentData = await this.adapter.addStudent(req.body);

      logger.info('Student created successfully via Clean Architecture', {
        module: 'StudentBridgeController',
        operation: 'ADD_STUDENT',
        details: { studentId: studentData.studentId },
      });

      // Log audit trail for creation
      logger.audit(
        'CREATE',
        'student',
        studentData.studentId,
        null,
        studentData
      );

      res.status(201).json({
        success: true,
        data: studentData,
      });
    } catch (error: any) {
      logger.error('Error creating student via Clean Architecture', {
        module: 'StudentBridgeController',
        operation: 'ADD_STUDENT',
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
   * Delete student - Bridge to Clean Architecture
   */
  async deleteStudent(req: Request, res: Response): Promise<void> {
    try {
      const { studentId } = req.params;

      logger.debug('Deleting student via Clean Architecture', {
        module: 'StudentBridgeController',
        operation: 'DELETE_STUDENT',
        details: { studentId },
      });

      // Get student data before deletion for audit
      const studentData = await this.adapter.getStudentById(studentId);

      await this.adapter.deleteStudent(studentId);

      logger.info('Student deleted successfully via Clean Architecture', {
        module: 'StudentBridgeController',
        operation: 'DELETE_STUDENT',
        details: { studentId },
      });

      // Log audit trail for deletion
      if (studentData) {
        logger.audit('DELETE', 'student', studentId, studentData, null);
      }

      res.status(200).json({
        success: true,
        message: 'Student deleted successfully',
      });
    } catch (error: any) {
      logger.error('Error deleting student via Clean Architecture', {
        module: 'StudentBridgeController',
        operation: 'DELETE_STUDENT',
        details: {
          studentId: req.params.studentId,
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
   * Update student - Bridge to Clean Architecture
   */
  async updateStudent(req: Request, res: Response): Promise<void> {
    try {
      const { studentId } = req.params;

      logger.debug('Updating student via Clean Architecture', {
        module: 'StudentBridgeController',
        operation: 'UPDATE_STUDENT',
        details: {
          studentId,
          updateData: req.body,
        },
      });

      // Get student before update for audit
      const oldStudent = await this.adapter.getStudentById(studentId);

      const studentData = await this.adapter.updateStudent(studentId, req.body);

      logger.info('Student updated successfully via Clean Architecture', {
        module: 'StudentBridgeController',
        operation: 'UPDATE_STUDENT',
        details: { studentId: studentData.studentId },
      });

      // Log audit trail for update
      logger.audit(
        'UPDATE',
        'student',
        studentData.studentId,
        oldStudent,
        studentData
      );

      res.status(200).json({
        success: true,
        data: studentData,
      });
    } catch (error: any) {
      logger.error('Error updating student via Clean Architecture', {
        module: 'StudentBridgeController',
        operation: 'UPDATE_STUDENT',
        details: {
          studentId: req.params.studentId,
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
   * Search student - Bridge to Clean Architecture
   */
  async searchStudent(req: Request, res: Response): Promise<void> {
    try {
      const searchParams = req.query;

      logger.debug('Searching students via Clean Architecture', {
        module: 'StudentBridgeController',
        operation: 'SEARCH_STUDENT',
        details: { searchParams },
      });

      const students = await this.adapter.searchStudent(searchParams);

      if (students.length === 0) {
        logger.info('No students found via Clean Architecture', {
          module: 'StudentBridgeController',
          operation: 'SEARCH_STUDENT',
          details: { searchParams },
        });

        res.status(404).json({
          success: false,
          message: 'No students found with search parameters',
        });
        return;
      }

      logger.info('Students found successfully via Clean Architecture', {
        module: 'StudentBridgeController',
        operation: 'SEARCH_STUDENT',
        details: { count: students.length, searchParams },
      });

      res.status(200).json({
        success: true,
        data: students,
      });
    } catch (error: any) {
      logger.error('Error searching students via Clean Architecture', {
        module: 'StudentBridgeController',
        operation: 'SEARCH_STUDENT',
        details: {
          searchParams: req.query,
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
   * Get all students - Bridge to Clean Architecture
   */
  async getAllStudent(req: Request, res: Response): Promise<void> {
    try {
      logger.debug('Getting all students via Clean Architecture', {
        module: 'StudentBridgeController',
        operation: 'GET_ALL_STUDENTS',
      });

      const students = await this.adapter.getAllStudents();

      logger.info(
        'Successfully retrieved all students via Clean Architecture',
        {
          module: 'StudentBridgeController',
          operation: 'GET_ALL_STUDENTS',
          details: { count: students.length },
        }
      );

      res.status(200).json({
        success: true,
        data: students,
      });
    } catch (error: any) {
      logger.error('Error retrieving all students via Clean Architecture', {
        module: 'StudentBridgeController',
        operation: 'GET_ALL_STUDENTS',
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
   * Import data - Bridge to existing implementation (for now)
   * TODO: Migrate to Clean Architecture in future
   */
  async importData(req: Request, res: Response): Promise<void> {
    // Delegate to original implementation for now
    const originalController =
      require('../../components/student/controllers/studentController').default;
    return originalController.importData(req, res);
  }

  /**
   * Export data - Bridge to existing implementation (for now)
   * TODO: Migrate to Clean Architecture in future
   */
  async exportData(req: Request, res: Response): Promise<void> {
    // Delegate to original implementation for now
    const originalController =
      require('../../components/student/controllers/studentController').default;
    return originalController.exportData(req, res);
  }
}

export default new StudentBridgeController();
