import { Request, Response } from "express";
import RegistrationService from "../services/registrationService";

class RegistrationController {
  async registerCourse(req: Request, res: Response): Promise<void> {
    try {
      const studentId = req.body.studentId;
      const classId = req.body.classId;
      const result = await RegistrationService.registerCourse(
        studentId,
        classId,
      );

      res.status(200).json({ message: "Register successfully", data: result });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async getAllRegistrations(req: Request, res: Response): Promise<void> {
    try {
      const result = await RegistrationService.getAllRegistrations();

      res
        .status(200)
        .json({
          message: "Fetch all registrations successfully",
          data: result,
        });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async cancelRegistration(req: Request, res: Response): Promise<void> {
    try {
      const registrationId = req.params.registrationId;
      const reason = req.body.reason;
      const result = await RegistrationService.cancelRegistration(
        registrationId,
        reason,
      );

      res
        .status(200)
        .json({ message: "Cancel registration successfully", data: result });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async updateGrade(req: Request, res: Response): Promise<void> {
    try {
      const registrationId = req.params.registrationId;
      const grade = req.body.grade;
      const result = await RegistrationService.updateGrade(
        registrationId,
        grade,
      );

      res
        .status(200)
        .json({ message: "Update grade successfully", data: result });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async getAllStudentsFromClass(req: Request, res: Response): Promise<void> {
    try {
      const classId = req.params.classId;
      const result = await RegistrationService.getAllStudentsFromClass(classId);

      res
        .status(200)
        .json({
          message: "Fetch all students in class successfully",
          data: result,
        });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
  async generateTranscript(req: Request, res: Response): Promise<void> {
    try {
      const { studentId } = req.params;

      const transcript =
        await RegistrationService.generateTranscript(studentId);

      res.status(200).json(transcript);
    } catch (error: any) {
      res.status(500).json({
        message: error.message,
      });
    }
  }
}

export default new RegistrationController();
