import mongoose, { Schema, Document } from "mongoose";

export interface IPhoneNumberConfig extends Document {
  country: {
    [key: string]: string; // key is language code (e.g., 'en', 'vi')
  };
  countryCode: {
    [key: string]: string; // key is language code (e.g., 'en', 'vi')
  };
  regex: string;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

const phoneNumberConfigSchema = new Schema<IPhoneNumberConfig>(
  {
    country: {
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
    countryCode: {
      type: Map,
      of: String,
      required: true,
      validate: {
        validator: function(value: Map<string, string>) {
          return value.size > 0;
        },
        message: 'At least one language code must be provided'
      }
    },
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
