import mongoose from "mongoose";
import Course from "../models/Course";
import Faculty from "../../faculty/models/Faculty";
import { connect } from "../../../config/database";
import logger from "../../../utils/logger";
import dotenv from "dotenv";

dotenv.config();

/**
 * Tạo dữ liệu mẫu cho khóa học
 */
const seedCourses = async () => {
  try {
    // Kết nối đến database
    await mongoose.connect(process.env.MONGODB_URI || "");
    console.log("🔗 Connected to MongoDB");

    // Kiểm tra nếu đã có dữ liệu trong collection
    const courseCount = await Course.countDocuments();
    if (courseCount > 0) {
      console.log("Courses already seeded.");
      return;
    }

    // Lấy danh sách khoa
    const faculties = await Faculty.find({});

    if (faculties.length === 0) {
      console.log("No faculties found. Please run faculty seed first.");
      return;
    }

    // Lựa chọn một số khoa phổ biến để gán cho các khóa học
    const csFaculty =
      faculties.find((f) => f.name['vi']?.includes("CNTT")) || faculties[0];
    const mathFaculty =
      faculties.find((f) => f.name['vi']?.includes("Toán")) ||
      faculties[1] ||
      faculties[0];
    const physicsFaculty =
      faculties.find((f) => f.name['vi']?.includes("Lý")) ||
      faculties[2] ||
      faculties[0];
    const englishFaculty =
      faculties.find((f) => f.name['vi']?.includes("Anh")) ||
      faculties[3] ||
      faculties[0];

    // Tạo các khóa học cơ bản không có môn tiên quyết
    const baseCourses = [
      {
        courseId: "CSC10001",
        name: "Nhập môn lập trình",
        credits: 4,
        faculty: csFaculty._id,
        description: "Giới thiệu về lập trình cơ bản và ngôn ngữ C++.",
        isActive: true,
        createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000), // 100 ngày trước
      },
      {
        courseId: "MTH10001",
        name: "Giải tích 1",
        credits: 4,
        faculty: mathFaculty._id,
        description: "Nhập môn giải tích toán học.",
        isActive: true,
        createdAt: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000), // 95 ngày trước
      },
      {
        courseId: "PHY10001",
        name: "Vật lý đại cương 1",
        credits: 3,
        faculty: physicsFaculty._id,
        description: "Cơ sở vật lý cơ học và nhiệt học.",
        isActive: true,
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 ngày trước
      },
      {
        courseId: "ENG10001",
        name: "Tiếng Anh học thuật",
        credits: 3,
        faculty: englishFaculty._id,
        description: "Tiếng Anh cho sinh viên đại học.",
        isActive: true,
        createdAt: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000), // 85 ngày trước
      },
    ];

    // Lưu các khóa học cơ bản
    console.log("Creating base courses...");
    const savedBaseCourses = await Course.insertMany(baseCourses);

    // Lấy ID của các khóa học cơ bản để làm điều kiện tiên quyết
    const csIntroId = savedBaseCourses.find(
      (c) => c.courseId === "CSC10001",
    )?._id;
    const calculus1Id = savedBaseCourses.find(
      (c) => c.courseId === "MTH10001",
    )?._id;
    const physics1Id = savedBaseCourses.find(
      (c) => c.courseId === "PHY10001",
    )?._id;

    // Tạo các khóa học nâng cao có môn tiên quyết
    const advancedCourses = [
      {
        courseId: "CSC10002",
        name: "Cấu trúc dữ liệu và giải thuật",
        credits: 4,
        faculty: csFaculty._id,
        description: "Học về các cấu trúc dữ liệu và thiết kế giải thuật.",
        prerequisites: [csIntroId], // Nhập môn lập trình là môn tiên quyết
        isActive: true,
        createdAt: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000), // 80 ngày trước
      },
      {
        courseId: "MTH10002",
        name: "Giải tích 2",
        credits: 4,
        faculty: mathFaculty._id,
        description: "Phần nâng cao của giải tích toán học.",
        prerequisites: [calculus1Id], // Giải tích 1 là môn tiên quyết
        isActive: true,
        createdAt: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000), // 75 ngày trước
      },
      {
        courseId: "PHY10002",
        name: "Vật lý đại cương 2",
        credits: 3,
        faculty: physicsFaculty._id,
        description: "Cơ sở điện từ học và quang học.",
        prerequisites: [physics1Id], // Vật lý 1 là môn tiên quyết
        isActive: true,
        createdAt: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000), // 70 ngày trước
      },
      {
        courseId: "CSC20001",
        name: "Lập trình hướng đối tượng",
        credits: 4,
        faculty: csFaculty._id,
        description: "Nguyên lý và kỹ thuật lập trình hướng đối tượng.",
        prerequisites: [csIntroId], // Nhập môn lập trình là môn tiên quyết
        isActive: true,
        createdAt: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000), // 65 ngày trước
      },
    ];

    console.log("Creating advanced courses...");
    const savedAdvancedCourses = await Course.insertMany(advancedCourses);

    // Lấy ID cho môn học nâng cao để làm điều kiện tiên quyết cho các môn cấp cao hơn
    const dataStructureId = savedAdvancedCourses.find(
      (c) => c.courseId === "CSC10002",
    )?._id;
    const oopId = savedAdvancedCourses.find(
      (c) => c.courseId === "CSC20001",
    )?._id;

    // Tạo các khóa học cấp cao hơn có nhiều môn tiên quyết
    const highLevelCourses = [
      {
        courseId: "CSC30001",
        name: "Phát triển ứng dụng web",
        credits: 3,
        faculty: csFaculty._id,
        description: "Học phát triển ứng dụng web sử dụng công nghệ hiện đại.",
        prerequisites: [dataStructureId, oopId], // Cần cả CTDL và OOP
        isActive: true,
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 ngày trước
      },
      {
        courseId: "CSC30002",
        name: "Trí tuệ nhân tạo",
        credits: 3,
        faculty: csFaculty._id,
        description: "Giới thiệu các kỹ thuật và thuật toán trí tuệ nhân tạo.",
        prerequisites: [dataStructureId, calculus1Id], // Cần CTDL và Giải tích 1
        isActive: true,
        createdAt: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000), // 55 ngày trước
      },
      {
        courseId: "CSC30003",
        name: "Học máy",
        credits: 3,
        faculty: csFaculty._id,
        description: "Giới thiệu về các kỹ thuật học máy.",
        prerequisites: [dataStructureId, calculus1Id], // Cần CTDL và Giải tích 1
        isActive: true,
        createdAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000), // 50 ngày trước
      },
    ];

    console.log("Creating high level courses...");
    await Course.insertMany(highLevelCourses);

    // Tạo một khóa học đã bị deactivate
    const deactivatedCourse = {
      courseId: "CSC10005",
      name: "Lập trình Pascal (Cũ)",
      credits: 3,
      faculty: csFaculty._id,
      description: "Môn học đã không còn được giảng dạy.",
      isActive: false,
      createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000), // 200 ngày trước
    };

    console.log("Creating deactivated course...");
    await Course.create(deactivatedCourse);

    // Tạo một khóa học mới (dưới 30 phút)
    const newCourse = {
      courseId: "CSC40001",
      name: "Blockchain và ứng dụng",
      credits: 3,
      faculty: csFaculty._id,
      description: "Giới thiệu về công nghệ blockchain và các ứng dụng.",
      isActive: true,
      createdAt: new Date(), // Thời gian hiện tại
    };

    console.log("Creating new course (for deletion test)...");
    await Course.create(newCourse);

    console.log("✅ Seeded courses successfully");
  } catch (error) {
    console.error("Error seeding courses:", error);
  } finally {
    // Đóng kết nối
    await mongoose.connection.close();
    console.log("🔌 Disconnected from MongoDB");
  }
};

export default seedCourses;
