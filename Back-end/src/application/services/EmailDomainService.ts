import { EmailDomain } from '../../domain/entities/EmailDomain';
import { IEmailDomainRepository } from '../../domain/repositories/IEmailDomainRepository';
import {
  CreateEmailDomainDto,
  UpdateEmailDomainDto,
  EmailDomainResponseDto,
  BulkCreateEmailDomainsDto,
  BulkDeleteEmailDomainsDto,
  EmailValidationDto,
  BulkEmailValidationDto,
  EmailValidationResponseDto,
  DomainSearchDto,
  DomainTypeFilterDto,
  DomainStatisticsDto,
  BulkValidationResultDto,
  DomainCleanupResultDto,
  SubdomainAnalysisDto,
} from '../dtos/EmailDomainDto';

/**
 * EmailDomain Application Service
 * Orchestrates domain operations and enforces business rules
 */
export class EmailDomainService {
  constructor(private readonly emailDomainRepository: IEmailDomainRepository) {}

  // Core CRUD operations
  async createEmailDomain(
    dto: CreateEmailDomainDto
  ): Promise<EmailDomainResponseDto> {
    // Check if domain already exists
    const existingDomain = await this.emailDomainRepository.findByDomain(
      dto.domain
    );
    if (existingDomain) {
      throw new Error('Domain already exists in the allowed list');
    }

    // Create and validate domain entity
    const emailDomain = EmailDomain.create(dto.domain);

    // Save to repository
    const savedDomain = await this.emailDomainRepository.save(emailDomain);

    return this.mapToResponseDto(savedDomain);
  }

  async updateEmailDomain(
    domain: string,
    dto: UpdateEmailDomainDto
  ): Promise<EmailDomainResponseDto> {
    // Find existing domain
    const existingDomain = await this.emailDomainRepository.findByDomain(
      domain
    );
    if (!existingDomain) {
      throw new Error('Domain not found');
    }

    // Check if new domain already exists (if different)
    if (dto.newDomain !== domain) {
      const duplicateDomain = await this.emailDomainRepository.findByDomain(
        dto.newDomain
      );
      if (duplicateDomain) {
        throw new Error('New domain already exists in the allowed list');
      }
    }

    // Create new domain entity with updated domain
    const updatedDomain = EmailDomain.create(dto.newDomain);

    // Update in repository
    const result = await this.emailDomainRepository.update(
      existingDomain.id!,
      updatedDomain
    );
    if (!result) {
      throw new Error('Failed to update domain');
    }

    return this.mapToResponseDto(result);
  }

  async deleteEmailDomain(domain: string): Promise<boolean> {
    const existingDomain = await this.emailDomainRepository.findByDomain(
      domain
    );
    if (!existingDomain) {
      throw new Error('Domain not found');
    }

    return await this.emailDomainRepository.delete(domain);
  }

  async getEmailDomain(domain: string): Promise<EmailDomainResponseDto | null> {
    const emailDomain = await this.emailDomainRepository.findByDomain(domain);
    if (!emailDomain) {
      return null;
    }

    return this.mapToResponseDto(emailDomain);
  }

  async getAllEmailDomains(): Promise<EmailDomainResponseDto[]> {
    const domains = await this.emailDomainRepository.findAll();
    return domains.map((domain) => this.mapToResponseDto(domain));
  }

  // Email validation operations
  async validateEmailDomain(
    dto: EmailValidationDto
  ): Promise<EmailValidationResponseDto> {
    try {
      // Validate email format and extract domain
      const domain = EmailDomain.extractDomainFromEmail(dto.email);

      // Check if domain is allowed
      const isAllowed = await this.emailDomainRepository.isDomainAllowed(
        domain
      );

      return {
        email: dto.email,
        domain: domain,
        isValid: true,
        isAllowed: isAllowed,
        validationMessage: isAllowed
          ? 'Email domain is allowed'
          : 'Email domain is not in the allowed list',
      };
    } catch (error: any) {
      return {
        email: dto.email,
        domain: '',
        isValid: false,
        isAllowed: false,
        validationMessage: error.message || 'Invalid email format',
      };
    }
  }

  async validateMultipleEmailDomains(
    dto: BulkEmailValidationDto
  ): Promise<BulkValidationResultDto> {
    const results: EmailValidationResponseDto[] = [];

    for (const email of dto.emails) {
      const result = await this.validateEmailDomain({ email });
      results.push(result);
    }

    const validCount = results.filter((r) => r.isValid && r.isAllowed).length;
    const invalidCount = results.length - validCount;

    return {
      total: results.length,
      valid: validCount,
      invalid: invalidCount,
      results: results,
    };
  }

  async isEmailDomainAllowed(email: string): Promise<boolean> {
    try {
      return await this.emailDomainRepository.isEmailDomainAllowed(email);
    } catch {
      return false;
    }
  }

  // Bulk operations
  async createMultipleEmailDomains(
    dto: BulkCreateEmailDomainsDto
  ): Promise<EmailDomainResponseDto[]> {
    const results: EmailDomainResponseDto[] = [];
    const errors: string[] = [];

    for (const domain of dto.domains) {
      try {
        const result = await this.createEmailDomain({ domain });
        results.push(result);
      } catch (error: any) {
        errors.push(`${domain}: ${error.message}`);
      }
    }

    if (errors.length > 0) {
      throw new Error(`Some domains failed to create: ${errors.join('; ')}`);
    }

    return results;
  }

  async deleteMultipleEmailDomains(
    dto: BulkDeleteEmailDomainsDto
  ): Promise<number> {
    return await this.emailDomainRepository.deleteMany(dto.domains);
  }

  // Search and filter operations
  async searchEmailDomains(
    dto: DomainSearchDto
  ): Promise<EmailDomainResponseDto[]> {
    let domains: EmailDomain[];

    if (dto.filters && Object.keys(dto.filters).length > 0) {
      domains = await this.emailDomainRepository.findDomainsByType(dto.filters);
    } else {
      domains = await this.emailDomainRepository.searchDomains(dto.searchTerm);
    }

    // Additional filtering by search term if needed
    if (dto.searchTerm && dto.filters) {
      domains = domains.filter((domain) =>
        domain.domain.toLowerCase().includes(dto.searchTerm.toLowerCase())
      );
    }

    return domains.map((domain) => this.mapToResponseDto(domain));
  }

  async getEmailDomainsByType(
    dto: DomainTypeFilterDto
  ): Promise<EmailDomainResponseDto[]> {
    const domains = await this.emailDomainRepository.findDomainsByType(dto);
    return domains.map((domain) => this.mapToResponseDto(domain));
  }

  async getEducationalDomains(): Promise<EmailDomainResponseDto[]> {
    const domains = await this.emailDomainRepository.findEducationalDomains();
    return domains.map((domain) => this.mapToResponseDto(domain));
  }

  async getGovernmentDomains(): Promise<EmailDomainResponseDto[]> {
    const domains = await this.emailDomainRepository.findGovernmentDomains();
    return domains.map((domain) => this.mapToResponseDto(domain));
  }

  // Analytics and statistics
  async getDomainStatistics(): Promise<DomainStatisticsDto> {
    const stats = await this.emailDomainRepository.getDomainStatistics();
    const topTLDs = await this.emailDomainRepository.getMostCommonTLDs(5);

    return {
      ...stats,
      topTLDs: topTLDs,
    };
  }

  // Subdomain analysis
  async analyzeSubdomains(domain: string): Promise<SubdomainAnalysisDto> {
    const emailDomain = await this.emailDomainRepository.findByDomain(domain);
    if (!emailDomain) {
      throw new Error('Domain not found');
    }

    const subdomains = await this.emailDomainRepository.findSubdomainsOf(
      domain
    );
    const parentDomains = await this.emailDomainRepository.findParentDomainsOf(
      domain
    );
    const hasSubdomains = await this.emailDomainRepository.hasSubdomains(
      domain
    );

    return {
      domain: domain,
      subdomains: subdomains.map((d) => this.mapToResponseDto(d)),
      parentDomains: parentDomains.map((d) => this.mapToResponseDto(d)),
      hasSubdomains: hasSubdomains,
      isSubdomain: parentDomains.length > 0,
    };
  }

  // Maintenance operations
  async cleanupDomains(): Promise<DomainCleanupResultDto> {
    const removedCount =
      await this.emailDomainRepository.cleanupInvalidDomains();
    const duplicates = await this.emailDomainRepository.findDuplicateDomains();

    return {
      removedCount: removedCount,
      duplicatesFound: duplicates.length,
      invalidDomainsRemoved: [], // Would need to track which domains were removed
    };
  }

  // Legacy compatibility methods (for maintaining existing API contracts)
  async addAllowedEmailDomain(domain: string): Promise<any> {
    const result = await this.createEmailDomain({ domain });
    return {
      _id: result.id,
      domain: result.domain,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  }

  async deleteAllowedEmailDomain(domain: string): Promise<any> {
    const existingDomain = await this.emailDomainRepository.findByDomain(
      domain
    );
    if (!existingDomain) {
      throw new Error('Domain not found');
    }

    await this.deleteEmailDomain(domain);

    return {
      _id: existingDomain.id,
      domain: existingDomain.domain,
    };
  }

  async updateAllowedEmailDomain(
    domain: string,
    newDomain: string
  ): Promise<any> {
    const result = await this.updateEmailDomain(domain, { newDomain });
    return {
      _id: result.id,
      domain: result.domain,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  }

  async getAllAllowedEmailDomains(): Promise<any[]> {
    const domains = await this.getAllEmailDomains();
    return domains.map((domain) => ({
      _id: domain.id,
      domain: domain.domain,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
    }));
  }

  async isValidEmailDomain(email: string): Promise<boolean> {
    return await this.isEmailDomainAllowed(email);
  }

  // Helper methods
  private mapToResponseDto(emailDomain: EmailDomain): EmailDomainResponseDto {
    const plainObject = emailDomain.toPlainObject();
    return {
      id: plainObject.id,
      domain: plainObject.domain,
      tld: plainObject.tld,
      baseDomain: plainObject.baseDomain,
      isEducational: plainObject.isEducational,
      isGovernment: plainObject.isGovernment,
      createdAt: plainObject.createdAt,
      updatedAt: plainObject.updatedAt,
    };
  }
}
