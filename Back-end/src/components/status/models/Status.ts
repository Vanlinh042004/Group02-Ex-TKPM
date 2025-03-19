import mongoose, { Document, Schema } from 'mongoose';

export interface IStatus extends Document {
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const statusSchema = new Schema<IStatus>(
  {
    name: { 
      type: String, 
      required: true, 
      unique: true,
      trim: true 
    },
    description: { 
      type: String,
      trim: true
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IStatus>('Status', statusSchema);