  import mongoose, { Document, Schema } from 'mongoose';

  export interface IProgram extends Document {
    name: string;
    description?: string;
    duration: number; // Thời gian đào tạo (năm)
    faculty: mongoose.Types.ObjectId; // Reference to Faculty
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }

  const ProgramSchema = new Schema<IProgram>(
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
      },
      duration: {
        type: Number,
        required: true
      },
      faculty: {
        type: Schema.Types.ObjectId,
        ref: 'Faculty',
        required: true
      },
      isActive: {
        type: Boolean,
        default: true
      }
    },
    {
      timestamps: true,
    }
  );

  export default mongoose.model<IProgram>('Program', ProgramSchema);