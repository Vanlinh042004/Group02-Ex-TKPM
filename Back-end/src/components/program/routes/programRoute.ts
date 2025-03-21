import express from 'express';
import ProgramController from '../controllers/programController';

const router = express.Router();


router.patch('/update/:programId', ProgramController.renameProgram);
router.post('/add', ProgramController.addProgram);

router.get('/list', ProgramController.getAllPrograms);

export default router;

