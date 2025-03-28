import { Express } from 'express';
import studentRouter from '../components/student/routes/studentRoute';
import facultyRouter from '../components/faculty/routes/facultyRoute';
import programRouter from '../components/program/routes/programRoute';
import statusRouter from '../components/status/routes/statusRoute';
import emailDomainRouter from '../components/email-domain/routes/emailDomainRoute';
import phoneNumberConfigRouter from '../components/phone-number/routes/phoneNumberConfigRoute';
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
}

export default route;