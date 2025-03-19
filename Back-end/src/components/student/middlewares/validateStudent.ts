import { Request, Response, NextFunction } from 'express';
import { Faculty, StudentStatus } from '../models/Student';

/**
 * Middleware để xác thực dữ liệu sinh viên trước khi xử lý
 * @param req Request
 * @param res Response
 * @param next NextFunction
 */
function validateStudent(req: Request, res: Response, next: NextFunction): void {
  const { email, phone, faculty, status } = req.body;

  // Kiểm tra định dạng email
  if (email !== undefined) {
    const emailRegex =
      /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i;

    if (!email || !emailRegex.test(email)) {
      res.status(400).json({ message: 'Invalid email format' });
      return;
    }
  }

  // Kiểm tra định dạng số điện thoại
  if (phone !== undefined) {
    const phoneRegex = /^[0-9]{10,}$/;
    if (!phone || !phoneRegex.test(phone)) {
      res.status(400).json({ message: 'Invalid phone number format' });
      return;
    }
  }

  // Kiểm tra tên khoa
  if (faculty !== undefined) {
    const validFaculties = Object.values(Faculty);
    if (!faculty || !validFaculties.includes(faculty)) {
      res.status(400).json({ message: 'Invalid faculty' });
      return;
    }
  }

  // Kiểm tra status
  if (status !== undefined) {
    const validStatuses = Object.values(StudentStatus);
    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({ message: 'Invalid status' });
      return;
    }
  }

  next();
}

export default validateStudent;