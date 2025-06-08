import { Document } from 'mongoose';
import {
  Student,
  StudentProps,
  StudentStatus,
  Gender,
} from '../../domain/entities/Student';
import { Address, AddressProps } from '../../domain/value-objects/Address';
import {
  IdentityDocument,
  IdentityDocumentProps,
  IdentityDocumentType,
} from '../../domain/value-objects/IdentityDocument';

/**
 * MongoDB Student Document Interface
 * Represents the structure of student data in MongoDB
 */
export interface IStudentDocument extends Document {
  studentId: string;
  fullName: string;
  dateOfBirth: Date;
  gender: string;
  nationality: string;
  faculty: string; // ObjectId as string
  course: string;
  program: string; // ObjectId as string
  email: string;
  phone: string;
  phoneNumberConfig: string; // ObjectId as string
  status: string; // ObjectId as string

  // Address as embedded document (matching existing schema)
  permanentAddress?: {
    streetAddress?: string;
    ward?: string;
    district?: string;
    city?: string;
    country: string;
  };
  temporaryAddress?: {
    streetAddress?: string;
    ward?: string;
    district?: string;
    city?: string;
    country: string;
  };
  mailingAddress: {
    streetAddress?: string;
    ward?: string;
    district?: string;
    city?: string;
    country: string;
  };

  // Identity document as embedded document (matching existing schema)
  identityDocument: {
    type: string;
    number: string;
    issueDate: Date;
    issuePlace: string;
    expiryDate: Date;
    hasChip?: boolean; // For CCCD
    issuingCountry?: string; // For Passport
    notes?: string; // For Passport
  };

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Student Data Mapper
 * Handles conversion between Student domain entity and MongoDB document
 */
export class StudentMapper {
  /**
   * Convert MongoDB document to Student domain entity
   */
  static toDomainEntity(doc: IStudentDocument): Student {
    // Split fullName into firstName and lastName
    const nameParts = doc.fullName.trim().split(' ');
    const firstName = nameParts.pop() || '';
    const lastName = nameParts.join(' ') || '';

    const props: StudentProps = {
      id: doc._id?.toString(),
      studentId: doc.studentId,
      firstName,
      lastName,
      dateOfBirth: doc.dateOfBirth,
      gender: doc.gender as Gender,
      email: doc.email,
      phoneNumber: doc.phone,
      identityDocument: {
        type: doc.identityDocument.type as IdentityDocumentType,
        number: doc.identityDocument.number,
        issueDate: doc.identityDocument.issueDate,
        issuePlace: doc.identityDocument.issuePlace,
        expiryDate: doc.identityDocument.expiryDate,
        ...(doc.identityDocument.hasChip !== undefined && {
          hasChip: doc.identityDocument.hasChip,
        }),
        ...(doc.identityDocument.issuingCountry && {
          issuingCountry: doc.identityDocument.issuingCountry,
        }),
        ...(doc.identityDocument.notes && {
          notes: doc.identityDocument.notes,
        }),
      } as IdentityDocumentProps,
      address: {
        streetAddress: doc.mailingAddress.streetAddress,
        ward: doc.mailingAddress.ward,
        district: doc.mailingAddress.district,
        city: doc.mailingAddress.city,
        country: doc.mailingAddress.country,
      } as AddressProps,
      facultyId: doc.faculty,
      programId: doc.program,
      status: this.mapDatabaseStatusToDomainStatus(doc.status),
      enrollmentDate: doc.createdAt, // Using createdAt as enrollment date
      gpa: undefined, // GPA is not in the existing schema
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };

    return new Student(props);
  }

  /**
   * Convert Student domain entity to MongoDB document data
   */
  static toDocumentData(student: Student): Partial<IStudentDocument> {
    const documentData: Partial<IStudentDocument> = {
      studentId: student.studentId,
      fullName: student.fullName,
      email: student.email,
      phone: student.phoneNumber,
      dateOfBirth: student.dateOfBirth,
      gender: student.gender,
      nationality: 'Vietnam', // Default value since it's not in domain entity
      faculty: student.facultyId,
      course: 'Unknown', // Default value since it's not in domain entity
      program: student.programId,
      phoneNumberConfig: 'default', // Default value
      status: 'active', // Default status
    };

    // Add mailing address (using the single address from domain entity)
    documentData.mailingAddress = {
      streetAddress: student.address.streetAddress,
      ward: student.address.ward,
      district: student.address.district,
      city: student.address.city,
      country: student.address.country,
    };

    // Add identity document
    const identityDoc = student.identityDocument;
    documentData.identityDocument = {
      type: identityDoc.type,
      number: identityDoc.number,
      issueDate: identityDoc.issueDate,
      issuePlace: identityDoc.issuePlace,
      expiryDate: identityDoc.expiryDate,
    };

    // Add type-specific fields
    if (identityDoc.type === IdentityDocumentType.CCCD) {
      documentData.identityDocument.hasChip =
        (identityDoc as any).hasChip || false;
    } else if (identityDoc.type === IdentityDocumentType.PASSPORT) {
      const passport = identityDoc as any;
      documentData.identityDocument.issuingCountry = passport.issuingCountry;
      documentData.identityDocument.notes = passport.notes;
    }

    // Add timestamps
    const now = new Date();
    documentData.updatedAt = now;
    if (!student.id) {
      documentData.createdAt = now;
    }

    return documentData;
  }

  /**
   * Convert array of MongoDB documents to array of Student domain entities
   */
  static toDomainEntities(docs: IStudentDocument[]): Student[] {
    return docs.map((doc) => this.toDomainEntity(doc));
  }

  /**
   * Convert array of Student domain entities to array of MongoDB document data
   */
  static toDocumentDataArray(students: Student[]): Partial<IStudentDocument>[] {
    return students.map((student) => this.toDocumentData(student));
  }

  /**
   * Extract search text for full-text search from Student entity
   */
  static extractSearchText(student: Student): string {
    const searchParts = [
      student.studentId,
      student.firstName,
      student.lastName,
      student.fullName,
      student.email,
      student.phoneNumber,
      student.facultyId,
    ];

    const address = student.address;
    if (address) {
      searchParts.push(
        address.streetAddress || '',
        address.ward || '',
        address.district || '',
        address.city || '',
        address.country
      );
    }

    return searchParts.filter(Boolean).join(' ').toLowerCase();
  }

  /**
   * Create a partial document for update operations
   * Only includes non-undefined fields
   */
  static toUpdateData(student: Student): Partial<IStudentDocument> {
    const updateData: Partial<IStudentDocument> = {};

    // Only include fields that are explicitly set
    if (student.fullName) {
      updateData.fullName = student.fullName;
    }

    if (student.email) {
      updateData.email = student.email;
    }

    if (student.phoneNumber) {
      updateData.phone = student.phoneNumber;
    }

    if (student.status) {
      updateData.status = this.mapDomainStatusToDatabaseStatus(student.status);
    }

    const address = student.address;
    if (address) {
      updateData.mailingAddress = {
        streetAddress: address.streetAddress,
        ward: address.ward,
        district: address.district,
        city: address.city,
        country: address.country,
      };
    }

    const identityDoc = student.identityDocument;
    if (identityDoc) {
      updateData.identityDocument = {
        type: identityDoc.type,
        number: identityDoc.number,
        issueDate: identityDoc.issueDate,
        issuePlace: identityDoc.issuePlace,
        expiryDate: identityDoc.expiryDate,
      };

      // Add type-specific fields
      if (identityDoc.type === IdentityDocumentType.CCCD) {
        updateData.identityDocument.hasChip =
          (identityDoc as any).hasChip || false;
      } else if (identityDoc.type === IdentityDocumentType.PASSPORT) {
        const passport = identityDoc as any;
        updateData.identityDocument.issuingCountry = passport.issuingCountry;
        updateData.identityDocument.notes = passport.notes;
      }
    }

    updateData.updatedAt = new Date();

    return updateData;
  }

  /**
   * Map domain status to database status
   */
  private static mapDomainStatusToDatabaseStatus(
    domainStatus: StudentStatus
  ): string {
    // This would need to map to actual ObjectId strings in a real implementation
    // For now, returning string representations
    switch (domainStatus) {
      case StudentStatus.ACTIVE:
        return 'active';
      case StudentStatus.GRADUATED:
        return 'graduated';
      case StudentStatus.DROPPED_OUT:
        return 'dropped_out';
      case StudentStatus.SUSPENDED:
        return 'suspended';
      case StudentStatus.ON_LEAVE:
        return 'on_leave';
      default:
        return 'active';
    }
  }

  /**
   * Map database status to domain status
   */
  private static mapDatabaseStatusToDomainStatus(
    databaseStatus: string
  ): StudentStatus {
    // This would need to map from actual ObjectId lookups in a real implementation
    // For now, using string representations
    switch (databaseStatus.toLowerCase()) {
      case 'active':
        return StudentStatus.ACTIVE;
      case 'graduated':
        return StudentStatus.GRADUATED;
      case 'dropped_out':
        return StudentStatus.DROPPED_OUT;
      case 'suspended':
        return StudentStatus.SUSPENDED;
      case 'on_leave':
        return StudentStatus.ON_LEAVE;
      default:
        return StudentStatus.ACTIVE;
    }
  }
}
