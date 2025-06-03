import mongoose from "mongoose";
import dotenv from "dotenv";
import Faculty from "../models/Faculty";
dotenv.config();

// Hàm này sẽ thêm dữ liệu mẫu cho bảng khoa
const seedFaculties = async () => {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "");
    console.log("🔗 Connected to MongoDB");

    // Đếm số lượng khoa hiện tại
    const facultyCount = await Faculty.countDocuments();

    // Chỉ thêm nếu chưa có khoa nào
    if (facultyCount === 0) {
      const defaultFaculties = [
        {
          facultyId: "KL",
          name: "Khoa Luật",
        },
        {
          facultyId: "KTATM",
          name: "Khoa Tiếng Anh Thương Mại",
        },
        {
          facultyId: "KTN",
          name: "Khoa Tiếng Nhật",
        },
        {
          facultyId: "KTP",
          name: "Khoa Tiếng Pháp",
        },
      ];

      await Faculty.create(defaultFaculties);
      console.log("Default faculties seeded successfully.");
    } else {
      console.log("Faculties already seeded.");
    }
  } catch (error) {
    console.error("Error seeding faculties:", error);
  }
};

export default seedFaculties;
