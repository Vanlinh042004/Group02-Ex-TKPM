import express from 'express';
import { getClassController } from '../di/serviceRegistry';

const router = express.Router();

// Lazy loading to avoid circular dependency issues
const getController = () => getClassController();

/**
 * Class API v2 Routes
 * Maintains original API format while using Clean Architecture
 */

// Create class
router.post('/', (req, res) => {
  getController().createClass(req, res);
});

// Get all classes with filters
router.get('/', (req, res) => {
  getController().getClasses(req, res);
});

// Get class by ID
router.get('/:id', (req, res) => {
  getController().getClassById(req, res);
});

// Update class
router.put('/:id', (req, res) => {
  getController().updateClass(req, res);
});

// Get enrollment count
router.get('/:id/enrollment', (req, res) => {
  getController().getEnrollmentCount(req, res);
});

export default router;
