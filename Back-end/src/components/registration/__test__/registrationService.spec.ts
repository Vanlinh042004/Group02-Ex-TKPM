import mongoose from 'mongoose';
import registrationService from '../services/registrationService';
import Registration from '../models/Registration';
import Student from '../../student/models/Student';
import Class from '../../class/models/Class';
import Course from '../../course/models/Course';

jest.mock('../models/Registration');
jest.mock('../../student/models/Student');
jest.mock('../../class/models/Class');
jest.mock('../../course/models/Course');

describe('RegistrationService - registerCourse', () => {
  const mockSession = {
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    abortTransaction: jest.fn(),
    endSession: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(mongoose, 'startSession').mockResolvedValue(mockSession as any);
  });

  it('should throw error if student does not exist', async () => {
    (Student.findOne as jest.Mock).mockReturnValue({
      session: () => ({
        exec: () => Promise.resolve(null),
      }),
    });

    await expect(
      registrationService.registerCourse('student123', 'class123')
    ).rejects.toThrow('Sinh viên không tồn tại');

    expect(mockSession.abortTransaction).toHaveBeenCalled();
    expect(mockSession.endSession).toHaveBeenCalled();
  });

  it('should throw error if class does not exist', async () => {
    (Student.findOne as jest.Mock).mockReturnValue({
      session: () => ({
        exec: () => Promise.resolve({ _id: 'studentId' }),
      }),
    });

    const mockPopulate = jest.fn().mockReturnValue({
      session: () => ({
        exec: () => Promise.resolve(null),
      }),
    });

    (Class.findOne as jest.Mock).mockReturnValue({
      populate: mockPopulate,
    });

    await expect(
      registrationService.registerCourse('student123', 'class123')
    ).rejects.toThrow('Lớp học không tồn tại');

    expect(mockPopulate).toHaveBeenCalledWith('course');
    expect(mockSession.abortTransaction).toHaveBeenCalled();
    expect(mockSession.endSession).toHaveBeenCalled();
  });

  it('should throw error if course is inactive', async () => {
    (Student.findOne as jest.Mock).mockReturnValue({
      session: () => ({
        exec: () => Promise.resolve({ _id: 'studentId' }),
      }),
    });

    const mockClass = {
      _id: 'classId',
      course: { _id: 'courseId' },
    };

    const mockPopulate = jest.fn().mockReturnValue({
      session: () => ({
        exec: () => Promise.resolve(mockClass),
      }),
    });

    (Class.findOne as jest.Mock).mockReturnValue({
      populate: mockPopulate,
    });

    (Course.findById as jest.Mock).mockResolvedValue(null); // course null or inactive

    await expect(
      registrationService.registerCourse('student123', 'class123')
    ).rejects.toThrow('Khóa học không tồn tại hoặc đã bị deactivate');

    expect(mockSession.abortTransaction).toHaveBeenCalled();
    expect(mockSession.endSession).toHaveBeenCalled();
  });

  it('should throw error if class is full', async () => {
  const student = { _id: 'studentId' };
  const course = {
    _id: 'courseId',
    isActive: true,
    prerequisites: [],
  };
  const classInfo = {
    _id: 'classId',
    course: { _id: 'courseId' },
    maxStudents: 50,
  };

  (Student.findOne as jest.Mock).mockReturnValue({
    session: () => ({
      exec: () => Promise.resolve(student),
    }),
  });

  const mockPopulate = jest.fn().mockReturnValue({
    session: () => ({
      exec: () => Promise.resolve(classInfo),
    }),
  });

  (Class.findOne as jest.Mock).mockReturnValue({
    populate: mockPopulate,
  });

  (Course.findById as jest.Mock).mockResolvedValue(course);
  (Registration.countDocuments as jest.Mock).mockResolvedValue(50); // Class full

  await expect(
    registrationService.registerCourse('student123', 'class123')
  ).rejects.toThrow('Lớp học đã đầy');

  expect(mockSession.abortTransaction).toHaveBeenCalled();
  expect(mockSession.endSession).toHaveBeenCalled();
});

it('should throw error if student has not completed prerequisites', async () => {
  const student = { _id: 'studentId' };
  const course = {
    _id: 'courseId',
    isActive: true,
    prerequisites: ['prereq1', 'prereq2'],
  };
  const classInfo = {
    _id: 'classId',
    course: { _id: 'courseId' },
    maxStudents: 50,
  };

  (Student.findOne as jest.Mock).mockReturnValue({
    session: () => ({
      exec: () => Promise.resolve(student),
    }),
  });

  const mockPopulate = jest.fn().mockReturnValue({
    session: () => ({
      exec: () => Promise.resolve(classInfo),
    }),
  });

  (Class.findOne as jest.Mock).mockReturnValue({
    populate: mockPopulate,
  });

  (Course.findById as jest.Mock).mockResolvedValue(course);

  // Student has only completed 1 of 2 prerequisites
  (Registration.find as jest.Mock).mockResolvedValue([
    { course: 'prereq1' }, // missing prereq2
  ]);

  await expect(
    registrationService.registerCourse('student123', 'class123')
  ).rejects.toThrow('Chưa hoàn thành học phần tiên quyết');

  expect(mockSession.abortTransaction).toHaveBeenCalled();
  expect(mockSession.endSession).toHaveBeenCalled();
});


  it('should register successfully if all conditions pass', async () => {
    const student = { _id: 'studentId' };
    const course = {
      _id: 'courseId',
      isActive: true,
      prerequisites: [],
    };
    const classInfo = {
      _id: 'classId',
      course: { _id: 'courseId' },
      maxStudents: 50,
    };

    (Student.findOne as jest.Mock).mockReturnValue({
      session: () => ({
        exec: () => Promise.resolve(student),
      }),
    });

    const mockPopulate = jest.fn().mockReturnValue({
      session: () => ({
        exec: () => Promise.resolve(classInfo),
      }),
    });

    (Class.findOne as jest.Mock).mockReturnValue({
      populate: mockPopulate,
    });

    (Course.findById as jest.Mock).mockResolvedValue(course);
    (Registration.find as jest.Mock).mockResolvedValue([]); // No prerequisites
    (Registration.countDocuments as jest.Mock).mockResolvedValue(0); // Not full
    (Registration.findOne as jest.Mock).mockResolvedValue(null); // Not registered yet

    const mockSave = jest.fn().mockResolvedValue({
      _id: 'regId',
      student: student._id,
    });

    (Registration as any).mockImplementation(() => ({
      save: mockSave,
    }));

    const result = await registrationService.registerCourse(
      'student123',
      'class123'
    );

    expect(result).toEqual({
      _id: 'regId',
      student: student._id,
    });

    expect(mockSave).toHaveBeenCalled();
    expect(mockSession.commitTransaction).toHaveBeenCalled();
    expect(mockSession.endSession).toHaveBeenCalled();
  });
});
