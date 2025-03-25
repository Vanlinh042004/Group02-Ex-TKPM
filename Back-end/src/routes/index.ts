import { Express } from 'express';
import studentRouter from '../components/student/routes/studentRoute';
import facultyRouter from '../components/faculty/routes/facultyRoute';
import programRouter from '../components/program/routes/programRoute';
import statusRouter from '../components/status/routes/statusRoute';
/**
 * Cấu hình tất cả các routes cho ứng dụng
 * @param app Express application instance
 */
function route(app: Express): void {
  app.use('/api/students', studentRouter);
  app.use('/api/faculties', facultyRouter);
  app.use('/api/programs', programRouter);
  app.use('/api/statuses', statusRouter);
}

export default route;