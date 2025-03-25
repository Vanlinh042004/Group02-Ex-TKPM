import express from 'express';
import ProgramController from '../controllers/programController';

const router = express.Router();

// CRUD endpoints
// Add program
router.post('/', ProgramController.addProgram);
// Rename program by ID
router.patch('/:programId', ProgramController.renameProgram);
// Get all programs
router.get('/', ProgramController.getAllPrograms);

export default router;

