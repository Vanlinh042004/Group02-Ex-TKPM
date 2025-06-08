/**
 * StudentSimpleAdapter
 *
 * Adapter đơn giản để bridge với existing student service
 * Tạm thời delegate toàn bộ logic cho component service
 * Trong tương lai sẽ từ từ migrate sang Clean Architecture
 */

import {
  ICreateStudentDTO,
  IUpdateStudentDTO,
  IStudentSearchTermsDTO,
} from '../../components/student/services/studentService';
import studentService from '../../components/student/services/studentService';
import { StudentResponseDto } from '../../application/dtos/StudentDto';
import { IStudent } from '../../components/student/models/Student';

export class StudentSimpleAdapter {
  /**
   * Add student - delegate to existing service
   */
  async addStudent(
    componentData: ICreateStudentDTO
  ): Promise<StudentResponseDto> {
    try {
      const student = await studentService.addStudent(componentData);
      return this.convertToResponseDto(student);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all students - delegate to existing service
   */
  async getAllStudents(): Promise<StudentResponseDto[]> {
    try {
      const students = await studentService.getAllStudent();
      return students.map((student) => this.convertToResponseDto(student));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search students - delegate to existing service
   */
  async searchStudent(
    searchParams: IStudentSearchTermsDTO
  ): Promise<StudentResponseDto[]> {
    try {
      const students = await studentService.searchStudent(searchParams);
      return students.map((student) => this.convertToResponseDto(student));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update student - delegate to existing service
   */
  async updateStudent(
    studentId: string,
    updateData: IUpdateStudentDTO
  ): Promise<StudentResponseDto> {
    try {
      const student = await studentService.updateStudent(studentId, updateData);
      return this.convertToResponseDto(student);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete student - delegate to existing service
   */
  async deleteStudent(studentId: string): Promise<void> {
    try {
      await studentService.deleteStudent(studentId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get student by ID - delegate to existing service
   */
  async getStudentById(studentId: string): Promise<StudentResponseDto | null> {
    try {
      const student = await studentService.getStudentById(studentId);
      return student ? this.convertToResponseDto(student) : null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Convert component student model to response DTO
   */
  private convertToResponseDto(student: IStudent): StudentResponseDto {
    return {
      id: student._id?.toString() || '',
      studentId: student.studentId,
      firstName: this.extractFirstName(student.fullName),
      lastName: this.extractLastName(student.fullName),
      fullName: student.fullName,
      email: student.email,
      phoneNumber: student.phone,
      dateOfBirth: student.dateOfBirth,
      age: this.calculateAge(student.dateOfBirth),
      gender: this.mapGender(student.gender.toString()),
      address: {
        street: student.mailingAddress?.streetAddress || '',
        ward: student.mailingAddress?.ward || '',
        district: student.mailingAddress?.district || '',
        city: student.mailingAddress?.city || '',
        postalCode: '', // Not available in current model
        fullAddress: this.buildFullAddress(student.mailingAddress),
      },
      identityDocument: {
        type: student.identityDocument?.type || '',
        number: student.identityDocument?.number || '',
        issuedDate: student.identityDocument?.issueDate || new Date(),
        issuedPlace: student.identityDocument?.issuePlace || '',
        expiryDate: student.identityDocument?.expiryDate,
        maskedNumber: this.maskIdentityNumber(
          student.identityDocument?.number || ''
        ),
      },
      grade: parseInt(student.course) || 1,
      enrollmentDate: student.createdAt || new Date(),
      isActive: true, // Default, could be derived from status
      createdAt: student.createdAt || new Date(),
      updatedAt: student.updatedAt || new Date(),
    };
  }

  // Helper methods
  private extractFirstName(fullName: string): string {
    const parts = fullName.trim().split(' ');
    return parts.slice(0, -1).join(' ') || fullName;
  }

  private extractLastName(fullName: string): string {
    const parts = fullName.trim().split(' ');
    return parts[parts.length - 1] || '';
  }

  private calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
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

  private buildFullAddress(address: any): string {
    if (!address) return '';

    const parts = [
      address.streetAddress,
      address.ward,
      address.district,
      address.city,
      address.country,
    ].filter(Boolean);

    return parts.join(', ');
  }

  private maskIdentityNumber(number: string): string {
    if (!number || number.length <= 4) return number;
    const masked = '*'.repeat(number.length - 4) + number.slice(-4);
    return masked;
  }
}
