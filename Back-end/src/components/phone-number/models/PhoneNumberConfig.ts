import mongoose, { Schema, Document } from "mongoose";

export interface IPhoneNumberConfig extends Document {
  country: string;
  countryCode: string;
  regex: string;
  createdAt: Date;
  updatedAt: Date;
}

const phoneNumberConfigSchema = new Schema<IPhoneNumberConfig>(
  {
    country: { type: String, required: true },
    countryCode: { type: String, required: true },
    regex: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<IPhoneNumberConfig>(
  "PhoneNumberConfig",
  phoneNumberConfigSchema,
);
