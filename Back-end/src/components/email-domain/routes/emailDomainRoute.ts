import express from 'express';
import EmailDomainController from '../controllers/emailDomainController';

const router = express.Router();

// CRUD endpoints
// Add allowed email domain
router.post('/', EmailDomainController.addAllowedEmailDomain);
// Delete allowed email domain by domain
router.delete('/:domain', EmailDomainController.deleteAllowedEmailDomain);
// Update allowed email domain by domain
router.patch('/:domain', EmailDomainController.updateAllowedEmailDomain);
// Get all allowed email domains
router.get('/', EmailDomainController.getAllAllowedEmailDomains);

export default router;