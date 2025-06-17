import mongoose from "mongoose";
import dotenv from "dotenv";
import Registration from "../models/Registration";
import Student from "../../student/models/Student";
import Class from "../../class/models/Class";
dotenv.config();

// Hàm này sẽ thêm dữ liệu mẫu cho bảng đăng ký
const seedRegistrations = async () => {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "");
    console.log("🔗 Connected to MongoDB");

    // Kiểm tra nếu đã có dữ liệu trong collection
    const registrationCount = await Registration.countDocuments();
    if (registrationCount > 0) {
      console.log("Registrations already seeded.");
      return;
    }

    // Lấy danh sách sinh viên và lớp học
    const students = await Student.find().limit(5);
    const classes = await Class.find().limit(3);

    if (students.length === 0 || classes.length === 0) {
      console.log("Please seed students and classes first.");
      return;
    }

    // Danh sách các đăng ký mặc định
    const defaultRegistrations = [
      // Đăng ký thường
      {
        student: students[0]._id,
        class: classes[0]._id,
        registrationDate: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000), // 100 days ago
        grade: 8.5,
        status: "active",
        createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000)
      },
      {
        student: students[1]._id,
        class: classes[0]._id,
        registrationDate: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000), // 95 days ago
        grade: 7.5,
        status: "active",
        createdAt: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000)
      },
      // Đăng ký đã hủy
      {
        student: students[2]._id,
        class: classes[1]._id,
        registrationDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
        status: "cancelled",
        cancellationDate: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000), // 85 days ago
        cancellationReason: "Chuyển lớp",
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000)
      },
      // Đăng ký chưa có điểm
      {
        student: students[3]._id,
        class: classes[2]._id,
        registrationDate: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000), // 80 days ago
        status: "active",
        createdAt: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000)
      },
      // Đăng ký với điểm cao
      {
        student: students[4]._id,
        class: classes[2]._id,
        registrationDate: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000), // 75 days ago
        grade: 9.5,
        status: "active",
        createdAt: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000)
      }
    ];

    // Thêm các đăng ký mặc định vào database
    await Registration.create(defaultRegistrations);
    console.log("Default registrations seeded successfully.");
  } catch (error) {
    console.error("Error seeding registrations:", error);
  } finally {
    // Đóng kết nối
    await mongoose.connection.close();
    console.log("🔌 Disconnected from MongoDB");
  }
};

export default seedRegistrations;
