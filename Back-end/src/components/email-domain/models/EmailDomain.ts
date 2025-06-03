import mongoose, { Document, Schema } from "mongoose";

export interface IEmailDomain extends Document {
  domain: string;
}

const emailDomainSchema = new Schema<IEmailDomain>(
  {
    domain: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<IEmailDomain>("EmailDomain", emailDomainSchema);
