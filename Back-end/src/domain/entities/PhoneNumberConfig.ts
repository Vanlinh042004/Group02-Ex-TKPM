import { BaseEntity } from './base/BaseEntity';

/**
 * PhoneNumberConfig Props Interface
 */
export interface PhoneNumberConfigProps {
  id?: string;
  country: string;
  countryCode: string;
  regex: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * PhoneNumber Validation Result Interface
 */
export interface PhoneValidationResult {
  isValid: boolean;
  country: string;
  countryCode: string;
  normalizedNumber: string;
  format: string;
  message?: string;
}

/**
 * PhoneNumberConfig Domain Entity
 * Rich domain model with phone number validation and country management business logic
 */
export class PhoneNumberConfig extends BaseEntity {
  private readonly _country: string;
  private readonly _countryCode: string;
  private readonly _regex: string;

  // Business constants
  private static readonly MAX_COUNTRY_LENGTH = 100;
  private static readonly MIN_COUNTRY_LENGTH = 2;
  private static readonly MAX_COUNTRY_CODE_LENGTH = 5;
  private static readonly MIN_COUNTRY_CODE_LENGTH = 2;
  private static readonly MAX_REGEX_LENGTH = 500;

  constructor(props: PhoneNumberConfigProps) {
    super(props.id, props.createdAt, props.updatedAt);

    this.validateProps(props);

    // Normalize data
    this._country = props.country.trim();
    this._countryCode = props.countryCode.trim();
    this._regex = this.normalizeRegexPattern(props.regex.trim());

    this.validate();
  }

  getEntityName(): string {
    return 'PhoneNumberConfig';
  }

  // Getters
  get country(): string {
    return this._country;
  }

  get countryCode(): string {
    return this._countryCode;
  }

  get regex(): string {
    return this._regex;
  }

  // Validation methods
  private validateProps(props: PhoneNumberConfigProps): void {
    this.isRequired(props.country, 'Country');
    this.isRequired(props.countryCode, 'Country code');
    this.isRequired(props.regex, 'Regex pattern');
  }

  /**
   * Normalize regex pattern to fix common issues from legacy data
   */
  private normalizeRegexPattern(regex: string): string {
    let normalized = regex;

    // Fix common issues in legacy regex patterns
    // 1. Fix unescaped + signs: +44 -> \\+44
    normalized = normalized.replace(/\(\+(\d+)/g, '(\\\\+$1');

    // 2. Fix unescaped d: d{10} -> \\d{10}
    normalized = normalized.replace(/([^\\])d\{/g, '$1\\\\d{');
    normalized = normalized.replace(/^d\{/g, '\\\\d{');

    // 3. Fix double escaping if already escaped
    normalized = normalized.replace(/\\\\\\\\d/g, '\\\\d');
    normalized = normalized.replace(/\\\\\\\\+/g, '\\\\+');

    if (normalized !== regex) {
      console.warn(`Auto-fixed regex pattern: "${regex}" -> "${normalized}"`);
    }

    return normalized;
  }

  protected validate(): void {
    this.validateCountry();
    this.validateCountryCode();
    this.validateRegexPattern();
  }

  private validateCountry(): void {
    if (this._country.length < PhoneNumberConfig.MIN_COUNTRY_LENGTH) {
      throw this.createValidationError(
        `Country name must be at least ${PhoneNumberConfig.MIN_COUNTRY_LENGTH} characters long`
      );
    }

    if (this._country.length > PhoneNumberConfig.MAX_COUNTRY_LENGTH) {
      throw this.createValidationError(
        `Country name cannot exceed ${PhoneNumberConfig.MAX_COUNTRY_LENGTH} characters`
      );
    }

    // Check for valid characters (letters, spaces, hyphens)
    const countryPattern = /^[a-zA-ZÀ-ỹ\s\-]+$/;
    if (!countryPattern.test(this._country)) {
      throw this.createValidationError(
        'Country name can only contain letters, spaces, and hyphens'
      );
    }
  }

  private validateCountryCode(): void {
    if (this._countryCode.length < PhoneNumberConfig.MIN_COUNTRY_CODE_LENGTH) {
      throw this.createValidationError(
        `Country code must be at least ${PhoneNumberConfig.MIN_COUNTRY_CODE_LENGTH} characters long`
      );
    }

    if (this._countryCode.length > PhoneNumberConfig.MAX_COUNTRY_CODE_LENGTH) {
      throw this.createValidationError(
        `Country code cannot exceed ${PhoneNumberConfig.MAX_COUNTRY_CODE_LENGTH} characters`
      );
    }

    // Country code must start with + and contain only digits
    const codePattern = /^\+\d{1,4}$/;
    if (!codePattern.test(this._countryCode)) {
      throw this.createValidationError(
        'Country code must start with + followed by 1-4 digits (e.g., +84, +1)'
      );
    }
  }

  private validateRegexPattern(): void {
    if (this._regex.length > PhoneNumberConfig.MAX_REGEX_LENGTH) {
      throw this.createValidationError(
        `Regex pattern cannot exceed ${PhoneNumberConfig.MAX_REGEX_LENGTH} characters`
      );
    }

    // Test if regex is valid
    try {
      new RegExp(this._regex);
    } catch (error) {
      console.error('Invalid regex pattern:', this._regex, 'Error:', error);
      throw this.createValidationError(
        `Invalid regex pattern: ${this._regex}. Error: ${error.message}`
      );
    }

    // Additional validation for phone regex patterns
    this.validatePhoneRegexPattern();
  }

  private validatePhoneRegexPattern(): void {
    // Check if regex contains basic phone number patterns (more flexible)
    const hasDigits = /\\d|\[0-9\]|\d/.test(this._regex);
    if (!hasDigits) {
      console.warn(
        'Phone number regex should include digit patterns for better validation'
      );
      // Don't throw error, just warn - allow flexible patterns
    }

    // Check for reasonable length constraints (optional warning only)
    const hasLengthConstraints = /\{\d+\}|\{\d+,\d*\}|\+|\*/.test(this._regex);
    if (!hasLengthConstraints) {
      console.warn(
        'Phone regex pattern should include length constraints for better validation'
      );
    }
  }

  // Business methods

  /**
   * Validate a phone number against this config's pattern
   */
  validatePhoneNumber(phoneNumber: string): PhoneValidationResult {
    if (!phoneNumber?.trim()) {
      return {
        isValid: false,
        country: this._country,
        countryCode: this._countryCode,
        normalizedNumber: '',
        format: this._regex,
        message: 'Phone number is required',
      };
    }

    const normalizedNumber = this.normalizePhoneNumber(phoneNumber);

    try {
      const regex = new RegExp(this._regex);
      const isValid = regex.test(normalizedNumber);

      return {
        isValid,
        country: this._country,
        countryCode: this._countryCode,
        normalizedNumber,
        format: this._regex,
        message: isValid
          ? 'Valid phone number'
          : `Phone number format is invalid for ${this._country}`,
      };
    } catch (error) {
      return {
        isValid: false,
        country: this._country,
        countryCode: this._countryCode,
        normalizedNumber,
        format: this._regex,
        message: 'Invalid regex pattern in configuration',
      };
    }
  }

  /**
   * Normalize phone number (remove spaces, dashes, etc.)
   */
  private normalizePhoneNumber(phoneNumber: string): string {
    return phoneNumber.replace(/[\s\-\(\)\.]/g, '');
  }

  /**
   * Check if this config matches the given country name (case-insensitive)
   */
  matchesCountry(countryName: string): boolean {
    if (!countryName?.trim()) return false;

    return (
      this._country.toLowerCase().includes(countryName.toLowerCase().trim()) ||
      countryName.toLowerCase().trim().includes(this._country.toLowerCase())
    );
  }

  /**
   * Check if this config uses the given country code
   */
  hasCountryCode(countryCode: string): boolean {
    if (!countryCode?.trim()) return false;

    const normalizedCode = countryCode.startsWith('+')
      ? countryCode
      : '+' + countryCode;
    return this._countryCode === normalizedCode;
  }

  /**
   * Get formatted display name
   */
  getDisplayName(): string {
    return `${this._country} (${this._countryCode})`;
  }

  /**
   * Check if config is for an international format
   */
  isInternationalFormat(): boolean {
    return this._regex.includes(this._countryCode.replace('+', '\\+'));
  }

  /**
   * Check if config supports local format (without country code)
   */
  isLocalFormat(): boolean {
    return this._regex.includes('^0') || this._regex.includes('^[0-9]');
  }

  /**
   * Get supported formats description
   */
  getSupportedFormats(): string[] {
    const formats: string[] = [];

    if (this.isInternationalFormat()) {
      formats.push(`International: ${this._countryCode}XXXXXXXXX`);
    }

    if (this.isLocalFormat()) {
      formats.push('Local: 0XXXXXXXXX');
    }

    return formats.length > 0 ? formats : ['Custom format'];
  }

  /**
   * Update country code
   */
  updateCountryCode(newCountryCode: string): PhoneNumberConfig {
    return new PhoneNumberConfig({
      id: this.id,
      country: this._country,
      countryCode: newCountryCode,
      regex: this._regex,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }

  /**
   * Update regex pattern
   */
  updateRegex(newRegex: string): PhoneNumberConfig {
    return new PhoneNumberConfig({
      id: this.id,
      country: this._country,
      countryCode: this._countryCode,
      regex: newRegex,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }

  // Static methods
  static create(
    country: string,
    countryCode: string,
    regex: string
  ): PhoneNumberConfig {
    return new PhoneNumberConfig({ country, countryCode, regex });
  }

  /**
   * Create from legacy data
   */
  static fromLegacyData(data: any): PhoneNumberConfig {
    return new PhoneNumberConfig({
      id: data._id?.toString(),
      country: data.country,
      countryCode: data.countryCode,
      regex: data.regex,
      createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
    });
  }

  /**
   * Convert to plain object for API responses
   */
  toPlainObject(): any {
    return {
      id: this.id,
      country: this._country,
      countryCode: this._countryCode,
      regex: this._regex,
      displayName: this.getDisplayName(),
      supportedFormats: this.getSupportedFormats(),
      isInternational: this.isInternationalFormat(),
      isLocal: this.isLocalFormat(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
