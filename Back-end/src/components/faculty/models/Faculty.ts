import mongoose, { Document, Schema } from "mongoose";

export interface IFaculty extends Document {
  facultyId: string;
  name: {
    [key: string]: string; // key is language code (e.g., 'en', 'vi')
  };
  createdAt: Date;
  updatedAt: Date;
}

const facultySchema = new Schema<IFaculty>(
  {
    facultyId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: Map,
      of: String,
      required: true,
      validate: {
        validator: function(value: Map<string, string>) {
          return value.size > 0; 
        },
        message: 'At least one language name must be provided'
      }
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<IFaculty>("Faculty", facultySchema);
