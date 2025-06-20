import courseController from "../controllers/courseController";
import courseService from "../services/courseService";

jest.mock("../services/courseService");

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("CourseController", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return all courses", async () => {
    const req: any = { query: {} };
    const res = mockRes();
    const mockCourses = [{ courseId: "CS101", name: "Intro", credits: 3 }];
    (courseService.getCourses as jest.Mock).mockResolvedValue(mockCourses);

    await courseController.getCourses(req, res);

    expect(courseService.getCourses).toHaveBeenCalledWith({});
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockCourses,
    });
  });

  it("should return course by id", async () => {
    const req: any = { params: { id: "courseId" } };
    const res = mockRes();
    const mockCourse = { courseId: "CS101", name: "Intro", credits: 3 };
    (courseService.getCourseById as jest.Mock).mockResolvedValue(mockCourse);

    await courseController.getCourseById(req, res);

    expect(courseService.getCourseById).toHaveBeenCalledWith("courseId");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockCourse,
    });
  });

  it("should create a new course", async () => {
    const req: any = { body: { courseId: "CS102", name: "DSA", credits: 4 } };
    const res = mockRes();
    const mockCourse = { courseId: "CS102", name: "DSA", credits: 4 };
    (courseService.createCourse as jest.Mock).mockResolvedValue(mockCourse);

    await courseController.createCourse(req, res);

    expect(courseService.createCourse).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockCourse,
    });
  });

  it("should handle error when creating course", async () => {
    const req: any = { body: { courseId: "CS102", name: "DSA", credits: 4 } };
    const res = mockRes();
    (courseService.createCourse as jest.Mock).mockRejectedValue(
      new Error("Create error"),
    );

    await courseController.createCourse(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Create error",
    });
  });

  it("should handle error when getting all courses", async () => {
    const req: any = { query: {} };
    const res = mockRes();
    (courseService.getCourses as jest.Mock).mockRejectedValue(
      new Error("Get error"),
    );

    await courseController.getCourses(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Get error",
    });
  });

  it("should handle not found when getting course by id", async () => {
    const req: any = { params: { id: "notfound" } };
    const res = mockRes();
    (courseService.getCourseById as jest.Mock).mockResolvedValue(null);

    await courseController.getCourseById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Khóa học không tồn tại",
    });
  });

  it("should handle error when getting course by id", async () => {
    const req: any = { params: { id: "courseId" } };
    const res = mockRes();
    (courseService.getCourseById as jest.Mock).mockRejectedValue(
      new Error("Find error"),
    );

    await courseController.getCourseById(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Find error",
    });
  });

  it("should handle error when deleting course", async () => {
    const req: any = { params: { id: "courseId" } };
    const res = mockRes();
    (courseService.getCourseById as jest.Mock).mockResolvedValue({
      courseId: "courseId",
    });
    (courseService.deleteCourse as jest.Mock).mockRejectedValue(
      new Error("Delete error"),
    );

    await courseController.deleteCourse(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Delete error",
    });
  });

  it("should handle not found when updating course", async () => {
    const req: any = { params: { id: "notfound" }, body: { name: "New" } };
    const res = mockRes();
    (courseService.getCourseById as jest.Mock).mockResolvedValue({
      courseId: "notfound",
    });
    (courseService.updateCourse as jest.Mock).mockResolvedValue(null);

    await courseController.updateCourse(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Khóa học không tồn tại",
    });
  });

  it("should handle error when updating course", async () => {
    const req: any = { params: { id: "courseId" }, body: { name: "New" } };
    const res = mockRes();
    (courseService.getCourseById as jest.Mock).mockResolvedValue({
      courseId: "courseId",
    });
    (courseService.updateCourse as jest.Mock).mockRejectedValue(
      new Error("Update error"),
    );

    await courseController.updateCourse(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Update error",
    });
  });

  it("should handle not found when deactivating course", async () => {
    const req: any = { params: { id: "notfound" } };
    const res = mockRes();
    (courseService.getCourseById as jest.Mock).mockResolvedValue({
      courseId: "notfound",
    });
    (courseService.deactivateCourse as jest.Mock).mockResolvedValue(null);

    await courseController.deactivateCourse(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Khóa học không tồn tại",
    });
  });

  it("should handle error when deactivating course", async () => {
    const req: any = { params: { id: "courseId" } };
    const res = mockRes();
    (courseService.getCourseById as jest.Mock).mockResolvedValue({
      courseId: "courseId",
    });
    (courseService.deactivateCourse as jest.Mock).mockRejectedValue(
      new Error("Deactivate error"),
    );

    await courseController.deactivateCourse(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Deactivate error",
    });
  });
});
