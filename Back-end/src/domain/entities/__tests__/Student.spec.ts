import { Student, StudentStatus, Gender } from '../Student';
import { IdentityDocumentType } from '../../value-objects/IdentityDocument';

describe('Student Domain Entity', () => {
  const validStudentProps = {
    studentId: '21120001',
    firstName: 'Minh',
    lastName: 'Nguyen Van',
    dateOfBirth: new Date('2003-01-15'),
    gender: Gender.MALE,
    email: 'minh.nguyen@student.hcmus.edu.vn',
    phoneNumber: '0901234567',
    identityDocument: {
      type: IdentityDocumentType.CCCD,
      number: '123456789012',
      issueDate: new Date('2021-01-01'),
      issuePlace: 'TP.HCM',
      expiryDate: new Date('2031-01-01'),
      hasChip: true,
    },
    address: {
      streetAddress: '227 Nguyen Van Cu',
      ward: 'Ward 4',
      district: 'District 5',
      city: 'Ho Chi Minh City',
      country: 'Vietnam',
    },
    facultyId: 'FIT',
    programId: 'CS',
    status: StudentStatus.ACTIVE,
    enrollmentDate: new Date('2021-09-01'),
    gpa: 3.5,
  };

  describe('Construction and Validation', () => {
    it('should create a valid student', () => {
      const student = Student.create(validStudentProps);

      expect(student.studentId).toBe('21120001');
      expect(student.fullName).toBe('Nguyen Van Minh');
      expect(student.email).toBe('minh.nguyen@student.hcmus.edu.vn');
      expect(student.isActive).toBe(true);
    });

    it('should throw error for invalid student ID format', () => {
      const invalidProps = { ...validStudentProps, studentId: '123' };

      expect(() => Student.create(invalidProps)).toThrow(
        'Student validation error: Student ID must be 8 digits'
      );
    });

    it('should throw error for underage student', () => {
      const invalidProps = {
        ...validStudentProps,
        dateOfBirth: new Date(), // Today
      };

      expect(() => Student.create(invalidProps)).toThrow(
        'Student validation error: Student must be at least 16 years old'
      );
    });

    it('should throw error for invalid email format', () => {
      const invalidProps = { ...validStudentProps, email: 'invalid-email' };

      expect(() => Student.create(invalidProps)).toThrow(
        'Student validation error: Email format is invalid'
      );
    });

    it('should throw error for invalid phone number', () => {
      const invalidProps = { ...validStudentProps, phoneNumber: '123' };

      expect(() => Student.create(invalidProps)).toThrow(
        'Student validation error: Phone number format is invalid'
      );
    });

    it('should throw error for invalid GPA', () => {
      const invalidProps = { ...validStudentProps, gpa: 5.0 };

      expect(() => Student.create(invalidProps)).toThrow(
        'Student validation error: GPA must be between 0 and 4.0'
      );
    });
  });

  describe('Business Rules', () => {
    it('should calculate age correctly', () => {
      const student = Student.create(validStudentProps);
      const expectedAge = new Date().getFullYear() - 2003;

      expect(student.age).toBeGreaterThanOrEqual(expectedAge - 1);
      expect(student.age).toBeLessThanOrEqual(expectedAge);
    });

    it('should determine academic standing correctly', () => {
      const excellentStudent = Student.create({
        ...validStudentProps,
        gpa: 3.8,
      });
      expect(excellentStudent.academicStanding).toBe('Excellent');

      const goodStudent = Student.create({ ...validStudentProps, gpa: 3.4 });
      expect(goodStudent.academicStanding).toBe('Good');

      const fairStudent = Student.create({ ...validStudentProps, gpa: 2.8 });
      expect(fairStudent.academicStanding).toBe('Fair');

      const poorStudent = Student.create({ ...validStudentProps, gpa: 2.2 });
      expect(poorStudent.academicStanding).toBe('Poor');

      const probationStudent = Student.create({
        ...validStudentProps,
        gpa: 1.5,
      });
      expect(probationStudent.academicStanding).toBe('Probation');
    });

    it('should check enrollment eligibility correctly', () => {
      const activeStudent = Student.create({
        ...validStudentProps,
        status: StudentStatus.ACTIVE,
      });
      expect(activeStudent.canRegisterForCourses()).toBe(true);

      const graduatedStudent = Student.create({
        ...validStudentProps,
        status: StudentStatus.GRADUATED,
        graduationDate: new Date('2025-06-01'),
        gpa: 3.0,
      });
      expect(graduatedStudent.canRegisterForCourses()).toBe(false);

      const suspendedStudent = Student.create({
        ...validStudentProps,
        status: StudentStatus.SUSPENDED,
      });
      expect(suspendedStudent.canRegisterForCourses()).toBe(false);
    });

    it('should check graduation eligibility correctly', () => {
      const eligibleStudent = Student.create({
        ...validStudentProps,
        enrollmentDate: new Date('2020-09-01'), // 4+ years ago
        gpa: 2.5,
      });
      expect(eligibleStudent.isEligibleForGraduation()).toBe(true);

      const ineligibleGpaStudent = Student.create({
        ...validStudentProps,
        enrollmentDate: new Date('2020-09-01'),
        gpa: 1.8, // Below minimum
      });
      expect(ineligibleGpaStudent.isEligibleForGraduation()).toBe(false);

      const ineligibleTimeStudent = Student.create({
        ...validStudentProps,
        enrollmentDate: new Date('2022-09-01'), // Too recent
        gpa: 3.0,
      });
      expect(ineligibleTimeStudent.isEligibleForGraduation()).toBe(false);
    });

    it('should validate graduation rules', () => {
      // Graduated student must have graduation date and minimum GPA
      expect(() =>
        Student.create({
          ...validStudentProps,
          status: StudentStatus.GRADUATED,
          // Missing graduation date
        })
      ).toThrow(
        'Student validation error: Graduation date is required for graduated students'
      );

      expect(() =>
        Student.create({
          ...validStudentProps,
          status: StudentStatus.GRADUATED,
          graduationDate: new Date('2025-06-01'),
          gpa: 1.5, // Below minimum
        })
      ).toThrow(
        'Student validation error: GPA of at least 2.0 is required for graduation'
      );

      // Student with graduation date must have GRADUATED status
      expect(() =>
        Student.create({
          ...validStudentProps,
          status: StudentStatus.ACTIVE,
          graduationDate: new Date('2025-06-01'),
        })
      ).toThrow(
        'Student validation error: Students with graduation date must have GRADUATED status'
      );
    });

    it('should validate minimum study period for graduation', () => {
      const recentEnrollment = new Date();
      recentEnrollment.setFullYear(recentEnrollment.getFullYear() - 1); // 1 year ago

      const earlyGraduation = new Date();
      earlyGraduation.setMonth(earlyGraduation.getMonth() + 1); // 1 month from now

      expect(() =>
        Student.create({
          ...validStudentProps,
          enrollmentDate: recentEnrollment,
          graduationDate: earlyGraduation,
          status: StudentStatus.GRADUATED,
          gpa: 3.0,
        })
      ).toThrow(
        'Student validation error: Graduation date is too early (minimum 3.5 years study period required)'
      );
    });
  });

  describe('Value Object Integration', () => {
    it('should properly integrate with Address value object', () => {
      const student = Student.create(validStudentProps);

      expect(student.address.fullAddress).toContain('Vietnam');
      expect(student.address.isComplete).toBe(true);
    });

    it('should properly integrate with IdentityDocument value object', () => {
      const student = Student.create(validStudentProps);

      expect(student.identityDocument.type).toBe(IdentityDocumentType.CCCD);
      expect(student.identityDocument.isValid).toBe(true);
      expect(student.identityDocument.getFormattedString()).toContain('CCCD');
    });
  });

  describe('Immutability and Updates', () => {
    it('should create new instance when updating', () => {
      const originalStudent = Student.create(validStudentProps);
      const updatedStudent = originalStudent.updateWith({
        firstName: 'Updated Name',
      });

      expect(originalStudent.firstName).toBe('Minh');
      expect(updatedStudent.firstName).toBe('Updated Name');
      expect(originalStudent).not.toBe(updatedStudent);
    });

    it('should preserve unchanged fields when updating', () => {
      const originalStudent = Student.create(validStudentProps);
      const updatedStudent = originalStudent.updateWith({
        firstName: 'Updated Name',
      });

      expect(updatedStudent.lastName).toBe(originalStudent.lastName);
      expect(updatedStudent.studentId).toBe(originalStudent.studentId);
      expect(updatedStudent.email).toBe(originalStudent.email);
    });
  });

  describe('Serialization', () => {
    it('should convert to plain object correctly', () => {
      const student = Student.create(validStudentProps);
      const plainObject = student.toPlainObject();

      expect(plainObject.studentId).toBe('21120001');
      expect(plainObject.firstName).toBe('Minh');
      expect(plainObject.identityDocument).toBeDefined();
      expect(plainObject.address).toBeDefined();
    });

    it('should recreate student from plain object', () => {
      const originalStudent = Student.create(validStudentProps);
      const plainObject = originalStudent.toPlainObject();
      const recreatedStudent = Student.fromPlainObject(plainObject);

      expect(recreatedStudent.studentId).toBe(originalStudent.studentId);
      expect(recreatedStudent.fullName).toBe(originalStudent.fullName);
      expect(recreatedStudent.email).toBe(originalStudent.email);
    });
  });

  describe('Computed Properties', () => {
    it('should calculate years enrolled correctly', () => {
      const enrollmentDate = new Date();
      enrollmentDate.setFullYear(enrollmentDate.getFullYear() - 2); // 2 years ago

      const student = Student.create({
        ...validStudentProps,
        enrollmentDate,
      });

      expect(student.yearsEnrolled).toBeCloseTo(2, 0);
    });

    it('should calculate expected graduation year correctly', () => {
      const student = Student.create({
        ...validStudentProps,
        enrollmentDate: new Date('2021-09-01'),
      });

      expect(student.getExpectedGraduationYear()).toBe(2025);
    });
  });
});
