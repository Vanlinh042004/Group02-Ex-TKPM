import express from 'express';

/**
 * Registration Bridge Routes
 * Supports both legacy API format and Clean Architecture v2 endpoints
 */
const router = express.Router();

// Lazy load controller to avoid circular dependencies
const getController = () => {
  const {
    RegistrationBridgeController,
  } = require('../controllers/RegistrationBridgeController');
  return new RegistrationBridgeController();
};

// Legacy API endpoints (maintain original format)
router.post('/', async (req, res) => {
  await getController().registerCourse(req, res);
});

router.get('/', async (req, res) => {
  await getController().getAllRegistrations(req, res);
});

router.put('/:registrationId', async (req, res) => {
  await getController().cancelRegistration(req, res);
});

router.put('/:registrationId/grade', async (req, res) => {
  await getController().updateGrade(req, res);
});

router.get('/class/:classId/students', async (req, res) => {
  await getController().getAllStudentsFromClass(req, res);
});

router.get('/transcript/:studentId', async (req, res) => {
  await getController().generateTranscript(req, res);
});

export default router;
