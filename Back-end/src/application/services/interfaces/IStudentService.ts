import { Student } from '../../../domain/entities/Student';
import {
  CreateStudentDto,
  UpdateStudentDto,
  StudentFilterDto,
} from '../../dtos/StudentDto';

export interface IStudentService {
  // Create operations
  createStudent(studentData: CreateStudentDto): Promise<Student>;

  // Read operations
  getStudentById(id: string): Promise<Student | null>;
  getStudentByStudentId(studentId: string): Promise<Student | null>;
  getAllStudents(filter?: StudentFilterDto): Promise<Student[]>;
  getStudentsByClass(classId: string): Promise<Student[]>;
  searchStudents(searchTerm: string): Promise<Student[]>;

  // Update operations
  updateStudent(id: string, updateData: UpdateStudentDto): Promise<Student>;
  updateStudentStatus(id: string, isActive: boolean): Promise<Student>;

  // Delete operations
  deleteStudent(id: string): Promise<boolean>;
  softDeleteStudent(id: string): Promise<Student>;

  // Business operations
  enrollStudentInClass(studentId: string, classId: string): Promise<Student>;
  transferStudent(
    studentId: string,
    fromClassId: string,
    toClassId: string
  ): Promise<Student>;
  promoteStudent(studentId: string, newGrade: number): Promise<Student>;

  // Validation operations
  validateStudentId(studentId: string): Promise<boolean>;
  checkDuplicateEmail(email: string, excludeId?: string): Promise<boolean>;
  checkDuplicateIdentityDocument(
    documentType: string,
    documentNumber: string,
    excludeId?: string
  ): Promise<boolean>;
}
