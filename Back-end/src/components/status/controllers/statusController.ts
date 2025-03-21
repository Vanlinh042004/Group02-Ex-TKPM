import { Request, Response } from 'express';
import StatusService, { ICreateStatusDTO } from '../services/statusService';

class StatusController {

    async getAllStatuses(req: Request, res: Response): Promise<void> {
        try {
            const statuses = await StatusService.getAllStatuses();
            res.status(200).json({ message: 'Fetched all statuses successfully', data: statuses });
        } catch (error: any) {
            res.status(500).json({ message: 'Error fetching statuses', error: error.message });
        }
    }
    async renameStatus(req: Request, res: Response): Promise<void> {
        try {
            const statusId = req.params.statusId;
            const newName = req.body.newName;
            const result = await StatusService.renameStatus(statusId, newName);
            
            res.status(200).json({ message: 'Status renamed successfully', data: result });
        }
        catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async addStatus(req: Request, res: Response): Promise<void> {
        try {
        const status = req.body as ICreateStatusDTO;
        const result = await StatusService.addStatus(status);
        res.status(200).json({ message: 'Status added successfully', data: result });
        } catch (error: any) {
        res.status(400).json({ message: error.message });
        }
    }
}

export default new StatusController();