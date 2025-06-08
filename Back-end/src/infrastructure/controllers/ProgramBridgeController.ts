import { Request, Response } from 'express';
import {
  ProgramService,
  CreateProgramDTO,
  RenameProgramDTO,
} from '../../application/services/ProgramService';

export class ProgramBridgeController {
  constructor(private readonly programService: ProgramService) {}

  async addProgram(req: Request, res: Response): Promise<void> {
    try {
      const createDTO: CreateProgramDTO = {
        name: req.body.name,
        duration: req.body.duration,
        isActive: req.body.isActive,
      };

      const result = await this.programService.createProgram(createDTO);

      // Match original API response format
      res.status(200).json({
        message: 'Program added successfully',
        data: result,
      });
    } catch (error: any) {
      console.error('ProgramBridgeController.addProgram error:', error);

      res.status(400).json({
        message: error.message,
      });
    }
  }

  async renameProgram(req: Request, res: Response): Promise<void> {
    try {
      // Handle both route param and body param (original controller uses body)
      const renameDTO: RenameProgramDTO = {
        programId: req.params.programId || req.body.programId,
        newName: req.body.newName,
      };

      const result = await this.programService.renameProgram(renameDTO);

      // Match original API response format
      res.status(200).json({
        message: 'Program renamed successfully',
        data: result,
      });
    } catch (error: any) {
      console.error('ProgramBridgeController.renameProgram error:', error);

      res.status(400).json({
        message: error.message,
      });
    }
  }

  async getAllPrograms(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.programService.getAllPrograms();

      // Match original API response format (no message field)
      res.status(200).json({
        data: result,
      });
    } catch (error: any) {
      console.error('ProgramBridgeController.getAllPrograms error:', error);

      res.status(400).json({
        message: error.message,
      });
    }
  }

  async getProgramById(req: Request, res: Response): Promise<void> {
    try {
      const programId = req.params.programId;

      if (!programId) {
        res.status(400).json({
          message: 'Program ID is required',
        });
        return;
      }

      const result = await this.programService.getProgramById(programId);

      if (!result) {
        res.status(404).json({
          message: 'Program not found',
        });
        return;
      }

      res.status(200).json({
        data: result,
      });
    } catch (error: any) {
      console.error('ProgramBridgeController.getProgramById error:', error);

      res.status(400).json({
        message: error.message,
      });
    }
  }

  async deleteProgram(req: Request, res: Response): Promise<void> {
    try {
      const programId = req.params.programId;

      if (!programId) {
        res.status(400).json({
          message: 'Program ID is required',
        });
        return;
      }

      const result = await this.programService.deleteProgramById(programId);

      if (!result) {
        res.status(404).json({
          message: 'Program not found',
        });
        return;
      }

      res.status(200).json({
        message: 'Program deleted successfully',
        data: { deleted: true },
      });
    } catch (error: any) {
      console.error('ProgramBridgeController.deleteProgram error:', error);

      res.status(400).json({
        message: error.message,
      });
    }
  }
}
