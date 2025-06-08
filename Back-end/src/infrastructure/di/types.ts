/**
 * Service Tokens
 * Centralized definition of all service identifiers used in the DI container
 */
export const SERVICE_TOKENS = {
  // Repository tokens
  STUDENT_REPOSITORY: 'IStudentRepository',
  FACULTY_REPOSITORY: 'IFacultyRepository',
  PROGRAM_REPOSITORY: 'IProgramRepository',
  STATUS_REPOSITORY: 'IStatusRepository',
  COURSE_REPOSITORY: 'ICourseRepository',
  CLASS_REPOSITORY: 'IClassRepository',
  REGISTRATION_REPOSITORY: 'IRegistrationRepository',
  EMAIL_DOMAIN_REPOSITORY: 'IEmailDomainRepository',
  PHONE_NUMBER_CONFIG_REPOSITORY: 'IPhoneNumberConfigRepository',

  // Service tokens
  STUDENT_SERVICE: 'IStudentService',
  FACULTY_SERVICE: 'IFacultyService',
  PROGRAM_SERVICE: 'IProgramService',
  STATUS_SERVICE: 'IStatusService',
  COURSE_SERVICE: 'ICourseService',
  CLASS_SERVICE: 'IClassService',
  REGISTRATION_SERVICE: 'IRegistrationService',
  EMAIL_DOMAIN_SERVICE: 'IEmailDomainService',
  PHONE_NUMBER_CONFIG_SERVICE: 'IPhoneNumberConfigService',

  // Domain service tokens
  VALIDATION_SERVICE: 'IValidationService',
  BUSINESS_RULE_SERVICE: 'IBusinessRuleService',
  NOTIFICATION_SERVICE: 'INotificationService',

  // Controller tokens
  STUDENT_CONTROLLER: 'StudentController',
  FACULTY_CONTROLLER: 'FacultyController',
  PROGRAM_CONTROLLER: 'ProgramController',
  STATUS_CONTROLLER: 'StatusController',
  COURSE_CONTROLLER: 'CourseController',
  CLASS_CONTROLLER: 'ClassController',
  REGISTRATION_CONTROLLER: 'RegistrationController',
  EMAIL_DOMAIN_CONTROLLER: 'EmailDomainController',
  PHONE_NUMBER_CONFIG_CONTROLLER: 'PhoneNumberConfigController',

  // Infrastructure service tokens
  DATABASE_CONNECTION: 'IDatabaseConnection',
  LOGGER: 'ILogger',
  EMAIL_PROVIDER: 'IEmailProvider',
  FILE_STORAGE: 'IFileStorage',

  // Adapter tokens
  STUDENT_ADAPTER: 'StudentComponentAdapter',

  // Bridge Controller tokens
  FACULTY_BRIDGE_CONTROLLER: 'FacultyBridgeController',
  PROGRAM_BRIDGE_CONTROLLER: 'ProgramBridgeController',
  STATUS_BRIDGE_CONTROLLER: 'StatusBridgeController',
  COURSE_BRIDGE_CONTROLLER: 'CourseBridgeController',
  CLASS_BRIDGE_CONTROLLER: 'ClassBridgeController',
} as const;

/**
 * Type for service tokens to ensure type safety
 */
export type ServiceToken = (typeof SERVICE_TOKENS)[keyof typeof SERVICE_TOKENS];

/**
 * Base interface for all injectable services
 */
export interface Injectable {
  readonly serviceToken: ServiceToken;
}

/**
 * Interface for services that need initialization
 */
export interface Initializable {
  initialize(): Promise<void> | void;
}

/**
 * Interface for services that need cleanup
 */
export interface Disposable {
  dispose(): Promise<void> | void;
}

/**
 * Factory function type for creating services
 */
export type ServiceFactory<T = any> = () => T;

/**
 * Service configuration for registering with the container
 */
export interface ServiceConfiguration<T = any> {
  token: ServiceToken;
  factory?: ServiceFactory<T>;
  instance?: T;
  singleton?: boolean;
}

/**
 * Dependency metadata for services
 */
export interface DependencyMetadata {
  token: ServiceToken;
  required: boolean;
  description?: string;
}
