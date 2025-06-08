import { Express } from 'express';
import studentRouter from '../components/student/routes/studentRoute';
import facultyRouter from '../components/faculty/routes/facultyRoute';
import programRouter from '../components/program/routes/programRoute';
import statusRouter from '../components/status/routes/statusRoute';
import emailDomainRouter from '../components/email-domain/routes/emailDomainRoute';
import emailDomainBridgeRoutes from '../infrastructure/routes/emailDomainBridgeRoutes';
import phoneNumberConfigRouter from '../components/phone-number/routes/phoneNumberConfigRoute';
import phoneNumberConfigBridgeRoutes from '../infrastructure/routes/phoneNumberConfigBridgeRoutes';
import courseRouter from '../components/course/routes/courseRoute';
import classRouter from '../components/class/routes/classRoute';
import registrationRouter from '../components/registration/routes/registrationRoute';

// Clean Architecture routes
import facultyBridgeRouter from '../infrastructure/routes/facultyBridgeRoutes';
import programBridgeRouter from '../infrastructure/routes/programBridgeRoutes';
import statusBridgeRouter from '../infrastructure/routes/statusBridgeRoutes';
import courseBridgeRouter from '../infrastructure/routes/courseBridgeRoutes';
import classBridgeRouter from '../infrastructure/routes/classBridgeRoutes';
import registrationBridgeRouter from '../components/registration/routes/registrationBridgeRoutes';
import registrationV2Router from '../components/registration/routes/registrationV2Routes';
/**
 * Cấu hình tất cả các routes cho ứng dụng
 * @param app Express application instance
 */
function route(app: Express): void {
  app.use('/api/students', studentRouter);

  // Faculty routes - both old and new for comparison
  app.use('/api/faculties', facultyRouter); // Original component-based
  app.use('/api/v2/faculties', facultyBridgeRouter); // Clean Architecture

  // Program routes - both old and new for comparison
  app.use('/api/programs', programRouter); // Original component-based
  app.use('/api/v2/programs', programBridgeRouter); // Clean Architecture

  // Status routes - both old and new for comparison
  app.use('/api/statuses', statusRouter); // Original component-based
  app.use('/api/v2/statuses', statusBridgeRouter); // Clean Architecture

  // Course routes - both old and new for comparison
  app.use('/api/courses', courseRouter); // Original component-based
  app.use('/api/v2/courses', courseBridgeRouter); // Clean Architecture

  // Class routes - both old and new for comparison
  app.use('/api/classes', classRouter); // Original component-based
  app.use('/api/v2/classes', classBridgeRouter); // Clean Architecture

  // Registration routes - both old and new for comparison
  app.use('/api/registrations', registrationRouter); // Original component-based
  app.use('/api/v2/registrations', registrationBridgeRouter); // Clean Architecture (legacy format)
  app.use('/api/v2/registrations', registrationV2Router); // Clean Architecture (enhanced)

  app.use('/api/email-domains', emailDomainRouter); // Legacy API
  app.use('/api/v2/email-domains', emailDomainBridgeRoutes); // Clean Architecture API v2
  app.use('/api/phone-numbers', phoneNumberConfigRouter); // Legacy API
  app.use('/api/v2/phone-numbers', phoneNumberConfigBridgeRoutes); // Clean Architecture API v2
}

export default route;
