import mongoose from 'mongoose';
import Student, { IdentityDocumentType } from '../models/Student';
import dotenv from 'dotenv';
import { faker } from '@faker-js/faker';

dotenv.config();

const generateRandomAddress = () => {
  return {
    streetAddress: faker.location.streetAddress(),
    ward: faker.location.street(),
    district: faker.location.county(),
    city: faker.location.city(),
    country: 'Việt Nam'
  };
};

const generateRandomIdentityDocument = () => {
  const documentTypes = [
    IdentityDocumentType.CMND,
    IdentityDocumentType.CCCD,
    IdentityDocumentType.PASSPORT
  ];
  
  const type = faker.helpers.arrayElement(documentTypes);
  const issueDate = faker.date.past({ years: 5 });
  const expiryDate = faker.date.future({ years: 10, refDate: issueDate });
  
  const baseDocument = {
    type,
    number: faker.string.numeric(12),
    issueDate,
    issuePlace: faker.location.city(),
    expiryDate
  };
  
  switch (type) {
    case IdentityDocumentType.CCCD:
      return {
        ...baseDocument,
        hasChip: faker.datatype.boolean()
      };
    case IdentityDocumentType.PASSPORT:
      return {
        ...baseDocument,
        issuingCountry: 'Việt Nam',
        notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.3 })
      };
    default:
      return baseDocument;
  }
};

const generateRandomStudent = (index: number) => {
  const permanentAddress = generateRandomAddress();
  const temporaryAddress = faker.helpers.maybe(() => generateRandomAddress(), { probability: 0.7 });
  const mailingAddress = faker.helpers.maybe(
    () => generateRandomAddress(),
    { probability: 0.3 }
  ) || permanentAddress; // Nếu không có địa chỉ nhận thư, sử dụng địa chỉ thường trú
  
  return {
    studentId: `SV${String(index + 1).padStart(4, '0')}`,
    fullName: faker.person.fullName(),
    dateOfBirth: faker.date.birthdate({ min: 18, max: 25, mode: 'age' }),
    gender: faker.helpers.arrayElement(['Nam', 'Nữ']),
    nationality: faker.helpers.maybe(() => faker.location.country(), { probability: 0.1 }) || 'Việt Nam',
    faculty: faker.helpers.arrayElement([
      'Khoa Luật',
      'Khoa Tiếng Anh thương mại',
      'Khoa Tiếng Nhật',
      'Khoa Tiếng Pháp',
    ]),
    course: faker.string.numeric(4),
    program: faker.helpers.arrayElement(['Cử nhân', 'Thạc sĩ', 'Tiến sĩ']),
    
    // Địa chỉ
    permanentAddress,
    temporaryAddress,
    mailingAddress,
    
    // Giấy tờ tùy thân
    identityDocument: generateRandomIdentityDocument(),
    
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
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('🔗 Connected to MongoDB');

    await Student.deleteMany({}); // Xóa dữ liệu cũ (có thể bỏ nếu muốn giữ dữ liệu)
    console.log('🗑️ Deleted old students data');

    const students = Array.from({ length: 100 }, (_, index) =>
      generateRandomStudent(index)
    );

    await Student.insertMany(students);
    console.log('✅ Seeded 100 students successfully');

    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error seeding students:', error);
    await mongoose.connection.close();
  }
};

// Chạy hàm seed
seedStudents();