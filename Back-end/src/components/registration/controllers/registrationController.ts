import { Request, Response } from "express";
import RegistrationService from "../services/registrationService";
import i18next from "../../../config/i18n";

class RegistrationController {
  async registerCourse(req: Request, res: Response): Promise<void> {
    try {
      const studentId = req.body.studentId;
      const classId = req.body.classId;
      const result = await RegistrationService.registerCourse(
        studentId,
        classId,
      );

      res.status(200).json({
        success: true,
        message: req.t('success:register_success'),
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

  async getAllRegistrations(req: Request, res: Response): Promise<void> {
    try {
      const result = await RegistrationService.getAllRegistrations();

      res.status(200).json({
        success: true,
        message: req.t('success:registrations_retrieved'),
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(500).json({
        error: true,
        message: error.message,
        timestamp: new Date().toISOString()
      });
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
        .json({ message: req.t('success:cancel_registration'), data: result });
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
        .json({ message: req.t('success:update_grade'), data: result });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async getAllStudentsFromClass(req: Request, res: Response): Promise<void> {
    try {
      const classId = req.params.classId;
      const result = await RegistrationService.getAllStudentsFromClass(classId);

      res.status(200).json({
        success: true,
        message: req.t('success:fetch_all_students_in_class'),
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(500).json({
        error: true,
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async generateTranscript(req: Request, res: Response): Promise<void> {
    try {
      const { studentId } = req.params;
      const transcript = await RegistrationService.generateTranscript(studentId);

      if (!transcript) {
        res.status(404).json({
          error: true,
          message: req.t('errors:transcript_not_found'),
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: req.t('success:transcript_generated'),
        data: transcript,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(500).json({
        error: true,
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

export default new RegistrationController();
