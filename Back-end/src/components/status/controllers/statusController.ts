import { Request, Response } from "express";
import StatusService, { ICreateStatusDTO } from "../services/statusService";

class StatusController {
  async renameStatus(req: Request, res: Response): Promise<void> {
    try {
      const statusId = req.body.statusId;
      const newName = req.body.newName;
      const result = await StatusService.renameStatus(statusId, newName);

      res.status(200).json({
        success: true,
        message: req.t("success:status_renamed"),
        data: result,
        language: req.language,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(400).json({
        error: true,
        message: error.message,
        language: req.language,
        timestamp: new Date().toISOString(),
      });
    }
  }

  async addStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = req.body as ICreateStatusDTO;
      const result = await StatusService.addStatus(status);

      res.status(201).json({
        success: true,
        message: req.t("success:status_added"),
        data: result,
        language: req.language,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(400).json({
        error: true,
        message: error.message,
        language: req.language,
        timestamp: new Date().toISOString(),
      });
    }
  }

  async getAllStatuses(req: Request, res: Response): Promise<void> {
    try {
      const result = await StatusService.getAllStatus();

      res.status(200).json({
        success: true,
        message: req.t("success:statuses_retrieved"),
        data: result,
        count: result.length,
        language: req.language,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(500).json({
        error: true,
        message: error.message,
        language: req.language,
        timestamp: new Date().toISOString(),
      });
    }
  }
}

export default new StatusController();
