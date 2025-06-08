/**
 * StudentComponentAdapter
 *
 * Adapter pattern để bridge giữa existing Student component và Clean Architecture
 * Chuyển đổi từ component-based interface sang application service interface
 */

import { IStudentService } from '../../application/services/interfaces/IStudentService';
import {
  CreateStudentDto,
  UpdateStudentDto,
  StudentFilterDto,
  StudentResponseDto,
} from '../../application/dtos/StudentDto';
import { Student } from '../../domain/entities/Student';
import {
  ICreateStudentDTO,
  IUpdateStudentDTO,
  IStudentSearchTermsDTO,
} from '../../components/student/services/studentService';

export class StudentComponentAdapter {
  constructor(private readonly studentService: IStudentService) {}

  /**
   * Adapter cho addStudent - Convert component DTO to application DTO
   */
  async addStudent(
    componentData: ICreateStudentDTO
  ): Promise<StudentResponseDto> {
    try {
      // Convert component DTO to application DTO
      const applicationData: CreateStudentDto = {
        studentId: componentData.studentId,
        firstName: this.extractFirstName(componentData.fullName),
        lastName: this.extractLastName(componentData.fullName),
        email: componentData.email,
        phoneNumber: componentData.phone,
        dateOfBirth: new Date(componentData.dateOfBirth),
        gender: this.mapGender(componentData.gender),
        address: {
          street: componentData.mailingAddress.streetAddress || '',
          ward: componentData.mailingAddress.ward || '',
          district: componentData.mailingAddress.district || '',
          city: componentData.mailingAddress.city || '',
          postalCode: '', // Not in component DTO
        },
        identityDocument: {
          type: this.mapIdentityDocumentType(
            componentData.identityDocument.type
          ),
          number: componentData.identityDocument.number,
          issuedDate: new Date(componentData.identityDocument.issueDate),
          issuedPlace: componentData.identityDocument.issuePlace,
          expiryDate: componentData.identityDocument.expiryDate
            ? new Date(componentData.identityDocument.expiryDate)
            : undefined,
        },
        grade: 1, // Default grade for new students
        enrollmentDate: new Date(),
        isActive: true,
      };

      // Call application service
      const student = await this.studentService.createStudent(applicationData);

      // Convert domain entity to response DTO
      return this.convertToResponseDto(student);
    } catch (error) {
      throw this.mapApplicationErrorToComponentError(error);
    }
  }

  /**
   * Adapter cho getAllStudent
   */
  async getAllStudents(): Promise<StudentResponseDto[]> {
    try {
      const students = await this.studentService.getAllStudents();
      return students.map((student) => this.convertToResponseDto(student));
    } catch (error) {
      throw this.mapApplicationErrorToComponentError(error);
    }
  }

  /**
   * Adapter cho searchStudent
   */
  async searchStudent(
    searchParams: IStudentSearchTermsDTO
  ): Promise<StudentResponseDto[]> {
    try {
      // Convert component search to application filter
      const filter: StudentFilterDto = {
        search: searchParams.studentId || searchParams.fullName || '',
        // Map other search parameters as needed
      };

      const students = await this.studentService.getAllStudents(filter);
      return students.map((student) => this.convertToResponseDto(student));
    } catch (error) {
      throw this.mapApplicationErrorToComponentError(error);
    }
  }

  /**
   * Adapter cho updateStudent
   */
  async updateStudent(
    studentId: string,
    updateData: IUpdateStudentDTO
  ): Promise<StudentResponseDto> {
    try {
      // Convert component update DTO to application update DTO
      const applicationUpdateData: UpdateStudentDto = {};

      if (updateData.fullName) {
        applicationUpdateData.firstName = this.extractFirstName(
          updateData.fullName
        );
        applicationUpdateData.lastName = this.extractLastName(
          updateData.fullName
        );
      }

      if (updateData.email) {
        applicationUpdateData.email = updateData.email;
      }

      if (updateData.phone) {
        applicationUpdateData.phoneNumber = updateData.phone;
      }

      if (updateData.gender) {
        applicationUpdateData.gender = this.mapGender(updateData.gender);
      }

      // Map other fields as needed...

      // Get student by studentId first
      const existingStudent = await this.studentService.getStudentByStudentId(
        studentId
      );
      if (!existingStudent) {
        throw new Error('Student not found');
      }

      const updatedStudent = await this.studentService.updateStudent(
        existingStudent.id!,
        applicationUpdateData
      );
      return this.convertToResponseDto(updatedStudent);
    } catch (error) {
      throw this.mapApplicationErrorToComponentError(error);
    }
  }

  /**
   * Adapter cho deleteStudent
   */
  async deleteStudent(studentId: string): Promise<void> {
    try {
      // Get student by studentId first
      const existingStudent = await this.studentService.getStudentByStudentId(
        studentId
      );
      if (!existingStudent) {
        throw new Error('Student not found');
      }

      await this.studentService.deleteStudent(existingStudent.id!);
    } catch (error) {
      throw this.mapApplicationErrorToComponentError(error);
    }
  }

  /**
   * Adapter cho getStudentById
   */
  async getStudentById(studentId: string): Promise<StudentResponseDto | null> {
    try {
      const student = await this.studentService.getStudentByStudentId(
        studentId
      );
      return student ? this.convertToResponseDto(student) : null;
    } catch (error) {
      throw this.mapApplicationErrorToComponentError(error);
    }
  }

  // Helper methods for conversion

  private extractFirstName(fullName: string): string {
    const parts = fullName.trim().split(' ');
    return parts.slice(0, -1).join(' ') || fullName;
  }

  private extractLastName(fullName: string): string {
    const parts = fullName.trim().split(' ');
    return parts[parts.length - 1] || '';
  }

  private mapGender(componentGender: string): 'male' | 'female' | 'other' {
    switch (componentGender.toLowerCase()) {
      case 'nam':
        return 'male';
      case 'nữ':
        return 'female';
      default:
        return 'other';
    }
  }

  private mapIdentityDocumentType(
    componentType: string
  ): 'cmnd' | 'cccd' | 'passport' {
    switch (componentType.toUpperCase()) {
      case 'CMND':
        return 'cmnd';
      case 'CCCD':
        return 'cccd';
      case 'HỘ CHIẾU':
      case 'PASSPORT':
        return 'passport';
      default:
        return 'cmnd'; // Default fallback
    }
  }

  private convertToResponseDto(student: Student): StudentResponseDto {
    return {
      id: student.id || '',
      studentId: student.studentId,
      firstName: student.firstName,
      lastName: student.lastName,
      fullName: student.fullName,
      email: student.email,
      phoneNumber: student.phoneNumber,
      dateOfBirth: student.dateOfBirth,
      age: student.age,
      gender: this.mapDomainGenderToResponse(student.gender),
      address: {
        street: student.address.streetAddress || '',
        ward: student.address.ward || '',
        district: student.address.district || '',
        city: student.address.city || '',
        postalCode: '', // Not available in domain
        fullAddress: student.address.fullAddress,
      },
      identityDocument: {
        type: student.identityDocument.type,
        number: student.identityDocument.number,
        issuedDate: student.identityDocument.issueDate,
        issuedPlace: student.identityDocument.issuePlace,
        expiryDate: student.identityDocument.expiryDate,
        maskedNumber: this.maskIdentityNumber(student.identityDocument.number),
      },
      grade: 1, // Default, would need to be added to domain
      enrollmentDate: student.enrollmentDate,
      isActive: student.isActive,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
    };
  }

  private mapDomainGenderToResponse(
    domainGender: any
  ): 'male' | 'female' | 'other' {
    // Map domain gender enum to response format
    const genderString = domainGender.toString();
    if (genderString.includes('MALE')) return 'male';
    if (genderString.includes('FEMALE')) return 'female';
    return 'other';
  }

  private maskIdentityNumber(number: string): string {
    if (number.length <= 4) return number;
    const masked = '*'.repeat(number.length - 4) + number.slice(-4);
    return masked;
  }

  private mapApplicationErrorToComponentError(error: any): Error {
    // Map application layer exceptions to component-compatible errors
    if (error.name === 'StudentNotFoundError') {
      return new Error('Student not found');
    }
    if (error.name === 'DuplicateEmailError') {
      return new Error('Email already exists');
    }
    if (error.name === 'DuplicateStudentIdError') {
      return new Error('StudentId already exists');
    }

    // Default mapping
    return new Error(error.message || 'An error occurred');
  }
}
