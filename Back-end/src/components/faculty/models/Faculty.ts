import mongoose, { Document, Schema } from 'mongoose';

export interface IFaculty extends Document {
  facultyId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const facultySchema = new Schema<IFaculty>(
  {
    facultyId: {
      type: String,
      required: true,
    },
    name: { 
      type: String, 
      required: true, 
      unique: true 
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IFaculty>('Faculty', facultySchema);