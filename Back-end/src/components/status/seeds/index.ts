import mongoose from "mongoose";
import dotenv from "dotenv";
import Status from "../models/Status";
dotenv.config();

// Hàm này sẽ thêm dữ liệu mẫu cho bảng trạng thái
const seedStatuses = async () => {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "");
    console.log("🔗 Connected to MongoDB");

    // Kiểm tra nếu đã có dữ liệu trong collection
    const statusCount = await Status.countDocuments();
    if (statusCount > 0) {
      console.log("Statuses already seeded.");
      return;
    }

    // Danh sách các trạng thái mặc định
    const defaultStatuses = [
      {
        name: {
          vi: "Đang học",
          en: "Currently Studying"
        },
        description: {
          vi: "Sinh viên đang trong quá trình học tập",
          en: "Student is currently enrolled and studying"
        },
        isActive: true,
        createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000), // 100 days ago
        updatedAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000)
      },
      {
        name: {
          vi: "Đã tốt nghiệp",
          en: "Graduated"
        },
        description: {
          vi: "Sinh viên đã hoàn thành chương trình học và tốt nghiệp",
          en: "Student has completed the program and graduated"
        },
        isActive: true,
        createdAt: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000), // 95 days ago
        updatedAt: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000)
      },
      {
        name: {
          vi: "Đã thôi học",
          en: "Dropped Out"
        },
        description: {
          vi: "Sinh viên đã chủ động thôi học",
          en: "Student has voluntarily withdrawn from the program"
        },
        isActive: true,
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
        updatedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
      },
      {
        name: {
          vi: "Bảo lưu",
          en: "On Leave"
        },
        description: {
          vi: "Sinh viên đang trong thời gian bảo lưu",
          en: "Student is on academic leave"
        },
        isActive: true,
        createdAt: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000), // 85 days ago
        updatedAt: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000)
      },
      {
        name: {
          vi: "Đình chỉ",
          en: "Suspended"
        },
        description: {
          vi: "Sinh viên bị đình chỉ học tập",
          en: "Student's studies have been suspended"
        },
        isActive: true,
        createdAt: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000), // 80 days ago
        updatedAt: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000)
      },
    ];

    // Thêm các trạng thái mặc định vào database
    await Status.create(defaultStatuses);
    console.log("Default statuses seeded successfully.");
  } catch (error) {
    console.error("Error seeding statuses:", error);
  } finally {
    // Đóng kết nối
    await mongoose.connection.close();
    console.log("🔌 Disconnected from MongoDB");
  }
};

export default seedStatuses;
