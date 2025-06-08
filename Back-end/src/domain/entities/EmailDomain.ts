import { BaseEntity } from './base/BaseEntity';

/**
 * EmailDomain Props Interface
 */
export interface EmailDomainProps {
  id?: string;
  domain: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * EmailDomain Domain Entity
 * Rich domain model with email domain validation and management business logic
 */
export class EmailDomain extends BaseEntity {
  private readonly _domain: string;

  // Business constants
  private static readonly MAX_DOMAIN_LENGTH = 255;
  private static readonly MIN_DOMAIN_LENGTH = 3;
  private static readonly DOMAIN_REGEX =
    /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  constructor(props: EmailDomainProps) {
    super(props.id, props.createdAt, props.updatedAt);

    this.validateProps(props);

    // Normalize domain: lowercase and trim
    this._domain = props.domain.toLowerCase().trim();

    this.validate();
  }

  getEntityName(): string {
    return 'EmailDomain';
  }

  // Getters
  get domain(): string {
    return this._domain;
  }

  // Validation methods
  private validateProps(props: EmailDomainProps): void {
    if (!props.domain?.trim()) {
      throw this.createValidationError('Domain is required');
    }
  }

  protected validate(): void {
    this.validateDomainFormat();
    this.validateDomainLength();
  }

  private validateDomainFormat(): void {
    // Check basic domain format
    if (!EmailDomain.DOMAIN_REGEX.test(this._domain)) {
      throw this.createValidationError(
        'Invalid domain format. Domain must contain only letters, numbers, dots, and hyphens'
      );
    }

    // Check for valid TLD (must end with letters)
    const parts = this._domain.split('.');
    if (parts.length < 2) {
      throw this.createValidationError(
        'Domain must have at least one dot (e.g., example.com)'
      );
    }

    const tld = parts[parts.length - 1];
    if (!/^[a-zA-Z]{2,}$/.test(tld)) {
      throw this.createValidationError(
        'Domain must end with a valid top-level domain (letters only, min 2 characters)'
      );
    }

    // Check for consecutive dots or hyphens
    if (this._domain.includes('..') || this._domain.includes('--')) {
      throw this.createValidationError(
        'Domain cannot contain consecutive dots or hyphens'
      );
    }

    // Check that domain doesn't start or end with dot or hyphen
    if (
      this._domain.startsWith('.') ||
      this._domain.endsWith('.') ||
      this._domain.startsWith('-') ||
      this._domain.endsWith('-')
    ) {
      throw this.createValidationError(
        'Domain cannot start or end with dots or hyphens'
      );
    }
  }

  private validateDomainLength(): void {
    if (this._domain.length < EmailDomain.MIN_DOMAIN_LENGTH) {
      throw this.createValidationError(
        `Domain must be at least ${EmailDomain.MIN_DOMAIN_LENGTH} characters long`
      );
    }

    if (this._domain.length > EmailDomain.MAX_DOMAIN_LENGTH) {
      throw this.createValidationError(
        `Domain cannot exceed ${EmailDomain.MAX_DOMAIN_LENGTH} characters`
      );
    }
  }

  // Business methods

  /**
   * Check if this domain matches the given email's domain
   */
  matchesEmail(email: string): boolean {
    if (!email) return false;

    try {
      const emailDomain = EmailDomain.extractDomainFromEmail(email);
      return this._domain === emailDomain.toLowerCase();
    } catch {
      return false;
    }
  }

  /**
   * Check if this domain is a subdomain of the given domain
   */
  isSubdomainOf(parentDomain: string): boolean {
    if (!parentDomain) return false;

    const parentDomainLower = parentDomain.toLowerCase().trim();
    return this._domain.endsWith('.' + parentDomainLower);
  }

  /**
   * Check if this domain is a parent domain of the given domain
   */
  isParentDomainOf(subdomain: string): boolean {
    if (!subdomain) return false;

    const subdomainLower = subdomain.toLowerCase().trim();
    return subdomainLower.endsWith('.' + this._domain);
  }

  /**
   * Get the top-level domain (TLD)
   */
  getTLD(): string {
    const parts = this._domain.split('.');
    return parts[parts.length - 1];
  }

  /**
   * Get the domain without subdomains (e.g., mail.google.com -> google.com)
   */
  getBaseDomain(): string {
    const parts = this._domain.split('.');
    if (parts.length <= 2) {
      return this._domain;
    }
    return parts.slice(-2).join('.');
  }

  /**
   * Check if domain is commonly used for educational institutions
   */
  isEducationalDomain(): boolean {
    const educationalTLDs = ['edu', 'ac', 'edu.vn', 'ac.vn'];
    return educationalTLDs.some(
      (tld) => this._domain.endsWith('.' + tld) || this._domain === tld
    );
  }

  /**
   * Check if domain is commonly used for government institutions
   */
  isGovernmentDomain(): boolean {
    const governmentTLDs = ['gov', 'gov.vn', 'mil'];
    return governmentTLDs.some(
      (tld) => this._domain.endsWith('.' + tld) || this._domain === tld
    );
  }

  // Static methods
  static create(domain: string): EmailDomain {
    return new EmailDomain({ domain });
  }

  /**
   * Extract domain from email address
   */
  static extractDomainFromEmail(email: string): string {
    if (!email?.trim()) {
      throw new Error('Email is required');
    }

    const emailRegex = /^[^\s@]+@([^\s@]+\.[^\s@]+)$/;
    const match = email.trim().match(emailRegex);

    if (!match) {
      throw new Error('Invalid email format');
    }

    return match[1].toLowerCase();
  }

  /**
   * Validate email format and extract domain
   */
  static validateAndExtractDomain(email: string): string {
    const domain = EmailDomain.extractDomainFromEmail(email);

    // Create temporary EmailDomain to validate domain format
    new EmailDomain({ domain });

    return domain;
  }

  /**
   * Check if email has valid format
   */
  static isValidEmailFormat(email: string): boolean {
    if (!email?.trim()) return false;

    try {
      EmailDomain.extractDomainFromEmail(email);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Create EmailDomain from legacy data
   */
  static fromLegacyData(data: any): EmailDomain {
    return new EmailDomain({
      id: data._id?.toString(),
      domain: data.domain,
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
      domain: this._domain,
      tld: this.getTLD(),
      baseDomain: this.getBaseDomain(),
      isEducational: this.isEducationalDomain(),
      isGovernment: this.isGovernmentDomain(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
