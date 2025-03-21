import express from 'express';
import StatusController from '../controllers/statusController';

const router = express.Router();

router.patch('/update/:statusId', StatusController.renameStatus);
router.post('/add', StatusController.addStatus);
router.get('/list', StatusController.getAllStatus);

export default router;