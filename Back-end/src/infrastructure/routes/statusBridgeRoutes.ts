import express, { Request, Response } from 'express';

const router = express.Router();

// Lazy loading to avoid initialization order issues
let statusController: any;

function getController() {
  if (!statusController) {
    const { getStatusController } = require('../di/serviceRegistry');
    statusController = getStatusController();
  }
  return statusController;
}

// Status CRUD endpoints - maintain original API format
// Add status
router.post('/', (req: Request, res: Response) => {
  getController().addStatus(req, res);
});

// Rename status by ID (supports both route param and body param)
router.patch('/:statusId', (req: Request, res: Response) => {
  getController().renameStatus(req, res);
});

// Get all statuses
router.get('/', (req: Request, res: Response) => {
  getController().getAllStatuses(req, res);
});

// Get active statuses only
router.get('/active', (req: Request, res: Response) => {
  getController().getActiveStatuses(req, res);
});

// Validate status transition (new endpoint)
router.post('/validate-transition', (req: Request, res: Response) => {
  getController().validateTransition(req, res);
});

export default router;
