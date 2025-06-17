import mongoose from "mongoose";
import dotenv from "dotenv";
import EmailDomain from "../models/EmailDomain";
dotenv.config();

// Hàm này sẽ thêm dữ liệu mẫu cho bảng domain email
const seedEmailDomains = async () => {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "");
    console.log("🔗 Connected to MongoDB");

    // Kiểm tra nếu đã có dữ liệu trong collection
    const domainCount = await EmailDomain.countDocuments();
    if (domainCount > 0) {
      console.log("Email domains already seeded.");
      return;
    }

    // Danh sách các domain email mặc định
    const defaultDomains = [
      {
        domain: "hcmus.edu.vn", 
        createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000), // 100 days ago
        updatedAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000)
      },
      {
        domain: "gmail.com", 
        createdAt: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000), // 95 days ago
        updatedAt: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000)
      },
      {
        domain: "example.com", 
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
        updatedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
      },
      {
        domain: "yahoo.com",
        createdAt: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000), // 85 days ago
        updatedAt: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000)
      }
    ];

    // Thêm các domain email mặc định vào database
    await EmailDomain.create(defaultDomains);
    console.log("Default email domains seeded successfully.");
  } catch (error) {
    console.error("Error seeding email domains:", error);
  } finally {
    // Đóng kết nối
    await mongoose.connection.close();
    console.log("🔌 Disconnected from MongoDB");
  }
};

export default seedEmailDomains;
