import { Request, Response } from 'express';
import {
  FacultyService,
  CreateFacultyDTO,
  RenameFacultyDTO,
} from '../../application/services/FacultyService';

export class FacultyBridgeController {
  constructor(private readonly facultyService: FacultyService) {}

  async createFaculty(req: Request, res: Response): Promise<void> {
    try {
      const createDTO: CreateFacultyDTO = {
        name: req.body.name,
      };

      const result = await this.facultyService.createFaculty(createDTO);

      res.status(200).json({
        message: 'Faculty added successfully',
        data: result,
      });
    } catch (error: any) {
      console.error('FacultyBridgeController.createFaculty error:', error);

      if (error.message.includes('name is required')) {
        res.status(400).json({
          message: error.message,
        });
        return;
      }

      if (error.message.includes('already exists')) {
        res.status(400).json({
          message: error.message,
        });
        return;
      }

      res.status(400).json({
        message: error.message,
      });
    }
  }

  async renameFaculty(req: Request, res: Response): Promise<void> {
    try {
      const renameDTO: RenameFacultyDTO = {
        facultyId: req.params.facultyId || req.body.facultyId,
        newName: req.body.newName,
      };

      const result = await this.facultyService.renameFaculty(renameDTO);

      res.status(200).json({
        message: 'Faculty renamed successfully',
        data: result,
      });
    } catch (error: any) {
      console.error('FacultyBridgeController.renameFaculty error:', error);

      if (error.message.includes('not found')) {
        res.status(404).json({
          message: error.message,
        });
        return;
      }

      res.status(400).json({
        message: error.message,
      });
    }
  }

  async getAllFaculties(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.facultyService.getAllFaculties();

      res.status(200).json({
        data: result,
      });
    } catch (error: any) {
      console.error('FacultyBridgeController.getAllFaculties error:', error);

      res.status(400).json({
        message: error.message,
      });
    }
  }

  async getFacultyById(req: Request, res: Response): Promise<void> {
    try {
      const facultyId = req.params.facultyId;

      if (!facultyId) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          error: 'Faculty ID is required',
        });
        return;
      }

      const result = await this.facultyService.getFacultyById(facultyId);

      if (!result) {
        res.status(404).json({
          success: false,
          message: 'Faculty not found',
          error: 'Faculty with this ID does not exist',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Faculty retrieved successfully',
        data: result,
      });
    } catch (error: any) {
      console.error('FacultyBridgeController.getFacultyById error:', error);

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'Failed to retrieve faculty',
      });
    }
  }

  async deleteFaculty(req: Request, res: Response): Promise<void> {
    try {
      const facultyId = req.params.facultyId;

      if (!facultyId) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          error: 'Faculty ID is required',
        });
        return;
      }

      const result = await this.facultyService.deleteFaculty(facultyId);

      if (!result) {
        res.status(404).json({
          success: false,
          message: 'Faculty not found',
          error: 'Faculty with this ID does not exist',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Faculty deleted successfully',
        data: { deleted: true },
      });
    } catch (error: any) {
      console.error('FacultyBridgeController.deleteFaculty error:', error);

      if (error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          message: 'Faculty not found',
          error: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'Failed to delete faculty',
      });
    }
  }
}
