import mongoose from "mongoose";
import dotenv from "dotenv";
import Program from "../models/program";
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
        name: "Chính quy",
        duration: 4, // 4 năm
      },
      {
        programId: "TT",
        name: "Tiên tiến",
        duration: 4, // 4 năm
      },
      {
        programId: "CLC",
        name: "Chất lượng cao",
        duration: 3.5, // 3.5 năm
      },
      {
        programId: "VP",
        name: "Việt Pháp",
        duration: 4.5, // 4.5 năm
      },
    ];

    // Thêm các chương trình mặc định vào database
    await Program.create(defaultPrograms);
    console.log("Default programs seeded successfully.");
  } catch (error) {
    console.error("Error seeding programs:", error);
  }
};

export default seedPrograms;
