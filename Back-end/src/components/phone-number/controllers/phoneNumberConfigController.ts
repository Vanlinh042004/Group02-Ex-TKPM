import { Request, Response } from "express";
import phoneNumberService from "../services/phoneNumberConfigService";
import i18next from "../../../config/i18n";

class PhoneNumberConfigController {
  async getAllPhoneNumberConfigs(req: Request, res: Response) {
    try {
      const countries = await phoneNumberService.getAllPhoneNumberConfigs();
      
      // Format data để hiển thị ngôn ngữ mặc định
      const formattedCountries = countries.map(country => ({
        _id: country._id,
        country: country.country,
        countryCode: country.countryCode,
        regex: country.regex,
        createdAt: country.createdAt,
        updatedAt: country.updatedAt,
        __v: country.__v
      }));

      res.status(200).json({
        success: true,
        message: req.t('success:phone_numbers_retrieved'),
        data: formattedCountries,
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

  async getPhoneNumberConfig(req: Request, res: Response) {
    try {
      const country = req.params.country;
      const phoneConfig = await phoneNumberService.getPhoneNumberConfig(country);
      
      if (!phoneConfig) {
        res.status(404).json({
          error: true,
          message: req.t('errors:phone_config_not_found'),
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: req.t('success:phone_number_retrieved'),
        data: phoneConfig,
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

  async addPhoneNumberConfig(req: Request, res: Response) {
    try {
      const phoneNumberConfig = req.body;
      const newPhoneNumberConfig =
        await phoneNumberService.addPhoneNumberConfig(phoneNumberConfig);
      res.status(201).json(newPhoneNumberConfig);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async updatePhoneNumberConfig(req: Request, res: Response) {
    try {
      const country = req.params.country;
      const phoneNumberConfig = req.body;
      const updatedPhoneNumberConfig =
        await phoneNumberService.updatePhoneNumberConfig(
          country,
          phoneNumberConfig,
        );
      res.status(200).json(updatedPhoneNumberConfig);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  async deletePhoneNumberConfig(req: Request, res: Response) {
    try {
      const country = req.params.country;
      const result = await phoneNumberService.deletePhoneNumberConfig(country);
      res.status(200).json({ message: req.t('success:phone_number_config_deleted'), result });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

export default new PhoneNumberConfigController();
