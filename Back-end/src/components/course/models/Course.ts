import mongoose, { Schema, Document } from 'mongoose';

export interface ICourse extends Document {
  courseId: string;
  name: string;
  credits: number;
  faculty: Schema.Types.ObjectId;
  description?: string;
  prerequisites?: Schema.Types.ObjectId[];
  isActive: boolean;
  createdAt: Date;
}

const CourseSchema: Schema = new Schema(
  {
    courseId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    credits: {
      type: Number,
      required: true,
      min: 2, // Số tín chỉ tối thiểu là 2
    },
    faculty: {
      type: Schema.Types.ObjectId,
      ref: 'Faculty',
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    prerequisites: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Course',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Tạo index cho tìm kiếm nhanh hơn
CourseSchema.index({ courseId: 1 });
CourseSchema.index({ name: 'text' });

export default mongoose.model<ICourse>('Course', CourseSchema);
