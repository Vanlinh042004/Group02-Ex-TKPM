import { ObjectId } from 'mongodb';
import {
  PhoneNumberConfig,
  PhoneValidationResult,
} from '../../domain/entities/PhoneNumberConfig';
import { IPhoneNumberConfigRepository } from '../../domain/repositories/IPhoneNumberConfigRepository';
import PhoneNumberConfigModel from '../../components/phone-number/models/PhoneNumberConfig';

/**
 * MongoDB implementation of PhoneNumberConfig Repository
 */
export class MongoPhoneNumberConfigRepository
  implements IPhoneNumberConfigRepository
{
  // Basic CRUD operations
  async save(config: PhoneNumberConfig): Promise<PhoneNumberConfig> {
    const configData = {
      country: config.country,
      countryCode: config.countryCode,
      regex: config.regex,
    };

    const newConfig = new PhoneNumberConfigModel(configData);
    const savedConfig = await newConfig.save();

    return PhoneNumberConfig.fromLegacyData(savedConfig.toObject());
  }

  async findByCountry(country: string): Promise<PhoneNumberConfig | null> {
    const config = await PhoneNumberConfigModel.findOne({
      country: { $regex: new RegExp(`^${country}$`, 'i') },
    }).exec();

    if (!config) {
      return null;
    }

    return PhoneNumberConfig.fromLegacyData(config.toObject());
  }

  async findById(id: string): Promise<PhoneNumberConfig | null> {
    if (!ObjectId.isValid(id)) {
      return null;
    }

    const config = await PhoneNumberConfigModel.findById(id).exec();

    if (!config) {
      return null;
    }

    return PhoneNumberConfig.fromLegacyData(config.toObject());
  }

  async findAll(): Promise<PhoneNumberConfig[]> {
    const configs = await PhoneNumberConfigModel.find({})
      .sort({ country: 1 })
      .exec();

    return configs.map((config) =>
      PhoneNumberConfig.fromLegacyData(config.toObject())
    );
  }

  async update(
    id: string,
    config: PhoneNumberConfig
  ): Promise<PhoneNumberConfig | null> {
    if (!ObjectId.isValid(id)) {
      return null;
    }

    const updateData = {
      countryCode: config.countryCode,
      regex: config.regex,
      updatedAt: new Date(),
    };

    const updatedConfig = await PhoneNumberConfigModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).exec();

    if (!updatedConfig) {
      return null;
    }

    return PhoneNumberConfig.fromLegacyData(updatedConfig.toObject());
  }

  async delete(country: string): Promise<boolean> {
    const result = await PhoneNumberConfigModel.findOneAndDelete({
      country: { $regex: new RegExp(`^${country}$`, 'i') },
    }).exec();

    return result !== null;
  }

  // Existence checks
  async existsByCountry(country: string): Promise<boolean> {
    const count = await PhoneNumberConfigModel.countDocuments({
      country: { $regex: new RegExp(`^${country}$`, 'i') },
    }).exec();

    return count > 0;
  }

  async existsByCountryCode(countryCode: string): Promise<boolean> {
    const count = await PhoneNumberConfigModel.countDocuments({
      countryCode: countryCode,
    }).exec();

    return count > 0;
  }

  async existsById(id: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) {
      return false;
    }

    const count = await PhoneNumberConfigModel.countDocuments({
      _id: new ObjectId(id),
    }).exec();

    return count > 0;
  }

  // Country code operations
  async findByCountryCode(
    countryCode: string
  ): Promise<PhoneNumberConfig | null> {
    const config = await PhoneNumberConfigModel.findOne({
      countryCode: countryCode,
    }).exec();

    if (!config) {
      return null;
    }

    return PhoneNumberConfig.fromLegacyData(config.toObject());
  }

  async findByCountryCodes(
    countryCodes: string[]
  ): Promise<PhoneNumberConfig[]> {
    const configs = await PhoneNumberConfigModel.find({
      countryCode: { $in: countryCodes },
    })
      .sort({ country: 1 })
      .exec();

    return configs.map((config) =>
      PhoneNumberConfig.fromLegacyData(config.toObject())
    );
  }

  async getAllCountryCodes(): Promise<string[]> {
    const results = await PhoneNumberConfigModel.distinct('countryCode').exec();
    return results.sort();
  }

  // Search and filter operations
  async searchByCountryName(searchTerm: string): Promise<PhoneNumberConfig[]> {
    const configs = await PhoneNumberConfigModel.find({
      country: { $regex: new RegExp(searchTerm, 'i') },
    })
      .sort({ country: 1 })
      .exec();

    return configs.map((config) =>
      PhoneNumberConfig.fromLegacyData(config.toObject())
    );
  }

  async findByCountryPattern(pattern: string): Promise<PhoneNumberConfig[]> {
    const configs = await PhoneNumberConfigModel.find({
      country: { $regex: new RegExp(pattern, 'i') },
    })
      .sort({ country: 1 })
      .exec();

    return configs.map((config) =>
      PhoneNumberConfig.fromLegacyData(config.toObject())
    );
  }

  async findConfigsWithInternationalFormat(): Promise<PhoneNumberConfig[]> {
    // Find configs whose regex includes country code pattern
    const configs = await PhoneNumberConfigModel.find({}).exec();

    const internationalConfigs: PhoneNumberConfig[] = [];

    for (const config of configs) {
      const domainConfig = PhoneNumberConfig.fromLegacyData(config.toObject());
      if (domainConfig.isInternationalFormat()) {
        internationalConfigs.push(domainConfig);
      }
    }

    return internationalConfigs;
  }

  async findConfigsWithLocalFormat(): Promise<PhoneNumberConfig[]> {
    // Find configs whose regex includes local number pattern (starts with 0 or digits)
    const configs = await PhoneNumberConfigModel.find({}).exec();

    const localConfigs: PhoneNumberConfig[] = [];

    for (const config of configs) {
      const domainConfig = PhoneNumberConfig.fromLegacyData(config.toObject());
      if (domainConfig.isLocalFormat()) {
        localConfigs.push(domainConfig);
      }
    }

    return localConfigs;
  }

  // Phone number validation
  async findConfigForPhoneNumber(
    phoneNumber: string
  ): Promise<PhoneNumberConfig | null> {
    const configs = await this.findAll();

    for (const config of configs) {
      const validationResult = config.validatePhoneNumber(phoneNumber);
      if (validationResult.isValid) {
        return config;
      }
    }

    return null;
  }

  async validatePhoneNumber(
    phoneNumber: string
  ): Promise<PhoneValidationResult[]> {
    const configs = await this.findAll();
    const results: PhoneValidationResult[] = [];

    for (const config of configs) {
      const validationResult = config.validatePhoneNumber(phoneNumber);
      results.push(validationResult);
    }

    return results;
  }

  async findBestMatchForPhone(
    phoneNumber: string
  ): Promise<PhoneNumberConfig | null> {
    const configs = await this.findAll();

    // First try exact matches
    for (const config of configs) {
      const validationResult = config.validatePhoneNumber(phoneNumber);
      if (validationResult.isValid) {
        return config;
      }
    }

    // If no exact matches, try partial matches based on country code
    const normalizedPhone = phoneNumber.replace(/[\s\-\(\)\.]/g, '');

    for (const config of configs) {
      const codeWithoutPlus = config.countryCode.replace('+', '');
      if (
        normalizedPhone.startsWith(codeWithoutPlus) ||
        normalizedPhone.startsWith(config.countryCode)
      ) {
        return config;
      }
    }

    return null;
  }

  // Bulk operations
  async createMany(configs: PhoneNumberConfig[]): Promise<PhoneNumberConfig[]> {
    const configData = configs.map((config) => ({
      country: config.country,
      countryCode: config.countryCode,
      regex: config.regex,
    }));

    const savedConfigs = await PhoneNumberConfigModel.insertMany(configData);

    return savedConfigs.map((config) =>
      PhoneNumberConfig.fromLegacyData(config.toObject())
    );
  }

  async deleteMany(countries: string[]): Promise<number> {
    const result = await PhoneNumberConfigModel.deleteMany({
      country: { $in: countries },
    }).exec();

    return result.deletedCount || 0;
  }

  async validatePhoneNumbers(phoneNumbers: string[]): Promise<
    {
      phoneNumber: string;
      results: PhoneValidationResult[];
    }[]
  > {
    const results: {
      phoneNumber: string;
      results: PhoneValidationResult[];
    }[] = [];

    for (const phoneNumber of phoneNumbers) {
      const validationResults = await this.validatePhoneNumber(phoneNumber);
      results.push({
        phoneNumber,
        results: validationResults,
      });
    }

    return results;
  }

  // Analytics and statistics
  async getConfigCount(): Promise<number> {
    return await PhoneNumberConfigModel.countDocuments({}).exec();
  }

  async getCountryStatistics(): Promise<{
    totalCountries: number;
    withInternationalFormat: number;
    withLocalFormat: number;
    byRegion: { region: string; count: number }[];
  }> {
    const totalCountries = await this.getConfigCount();
    const configs = await this.findAll();

    let withInternationalFormat = 0;
    let withLocalFormat = 0;

    for (const config of configs) {
      if (config.isInternationalFormat()) {
        withInternationalFormat++;
      }
      if (config.isLocalFormat()) {
        withLocalFormat++;
      }
    }

    // Simple region categorization based on country code
    const regionStats: { [key: string]: number } = {};
    for (const config of configs) {
      const region = this.getRegionFromCountryCode(config.countryCode);
      regionStats[region] = (regionStats[region] || 0) + 1;
    }

    const byRegion = Object.entries(regionStats).map(([region, count]) => ({
      region,
      count,
    }));

    return {
      totalCountries,
      withInternationalFormat,
      withLocalFormat,
      byRegion,
    };
  }

  async getMostUsedCountryCodes(limit: number = 10): Promise<
    {
      countryCode: string;
      count: number;
      countries: string[];
    }[]
  > {
    const pipeline = [
      {
        $group: {
          _id: '$countryCode',
          count: { $sum: 1 },
          countries: { $push: '$country' },
        },
      },
      {
        $sort: { count: -1 as -1 },
      },
      {
        $limit: limit,
      },
    ];

    const results = await PhoneNumberConfigModel.aggregate(pipeline).exec();

    return results.map((result) => ({
      countryCode: result._id,
      count: result.count,
      countries: result.countries,
    }));
  }

  // Region and categorization
  async findByRegion(region: string): Promise<PhoneNumberConfig[]> {
    const configs = await this.findAll();

    return configs.filter((config) => {
      const configRegion = this.getRegionFromCountryCode(config.countryCode);
      return configRegion.toLowerCase() === region.toLowerCase();
    });
  }

  async groupByCountryCode(): Promise<{
    [countryCode: string]: PhoneNumberConfig[];
  }> {
    const configs = await this.findAll();
    const grouped: { [countryCode: string]: PhoneNumberConfig[] } = {};

    for (const config of configs) {
      if (!grouped[config.countryCode]) {
        grouped[config.countryCode] = [];
      }
      grouped[config.countryCode].push(config);
    }

    return grouped;
  }

  // Maintenance operations
  async findDuplicateCountries(): Promise<PhoneNumberConfig[]> {
    const pipeline = [
      {
        $group: {
          _id: { $toLower: '$country' },
          count: { $sum: 1 },
          docs: { $push: '$$ROOT' },
        },
      },
      {
        $match: {
          count: { $gt: 1 },
        },
      },
    ];

    const results = await PhoneNumberConfigModel.aggregate(pipeline).exec();
    const duplicates: PhoneNumberConfig[] = [];

    for (const result of results) {
      for (const doc of result.docs) {
        duplicates.push(PhoneNumberConfig.fromLegacyData(doc));
      }
    }

    return duplicates;
  }

  async findInvalidRegexConfigs(): Promise<PhoneNumberConfig[]> {
    const configs = await this.findAll();
    const invalidConfigs: PhoneNumberConfig[] = [];

    for (const config of configs) {
      try {
        new RegExp(config.regex);
      } catch (error) {
        invalidConfigs.push(config);
      }
    }

    return invalidConfigs;
  }

  async cleanupInvalidConfigs(): Promise<number> {
    const invalidConfigs = await this.findInvalidRegexConfigs();

    if (invalidConfigs.length === 0) {
      return 0;
    }

    const countries = invalidConfigs.map((config) => config.country);
    return await this.deleteMany(countries);
  }

  // Phone format utilities
  async getPhoneFormatsForCountry(country: string): Promise<string[]> {
    const config = await this.findByCountry(country);
    if (!config) {
      return [];
    }

    return config.getSupportedFormats();
  }

  async getSamplePhoneNumbers(country: string): Promise<string[]> {
    const config = await this.findByCountry(country);
    if (!config) {
      return [];
    }

    // Generate sample numbers based on the country code and common patterns
    const samples: string[] = [];
    const countryCode = config.countryCode;

    // Generate some sample numbers (simplified implementation)
    if (countryCode === '+84') {
      samples.push('+84901234567', '0901234567');
    } else if (countryCode === '+1') {
      samples.push('+12025551234', '12025551234');
    } else if (countryCode === '+44') {
      samples.push('+447911123456', '07911123456');
    } else {
      // Generic samples
      samples.push(`${countryCode}123456789`, `0123456789`);
    }

    return samples;
  }

  async testRegexPattern(
    pattern: string,
    testNumbers: string[]
  ): Promise<{
    pattern: string;
    testResults: { number: string; isValid: boolean }[];
  }> {
    let regex: RegExp;

    try {
      regex = new RegExp(pattern);
    } catch (error) {
      // If pattern is invalid, all tests fail
      return {
        pattern,
        testResults: testNumbers.map((number) => ({ number, isValid: false })),
      };
    }

    const testResults = testNumbers.map((number) => ({
      number,
      isValid: regex.test(number),
    }));

    return {
      pattern,
      testResults,
    };
  }

  // Legacy compatibility
  async findByCountryIgnoreCase(
    country: string
  ): Promise<PhoneNumberConfig | null> {
    return await this.findByCountry(country);
  }

  // Helper methods
  private getRegionFromCountryCode(countryCode: string): string {
    // Simple region mapping based on country code
    const code = countryCode.replace('+', '');

    if (code.startsWith('1')) {
      return 'North America';
    } else if (code.startsWith('2')) {
      return 'Africa';
    } else if (code.startsWith('3') || code.startsWith('4')) {
      return 'Europe';
    } else if (code.startsWith('5')) {
      return 'South America';
    } else if (code.startsWith('6') || code.startsWith('8')) {
      return 'Asia Pacific';
    } else if (code.startsWith('7')) {
      return 'Eurasia';
    } else if (code.startsWith('9')) {
      return 'Asia';
    } else {
      return 'Unknown';
    }
  }
}
