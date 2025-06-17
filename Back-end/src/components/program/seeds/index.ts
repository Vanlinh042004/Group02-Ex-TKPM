import mongoose from "mongoose";
import dotenv from "dotenv";
import Program from "../models/Program";
dotenv.config();

// Hàm này sẽ thêm dữ liệu mẫu cho bảng chương trình
const seedPrograms = async () => {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "");
    console.log("🔗 Connected to MongoDB");

    // Kiểm tra nếu đã có dữ liệu trong collection
    const programCount = await Program.countDocuments();
    if (programCount > 0) {
      console.log("Programs already seeded.");
      return;
    }

    // Danh sách các chương trình mặc định
    const defaultPrograms = [
      {
        programId: "CQ",
        name: {
          vi: "Chính quy",
          en: "Standard Program"
        },
        duration: 4, // 4 năm
        isActive: true,
        createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000), // 100 days ago
        updatedAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000)
      },
      {
        programId: "TT",
        name: {
          vi: "Tiên tiến",
          en: "Advanced Program"
        },
        duration: 4, // 4 năm
        isActive: true,
        createdAt: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000), // 95 days ago
        updatedAt: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000)
      },
      {
        programId: "CLC",
        name: {
          vi: "Chất lượng cao",
          en: "High Quality Program"
        },
        duration: 3.5, // 3.5 năm
        isActive: true,
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
        updatedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
      },
      {
        programId: "VP",
        name: {
          vi: "Việt Pháp",
          en: "Vietnam-France Program"
        },
        duration: 4.5, // 4.5 năm
        isActive: true,
        createdAt: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000), // 85 days ago
        updatedAt: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000)
      },
    ];

    // Thêm các chương trình mặc định vào database
    await Program.create(defaultPrograms);
    console.log("Default programs seeded successfully.");
  } catch (error) {
    console.error("Error seeding programs:", error);
  } finally {
    // Đóng kết nối
    await mongoose.connection.close();
    console.log("🔌 Disconnected from MongoDB");
  }
};

export default seedPrograms;
