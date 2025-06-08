/**
 * Create EmailDomain DTO
 */
export interface CreateEmailDomainDto {
  domain: string;
}

/**
 * Update EmailDomain DTO
 */
export interface UpdateEmailDomainDto {
  newDomain: string;
}

/**
 * EmailDomain Response DTO
 */
export interface EmailDomainResponseDto {
  id: string;
  domain: string;
  tld: string;
  baseDomain: string;
  isEducational: boolean;
  isGovernment: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Bulk Create EmailDomains DTO
 */
export interface BulkCreateEmailDomainsDto {
  domains: string[];
}

/**
 * Bulk Delete EmailDomains DTO
 */
export interface BulkDeleteEmailDomainsDto {
  domains: string[];
}

/**
 * Email Validation DTO
 */
export interface EmailValidationDto {
  email: string;
}

/**
 * Bulk Email Validation DTO
 */
export interface BulkEmailValidationDto {
  emails: string[];
}

/**
 * Email Validation Response DTO
 */
export interface EmailValidationResponseDto {
  email: string;
  domain: string;
  isValid: boolean;
  isAllowed: boolean;
  validationMessage?: string;
}

/**
 * Domain Search DTO
 */
export interface DomainSearchDto {
  searchTerm: string;
  filters?: {
    tld?: string;
    isEducational?: boolean;
    isGovernment?: boolean;
    baseDomain?: string;
  };
}

/**
 * Domain Type Filter DTO
 */
export interface DomainTypeFilterDto {
  isEducational?: boolean;
  isGovernment?: boolean;
  tld?: string;
  baseDomain?: string;
}

/**
 * Domain Statistics Response DTO
 */
export interface DomainStatisticsDto {
  total: number;
  educational: number;
  government: number;
  commercial: number;
  byTLD: {
    tld: string;
    count: number;
  }[];
  topTLDs: string[];
}

/**
 * Bulk Validation Result DTO
 */
export interface BulkValidationResultDto {
  total: number;
  valid: number;
  invalid: number;
  results: EmailValidationResponseDto[];
}

/**
 * Domain Cleanup Result DTO
 */
export interface DomainCleanupResultDto {
  removedCount: number;
  duplicatesFound: number;
  invalidDomainsRemoved: string[];
}

/**
 * Subdomain Analysis DTO
 */
export interface SubdomainAnalysisDto {
  domain: string;
  subdomains: EmailDomainResponseDto[];
  parentDomains: EmailDomainResponseDto[];
  hasSubdomains: boolean;
  isSubdomain: boolean;
}

/**
 * Domain Migration DTO
 */
export interface DomainMigrationDto {
  fromDomain: string;
  toDomain: string;
  migrateSubdomains?: boolean;
}

/**
 * Domain Import/Export DTO
 */
export interface DomainExportDto {
  format: 'json' | 'csv' | 'txt';
  filters?: DomainTypeFilterDto;
}

export interface DomainImportDto {
  domains: string[];
  format: 'json' | 'csv' | 'txt';
  validateBeforeImport?: boolean;
  skipDuplicates?: boolean;
}

/**
 * Domain Recommendation DTO
 */
export interface DomainRecommendationDto {
  basedOnDomain?: string;
  category?: 'educational' | 'government' | 'commercial';
  limit?: number;
}

/**
 * Domain Health Check DTO
 */
export interface DomainHealthCheckDto {
  domain: string;
  checkDNS?: boolean;
  checkMX?: boolean;
  checkAvailability?: boolean;
}

export interface DomainHealthResponseDto {
  domain: string;
  isHealthy: boolean;
  checks: {
    dnsResolvable: boolean;
    hasMXRecord: boolean;
    isAvailable: boolean;
  };
  issues: string[];
}
