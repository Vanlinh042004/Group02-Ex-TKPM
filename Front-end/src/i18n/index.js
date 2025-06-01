import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enHeader from "./en/header.json";
import viHeader from "./vi/header.json";
import enStudent from "./en/student.json";
import viStudent from "./vi/student.json";
i18n.use(initReactI18next).init({
  resources: {
    en: {
      header: enHeader,
      student: enStudent,
    },
    vi: {
      header: viHeader,
      student: viStudent,
    },
  },
  lng: "vi",
  fallbackLng: "vi",
  ns: ["header", "student"],
  defaultNS: "header",
  interpolation: { escapeValue: false },
});
