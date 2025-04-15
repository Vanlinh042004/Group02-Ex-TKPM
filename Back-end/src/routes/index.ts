import { Express } from 'express';
import studentRouter from '../components/student/routes/studentRoute';
import facultyRouter from '../components/faculty/routes/facultyRoute';
import programRouter from '../components/program/routes/programRoute';
import statusRouter from '../components/status/routes/statusRoute';
import emailDomainRouter from '../components/email-domain/routes/emailDomainRoute';
import phoneNumberConfigRouter from '../components/phone-number/routes/phoneNumberConfigRoute';
import courseRouter from '../components/course/routes/courseRoute';
import classRouter from '../components/class/routes/classRoute';
import registrationRouter from '../components/registration/routes/registrationRoute';
/**
 * Cấu hình tất cả các routes cho ứng dụng
 * @param app Express application instance
 */
function route(app: Express): void {
  app.use('/api/students', studentRouter);
  app.use('/api/faculties', facultyRouter);
  app.use('/api/programs', programRouter);
  app.use('/api/statuses', statusRouter);
  app.use('/api/email-domains', emailDomainRouter);
  app.use('/api/phone-numbers', phoneNumberConfigRouter);
  app.use('/api/courses', courseRouter);
  app.use('/api/classes', classRouter);
  app.use('/api/registrations', registrationRouter);
}

export default route;
