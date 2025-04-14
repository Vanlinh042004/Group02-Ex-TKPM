import express from 'express';
import RegistrationController from '../controllers/registrationController';

const router = express.Router();

// CRUD endpoints
// Add registration
router.post('/', RegistrationController.registerCourse);
// Get all registrations
router.get('/', RegistrationController.getAllRegistrations)
// Cancel registration
router.patch('/cancel/:registrationId', RegistrationController.cancelRegistration)
// Get all students in specific class
router.get('/:classId', RegistrationController.getAllStudentsFromClass);

export default router;

