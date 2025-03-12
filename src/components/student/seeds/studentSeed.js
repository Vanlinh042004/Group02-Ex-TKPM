const mongoose = require('mongoose');
const Student = require('../models/Student'); // Đường dẫn đến model
const dotenv = require('dotenv');
const { faker } = require('@faker-js/faker');

dotenv.config(); // Load biến môi trường từ .env

const START_STUDENT_ID = 10000000; // Bắt đầu từ MSSV 10000000

const generateRandomStudent = (index) => {
    return {
        studentId: (START_STUDENT_ID + index).toString(), // Mã số sinh viên tăng dần
        fullName: faker.person.fullName(), // Tên đầy đủ ngẫu nhiên
        dateOfBirth: faker.date.birthdate({ min: 18, max: 25, mode: 'age' }).toISOString().split('T')[0], // Chỉ giữ YYYY-MM-DD
        gender: faker.helpers.arrayElement(['Nam', 'Nữ']), // Giới tính
        faculty: faker.helpers.arrayElement([
            'Khoa Luật',
            'Khoa Tiếng Anh thương mại',
            'Khoa Tiếng Nhật',
            'Khoa Tiếng Pháp',
        ]), // Khoa
        course: faker.string.numeric(4), // Khóa học (VD: "2025")
        program: faker.helpers.arrayElement(['Cử nhân', 'Thạc sĩ', 'Tiến sĩ']), // Chương trình học
        address: faker.location.streetAddress({ useFullAddress: true }), // Địa chỉ ngẫu nhiên
        email: faker.internet.email(), // Email giả lập
        phone: faker.phone.number('0#########'), // Số điện thoại VN giả lập
        status: faker.helpers.arrayElement([
            'Đang học',
            'Đã tốt nghiệp',
            'Đã thôi học',
            'Tạm dừng học',
        ]), // Trạng thái sinh viên
    };
};

const seedStudents = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('🔗 Connected to MongoDB');

        await Student.deleteMany(); // Xóa dữ liệu cũ (có thể bỏ nếu muốn giữ dữ liệu)
        console.log('🗑️ Deleted old students data');

        // Tạo 100 sinh viên với MSSV tăng dần từ 10000000
        const students = Array.from({ length: 100 }, (_, index) =>
            generateRandomStudent(index)
        );

        await Student.insertMany(students);
        console.log('✅ Seeded 100 students successfully');

        mongoose.connection.close();
        console.log('🔌 Disconnected from MongoDB');
    } catch (error) {
        console.error('❌ Error seeding students:', error);
        mongoose.connection.close();
    }
};

// Chạy hàm seed
seedStudents();
