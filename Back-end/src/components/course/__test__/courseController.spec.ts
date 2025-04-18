import courseController from '../controllers/courseController';
import courseService from '../services/courseService';

jest.mock('../services/courseService');

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('CourseController', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return all courses', async () => {
    const req: any = { query: {} };
    const res = mockRes();
    const mockCourses = [{ courseId: 'CS101', name: 'Intro', credits: 3 }];
    (courseService.getCourses as jest.Mock).mockResolvedValue(mockCourses);

    await courseController.getCourses(req, res);

    expect(courseService.getCourses).toHaveBeenCalledWith({});
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockCourses,
    });
  });

  it('should return course by id', async () => {
    const req: any = { params: { id: 'courseId' } };
    const res = mockRes();
    const mockCourse = { courseId: 'CS101', name: 'Intro', credits: 3 };
    (courseService.getCourseById as jest.Mock).mockResolvedValue(mockCourse);

    await courseController.getCourseById(req, res);

    expect(courseService.getCourseById).toHaveBeenCalledWith('courseId');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockCourse,
    });
  });

  it('should create a new course', async () => {
    const req: any = { body: { courseId: 'CS102', name: 'DSA', credits: 4 } };
    const res = mockRes();
    const mockCourse = { courseId: 'CS102', name: 'DSA', credits: 4 };
    (courseService.createCourse as jest.Mock).mockResolvedValue(mockCourse);

    await courseController.createCourse(req, res);

    expect(courseService.createCourse).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockCourse,
    });
  });

  it('should handle error when creating course', async () => {
    const req: any = { body: { courseId: 'CS102', name: 'DSA', credits: 4 } };
    const res = mockRes();
    (courseService.createCourse as jest.Mock).mockRejectedValue(
      new Error('Create error')
    );

    await courseController.createCourse(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Create error',
    });
  });
});
