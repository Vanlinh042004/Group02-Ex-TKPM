import Papa from "papaparse";
import { saveAs } from "file-saver";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";

const ExportStudent = () => {
  const { t } = useTranslation("student");

  const exportStudentsToCSV = (students) => {
    if (!students || students.length === 0) {
      Swal.fire({
        icon: "warning",
        title: t("export.noData"),
        text: t("export.noData"),
      });
      return;
    }

    // Select necessary fields
    const formattedData = students.map((student) => ({
      [t("studentId")]: student.studentId,
      [t("fullName")]: student.fullName,
      [t("dateOfBirth")]: new Date(student.dateOfBirth).toLocaleDateString(),
      [t("gender")]: student.gender,
      [t("faculty")]: student.faculty?.name || t("notAvailable"),
      [t("program")]: student.program?.name || t("notAvailable"),
      [t("course")]: student.course,
      [t("email")]: student.email,
      [t("phone")]: student.phone,
      [t("status")]: student.status,
      [t("identity")]: student.identityDocument?.number || t("notAvailable"),
      [t("issuePlace")]:
        student.identityDocument?.issuePlace || t("notAvailable"),
      [t("address")]:
        `${student.permanentAddress?.streetAddress || ""}, ${student.permanentAddress?.district || ""}, ${student.permanentAddress?.city || ""}`,
    }));

    // Convert to CSV
    const csv = Papa.unparse(formattedData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    saveAs(blob, "students.csv");

    Swal.fire({
      icon: "success",
      title: t("export.success"),
      text: t("export.downloadTitle"),
    });
  };

  const exportStudentsToJSON = (students) => {
    if (!students || students.length === 0) {
      Swal.fire({
        icon: "warning",
        title: t("export.noData"),
        text: t("export.noData"),
      });
      return;
    }

    const jsonData = students.map((student) => ({
      studentId: student.studentId,
      fullName: student.fullName,
      dateOfBirth: student.dateOfBirth,
      gender: student.gender,
      faculty: student.faculty?.name || t("notAvailable"),
      program: student.program?.name || t("notAvailable"),
      course: student.course,
      email: student.email,
      phone: student.phone,
      status: student.status,
      identityDocument: {
        number: student.identityDocument?.number || t("notAvailable"),
        issuePlace: student.identityDocument?.issuePlace || t("notAvailable"),
      },
      permanentAddress: {
        fullAddress: `${student.permanentAddress?.streetAddress || ""}, ${student.permanentAddress?.district || ""}, ${student.permanentAddress?.city || ""}`,
      },
    }));

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
      type: "application/json",
    });
    saveAs(blob, "students.json");

    Swal.fire({
      icon: "success",
      title: t("export.success"),
      text: t("export.downloadTitle"),
    });
  };

  return {
    exportStudentsToCSV,
    exportStudentsToJSON,
  };
};

export default ExportStudent;
