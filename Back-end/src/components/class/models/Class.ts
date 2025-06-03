import mongoose, { Schema, Document } from "mongoose";

export interface IClass extends Document {
  classId: string;
  course: Schema.Types.ObjectId;
  academicYear: string;
  semester: string;
  instructor: string;
  maxStudents: number;
  schedule: string;
  classroom: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClassSchema: Schema = new Schema(
  {
    classId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    academicYear: {
      type: String,
      required: true,
      trim: true,
    },
    semester: {
      type: String,
      required: true,
      trim: true,
    },
    instructor: {
      type: String,
      required: true,
      trim: true,
    },
    maxStudents: {
      type: Number,
      required: true,
      min: 1,
    },
    schedule: {
      type: String,
      required: true,
      trim: true,
    },
    classroom: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

// Tạo index cho tìm kiếm nhanh hơn
ClassSchema.index({ classId: 1 });
ClassSchema.index({ course: 1 });
ClassSchema.index({ academicYear: 1, semester: 1 });

export default mongoose.model<IClass>("Class", ClassSchema);
