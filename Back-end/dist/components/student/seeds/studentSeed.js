"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Student_1 = __importStar(require("../models/Student"));
const Faculty_1 = __importDefault(require("../../faculty/models/Faculty"));
const program_1 = __importDefault(require("../../program/models/program"));
const dotenv_1 = __importDefault(require("dotenv"));
const faker_1 = require("@faker-js/faker");
dotenv_1.default.config();
const generateRandomAddress = () => {
    return {
        streetAddress: faker_1.faker.location.streetAddress(),
        ward: faker_1.faker.location.street(),
        district: faker_1.faker.location.county(),
        city: faker_1.faker.location.city(),
        country: 'Việt Nam'
    };
};
const generateRandomIdentityDocument = () => {
    const documentTypes = [
        Student_1.IdentityDocumentType.CMND,
        Student_1.IdentityDocumentType.CCCD,
        Student_1.IdentityDocumentType.PASSPORT
    ];
    const type = faker_1.faker.helpers.arrayElement(documentTypes);
    const issueDate = faker_1.faker.date.past({ years: 5 });
    const expiryDate = faker_1.faker.date.future({ years: 10, refDate: issueDate });
    const baseDocument = {
        type,
        number: faker_1.faker.string.numeric(12),
        issueDate,
        issuePlace: faker_1.faker.location.city(),
        expiryDate
    };
    switch (type) {
        case Student_1.IdentityDocumentType.CCCD:
            return Object.assign(Object.assign({}, baseDocument), { hasChip: faker_1.faker.datatype.boolean() });
        case Student_1.IdentityDocumentType.PASSPORT:
            return Object.assign(Object.assign({}, baseDocument), { issuingCountry: 'Việt Nam', notes: faker_1.faker.helpers.maybe(() => faker_1.faker.lorem.sentence(), { probability: 0.3 }) });
        default:
            return baseDocument;
    }
};
const seedStudents = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Kết nối MongoDB
        yield mongoose_1.default.connect(process.env.MONGODB_URI || '');
        console.log('🔗 Connected to MongoDB');
        // Lấy danh sách các khoa
        const faculties = yield Faculty_1.default.find({});
        if (faculties.length === 0) {
            throw new Error('No faculties found. Please initialize faculties first.');
        }
        // Lấy danh sách chương trình
        const programs = yield program_1.default.find({});
        if (programs.length === 0) {
            throw new Error('No programs found. Please initialize programs first.');
        }
        // Xóa dữ liệu cũ
        yield Student_1.default.deleteMany({});
        console.log('🗑️ Deleted old students data');
        // Tạo sinh viên
        const students = [];
        const totalStudents = 100;
        for (let i = 0; i < totalStudents; i++) {
            // Chọn ngẫu nhiên một khoa
            const faculty = faker_1.faker.helpers.arrayElement(faculties);
            const program = faker_1.faker.helpers.arrayElement(programs);
            const permanentAddress = generateRandomAddress();
            const temporaryAddress = faker_1.faker.helpers.maybe(() => generateRandomAddress(), { probability: 0.7 });
            const mailingAddress = faker_1.faker.helpers.maybe(() => generateRandomAddress(), { probability: 0.3 }) || permanentAddress;
            students.push({
                studentId: `SV${String(i + 1).padStart(4, '0')}`,
                fullName: faker_1.faker.person.fullName(),
                dateOfBirth: faker_1.faker.date.birthdate({ min: 18, max: 25, mode: 'age' }),
                gender: faker_1.faker.helpers.arrayElement(Object.values(Student_1.Gender)),
                nationality: faker_1.faker.helpers.maybe(() => faker_1.faker.location.country(), { probability: 0.1 }) || 'Việt Nam',
                faculty: faculty._id, // Sử dụng ID của khoa
                course: faker_1.faker.string.numeric(4),
                program: program._id,
                // Địa chỉ
                permanentAddress,
                temporaryAddress,
                mailingAddress,
                // Giấy tờ tùy thân
                identityDocument: generateRandomIdentityDocument(),
                email: faker_1.faker.internet.email(),
                phone: `0${faker_1.faker.string.numeric(9)}`,
                status: faker_1.faker.helpers.arrayElement(Object.values(Student_1.StudentStatus)),
            });
        }
        // Thêm sinh viên vào cơ sở dữ liệu
        yield Student_1.default.insertMany(students);
        console.log(`✅ Seeded ${totalStudents} students successfully`);
        // Đóng kết nối
        yield mongoose_1.default.connection.close();
        console.log('🔌 Disconnected from MongoDB');
    }
    catch (error) {
        console.error('❌ Error seeding students:', error);
        // Đảm bảo đóng kết nối nếu có lỗi
        if (mongoose_1.default.connection.readyState !== 0) {
            yield mongoose_1.default.connection.close();
        }
        // Thoát với mã lỗi
        process.exit(1);
    }
});
// Chạy hàm seed
seedStudents();
//# sourceMappingURL=studentSeed.js.map