import {
  PhoneNumberConfig,
  PhoneValidationResult,
} from '../../domain/entities/PhoneNumberConfig';
import { IPhoneNumberConfigRepository } from '../../domain/repositories/IPhoneNumberConfigRepository';
import {
  CreatePhoneNumberConfigDto,
  UpdatePhoneNumberConfigDto,
  PhoneNumberConfigResponseDto,
  PhoneValidationDto,
  PhoneValidationResponseDto,
  BulkPhoneValidationDto,
  BulkPhoneValidationResultDto,
  CountrySearchDto,
  BulkCreatePhoneConfigsDto,
  BulkDeletePhoneConfigsDto,
  PhoneConfigStatisticsDto,
  RegexPatternTestDto,
  PatternTestResultDto,
  PhoneFormatAnalysisDto,
} from '../dtos/PhoneNumberConfigDto';

/**
 * PhoneNumberConfig Application Service
 * Orchestrates phone number configuration operations and enforces business rules
 */
export class PhoneNumberConfigService {
  constructor(
    private readonly phoneConfigRepository: IPhoneNumberConfigRepository
  ) {}

  // Core CRUD operations
  async createPhoneConfig(
    dto: CreatePhoneNumberConfigDto
  ): Promise<PhoneNumberConfigResponseDto> {
    // Check if country already exists
    const existingConfig = await this.phoneConfigRepository.findByCountry(
      dto.country
    );
    if (existingConfig) {
      throw new Error(
        `Phone number configuration for ${dto.country} already exists`
      );
    }

    // Create and validate config entity
    const phoneConfig = PhoneNumberConfig.create(
      dto.country,
      dto.countryCode,
      dto.regex
    );

    // Save to repository
    const savedConfig = await this.phoneConfigRepository.save(phoneConfig);

    return this.mapToResponseDto(savedConfig);
  }

  async updatePhoneConfig(
    country: string,
    dto: UpdatePhoneNumberConfigDto
  ): Promise<PhoneNumberConfigResponseDto> {
    // Find existing config
    const existingConfig = await this.phoneConfigRepository.findByCountry(
      country
    );
    if (!existingConfig) {
      throw new Error(`No phone number configuration found for ${country}`);
    }

    // Create updated config entity
    let updatedConfig = existingConfig;

    if (dto.countryCode) {
      updatedConfig = updatedConfig.updateCountryCode(dto.countryCode);
    }

    if (dto.regex) {
      updatedConfig = updatedConfig.updateRegex(dto.regex);
    }

    // Update in repository
    const result = await this.phoneConfigRepository.update(
      existingConfig.id!,
      updatedConfig
    );
    if (!result) {
      throw new Error('Failed to update phone number configuration');
    }

    return this.mapToResponseDto(result);
  }

  async deletePhoneConfig(country: string): Promise<boolean> {
    const existingConfig = await this.phoneConfigRepository.findByCountry(
      country
    );
    if (!existingConfig) {
      throw new Error(`No phone number configuration found for ${country}`);
    }

    return await this.phoneConfigRepository.delete(country);
  }

  async getPhoneConfig(
    country: string
  ): Promise<PhoneNumberConfigResponseDto | null> {
    const config = await this.phoneConfigRepository.findByCountry(country);
    if (!config) {
      return null;
    }

    return this.mapToResponseDto(config);
  }

  async getAllPhoneConfigs(): Promise<PhoneNumberConfigResponseDto[]> {
    const configs = await this.phoneConfigRepository.findAll();
    return configs.map((config) => this.mapToResponseDto(config));
  }

  // Phone validation operations
  async validatePhoneNumber(
    dto: PhoneValidationDto
  ): Promise<PhoneValidationResponseDto[]> {
    if (dto.country) {
      // Validate against specific country
      const config = await this.phoneConfigRepository.findByCountry(
        dto.country
      );
      if (!config) {
        throw new Error(
          `No phone number configuration found for ${dto.country}`
        );
      }

      const result = config.validatePhoneNumber(dto.phoneNumber);
      return [this.mapValidationResult(result)];
    } else {
      // Validate against all configs to find matches
      const results = await this.phoneConfigRepository.validatePhoneNumber(
        dto.phoneNumber
      );
      return results.map((result) => this.mapValidationResult(result));
    }
  }

  async bulkValidatePhoneNumbers(
    dto: BulkPhoneValidationDto
  ): Promise<BulkPhoneValidationResultDto> {
    const results: {
      phoneNumber: string;
      validationResults: PhoneValidationResponseDto[];
      bestMatch?: PhoneValidationResponseDto;
    }[] = [];

    for (const phoneNumber of dto.phoneNumbers) {
      const validationResults = await this.validatePhoneNumber({
        phoneNumber,
        country: dto.country,
      });

      // Find best match (first valid result)
      const bestMatch = validationResults.find((result) => result.isValid);

      results.push({
        phoneNumber,
        validationResults,
        bestMatch,
      });
    }

    const validCount = results.filter((r) => r.bestMatch?.isValid).length;
    const invalidCount = results.length - validCount;

    return {
      total: results.length,
      valid: validCount,
      invalid: invalidCount,
      results: results,
    };
  }

  async findBestMatchForPhone(
    phoneNumber: string
  ): Promise<PhoneNumberConfigResponseDto | null> {
    const config = await this.phoneConfigRepository.findBestMatchForPhone(
      phoneNumber
    );
    if (!config) {
      return null;
    }

    return this.mapToResponseDto(config);
  }

  // Search and filter operations
  async searchConfigs(
    dto: CountrySearchDto
  ): Promise<PhoneNumberConfigResponseDto[]> {
    let configs: PhoneNumberConfig[];

    if (dto.filters && Object.keys(dto.filters).length > 0) {
      // Apply filters
      configs = await this.applyFilters(dto);
    } else {
      // Simple search
      configs = await this.phoneConfigRepository.searchByCountryName(
        dto.searchTerm
      );
    }

    return configs.map((config) => this.mapToResponseDto(config));
  }

  private async applyFilters(
    dto: CountrySearchDto
  ): Promise<PhoneNumberConfig[]> {
    let configs = await this.phoneConfigRepository.findAll();

    // Apply search term filter
    if (dto.searchTerm) {
      configs = configs.filter((config) =>
        config.country.toLowerCase().includes(dto.searchTerm.toLowerCase())
      );
    }

    // Apply other filters
    if (dto.filters?.countryCode) {
      configs = configs.filter(
        (config) => config.countryCode === dto.filters!.countryCode
      );
    }

    if (dto.filters?.hasInternationalFormat !== undefined) {
      configs = configs.filter(
        (config) =>
          config.isInternationalFormat() === dto.filters!.hasInternationalFormat
      );
    }

    if (dto.filters?.hasLocalFormat !== undefined) {
      configs = configs.filter(
        (config) => config.isLocalFormat() === dto.filters!.hasLocalFormat
      );
    }

    return configs;
  }

  async getConfigsByCountryCode(
    countryCode: string
  ): Promise<PhoneNumberConfigResponseDto[]> {
    const configs = await this.phoneConfigRepository.findByCountryCodes([
      countryCode,
    ]);
    return configs.map((config) => this.mapToResponseDto(config));
  }

  // Bulk operations
  async createMultipleConfigs(
    dto: BulkCreatePhoneConfigsDto
  ): Promise<PhoneNumberConfigResponseDto[]> {
    const results: PhoneNumberConfigResponseDto[] = [];
    const errors: string[] = [];

    for (const configDto of dto.configs) {
      try {
        const result = await this.createPhoneConfig(configDto);
        results.push(result);
      } catch (error: any) {
        errors.push(`${configDto.country}: ${error.message}`);
      }
    }

    if (errors.length > 0) {
      throw new Error(
        `Some configurations failed to create: ${errors.join('; ')}`
      );
    }

    return results;
  }

  async deleteMultipleConfigs(dto: BulkDeletePhoneConfigsDto): Promise<number> {
    return await this.phoneConfigRepository.deleteMany(dto.countries);
  }

  // Analytics and statistics
  async getStatistics(): Promise<PhoneConfigStatisticsDto> {
    const stats = await this.phoneConfigRepository.getCountryStatistics();
    const topCountryCodes =
      await this.phoneConfigRepository.getMostUsedCountryCodes(5);

    return {
      totalCountries: stats.totalCountries,
      withInternationalFormat: stats.withInternationalFormat,
      withLocalFormat: stats.withLocalFormat,
      byRegion: stats.byRegion,
      mostUsedCountryCodes: topCountryCodes,
    };
  }

  // Utility operations
  async testRegexPattern(
    dto: RegexPatternTestDto
  ): Promise<PatternTestResultDto> {
    let isValidPattern = true;
    const patternErrors: string[] = [];

    // Test if regex is valid
    try {
      new RegExp(dto.pattern);
    } catch (error: any) {
      isValidPattern = false;
      patternErrors.push(error.message);
    }

    // Test against sample numbers
    const testResults: { number: string; isValid: boolean }[] = [];

    if (isValidPattern) {
      const regex = new RegExp(dto.pattern);
      for (const number of dto.testNumbers) {
        testResults.push({
          number,
          isValid: regex.test(number),
        });
      }
    } else {
      // If pattern is invalid, all tests fail
      for (const number of dto.testNumbers) {
        testResults.push({
          number,
          isValid: false,
        });
      }
    }

    return {
      pattern: dto.pattern,
      isValidPattern,
      testResults,
      patternErrors: patternErrors.length > 0 ? patternErrors : undefined,
    };
  }

  async analyzePhoneFormat(country: string): Promise<PhoneFormatAnalysisDto> {
    const config = await this.phoneConfigRepository.findByCountry(country);
    if (!config) {
      throw new Error(`No phone number configuration found for ${country}`);
    }

    const supportedFormats = config.getSupportedFormats();
    const sampleNumbers =
      await this.phoneConfigRepository.getSamplePhoneNumbers(country);

    // Analyze validation rules
    const validationRules = {
      minLength: this.extractMinLength(config.regex),
      maxLength: this.extractMaxLength(config.regex),
      allowsInternational: config.isInternationalFormat(),
      allowsLocal: config.isLocalFormat(),
      requiredPrefixes: this.extractRequiredPrefixes(config.regex),
    };

    return {
      country,
      supportedFormats,
      sampleNumbers,
      validationRules,
    };
  }

  // Legacy compatibility methods
  async getAllPhoneNumberConfigs(): Promise<any[]> {
    const configs = await this.getAllPhoneConfigs();
    return configs.map((config) => ({
      _id: config.id,
      country: config.country,
      countryCode: config.countryCode,
      regex: config.regex,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    }));
  }

  async getPhoneNumberConfig(country: string): Promise<any> {
    const config = await this.getPhoneConfig(country);
    if (!config) {
      throw new Error(`No phone number configuration found for ${country}`);
    }

    return {
      _id: config.id,
      country: config.country,
      countryCode: config.countryCode,
      regex: config.regex,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    };
  }

  async addPhoneNumberConfig(phoneNumberConfig: any): Promise<any> {
    const result = await this.createPhoneConfig({
      country: phoneNumberConfig.country,
      countryCode: phoneNumberConfig.countryCode,
      regex: phoneNumberConfig.regex,
    });

    return {
      _id: result.id,
      country: result.country,
      countryCode: result.countryCode,
      regex: result.regex,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  }

  async updatePhoneNumberConfig(
    country: string,
    updateData: any
  ): Promise<any> {
    const result = await this.updatePhoneConfig(country, updateData);

    return {
      _id: result.id,
      country: result.country,
      countryCode: result.countryCode,
      regex: result.regex,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  }

  async deletePhoneNumberConfig(country: string): Promise<any> {
    const existingConfig = await this.phoneConfigRepository.findByCountry(
      country
    );
    if (!existingConfig) {
      throw new Error(`No phone number configuration found for ${country}`);
    }

    await this.deletePhoneConfig(country);

    return {
      _id: existingConfig.id,
      country: existingConfig.country,
      countryCode: existingConfig.countryCode,
      regex: existingConfig.regex,
    };
  }

  // Helper methods
  private mapToResponseDto(
    config: PhoneNumberConfig
  ): PhoneNumberConfigResponseDto {
    const plainObject = config.toPlainObject();
    return {
      id: plainObject.id,
      country: plainObject.country,
      countryCode: plainObject.countryCode,
      regex: plainObject.regex,
      displayName: plainObject.displayName,
      supportedFormats: plainObject.supportedFormats,
      isInternational: plainObject.isInternational,
      isLocal: plainObject.isLocal,
      createdAt: plainObject.createdAt,
      updatedAt: plainObject.updatedAt,
    };
  }

  private mapValidationResult(
    result: PhoneValidationResult
  ): PhoneValidationResponseDto {
    return {
      isValid: result.isValid,
      country: result.country,
      countryCode: result.countryCode,
      normalizedNumber: result.normalizedNumber,
      format: result.format,
      message: result.message,
    };
  }

  private extractMinLength(regex: string): number {
    const match = regex.match(/\{(\d+),?\d*\}/);
    return match ? parseInt(match[1]) : 0;
  }

  private extractMaxLength(regex: string): number {
    const match = regex.match(/\{\d*,?(\d+)\}/);
    return match ? parseInt(match[1]) : 0;
  }

  private extractRequiredPrefixes(regex: string): string[] {
    const prefixes: string[] = [];

    // Extract common patterns for prefixes
    const patterns = [
      /\^(\+\d+)/g, // International prefix like +84
      /\^(0)/g, // Local prefix like 0
      /\^\((\+\d+)\|0\)/g, // Either pattern like (+84|0)
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(regex)) !== null) {
        prefixes.push(match[1]);
      }
    }

    return [...new Set(prefixes)]; // Remove duplicates
  }
}
