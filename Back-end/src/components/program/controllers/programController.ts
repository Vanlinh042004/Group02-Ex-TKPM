import { Request, Response } from 'express';
import ProgramService, { ICreateProgramDTO } from '../services/programService';

class ProgramController {
    async renameProgram(req: Request, res: Response): Promise<void> {
        try {
            const programId = req.params.programId;
            const newName = req.body.newName;
            const result = await ProgramService.renameProgram(programId, newName);
            
            res.status(200).json({ message: 'Program renamed successfully', data: result });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async addProgram(req: Request, res: Response): Promise<void> {
        try {
            const data = req.body as ICreateProgramDTO;
            const result = await ProgramService.addProgram(data);
            res.status(200).json({ message: 'Program added successfully', data: result });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }
}

export default new ProgramController();