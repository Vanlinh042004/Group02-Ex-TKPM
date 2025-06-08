import express from 'express';

const router = express.Router();

// Lazy loading to avoid circular dependencies
let phoneConfigController: any = null;

function getController() {
  if (!phoneConfigController) {
    phoneConfigController =
      require('../controllers/PhoneNumberConfigBridgeController').default;
  }
  return phoneConfigController;
}

// Legacy API routes (maintain compatibility)
router.get('/', (req, res) =>
  getController().getAllPhoneNumberConfigs(req, res)
);
router.get('/search', (req, res) => getController().searchConfigs(req, res));
router.get('/statistics', (req, res) =>
  getController().getStatistics(req, res)
);
router.get('/by-code/:countryCode', (req, res) =>
  getController().getConfigsByCountryCode(req, res)
);
router.get('/analyze/:country', (req, res) =>
  getController().analyzePhoneFormat(req, res)
);
router.get('/:country', (req, res) =>
  getController().getPhoneNumberConfig(req, res)
);

router.post('/', (req, res) => getController().addPhoneNumberConfig(req, res));
router.post('/validate', (req, res) =>
  getController().validatePhoneNumber(req, res)
);
router.post('/validate-bulk', (req, res) =>
  getController().bulkValidatePhoneNumbers(req, res)
);
router.post('/test-pattern', (req, res) =>
  getController().testRegexPattern(req, res)
);
router.post('/find-best-match', (req, res) =>
  getController().findBestMatch(req, res)
);

router.patch('/:country', (req, res) =>
  getController().updatePhoneNumberConfig(req, res)
);
router.delete('/:country', (req, res) =>
  getController().deletePhoneNumberConfig(req, res)
);

export default router;
