import mongoose, { Schema, Document } from "mongoose";

export interface ICourse extends Document {
  courseId: string;
  name: {
    [key: string]: string; // key is language code (e.g., 'en', 'vi')
  };
  credits: number;
  faculty: Schema.Types.ObjectId;
  description?: {
    [key: string]: string;
  };
  prerequisites?: Schema.Types.ObjectId[];
  isActive: boolean;
  createdAt: Date;
}

const CourseSchema = new Schema(
  {
    courseId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: Map,
      of: String,
      required: true,
      validate: {
        validator: function (value: Map<string, string>) {
          return value.size > 0;
        },
        message: "At least one language name must be provided",
      },
    },
    credits: {
      type: Number,
      required: true,
      min: 2, // Số tín chỉ tối thiểu là 2
    },
    faculty: {
      type: Schema.Types.ObjectId,
      ref: "Faculty",
      required: true,
    },
    description: {
      type: Map,
      of: String,
      trim: true,
    },
    prerequisites: [
      {
        type: Schema.Types.ObjectId,
        ref: "Course",
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
    timestamps: true, // Tự động tạo và cập nhật createdAt, updatedAt
  }
);

// Tạo indexes để tối ưu hóa các truy vấn phổ biến
CourseSchema.index({ courseId: 1 }); // Truy vấn theo courseId
CourseSchema.index({ name: "text" }); // Tìm kiếm theo tên

export default mongoose.model<ICourse>("Course", CourseSchema);
