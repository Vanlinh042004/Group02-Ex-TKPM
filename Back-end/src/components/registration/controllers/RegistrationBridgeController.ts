import { Request, Response } from 'express';
import { RegistrationService } from '../../../application/services/RegistrationService';
import {
  CreateRegistrationDto,
  AssignGradeDto,
  CancelRegistrationDto,
  RegistrationFilterDto,
} from '../../../application/dtos/RegistrationDto';

/**
 * Registration Bridge Controller
 * Maintains original API format while using Clean Architecture internally
 */
export class RegistrationBridgeController {
  private getRegistrationService(): RegistrationService {
    // Lazy loading to avoid circular dependency
    const {
      getRegistrationService,
    } = require('../../../infrastructure/di/serviceRegistry');
    return getRegistrationService();
  }

  /**
   * Register student for course
   * POST /api/registrations
   * Body: { studentId, classId }
   */
  async registerCourse(req: Request, res: Response): Promise<void> {
    try {
      const { studentId, classId } = req.body;

      if (!studentId || !classId) {
        res
          .status(400)
          .json({ message: 'Student ID and Class ID are required' });
        return;
      }

      const dto: CreateRegistrationDto = { studentId, classId };
      const result = await this.getRegistrationService().registerCourse(dto);

      // Convert to legacy format for API compatibility
      const legacyResponse = {
        _id: result.id,
        student: result.studentId,
        class: result.classId,
        registrationDate: result.registrationDate,
        grade: result.grade,
        status: result.status,
        cancellationDate: result.cancellationDate,
        cancellationReason: result.cancellationReason,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      };

      res.status(200).json({
        message: 'Register successfully',
        data: legacyResponse,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Get all registrations
   * GET /api/registrations
   */
  async getAllRegistrations(req: Request, res: Response): Promise<void> {
    try {
      // Extract filters from query parameters
      const filters: RegistrationFilterDto = {};
      if (req.query.studentId)
        filters.studentId = req.query.studentId as string;
      if (req.query.classId) filters.classId = req.query.classId as string;
      if (req.query.status)
        filters.status = req.query.status as 'active' | 'cancelled';

      // Use legacy API with population for backward compatibility
      const result =
        await this.getRegistrationService().getAllRegistrationsWithPopulation();

      res.status(200).json({
        message: 'Fetch all registrations successfully',
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Cancel registration
   * PUT /api/registrations/:registrationId/cancel
   * Body: { reason }
   */
  async cancelRegistration(req: Request, res: Response): Promise<void> {
    try {
      const { registrationId } = req.params;
      const { reason } = req.body;

      if (!reason) {
        res.status(400).json({ message: 'Cancellation reason is required' });
        return;
      }

      const dto: CancelRegistrationDto = { reason };
      const result = await this.getRegistrationService().cancelRegistration(
        registrationId,
        dto
      );

      // Convert to legacy format
      const legacyResponse = {
        _id: result.id,
        student: result.studentId,
        class: result.classId,
        registrationDate: result.registrationDate,
        grade: result.grade,
        status: result.status,
        cancellationDate: result.cancellationDate,
        cancellationReason: result.cancellationReason,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      };

      res.status(200).json({
        message: 'Cancel registration successfully',
        data: legacyResponse,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Update grade
   * PUT /api/registrations/:registrationId/grade
   * Body: { grade }
   */
  async updateGrade(req: Request, res: Response): Promise<void> {
    try {
      const { registrationId } = req.params;
      const { grade } = req.body;

      if (grade === undefined || grade === null) {
        res.status(400).json({ message: 'Grade is required' });
        return;
      }

      const dto: AssignGradeDto = { grade };
      const result = await this.getRegistrationService().assignGrade(
        registrationId,
        dto
      );

      // Convert to legacy format
      const legacyResponse = {
        _id: result.id,
        student: result.studentId,
        class: result.classId,
        registrationDate: result.registrationDate,
        grade: result.grade,
        status: result.status,
        cancellationDate: result.cancellationDate,
        cancellationReason: result.cancellationReason,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      };

      res.status(200).json({
        message: 'Update grade successfully',
        data: legacyResponse,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Get students in class
   * GET /api/registrations/class/:classId/students
   */
  async getAllStudentsFromClass(req: Request, res: Response): Promise<void> {
    try {
      const { classId } = req.params;

      // Use legacy API with population for backward compatibility
      const result =
        await this.getRegistrationService().getStudentsInClassWithPopulation(
          classId
        );

      res.status(200).json({
        message: 'Fetch all students in class successfully',
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Generate student transcript
   * GET /api/registrations/transcript/:studentId
   */
  async generateTranscript(req: Request, res: Response): Promise<void> {
    try {
      const { studentId } = req.params;

      const transcript = await this.getRegistrationService().generateTranscript(
        studentId
      );

      // Return transcript in legacy format
      res.status(200).json(transcript);
    } catch (error: any) {
      res.status(500).json({
        message: error.message,
      });
    }
  }

  // Additional Clean Architecture endpoints (v2 API)

  /**
   * Get registration by ID (Clean Architecture format)
   * GET /api/v2/registrations/:id
   */
  async getRegistrationById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.getRegistrationService().getRegistrationById(
        id
      );

      res.status(200).json({
        message: 'Registration retrieved successfully',
        data: result,
      });
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }

  /**
   * Get registrations by student (Clean Architecture format)
   * GET /api/v2/registrations/student/:studentId
   */
  async getRegistrationsByStudent(req: Request, res: Response): Promise<void> {
    try {
      const { studentId } = req.params;
      const result =
        await this.getRegistrationService().getRegistrationsByStudent(
          studentId
        );

      res.status(200).json({
        message: 'Student registrations retrieved successfully',
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Get registrations by class (Clean Architecture format)
   * GET /api/v2/registrations/class/:classId
   */
  async getRegistrationsByClass(req: Request, res: Response): Promise<void> {
    try {
      const { classId } = req.params;
      const result =
        await this.getRegistrationService().getRegistrationsByClass(classId);

      res.status(200).json({
        message: 'Class registrations retrieved successfully',
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Get registration statistics
   * GET /api/v2/registrations/statistics
   * GET /api/v2/registrations/class/:classId/statistics
   */
  async getRegistrationStatistics(req: Request, res: Response): Promise<void> {
    try {
      const { classId } = req.params;
      const result =
        await this.getRegistrationService().getRegistrationStatistics(classId);

      res.status(200).json({
        message: 'Registration statistics retrieved successfully',
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Search registrations (Clean Architecture format)
   * POST /api/v2/registrations/search
   */
  async searchRegistrations(req: Request, res: Response): Promise<void> {
    try {
      const searchDto = req.body;
      const result = await this.getRegistrationService().searchRegistrations(
        searchDto
      );

      res.status(200).json({
        message: 'Registrations searched successfully',
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
