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
      faculties.find((f) => f.name["vi"]?.includes("CNTT")) || faculties[0];
    const mathFaculty =
      faculties.find((f) => f.name["vi"]?.includes("Toán")) ||
      faculties[1] ||
      faculties[0];
    const physicsFaculty =
      faculties.find((f) => f.name["vi"]?.includes("Lý")) ||
      faculties[2] ||
      faculties[0];
    const englishFaculty =
      faculties.find((f) => f.name["vi"]?.includes("Anh")) ||
      faculties[3] ||
      faculties[0];

    // Tạo các khóa học cơ bản không có môn tiên quyết
    const baseCourses = [
      {
        courseId: "CSC10001",
        name: {
          vi: "Nhập môn lập trình",
          en: "Introduction to Programming",
        },
        credits: 4,
        faculty: csFaculty._id,
        description: {
          vi: "Giới thiệu về lập trình cơ bản và ngôn ngữ C++.",
          en: "Introduce the basic of programming and C++ language.",
        },
        isActive: true,
        createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000), // 100 ngày trước
      },
      {
        courseId: "MTH10001",
        name: {
          vi: "Giải tích 1",
          en: "Calculus 1",
        },
        credits: 4,
        faculty: mathFaculty._id,
        description: {
          vi: "Nhập môn giải tích toán học.",
          en: "Introduction to basic calculus.",
        },
        isActive: true,
        createdAt: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000), // 95 ngày trước
      },
      {
        courseId: "PHY10001",
        name: {
          vi: "Vật lý đại cương 1",
          en: "General Physics 1",
        },
        credits: 3,
        faculty: physicsFaculty._id,
        description: {
          vi: "Cơ sở vật lý cơ học và nhiệt học.",
          en: "Physics foundation in mechanics and thermodynamics",
        },
        isActive: true,
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 ngày trước
      },
      {
        courseId: "ENG10001",
        name: {
          vi: "Tiếng Anh học thuật",
          en: "Academic English",
        },
        credits: 3,
        faculty: englishFaculty._id,
        description: {
          vi: "Tiếng Anh cho sinh viên đại học.",
          en: "English for undergraduates."
        },
        isActive: true,
        createdAt: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000), // 85 ngày trước
      },
    ];

    // Lưu các khóa học cơ bản
    console.log("Creating base courses...");
    const savedBaseCourses = await Course.insertMany(baseCourses);

    // Lấy ID của các khóa học cơ bản để làm điều kiện tiên quyết
    const csIntroId = savedBaseCourses.find(
      (c) => c.courseId === "CSC10001"
    )?._id;
    const calculus1Id = savedBaseCourses.find(
      (c) => c.courseId === "MTH10001"
    )?._id;
    const physics1Id = savedBaseCourses.find(
      (c) => c.courseId === "PHY10001"
    )?._id;

    // Tạo các khóa học nâng cao có môn tiên quyết
    const advancedCourses = [
      {
        courseId: "CSC10002",
        name: {
          vi: "Cấu trúc dữ liệu và giải thuật",
          en: "Data Structures and Algorithms"
        },
        credits: 4,
        faculty: csFaculty._id,
        description: {
          vi: "Học về các cấu trúc dữ liệu và thiết kế giải thuật.",
          en: "Study of data structures and algorithm design."
        },
        prerequisites: [csIntroId],
        isActive: true,
        createdAt: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000),
      },
      {
        courseId: "MTH10002",
        name: {
          vi: "Giải tích 2",
          en: "Calculus 2"
        },
        credits: 4,
        faculty: mathFaculty._id,
        description: {
          vi: "Phần nâng cao của giải tích toán học.",
          en: "Advanced topics in calculus."
        },
        prerequisites: [calculus1Id],
        isActive: true,
        createdAt: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000),
      },
      {
        courseId: "PHY10002",
        name: {
          vi: "Vật lý đại cương 2",
          en: "General Physics 2"
        },
        credits: 3,
        faculty: physicsFaculty._id,
        description: {
          vi: "Cơ sở điện từ học và quang học.",
          en: "Foundations of electromagnetism and optics."
        },
        prerequisites: [physics1Id],
        isActive: true,
        createdAt: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000),
      },
      {
        courseId: "CSC20001",
        name: {
          vi: "Lập trình hướng đối tượng",
          en: "Object-Oriented Programming"
        },
        credits: 4,
        faculty: csFaculty._id,
        description: {
          vi: "Nguyên lý và kỹ thuật lập trình hướng đối tượng.",
          en: "Principles and techniques of object-oriented programming."
        },
        prerequisites: [csIntroId],
        isActive: true,
        createdAt: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000),
      },
    ];

    console.log("Creating advanced courses...");
    const savedAdvancedCourses = await Course.insertMany(advancedCourses);

    // Lấy ID cho môn học nâng cao để làm điều kiện tiên quyết cho các môn cấp cao hơn
    const dataStructureId = savedAdvancedCourses.find(
      (c) => c.courseId === "CSC10002"
    )?._id;
    const oopId = savedAdvancedCourses.find(
      (c) => c.courseId === "CSC20001"
    )?._id;

    // Tạo các khóa học cấp cao hơn có nhiều môn tiên quyết
    const highLevelCourses = [
      {
        courseId: "CSC30001",
        name: {
          vi: "Phát triển ứng dụng web",
          en: "Web Application Development"
        },
        credits: 3,
        faculty: csFaculty._id,
        description: {
          vi: "Học phát triển ứng dụng web sử dụng công nghệ hiện đại.",
          en: "Learn web application development using modern technologies."
        },
        prerequisites: [dataStructureId, oopId],
        isActive: true,
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      },
      {
        courseId: "CSC30002",
        name: {
          vi: "Trí tuệ nhân tạo",
          en: "Artificial Intelligence"
        },
        credits: 3,
        faculty: csFaculty._id,
        description: {
          vi: "Giới thiệu các kỹ thuật và thuật toán trí tuệ nhân tạo.",
          en: "Introduction to artificial intelligence techniques and algorithms."
        },
        prerequisites: [dataStructureId, calculus1Id],
        isActive: true,
        createdAt: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000),
      },
      {
        courseId: "CSC30003",
        name: {
          vi: "Học máy",
          en: "Machine Learning"
        },
        credits: 3,
        faculty: csFaculty._id,
        description: {
          vi: "Giới thiệu về các kỹ thuật học máy.",
          en: "Introduction to machine learning techniques."
        },
        prerequisites: [dataStructureId, calculus1Id],
        isActive: true,
        createdAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000),
      },
    ];

    console.log("Creating high level courses...");
    await Course.insertMany(highLevelCourses);

    // Tạo một khóa học đã bị deactivate
    const deactivatedCourse = {
      courseId: "CSC10005",
      name: {
        vi: "Lập trình Pascal (Cũ)",
        en: "Pascal Programming (Old)"
      },
      credits: 3,
      faculty: csFaculty._id,
      description: {
        vi: "Môn học đã không còn được giảng dạy.",
        en: "This course is no longer taught."
      },
      isActive: false,
      createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000),
    };

    console.log("Creating deactivated course...");
    await Course.create(deactivatedCourse);

    // Tạo một khóa học mới (dưới 30 phút)
    const newCourse = {
      courseId: "CSC40001",
      name: {
        vi: "Blockchain và ứng dụng",
        en: "Blockchain and Applications"
      },
      credits: 3,
      faculty: csFaculty._id,
      description: {
        vi: "Giới thiệu về công nghệ blockchain và các ứng dụng.",
        en: "Introduction to blockchain technology and its applications."
      },
      isActive: true,
      createdAt: new Date(),
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
