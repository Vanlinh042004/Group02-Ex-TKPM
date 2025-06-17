import { Request, Response } from "express";
import ProgramService, { ICreateProgramDTO } from "../services/programService";
import i18next from "../../../config/i18n";

class ProgramController {
  async renameProgram(req: Request, res: Response): Promise<void> {
    try {
      const programId = req.params.programId;
      const newNames = req.body.newNames;
      const result = await ProgramService.renameProgram(programId, newNames);

      res
        .status(200)
        .json({
          success: true,
          message: req.t('success:program_updated'),
          data: result,
          timestamp: new Date().toISOString()
        });
    } catch (error: any) {
      res.status(404).json({
        error: true,
        message: error.message || req.t('errors:program_not_found'),
        timestamp: new Date().toISOString()
      });
    }
  }

  async addProgram(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body as ICreateProgramDTO;
      const result = await ProgramService.addProgram(data);
      res
        .status(200)
        .json({
          success: true,
          message: req.t('success:program_created'),
          data: result,
          timestamp: new Date().toISOString()
        });
    } catch (error: any) {
      res.status(400).json({
        error: true,
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async getAllPrograms(req: Request, res: Response): Promise<void> {
    try {
      const result = await ProgramService.getAllPrograms();
      res
        .status(200)
        .json({
          success: true,
          message: req.t('success:programs_retrieved'),
          data: result,
          timestamp: new Date().toISOString()
        });
    } catch (error: any) {
      res.status(400).json({
        error: true,
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

export default new ProgramController();
