import mongoose, { Document, Schema } from 'mongoose';
import emailDomainService from '../../email-domain/services/emailDomainService';

export enum Gender {
  MALE = 'Nam',
  FEMALE = 'Nữ'
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
  faculty: mongoose.Types.ObjectId; // Reference to Faculty
  course: string;
  program: mongoose.Types.ObjectId; // Reference to Program
  
  // Địa chỉ
  permanentAddress?: IAddress; // Địa chỉ thường trú (nếu có)
  temporaryAddress?: IAddress; // Địa chỉ tạm trú (nếu có)
  mailingAddress: IAddress; // Địa chỉ nhận thư
  
  // Giấy tờ tùy thân
  identityDocument: IdentityDocument;
  
  email: string;
  phone: string;
  status: mongoose.Types.ObjectId; // Reference to student Status
  createdAt: Date;
  updatedAt: Date;
}

// Schema cho Address
const addressSchema = new Schema<IAddress>({
  streetAddress: { type: String },
  ward: { type: String },
  district: { type: String },
  city: { type: String },
  country: { type: String}
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
const studentSchema = new Schema<IStudent>(
  {
    studentId: { 
      type: String, 
      required: true, 
      unique: true 
    },
    fullName: { 
      type: String, 
      required: true 
    },
    dateOfBirth: { 
      type: Date, 
      required: true 
    },
    gender: { 
      type: String, 
      enum: Object.values(Gender),
      required: true 
    },
    nationality: { 
      type: String, 
      required: true, 
      default: 'Việt Nam' 
    },
    faculty: {
      type: Schema.Types.ObjectId,
      ref: 'Faculty',
      required: true
    },
    course: { 
      type: String, 
      required: true 
    },
    program: { 
      type: Schema.Types.ObjectId, 
      ref: 'Program', 
      required: true
    },
    
    // Địa chỉ
    permanentAddress: addressSchema,
    temporaryAddress: addressSchema,
    mailingAddress: { 
      type: addressSchema, 
     
    },
    
    // Giấy tờ tùy thân
    identityDocument: { 
      type: identityDocumentSchema, 
      required: true 
    },
    
    email: { 
      type: String, 
      required: true, 
      unique: true,
      validate: {
        validator: async function(email: string) {
          return await emailDomainService.isValidEmailDomain(email);
        },
        message: 'Invalid email domain'
      } 
    },
    phone: { 
      type: String, 
      required: true 
    },
    status: {
      type: Schema.Types.ObjectId,
      ref: 'Status',
      required: true
    }
  },
  {
    timestamps: true,
  }
);

// Tạo index cho tìm kiếm nhanh hơn
studentSchema.index({ fullName: 'text', studentId: 1 });

// Tạo discriminator cho các loại giấy tờ tùy thân
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

export default mongoose.model<IStudent>('Student', studentSchema);