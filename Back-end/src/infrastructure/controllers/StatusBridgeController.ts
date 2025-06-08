import { Request, Response } from 'express';
import {
  StatusService,
  CreateStatusDTO,
  RenameStatusDTO,
} from '../../application/services/StatusService';

export class StatusBridgeController {
  constructor(private statusService: StatusService) {}

  async addStatus(req: Request, res: Response): Promise<void> {
    try {
      const createDTO: CreateStatusDTO = {
        name: req.body.name,
        description: req.body.description,
      };

      const result = await this.statusService.createStatus(createDTO);

      res.status(200).json({
        message: 'Status added successfully',
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async renameStatus(req: Request, res: Response): Promise<void> {
    try {
      // Handle both route param and body param for statusId (fixing original inconsistency)
      const statusId = req.params.statusId || req.body.statusId;
      const newName = req.body.newName;

      if (!statusId) {
        res.status(400).json({ message: 'Status ID is required' });
        return;
      }

      if (!newName) {
        res.status(400).json({ message: 'New name is required' });
        return;
      }

      const renameDTO: RenameStatusDTO = { newName };
      const result = await this.statusService.renameStatus(statusId, renameDTO);

      res.status(200).json({
        message: 'Status renamed successfully',
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async getAllStatuses(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.statusService.getAllStatuses();

      res.status(200).json({ data: result });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async getActiveStatuses(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.statusService.getActiveStatuses();

      res.status(200).json({ data: result });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async validateTransition(req: Request, res: Response): Promise<void> {
    try {
      const { fromStatus, toStatus } = req.body;

      if (!fromStatus || !toStatus) {
        res
          .status(400)
          .json({ message: 'Both fromStatus and toStatus are required' });
        return;
      }

      const canTransition = await this.statusService.validateStatusTransition(
        fromStatus,
        toStatus
      );

      res.status(200).json({
        canTransition,
        message: canTransition
          ? `Transition from "${fromStatus}" to "${toStatus}" is allowed`
          : `Transition from "${fromStatus}" to "${toStatus}" is not allowed`,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
