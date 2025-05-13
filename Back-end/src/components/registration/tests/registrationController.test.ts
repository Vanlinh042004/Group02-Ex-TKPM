import request from 'supertest';
import app from '../../../index'; // Adjust the path accordingly
import RegistrationService from '../../registration/services/registrationService';
import { afterEach, describe, expect, it, jest } from '@jest/globals';

// Mock the service methods with appropriate types
jest.mock('../../registration/services/registrationService');

describe('RegistrationController', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /register-course', () => {
    it('should register course successfully', async () => {
      // Mock the resolved value for the service method
      (RegistrationService.registerCourse as jest.Mock).mockResolvedValue({ id: '123' });

      const res = await request(app)
        .post('/register-course')
        .send({
          studentId: 'SV001',
          classId: 'CSC10001-11',
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Register successfully');
      expect(RegistrationService.registerCourse).toHaveBeenCalledWith('SV001', 'CSC10001-11');
    });

    it('should return error when registration fails', async () => {
      // Mock the rejected value for the service method
      (RegistrationService.registerCourse as jest.Mock).mockRejectedValue(new Error('Registration failed'));

      const res = await request(app)
        .post('/register-course')
        .send({
          studentId: 'SV002',
          classId: 'CSC10001-11',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Registration failed');
    });
  });

  describe('GET /registrations', () => {
    it('should fetch all registrations', async () => {
      // Mock the resolved value for the service method
      (RegistrationService.getAllRegistrations as jest.Mock).mockResolvedValue([{ id: 'reg1' }]);

      const res = await request(app).get('/registrations');

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Fetch all registrations successfully');
      expect(RegistrationService.getAllRegistrations).toHaveBeenCalled();
    });
  });

  describe('PATCH /cancel-registration/:registrationId', () => {
    it('should cancel registration successfully', async () => {
      // Mock the resolved value for the service method
      (RegistrationService.cancelRegistration as jest.Mock).mockResolvedValue({});

      const res = await request(app)
        .patch('/cancel-registration/abc123')
        .send({ reason: 'No longer needed' });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Cancel registration successfully');
      expect(RegistrationService.cancelRegistration).toHaveBeenCalledWith('abc123', 'No longer needed');
    });
  });

  describe('PATCH /update-grade/:registrationId', () => {
    it('should update grade successfully', async () => {
      // Mock the resolved value for the service method
      (RegistrationService.updateGrade as jest.Mock).mockResolvedValue({});

      const res = await request(app)
        .patch('/update-grade/abc123')
        .send({ grade: 90 });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Update grade successfully');
      expect(RegistrationService.updateGrade).toHaveBeenCalledWith('abc123', 90);
    });
  });

  describe('GET /students-in-class/:classId', () => {
    it('should fetch all students from class', async () => {
      // Mock the resolved value for the service method
      (RegistrationService.getAllStudentsFromClass as jest.Mock).mockResolvedValue([{ id: 'student1' }]);

      const res = await request(app).get('/students-in-class/CSC10001-11');

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Fetch all students in class successfully');
      expect(RegistrationService.getAllStudentsFromClass).toHaveBeenCalledWith('CSC10001-11');
    });
  });

  describe('GET /generate-transcript/:studentId', () => {
    it('should generate transcript successfully', async () => {
      // Mock the resolved value for the service method
      (RegistrationService.generateTranscript as jest.Mock).mockResolvedValue({ transcript: [] });

      const res = await request(app).get('/generate-transcript/SV001');

      expect(res.status).toBe(200);
      expect(res.body.transcript).toEqual([]);
      expect(RegistrationService.generateTranscript).toHaveBeenCalledWith('SV001');
    });

    it('should handle error when generating transcript', async () => {
      // Mock the rejected value for the service method
      (RegistrationService.generateTranscript as jest.Mock).mockRejectedValue(new Error('Failed to generate transcript'));

      const res = await request(app).get('/generate-transcript/SV002');

      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Failed to generate transcript');
    });
  });
});
