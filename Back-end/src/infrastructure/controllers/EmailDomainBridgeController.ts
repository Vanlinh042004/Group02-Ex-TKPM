import { Request, Response } from 'express';
import { EmailDomainService } from '../../application/services/EmailDomainService';

/**
 * EmailDomain Bridge Controller
 * Maintains legacy API compatibility while using Clean Architecture internally
 */
class EmailDomainBridgeController {
  private emailDomainService: EmailDomainService | null = null;

  constructor() {
    // Bind methods to preserve 'this' context
    this.addAllowedEmailDomain = this.addAllowedEmailDomain.bind(this);
    this.deleteAllowedEmailDomain = this.deleteAllowedEmailDomain.bind(this);
    this.updateAllowedEmailDomain = this.updateAllowedEmailDomain.bind(this);
    this.getAllAllowedEmailDomains = this.getAllAllowedEmailDomains.bind(this);
    this.validateEmailDomain = this.validateEmailDomain.bind(this);
    this.bulkCreateDomains = this.bulkCreateDomains.bind(this);
    this.searchDomains = this.searchDomains.bind(this);
    this.getDomainStatistics = this.getDomainStatistics.bind(this);
    this.bulkValidateEmails = this.bulkValidateEmails.bind(this);
  }

  private getEmailDomainService(): EmailDomainService {
    if (!this.emailDomainService) {
      // Lazy loading to avoid circular dependencies
      const {
        serviceRegistry,
      } = require('../../infrastructure/di/serviceRegistry');
      this.emailDomainService = serviceRegistry.resolve('EmailDomainService');
    }
    return this.emailDomainService;
  }

  /**
   * Add allowed email domain (Legacy API format)
   * POST /api/email-domains
   */
  async addAllowedEmailDomain(req: Request, res: Response): Promise<void> {
    try {
      const domain = req.body.domain as string;

      if (!domain?.trim()) {
        res.status(400).json({ message: 'Domain is required' });
        return;
      }

      const emailDomainService = this.getEmailDomainService();
      const result = await emailDomainService.addAllowedEmailDomain(
        domain.trim()
      );

      res.status(200).json({
        message: 'Domain added successfully',
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Delete allowed email domain by domain (Legacy API format)
   * DELETE /api/email-domains/:domain
   */
  async deleteAllowedEmailDomain(req: Request, res: Response): Promise<void> {
    try {
      const domain = req.params.domain as string;

      if (!domain?.trim()) {
        res.status(400).json({ message: 'Domain is required' });
        return;
      }

      const emailDomainService = this.getEmailDomainService();
      const result = await emailDomainService.deleteAllowedEmailDomain(
        domain.trim()
      );

      res.status(200).json({
        message: 'Domain deleted successfully',
        data: result,
      });
    } catch (error: any) {
      if (error.message === 'Domain not found') {
        res.status(404).json({ message: error.message });
      } else {
        res.status(400).json({ message: error.message });
      }
    }
  }

  /**
   * Update allowed email domain by domain (Legacy API format)
   * PATCH /api/email-domains/:domain
   */
  async updateAllowedEmailDomain(req: Request, res: Response): Promise<void> {
    try {
      const domain = req.params.domain as string;
      const newDomain = req.body.newDomain as string;

      if (!domain?.trim()) {
        res.status(400).json({ message: 'Domain is required' });
        return;
      }

      if (!newDomain?.trim()) {
        res.status(400).json({ message: 'New domain is required' });
        return;
      }

      const emailDomainService = this.getEmailDomainService();
      const result = await emailDomainService.updateAllowedEmailDomain(
        domain.trim(),
        newDomain.trim()
      );

      res.status(200).json({
        message: 'Domain updated successfully',
        data: result,
      });
    } catch (error: any) {
      if (error.message === 'Domain not found') {
        res.status(404).json({ message: error.message });
      } else {
        res.status(400).json({ message: error.message });
      }
    }
  }

  /**
   * Get all allowed email domains (Legacy API format)
   * GET /api/email-domains
   */
  async getAllAllowedEmailDomains(req: Request, res: Response): Promise<void> {
    try {
      const emailDomainService = this.getEmailDomainService();
      const result = await emailDomainService.getAllAllowedEmailDomains();

      res.status(200).json({ data: result });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Validate email domain (Legacy compatibility)
   * POST /api/email-domains/validate
   */
  async validateEmailDomain(req: Request, res: Response): Promise<void> {
    try {
      const email = req.body.email as string;

      if (!email?.trim()) {
        res.status(400).json({ message: 'Email is required' });
        return;
      }

      const emailDomainService = this.getEmailDomainService();
      const isValid = await emailDomainService.isValidEmailDomain(email.trim());

      res.status(200).json({
        email: email.trim(),
        isValid: isValid,
        message: isValid
          ? 'Email domain is allowed'
          : 'Email domain is not allowed',
      });
    } catch (error: any) {
      res.status(400).json({
        email: req.body.email || '',
        isValid: false,
        message: error.message,
      });
    }
  }

  // Additional bridge methods for enhanced functionality

  /**
   * Bulk create domains
   * POST /api/email-domains/bulk
   */
  async bulkCreateDomains(req: Request, res: Response): Promise<void> {
    try {
      const domains = req.body.domains as string[];

      if (!Array.isArray(domains) || domains.length === 0) {
        res.status(400).json({ message: 'Domains array is required' });
        return;
      }

      const emailDomainService = this.getEmailDomainService();
      const results = await emailDomainService.createMultipleEmailDomains({
        domains,
      });

      res.status(200).json({
        message: `${results.length} domains created successfully`,
        data: results,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Search domains
   * GET /api/email-domains/search?q=searchTerm&tld=com&educational=true
   */
  async searchDomains(req: Request, res: Response): Promise<void> {
    try {
      const searchTerm = (req.query.q as string) || '';
      const tld = req.query.tld as string;
      const isEducational = req.query.educational === 'true';
      const isGovernment = req.query.government === 'true';

      const filters: any = {};
      if (tld) filters.tld = tld;
      if (isEducational) filters.isEducational = true;
      if (isGovernment) filters.isGovernment = true;

      const emailDomainService = this.getEmailDomainService();
      const results = await emailDomainService.searchEmailDomains({
        searchTerm,
        filters: Object.keys(filters).length > 0 ? filters : undefined,
      });

      res.status(200).json({
        data: results.map((domain) => ({
          _id: domain.id,
          domain: domain.domain,
          tld: domain.tld,
          baseDomain: domain.baseDomain,
          isEducational: domain.isEducational,
          isGovernment: domain.isGovernment,
          createdAt: domain.createdAt,
          updatedAt: domain.updatedAt,
        })),
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Get domain statistics
   * GET /api/email-domains/statistics
   */
  async getDomainStatistics(req: Request, res: Response): Promise<void> {
    try {
      const emailDomainService = this.getEmailDomainService();
      const stats = await emailDomainService.getDomainStatistics();

      res.status(200).json({ data: stats });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Bulk validate emails
   * POST /api/email-domains/validate-bulk
   */
  async bulkValidateEmails(req: Request, res: Response): Promise<void> {
    try {
      const emails = req.body.emails as string[];

      if (!Array.isArray(emails) || emails.length === 0) {
        res.status(400).json({ message: 'Emails array is required' });
        return;
      }

      const emailDomainService = this.getEmailDomainService();
      const results = await emailDomainService.validateMultipleEmailDomains({
        emails,
      });

      res.status(200).json({ data: results });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Get educational domains
   * GET /api/email-domains/educational
   */
  async getEducationalDomains(req: Request, res: Response): Promise<void> {
    try {
      const emailDomainService = this.getEmailDomainService();
      const results = await emailDomainService.getEducationalDomains();

      res.status(200).json({
        data: results.map((domain) => ({
          _id: domain.id,
          domain: domain.domain,
          createdAt: domain.createdAt,
          updatedAt: domain.updatedAt,
        })),
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Get government domains
   * GET /api/email-domains/government
   */
  async getGovernmentDomains(req: Request, res: Response): Promise<void> {
    try {
      const emailDomainService = this.getEmailDomainService();
      const results = await emailDomainService.getGovernmentDomains();

      res.status(200).json({
        data: results.map((domain) => ({
          _id: domain.id,
          domain: domain.domain,
          createdAt: domain.createdAt,
          updatedAt: domain.updatedAt,
        })),
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}

export default new EmailDomainBridgeController();
