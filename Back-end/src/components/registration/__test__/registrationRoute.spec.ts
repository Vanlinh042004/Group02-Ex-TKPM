import request from 'supertest';
import express from 'express';
import registerRouter from '../routes/registrationRoute';

// Tạo app express test
const app = express();
app.use(express.json());
app.use('/api/registers', registerRouter);

// Mock toàn bộ controller để test route mà không cần DB
jest.mock('../controllers/registrationController', () => ({
  registerCourse: (req, res) =>
    res.status(201).json({ success: true, data: req.body }),

  getAllRegistrations: (req, res) =>
    res.status(200).json({
      success: true,
      data: [
        {
          studentId: 'S001',
          courseId: 'CS101',
          status: 'registered',
        },
      ],
    }),

  getRegistrationById: (req, res) =>
    res.status(200).json({
      success: true,
      data: {
        id: req.params.id,
        studentId: 'S001',
        courseId: 'CS101',
        status: 'registered',
      },
    }),

  cancelRegistration: (req, res) =>
    res.status(200).json({
      success: true,
      data: {
        id: req.params.registrationId,
        status: 'cancelled',
      },
      message: 'Hủy đăng ký thành công',
    }),

  updateGrade: (req, res) =>
    res.status(200).json({
      success: true,
      data: {
        id: req.params.registrationId,
        grade: req.body.grade,
      },
      message: 'Cập nhật điểm thành công',
    }),

  getAllStudentsFromClass: (req, res) =>
    res.status(200).json({
      success: true,
      data: [
        { studentId: 'S001', name: 'John Doe' },
        { studentId: 'S002', name: 'Jane Smith' },
      ],
    }),

  generateTranscript: (req, res) =>
    res.status(200).json({
      success: true,
      data: {
        studentId: req.params.studentId,
        transcript: [
          { courseId: 'CS101', grade: 'A' },
          { courseId: 'CS102', grade: 'B+' },
        ],
      },
    }),
}));

describe('Register Route', () => {
  it('POST /api/registers - register a course', async () => {
    const res = await request(app)
      .post('/api/registers')
      .send({ studentId: 'S001', courseId: 'CS101' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.studentId).toBe('S001');
  });

  it('GET /api/registers - get all registrations', async () => {
    const res = await request(app).get('/api/registers');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('PATCH /api/registers/cancel/:registrationId - cancel registration', async () => {
    const res = await request(app).patch('/api/registers/cancel/REG001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('cancelled');
    expect(res.body.message).toBe('Hủy đăng ký thành công');
  });

  it('PATCH /api/registers/grade/:registrationId - update grade', async () => {
    const res = await request(app)
      .patch('/api/registers/grade/REG001')
      .send({ grade: 'A' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.grade).toBe('A');
    expect(res.body.message).toBe('Cập nhật điểm thành công');
  });

  it('GET /api/registers/:classId - get students in class', async () => {
    const res = await request(app).get('/api/registers/CLC001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data[0].studentId).toBeDefined();
  });

  it('GET /api/registers/transcript/:studentId - get transcript', async () => {
    const res = await request(app).get('/api/registers/transcript/S001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.studentId).toBe('S001');
    expect(Array.isArray(res.body.data.transcript)).toBe(true);
  });
});
