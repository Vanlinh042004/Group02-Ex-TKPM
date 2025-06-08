import {
  PhoneNumberConfig,
  PhoneValidationResult,
} from '../entities/PhoneNumberConfig';

/**
 * PhoneNumberConfig Repository Interface
 * Defines data access methods for phone number configuration management
 */
export interface IPhoneNumberConfigRepository {
  // Basic CRUD operations
  save(config: PhoneNumberConfig): Promise<PhoneNumberConfig>;
  findByCountry(country: string): Promise<PhoneNumberConfig | null>;
  findById(id: string): Promise<PhoneNumberConfig | null>;
  findAll(): Promise<PhoneNumberConfig[]>;
  update(
    id: string,
    config: PhoneNumberConfig
  ): Promise<PhoneNumberConfig | null>;
  delete(country: string): Promise<boolean>;

  // Existence checks
  existsByCountry(country: string): Promise<boolean>;
  existsByCountryCode(countryCode: string): Promise<boolean>;
  existsById(id: string): Promise<boolean>;

  // Country code operations
  findByCountryCode(countryCode: string): Promise<PhoneNumberConfig | null>;
  findByCountryCodes(countryCodes: string[]): Promise<PhoneNumberConfig[]>;
  getAllCountryCodes(): Promise<string[]>;

  // Search and filter operations
  searchByCountryName(searchTerm: string): Promise<PhoneNumberConfig[]>;
  findByCountryPattern(pattern: string): Promise<PhoneNumberConfig[]>;
  findConfigsWithInternationalFormat(): Promise<PhoneNumberConfig[]>;
  findConfigsWithLocalFormat(): Promise<PhoneNumberConfig[]>;

  // Phone number validation
  findConfigForPhoneNumber(
    phoneNumber: string
  ): Promise<PhoneNumberConfig | null>;
  validatePhoneNumber(phoneNumber: string): Promise<PhoneValidationResult[]>;
  findBestMatchForPhone(phoneNumber: string): Promise<PhoneNumberConfig | null>;

  // Bulk operations
  createMany(configs: PhoneNumberConfig[]): Promise<PhoneNumberConfig[]>;
  deleteMany(countries: string[]): Promise<number>;
  validatePhoneNumbers(phoneNumbers: string[]): Promise<
    {
      phoneNumber: string;
      results: PhoneValidationResult[];
    }[]
  >;

  // Analytics and statistics
  getConfigCount(): Promise<number>;
  getCountryStatistics(): Promise<{
    totalCountries: number;
    withInternationalFormat: number;
    withLocalFormat: number;
    byRegion: { region: string; count: number }[];
  }>;
  getMostUsedCountryCodes(limit?: number): Promise<
    {
      countryCode: string;
      count: number;
      countries: string[];
    }[]
  >;

  // Region and categorization
  findByRegion(region: string): Promise<PhoneNumberConfig[]>;
  groupByCountryCode(): Promise<{ [countryCode: string]: PhoneNumberConfig[] }>;

  // Maintenance operations
  findDuplicateCountries(): Promise<PhoneNumberConfig[]>;
  findInvalidRegexConfigs(): Promise<PhoneNumberConfig[]>;
  cleanupInvalidConfigs(): Promise<number>;

  // Phone format utilities
  getPhoneFormatsForCountry(country: string): Promise<string[]>;
  getSamplePhoneNumbers(country: string): Promise<string[]>;
  testRegexPattern(
    pattern: string,
    testNumbers: string[]
  ): Promise<{
    pattern: string;
    testResults: { number: string; isValid: boolean }[];
  }>;

  // Legacy compatibility
  findByCountryIgnoreCase(country: string): Promise<PhoneNumberConfig | null>;
}
