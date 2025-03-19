import mongoose, { Document, Schema } from 'mongoose';

// Định nghĩa enum cho các giá trị cố định
export enum Gender {
  MALE = 'Nam',
  FEMALE = 'Nữ'
}

export enum Faculty {
  LAW = 'Khoa Luật',
  BUSINESS_ENGLISH = 'Khoa Tiếng Anh thương mại',
  JAPANESE = 'Khoa Tiếng Nhật',
  FRENCH = 'Khoa Tiếng Pháp'
}

export enum StudentStatus {
  STUDYING = 'Đang học',
  GRADUATED = 'Đã tốt nghiệp',
  DROPPED = 'Đã thôi học',
  PAUSED = 'Tạm dừng học'
}

export enum IdentityDocumentType {
  CMND = 'CMND',
  CCCD = 'CCCD',
  PASSPORT = 'Hộ chiếu'
}

// Interface cho địa chỉ
export interface IAddress {
  streetAddress?: string; // Số nhà, Tên đường
  ward?: string; // Phường/Xã
  district?: string; // Quận/Huyện
  city?: string; // Tỉnh/Thành phố
  country: string; // Quốc gia
}

// Interface cho các loại giấy tờ
export interface IIdentityBase {
  type: IdentityDocumentType;
  number: string;
  issueDate: Date;
  issuePlace: string;
  expiryDate: Date;
}

export interface ICMND extends IIdentityBase {
  type: IdentityDocumentType.CMND;
}

export interface ICCCD extends IIdentityBase {
  type: IdentityDocumentType.CCCD;
  hasChip: boolean;
}

export interface IPassport extends IIdentityBase {
  type: IdentityDocumentType.PASSPORT;
  issuingCountry: string;
  notes?: string;
}

export type IdentityDocument = ICMND | ICCCD | IPassport;

// Định nghĩa interface cho Student document
export interface IStudent extends Document {
  studentId: string;
  fullName: string;
  dateOfBirth: Date;
  gender: Gender;
  nationality: string; // Quốc tịch
  faculty: Faculty;
  course: string;
  program: string;
  
  // Địa chỉ
  permanentAddress?: IAddress; // Địa chỉ thường trú (nếu có)
  temporaryAddress?: IAddress; // Địa chỉ tạm trú (nếu có)
  mailingAddress: IAddress; // Địa chỉ nhận thư
  
  // Giấy tờ tùy thân
  identityDocument: IdentityDocument;
  
  email: string;
  phone: string;
  status: StudentStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Schema cho Address
const addressSchema = new Schema<IAddress>({
  streetAddress: { type: String },
  ward: { type: String },
  district: { type: String },
  city: { type: String },
  country: { type: String, required: true }
});

// Schema cơ bản cho Identity Documents
const identityDocumentSchema = new Schema<IIdentityBase>({
  type: { 
    type: String, 
    enum: Object.values(IdentityDocumentType),
    required: true 
  },
  number: { type: String, required: true },
  issueDate: { type: Date, required: true },
  issuePlace: { type: String, required: true },
  expiryDate: { type: Date, required: true }
}, { 
  discriminatorKey: 'type' 
});

// Schema cho Student
const studentSchema = new Schema<IStudent>({
  studentId: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  gender: { 
    type: String, 
    enum: Object.values(Gender),
    required: true 
  },
  nationality: { type: String, required: true, default: 'Việt Nam' },
  faculty: {
    type: String,
    required: true,
    enum: Object.values(Faculty)
  },
  course: { type: String, required: true },
  program: { type: String, required: true },
  
  // Địa chỉ
  permanentAddress: addressSchema,
  temporaryAddress: addressSchema,
  mailingAddress: { 
    type: addressSchema, 
    required: true 
  },
  
  // Giấy tờ tùy thân
  identityDocument: identityDocumentSchema,
  
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  status: {
    type: String,
    required: true,
    enum: Object.values(StudentStatus)
  }
}, {
  timestamps: true
});

// Tạo và export model Student
const StudentModel = mongoose.model<IStudent>('Student', studentSchema);

// Tạo discriminator cho các loại giấy tờ
// @ts-ignore - Để tránh lỗi TypeScript với discriminator
studentSchema.path('identityDocument').discriminator(
  IdentityDocumentType.CMND, 
  new Schema({})
);

// @ts-ignore
studentSchema.path('identityDocument').discriminator(
  IdentityDocumentType.CCCD, 
  new Schema({
    hasChip: { type: Boolean, required: true }
  })
);

// @ts-ignore
studentSchema.path('identityDocument').discriminator(
  IdentityDocumentType.PASSPORT, 
  new Schema({
    issuingCountry: { type: String, required: true },
    notes: { type: String }
  })
);

export default StudentModel;