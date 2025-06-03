import registrationService from "../services/registrationService";
import Registration from "../models/Registration";
import Student from "../../student/models/Student";
import Class from "../../class/models/Class";
import Course from "../../course/models/Course";

jest.mock("../models/Registration");
jest.mock("../../student/models/Student");
jest.mock("../../class/models/Class");
jest.mock("../../course/models/Course");

describe("RegistrationService - registerCourse", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should throw error if student does not exist", async () => {
    (Student.findOne as jest.Mock).mockReturnValue({
      exec: () => Promise.resolve(null),
    });

    await expect(
      registrationService.registerCourse("student123", "class123"),
    ).rejects.toThrow("Sinh viên không tồn tại");
  });

  it("should throw error if class does not exist", async () => {
    (Student.findOne as jest.Mock).mockReturnValue({
      exec: () => Promise.resolve({ _id: "studentId" }),
    });

    const mockPopulate = jest.fn().mockReturnValue({
      exec: () => Promise.resolve(null),
    });

    (Class.findOne as jest.Mock).mockReturnValue({
      populate: mockPopulate,
    });

    await expect(
      registrationService.registerCourse("student123", "class123"),
    ).rejects.toThrow("Lớp học không tồn tại");

    expect(mockPopulate).toHaveBeenCalledWith("course");
  });

  it("should throw error if course is not active", async () => {
    const student = { _id: "studentId" };
    const classInfo = {
      _id: "classId",
      course: "courseId",
      maxStudents: 50,
    };
    const course = { _id: "courseId", isActive: false };

    (Student.findOne as jest.Mock).mockReturnValue({
      exec: () => Promise.resolve(student),
    });

    const mockPopulate = jest.fn().mockReturnValue({
      exec: () => Promise.resolve(classInfo),
    });

    (Class.findOne as jest.Mock).mockReturnValue({
      populate: mockPopulate,
    });

    (Course.findById as jest.Mock).mockResolvedValue(course);

    await expect(
      registrationService.registerCourse("student123", "class123"),
    ).rejects.toThrow("Khóa học không tồn tại hoặc đã bị deactivate");
  });

  it("should pass when prerequisites are completed", async () => {
    const student = { _id: "studentId" };
    const course = {
      _id: "courseId",
      isActive: true,
      prerequisites: ["prereq1"],
    };
    const classInfo = {
      _id: "classId",
      course: { _id: "courseId" },
      maxStudents: 50,
    };

    (Student.findOne as jest.Mock).mockReturnValue({
      exec: () => Promise.resolve(student),
    });

    const mockPopulateClass = jest.fn().mockReturnValue({
      exec: () => Promise.resolve(classInfo),
    });

    (Class.findOne as jest.Mock).mockReturnValue({
      populate: mockPopulateClass,
    });

    (Course.findById as jest.Mock).mockResolvedValue(course);

    (Registration.find as jest.Mock).mockReturnValue({
      populate: jest.fn().mockResolvedValue([
        {
          class: {
            course: {
              _id: "prereq1",
            },
          },
          grade: 9,
        },
      ]),
    });

    (Registration.countDocuments as jest.Mock).mockResolvedValue(10);
    (Registration.findOne as jest.Mock).mockResolvedValue(null);

    const mockSave = jest
      .fn()
      .mockResolvedValue({ _id: "regId", student: student._id });
    (Registration as any).mockImplementation(() => ({ save: mockSave }));

    const result = await registrationService.registerCourse(
      "student123",
      "class123",
    );
    expect(result).toEqual({ _id: "regId", student: student._id });
  });

  it("should throw error if class is full", async () => {
    const student = { _id: "studentId" };
    const course = {
      _id: "courseId",
      isActive: true,
      prerequisites: [],
    };
    const classInfo = {
      _id: "classId",
      course: { _id: "courseId" },
      maxStudents: 50,
    };

    (Student.findOne as jest.Mock).mockReturnValue({
      exec: () => Promise.resolve(student),
    });

    const mockPopulate = jest.fn().mockReturnValue({
      exec: () => Promise.resolve(classInfo),
    });

    (Class.findOne as jest.Mock).mockReturnValue({
      populate: mockPopulate,
    });

    (Course.findById as jest.Mock).mockResolvedValue(course);
    (Registration.find as jest.Mock).mockReturnValue({
      populate: jest.fn().mockResolvedValue([]),
    });
    (Registration.countDocuments as jest.Mock).mockResolvedValue(50);

    await expect(
      registrationService.registerCourse("student123", "class123"),
    ).rejects.toThrow("Lớp học đã đủ số lượng sinh viên tối đa");
  });

  it("should throw error if prerequisites not completed", async () => {
    const student = { _id: "studentId" };
    const course = {
      _id: "courseId",
      isActive: true,
      prerequisites: ["p1"],
    };
    const classInfo = {
      _id: "classId",
      course: { _id: "courseId" },
      maxStudents: 50,
    };

    (Student.findOne as jest.Mock).mockReturnValue({
      exec: () => Promise.resolve(student),
    });

    const mockPopulate = jest.fn().mockReturnValue({
      exec: () => Promise.resolve(classInfo),
    });

    (Class.findOne as jest.Mock).mockReturnValue({
      populate: mockPopulate,
    });

    (Course.findById as jest.Mock).mockResolvedValue(course);
    (Registration.find as jest.Mock).mockReturnValue({
      populate: jest.fn().mockResolvedValue([]),
    });
    (Registration.countDocuments as jest.Mock).mockResolvedValue(10);

    await expect(
      registrationService.registerCourse("student123", "class123"),
    ).rejects.toThrow("Sinh viên chưa hoàn thành môn tiên quyết");
  });

  it("should throw error if already registered", async () => {
    const student = { _id: "studentId" };
    const course = {
      _id: "courseId",
      isActive: true,
      prerequisites: [],
    };
    const classInfo = {
      _id: "classId",
      course: { _id: "courseId" },
      maxStudents: 50,
    };

    (Student.findOne as jest.Mock).mockReturnValue({
      exec: () => Promise.resolve(student),
    });

    const mockPopulate = jest.fn().mockReturnValue({
      exec: () => Promise.resolve(classInfo),
    });

    (Class.findOne as jest.Mock).mockReturnValue({
      populate: mockPopulate,
    });

    (Course.findById as jest.Mock).mockResolvedValue(course);
    (Registration.find as jest.Mock).mockReturnValue({
      populate: jest.fn().mockResolvedValue([]),
    });
    (Registration.countDocuments as jest.Mock).mockResolvedValue(10);
    (Registration.findOne as jest.Mock).mockResolvedValue({ _id: "regId" });

    await expect(
      registrationService.registerCourse("student123", "class123"),
    ).rejects.toThrow("Sinh viên đã đăng ký lớp học này");
  });

  it("should handle unexpected errors during save", async () => {
    const student = { _id: "studentId" };
    const course = {
      _id: "courseId",
      isActive: true,
      prerequisites: [],
    };
    const classInfo = {
      _id: "classId",
      course: { _id: "courseId" },
      maxStudents: 50,
    };

    (Student.findOne as jest.Mock).mockReturnValue({
      exec: () => Promise.resolve(student),
    });

    const mockPopulate = jest.fn().mockReturnValue({
      exec: () => Promise.resolve(classInfo),
    });

    (Class.findOne as jest.Mock).mockReturnValue({
      populate: mockPopulate,
    });

    (Course.findById as jest.Mock).mockResolvedValue(course);
    (Registration.find as jest.Mock).mockReturnValue({
      populate: jest.fn().mockResolvedValue([]),
    });
    (Registration.countDocuments as jest.Mock).mockResolvedValue(10);
    (Registration.findOne as jest.Mock).mockResolvedValue(null);

    (Registration as any).mockImplementation(() => ({
      save: jest.fn().mockRejectedValue(new Error("Unexpected error")),
    }));

    await expect(
      registrationService.registerCourse("student123", "class123"),
    ).rejects.toThrow("Unexpected error");
  });

  it("should register successfully if all conditions pass", async () => {
    const student = { _id: "studentId" };
    const course = {
      _id: "courseId",
      isActive: true,
      prerequisites: [],
    };
    const classInfo = {
      _id: "classId",
      course: { _id: "courseId" },
      maxStudents: 50,
    };

    (Student.findOne as jest.Mock).mockReturnValue({
      exec: () => Promise.resolve(student),
    });

    const mockPopulate = jest.fn().mockReturnValue({
      exec: () => Promise.resolve(classInfo),
    });

    (Class.findOne as jest.Mock).mockReturnValue({
      populate: mockPopulate,
    });

    (Course.findById as jest.Mock).mockResolvedValue(course);
    (Registration.find as jest.Mock).mockReturnValue({
      populate: jest.fn().mockResolvedValue([]),
    });
    (Registration.countDocuments as jest.Mock).mockResolvedValue(10);
    (Registration.findOne as jest.Mock).mockResolvedValue(null);

    const mockSave = jest.fn().mockResolvedValue({
      _id: "regId",
      student: student._id,
    });

    (Registration as any).mockImplementation(() => ({
      save: mockSave,
    }));

    const result = await registrationService.registerCourse(
      "student123",
      "class123",
    );

    expect(result).toEqual({
      _id: "regId",
      student: student._id,
    });

    expect(mockSave).toHaveBeenCalled();
  });
});

describe("RegistrationService - cancelRegistration", () => {
  it("should cancel registration if active", async () => {
    const registration = { _id: "regId", status: "active", class: "classId" };
    (Registration.findById as jest.Mock).mockReturnValue({
      populate: jest.fn().mockResolvedValue(registration),
    });

    (Registration.findByIdAndUpdate as jest.Mock).mockResolvedValue({
      ...registration,
      status: "cancelled",
    });

    const result = await registrationService.cancelRegistration(
      "regId",
      "reason",
    );
    expect(result?.status).toBe("cancelled");
  });

  it("should throw if registration not found", async () => {
    (Registration.findById as jest.Mock).mockReturnValue({
      populate: jest.fn().mockResolvedValue(null),
    });

    await expect(
      registrationService.cancelRegistration("regId", "reason"),
    ).rejects.toThrow("Đăng ký không tồn tại");
  });

  it("should throw if registration is not active", async () => {
    const registration = {
      _id: "regId",
      status: "cancelled",
      class: "classId",
    };
    (Registration.findById as jest.Mock).mockReturnValue({
      populate: jest.fn().mockResolvedValue(registration),
    });

    await expect(
      registrationService.cancelRegistration("regId", "reason"),
    ).rejects.toThrow("Chỉ được hủy đăng ký cho các đăng ký đang hoạt động");
  });
});

describe("RegistrationService - updateGrade", () => {
  it("should throw if grade invalid", async () => {
    await expect(registrationService.updateGrade("regId", 11)).rejects.toThrow(
      "Điểm số không hợp lệ (0-10)",
    );
  });

  it("should throw if registration not found", async () => {
    (Registration.findById as jest.Mock).mockResolvedValue(null);
    await expect(registrationService.updateGrade("regId", 9)).rejects.toThrow(
      "Đăng ký không tồn tại",
    );
  });

  it("should throw if registration is not active", async () => {
    (Registration.findById as jest.Mock).mockResolvedValue({
      status: "cancelled",
    });
    await expect(registrationService.updateGrade("regId", 9)).rejects.toThrow(
      "Chỉ được cập nhật điểm cho các đăng ký đang hoạt động",
    );
  });

  it("should update grade successfully", async () => {
    (Registration.findById as jest.Mock).mockResolvedValue({
      _id: "regId",
      status: "active",
    });
    (Registration.findByIdAndUpdate as jest.Mock).mockResolvedValue({
      _id: "regId",
      grade: 9,
    });

    const result = await registrationService.updateGrade("regId", 9);
    expect(result?.grade).toBe(9);
  });
});

describe("RegistrationService - getAllRegistrations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return populated registrations", async () => {
    const mockData = [{ _id: "1" }];

    const mockPopulateCourse = jest.fn().mockReturnThis();
    const mockPopulateClass = jest
      .fn()
      .mockReturnValue(Promise.resolve(mockData));

    (Registration.find as jest.Mock).mockReturnValue({
      populate: mockPopulateCourse,
    });

    const result = await registrationService.getAllRegistrations();
    expect(result).toEqual(mockData);
  });

  it("should log error and throw when find fails", async () => {
    (Registration.find as jest.Mock).mockImplementation(() => {
      throw new Error("Database failure");
    });

    const loggerErrorSpy = jest
      .spyOn(require("../../../utils/logger"), "error")
      .mockImplementation(() => {});

    await expect(registrationService.getAllRegistrations()).rejects.toThrow(
      "Database failure",
    );

    expect(loggerErrorSpy).toHaveBeenCalledWith(
      "Lỗi lấy danh sách tất cả các đăng ký",
      expect.objectContaining({
        module: "RegistrationService",
        operation: "getAllRegistrations",
        details: expect.objectContaining({
          errorMessage: "Database failure",
        }),
      }),
    );

    loggerErrorSpy.mockRestore();
  });
});

describe("RegistrationService - getAllStudentsFromClass", () => {
  it("should return students of a class", async () => {
    (Class.findOne as jest.Mock).mockResolvedValue({ _id: "classId" });
    (Registration.find as jest.Mock).mockReturnValue({
      populate: jest.fn().mockResolvedValue([{ _id: "reg1" }]),
    });

    const result =
      await registrationService.getAllStudentsFromClass("class123");
    expect(result).toEqual([{ _id: "reg1" }]);
  });

  it("should throw if class not found", async () => {
    (Class.findOne as jest.Mock).mockResolvedValue(null);
    await expect(
      registrationService.getAllStudentsFromClass("class123"),
    ).rejects.toThrow("Lớp học không tồn tại");
  });
});

describe("RegistrationService - generateTranscript", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should generate transcript correctly", async () => {
    const student = {
      _id: "s1",
      studentId: "s1",
      toObject: () => ({ name: "Student" }),
      faculty: { toObject: () => ({ name: "IT" }) },
      program: { toObject: () => ({ name: "CS" }) },
      phoneNumberConfig: { toObject: () => ({ phone: "123" }) },
      status: { toObject: () => ({ active: true }) },
    };

    const course = { courseId: "c1", name: "Math", credits: 3 };
    const reg = {
      class: { classId: "cl1", course },
      grade: 9,
    };

    const mockPopulate = jest.fn().mockReturnThis();

    (Student.findOne as jest.Mock).mockReturnValue({
      populate: mockPopulate,
      exec: jest.fn().mockResolvedValue(student),
    });

    (Registration.find as jest.Mock).mockReturnValue({
      populate: jest.fn().mockResolvedValue([reg]),
    });

    const result = await registrationService.generateTranscript("s1");

    expect(result).toEqual(
      expect.objectContaining({
        studentInfo: expect.any(Object),
        courses: expect.any(Array),
        gpa: expect.any(Number),
        totalCredits: expect.any(Number),
      }),
    );

    expect(result.courses[0]).toMatchObject({
      classId: "cl1",
      courseId: "c1",
      name: "Math",
      credits: 3,
      grade: 9,
      status: "Passed",
    });

    expect(result.gpa).toBeCloseTo(9);
    expect(result.totalCredits).toBe(3);
  });

  it("should throw if student not found in generateTranscript", async () => {
    (Student.findOne as jest.Mock).mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(null),
            }),
          }),
        }),
      }),
    });

    await expect(registrationService.generateTranscript("abc")).rejects.toThrow(
      "Sinh viên không tồn tại",
    );
  });
});
