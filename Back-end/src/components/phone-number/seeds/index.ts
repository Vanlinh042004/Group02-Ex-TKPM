import mongoose from "mongoose";
import dotenv from "dotenv";
import PhoneNumberConfig from "../models/PhoneNumberConfig";
dotenv.config();

const phoneNumberConfigs = [
  {
    country: {
      vi: "Việt Nam",
      en: "Vietnam"
    },
    countryCode: {
      vi: "84",
      en: "+84"
    },
    regex: "^(0[35789]\\d{8})$|^(\+84[35789]\\d{8})$"
  },
  {
    country: {
      vi: "Mỹ",
      en: "United States"
    },
    countryCode: {
      vi: "1",
      en: "+1"
    },
    regex: "^(\+1\\d{10})$|^(1\\d{10})$"
  },
  {
    country: {
      vi: "Anh",
      en: "United Kingdom"
    },
    countryCode: {
      vi: "44",
      en: "+44"
    },
    regex: "^(\+44\\d{10})$|^(0\\d{10})$"
  },
  {
    country: {
      vi: "Pháp",
      en: "France"
    },
    countryCode: {
      vi: "33",
      en: "+33"
    },
    regex: "^(\+33[67]\\d{8})$|^(0[67]\\d{8})$"
  },
  {
    country: {
      vi: "Nhật Bản",
      en: "Japan"
    },
    countryCode: {
      vi: "81",
      en: "+81"
    },
    regex: "^(\+81\\d{9})$|^(0\\d{9})$"
  },
  {
    country: {
      vi: "Hàn Quốc",
      en: "South Korea"
    },
    countryCode: {
      vi: "82",
      en: "+82"
    },
    regex: "^(\+82[1]\\d{9})$|^(0[1]\\d{9})$"
  },
  {
    country: {
      vi: "Ấn Độ",
      en: "India"
    },
    countryCode: {
      vi: "91",
      en: "+91"
    },
    regex: "^(\+91[789]\\d{9})$|^(0[789]\\d{9})$"
  },
  {
    country: {
      vi: "Úc",
      en: "Australia"
    },
    countryCode: {
      vi: "61",
      en: "+61"
    },
    regex: "^(\+61[45]\\d{8})$|^(0[45]\\d{8})$"
  },
  {
    country: {
      vi: "Canada",
      en: "Canada"
    },
    countryCode: {
      vi: "1",
      en: "+1"
    },
    regex: "^(\+1\\d{10})$|^(1\\d{10})$"
  },
  {
    country: {
      vi: "Đức",
      en: "Germany"
    },
    countryCode: {
      vi: "49",
      en: "+49"
    },
    regex: "^(\+49\\d{10,11})$|^(0\\d{10,11})$"
  }
];

const seedPhoneNumberConfigs = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "");
    console.log("🔗 Connected to MongoDB");

    await PhoneNumberConfig.deleteMany();
    console.log('🗑 Old data cleared');

    await PhoneNumberConfig.insertMany(phoneNumberConfigs);
    console.log("Default phone number configs seeded successfully.");
  } catch (error) {
    console.error("Error seeding phone number configs:", error);
    mongoose.disconnect();
  }
};

export default seedPhoneNumberConfigs;