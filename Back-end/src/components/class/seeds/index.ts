import mongoose from "mongoose";
import Class from "../models/Class";
import Course from "../../course/models/Course";
import { connect } from "../../../config/database";
import logger from "../../../utils/logger";
import dotenv from "dotenv";

dotenv.config();

/**
 * Tạo dữ liệu mẫu cho các lớp học
 */
const seedClasses = async () => {
  try {
    // Kết nối đến database
    await mongoose.connect(process.env.MONGODB_URI || "");
    console.log("🔗 Connected to MongoDB");

    // Kiểm tra nếu đã có dữ liệu trong collection
    const classCount = await Class.countDocuments();
    if (classCount > 0) {
      console.log("Classes already seeded.");
      return;
    }

    // Lấy danh sách khóa học active
    const courses = await Course.find({ isActive: true });

    if (courses.length === 0) {
      console.log("No active courses found. Please run course seed first.");
      return;
    }

    // Tạo mảng các học kỳ
    const semesters = ["1", "2", "3"]; // 1, 2, Hè

    // Tạo mảng các phòng học
    const classrooms = [
      "B11",
      "B12",
      "B13",
      "B21",
      "B22",
      "B23",
      "C11",
      "C12",
      "C13",
      "C21",
      "C22",
      "C23",
    ];

    // Tạo mảng các khung giờ học
    const schedules = [
      "Thứ 2 (7:30-9:30)",
      "Thứ 2 (9:45-11:45)",
      "Thứ 2 (13:00-15:00)",
      "Thứ 2 (15:15-17:15)",
      "Thứ 3 (7:30-9:30)",
      "Thứ 3 (9:45-11:45)",
      "Thứ 3 (13:00-15:00)",
      "Thứ 3 (15:15-17:15)",
      "Thứ 4 (7:30-9:30)",
      "Thứ 4 (9:45-11:45)",
      "Thứ 4 (13:00-15:00)",
      "Thứ 4 (15:15-17:15)",
      "Thứ 5 (7:30-9:30)",
      "Thứ 5 (9:45-11:45)",
      "Thứ 5 (13:00-15:00)",
      "Thứ 5 (15:15-17:15)",
      "Thứ 6 (7:30-9:30)",
      "Thứ 6 (9:45-11:45)",
      "Thứ 6 (13:00-15:00)",
      "Thứ 6 (15:15-17:15)",
      "Thứ 7 (7:30-9:30)",
      "Thứ 7 (9:45-11:45)",
    ];

    // Tạo mảng tên các giảng viên
    const instructors = [
      "TS. Nguyễn Văn A",
      "PGS. TS. Trần Thị B",
      "TS. Lê Văn C",
      "ThS. Phạm Thị D",
      "PGS. TS. Hoàng Văn E",
      "GS. TS. Vũ Thị F",
      "TS. Đặng Văn G",
      "ThS. Bùi Thị H",
    ];

    // Tạo các lớp học cho năm học hiện tại
    const currentYear = new Date().getFullYear();
    const academicYear = `${currentYear}-${currentYear + 1}`;

    const classes = [];
    let classIndex = 1;

    // Mỗi khóa học sẽ mở 1-3 lớp cho mỗi học kỳ
    for (const course of courses) {
      // Đối với mỗi học kỳ trong năm
      for (const semester of semesters) {
        // Số lớp ngẫu nhiên từ 1-3
        const numClasses = Math.floor(Math.random() * 3) + 1;

        for (let i = 0; i < numClasses; i++) {
          // Tạo mã lớp học dạng: [mã môn học]-[học kỳ][số thứ tự]
          const classId = `${course.courseId}-${semester}${i + 1}`;

          // Chọn ngẫu nhiên phòng học, lịch học và giảng viên
          const randomClassroom =
            classrooms[Math.floor(Math.random() * classrooms.length)];
          const randomSchedule =
            schedules[Math.floor(Math.random() * schedules.length)];
          const randomInstructor =
            instructors[Math.floor(Math.random() * instructors.length)];

          // Số lượng sinh viên tối đa từ 30-70
          const maxStudents = Math.floor(Math.random() * 41) + 30;

          classes.push({
            classId,
            course: course._id,
            academicYear,
            semester,
            instructor: randomInstructor,
            maxStudents,
            schedule: randomSchedule,
            classroom: randomClassroom,
          });

          classIndex++;
        }
      }
    }

    console.log(`Creating ${classes.length} classes...`);
    await Class.insertMany(classes);

    console.log("✅ Seeded classes successfully");
  } catch (error) {
    console.error("Error seeding classes:", error);
  } finally {
    // Đóng kết nối
    await mongoose.connection.close();
    console.log("🔌 Disconnected from MongoDB");
  }
};

export default seedClasses;
