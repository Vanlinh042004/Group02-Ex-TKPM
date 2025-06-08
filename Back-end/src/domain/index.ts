/**
 * Domain Layer Index
 * Exports all domain entities, value objects, and related types
 */

// Base classes
export { BaseEntity } from './entities/base/BaseEntity';

// Value Objects
export { Address, AddressProps } from './value-objects/Address';
export {
  IdentityDocument,
  IdentityDocumentProps,
  IdentityDocumentType,
  CMND,
  CCCD,
  CCCDProps,
  Passport,
  PassportProps,
} from './value-objects/IdentityDocument';

// Domain Entities
export {
  Student,
  StudentProps,
  StudentStatus,
  Gender,
} from './entities/Student';

export { Faculty, FacultyProps } from './entities/Faculty';

// Import classes for convenience object
import {
  Student,
  StudentProps,
  StudentStatus,
  Gender,
} from './entities/Student';
import { Faculty, FacultyProps } from './entities/Faculty';

// Note: Repository interfaces now include temporary entity definitions
// that match the existing database models until domain entities are fully implemented
import { Address, AddressProps } from './value-objects/Address';
import {
  IdentityDocument,
  IdentityDocumentProps,
  IdentityDocumentType,
  CMND,
  CCCD,
  Passport,
} from './value-objects/IdentityDocument';

// Re-export for convenience
export const Domain = {
  // Entities
  Student,
  Faculty,

  // Value Objects
  Address,
  IdentityDocument,
  CMND,
  CCCD,
  Passport,

  // Enums
  StudentStatus,
  Gender,
  IdentityDocumentType,

  // Factory methods
  createStudent: (
    props: Omit<StudentProps, 'id' | 'createdAt' | 'updatedAt'>
  ) => Student.create(props),
  createFaculty: (
    props: Omit<FacultyProps, 'id' | 'createdAt' | 'updatedAt'>
  ) => Faculty.create(props),
  createAddress: (props: AddressProps) => new Address(props),
  createIdentityDocument: (props: IdentityDocumentProps & any) =>
    IdentityDocument.create(props),
};
