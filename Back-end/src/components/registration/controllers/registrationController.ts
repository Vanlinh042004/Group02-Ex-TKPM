import { Request, Response } from 'express'
import RegistrationService from '../services/registrationService'

class RegistrationController {
    async registerCourse(req: Request, res: Response): Promise<void> {
        try {
            const studentId = req.body.studentId;
            const classId = req.body.classId;
            const result = await RegistrationService.registerCourse(studentId, classId);

            res.status(200).json({ message: "Register successfully", data: result }); 
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async cancelRegistration(req: Request, res: Response): Promise<void> {
        try {
            const registrationId = req.params.registrationId;
            const reason = req.body.reason;
            const result = await RegistrationService.cancelRegistration(registrationId, reason);

            res.status(200).json({ message: "Cancel registration successfully", data: result});
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async getAllStudentsFromClass(req: Request, res: Response): Promise<void> {
        try {
            const classId = req.params.classId;
            const result = await RegistrationService.getAllStudentsFromClass(classId);

            res.status(200).json({ message: "Fetch all students in class successfully", data: result });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }
}

export default new RegistrationController();