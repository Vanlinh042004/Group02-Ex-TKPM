/**
 * Service Registry
 * Central configuration cho dependency injection container
 */

import { Container } from './container';
import { SERVICE_TOKENS } from './types';

// Application Services
import { IStudentService } from '../../application/services/interfaces/IStudentService';
import { StudentService } from '../../application/services/StudentService';
import { FacultyService } from '../../application/services/FacultyService';

// Infrastructure Repositories
import { IStudentRepository } from '../../domain/repositories/IStudentRepository';
import { MongoStudentRepository } from '../repositories/MongoStudentRepository';
import { IFacultyRepository } from '../../application/repositories/IFacultyRepository';
import { MongoFacultyRepository } from '../repositories/MongoFacultyRepository';

// Adapters
import { StudentSimpleAdapter } from '../adapters/StudentSimpleAdapter';

// Controllers
import { FacultyBridgeController } from '../controllers/FacultyBridgeController';

// MongoDB Models
import Student from '../../components/student/models/Student';

// Program
import { IProgramRepository } from '../../application/repositories/IProgramRepository';
import { MongoProgramRepository } from '../repositories/MongoProgramRepository';
import { ProgramService } from '../../application/services/ProgramService';
import { ProgramBridgeController } from '../controllers/ProgramBridgeController';

// Status
import { IStatusRepository } from '../../application/repositories/IStatusRepository';
import { MongoStatusRepository } from '../repositories/MongoStatusRepository';
import { StatusService } from '../../application/services/StatusService';
import { StatusBridgeController } from '../controllers/StatusBridgeController';

// Course
import { ICourseRepository } from '../../application/repositories/ICourseRepository';
import { MongoCourseRepository } from '../repositories/MongoCourseRepository';
import { CourseService } from '../../application/services/CourseService';
import { CourseBridgeController } from '../controllers/CourseBridgeController';

// Class
import { IClassRepository } from '../../domain/repositories/IClassRepository';
import { MongoClassRepository } from '../repositories/MongoClassRepository';
import { ClassService } from '../../application/services/ClassService';
import { ClassBridgeController } from '../controllers/ClassBridgeController';

// Registration
import { IRegistrationRepository } from '../../domain/repositories/IRegistrationRepository';
import { MongoRegistrationRepository } from '../repositories/MongoRegistrationRepository';
import { RegistrationService } from '../../application/services/RegistrationService';
import { MongoEmailDomainRepository } from '../repositories/MongoEmailDomainRepository';
import { EmailDomainService } from '../../application/services/EmailDomainService';
import { RegistrationBridgeController } from '../../components/registration/controllers/RegistrationBridgeController';

// PhoneNumberConfig
import { IPhoneNumberConfigRepository } from '../../domain/repositories/IPhoneNumberConfigRepository';
import { MongoPhoneNumberConfigRepository } from '../repositories/MongoPhoneNumberConfigRepository';
import { PhoneNumberConfigService } from '../../application/services/PhoneNumberConfigService';

/**
 * ServiceRegistry class để configure tất cả dependencies
 */
export class ServiceRegistry {
  private static instance: ServiceRegistry;
  private container: Container;

  private constructor() {
    this.container = new Container();
  }

  public static getInstance(): ServiceRegistry {
    if (!ServiceRegistry.instance) {
      ServiceRegistry.instance = new ServiceRegistry();
    }
    return ServiceRegistry.instance;
  }

  /**
   * Register tất cả services trong container
   */
  public registerServices(): void {
    // 1. Register Infrastructure Layer (Repositories)
    this.registerRepositories();

    // 2. Register Application Layer (Services)
    this.registerApplicationServices();

    // 3. Register Adapters
    this.registerAdapters();

    console.log('✅ All services registered successfully');
  }

  /**
   * Get container instance
   */
  public getContainer(): Container {
    return this.container;
  }

  /**
   * Register repositories
   */
  private registerRepositories(): void {
    // Note: Student Repository will be added later when fully migrated

    // Faculty Repository - using Clean Architecture
    this.container.registerFactory<IFacultyRepository>(
      SERVICE_TOKENS.FACULTY_REPOSITORY,
      () => new MongoFacultyRepository()
    );

    // Program Repository - using Clean Architecture
    this.container.registerFactory<IProgramRepository>(
      SERVICE_TOKENS.PROGRAM_REPOSITORY,
      () => new MongoProgramRepository()
    );

    // Status Repository - using Clean Architecture
    this.container.registerFactory<IStatusRepository>(
      SERVICE_TOKENS.STATUS_REPOSITORY,
      () => new MongoStatusRepository()
    );

    // Course Repository - using Clean Architecture
    this.container.registerFactory<ICourseRepository>(
      SERVICE_TOKENS.COURSE_REPOSITORY,
      () => new MongoCourseRepository()
    );

    // Class Repository - using Clean Architecture
    this.container.registerFactory<IClassRepository>(
      SERVICE_TOKENS.CLASS_REPOSITORY,
      () => new MongoClassRepository()
    );

    // Registration Repository - using Clean Architecture
    this.container.registerFactory<IRegistrationRepository>(
      SERVICE_TOKENS.REGISTRATION_REPOSITORY,
      () => new MongoRegistrationRepository()
    );

    // EmailDomain Repository - using Clean Architecture
    this.container.registerFactory<MongoEmailDomainRepository>(
      'EmailDomainRepository',
      () => new MongoEmailDomainRepository()
    );

    // PhoneNumberConfig Repository - using Clean Architecture
    this.container.registerFactory<IPhoneNumberConfigRepository>(
      'PhoneNumberConfigRepository',
      () => new MongoPhoneNumberConfigRepository()
    );

    console.log('📦 Repositories registered');
  }

  /**
   * Register application services
   */
  private registerApplicationServices(): void {
    // Faculty Service - using Clean Architecture
    this.container.registerFactory<FacultyService>(
      SERVICE_TOKENS.FACULTY_SERVICE,
      () => {
        const facultyRepository = this.container.resolve<IFacultyRepository>(
          SERVICE_TOKENS.FACULTY_REPOSITORY
        );
        return new FacultyService(facultyRepository);
      }
    );

    // Program Service - using Clean Architecture
    this.container.registerFactory<ProgramService>(
      SERVICE_TOKENS.PROGRAM_SERVICE,
      () => {
        const programRepository = this.container.resolve<IProgramRepository>(
          SERVICE_TOKENS.PROGRAM_REPOSITORY
        );
        return new ProgramService(programRepository);
      }
    );

    // Status Service - using Clean Architecture
    this.container.registerFactory<StatusService>(
      SERVICE_TOKENS.STATUS_SERVICE,
      () => {
        const statusRepository = this.container.resolve<IStatusRepository>(
          SERVICE_TOKENS.STATUS_REPOSITORY
        );
        return new StatusService(statusRepository);
      }
    );

    // Course Service - using Clean Architecture
    this.container.registerFactory<CourseService>(
      SERVICE_TOKENS.COURSE_SERVICE,
      () => {
        const courseRepository = this.container.resolve<ICourseRepository>(
          SERVICE_TOKENS.COURSE_REPOSITORY
        );
        return new CourseService(courseRepository);
      }
    );

    // Class Service - using Clean Architecture
    this.container.registerFactory<ClassService>(
      SERVICE_TOKENS.CLASS_SERVICE,
      () => {
        const classRepository = this.container.resolve<IClassRepository>(
          SERVICE_TOKENS.CLASS_REPOSITORY
        );
        return new ClassService(classRepository);
      }
    );

    // Registration Service - simplified without student dependency
    this.container.registerFactory<RegistrationService>(
      SERVICE_TOKENS.REGISTRATION_SERVICE,
      () => {
        const registrationRepository =
          this.container.resolve<IRegistrationRepository>(
            SERVICE_TOKENS.REGISTRATION_REPOSITORY
          );
        const classRepository = this.container.resolve<IClassRepository>(
          SERVICE_TOKENS.CLASS_REPOSITORY
        );
        const courseRepository = this.container.resolve<ICourseRepository>(
          SERVICE_TOKENS.COURSE_REPOSITORY
        );
        return new RegistrationService(
          registrationRepository,
          null as any, // Student repository placeholder
          classRepository,
          courseRepository
        );
      }
    );

    // EmailDomain Service - using Clean Architecture
    this.container.registerFactory<EmailDomainService>(
      'EmailDomainService',
      () => {
        const emailDomainRepository =
          this.container.resolve<MongoEmailDomainRepository>(
            'EmailDomainRepository'
          );
        return new EmailDomainService(emailDomainRepository);
      }
    );

    // PhoneNumberConfig Service - using Clean Architecture
    this.container.registerFactory<PhoneNumberConfigService>(
      'PhoneNumberConfigService',
      () => {
        const phoneConfigRepository =
          this.container.resolve<IPhoneNumberConfigRepository>(
            'PhoneNumberConfigRepository'
          );
        return new PhoneNumberConfigService(phoneConfigRepository);
      }
    );

    console.log('🚀 Application services registered');
  }

  /**
   * Register adapters and controllers
   */
  private registerAdapters(): void {
    // Student Simple Adapter - delegates to existing component service
    this.container.registerFactory<StudentSimpleAdapter>(
      SERVICE_TOKENS.STUDENT_ADAPTER,
      () => new StudentSimpleAdapter()
    );

    // Faculty Bridge Controller - using Clean Architecture
    this.container.registerFactory<FacultyBridgeController>(
      SERVICE_TOKENS.FACULTY_BRIDGE_CONTROLLER,
      () => {
        const facultyService = this.container.resolve<FacultyService>(
          SERVICE_TOKENS.FACULTY_SERVICE
        );
        return new FacultyBridgeController(facultyService);
      }
    );

    // Program Bridge Controller - using Clean Architecture
    this.container.registerFactory<ProgramBridgeController>(
      SERVICE_TOKENS.PROGRAM_BRIDGE_CONTROLLER,
      () => {
        const programService = this.container.resolve<ProgramService>(
          SERVICE_TOKENS.PROGRAM_SERVICE
        );
        return new ProgramBridgeController(programService);
      }
    );

    // Status Bridge Controller - using Clean Architecture
    this.container.registerFactory<StatusBridgeController>(
      SERVICE_TOKENS.STATUS_BRIDGE_CONTROLLER,
      () => {
        const statusService = this.container.resolve<StatusService>(
          SERVICE_TOKENS.STATUS_SERVICE
        );
        return new StatusBridgeController(statusService);
      }
    );

    // Course Bridge Controller - using Clean Architecture
    this.container.registerFactory<CourseBridgeController>(
      SERVICE_TOKENS.COURSE_BRIDGE_CONTROLLER,
      () => {
        const courseService = this.container.resolve<CourseService>(
          SERVICE_TOKENS.COURSE_SERVICE
        );
        return new CourseBridgeController(courseService);
      }
    );

    // Class Bridge Controller - using Clean Architecture
    this.container.registerFactory<ClassBridgeController>(
      SERVICE_TOKENS.CLASS_BRIDGE_CONTROLLER,
      () => new ClassBridgeController()
    );

    console.log('🔌 Adapters and controllers registered');
  }

  /**
   * Initialize all services that need initialization
   */
  public async initializeServices(): Promise<void> {
    try {
      // Initialize any services that need async setup

      console.log('🎯 Services initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize services:', error);
      throw error;
    }
  }

  /**
   * Health check - verify all services are properly registered
   */
  public healthCheck(): boolean {
    const requiredServices = [
      SERVICE_TOKENS.STUDENT_ADAPTER,
      SERVICE_TOKENS.FACULTY_REPOSITORY,
      SERVICE_TOKENS.FACULTY_SERVICE,
      SERVICE_TOKENS.FACULTY_BRIDGE_CONTROLLER,
      SERVICE_TOKENS.PROGRAM_REPOSITORY,
      SERVICE_TOKENS.PROGRAM_SERVICE,
      SERVICE_TOKENS.PROGRAM_BRIDGE_CONTROLLER,
      SERVICE_TOKENS.STATUS_REPOSITORY,
      SERVICE_TOKENS.STATUS_SERVICE,
      SERVICE_TOKENS.STATUS_BRIDGE_CONTROLLER,
      SERVICE_TOKENS.COURSE_REPOSITORY,
      SERVICE_TOKENS.COURSE_SERVICE,
      SERVICE_TOKENS.COURSE_BRIDGE_CONTROLLER,
      SERVICE_TOKENS.CLASS_REPOSITORY,
      SERVICE_TOKENS.CLASS_SERVICE,
      SERVICE_TOKENS.CLASS_BRIDGE_CONTROLLER,
    ];

    for (const token of requiredServices) {
      if (!this.container.has(token)) {
        console.error(`❌ Missing service: ${token}`);
        return false;
      }
    }

    console.log('✅ Health check passed - all services available');
    return true;
  }

  /**
   * Get service by token (convenience method)
   */
  public getService<T>(token: string): T {
    return this.container.resolve<T>(token);
  }

  /**
   * Resolve service by token (alias for getService)
   */
  public resolve<T>(token: string): T {
    return this.container.resolve<T>(token);
  }

  /**
   * Clear all services (useful for testing)
   */
  public clear(): void {
    this.container.clear();
  }
}

/**
 * Global service registry instance
 */
export const serviceRegistry = ServiceRegistry.getInstance();

/**
 * Convenience function to setup all services
 */
export async function setupServices(): Promise<Container> {
  serviceRegistry.registerServices();
  await serviceRegistry.initializeServices();

  if (!serviceRegistry.healthCheck()) {
    throw new Error('Service registry health check failed');
  }

  return serviceRegistry.getContainer();
}

/**
 * Convenience functions for common services
 */
export function getStudentService(): IStudentService {
  return serviceRegistry.getService<IStudentService>(
    SERVICE_TOKENS.STUDENT_SERVICE
  );
}

export function getStudentAdapter(): StudentSimpleAdapter {
  return serviceRegistry.getService<StudentSimpleAdapter>(
    SERVICE_TOKENS.STUDENT_ADAPTER
  );
}

export function getStudentRepository(): IStudentRepository {
  return serviceRegistry.getService<IStudentRepository>(
    SERVICE_TOKENS.STUDENT_REPOSITORY
  );
}

/**
 * Faculty convenience functions
 */
export function getFacultyService(): FacultyService {
  return serviceRegistry.getService<FacultyService>(
    SERVICE_TOKENS.FACULTY_SERVICE
  );
}

export function getFacultyController(): FacultyBridgeController {
  return serviceRegistry.getService<FacultyBridgeController>(
    SERVICE_TOKENS.FACULTY_BRIDGE_CONTROLLER
  );
}

export function getFacultyRepository(): IFacultyRepository {
  return serviceRegistry.getService<IFacultyRepository>(
    SERVICE_TOKENS.FACULTY_REPOSITORY
  );
}

/**
 * Program convenience functions
 */
export function getProgramService(): ProgramService {
  return serviceRegistry.getService<ProgramService>(
    SERVICE_TOKENS.PROGRAM_SERVICE
  );
}

export function getProgramController(): ProgramBridgeController {
  return serviceRegistry.getService<ProgramBridgeController>(
    SERVICE_TOKENS.PROGRAM_BRIDGE_CONTROLLER
  );
}

export function getProgramRepository(): IProgramRepository {
  return serviceRegistry.getService<IProgramRepository>(
    SERVICE_TOKENS.PROGRAM_REPOSITORY
  );
}

/**
 * Status convenience functions
 */
export function getStatusService(): StatusService {
  return serviceRegistry.getService<StatusService>(
    SERVICE_TOKENS.STATUS_SERVICE
  );
}

export function getStatusController(): StatusBridgeController {
  return serviceRegistry.getService<StatusBridgeController>(
    SERVICE_TOKENS.STATUS_BRIDGE_CONTROLLER
  );
}

export function getStatusRepository(): IStatusRepository {
  return serviceRegistry.getService<IStatusRepository>(
    SERVICE_TOKENS.STATUS_REPOSITORY
  );
}

/**
 * Course convenience functions
 */
export function getCourseService(): CourseService {
  return serviceRegistry.getService<CourseService>(
    SERVICE_TOKENS.COURSE_SERVICE
  );
}

export function getCourseController(): CourseBridgeController {
  return serviceRegistry.getService<CourseBridgeController>(
    SERVICE_TOKENS.COURSE_BRIDGE_CONTROLLER
  );
}

export function getCourseRepository(): ICourseRepository {
  return serviceRegistry.getService<ICourseRepository>(
    SERVICE_TOKENS.COURSE_REPOSITORY
  );
}

/**
 * Class convenience functions
 */
export function getClassService(): ClassService {
  return serviceRegistry.getService<ClassService>(SERVICE_TOKENS.CLASS_SERVICE);
}

export function getClassController(): ClassBridgeController {
  return serviceRegistry.getService<ClassBridgeController>(
    SERVICE_TOKENS.CLASS_BRIDGE_CONTROLLER
  );
}

export function getClassRepository(): IClassRepository {
  return serviceRegistry.getService<IClassRepository>(
    SERVICE_TOKENS.CLASS_REPOSITORY
  );
}

// Registration convenience getters
export function getRegistrationService(): RegistrationService {
  return serviceRegistry.getService<RegistrationService>(
    SERVICE_TOKENS.REGISTRATION_SERVICE
  );
}

export function getRegistrationController(): RegistrationBridgeController {
  return serviceRegistry.getService<RegistrationBridgeController>(
    SERVICE_TOKENS.REGISTRATION_CONTROLLER
  );
}

export function getRegistrationRepository(): IRegistrationRepository {
  return serviceRegistry.getService<IRegistrationRepository>(
    SERVICE_TOKENS.REGISTRATION_REPOSITORY
  );
}
