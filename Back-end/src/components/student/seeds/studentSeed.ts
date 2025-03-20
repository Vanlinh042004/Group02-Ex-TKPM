import mongoose from 'mongoose';
import Student, { 
  IdentityDocumentType, 
  Gender, 
  StudentStatus 
} from '../models/Student';
import Faculty from '../../faculty/models/Faculty';
import Program from '../../program/models/program';
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

const seedStudents = async () => {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('🔗 Connected to MongoDB');

    // Lấy danh sách các khoa
    const faculties = await Faculty.find({});
    if (faculties.length === 0) {
      throw new Error('No faculties found. Please initialize faculties first.');
    }

    // Lấy danh sách chương trình
    const programs = await Program.find({});
    if (programs.length === 0) {
      throw new Error('No programs found. Please initialize programs first.');
    }

    // Xóa dữ liệu cũ
    await Student.deleteMany({});
    console.log('🗑️ Deleted old students data');

    // Tạo sinh viên
    const students = [];
    const totalStudents = 100;

    for (let i = 0; i < totalStudents; i++) {
      // Chọn ngẫu nhiên một khoa
      const faculty = faker.helpers.arrayElement(faculties);
      const program = faker.helpers.arrayElement(programs);

      const permanentAddress = generateRandomAddress();
      const temporaryAddress = faker.helpers.maybe(() => generateRandomAddress(), { probability: 0.7 });
      const mailingAddress = faker.helpers.maybe(
        () => generateRandomAddress(),
        { probability: 0.3 }
      ) || permanentAddress;
      
      students.push({
        studentId: `SV${String(i + 1).padStart(4, '0')}`,
        fullName: faker.person.fullName(),
        dateOfBirth: faker.date.birthdate({ min: 18, max: 25, mode: 'age' }),
        gender: faker.helpers.arrayElement(Object.values(Gender)),
        nationality: faker.helpers.maybe(() => faker.location.country(), { probability: 0.1 }) || 'Việt Nam',
        faculty: faculty._id, // Sử dụng ID của khoa
        course: faker.string.numeric(4),
        program: program._id,
        
        // Địa chỉ
        permanentAddress,
        temporaryAddress,
        mailingAddress,
        
        // Giấy tờ tùy thân
        identityDocument: generateRandomIdentityDocument(),
        
        email: faker.internet.email(),
        phone: `0${faker.string.numeric(9)}`,
        status: faker.helpers.arrayElement(Object.values(StudentStatus)),
      });
    }

    // Thêm sinh viên vào cơ sở dữ liệu
    await Student.insertMany(students);
    console.log(`✅ Seeded ${totalStudents} students successfully`);

    // Đóng kết nối
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error seeding students:', error);
    
    // Đảm bảo đóng kết nối nếu có lỗi
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    
    // Thoát với mã lỗi
    process.exit(1);
  }
};

// Chạy hàm seed
seedStudents();