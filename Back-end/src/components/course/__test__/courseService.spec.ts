import courseService from '../services/courseService';
import Course from '../models/Course';
import mongoose from 'mongoose';

jest.mock('../models/Course');

beforeAll(() => {
  try {
    mongoose.deleteModel('Course');
    mongoose.deleteModel('Class');
  } catch (e) {}
});

describe('CourseService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should get all courses', async () => {
    const mockCourses = [{ courseId: 'CS101', name: 'Intro', credits: 3 }];
    const mockPopulate2 = jest.fn().mockResolvedValue(mockCourses);
    const mockPopulate1 = jest
      .fn()
      .mockReturnValue({ populate: mockPopulate2 });
    (Course.find as jest.Mock).mockReturnValue({ populate: mockPopulate1 });

    const result = await courseService.getCourses();
    expect(result).toEqual(mockCourses);
  });

  it('should get course by id', async () => {
    const mockCourse = { courseId: 'CS101', name: 'Intro', credits: 3 };
    const mockPopulate2 = jest.fn().mockResolvedValue(mockCourse);
    const mockPopulate1 = jest
      .fn()
      .mockReturnValue({ populate: mockPopulate2 });
    (Course.findById as jest.Mock).mockReturnValue({ populate: mockPopulate1 });

    const result = await courseService.getCourseById('courseId');
    expect(result).toEqual(mockCourse);
  });

  it('should create a new course', async () => {
    const mockCourse = {
      save: jest
        .fn()
        .mockResolvedValue({ courseId: 'CS102', name: 'DSA', credits: 4 }),
    };
    (Course as unknown as jest.Mock).mockImplementation(() => mockCourse);

    const result = await courseService.createCourse({
      courseId: 'CS102',
      name: 'DSA',
      credits: 4,
    });
    expect(result).toEqual({ courseId: 'CS102', name: 'DSA', credits: 4 });
  });

  it('should update a course', async () => {
    const mockCourse = { courseId: 'CS101', name: 'Intro', credits: 3 };
    (Course.findById as jest.Mock).mockResolvedValue(mockCourse);
    (Course.findByIdAndUpdate as jest.Mock).mockResolvedValue({
      ...mockCourse,
      name: 'Intro Updated',
    });

    const result = await courseService.updateCourse('courseId', {
      name: 'Intro Updated',
    });
    expect(result).toEqual({
      courseId: 'CS101',
      name: 'Intro Updated',
      credits: 3,
    });
  });

  it('should deactivate a course', async () => {
    const mockCourse = { courseId: 'CS101', isActive: false };
    (Course.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockCourse);

    const result = await courseService.deactivateCourse('courseId');
    expect(result).toEqual(mockCourse);
  });

  it('should delete a course', async () => {
    // Giả lập không có class nào liên quan
    const mockClassFind = jest.fn().mockResolvedValue([]);
    jest.mock('../../class/models/Class', () => ({
      find: mockClassFind,
    }));
    (Course.findByIdAndDelete as jest.Mock).mockResolvedValue(true);

    const result = await courseService.deleteCourse('courseId');
    expect(result).toBe(true);
  });
});
