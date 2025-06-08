import { Request, Response } from 'express';
import {
  CourseService,
  CreateCourseDTO,
  UpdateCourseDTO,
} from '../../application/services/CourseService';

export class CourseBridgeController {
  constructor(private courseService: CourseService) {}

  async createCourse(req: Request, res: Response): Promise<void> {
    try {
      const createDTO: CreateCourseDTO = {
        courseId: req.body.courseId,
        name: req.body.name,
        credits: req.body.credits,
        faculty: req.body.faculty,
        description: req.body.description,
        prerequisites: req.body.prerequisites,
      };

      const result = await this.courseService.createCourse(createDTO);

      // Maintain original response format
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getCourses(req: Request, res: Response): Promise<void> {
    try {
      const filters = req.query;
      const result = await this.courseService.getCourses(filters);

      // Maintain original response format
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getCourseById(req: Request, res: Response): Promise<void> {
    try {
      const courseId = req.params.id;
      const result = await this.courseService.getCourseById(courseId);

      if (!result) {
        res.status(404).json({
          success: false,
          message: 'Khóa học không tồn tại',
        });
        return;
      }

      // Maintain original response format
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateCourse(req: Request, res: Response): Promise<void> {
    try {
      const courseId = req.params.id;
      const updateDTO: UpdateCourseDTO = req.body;

      const result = await this.courseService.updateCourse(courseId, updateDTO);

      if (!result) {
        res.status(404).json({
          success: false,
          message: 'Khóa học không tồn tại',
        });
        return;
      }

      // Maintain original response format
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async deleteCourse(req: Request, res: Response): Promise<void> {
    try {
      const courseId = req.params.id;
      await this.courseService.deleteCourse(courseId);

      // Maintain original response format
      res.status(200).json({
        success: true,
        message: 'Xóa khóa học thành công',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async deactivateCourse(req: Request, res: Response): Promise<void> {
    try {
      const courseId = req.params.id;
      const result = await this.courseService.deactivateCourse(courseId);

      if (!result) {
        res.status(404).json({
          success: false,
          message: 'Khóa học không tồn tại',
        });
        return;
      }

      // Maintain original response format
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // New endpoints for Clean Architecture
  async validateDeletion(req: Request, res: Response): Promise<void> {
    try {
      const courseId = req.params.id;
      const result = await this.courseService.validateCourseCanBeDeleted(
        courseId
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getCoursesWithPrerequisite(req: Request, res: Response): Promise<void> {
    try {
      const prerequisiteId = req.params.prerequisiteId;
      const result = await this.courseService.getCoursesWithPrerequisite(
        prerequisiteId
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async searchCourses(req: Request, res: Response): Promise<void> {
    try {
      const searchTerm = req.query.q as string;

      if (!searchTerm) {
        res.status(400).json({
          success: false,
          message: 'Search term is required',
        });
        return;
      }

      const result = await this.courseService.searchCoursesByName(searchTerm);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getCoursesByFaculty(req: Request, res: Response): Promise<void> {
    try {
      const facultyId = req.params.facultyId;
      const result = await this.courseService.getCoursesByFaculty(facultyId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getCoursesByCredits(req: Request, res: Response): Promise<void> {
    try {
      const credits = parseInt(req.params.credits);

      if (isNaN(credits)) {
        res.status(400).json({
          success: false,
          message: 'Invalid credits value',
        });
        return;
      }

      const result = await this.courseService.getCoursesByCredits(credits);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}
