import { Request, Response } from "express";
import EmailDomainService from "../services/emailDomainService";
import { IEmailDomain } from "../models/EmailDomain";
import i18next from "../../../config/i18n";

class EmailDomainController {
  /**
   * Thêm domain email được phép đăng ký
   * @param req Request
   * @param res Response
   */
  async addAllowedEmailDomain(req: Request, res: Response): Promise<void> {
    try {
      const domain = req.body.domain as string;

      const result = await EmailDomainService.addAllowedEmailDomain(domain);

      res
        .status(200)
        .json({ message: req.t('success:domain_added'), data: result });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Xóa domain email đã được đăng ký
   * @param req Request
   * @param res Response
   */
  async deleteAllowedEmailDomain(req: Request, res: Response): Promise<void> {
    try {
      const domain = req.params.domain as string;

      const result = await EmailDomainService.deleteAllowedEmailDomain(domain);

      res
        .status(200)
        .json({ message: req.t('success:domain_deleted'), data: result });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async updateAllowedEmailDomain(req: Request, res: Response): Promise<void> {
    try {
      const domain = req.params.domain as string;
      const newDomain = req.body.newDomain as string;

      const result = await EmailDomainService.updateAllowedEmailDomain(
        domain,
        newDomain,
      );

      res
        .status(200)
        .json({ message: req.t('success:domain_updated'), data: result });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async getAllAllowedEmailDomains(req: Request, res: Response): Promise<void> {
    try {
      const result = await EmailDomainService.getAllAllowedEmailDomains();

      res.status(200).json({
        success: true,
        message: req.t('success:email_domains_retrieved'),
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(500).json({
        error: true,
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

export default new EmailDomainController();
