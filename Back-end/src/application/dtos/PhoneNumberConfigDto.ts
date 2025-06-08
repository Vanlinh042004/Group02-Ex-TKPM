/**
 * Create PhoneNumberConfig DTO
 */
export interface CreatePhoneNumberConfigDto {
  country: string;
  countryCode: string;
  regex: string;
}

/**
 * Update PhoneNumberConfig DTO
 */
export interface UpdatePhoneNumberConfigDto {
  countryCode?: string;
  regex?: string;
}

/**
 * PhoneNumberConfig Response DTO
 */
export interface PhoneNumberConfigResponseDto {
  id: string;
  country: string;
  countryCode: string;
  regex: string;
  displayName: string;
  supportedFormats: string[];
  isInternational: boolean;
  isLocal: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Phone Number Validation DTO
 */
export interface PhoneValidationDto {
  phoneNumber: string;
  country?: string;
}

/**
 * Phone Validation Response DTO
 */
export interface PhoneValidationResponseDto {
  isValid: boolean;
  country: string;
  countryCode: string;
  normalizedNumber: string;
  format: string;
  message?: string;
}

/**
 * Bulk Phone Validation DTO
 */
export interface BulkPhoneValidationDto {
  phoneNumbers: string[];
  country?: string;
}

/**
 * Bulk Validation Result DTO
 */
export interface BulkPhoneValidationResultDto {
  total: number;
  valid: number;
  invalid: number;
  results: {
    phoneNumber: string;
    validationResults: PhoneValidationResponseDto[];
    bestMatch?: PhoneValidationResponseDto;
  }[];
}

/**
 * Country Search DTO
 */
export interface CountrySearchDto {
  searchTerm: string;
  filters?: {
    countryCode?: string;
    hasInternationalFormat?: boolean;
    hasLocalFormat?: boolean;
    region?: string;
  };
}

/**
 * Bulk Create PhoneNumberConfigs DTO
 */
export interface BulkCreatePhoneConfigsDto {
  configs: CreatePhoneNumberConfigDto[];
}

/**
 * Bulk Delete PhoneNumberConfigs DTO
 */
export interface BulkDeletePhoneConfigsDto {
  countries: string[];
}

/**
 * Phone Config Statistics DTO
 */
export interface PhoneConfigStatisticsDto {
  totalCountries: number;
  withInternationalFormat: number;
  withLocalFormat: number;
  byRegion: {
    region: string;
    count: number;
  }[];
  mostUsedCountryCodes: {
    countryCode: string;
    count: number;
    countries: string[];
  }[];
}

/**
 * Regex Pattern Test DTO
 */
export interface RegexPatternTestDto {
  pattern: string;
  testNumbers: string[];
}

/**
 * Pattern Test Result DTO
 */
export interface PatternTestResultDto {
  pattern: string;
  isValidPattern: boolean;
  testResults: {
    number: string;
    isValid: boolean;
  }[];
  patternErrors?: string[];
}

/**
 * Phone Format Analysis DTO
 */
export interface PhoneFormatAnalysisDto {
  country: string;
  supportedFormats: string[];
  sampleNumbers: string[];
  validationRules: {
    minLength: number;
    maxLength: number;
    allowsInternational: boolean;
    allowsLocal: boolean;
    requiredPrefixes: string[];
  };
}

/**
 * Country Group DTO
 */
export interface CountryGroupDto {
  countryCode: string;
  countries: PhoneNumberConfigResponseDto[];
  count: number;
}

/**
 * Phone Number Format DTO
 */
export interface PhoneNumberFormatDto {
  original: string;
  normalized: string;
  international?: string;
  local?: string;
  e164?: string;
}

/**
 * Config Import/Export DTO
 */
export interface ConfigExportDto {
  format: 'json' | 'csv' | 'xml';
  includeMetadata?: boolean;
  countries?: string[];
}

export interface ConfigImportDto {
  configs: CreatePhoneNumberConfigDto[];
  format: 'json' | 'csv' | 'xml';
  validateBeforeImport?: boolean;
  skipDuplicates?: boolean;
  updateExisting?: boolean;
}

/**
 * Phone Number Suggestion DTO
 */
export interface PhoneNumberSuggestionDto {
  input: string;
  suggestions: {
    formatted: string;
    country: string;
    countryCode: string;
    confidence: number;
  }[];
}

/**
 * Config Validation Result DTO
 */
export interface ConfigValidationResultDto {
  country: string;
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

/**
 * Maintenance Report DTO
 */
export interface MaintenanceReportDto {
  duplicateCountries: number;
  invalidRegexConfigs: number;
  cleanedConfigs: number;
  issues: {
    type: 'duplicate' | 'invalid_regex' | 'missing_data';
    country: string;
    description: string;
  }[];
}

/**
 * Phone Number Migration DTO
 */
export interface PhoneNumberMigrationDto {
  fromCountry: string;
  toCountry: string;
  phoneNumbers: string[];
  dryRun?: boolean;
}

export interface MigrationResultDto {
  total: number;
  successful: number;
  failed: number;
  results: {
    original: string;
    converted?: string;
    status: 'success' | 'failed';
    reason?: string;
  }[];
}
