import { Request, Response } from "express";
import FacultyService, { ICreateFacultyDTO } from "../services/facultyService";
import i18next from "../../../config/i18n";

class FacultyController {
  async renameFaculty(req: Request, res: Response): Promise<void> {
    try {
      const facultyId = req.params.facultyId;
      const newNames = req.body.newNames;
      const result = await FacultyService.renameFaculty(facultyId, newNames);

      res
        .status(200)
        .json({
          success: true,
          message: req.t('success:faculty_updated'),
          data: result,
          timestamp: new Date().toISOString()
        });
    } catch (error: any) {
      res.status(404).json({
        error: true,
        message: error.message || req.t('errors:faculty_not_found'),
        timestamp: new Date().toISOString()
      });
    }
  }

  async addFaculty(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body as ICreateFacultyDTO;
      const result = await FacultyService.addFaculty(data);
      res
        .status(200)
        .json({
          success: true,
          message: req.t('success:faculty_created'),
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

  async getAllFaculties(req: Request, res: Response): Promise<void> {
    try {
      const result = await FacultyService.getAllFaculties();
      res
        .status(200)
        .json({
          success: true,
          message: req.t('success:faculties_retrieved'),
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

export default new FacultyController();
