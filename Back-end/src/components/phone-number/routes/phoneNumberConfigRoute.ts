import express from 'express';
import PhoneNumberConfigController from '../controllers/phoneNumberConfigController';

const router = express.Router();

// CRUD endpoints
// Get all countries
router.get('/', PhoneNumberConfigController.getAllPhoneNumberConfigs);
// Get phone number config by country
router.get('/:country', PhoneNumberConfigController.getPhoneNumberConfig);
// Add new phone number config
router.post('/', PhoneNumberConfigController.addPhoneNumberConfig);
// Update phone number config by country
router.patch('/:country', PhoneNumberConfigController.updatePhoneNumberConfig);
// Delete phone number config by country
router.delete('/:country', PhoneNumberConfigController.deletePhoneNumberConfig);

export default router;