import { Request, Response } from "express";
import phoneNumberService from "../services/phoneNumberConfigService";

class PhoneNumberConfigController {
  async getAllPhoneNumberConfigs(req: Request, res: Response) {
    try {
      const countries = await phoneNumberService.getAllPhoneNumberConfigs();
      res.status(200).json(countries);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getPhoneNumberConfig(req: Request, res: Response) {
    try {
      const country = req.params.country;
      const phoneConfig =
        await phoneNumberService.getPhoneNumberConfig(country);
      res.status(200).json(phoneConfig);
    } catch (error) {
      res.status(500).json({ message: error.message });
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
      res.status(200).json({ message: "Phone number config deleted", result });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

export default new PhoneNumberConfigController();
