import mongoose, { Types } from 'mongoose';
import { EmailDomain } from '../../domain/entities/EmailDomain';
import { IEmailDomainRepository } from '../../domain/repositories/IEmailDomainRepository';
import EmailDomainModel from '../../components/email-domain/models/EmailDomain';

/**
 * MongoDB implementation of EmailDomain Repository
 */
export class MongoEmailDomainRepository implements IEmailDomainRepository {
  // Basic CRUD operations
  async save(emailDomain: EmailDomain): Promise<EmailDomain> {
    try {
      const doc = new EmailDomainModel({
        domain: emailDomain.domain,
      });

      const savedDoc = await doc.save();
      return EmailDomain.fromLegacyData(savedDoc.toObject());
    } catch (error: any) {
      throw new Error(`Failed to save email domain: ${error.message}`);
    }
  }

  async findByDomain(domain: string): Promise<EmailDomain | null> {
    try {
      const doc = await EmailDomainModel.findOne({
        domain: domain.toLowerCase().trim(),
      });

      if (!doc) return null;

      return EmailDomain.fromLegacyData(doc.toObject());
    } catch (error: any) {
      throw new Error(`Failed to find email domain: ${error.message}`);
    }
  }

  async findById(id: string): Promise<EmailDomain | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
      }

      const doc = await EmailDomainModel.findById(id);
      if (!doc) return null;

      return EmailDomain.fromLegacyData(doc.toObject());
    } catch (error: any) {
      throw new Error(`Failed to find email domain by ID: ${error.message}`);
    }
  }

  async findAll(): Promise<EmailDomain[]> {
    try {
      const docs = await EmailDomainModel.find().sort({ domain: 1 });
      return docs.map((doc) => EmailDomain.fromLegacyData(doc.toObject()));
    } catch (error: any) {
      throw new Error(`Failed to find all email domains: ${error.message}`);
    }
  }

  async update(
    id: string,
    emailDomain: EmailDomain
  ): Promise<EmailDomain | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
      }

      const doc = await EmailDomainModel.findByIdAndUpdate(
        id,
        { domain: emailDomain.domain },
        { new: true }
      );

      if (!doc) return null;

      return EmailDomain.fromLegacyData(doc.toObject());
    } catch (error: any) {
      throw new Error(`Failed to update email domain: ${error.message}`);
    }
  }

  async delete(domain: string): Promise<boolean> {
    try {
      const result = await EmailDomainModel.findOneAndDelete({
        domain: domain.toLowerCase().trim(),
      });
      return result !== null;
    } catch (error: any) {
      throw new Error(`Failed to delete email domain: ${error.message}`);
    }
  }

  // Existence checks
  async existsByDomain(domain: string): Promise<boolean> {
    try {
      const count = await EmailDomainModel.countDocuments({
        domain: domain.toLowerCase().trim(),
      });
      return count > 0;
    } catch (error: any) {
      throw new Error(`Failed to check domain existence: ${error.message}`);
    }
  }

  async existsById(id: string): Promise<boolean> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return false;
      }

      const count = await EmailDomainModel.countDocuments({ _id: id });
      return count > 0;
    } catch (error: any) {
      throw new Error(
        `Failed to check domain existence by ID: ${error.message}`
      );
    }
  }

  // Domain validation queries
  async isDomainAllowed(domain: string): Promise<boolean> {
    try {
      return await this.existsByDomain(domain);
    } catch (error: any) {
      return false;
    }
  }

  async isEmailDomainAllowed(email: string): Promise<boolean> {
    try {
      const domain = EmailDomain.extractDomainFromEmail(email);
      return await this.isDomainAllowed(domain);
    } catch (error: any) {
      return false;
    }
  }

  async findDomainsMatchingEmail(email: string): Promise<EmailDomain[]> {
    try {
      const domain = EmailDomain.extractDomainFromEmail(email);
      const emailDomain = await this.findByDomain(domain);
      return emailDomain ? [emailDomain] : [];
    } catch (error: any) {
      return [];
    }
  }

  // Search and filter operations
  async searchDomains(searchTerm: string): Promise<EmailDomain[]> {
    try {
      const regex = { $regex: searchTerm.toLowerCase(), $options: 'i' };
      const docs = await EmailDomainModel.find({ domain: regex }).sort({
        domain: 1,
      });
      return docs.map((doc) => EmailDomain.fromLegacyData(doc.toObject()));
    } catch (error: any) {
      throw new Error(`Failed to search domains: ${error.message}`);
    }
  }

  async findDomainsByTLD(tld: string): Promise<EmailDomain[]> {
    try {
      const regex = { $regex: `\\.${tld.toLowerCase()}$`, $options: 'i' };
      const docs = await EmailDomainModel.find({ domain: regex }).sort({
        domain: 1,
      });
      return docs.map((doc) => EmailDomain.fromLegacyData(doc.toObject()));
    } catch (error: any) {
      throw new Error(`Failed to find domains by TLD: ${error.message}`);
    }
  }

  async findEducationalDomains(): Promise<EmailDomain[]> {
    try {
      const educationalTLDs = ['edu', 'ac', 'edu.vn', 'ac.vn'];
      const regexPatterns = educationalTLDs.map((tld) => `\\.${tld}$`);
      const regex = { $regex: regexPatterns.join('|'), $options: 'i' };

      const docs = await EmailDomainModel.find({ domain: regex }).sort({
        domain: 1,
      });
      return docs.map((doc) => EmailDomain.fromLegacyData(doc.toObject()));
    } catch (error: any) {
      throw new Error(`Failed to find educational domains: ${error.message}`);
    }
  }

  async findGovernmentDomains(): Promise<EmailDomain[]> {
    try {
      const governmentTLDs = ['gov', 'gov.vn', 'mil'];
      const regexPatterns = governmentTLDs.map((tld) => `\\.${tld}$`);
      const regex = { $regex: regexPatterns.join('|'), $options: 'i' };

      const docs = await EmailDomainModel.find({ domain: regex }).sort({
        domain: 1,
      });
      return docs.map((doc) => EmailDomain.fromLegacyData(doc.toObject()));
    } catch (error: any) {
      throw new Error(`Failed to find government domains: ${error.message}`);
    }
  }

  async findDomainsByType(filters: {
    isEducational?: boolean;
    isGovernment?: boolean;
    tld?: string;
    baseDomain?: string;
  }): Promise<EmailDomain[]> {
    try {
      const query: any = {};
      const regexConditions: string[] = [];

      if (filters.tld) {
        regexConditions.push(`\\.${filters.tld.toLowerCase()}$`);
      }

      if (filters.isEducational) {
        const educationalTLDs = ['edu', 'ac', 'edu.vn', 'ac.vn'];
        regexConditions.push(...educationalTLDs.map((tld) => `\\.${tld}$`));
      }

      if (filters.isGovernment) {
        const governmentTLDs = ['gov', 'gov.vn', 'mil'];
        regexConditions.push(...governmentTLDs.map((tld) => `\\.${tld}$`));
      }

      if (filters.baseDomain) {
        regexConditions.push(`\\.${filters.baseDomain.toLowerCase()}$`);
        regexConditions.push(`^${filters.baseDomain.toLowerCase()}$`);
      }

      if (regexConditions.length > 0) {
        query.domain = { $regex: regexConditions.join('|'), $options: 'i' };
      }

      const docs = await EmailDomainModel.find(query).sort({ domain: 1 });
      return docs.map((doc) => EmailDomain.fromLegacyData(doc.toObject()));
    } catch (error: any) {
      throw new Error(`Failed to find domains by type: ${error.message}`);
    }
  }

  // Subdomain operations
  async findSubdomainsOf(parentDomain: string): Promise<EmailDomain[]> {
    try {
      const regex = {
        $regex: `\\.${parentDomain.toLowerCase()}$`,
        $options: 'i',
      };
      const docs = await EmailDomainModel.find({
        domain: {
          ...regex,
          $ne: parentDomain.toLowerCase(),
        },
      }).sort({ domain: 1 });

      return docs.map((doc) => EmailDomain.fromLegacyData(doc.toObject()));
    } catch (error: any) {
      throw new Error(`Failed to find subdomains: ${error.message}`);
    }
  }

  async findParentDomainsOf(subdomain: string): Promise<EmailDomain[]> {
    try {
      const domainParts = subdomain.toLowerCase().split('.');
      const parentDomains: string[] = [];

      // Generate possible parent domains
      for (let i = 1; i < domainParts.length; i++) {
        parentDomains.push(domainParts.slice(i).join('.'));
      }

      if (parentDomains.length === 0) return [];

      const docs = await EmailDomainModel.find({
        domain: { $in: parentDomains },
      }).sort({ domain: 1 });

      return docs.map((doc) => EmailDomain.fromLegacyData(doc.toObject()));
    } catch (error: any) {
      throw new Error(`Failed to find parent domains: ${error.message}`);
    }
  }

  async hasSubdomains(domain: string): Promise<boolean> {
    try {
      const count = await EmailDomainModel.countDocuments({
        domain: {
          $regex: `\\.${domain.toLowerCase()}$`,
          $options: 'i',
          $ne: domain.toLowerCase(),
        },
      });
      return count > 0;
    } catch (error: any) {
      throw new Error(`Failed to check subdomains: ${error.message}`);
    }
  }

  // Bulk operations
  async createMany(domains: string[]): Promise<EmailDomain[]> {
    try {
      const docs = domains.map((domain) => ({
        domain: domain.toLowerCase().trim(),
      }));
      const insertedDocs = await EmailDomainModel.insertMany(docs, {
        ordered: false,
      });
      return insertedDocs.map((doc) =>
        EmailDomain.fromLegacyData(doc.toObject())
      );
    } catch (error: any) {
      throw new Error(`Failed to create multiple domains: ${error.message}`);
    }
  }

  async deleteMany(domains: string[]): Promise<number> {
    try {
      const normalizedDomains = domains.map((d) => d.toLowerCase().trim());
      const result = await EmailDomainModel.deleteMany({
        domain: { $in: normalizedDomains },
      });
      return result.deletedCount || 0;
    } catch (error: any) {
      throw new Error(`Failed to delete multiple domains: ${error.message}`);
    }
  }

  async validateDomains(
    domains: string[]
  ): Promise<{ valid: string[]; invalid: string[] }> {
    const valid: string[] = [];
    const invalid: string[] = [];

    for (const domain of domains) {
      try {
        EmailDomain.create(domain);
        valid.push(domain);
      } catch {
        invalid.push(domain);
      }
    }

    return { valid, invalid };
  }

  // Analytics and statistics
  async getDomainCount(): Promise<number> {
    try {
      return await EmailDomainModel.countDocuments();
    } catch (error: any) {
      throw new Error(`Failed to get domain count: ${error.message}`);
    }
  }

  async getDomainCountByTLD(): Promise<{ tld: string; count: number }[]> {
    try {
      const pipeline = [
        {
          $addFields: {
            tld: {
              $arrayElemAt: [{ $split: ['$domain', '.'] }, -1],
            },
          },
        },
        {
          $group: {
            _id: '$tld',
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            tld: '$_id',
            count: 1,
            _id: 0,
          },
        },
        { $sort: { count: -1 as -1 } },
      ];

      const result = (await EmailDomainModel.aggregate(pipeline)) as {
        tld: string;
        count: number;
      }[];
      return result;
    } catch (error: any) {
      throw new Error(`Failed to get domain count by TLD: ${error.message}`);
    }
  }

  async getMostCommonTLDs(limit: number = 10): Promise<string[]> {
    try {
      const tldCounts = await this.getDomainCountByTLD();
      return tldCounts.slice(0, limit).map((item) => item.tld);
    } catch (error: any) {
      throw new Error(`Failed to get most common TLDs: ${error.message}`);
    }
  }

  async getDomainStatistics(): Promise<{
    total: number;
    educational: number;
    government: number;
    commercial: number;
    byTLD: { tld: string; count: number }[];
  }> {
    try {
      const [total, educational, government, byTLD] = await Promise.all([
        this.getDomainCount(),
        this.findEducationalDomains().then((domains) => domains.length),
        this.findGovernmentDomains().then((domains) => domains.length),
        this.getDomainCountByTLD(),
      ]);

      const commercial = total - educational - government;

      return {
        total,
        educational,
        government,
        commercial,
        byTLD,
      };
    } catch (error: any) {
      throw new Error(`Failed to get domain statistics: ${error.message}`);
    }
  }

  // Email validation utilities
  async getValidDomainsForEmails(emails: string[]): Promise<
    {
      email: string;
      domain: string;
      isAllowed: boolean;
    }[]
  > {
    try {
      const results: { email: string; domain: string; isAllowed: boolean }[] =
        [];

      for (const email of emails) {
        try {
          const domain = EmailDomain.extractDomainFromEmail(email);
          const isAllowed = await this.isDomainAllowed(domain);
          results.push({ email, domain, isAllowed });
        } catch {
          results.push({ email, domain: '', isAllowed: false });
        }
      }

      return results;
    } catch (error: any) {
      throw new Error(`Failed to validate email domains: ${error.message}`);
    }
  }

  // Maintenance operations
  async cleanupInvalidDomains(): Promise<number> {
    try {
      // This would require validation logic - for now return 0
      // In a real implementation, you'd validate each domain and remove invalid ones
      return 0;
    } catch (error: any) {
      throw new Error(`Failed to cleanup invalid domains: ${error.message}`);
    }
  }

  async findDuplicateDomains(): Promise<EmailDomain[]> {
    try {
      const pipeline = [
        {
          $group: {
            _id: '$domain',
            count: { $sum: 1 },
            docs: { $push: '$$ROOT' },
          },
        },
        {
          $match: {
            count: { $gt: 1 },
          },
        },
        {
          $unwind: '$docs',
        },
        {
          $replaceRoot: { newRoot: '$docs' },
        },
      ];

      const duplicateDocs = (await EmailDomainModel.aggregate(
        pipeline
      )) as any[];
      return duplicateDocs.map((doc) => EmailDomain.fromLegacyData(doc));
    } catch (error: any) {
      throw new Error(`Failed to find duplicate domains: ${error.message}`);
    }
  }
}
