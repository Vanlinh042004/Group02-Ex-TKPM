import mongoose, { Document, Schema } from "mongoose";

export interface IStatus extends Document {
  name: {
    [key: string]: string;
  };
  description?: {
    [key: string]: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const statusSchema = new Schema<IStatus>(
  {
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
    description: {
      type: Map,
      of: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IStatus>("Status", statusSchema);
