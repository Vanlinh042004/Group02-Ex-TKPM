import { Address } from '../../domain/value-objects/Address';
import { IdentityDocument } from '../../domain/value-objects/IdentityDocument';

export interface CreateStudentDto {
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  address: {
    street: string;
    ward: string;
    district: string;
    city: string;
    postalCode?: string;
  };
  identityDocument: {
    type: 'cmnd' | 'cccd' | 'passport';
    number: string;
    issuedDate: Date;
    issuedPlace: string;
    expiryDate?: Date;
  };
  classId?: string;
  grade: number;
  enrollmentDate: Date;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  medicalNotes?: string;
  emergencyContact?: string;
  isActive?: boolean;
}

export interface UpdateStudentDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  address?: {
    street?: string;
    ward?: string;
    district?: string;
    city?: string;
    postalCode?: string;
  };
  identityDocument?: {
    type?: 'cmnd' | 'cccd' | 'passport';
    number?: string;
    issuedDate?: Date;
    issuedPlace?: string;
    expiryDate?: Date;
  };
  classId?: string;
  grade?: number;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  medicalNotes?: string;
  emergencyContact?: string;
  isActive?: boolean;
}

export interface StudentFilterDto {
  grade?: number;
  classId?: string;
  gender?: 'male' | 'female' | 'other';
  isActive?: boolean;
  enrollmentDateFrom?: Date;
  enrollmentDateTo?: Date;
  ageMin?: number;
  ageMax?: number;
  search?: string; // For searching by name, email, or student ID
  sortBy?: 'firstName' | 'lastName' | 'studentId' | 'enrollmentDate' | 'grade';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface StudentResponseDto {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: Date;
  age: number;
  gender: 'male' | 'female' | 'other';
  address: {
    street: string;
    ward: string;
    district: string;
    city: string;
    postalCode?: string;
    fullAddress: string;
  };
  identityDocument: {
    type: string;
    number: string;
    issuedDate: Date;
    issuedPlace: string;
    expiryDate?: Date;
    maskedNumber: string;
  };
  classId?: string;
  grade: number;
  enrollmentDate: Date;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  medicalNotes?: string;
  emergencyContact?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
