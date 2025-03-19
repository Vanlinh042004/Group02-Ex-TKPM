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

// Định nghĩa interface cho Student document
export interface IStudent extends Document {
  studentId: string;
  fullName: string;
  dateOfBirth: Date;
  gender: Gender;
  faculty: Faculty;
  course: string;
  program: string;
  address: string;
  email: string;
  phone: string;
  status: StudentStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Schema cho Student
const studentSchema = new Schema<IStudent>(
  {
    studentId: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    gender: { 
      type: String, 
      enum: Object.values(Gender),
      required: true 
    },
    faculty: {
      type: String,
      required: true,
      enum: Object.values(Faculty)
    },
    course: { type: String, required: true },
    program: { type: String, required: true },
    address: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: Object.values(StudentStatus)
    },
  },
  {
    timestamps: true,
  }
);

// Tạo và export model
export default mongoose.model<IStudent>('Student', studentSchema);