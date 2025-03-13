const mongoose = require('mongoose');
const Student = require('../models/Student'); 
const dotenv = require('dotenv');
const { faker } = require('@faker-js/faker');

dotenv.config(); 

const generateRandomStudent = (index) => {
    return {
        studentId: `SV${String(index + 1).padStart(4, '0')}`,
        fullName: faker.person.fullName(), 
        dateOfBirth: faker.date.birthdate({ min: 18, max: 25, mode: 'age' }).toISOString().split('T')[0], 
        gender: faker.helpers.arrayElement(['Nam', 'Nữ']), 
        faculty: faker.helpers.arrayElement([
            'Khoa Luật',
            'Khoa Tiếng Anh thương mại',
            'Khoa Tiếng Nhật',
            'Khoa Tiếng Pháp',
        ]), 
        course: faker.string.numeric(4), 
        program: faker.helpers.arrayElement(['Cử nhân', 'Thạc sĩ', 'Tiến sĩ']), 
        address: faker.location.streetAddress({ useFullAddress: true }), 
        email: faker.internet.email(), 
        phone: `0${faker.string.numeric(9)}`,
        status: faker.helpers.arrayElement([
            'Đang học',
            'Đã tốt nghiệp',
            'Đã thôi học',
            'Tạm dừng học',
        ]), 
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
