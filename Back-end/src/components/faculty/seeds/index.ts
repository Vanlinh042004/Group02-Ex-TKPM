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
          name: {
            vi: "Khoa Luật",
            en: "Faculty of Law"
          }
        },
        {
          facultyId: "KTATM",
          name: {
            vi: "Khoa Tiếng Anh Thương Mại",
            en: "Faculty of Business English"
          }
        },
        {
          facultyId: "KTN",
          name: {
            vi: "Khoa Tiếng Nhật",
            en: "Faculty of Japanese"
          }
        },
        {
          facultyId: "KTP",
          name: {
            vi: "Khoa Tiếng Pháp",
            en: "Faculty of French"
          }
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
