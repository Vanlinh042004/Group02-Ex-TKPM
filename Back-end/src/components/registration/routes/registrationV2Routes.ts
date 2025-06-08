import express from 'express';

/**
 * Registration v2 Routes (Clean Architecture)
 * RESTful endpoints with enhanced business functionality
 */
const router = express.Router();

// Lazy load controller to avoid circular dependencies
const getController = () => {
  const {
    RegistrationBridgeController,
  } = require('../controllers/RegistrationBridgeController');
  return new RegistrationBridgeController();
};

// Clean Architecture v2 endpoints

// Basic CRUD operations
router.post('/', async (req, res) => {
  await getController().registerCourse(req, res);
});

router.get('/:id', async (req, res) => {
  await getController().getRegistrationById(req, res);
});

router.get('/', async (req, res) => {
  await getController().getAllRegistrations(req, res);
});

router.put('/:registrationId/cancel', async (req, res) => {
  await getController().cancelRegistration(req, res);
});

router.put('/:registrationId/grade', async (req, res) => {
  await getController().updateGrade(req, res);
});

// Business-specific endpoints
router.get('/student/:studentId', async (req, res) => {
  await getController().getRegistrationsByStudent(req, res);
});

router.get('/class/:classId', async (req, res) => {
  await getController().getRegistrationsByClass(req, res);
});

router.get('/class/:classId/students', async (req, res) => {
  await getController().getAllStudentsFromClass(req, res);
});

// Statistics and reporting
router.get('/statistics/overall', async (req, res) => {
  await getController().getRegistrationStatistics(req, res);
});

router.get('/class/:classId/statistics', async (req, res) => {
  await getController().getRegistrationStatistics(req, res);
});

// Transcript generation
router.get('/transcript/:studentId', async (req, res) => {
  await getController().generateTranscript(req, res);
});

// Search functionality
router.post('/search', async (req, res) => {
  await getController().searchRegistrations(req, res);
});

export default router;
