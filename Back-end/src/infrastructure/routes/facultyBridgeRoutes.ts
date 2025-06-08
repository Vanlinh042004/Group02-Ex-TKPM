import express from 'express';
import { getFacultyController } from '../di/serviceRegistry';

const router = express.Router();

// Faculty CRUD endpoints using Clean Architecture
// Lazy load controller to avoid initialization order issues
router.post('/', (req, res) => {
  const facultyController = getFacultyController();
  return facultyController.createFaculty(req, res);
});

router.patch('/:facultyId', (req, res) => {
  const facultyController = getFacultyController();
  return facultyController.renameFaculty(req, res);
});

router.get('/', (req, res) => {
  const facultyController = getFacultyController();
  return facultyController.getAllFaculties(req, res);
});

router.get('/:facultyId', (req, res) => {
  const facultyController = getFacultyController();
  return facultyController.getFacultyById(req, res);
});

router.delete('/:facultyId', (req, res) => {
  const facultyController = getFacultyController();
  return facultyController.deleteFaculty(req, res);
});

export default router;
