import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Status from '../models/Status';
dotenv.config();

// Hàm này sẽ thêm dữ liệu mẫu cho bảng trạng thái
const seedStatuses = async () => {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('🔗 Connected to MongoDB');

    // Kiểm tra nếu đã có dữ liệu trong collection
    const statusCount = await Status.countDocuments();
    if (statusCount > 0) {
      console.log('Statuses already seeded.');
      return;
    }

    // Danh sách các chương trình mặc định
    const defaultStatuses = [
      {
        name: 'Đang học',
      },
      {
        name: 'Đã tốt nghiệp',
      },
      {
        name: 'Đã thôi học',
      },
      {
        name: 'Tạm dừng học'
      },
    ];

    // Thêm các trạng thái mặc định vào database
    await Status.create(defaultStatuses);
    console.log('Default statuses seeded successfully.');
  } catch (error) {
    console.error('Error seeding statuses:', error);
  }
};

export default seedStatuses;