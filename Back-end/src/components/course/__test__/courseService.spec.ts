import courseService from "../services/courseService";
import Course from "../models/Course";
import mongoose from "mongoose";

jest.mock("../models/Course");

beforeAll(() => {
  try {
    mongoose.deleteModel("Course");
    mongoose.deleteModel("Class");
  } catch (e) {}
});

describe("CourseService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should get all courses", async () => {
    const mockCourses = [{ courseId: "CS101", name: "Intro", credits: 3 }];
    const mockPopulate2 = jest.fn().mockResolvedValue(mockCourses);
    const mockPopulate1 = jest
      .fn()
      .mockReturnValue({ populate: mockPopulate2 });
    (Course.find as jest.Mock).mockReturnValue({ populate: mockPopulate1 });

    const result = await courseService.getCourses();
    expect(result).toEqual(mockCourses);
  });

  it("should get course by id", async () => {
    const mockCourse = { courseId: "CS101", name: "Intro", credits: 3 };
    const mockPopulate2 = jest.fn().mockResolvedValue(mockCourse);
    const mockPopulate1 = jest
      .fn()
      .mockReturnValue({ populate: mockPopulate2 });
    (Course.findById as jest.Mock).mockReturnValue({ populate: mockPopulate1 });

    const result = await courseService.getCourseById("courseId");
    expect(result).toEqual(mockCourse);
  });

  it("should create a new course", async () => {
    const mockCourse = {
      save: jest
        .fn()
        .mockResolvedValue({ courseId: "CS102", name: "DSA", credits: 4 }),
    };
    (Course as unknown as jest.Mock).mockImplementation(() => mockCourse);

    const result = await courseService.createCourse({
      courseId: "CS102",
      name: "DSA",
      credits: 4,
    });
    expect(result).toEqual({ courseId: "CS102", name: "DSA", credits: 4 });
  });

  it("should check prerequisites when creating a course", async () => {
    (Course.findById as jest.Mock).mockResolvedValueOnce(null);
    const fakeId = new mongoose.Types.ObjectId();
    await expect(
      courseService.createCourse({
        courseId: "CS103",
        name: "Advanced",
        credits: 3,
        prerequisites: [fakeId as any],
      }),
    ).rejects.toThrow(`Môn tiên quyết với ID ${fakeId} không tồn tại`);
  });

  it("should throw error if required params are missing in createCourse", async () => {
    await expect(
      courseService.createCourse(undefined as any),
    ).rejects.toThrow();
    await expect(courseService.createCourse(null as any)).rejects.toThrow();
    await expect(courseService.createCourse({} as any)).rejects.not.toThrow(); // Không có lỗi nếu không có prerequisites
  });

  it("should update a course", async () => {
    const mockCourse = { courseId: "CS101", name: "Intro", credits: 3 };
    (Course.findById as jest.Mock).mockResolvedValue(mockCourse);
    (Course.findByIdAndUpdate as jest.Mock).mockResolvedValue({
      ...mockCourse,
      name: "Intro Updated",
    });

    const result = await courseService.updateCourse("courseId", {
      name: "Intro Updated",
    });
    expect(result).toEqual({
      courseId: "CS101",
      name: "Intro Updated",
      credits: 3,
    });
  });

  it("should throw error if updateCourse cannot find course", async () => {
    (Course.findById as jest.Mock).mockResolvedValue(null);
    await expect(
      courseService.updateCourse("id", { name: "New" }),
    ).rejects.toThrow("Khóa học không tồn tại");
  });

  it("should throw error if trying to change courseId in updateCourse", async () => {
    const mockCourse = { courseId: "CS101", name: "Intro", credits: 3 };
    (Course.findById as jest.Mock).mockResolvedValue(mockCourse);
    await expect(
      courseService.updateCourse("id", { courseId: "CS999" }),
    ).rejects.toThrow("Không thể thay đổi mã khóa học");
  });

  it("should throw error if trying to change credits when students registered", async () => {
    const mockCourse = { courseId: "CS101", name: "Intro", credits: 3 };
    (Course.findById as jest.Mock).mockResolvedValue(mockCourse);
    // Giả lập có class và có registration
    const mockClasses = [{ _id: "classId" }];
    const mockRegistrations = { _id: "regId" };
    jest.mock("../../class/models/Class", () => ({
      find: jest.fn().mockResolvedValue(mockClasses),
    }));
    jest.mock("../../registration/models/Registration", () => ({
      findOne: jest.fn().mockResolvedValue(mockRegistrations),
    }));
    // Gán lại các hàm find và findOne cho đúng
    const Class = require("../../class/models/Class");
    const Registration = require("../../registration/models/Registration");
    Class.find = jest.fn().mockResolvedValue(mockClasses);
    Registration.findOne = jest.fn().mockResolvedValue(mockRegistrations);

    await expect(
      courseService.updateCourse("id", { credits: 4 }),
    ).rejects.toThrow(
      "Không thể thay đổi số tín chỉ vì đã có sinh viên đăng ký",
    );
  });

  it("should deactivate a course", async () => {
    const mockCourse = { courseId: "CS101", isActive: false };
    (Course.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockCourse);

    const result = await courseService.deactivateCourse("courseId");
    expect(result).toEqual(mockCourse);
  });

  it("should throw error if deactivateCourse cannot find course", async () => {
    (Course.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);
    await expect(courseService.deactivateCourse("id")).rejects.toThrow(
      "Khóa học không tồn tại",
    );
  });

  it("should delete a course", async () => {
    // Giả lập không có class nào liên quan
    const mockCourse = { createdAt: new Date() };
    (Course.findById as jest.Mock).mockResolvedValue(mockCourse);
    const mockClassFind = jest.fn().mockResolvedValue([]);
    jest.mock("../../class/models/Class", () => ({
      find: mockClassFind,
    }));
    (Course.findByIdAndDelete as jest.Mock).mockResolvedValue(true);

    // Gán lại hàm find cho đúng
    const Class = require("../../class/models/Class");
    Class.find = mockClassFind;

    const result = await courseService.deleteCourse("courseId");
    expect(result).toBe(true);
  });

  it("should throw error if deleteCourse cannot find course", async () => {
    (Course.findById as jest.Mock).mockResolvedValue(null);
    await expect(courseService.deleteCourse("id")).rejects.toThrow(
      "Khóa học không tồn tại",
    );
  });

  it("should throw error if deleteCourse is called after 30 minutes", async () => {
    const oldDate = new Date(Date.now() - 31 * 60 * 1000);
    (Course.findById as jest.Mock).mockResolvedValue({ createdAt: oldDate });
    await expect(courseService.deleteCourse("id")).rejects.toThrow(
      "Không thể xóa khóa học sau 30 phút kể từ khi tạo",
    );
  });

  it("should throw error if deleteCourse has classes", async () => {
    const mockCourse = { createdAt: new Date() };
    (Course.findById as jest.Mock).mockResolvedValue(mockCourse);
    const mockClassFind = jest.fn().mockResolvedValue([{}]);
    jest.mock("../../class/models/Class", () => ({
      find: mockClassFind,
    }));
    // Gán lại hàm find cho đúng
    const Class = require("../../class/models/Class");
    Class.find = mockClassFind;

    await expect(courseService.deleteCourse("id")).rejects.toThrow(
      "Không thể xóa khóa học vì đã có lớp học được mở",
    );
  });

  it("should throw error when getCourses fails", async () => {
    (Course.find as jest.Mock).mockImplementation(() => {
      throw new Error("Find error");
    });
    await expect(courseService.getCourses()).rejects.toThrow("Find error");
  });

  it("should throw error when getCourseById fails", async () => {
    (Course.findById as jest.Mock).mockImplementation(() => {
      throw new Error("FindById error");
    });
    await expect(courseService.getCourseById("id")).rejects.toThrow(
      "FindById error",
    );
  });

  it("should throw error when createCourse fails", async () => {
    (Course as unknown as jest.Mock).mockImplementation(() => {
      throw new Error("Create error");
    });
    await expect(courseService.createCourse({})).rejects.toThrow(
      "Create error",
    );
  });

  it("should throw error when updateCourse fails", async () => {
    (Course.findById as jest.Mock).mockResolvedValue({});
    (Course.findByIdAndUpdate as jest.Mock).mockRejectedValue(
      new Error("Update error"),
    );
    await expect(courseService.updateCourse("id", {})).rejects.toThrow(
      "Update error",
    );
  });

  it("should throw error when deactivateCourse fails", async () => {
    (Course.findByIdAndUpdate as jest.Mock).mockRejectedValue(
      new Error("Deactivate error"),
    );
    await expect(courseService.deactivateCourse("id")).rejects.toThrow(
      "Deactivate error",
    );
  });

  it("should throw error when deleteCourse fails", async () => {
    const mockCourse = { createdAt: new Date() };
    (Course.findById as jest.Mock).mockResolvedValue(mockCourse);
    const mockClassFind = jest.fn().mockRejectedValue(new Error("Class error"));
    jest.mock("../../class/models/Class", () => ({
      find: mockClassFind,
    }));
    // Gán lại hàm find cho đúng
    const Class = require("../../class/models/Class");
    Class.find = mockClassFind;

    await expect(courseService.deleteCourse("id")).rejects.toThrow(
      "Class error",
    );
  });

  it("should throw error in isPrerequisiteForOtherCourses", async () => {
    (Course.countDocuments as jest.Mock).mockRejectedValue(
      new Error("DB error"),
    );
    await expect(
      courseService.isPrerequisiteForOtherCourses("id"),
    ).rejects.toThrow("DB error");
  });

  it("should return false in isPrerequisiteForOtherCourses if count is 0", async () => {
    (Course.countDocuments as jest.Mock).mockResolvedValue(0);
    const result = await courseService.isPrerequisiteForOtherCourses("id");
    expect(result).toBe(false);
  });

  it("should return true in isPrerequisiteForOtherCourses if count > 0", async () => {
    (Course.countDocuments as jest.Mock).mockResolvedValue(2);
    const result = await courseService.isPrerequisiteForOtherCourses("id");
    expect(result).toBe(true);
  });
});
