const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, unique: true }, // Mã số sinh viên
    fullName: { type: String, required: true }, // Họ tên
    dateOfBirth: { type: Date, required: true }, // Ngày tháng năm sinh
    gender: { type: String, enum: ['Nam', 'Nữ'], required: true }, // Giới tính
    faculty: {
      type: String,
      required: true,
      enum: [
        'Khoa Luật',
        'Khoa Tiếng Anh thương mại',
        'Khoa Tiếng Nhật',
        'Khoa Tiếng Pháp',
      ], // Tên khoa hợp lệ
    },
    course: { type: String, required: true }, // Khóa
    program: { type: String, required: true }, // Chương trình
    address: { type: String, required: true }, // Địa chỉ
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: ['Đang học', 'Đã tốt nghiệp', 'Đã thôi học', 'Tạm dừng học'], // Tình trạng sinh viên hợp lệ
    },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

module.exports = mongoose.model('Student', studentSchema);
