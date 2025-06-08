import { Request, Response } from 'express';
import { PhoneNumberConfigService } from '../../application/services/PhoneNumberConfigService';

/**
 * PhoneNumberConfig Bridge Controller
 * Maintains legacy API compatibility while using Clean Architecture internally
 */
class PhoneNumberConfigBridgeController {
  private phoneConfigService: PhoneNumberConfigService | null = null;

  constructor() {
    // Bind methods to preserve 'this' context
    this.getAllPhoneNumberConfigs = this.getAllPhoneNumberConfigs.bind(this);
    this.getPhoneNumberConfig = this.getPhoneNumberConfig.bind(this);
    this.addPhoneNumberConfig = this.addPhoneNumberConfig.bind(this);
    this.updatePhoneNumberConfig = this.updatePhoneNumberConfig.bind(this);
    this.deletePhoneNumberConfig = this.deletePhoneNumberConfig.bind(this);
    this.validatePhoneNumber = this.validatePhoneNumber.bind(this);
    this.bulkValidatePhoneNumbers = this.bulkValidatePhoneNumbers.bind(this);
    this.searchConfigs = this.searchConfigs.bind(this);
    this.getStatistics = this.getStatistics.bind(this);
    this.testRegexPattern = this.testRegexPattern.bind(this);
  }

  private getPhoneConfigService(): PhoneNumberConfigService {
    if (!this.phoneConfigService) {
      // Lazy loading to avoid circular dependencies
      const {
        serviceRegistry,
      } = require('../../infrastructure/di/serviceRegistry');
      this.phoneConfigService = serviceRegistry.resolve(
        'PhoneNumberConfigService'
      );
    }
    return this.phoneConfigService;
  }

  /**
   * Get all phone number configurations (Legacy API format)
   * GET /api/phone-numbers
   */
  async getAllPhoneNumberConfigs(req: Request, res: Response): Promise<void> {
    try {
      const phoneConfigService = this.getPhoneConfigService();
      const result = await phoneConfigService.getAllPhoneNumberConfigs();

      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Get phone number configuration by country (Legacy API format)
   * GET /api/phone-numbers/:country
   */
  async getPhoneNumberConfig(req: Request, res: Response): Promise<void> {
    try {
      const country = req.params.country as string;

      if (!country?.trim()) {
        res.status(400).json({ message: 'Country is required' });
        return;
      }

      const phoneConfigService = this.getPhoneConfigService();
      const result = await phoneConfigService.getPhoneNumberConfig(
        country.trim()
      );

      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Add phone number configuration (Legacy API format)
   * POST /api/phone-numbers
   */
  async addPhoneNumberConfig(req: Request, res: Response): Promise<void> {
    try {
      const phoneNumberConfig = req.body;

      if (!phoneNumberConfig?.country?.trim()) {
        res.status(400).json({ message: 'Country is required' });
        return;
      }

      if (!phoneNumberConfig?.countryCode?.trim()) {
        res.status(400).json({ message: 'Country code is required' });
        return;
      }

      if (!phoneNumberConfig?.regex?.trim()) {
        res.status(400).json({ message: 'Regex is required' });
        return;
      }

      const phoneConfigService = this.getPhoneConfigService();
      const result = await phoneConfigService.addPhoneNumberConfig(
        phoneNumberConfig
      );

      res.status(201).json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Update phone number configuration (Legacy API format)
   * PATCH /api/phone-numbers/:country
   */
  async updatePhoneNumberConfig(req: Request, res: Response): Promise<void> {
    try {
      const country = req.params.country as string;
      const phoneNumberConfig = req.body;

      if (!country?.trim()) {
        res.status(400).json({ message: 'Country is required' });
        return;
      }

      const phoneConfigService = this.getPhoneConfigService();
      const result = await phoneConfigService.updatePhoneNumberConfig(
        country.trim(),
        phoneNumberConfig
      );

      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Delete phone number configuration (Legacy API format)
   * DELETE /api/phone-numbers/:country
   */
  async deletePhoneNumberConfig(req: Request, res: Response): Promise<void> {
    try {
      const country = req.params.country as string;

      if (!country?.trim()) {
        res.status(400).json({ message: 'Country is required' });
        return;
      }

      const phoneConfigService = this.getPhoneConfigService();
      const result = await phoneConfigService.deletePhoneNumberConfig(
        country.trim()
      );

      res.status(200).json({
        message: 'Phone number config deleted',
        result,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // Enhanced functionality (Clean Architecture features)

  /**
   * Validate phone number against configurations
   * POST /api/phone-numbers/validate
   */
  async validatePhoneNumber(req: Request, res: Response): Promise<void> {
    try {
      const { phoneNumber, country } = req.body;

      if (!phoneNumber?.trim()) {
        res.status(400).json({ message: 'Phone number is required' });
        return;
      }

      const phoneConfigService = this.getPhoneConfigService();
      const results = await phoneConfigService.validatePhoneNumber({
        phoneNumber: phoneNumber.trim(),
        country: country?.trim(),
      });

      // Find first valid result for legacy compatibility
      const validResult = results.find((result) => result.isValid);

      if (validResult) {
        res.status(200).json({
          isValid: true,
          country: validResult.country,
          countryCode: validResult.countryCode,
          normalizedNumber: validResult.normalizedNumber,
          message: validResult.message,
          allResults: results,
        });
      } else {
        res.status(200).json({
          isValid: false,
          phoneNumber: phoneNumber.trim(),
          message: 'Phone number does not match any configured country format',
          allResults: results,
        });
      }
    } catch (error: any) {
      res.status(400).json({
        isValid: false,
        message: error.message,
      });
    }
  }

  /**
   * Bulk validate phone numbers
   * POST /api/phone-numbers/validate-bulk
   */
  async bulkValidatePhoneNumbers(req: Request, res: Response): Promise<void> {
    try {
      const { phoneNumbers, country } = req.body;

      if (!Array.isArray(phoneNumbers) || phoneNumbers.length === 0) {
        res.status(400).json({ message: 'Phone numbers array is required' });
        return;
      }

      const phoneConfigService = this.getPhoneConfigService();
      const result = await phoneConfigService.bulkValidatePhoneNumbers({
        phoneNumbers,
        country: country?.trim(),
      });

      res.status(200).json({
        message: `Validated ${result.total} phone numbers`,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Search phone configurations
   * GET /api/phone-numbers/search?q=searchTerm&countryCode=+84&international=true
   */
  async searchConfigs(req: Request, res: Response): Promise<void> {
    try {
      const searchTerm = (req.query.q as string) || '';
      const countryCode = req.query.countryCode as string;
      const hasInternationalFormat = req.query.international === 'true';
      const hasLocalFormat = req.query.local === 'true';
      const region = req.query.region as string;

      const filters: any = {};
      if (countryCode) filters.countryCode = countryCode;
      if (hasInternationalFormat !== undefined)
        filters.hasInternationalFormat = hasInternationalFormat;
      if (hasLocalFormat !== undefined) filters.hasLocalFormat = hasLocalFormat;
      if (region) filters.region = region;

      const phoneConfigService = this.getPhoneConfigService();
      const results = await phoneConfigService.searchConfigs({
        searchTerm: searchTerm.trim(),
        filters: Object.keys(filters).length > 0 ? filters : undefined,
      });

      res.status(200).json({
        message: `Found ${results.length} configurations`,
        data: results,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Get configuration statistics
   * GET /api/phone-numbers/statistics
   */
  async getStatistics(req: Request, res: Response): Promise<void> {
    try {
      const phoneConfigService = this.getPhoneConfigService();
      const stats = await phoneConfigService.getStatistics();

      res.status(200).json({
        message: 'Configuration statistics retrieved successfully',
        data: stats,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Test regex pattern against sample numbers
   * POST /api/phone-numbers/test-pattern
   */
  async testRegexPattern(req: Request, res: Response): Promise<void> {
    try {
      const { pattern, testNumbers } = req.body;

      if (!pattern?.trim()) {
        res.status(400).json({ message: 'Regex pattern is required' });
        return;
      }

      if (!Array.isArray(testNumbers) || testNumbers.length === 0) {
        res.status(400).json({ message: 'Test numbers array is required' });
        return;
      }

      const phoneConfigService = this.getPhoneConfigService();
      const result = await phoneConfigService.testRegexPattern({
        pattern: pattern.trim(),
        testNumbers,
      });

      res.status(200).json({
        message: 'Pattern test completed',
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Get configurations by country code
   * GET /api/phone-numbers/by-code/:countryCode
   */
  async getConfigsByCountryCode(req: Request, res: Response): Promise<void> {
    try {
      const countryCode = req.params.countryCode as string;

      if (!countryCode?.trim()) {
        res.status(400).json({ message: 'Country code is required' });
        return;
      }

      const phoneConfigService = this.getPhoneConfigService();
      const results = await phoneConfigService.getConfigsByCountryCode(
        countryCode.trim()
      );

      res.status(200).json({
        message: `Found ${results.length} configurations for country code ${countryCode}`,
        data: results,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Analyze phone format for a country
   * GET /api/phone-numbers/analyze/:country
   */
  async analyzePhoneFormat(req: Request, res: Response): Promise<void> {
    try {
      const country = req.params.country as string;

      if (!country?.trim()) {
        res.status(400).json({ message: 'Country is required' });
        return;
      }

      const phoneConfigService = this.getPhoneConfigService();
      const analysis = await phoneConfigService.analyzePhoneFormat(
        country.trim()
      );

      res.status(200).json({
        message: `Phone format analysis for ${country}`,
        data: analysis,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Find best matching configuration for a phone number
   * POST /api/phone-numbers/find-best-match
   */
  async findBestMatch(req: Request, res: Response): Promise<void> {
    try {
      const { phoneNumber } = req.body;

      if (!phoneNumber?.trim()) {
        res.status(400).json({ message: 'Phone number is required' });
        return;
      }

      const phoneConfigService = this.getPhoneConfigService();
      const result = await phoneConfigService.findBestMatchForPhone(
        phoneNumber.trim()
      );

      if (result) {
        res.status(200).json({
          message: 'Best match found',
          data: result,
        });
      } else {
        res.status(404).json({
          message: 'No matching configuration found for this phone number',
          phoneNumber: phoneNumber.trim(),
        });
      }
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}

export default new PhoneNumberConfigBridgeController();
