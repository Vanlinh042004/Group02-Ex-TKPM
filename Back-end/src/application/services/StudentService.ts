/**
 * StudentService Implementation
 *
 * NOTE: This implementation demonstrates the application service layer architecture
 * but currently faces type conflicts between the new domain entities and the existing
 * repository interfaces. This is a common situation during architectural refactoring.
 *
 * CURRENT LIMITATIONS:
 * 1. Domain entities (Student) use different structure than repository interfaces
 * 2. Some repository methods may not exist yet or have different signatures
 * 3. Value objects have different property names than DTOs
 *
 * SOLUTION APPROACH:
 * 1. This service shows the intended architecture and business logic patterns
 * 2. Mappers would be needed to convert between domain entities and repository models
 * 3. Repository interfaces should be updated to align with domain entities
 * 4. Alternative: Create adapter layer to bridge the gap
 *
 * This demonstrates Clean Architecture principles where:
 * - Business logic is in the service layer
 * - Domain entities encapsulate business rules
 * - Services orchestrate between domain and infrastructure
 * - DTOs provide clean interfaces for API layer
 */

import { IStudentService } from './interfaces/IStudentService';
import {
  Student,
  StudentProps,
  StudentStatus,
  Gender,
} from '../../domain/entities/Student';
import {
  IStudentRepository,
  StudentSearchCriteria,
} from '../../domain/repositories/IStudentRepository';
import {
  CreateStudentDto,
  UpdateStudentDto,
  StudentFilterDto,
} from '../dtos/StudentDto';
import { AddressProps } from '../../domain/value-objects/Address';
import {
  IdentityDocumentProps,
  IdentityDocumentType,
} from '../../domain/value-objects/IdentityDocument';
import {
  StudentNotFoundError,
  DuplicateStudentIdError,
  DuplicateEmailError,
  DuplicateIdentityDocumentError,
  InvalidStudentDataError,
  StudentInactiveError,
  ClassNotFoundError,
  InvalidTransferError,
  InvalidPromotionError,
} from '../exceptions/StudentExceptions';

export class StudentService implements IStudentService {
  constructor(private readonly studentRepository: IStudentRepository) {}

  async createStudent(studentData: CreateStudentDto): Promise<Student> {
    // Validate uniqueness
    await this.validateUniqueStudentId(studentData.studentId);
    await this.validateUniqueEmail(studentData.email);

    // Create address props
    const addressProps: AddressProps = {
      streetAddress: studentData.address.street,
      ward: studentData.address.ward,
      district: studentData.address.district,
      city: studentData.address.city,
      country: 'Vietnam', // Default for Vietnamese students
    };

    // Create identity document props
    const identityDocumentProps: IdentityDocumentProps = {
      type: this.mapIdentityDocumentType(studentData.identityDocument.type),
      number: studentData.identityDocument.number,
      issueDate: studentData.identityDocument.issuedDate,
      issuePlace: studentData.identityDocument.issuedPlace,
      expiryDate:
        studentData.identityDocument.expiryDate || new Date(2030, 0, 1), // Default expiry if not provided
    };

    // Map gender
    const gender = this.mapGender(studentData.gender);

    // Map status
    const status =
      studentData.isActive !== false
        ? StudentStatus.ACTIVE
        : StudentStatus.SUSPENDED;

    // Create student props
    const studentProps: StudentProps = {
      studentId: studentData.studentId,
      firstName: studentData.firstName,
      lastName: studentData.lastName,
      dateOfBirth: studentData.dateOfBirth,
      gender: gender,
      email: studentData.email,
      phoneNumber: studentData.phoneNumber,
      identityDocument: identityDocumentProps,
      address: addressProps,
      facultyId: 'default-faculty', // TODO: Get from DTO or set default
      programId: 'default-program', // TODO: Get from DTO or set default
      classId: studentData.classId,
      status: status,
      enrollmentDate: studentData.enrollmentDate,
      gpa: undefined, // New students don't have GPA yet
    };

    // Create student entity
    const student = Student.create(studentProps);

    // NOTE: Type mismatch here - would need mapper or updated repository interface
    // return await this.studentRepository.save(student);

    // For demonstration, we'll throw an error indicating this needs implementation
    throw new Error(
      'Student creation requires repository interface alignment with domain entities'
    );
  }

  async getStudentById(id: string): Promise<Student | null> {
    // NOTE: Repository returns different Student type than domain entity
    // Would need mapper to convert repository model to domain entity
    const repositoryStudent = await this.studentRepository.findById(id);
    if (!repositoryStudent) return null;

    // TODO: Implement mapper from repository model to domain entity
    throw new Error('Student retrieval requires mapper implementation');
  }

  async getStudentByStudentId(studentId: string): Promise<Student | null> {
    const repositoryStudent = await this.studentRepository.findByStudentId(
      studentId
    );
    if (!repositoryStudent) return null;

    // TODO: Implement mapper from repository model to domain entity
    throw new Error('Student retrieval requires mapper implementation');
  }

  async getAllStudents(filter?: StudentFilterDto): Promise<Student[]> {
    const criteria = this.buildSearchCriteria(filter);
    const result = await this.studentRepository.searchStudents(
      criteria,
      filter?.limit,
      filter?.page ? (filter.page - 1) * (filter.limit || 10) : undefined
    );

    // TODO: Map repository results to domain entities
    throw new Error('Student listing requires mapper implementation');
  }

  async getStudentsByClass(classId: string): Promise<Student[]> {
    const repositoryStudents = await this.studentRepository.findByClass(
      classId
    );

    // TODO: Map repository results to domain entities
    throw new Error('Student listing requires mapper implementation');
  }

  async searchStudents(searchTerm: string): Promise<Student[]> {
    // NOTE: Repository search method expects SearchOptions, not string
    // const result = await this.studentRepository.search(searchTerm);

    // TODO: Implement proper search with SearchOptions
    throw new Error(
      'Student search requires proper SearchOptions implementation'
    );
  }

  async updateStudent(
    id: string,
    updateData: UpdateStudentDto
  ): Promise<Student> {
    const existingStudent = await this.studentRepository.findById(id);
    if (!existingStudent) {
      throw new StudentNotFoundError(id);
    }

    // Validate unique constraints if being updated
    if (updateData.email && updateData.email !== existingStudent.email) {
      await this.validateUniqueEmail(updateData.email, id);
    }

    // TODO: Convert repository model to domain entity, update, and save back
    throw new Error('Student update requires mapper implementation');
  }

  async updateStudentStatus(id: string, isActive: boolean): Promise<Student> {
    const student = await this.studentRepository.findById(id);
    if (!student) {
      throw new StudentNotFoundError(id);
    }

    // TODO: Update status and save
    throw new Error('Student status update requires mapper implementation');
  }

  async deleteStudent(id: string): Promise<boolean> {
    const student = await this.studentRepository.findById(id);
    if (!student) {
      throw new StudentNotFoundError(id);
    }

    return await this.studentRepository.delete(id);
  }

  async softDeleteStudent(id: string): Promise<Student> {
    return await this.updateStudentStatus(id, false);
  }

  async enrollStudentInClass(
    studentId: string,
    classId: string
  ): Promise<Student> {
    const student = await this.studentRepository.findById(studentId);
    if (!student) {
      throw new StudentNotFoundError(studentId);
    }

    // TODO: Check student status and update class
    throw new Error('Student enrollment requires mapper implementation');
  }

  async transferStudent(
    studentId: string,
    fromClassId: string,
    toClassId: string
  ): Promise<Student> {
    const student = await this.studentRepository.findById(studentId);
    if (!student) {
      throw new StudentNotFoundError(studentId);
    }

    // TODO: Validate transfer and update class
    throw new Error('Student transfer requires mapper implementation');
  }

  async promoteStudent(studentId: string, newGrade: number): Promise<Student> {
    if (newGrade < 1 || newGrade > 12) {
      throw new InvalidPromotionError(`Grade must be between 1 and 12`);
    }

    // Note: Current domain model doesn't have grade field
    throw new InvalidPromotionError(
      `Grade promotion not implemented in current domain model`
    );
  }

  async validateStudentId(studentId: string): Promise<boolean> {
    const student = await this.studentRepository.findByStudentId(studentId);
    return student !== null;
  }

  async checkDuplicateEmail(
    email: string,
    excludeId?: string
  ): Promise<boolean> {
    const student = await this.studentRepository.findByEmail(email);
    if (!student) return false;
    return excludeId ? student.id !== excludeId : true;
  }

  async checkDuplicateIdentityDocument(
    documentType: string,
    documentNumber: string,
    excludeId?: string
  ): Promise<boolean> {
    // Note: This functionality would need to be added to the repository
    // For now, we'll return false as a placeholder
    return false;
  }

  // Private helper methods
  private async validateUniqueStudentId(studentId: string): Promise<void> {
    const existing = await this.studentRepository.findByStudentId(studentId);
    if (existing) {
      throw new DuplicateStudentIdError(studentId);
    }
  }

  private async validateUniqueEmail(
    email: string,
    excludeId?: string
  ): Promise<void> {
    const isDuplicate = await this.checkDuplicateEmail(email, excludeId);
    if (isDuplicate) {
      throw new DuplicateEmailError(email);
    }
  }

  private mapGender(gender: 'male' | 'female' | 'other'): Gender {
    switch (gender) {
      case 'male':
        return Gender.MALE;
      case 'female':
        return Gender.FEMALE;
      case 'other':
        return Gender.OTHER;
      default:
        throw new InvalidStudentDataError('gender', 'Invalid gender value');
    }
  }

  private mapIdentityDocumentType(
    type: 'cmnd' | 'cccd' | 'passport'
  ): IdentityDocumentType {
    switch (type) {
      case 'cmnd':
        return IdentityDocumentType.CMND;
      case 'cccd':
        return IdentityDocumentType.CCCD;
      case 'passport':
        return IdentityDocumentType.PASSPORT;
      default:
        throw new InvalidStudentDataError(
          'identityDocument.type',
          'Invalid document type'
        );
    }
  }

  private buildSearchCriteria(
    filter?: StudentFilterDto
  ): StudentSearchCriteria {
    if (!filter) return {};

    const criteria: StudentSearchCriteria = {};

    if (filter.search) {
      // The search field can be used to search across multiple fields
      // The repository's search method should handle this
    }

    return criteria;
  }
}
