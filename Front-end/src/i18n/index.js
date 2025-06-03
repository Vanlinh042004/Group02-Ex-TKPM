import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enHeader from "./en/header.json";
import viHeader from "./vi/header.json";
import enStudent from "./en/student.json";
import viStudent from "./vi/student.json";
import enFooter from "./en/footer.json";
import viFooter from "./vi/footer.json";
import enCourse from "./en/course.json";
import viCourse from "./vi/course.json";
import enRegistration from "./en/registration.json";
import viRegistration from "./vi/registration.json";
i18n.use(initReactI18next).init({
  resources: {
    en: {
      header: enHeader,
      footer: enFooter,
      student: enStudent,
      course: enCourse,
      registration: enRegistration,
    },
    vi: {
      header: viHeader,
      footer: viFooter,
      student: viStudent,
      course: viCourse,
      registration: viRegistration,
    },
  },
  lng: "vi",
  fallbackLng: "vi",
  ns: ["header", "student", "registration"],
  defaultNS: "header",
  interpolation: { escapeValue: false },
});
