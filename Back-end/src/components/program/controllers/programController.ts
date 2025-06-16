import { Request, Response } from "express";
import ProgramService, { ICreateProgramDTO } from "../services/programService";
import i18next from "../../../config/i18n";

class ProgramController {
  async renameProgram(req: Request, res: Response): Promise<void> {
    try {
      const programId = req.body.programId;
      const newName = req.body.newName;
      const result = await ProgramService.renameProgram(programId, newName);

      res
        .status(200)
        .json({ message: req.t('success:program_renamed'), data: result });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async addProgram(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body as ICreateProgramDTO;
      const result = await ProgramService.addProgram(data);
      res
        .status(200)
        .json({ message: req.t('success:program_added'), data: result });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
  async getAllPrograms(req: Request, res: Response): Promise<void> {
    try {
      const result = await ProgramService.getAllPrograms();
      res.status(200).json({ data: result });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}

export default new ProgramController();
