import { EmailDomain } from '../entities/EmailDomain';

/**
 * EmailDomain Repository Interface
 * Defines data access methods for EmailDomain management
 */
export interface IEmailDomainRepository {
  // Basic CRUD operations
  save(emailDomain: EmailDomain): Promise<EmailDomain>;
  findByDomain(domain: string): Promise<EmailDomain | null>;
  findById(id: string): Promise<EmailDomain | null>;
  findAll(): Promise<EmailDomain[]>;
  update(id: string, emailDomain: EmailDomain): Promise<EmailDomain | null>;
  delete(domain: string): Promise<boolean>;

  // Existence checks
  existsByDomain(domain: string): Promise<boolean>;
  existsById(id: string): Promise<boolean>;

  // Domain validation queries
  isDomainAllowed(domain: string): Promise<boolean>;
  isEmailDomainAllowed(email: string): Promise<boolean>;
  findDomainsMatchingEmail(email: string): Promise<EmailDomain[]>;

  // Search and filter operations
  searchDomains(searchTerm: string): Promise<EmailDomain[]>;
  findDomainsByTLD(tld: string): Promise<EmailDomain[]>;
  findEducationalDomains(): Promise<EmailDomain[]>;
  findGovernmentDomains(): Promise<EmailDomain[]>;
  findDomainsByType(filters: {
    isEducational?: boolean;
    isGovernment?: boolean;
    tld?: string;
    baseDomain?: string;
  }): Promise<EmailDomain[]>;

  // Subdomain operations
  findSubdomainsOf(parentDomain: string): Promise<EmailDomain[]>;
  findParentDomainsOf(subdomain: string): Promise<EmailDomain[]>;
  hasSubdomains(domain: string): Promise<boolean>;

  // Bulk operations
  createMany(domains: string[]): Promise<EmailDomain[]>;
  deleteMany(domains: string[]): Promise<number>;
  validateDomains(
    domains: string[]
  ): Promise<{ valid: string[]; invalid: string[] }>;

  // Analytics and statistics
  getDomainCount(): Promise<number>;
  getDomainCountByTLD(): Promise<{ tld: string; count: number }[]>;
  getMostCommonTLDs(limit?: number): Promise<string[]>;
  getDomainStatistics(): Promise<{
    total: number;
    educational: number;
    government: number;
    commercial: number;
    byTLD: { tld: string; count: number }[];
  }>;

  // Email validation utilities
  getValidDomainsForEmails(emails: string[]): Promise<
    {
      email: string;
      domain: string;
      isAllowed: boolean;
    }[]
  >;

  // Maintenance operations
  cleanupInvalidDomains(): Promise<number>;
  findDuplicateDomains(): Promise<EmailDomain[]>;
}
