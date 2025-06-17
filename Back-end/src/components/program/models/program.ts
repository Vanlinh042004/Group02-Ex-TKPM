import mongoose, { Document, Schema } from "mongoose";

export interface IProgram extends Document {
  programId: string;
  name: {
    [key: string]: string; // key is language code (e.g., 'en', 'vi')
  };
  duration: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProgramSchema = new Schema<IProgram>(
  {
    programId: {
      type: String,
      required: true,
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
      unique: true,
      trim: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IProgram>("Program", ProgramSchema);
