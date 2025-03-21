import { Request, Response } from 'express';
import FacultyService, { ICreateFacultyDTO } from '../services/facultyService';

class FacultyController {
    async renameFaculty(req: Request, res: Response): Promise<void> {
        try {
            const facultyId = req.params.facultyId;
            const newName = req.body.newName;
            const result = await FacultyService.renameFaculty(facultyId, newName);
            
            res.status(200).json({ message: 'Faculty renamed successfully', data: result });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async addFaculty(req: Request, res: Response): Promise<void> {
        try {
            const data = req.body as ICreateFacultyDTO;
            const result = await FacultyService.addFaculty(data);
            res.status(200).json({ message: 'Faculty added successfully', data: result });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async getAllFaculties(req: Request, res: Response): Promise<void> {
        try {
            const faculties = await FacultyService.getAllFaculties();
            res.status(200).json({ message: 'Fetched all faculties successfully', data: faculties });
        } catch (error: any) {
            res.status(500).json({ message: 'Error fetching faculties', error: error.message });
        }
    }
}

export default new FacultyController();