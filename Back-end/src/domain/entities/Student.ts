import { BaseEntity } from './base/BaseEntity';
import { Address, AddressProps } from '../value-objects/Address';
import {
  IdentityDocument,
  IdentityDocumentProps,
} from '../value-objects/IdentityDocument';

/**
 * Student Status Enum
 */
export enum StudentStatus {
  ACTIVE = 'Đang học',
  GRADUATED = 'Đã tốt nghiệp',
  DROPPED_OUT = 'Đã nghỉ học',
  SUSPENDED = 'Đình chỉ',
  ON_LEAVE = 'Tạm nghỉ',
}

/**
 * Gender Enum
 */
export enum Gender {
  MALE = 'Nam',
  FEMALE = 'Nữ',
  OTHER = 'Khác',
}

/**
 * Student Domain Entity Props
 */
export interface StudentProps {
  id?: string;
  studentId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: Gender;
  email: string;
  phoneNumber: string;
  identityDocument: IdentityDocumentProps;
  address: AddressProps;
  facultyId: string;
  programId: string;
  classId?: string;
  status: StudentStatus;
  enrollmentDate: Date;
  graduationDate?: Date;
  gpa?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Student Domain Entity
 * Rich domain model with business logic and validation
 */
export class Student extends BaseEntity {
  private readonly _studentId: string;
  private readonly _firstName: string;
  private readonly _lastName: string;
  private readonly _dateOfBirth: Date;
  private readonly _gender: Gender;
  private readonly _email: string;
  private readonly _phoneNumber: string;
  private readonly _identityDocument: IdentityDocument;
  private readonly _address: Address;
  private readonly _facultyId: string;
  private readonly _programId: string;
  private readonly _classId?: string;
  private readonly _status: StudentStatus;
  private readonly _enrollmentDate: Date;
  private readonly _graduationDate?: Date;
  private readonly _gpa?: number;

  constructor(props: StudentProps) {
    super(props.id, props.createdAt, props.updatedAt);

    this.validateProps(props);

    this._studentId = props.studentId.trim();
    this._firstName = props.firstName.trim();
    this._lastName = props.lastName.trim();
    this._dateOfBirth = props.dateOfBirth;
    this._gender = props.gender;
    this._email = props.email.trim().toLowerCase();
    this._phoneNumber = props.phoneNumber.trim();
    this._identityDocument = IdentityDocument.create(props.identityDocument);
    this._address = new Address(props.address);
    this._facultyId = props.facultyId.trim();
    this._programId = props.programId.trim();
    this._classId = props.classId?.trim();
    this._status = props.status;
    this._enrollmentDate = props.enrollmentDate;
    this._graduationDate = props.graduationDate;
    this._gpa = props.gpa;

    this.validate();
  }

  private validateProps(props: StudentProps): void {
    // Basic required field validation
    this.isRequired(props.studentId, 'Student ID');
    this.isRequired(props.firstName, 'First name');
    this.isRequired(props.lastName, 'Last name');
    this.isRequired(props.email, 'Email');
    this.isRequired(props.phoneNumber, 'Phone number');
    this.isRequired(props.facultyId, 'Faculty ID');
    this.isRequired(props.programId, 'Program ID');

    // Date validations
    this.isValidPastDate(props.dateOfBirth, 'Date of birth');

    if (
      !(props.enrollmentDate instanceof Date) ||
      isNaN(props.enrollmentDate.getTime())
    ) {
      throw this.createValidationError('Enrollment date must be a valid date');
    }

    if (
      props.graduationDate &&
      (!(props.graduationDate instanceof Date) ||
        isNaN(props.graduationDate.getTime()))
    ) {
      throw this.createValidationError('Graduation date must be a valid date');
    }

    // Email validation
    this.isValidEmail(props.email);

    // Enum validations
    this.isInAllowedValues(props.gender, Object.values(Gender), 'Gender');
    this.isInAllowedValues(
      props.status,
      Object.values(StudentStatus),
      'Status'
    );
  }

  protected validate(): void {
    // Business rule validations
    this.validateAge();
    this.validateStudentId();
    this.validatePhoneNumber();
    this.validateEnrollmentLogic();
    this.validateGPA();
    this.validateGraduation();
  }

  private validateAge(): void {
    const age = this.calculateAge();
    if (age < 16) {
      throw this.createValidationError('Student must be at least 16 years old');
    }
    if (age > 100) {
      throw this.createValidationError('Student age cannot exceed 100 years');
    }
  }

  private validateStudentId(): void {
    // Vietnamese student ID format: Usually starts with year followed by sequential numbers
    // Example: 21120001 (21 = year 2021, 12 = program code, 0001 = sequential)
    const studentIdPattern = /^\d{8}$/;
    if (!studentIdPattern.test(this._studentId)) {
      throw this.createValidationError('Student ID must be 8 digits');
    }
  }

  private validatePhoneNumber(): void {
    // Vietnamese phone number validation
    const phonePattern = /^(\+84|84|0)(3|5|7|8|9)[0-9]{8}$/;
    if (!phonePattern.test(this._phoneNumber.replace(/\s+/g, ''))) {
      throw this.createValidationError('Phone number format is invalid');
    }
  }

  private validateEnrollmentLogic(): void {
    if (this._enrollmentDate > new Date()) {
      throw this.createValidationError(
        'Enrollment date cannot be in the future'
      );
    }

    if (this._graduationDate && this._graduationDate <= this._enrollmentDate) {
      throw this.createValidationError(
        'Graduation date must be after enrollment date'
      );
    }

    // Business rule: Cannot graduate before minimum study period (typically 3.5 years)
    if (this._graduationDate) {
      const minGraduationDate = new Date(this._enrollmentDate);
      minGraduationDate.setFullYear(minGraduationDate.getFullYear() + 3);
      minGraduationDate.setMonth(minGraduationDate.getMonth() + 6); // 3.5 years

      if (this._graduationDate < minGraduationDate) {
        throw this.createValidationError(
          'Graduation date is too early (minimum 3.5 years study period required)'
        );
      }
    }
  }

  private validateGPA(): void {
    if (this._gpa !== undefined) {
      if (this._gpa < 0 || this._gpa > 4.0) {
        throw this.createValidationError('GPA must be between 0 and 4.0');
      }
    }
  }

  private validateGraduation(): void {
    if (this._status === StudentStatus.GRADUATED) {
      if (!this._graduationDate) {
        throw this.createValidationError(
          'Graduation date is required for graduated students'
        );
      }
      if (!this._gpa || this._gpa < 2.0) {
        throw this.createValidationError(
          'GPA of at least 2.0 is required for graduation'
        );
      }
    }

    if (this._graduationDate && this._status !== StudentStatus.GRADUATED) {
      throw this.createValidationError(
        'Students with graduation date must have GRADUATED status'
      );
    }
  }

  protected getEntityName(): string {
    return 'Student';
  }

  // Getters
  get studentId(): string {
    return this._studentId;
  }

  get firstName(): string {
    return this._firstName;
  }

  get lastName(): string {
    return this._lastName;
  }

  get fullName(): string {
    return `${this._lastName} ${this._firstName}`;
  }

  get dateOfBirth(): Date {
    return this._dateOfBirth;
  }

  get gender(): Gender {
    return this._gender;
  }

  get email(): string {
    return this._email;
  }

  get phoneNumber(): string {
    return this._phoneNumber;
  }

  get identityDocument(): IdentityDocument {
    return this._identityDocument;
  }

  get address(): Address {
    return this._address;
  }

  get facultyId(): string {
    return this._facultyId;
  }

  get programId(): string {
    return this._programId;
  }

  get classId(): string | undefined {
    return this._classId;
  }

  get status(): StudentStatus {
    return this._status;
  }

  get enrollmentDate(): Date {
    return this._enrollmentDate;
  }

  get graduationDate(): Date | undefined {
    return this._graduationDate;
  }

  get gpa(): number | undefined {
    return this._gpa;
  }

  // Computed properties
  get age(): number {
    return this.calculateAge();
  }

  get isActive(): boolean {
    return this._status === StudentStatus.ACTIVE;
  }

  get isGraduated(): boolean {
    return this._status === StudentStatus.GRADUATED;
  }

  get canEnroll(): boolean {
    return (
      this._status === StudentStatus.ACTIVE ||
      this._status === StudentStatus.ON_LEAVE
    );
  }

  get academicStanding(): string {
    if (!this._gpa) return 'Not Available';

    if (this._gpa >= 3.6) return 'Excellent';
    if (this._gpa >= 3.2) return 'Good';
    if (this._gpa >= 2.5) return 'Fair';
    if (this._gpa >= 2.0) return 'Poor';
    return 'Probation';
  }

  get yearsEnrolled(): number {
    const endDate = this._graduationDate || new Date();
    const yearsDiff =
      endDate.getFullYear() - this._enrollmentDate.getFullYear();
    const monthsDiff = endDate.getMonth() - this._enrollmentDate.getMonth();

    return yearsDiff + monthsDiff / 12;
  }

  // Business methods
  private calculateAge(): number {
    const today = new Date();
    let age = today.getFullYear() - this._dateOfBirth.getFullYear();
    const monthDiff = today.getMonth() - this._dateOfBirth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < this._dateOfBirth.getDate())
    ) {
      age--;
    }

    return age;
  }

  /**
   * Check if student can register for courses
   */
  canRegisterForCourses(): boolean {
    return this.canEnroll && this._identityDocument.isValid;
  }

  /**
   * Check if student is eligible for graduation
   */
  isEligibleForGraduation(): boolean {
    return (
      this.isActive &&
      this._gpa !== undefined &&
      this._gpa >= 2.0 &&
      this.yearsEnrolled >= 3.5
    );
  }

  /**
   * Get expected graduation year based on enrollment date
   */
  getExpectedGraduationYear(): number {
    return this._enrollmentDate.getFullYear() + 4; // Assuming 4-year program
  }

  /**
   * Create a new Student with updated properties
   */
  updateWith(updates: Partial<StudentProps>): Student {
    return new Student({
      id: this._id,
      studentId: updates.studentId ?? this._studentId,
      firstName: updates.firstName ?? this._firstName,
      lastName: updates.lastName ?? this._lastName,
      dateOfBirth: updates.dateOfBirth ?? this._dateOfBirth,
      gender: updates.gender ?? this._gender,
      email: updates.email ?? this._email,
      phoneNumber: updates.phoneNumber ?? this._phoneNumber,
      identityDocument:
        updates.identityDocument ?? this._identityDocument.toPlainObject(),
      address: updates.address ?? this._address.toPlainObject(),
      facultyId: updates.facultyId ?? this._facultyId,
      programId: updates.programId ?? this._programId,
      classId: updates.classId ?? this._classId,
      status: updates.status ?? this._status,
      enrollmentDate: updates.enrollmentDate ?? this._enrollmentDate,
      graduationDate: updates.graduationDate ?? this._graduationDate,
      gpa: updates.gpa ?? this._gpa,
      createdAt: this._createdAt,
      updatedAt: new Date(),
    });
  }

  /**
   * Convert to plain object for persistence/serialization
   */
  toPlainObject(): any {
    return {
      id: this._id,
      studentId: this._studentId,
      firstName: this._firstName,
      lastName: this._lastName,
      dateOfBirth: this._dateOfBirth,
      gender: this._gender,
      email: this._email,
      phoneNumber: this._phoneNumber,
      identityDocument: this._identityDocument.toPlainObject(),
      address: this._address.toPlainObject(),
      facultyId: this._facultyId,
      programId: this._programId,
      classId: this._classId,
      status: this._status,
      enrollmentDate: this._enrollmentDate,
      graduationDate: this._graduationDate,
      gpa: this._gpa,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  /**
   * Factory method to create Student from plain object
   */
  static fromPlainObject(data: any): Student {
    return new Student({
      id: data.id,
      studentId: data.studentId,
      firstName: data.firstName,
      lastName: data.lastName,
      dateOfBirth: new Date(data.dateOfBirth),
      gender: data.gender,
      email: data.email,
      phoneNumber: data.phoneNumber,
      identityDocument: data.identityDocument,
      address: data.address,
      facultyId: data.facultyId,
      programId: data.programId,
      classId: data.classId,
      status: data.status,
      enrollmentDate: new Date(data.enrollmentDate),
      graduationDate: data.graduationDate
        ? new Date(data.graduationDate)
        : undefined,
      gpa: data.gpa,
      createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
    });
  }

  /**
   * Create a new student (factory method with validation)
   */
  static create(
    props: Omit<StudentProps, 'id' | 'createdAt' | 'updatedAt'>
  ): Student {
    return new Student({
      ...props,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}
