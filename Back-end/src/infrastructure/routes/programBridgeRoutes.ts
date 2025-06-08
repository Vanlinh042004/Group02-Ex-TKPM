import express from 'express';
import { getProgramController } from '../di/serviceRegistry';

const router = express.Router();

/**
 * Program Bridge Routes (Clean Architecture)
 * Maintains compatibility with original Program routes
 */

// Create program
router.post('/', (req, res) => {
  const controller = getProgramController();
  controller.addProgram(req, res);
});

// Get all programs
router.get('/', (req, res) => {
  const controller = getProgramController();
  controller.getAllPrograms(req, res);
});

// Rename program by ID (matches original route structure)
router.patch('/:programId', (req, res) => {
  const controller = getProgramController();
  controller.renameProgram(req, res);
});

// Get program by ID (additional endpoint)
router.get('/:programId', (req, res) => {
  const controller = getProgramController();
  controller.getProgramById(req, res);
});

// Delete program (additional endpoint)
router.delete('/:programId', (req, res) => {
  const controller = getProgramController();
  controller.deleteProgram(req, res);
});

export default router;
