import express from 'express';
import EmailDomainBridgeController from '../controllers/EmailDomainBridgeController';

const router = express.Router();

// Legacy API routes (maintain exact same format as original component)
// CRUD endpoints
router.post('/', EmailDomainBridgeController.addAllowedEmailDomain);
router.delete('/:domain', EmailDomainBridgeController.deleteAllowedEmailDomain);
router.patch('/:domain', EmailDomainBridgeController.updateAllowedEmailDomain);
router.get('/', EmailDomainBridgeController.getAllAllowedEmailDomains);

// Email validation endpoint
router.post('/validate', EmailDomainBridgeController.validateEmailDomain);

// Enhanced functionality (new endpoints)
router.post('/bulk', EmailDomainBridgeController.bulkCreateDomains);
router.get('/search', EmailDomainBridgeController.searchDomains);
router.get('/statistics', EmailDomainBridgeController.getDomainStatistics);
router.post('/validate-bulk', EmailDomainBridgeController.bulkValidateEmails);

export default router;
