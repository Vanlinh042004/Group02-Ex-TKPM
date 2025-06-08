export class StudentNotFoundError extends Error {
  constructor(identifier: string, identifierType: 'id' | 'studentId' = 'id') {
    super(`Student not found with ${identifierType}: ${identifier}`);
    this.name = 'StudentNotFoundError';
  }
}

export class DuplicateStudentIdError extends Error {
  constructor(studentId: string) {
    super(`Student ID already exists: ${studentId}`);
    this.name = 'DuplicateStudentIdError';
  }
}

export class DuplicateEmailError extends Error {
  constructor(email: string) {
    super(`Email already exists: ${email}`);
    this.name = 'DuplicateEmailError';
  }
}

export class DuplicateIdentityDocumentError extends Error {
  constructor(documentType: string, documentNumber: string) {
    super(`${documentType.toUpperCase()} already exists: ${documentNumber}`);
    this.name = 'DuplicateIdentityDocumentError';
  }
}

export class InvalidStudentDataError extends Error {
  constructor(field: string, reason: string) {
    super(`Invalid ${field}: ${reason}`);
    this.name = 'InvalidStudentDataError';
  }
}

export class StudentInactiveError extends Error {
  constructor(studentId: string) {
    super(`Student is inactive: ${studentId}`);
    this.name = 'StudentInactiveError';
  }
}

export class ClassNotFoundError extends Error {
  constructor(classId: string) {
    super(`Class not found: ${classId}`);
    this.name = 'ClassNotFoundError';
  }
}

export class ClassCapacityExceededError extends Error {
  constructor(classId: string) {
    super(`Class capacity exceeded: ${classId}`);
    this.name = 'ClassCapacityExceededError';
  }
}

export class InvalidTransferError extends Error {
  constructor(reason: string) {
    super(`Invalid transfer operation: ${reason}`);
    this.name = 'InvalidTransferError';
  }
}

export class InvalidPromotionError extends Error {
  constructor(reason: string) {
    super(`Invalid promotion operation: ${reason}`);
    this.name = 'InvalidPromotionError';
  }
}
