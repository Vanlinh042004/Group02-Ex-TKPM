import { Express } from 'express';
import studentRouter from '../components/student/routes/studentRoute';
import facultyRouter from '../components/faculty/routes/facultyRoute';
/**
 * Cấu hình tất cả các routes cho ứng dụng
 * @param app Express application instance
 */
function route(app: Express): void {
  app.use('/api/student', studentRouter);
  app.use('/api/faculty', facultyRouter);
}

export default route;