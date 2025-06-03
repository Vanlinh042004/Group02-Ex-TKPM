import mongoose from "mongoose";
import dotenv from "dotenv";
import PhoneNumberConfig from "../models/PhoneNumberConfig";
dotenv.config();

const phoneNumberConfigs = [
  {
    country: "Việt Nam",
    countryCode: "+84",
    regex: "^(0[35789]\d{8})$|^(\+84[35789]\d{8})$",
  },
  {
    country: "Mỹ",
    countryCode: "+1",
    regex: "^(\+1\d{10})$|^(1\d{10})$",
  },
  {
    country: "Anh",
    countryCode: "+44",
    regex: "^(\+44\d{10})$|^(0\d{10})$",
  },
  {
    country: "Pháp",
    countryCode: "+33",
    regex: "^(\+33[67]\d{8})$|^(0[67]\d{8})$",
  },
  {
    country: "Nhật Bản",
    countryCode: "+81",
    regex: "^(\+81\d{9})$|^(0\d{9})$",
  },
  {
    country: "Hàn Quốc",
    countryCode: "+82",
    regex: "^(\+82[1]\d{9})$|^(0[1]\d{9})$",
  },
  {
    country: "Ấn Độ",
    countryCode: "+91",
    regex: "^(\+91[789]\d{9})$|^(0[789]\d{9})$",
  },
  {
    country: "Úc",
    countryCode: "+61",
    regex: "^(\+61[45]\d{8})$|^(0[45]\d{8})$",
  },
  {
    country: "Canada",
    countryCode: "+1",
    regex: "^(\+1\d{10})$|^(1\d{10})$",
  },
  {
    country: "Đức",
    countryCode: "+49",
    regex: "^(\+49\d{10,11})$|^(0\d{10,11})$",
  },
];

const seedPhoneNumberConfigs = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "");
    console.log("🔗 Connected to MongoDB");

    await PhoneNumberConfig.deleteMany();
    // console.log('🗑 Old data cleared');

    await PhoneNumberConfig.insertMany(phoneNumberConfigs);
    console.log("Default phone number configs seeded successfully.");
  } catch (error) {
    console.error("Error seeding phone number configs:", error);
    mongoose.disconnect();
  }
};

export default seedPhoneNumberConfigs;
