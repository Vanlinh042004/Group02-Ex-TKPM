import mongoose, { Schema, Document } from 'mongoose';

export type RegistrationStatus = 'active' | 'cancelled';

export interface IRegistration extends Document {
  student: Schema.Types.ObjectId;
  class: Schema.Types.ObjectId;
  registrationDate: Date;
  grade?: number;
  status: RegistrationStatus;
  cancellationDate?: Date;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RegistrationSchema: Schema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    class: {
      type: Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    registrationDate: {
      type: Date,
      default: Date.now,
    },
    grade: {
      type: Number,
      min: 0,
      max: 10,
    },
    status: {
      type: String,
      enum: ['active', 'cancelled'],
      default: 'active',
    },
    cancellationDate: {
      type: Date,
    },
    cancellationReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Đảm bảo mỗi sinh viên chỉ đăng ký mỗi lớp một lần
RegistrationSchema.index({ student: 1, class: 1 }, { unique: true });
RegistrationSchema.index({ student: 1, status: 1 });

export default mongoose.model<IRegistration>(
  'Registration',
  RegistrationSchema
);
